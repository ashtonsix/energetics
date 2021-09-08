import * as PIXI from 'pixi.js'
import React, {useEffect, useRef, useState} from 'react'
import {useDebouncedCallback} from 'use-debounce'
import Simulation from './Simulation'
import ArenaViz from './ArenaViz'
import UserControls from './UserControls'
import TrailFilter from './TrailFilter'
import ExplainerIntro from './Explainer/ExplainerIntro'
import AnalysisDisplayTable from './analysis/AnalysisDisplayTable'
import {
  statsBreakdown,
  statsBreakdownMini,
  analyseCollisions,
} from './analysis/analysis'
import csv from './csv'
export {default as ParticlesExplainer} from './Explainer/Explainer'
export {default as ParticlesExplainerMechanicsDetailed} from './Explainer/ExplainerMechanicsDetailed'

// slow mode is for recording videos
const createTicker = (tick) => {
  let async = false
  let timeout
  let playing = false
  const f = () => {
    if (!playing) return
    let p = tick()
    if (async) {
      timeout = setTimeout(async () => {
        await p
        f()
      }, 1000 / 60)
    } else {
      requestAnimationFrame(f)
    }
  }
  const ticker = {
    start() {
      if (!playing) {
        playing = true
        f()
      }
    },
    stop() {
      clearTimeout(timeout)
      playing = false
    },
    setAsync(a) {
      async = a
    },
  }
  return ticker
}

const Particles = () => {
  const ref = useRef()
  const [sim] = useState(() => {
    // React calls this function twice when the component mounts, which
    // slows down page loading, so we're doing a weird cache-thing here
    if (window.sim) return window.sim
    const sim = new Simulation()
    window.sim = sim
    return sim
  })
  useEffect(() => {
    return () => delete window.sim
  }, [])
  const [visualisation, setVisualisation] = useState({name: 'particles'})
  const [nonce, setNonce] = useState(0)
  const [analyses, setAnalyses] = useState([])
  const state = useRef({
    playing: false,
    app: null,
    ticker: null,
    trailFilter: null,
  })
  const updateBoundaryCollisionDetector = useDebouncedCallback(() => {
    sim.updateBoundaryCollisionDetector()
    setNonce(Math.random())
    sim.connector.clearDrawing()
    sim.cycle({playing: false})
  }, 500)
  const makeSureVisualisationIsNotObscured = (vis) => {
    let view = state.current.app?.view
    let playing = state.current.playing
    let shouldShowParticles = playing || vis.name === 'particles'
    if (view) {
      view.style.opacity = shouldShowParticles ? 1 : 0
    }
  }

  useEffect(() => {
    const app = new PIXI.Application({
      backgroundAlpha: 0,
      preserveDrawingBuffer: true,
    })
    state.current.app = app
    ref.current.appendChild(app.view)
    const options = {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true,
    }
    PIXI.Ticker.shared.autoStart = false
    PIXI.Ticker.shared.stop()

    const spriteContainer = new PIXI.ParticleContainer(20000, options)
    const spriteContainerRed = new PIXI.ParticleContainer(20000, options)

    const trailFilter = new TrailFilter()
    trailFilter.isActive = () => state.current.playing
    state.current.trailFilter = trailFilter
    const trailContainer = new PIXI.ParticleContainer(20000, options)
    const trailContainerRed = new PIXI.ParticleContainer(20000, options)
    const trailContainerParent = new PIXI.Container()
    trailContainerParent.addChild(trailContainer)
    trailContainerParent.addChild(trailContainerRed)
    trailContainerParent.filters = [trailFilter]
    trailContainerParent.filterArea = new PIXI.Rectangle(0, 0, 5000, 5000)

    app.stage.addChild(trailContainerParent)
    app.stage.addChild(spriteContainer)
    app.stage.addChild(spriteContainerRed)
    sim.connector.onParticleAdded = (particle) => {
      const sprite = PIXI.Sprite.from(
        particle.tracer ? '/arrow_red_32.png' : '/arrow_32.png'
      )
      sprite.anchor.set(0.5)
      const scale = app.screen.width
      sprite.x = particle.position[0] * scale
      sprite.y = particle.position[1] * scale
      sprite.width = particle.radius * 2 * scale
      sprite.height = particle.radius * 2 * scale
      sprite.rotation = Math.atan2(particle.velocity[1], particle.velocity[0])
      ;(particle.tracer ? spriteContainerRed : spriteContainer).addChild(sprite)

      const trail = PIXI.Sprite.from(
        particle.tracer ? '/trail_red.png' : '/trail.png'
      )
      trail.anchor.set(0.5)
      trail.x = particle.position[0] * scale
      trail.y = particle.position[1] * scale
      trail.width = 2
      trail.height = 2
      ;(particle.tracer ? trailContainerRed : trailContainer).addChild(trail)
      particle.sprite = [sprite, trail]
    }
    sim.connector.onParticleRemoved = (particle) => {
      let [sprite, trail] = particle.sprite
      sprite.destroy()
      trail.destroy()
      return true
    }
    const updateSprite = (particle) => {
      let [sprite, trail] = particle.sprite
      const scale = app.screen.width
      sprite.x = particle.position[0] * scale
      sprite.y = particle.position[1] * scale
      sprite.width = particle.radius * 2 * scale
      sprite.height = particle.radius * 2 * scale
      sprite.rotation = Math.atan2(particle.velocity[1], particle.velocity[0])
      sprite.alpha = sim.params.trailDisplay === 'trailOnly' ? 0 : 1

      trail.x = particle.position[0] * scale
      trail.y = particle.position[1] * scale
      trail.alpha =
        sim.params.trailDisplay === 'disabled'
          ? 0
          : !sim.params.trailForTracersOnly || particle.tracer
          ? 1
          : 0
      return true
    }
    sim.connector.readRotationFast = (particle) => {
      return particle.sprite?.[0].rotation
    }
    sim.connector.draw = async () => {
      sim.particles.forEach((particle) => updateSprite(particle))
      PIXI.Ticker.shared.update(performance.now())
      trailFilter.trailLength =
        sim.params.trailDisplay === 'disabled'
          ? 0
          : sim.params.trailLength >= 1000
          ? 1000
          : sim.params.trailLength / (sim.params.simulationSpeed * 1000)
      app.renderer.render(app.stage)

      if (!sim.recording) return
      let {
        stats: {step},
        recording,
        params,
        particles,
      } = sim
      console.log(step)
      let directory = recording.options.directory
      particles = particles.slice()
      params = JSON.parse(JSON.stringify(params))
      if (recording.options.includeVideo) {
        await new Promise((resolve) => {
          state.current.app.view.toBlob(
            async (blob) => {
              let fileHandle = await directory.getFileHandle(
                'frame_' + step + '.jpeg',
                {create: true}
              )
              const writeHandle = await fileHandle.createWritable()
              await writeHandle.write(blob)
              await writeHandle.close()
              resolve()
            },
            'image/jpeg',
            0.92
          )
        })
      }
      if (recording.options.includeState) {
        let filecontent = ''
        filecontent += csv.serialise(
          [params],
          [
            'particleCount',
            'particleRadiusMin',
            'particleRadiusMax',
            'particleSizeDistribution',
            'mass',
            'particleVelocityConstant',
            'simulationSpeed',
            'particleCollisions',
            'particleElasticity',
            'boundaryElasticity',
            'boundary.name',
            'boundary.params',
            'spawnRate',
            'spawnAdjustsRadius',
            'spawnArea.x',
            'spawnArea.y',
            'spawnArea.radius',
            'spawnArea.rotation',
            'spawnArea.rotationSpread',
          ]
        )
        filecontent += '\n'
        filecontent += csv.serialise(particles, [
          'uid',
          'position.0',
          'position.1',
          'velocity.0',
          'velocity.1',
          'radius',
        ])
        let fileHandle = await directory.getFileHandle(
          'state_' + step + '.csv',
          {create: true}
        )
        const writeHandle = await fileHandle.createWritable()
        await writeHandle.write(filecontent)
        await writeHandle.close()
      }
      if (recording.options.includeCollisions) {
        let fileHandle = await directory.getFileHandle(
          'collisions_' + step + '.csv',
          {create: true}
        )
        const writeHandle = await fileHandle.createWritable()
        await writeHandle.write(
          csv.serialise(recording.collisions, [
            'particle0.uid',
            'particle0.position.0',
            'particle0.position.1',
            'particle0.velocity.0',
            'particle0.velocity.1',
            'particle0.radius',
            'particle1.uid',
            'particle1.position.0',
            'particle1.position.1',
            'particle1.velocity.0',
            'particle1.velocity.1',
            'particle1.radius',
            'boundary0.normal.0',
            'boundary0.normal.1',
            'boundary0.position.0',
            'boundary0.position.1',
            'boundary1.normal.0',
            'boundary1.normal.1',
            'boundary1.position.0',
            'boundary1.position.1',
          ])
        )
        await writeHandle.close()
      }
      if (recording.options.includeAnalysis) {
        let stats = statsBreakdownMini(sim.particles)
        let fileHandle = await directory.getFileHandle(
          'analysis_' + step + '.csv',
          {create: true}
        )
        const writeHandle = await fileHandle.createWritable()
        await writeHandle.write(
          csv.serialise(stats, ['attribute', 'stat', 'value'])
        )
        await writeHandle.close()
      }
      console.log(step)
    }
    sim.connector.clearDrawing = () => {
      app.renderer.clear()
      trailFilter.uniforms.uSamplerPrev = null
    }

    const resizeWindow = () => {
      if (sim.recording?.options?.videoResolution) return
      const windowSize = Math.min(window.innerWidth, window.innerHeight) - 65
      app.renderer.resize(windowSize, windowSize)
      sim.connector.clearDrawing()
      sim.connector.draw()
    }
    resizeWindow()
    window.addEventListener('resize', resizeWindow)

    const ticker = createTicker(() => {
      return sim.cycle(state.current)
    })
    state.current.ticker = ticker
    sim.cycle({playing: false})

    let _state = state.current
    return () => {
      ticker.stop()
      app.destroy(true)
      window.removeEventListener('resize', resizeWindow)
      _state.app = null
      _state.trailFilter = null
    }
  }, [sim])

  useEffect(() => {
    makeSureVisualisationIsNotObscured(visualisation)
  }, [visualisation])

  let Particles = (
    <div style={{display: 'flex', flexWrap: 'wrap'}}>
      <div
        style={{
          padding: 10,
          marginLeft: -10,
          width: sim.recording?.options?.videoResolution || '100%',
          maxWidth:
            sim.recording?.options?.videoResolution ||
            'calc(min(100vh, 100vw) - 65px)',
          flexShrink: sim.recording?.options?.videoResolution ? 0 : 'initial',
        }}
      >
        <div style={{position: 'relative', width: '100%', paddingTop: '100%'}}>
          <ArenaViz
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
            }}
            sim={sim}
            visualisation={state.current.playing ? 'particles' : visualisation}
          />
          <div
            ref={ref}
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
            }}
          ></div>
        </div>
      </div>
      <div style={{paddingBottom: 10}}>
        <button
          onClick={() => {
            state.current.playing = !state.current.playing
            setNonce(Math.random())
            makeSureVisualisationIsNotObscured(visualisation)
            if (state.current.playing) {
              state.current.ticker.start()
            } else {
              state.current.ticker.stop()
              sim.cycle({playing: false})
            }
          }}
          style={{
            fontSize: '2rem',
            background: 'none',
            border: 'none',
            outline: 'none',
            verticalAlign: 'top',
          }}
        >
          {state.current.playing ? '⏸' : '▶️'}
        </button>
        <button
          onClick={() => {
            if (state.current.playing) return
            state.current.playing = true
            sim.cycle({...state.current})
            state.current.playing = false
            sim.cycle({playing: false})
          }}
          style={{
            fontSize: '2rem',
          }}
        >
          Step
        </button>
        <button
          onClick={() => {
            const p = sim.params.particleCount
            sim.params.particleCount = 0
            sim.normaliseParticles()
            sim.params.particleCount = p
            sim.resetStats()
            sim.normaliseParticles()
            sim.cycle({playing: false})
            for (const k in sim.updateHook) {
              sim.updateHook[k]({
                playing: state.current.playing,
                trigger: 'reset',
              })
            }
          }}
          style={{
            fontSize: '2rem',
            marginLeft: 10,
          }}
        >
          Reset
        </button>
        <button
          onClick={() => {
            csv.upload().then(([{data: filecontent}]) => {
              let collisions = csv.parse(filecontent)
              collisions = collisions.filter((c) => c.particle1.uid)
              collisions = collisions.map((c) => [c.particle0, c.particle1])
              analyseCollisions(collisions, {
                elasticity: 1,
                constantMass: false,
                constantVelocity: false,
              })
            })
          }}
          style={{
            fontSize: '2rem',
            marginLeft: 10,
          }}
        >
          Analyse Collisions
        </button>
        <br />
        <UserControls
          playing={state.current.playing}
          onAnalyseCurrentState={() => {
            let name = 'state (' + (analyses.length + 1) + ')'
            return statsBreakdown(sim.particles, name, true).then((s) => {
              csv.download(
                csv.serialise(s, ['method', 'attribute', 'stat', 'value']),
                'analysis.csv'
              )
              setAnalyses(analyses.concat([s]))
            })
          }}
          onMakeRecordingStart={(options) => {
            sim.recording = {options}
            state.current.ticker.setAsync(true)
            if (options.includeCollisions) {
              sim.recording.collisions = []
            }
            if (options.videoResolution) {
              state.current.app.renderer.resize(
                options.videoResolution,
                options.videoResolution
              )
              sim.connector.clearDrawing()
              sim.connector.draw()
              setNonce(Math.random())
            }
          }}
          onMakeRecordingStop={() => {
            sim.recording = null
            state.current.ticker.setAsync(false)
            const windowSize =
              Math.min(window.innerWidth, window.innerHeight) - 65
            state.current.app.renderer.resize(windowSize, windowSize)
            sim.connector.clearDrawing()
            sim.connector.draw()
            setNonce(Math.random())
          }}
          onChange={(params) => {
            if (params.visualisation !== visualisation) {
              setVisualisation(params.visualisation)
              makeSureVisualisationIsNotObscured(params.visualisation)
            }
            if (params.spawnArea !== sim.params.spawnArea) {
              setNonce(Math.random())
            }
            if (params.boundary !== sim.params.boundary) {
              sim.updateBoundary(params.boundary)
              setNonce(Math.random())
              updateBoundaryCollisionDetector()
            }
            if (params.tracerFraction !== sim.params.tracerFraction) {
              sim.updateTracerFraction(params.tracerFraction)
            }
            if (
              params.particleSizeDistribution !==
              sim.params.particleSizeDistribution
            ) {
              sim.updateSizeDistribution(params.particleSizeDistribution)
            }

            let {particleRadiusMin, particleRadiusMax} = params
            particleRadiusMax = Math.max(particleRadiusMin, particleRadiusMax)
            sim.params = {
              ...sim.params,
              ...params,
              particleRadiusMax,
            }
            sim.cycle({playing: false})
          }}
          nonce={nonce}
          sim={sim}
          defaultValue={sim.params}
          getSuggestedRadius={(particleCount) =>
            sim.getSuggestedRadius(particleCount)
          }
        />
      </div>
    </div>
  )

  return (
    <div>
      {Particles}
      <div
        style={{
          maxWidth: 'calc(max(min(100vh, 100vw) - 65px, 500px))',
          fontSize: '18px',
        }}
      >
        {!!analyses.length && <h2 style={{marginTop: 0}}>Analyses</h2>}
        {!!analyses.length && (
          <p>
            These analyses measure disorder, based on how dissimilar the
            particles are from each other (lower value = less disorderd). For
            more details, see <a href="/particles-text">/particles-text</a>
          </p>
        )}
        {!!analyses.length && (
          <AnalysisDisplayTable statsFromProps={[].concat(...analyses)} />
        )}
        <h2 style={analyses.length ? {} : {marginTop: 0}}>What is this?</h2>
        <ExplainerIntro />
        <p>
          Read more at <a href="/particles-text">/particles-text</a>
        </p>
      </div>
    </div>
  )
}

export default Particles
