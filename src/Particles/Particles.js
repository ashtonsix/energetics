import * as PIXI from 'pixi.js'
import React, {useEffect, useRef, useState} from 'react'
import {useDebouncedCallback} from 'use-debounce'
import Simulation from './Simulation'
import ArenaViz from './ArenaViz'
import UserControls from './UserControls'
import TrailFilter from './TrailFilter'
import {Explainer, ExplainerIntro} from './Explainer'
import useMathjax from './useMathjax'
import AnalysisDisplayTable from './analysis/AnalysisDisplayTable'

const ParticlesNoExplainer = () => {
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
  const [visualisation, setVisualisation] = useState('particles')
  const [nonce, setNonce] = useState(0)
  const state = useRef({
    playing: false,
    app: null,
    ticker: null,
    trailFilter: null,
  })
  const updateBoundaryCollisionDetector = useDebouncedCallback(() => {
    sim.updateBoundaryCollisionDetector()
    setNonce(Math.random())
    state.current.trailFilter.uniforms.uSamplerPrev = null
    state.current.app.renderer.clear()
    letTickerGoForASecond()
  }, 500)
  useMathjax()

  const letTickerGoForASecond = () => {
    if (!state.current.playing && state.current.ticker) {
      try {
        state.current.ticker.update()
        state.current.ticker.start()
      } catch (e) {
        return
      }
      setTimeout(() => {
        if (!state.current.playing) {
          try {
            state.current.ticker.stop()
          } catch (e) {}
        }
      }, 1000)
    }
  }

  useEffect(() => {
    const app = new PIXI.Application({backgroundAlpha: 0})
    state.current.app = app
    ref.current.appendChild(app.view)
    const options = {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true,
    }
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
    sim.connector.createSprite = (particle) => {
      const sprite = PIXI.Sprite.from(
        particle.red ? '/arrow_red_32.png' : '/arrow_32.png'
      )
      sprite.anchor.set(0.5)
      const scale = app.screen.width
      sprite.x = particle.position[0] * scale
      sprite.y = particle.position[1] * scale
      sprite.width = particle.radius * 2 * scale
      sprite.height = particle.radius * 2 * scale
      sprite.rotation = Math.atan2(particle.velocity[1], particle.velocity[0])
      ;(particle.red ? spriteContainerRed : spriteContainer).addChild(sprite)

      const trail = PIXI.Sprite.from(
        particle.red ? '/trail_red.png' : '/trail.png'
      )
      trail.anchor.set(0.5)
      trail.x = particle.position[0] * scale
      trail.y = particle.position[1] * scale
      trail.width = 2
      trail.height = 2
      ;(particle.red ? trailContainerRed : trailContainer).addChild(trail)
      return [sprite, trail]
    }
    sim.connector.destroySprite = ([sprite, trail]) => {
      sprite.destroy()
      trail.destroy()
      return true
    }
    sim.connector.updateSprite = ([sprite, trail], particle) => {
      const scale = app.screen.width
      sprite.x = particle.position[0] * scale
      sprite.y = particle.position[1] * scale
      sprite.width = particle.radius * 2 * scale
      sprite.height = particle.radius * 2 * scale
      sprite.rotation = Math.atan2(particle.velocity[1], particle.velocity[0])
      sprite.alpha = sim.params.trailDisplay === 'trailOnly' ? 0 : 1

      trail.x = particle.position[0] * scale
      trail.y = particle.position[1] * scale
      trail.alpha = sim.params.trailDisplay === 'disabled' ? 0 : 1
      return true
    }
    sim.connector.readRotationFast = (particle) => {
      return particle.sprite?.[0].rotation
    }

    const resizeWindow = () => {
      const windowSize = Math.min(window.innerWidth, window.innerHeight) - 65
      app.renderer.resize(windowSize, windowSize)
      app.renderer.clear()
      trailFilter.uniforms.uSamplerPrev = null
      sim.particles.forEach((particle) => {
        sim.connector.updateSprite(particle.sprite, particle)
      })
      letTickerGoForASecond()
    }
    resizeWindow()
    window.addEventListener('resize', resizeWindow)

    const ticker = app.ticker.add(() => {
      trailFilter.trailLength =
        sim.params.trailDisplay === 'disabled'
          ? 0
          : sim.params.trailLength >= 1000
          ? 1000
          : sim.params.trailLength / (sim.params.simulationSpeed * 1000)
      sim.cycle(state.current)
    })
    state.current.ticker = ticker
    ticker.stop()
    letTickerGoForASecond()

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
    try {
      let style = state.current.app?.view.style
      style.opacity =
        state.current.playing || visualisation === 'particles' ? 1 : 0
    } catch (e) {
      console.error(e)
    }
  }, [visualisation])

  return (
    <div style={{display: 'flex', flexWrap: 'wrap'}}>
      <div
        style={{
          padding: 10,
          marginLeft: -10,
          width: '100%',
          maxWidth: 'calc(min(100vh, 100vw) - 65px)',
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
            showDecal={state.current.playing ? 'particles' : visualisation}
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
            let style = state.current.app?.view.style
            style.opacity =
              state.current.playing || visualisation === 'particles' ? 1 : 0
            if (state.current.playing) {
              state.current.ticker.start()
            } else {
              setTimeout(() => {
                if (!state.current.playing) state.current.ticker.stop()
              }, 1000)
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
            sim.cycle({...state.current, playing: true})
            state.current.playing = false
            letTickerGoForASecond()
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
            state.current.trailFilter.uniforms.uSamplerPrev = null
            state.current.app.renderer.clear()
            sim.params.particleCount = p
            sim.stats = {
              step: 0,
              data: [],
              dataRetention: sim.stats.dataRetention,
              histogramBuckets: sim.stats.histogramBuckets,
            }
            sim.normaliseParticles()
            letTickerGoForASecond()
            for (const k in sim.endCycleHook) {
              sim.endCycleHook[k]({
                playing: state.current.playing,
                triggeredByReset: true,
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
        <br />
        <UserControls
          playing={state.current.playing}
          onChange={(params) => {
            if (params.visualisation !== visualisation) {
              setVisualisation(params.visualisation)
            }
            if (params.spawnArea !== sim.params.spawnArea) {
              setNonce(Math.random())
            }
            if (params.boundary !== sim.params.boundary) {
              sim.updateBoundary(params.boundary)
              setNonce(Math.random())
              updateBoundaryCollisionDetector()
            }
            if (params.redFraction !== sim.params.redFraction) {
              sim.updateRedFraction(params.redFraction)
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
            letTickerGoForASecond()
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
}

const writeToDirectory = async () => {
  let dirHandle = window.dirHandle
  if (!dirHandle) dirHandle = await window.showDirectoryPicker()
  window.dirHandle = dirHandle

  let fileHandle1 = window.fileHandle1
  if (!fileHandle1) {
    fileHandle1 = await dirHandle.getFileHandle('collisions.csv', {
      create: true,
    })
  }
  window.fileHandle1 = fileHandle1
  const writeHandle1 = await fileHandle1.createWritable()
  await writeHandle1.write('test')
  await writeHandle1.close()

  setTimeout(async () => {
    const fileHandle2 = await dirHandle.getFileHandle('particles.csv', {
      create: true,
    })
    const writeHandle2 = await fileHandle2.createWritable()
    await writeHandle2.write('test')
    await writeHandle2.close()
  }, 5000)
}

export const Particles = () => {
  return (
    <div>
      <ParticlesNoExplainer />
      <div
        style={{
          maxWidth: 'calc(max(min(100vh, 100vw) - 65px, 500px))',
          fontSize: '18px',
        }}
      >
        <h2 style={{marginTop: 0}}>What is this?</h2>
        <ExplainerIntro />
        <p>
          Read more at <a href="/particles-explainer">/particles-explainer</a>
        </p>
        <button
          onClick={() => {
            writeToDirectory()
          }}
        >
          Save file
        </button>
        <AnalysisDisplayTable />
      </div>
    </div>
  )
}

export const ParticlesExplainer = () => {
  return <Explainer />
}

export default Particles
