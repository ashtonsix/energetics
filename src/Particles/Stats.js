import React from 'react'

const clamp = (value, min, max) => {
  return Math.min(Math.max(+value || 0, min), max)
}

class Stats extends React.Component {
  sim = null
  rollingMeanWindow = 1
  updatedAt = 0
  statsPlaying = true
  playButton = null
  playButtonText = null
  stepCount = null
  stepsPerSecond = null
  areaFilledPercent = null
  collisionCount = null
  d2bHistogram = []
  o2bHistogram = []
  o2pHistogram = []
  constructor(props) {
    super(props)
    this.sim = props.sim
    this.rollingMeanWindow = this.sim.stats.dataRetention
  }
  componentDidMount() {
    this.initialise()
    this.sim.updateHook.UserControlsStats = ({
      playing: simPlaying,
      trigger,
    }) => {
      this.playButton.style.display = simPlaying ? 'inline' : 'none'
      if (this.statsPlaying) {
        this.update()
      }
      this.updateButton.style.display =
        !simPlaying && this.updatedAt !== this.sim.stats.step
          ? 'inline'
          : 'none'
    }
  }
  componentWillUnmount() {
    delete this.sim.updateHook.UserControlsStats
  }
  shouldComponentUpdate() {
    return false
  }
  render() {
    return <div ref={(rootEl) => (this.rootEl = rootEl)} />
  }
  initialise() {
    this.rootEl.innerHTML = `
      <div style="max-width: 340px">
        <span style="font-size: 27px">Stats</span>
        <button
          class="playButton"
          style="display: none; font-size: 1.5rem; background: none; border: none; outline: none; vertical-align: middle; line-height: 1.5; position: absolute;"
        >${this.statsPlaying ? '⏸' : '▶️'}</button>
        <button
          class="updateButton"
          style="display: none;"
        >Update</button>
        <div>Step:
          <canvas
            width="60px"
            height="18px"
            class="stepCount"
            style="vertical-align: bottom;"
          ></canvas>
        </div>
        <div>Steps per second (physics only):
          <canvas
            width="60px"
            height="18px"
            class="stepsPerSecond"
            style="vertical-align: bottom;"
          ></canvas>
        </div>
        <div>Rolling mean window:
          <input
            value=${this.rollingMeanWindow.toFixed(0)}
            class="rollingMeanWindow"
            style="width: 40px;"
          ></input>
        </div>
        <div>Histogram buckets:
          <input
            value=${this.sim.stats.histogramBuckets.toFixed(0)}
            class="histogramBuckets"
            style="width: 40px;"
          ></input>
        </div>
        <div>Area filled by particles:
          <canvas
            width="60px"
            height="18px"
            class="areaFilledPercent"
            style="vertical-align: bottom;"
          ></canvas>
        </div>
        <div>Collisions during last step:
          <canvas
            width="60px"
            height="18px"
            class="collisionCount"
            style="vertical-align: bottom;"
          ></canvas>
        </div>
        <div>Distance of particles from boundary:</div>
        <br />
        <canvas
          class="d2bHistogram"
          style="display: block; width: 300px; height: 80px; image-rendering: pixelated;"
          width="${this.sim.stats.histogramBuckets}px"
          height="100px"
        ></canvas>
        <div>Orientation of particles relative to boundary:</div>
        <br />
        <canvas
          class="o2bHistogram"
          style="display: block; width: 300px; height: 80px; image-rendering: pixelated;"
          width="${this.sim.stats.histogramBuckets}px"
          height="100px"
        ></canvas>
        <div>Relative orientation of colliding particles:</div>
        <br />
        <canvas
          class="o2pHistogram"
          style="display: block; width: 300px; height: 80px; image-rendering: pixelated;"
          width="${this.sim.stats.histogramBuckets}px"
          height="100px"
        ></canvas>
      </div>
    `

    let el = this.rootEl
    let rollingMeanWindow = el.querySelector('.rollingMeanWindow')
    rollingMeanWindow.addEventListener('input', () => {
      let value = +clamp(rollingMeanWindow.value, 1, 100).toFixed(0)
      this.rollingMeanWindow = value
      this.update()
    })
    rollingMeanWindow.addEventListener('blur', () => {
      rollingMeanWindow.value = this.rollingMeanWindow.toFixed(0)
    })
    let histogramBuckets = el.querySelector('.histogramBuckets')
    histogramBuckets.addEventListener('input', () => {
      let value = +clamp(histogramBuckets.value, 10, 300).toFixed(0)
      this.sim.stats.histogramBuckets = value

      el.querySelector('.d2bHistogram').setAttribute('width', value + 'px')
      el.querySelector('.o2bHistogram').setAttribute('width', value + 'px')
      el.querySelector('.o2pHistogram').setAttribute('width', value + 'px')
      this.d2bHistogram = el.querySelector('.d2bHistogram').getContext('2d')
      this.o2bHistogram = el.querySelector('.o2bHistogram').getContext('2d')
      this.o2pHistogram = el.querySelector('.o2pHistogram').getContext('2d')
      this.d2bHistogram.fillStyle = 'gray'
      this.o2bHistogram.fillStyle = 'gray'
      this.o2pHistogram.fillStyle = 'gray'
      this.update()
    })
    histogramBuckets.addEventListener('blur', () => {
      histogramBuckets.value = this.sim.stats.histogramBuckets.toFixed(0)
    })

    this.playButton = el.querySelector('.playButton')
    this.playButtonText = this.playButton.childNodes[0]
    this.playButton.addEventListener('click', () => {
      this.statsPlaying = !this.statsPlaying
      this.playButtonText.nodeValue = this.statsPlaying ? '⏸' : '▶️'
    })

    this.updateButton = el.querySelector('.updateButton')
    this.updateButton.addEventListener('click', () => {
      this.updateButton.style.display = 'none'
      this.update()
    })

    this.stepCount = el.querySelector('.stepCount').getContext('2d')
    this.stepsPerSecond = el.querySelector('.stepsPerSecond').getContext('2d')
    // prettier-ignore
    this.areaFilledPercent = el.querySelector('.areaFilledPercent').getContext('2d')
    this.collisionCount = el.querySelector('.collisionCount').getContext('2d')
    this.stepCount.font = '16px sans-serif'
    this.stepsPerSecond.font = '16px sans-serif'
    this.areaFilledPercent.font = '16px sans-serif'
    this.collisionCount.font = '16px sans-serif'
    this.d2bHistogram = el.querySelector('.d2bHistogram').getContext('2d')
    this.o2bHistogram = el.querySelector('.o2bHistogram').getContext('2d')
    this.o2pHistogram = el.querySelector('.o2pHistogram').getContext('2d')
    this.d2bHistogram.fillStyle = 'gray'
    this.o2bHistogram.fillStyle = 'gray'
    this.o2pHistogram.fillStyle = 'gray'
    this.update()
  }
  update() {
    let data = this.sim.stats.data.slice(-this.rollingMeanWindow)
    let empty = new Array(this.sim.stats.histogramBuckets).fill(0)
    let stepDuration = 0
    let particleCollisionCount = 0
    let boundaryCollisionCount = 0
    let distanceToBoundary = empty.slice()
    let orientationToBoundary = empty.slice()
    let orientationOfCollidingParticles = empty.slice()
    // prettier-ignore
    for (let i = 0; i < data.length; i++) {
        stepDuration += data[i].duration / data.length
        particleCollisionCount += data[i].particleCollisionCount / data.length
        boundaryCollisionCount += data[i].boundaryCollisionCount / data.length
        for (let j = 0; j < empty.length; j++) {
          distanceToBoundary[j] += data[i].distanceToBoundary[j] || 0
          orientationToBoundary[j] += data[i].orientationToBoundary[j] || 0
          orientationOfCollidingParticles[j] += data[i].orientationOfCollidingParticles[j] || 0
        }
      }

    // prettier-ignore
    const collisions = +(particleCollisionCount + boundaryCollisionCount).toFixed(0)
    let d2bMax = Math.max(...distanceToBoundary) || 1
    let o2bMax = Math.max(...orientationToBoundary) || 1
    let o2pMax = Math.max(...orientationOfCollidingParticles) || 1
    let areaFilled =
      (this.sim.particles.reduce((pv, p) => pv + p.radius ** 2 * Math.PI, 0) /
        this.sim.boundaryCollisionDetector?.areaInside || 0) * 100
    let stepsPerSecond = stepDuration ? 1000 / stepDuration : 0

    this.updatedAt = this.sim.stats.step
    this.stepCount.clearRect(0, 0, 100, 100)
    this.stepsPerSecond.clearRect(0, 0, 100, 100)
    this.areaFilledPercent.clearRect(0, 0, 100, 100)
    this.collisionCount.clearRect(0, 0, 100, 100)
    this.stepCount.fillText(this.sim.stats.step.toLocaleString(), 0, 16)
    this.stepsPerSecond.fillText(stepsPerSecond.toFixed(0), 0, 16)
    this.areaFilledPercent.fillText(areaFilled.toFixed(0) + '%', 0, 16)
    this.collisionCount.fillText(collisions, 0, 16)

    this.d2bHistogram.clearRect(0, 0, this.sim.stats.histogramBuckets, 100)
    this.o2bHistogram.clearRect(0, 0, this.sim.stats.histogramBuckets, 100)
    this.o2pHistogram.clearRect(0, 0, this.sim.stats.histogramBuckets, 100)

    distanceToBoundary.forEach((height, i) => {
      let h = ((height * 95) / d2bMax || 0) + 5
      this.d2bHistogram.fillRect(i, 100 - h, 1, h)
    })
    orientationToBoundary.forEach((height, i) => {
      let h = ((height * 95) / o2bMax || 0) + 5
      this.o2bHistogram.fillRect(i, 100 - h, 1, h)
    })
    orientationOfCollidingParticles.forEach((height, i) => {
      let h = ((height * 95) / o2pMax || 0) + 5
      this.o2pHistogram.fillRect(i, 100 - h, 1, h)
    })
  }
}

export default Stats
