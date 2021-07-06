import * as PIXI from 'pixi.js'
import {useDebouncedCallback} from 'use-debounce'
import React, {useEffect, useRef, useState} from 'react'
import useInterval from '../useInterval'

class ParticleGrid {
  areaSize = 10
  cellSize = 1
  length = 10
  data = []
  insert(value, x, y) {
    x = Math.floor(x / this.cellSize)
    y = Math.floor(y / this.cellSize)
    const cell = this.data[y * this.length + x]
    if (cell) cell.push(value)
  }
  retrieve(x, y) {
    const d = this.data
    const l = this.length
    x = Math.floor(x / this.cellSize)
    y = Math.floor(y / this.cellSize)
    // prettier-ignore
    return [].concat(
      x > 0     && y > 0     ? d[(y - 1) * l + (x - 1)] : [],
                   y > 0     ? d[(y - 1) * l + (x)    ] : [],
      x < l - 1 && y > 0     ? d[(y - 1) * l + (x + 1)] : [],
      x > 0                  ? d[(y) * l     + (x - 1)] : [],
      true                   ? d[(y) * l     + (x)    ] : [],
      x < l - 1              ? d[(y) * l     + (x + 1)] : [],
      x > 0     && y < l - 1 ? d[(y + 1) * l + (x - 1)] : [],
                   y < l - 1 ? d[(y + 1) * l + (x)    ] : [],
      x < l - 1 && y < l - 1 ? d[(y + 1) * l + (x + 1)] : [],
    )
  }
  constructor(areaSize, cellSize) {
    this.areaSize = areaSize
    this.cellSize = cellSize
    this.length = Math.ceil(areaSize / cellSize)
    for (let i = 0; i < this.length ** 2; i++) {
      this.data.push([])
    }
  }
}

const vec = {
  $add(a, b) {
    a[0] += b[0]
    a[1] += b[1]
    return a
  },
  add(a, b) {
    return [a[0] + b[0], a[1] + b[1]]
  },
  $sub(a, b) {
    a[0] -= b[0]
    a[1] -= b[1]
    return a
  },
  sub(a, b) {
    return [a[0] - b[0], a[1] - b[1]]
  },
  $mult(a, b) {
    a[0] *= b
    a[1] *= b
    return a
  },
  mult(a, b) {
    return [a[0] * b, a[1] * b]
  },
  dot(a, b) {
    return a[0] * b[0] + a[1] * b[1]
  },
  length(a) {
    return (a[0] ** 2 + a[1] ** 2) ** 0.5
  },
  lengthLessThan(a, b) {
    return a[0] ** 2 + a[1] ** 2 < b ** 2
  },
  $setLength(a, b) {
    return vec.$mult(a, b / vec.length(a))
  },
  setLength(a, b) {
    return vec.mult(a, b / vec.length(a))
  },
}

function collide(p1, p2, particleSpeed, wall = false) {
  const radii = p1.r + p2.r
  const normal = vec.$sub([p1.x, p1.y], [p2.x, p2.y])
  if (!vec.lengthLessThan(normal, radii)) {
    return
  }
  const pushAway = vec.setLength(normal, (radii - vec.length(normal)) / 2)
  const p1p = vec.$add([p1.x, p1.y], pushAway)
  const p2p = vec.$sub([p2.x, p2.y], pushAway)

  const un = vec.$setLength(normal, 1)
  const ut = [-un[1], un[0]]

  let p1v = [p1.vx, p1.vy]
  let p2v = [p2.vx, p2.vy]
  let temp = vec.$add(
    vec.mult(un, vec.dot(un, p2v)),
    vec.mult(ut, vec.dot(ut, p1v))
  )
  // prettier-ignore
  p2v = vec.$add(
    vec.mult(un, vec.dot(un, p1v)),
    vec.mult(ut, vec.dot(ut, p2v))
  )
  if (wall) vec.setLength(temp, vec.length(temp) + vec.length(p2v))
  p1v = temp
  vec.$setLength(p1v, particleSpeed)
  vec.$setLength(p2v, particleSpeed)

  p1.x = p1p[0]
  p1.y = p1p[1]
  p1.vx = p1v[0]
  p1.vy = p1v[1]
  p2.x = p2p[0]
  p2.y = p2p[1]
  p2.vx = p2v[0]
  p2.vy = p2v[1]
}

function wallCollide(p, angle, particleSpeed) {
  const p2 = {
    r: p.r * 0.01,
    x: p.x + Math.cos(angle) * p.r,
    y: p.y + Math.sin(angle) * p.r,
    vx: 0,
    vy: 0,
  }
  return collide(p, p2, particleSpeed, true)
}

const Input = React.forwardRef(
  ({label, note, debounce, onChange, defaultValue}, ref) => {
    const handleOnChange = useDebouncedCallback(onChange, debounce)
    return (
      <label style={{display: 'block'}}>
        <span style={{fontSize: 48}}>{label}</span>
        {!!note && <br />}
        {!!note && <span style={{fontSize: 36}}>{note}</span>}
        <br />
        <input
          ref={ref}
          style={{fontSize: 48, width: 300}}
          defaultValue={defaultValue}
          onChange={(e) => handleOnChange(e.target.value)}
        ></input>
      </label>
    )
  }
)

const getSuggestedSize = (particleCount) => {
  const windowSize = Math.min(window.innerWidth, window.innerHeight) - 50
  const percentFilled = 0.7
  return (
    windowSize *
    (particleCount * percentFilled) ** 0.5 *
    particleCount ** -1 *
    0.5
  )
}

const Particles = () => {
  const ref = useRef()
  const [ticker, setTicker] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [suggestedSize, setSuggestedSize] = useState(getSuggestedSize(500))
  const params = useRef({
    particleCount: 500,
    particleSizeMin: suggestedSize * 0.95,
    particleSizeMax: suggestedSize * 1.05,
    particleSpeed: 3,
    spawnRate: 0,
    freeze: false,
  })
  const inputs = useRef({
    particleCount: {},
    particleSizeMin: {},
    particleSizeMax: {},
    particleSpeed: {},
    spawnRate: {},
  })

  useInterval(() => {
    const typing = [
      inputs.current.particleCount,
      inputs.current.particleSizeMin,
      inputs.current.particleSizeMax,
    ].includes(document.activeElement)
    if (!playing || !params.current.spawnRate || typing) return
    const $ = params.current
    const old_sz = getSuggestedSize($.particleCount)
    const minMult = $.particleSizeMin / old_sz
    const maxMult = $.particleSizeMax / old_sz
    $.particleCount = Math.min($.particleCount + $.spawnRate / 10, 20000)
    const sz = getSuggestedSize($.particleCount)
    $.particleSizeMin = sz * minMult
    $.particleSizeMax = sz * maxMult
    inputs.current.particleCount.value = $.particleCount.toFixed(0)
    inputs.current.particleSizeMin.value = $.particleSizeMin.toFixed(2)
    inputs.current.particleSizeMax.value = $.particleSizeMax.toFixed(2)
    if (Date.now() % 1000 < 200) setSuggestedSize(sz)
  }, 100)

  useEffect(() => {
    const app = new PIXI.Application()
    ref.current.appendChild(app.view)

    const resizeWindow = () => {
      const windowSize = Math.min(window.innerWidth, window.innerHeight) - 50
      app.renderer.resize(windowSize, windowSize)
      setSuggestedSize(getSuggestedSize(params.current.particleCount))
    }
    resizeWindow()
    window.addEventListener('resize', resizeWindow)

    let particles = []
    // const quadtree = new Quadtree({
    //   x: 0,
    //   y: 0,
    //   width: app.screen.width,
    //   height: app.screen.height,
    // })

    const spriteContainer = new PIXI.ParticleContainer(20000, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true,
    })
    app.stage.addChild(spriteContainer)

    const addParticle = () => {
      const particle = PIXI.Sprite.from('/arrow_32.png')
      const rotation = Math.random() * Math.PI * 2
      const pr =
        params.current.particleSizeMin +
        Math.random() *
          (params.current.particleSizeMax - params.current.particleSizeMin)
      const pr2 = pr * 2

      particle.anchor.set(0.5)
      particle.height = pr2
      particle.width = pr2
      const distance = Math.random() ** 0.5 * (app.screen.width / 2 - 10)
      const angle = Math.PI * 2 * Math.random()
      particle.x = app.screen.width / 2 + Math.cos(angle) * distance
      particle.y = app.screen.width / 2 + Math.sin(angle) * distance
      particle.rotation = rotation

      particle.r = pr
      particle.vx = Math.cos(rotation) * params.current.particleSpeed
      particle.vy = Math.sin(rotation) * params.current.particleSpeed

      particles.push(particle)
      spriteContainer.addChild(particle)
    }

    for (let i = 0; i < params.current.particleCount; i++) addParticle()

    const ticker = app.ticker.add(() => {
      const $ = params.current
      const count = Math.round($.particleCount)
      if (particles.length > count) {
        const toRemove = particles.length - count
        for (let i = 0; i < toRemove; i++) particles[i].destroy()
        particles = particles.slice(toRemove)
      }
      if (particles.length < count) {
        const toAdd = count - particles.length
        for (let i = 0; i < toAdd; i++) addParticle()
      }
      if (particles.length) {
        let min = particles[0].r
        let max = particles[0].r
        for (let i = 0; i < particles.length; i++) {
          if (particles[i].r > max) max = particles[i].r
          if (particles[i].r < min) min = particles[i].r
        }
        const range = Math.max(max - min, 0.01)
        const desiredMin = $.particleSizeMin
        const desiredRange = Math.max(
          $.particleSizeMax - $.particleSizeMin,
          0.01
        )
        if (min !== desiredMin || range !== desiredRange) {
          for (let i = 0; i < particles.length; i++) {
            const r =
              (particles[i].r - min) * (desiredRange / range) + desiredMin
            particles[i].r = r
            particles[i].width = r * 2
            particles[i].height = r * 2
          }
        }
      }

      if ($.freeze) return

      // quadtree.clear()
      const particleGrid = new ParticleGrid(
        app.screen.width,
        params.current.particleSizeMax * 2
      )
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        const cx = app.screen.width / 2
        const cy = app.screen.height / 2
        const distanceFromCenter = ((p.x - cx) ** 2 + (p.y - cy) ** 2) ** 0.5
        const maxDistance = app.screen.width / 2 - p.r - 10
        if (distanceFromCenter > maxDistance) {
          p.x = ((p.x - cx) * maxDistance) / distanceFromCenter + cx
          p.y = ((p.y - cy) * maxDistance) / distanceFromCenter + cy
          wallCollide(p, Math.atan2(p.y - cy, p.x - cx), $.particleSpeed)
        }
        p.rotation = Math.atan2(p.vy, p.vx)

        // quadtree.insert(p)
        particleGrid.insert(p, p.x, p.y)
      }
      for (let i = 0; i < particles.length; i++) {
        let particle = particles[i]

        // let candidates = quadtree.retrieve({
        //   x: particle.x - particle.r,
        //   y: particle.y - particle.r,
        //   width: particle.r * 2,
        //   height: particle.r * 2,
        // })
        const candidates = particleGrid.retrieve(particle.x, particle.y)

        for (let k = 0; k < candidates.length; k++) {
          let candidate = candidates[k]
          if (particle === candidate) continue
          collide(particle, candidate, Math.max($.particleSpeed, 0.1))
        }
      }
    })
    ticker.stop()
    params.current.freeze = true
    ticker.update()
    params.current.freeze = false
    setTimeout(() => {
      params.current.freeze = true
      ticker.update()
      params.current.freeze = false
    }, 64)

    setTicker(ticker)

    return () => {
      ticker.stop()
      app.destroy(true)
      window.removeEventListener('resize', resizeWindow)
    }
  }, [])

  return (
    <div style={{display: 'flex'}}>
      <div ref={ref} style={{padding: 10, marginLeft: -10}}></div>
      <div>
        <button
          onClick={() => {
            playing ? ticker.stop() : ticker.start()
            setPlaying(!playing)
          }}
          style={{
            fontSize: '2rem',
            background: 'none',
            border: 'none',
            outline: 'none',
            verticalAlign: 'top',
          }}
        >
          {playing ? '⏸' : '▶️'}
        </button>
        <button
          onClick={() => {
            ticker.update()
          }}
          style={{
            fontSize: '2rem',
          }}
        >
          Step
        </button>
        <button
          onClick={() => {
            const p = params.current.particleCount
            params.current.particleCount = 0
            ticker.update()
            params.current.particleCount = p
            ticker.update()
          }}
          style={{
            fontSize: '2rem',
            marginLeft: 10,
          }}
        >
          Reset
        </button>
        <br />
        <Input
          label="Particle Count"
          debounce={500}
          defaultValue={params.current.particleCount}
          onChange={(value) => {
            params.current.particleCount = parseInt(value) || 0
            setSuggestedSize(getSuggestedSize(params.current.particleCount))
            params.current.freeze = true
            ticker.update()
            params.current.freeze = false
          }}
          ref={(input) => (inputs.current.particleCount = input)}
        />
        <Input
          label="Particle Size (min)"
          note={'Suggested = ' + (suggestedSize * 0.95).toFixed(2)}
          debounce={500}
          defaultValue={params.current.particleSizeMin.toFixed(2)}
          onChange={(value) => {
            params.current.particleSizeMin = parseFloat(value) || 0
            params.current.freeze = true
            ticker.update()
            params.current.freeze = false
          }}
          ref={(input) => (inputs.current.particleSizeMin = input)}
        />
        <Input
          label="Particle Size (max)"
          note={'Suggested = ' + (suggestedSize * 1.05).toFixed(2)}
          debounce={500}
          defaultValue={params.current.particleSizeMax.toFixed(2)}
          onChange={(value) => {
            params.current.particleSizeMax = parseFloat(value) || 0
            params.current.freeze = true
            ticker.update()
            params.current.freeze = false
          }}
          ref={(input) => (inputs.current.particleSizeMax = input)}
        />
        <Input
          label="Particle Speed"
          debounce={500}
          defaultValue={params.current.particleSpeed}
          onChange={(value) => {
            params.current.particleSpeed = parseFloat(value) || 0
            ticker.update()
          }}
        />
        <Input
          label="Spawn Rate"
          debounce={500}
          defaultValue={params.current.spawnRate}
          onChange={(value) => {
            params.current.spawnRate = parseFloat(value) || 0
          }}
        />
      </div>
    </div>
  )
}

export default Particles
