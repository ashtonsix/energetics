import * as PIXI from 'pixi.js'
import React, {useEffect, useRef, useState} from 'react'
import {
  ParticleCollisionDetector,
  BoundaryCollisionDetector,
} from './CollisionDetectors'
import ArenaViz from './ArenaViz'
import vec from './vec'
import UserControls from './UserControls'
import boundaryGenerators from './boundaryGenerators'
import TrailFilter from './TrailFilter'

const collide = (p1, p2, constantVelocity, particleStickiness) => {
  const radii = p1.radius + p2.radius
  const normal = vec.sub(p1.position, p2.position)
  if (!vec.lengthLessThan(normal, radii)) {
    return
  }
  const pushAway = vec.setLength(normal, (radii - vec.length(normal)) / 2)
  vec.$add(p1.position, pushAway)
  vec.$sub(p2.position, pushAway)

  const un = vec.$setLength(normal, 1)
  const ut = [-un[1], un[0]]

  let p1v = vec.add(
    vec.mult(un, vec.dot(un, p2.velocity)),
    vec.mult(ut, vec.dot(ut, p1.velocity))
  )
  let p2v = vec.add(
    vec.mult(un, vec.dot(un, p1.velocity)),
    vec.mult(ut, vec.dot(ut, p2.velocity))
  )
  if (particleStickiness) {
    const v0 = vec.length(p1v) + vec.length(p2v)
    const temp = vec.mix(p1v, p2v, particleStickiness)
    p2v = vec.mix(p2v, p1v, particleStickiness)
    p1v = temp
    const v1 = vec.length(p1v) + vec.length(p2v)
    const ratio = v0 / v1
    vec.$mult(p1v, ratio)
    vec.$mult(p2v, ratio)
  }
  if (constantVelocity) {
    const v = (vec.length(p1.velocity) + vec.length(p2.velocity)) / 2
    vec.$setLength(p1v, v)
    vec.$setLength(p2v, v)
  }

  p1.velocity = p1v
  p2.velocity = p2v
}

const collideBoundary = (p, boundary, sticky, bcd) => {
  let normal = boundary.normal
  let un = normal
  let ut = [-un[1], un[0]]

  let relativePosition = vec.sub(p.position, boundary.position)
  let pNormalMag = vec.dot(un, relativePosition)

  if (pNormalMag > p.radius) return

  vec.$add(p.position, vec.mult(un, p.radius - pNormalMag + 0.000001))

  if (sticky) {
    const v = Math.sign(vec.dot(ut, p.velocity)) * vec.length(p.velocity)
    p.velocity = vec.mult(ut, v)
  } else {
    let projected = vec.dot(un, p.velocity) * 2
    if (projected < 0) vec.$sub(p.velocity, vec.mult(un, projected))
  }

  // improves behaviour of sticky boundaries with crevices
  let stillCollides = bcd.retrieve(p)
  if (stillCollides) {
    const relativePosition = vec.sub(p.position, stillCollides.position)
    const pNormalMag = vec.dot(un, relativePosition)
    if (pNormalMag <= p.radius) {
      un = vec.setLength(vec.mix(boundary.normal, stillCollides.normal, 0.5), 1)
      ut = [-un[1], un[0]]
      let projected = vec.dot(un, p.velocity) * 2
      if (projected < 0) vec.$sub(p.velocity, vec.mult(un, projected))
    }
  }
}

const clamp = (value, min, max) => {
  return Math.min(Math.max(+value || 0, min), max)
}

const debounce = (f, timeout = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => f.apply(this, args), timeout)
  }
}

const shuffle = (array) => {
  let currentIndex = array.length
  let randomIndex

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }

  return array
}

class Simulation {
  params = {
    particleCount: 500,
    particleRadiusMin: 0,
    particleRadiusMax: 0,
    particleSpeed: 3 / 1000,
    particleSpeedConstant: false,
    particleCollisions: true,
    particleStickiness: 0,
    boundaryStickiness: false,
    boundary: {name: 'circleSquare', params: [1]},
    spawnArea: null, // null OR {x: 0.5, y: 0.5, radius: 0.03, rotation: Math.PI * 0, rotationSpread: Math.PI * 0.15}
    redFraction: 10 / 100,
    trailDisplay: 'disabled', // disabled, enabled, or trailOnly
    trailLength: 20,
  }
  constructor() {
    this.updateBoundary(this.params.boundary)
    this.params.particleRadiusMin = clamp(
      this.getSuggestedRadius() * 0.6,
      0.002,
      0.2
    )
    this.params.particleRadiusMax = clamp(
      this.getSuggestedRadius() * 0.7,
      0.002,
      0.2
    )
  }
  particles = []
  boundary = []
  boundaryCollisionDetector = null
  connector = {
    createSprite(particle) {
      let sprite = {}
      return sprite
    },
    destroySprite(sprite) {
      return true
    },
    updateSprite(sprite, particle) {
      return true
    },
  }
  getSuggestedRadius(particleCount = null) {
    if (particleCount === null) particleCount = this.params.particleCount
    const totalArea = this.boundaryCollisionDetector.areaInside * 0.7
    const area = totalArea / particleCount
    return (area / Math.PI) ** 0.5
  }
  createParticle() {
    const $ = this.params
    const particle = {}
    const spawnArea = $.spawnArea || {
      x: 0.5,
      y: 0.5,
      radius: 4 / Math.PI,
      rotation: 0,
      rotationSpread: Math.PI,
    }
    const rotation =
      spawnArea.rotation -
      spawnArea.rotationSpread +
      Math.random() * spawnArea.rotationSpread * 2
    particle.velocity = vec.mult(
      [Math.cos(rotation), Math.sin(rotation)],
      $.particleSpeed
    )
    let range = $.particleRadiusMax - $.particleRadiusMin
    particle.radius = $.particleRadiusMin + Math.random() ** 0.5 * range
    particle.red = Math.random() < $.redFraction ? true : false

    for (let i = 0; i < 500; i++) {
      const distance = Math.random() ** 0.5 * spawnArea.radius
      const angle = Math.random() * Math.PI * 2
      particle.position = [
        Math.cos(angle) * distance + spawnArea.x,
        Math.sin(angle) * distance + spawnArea.y,
      ]
      const collides = this.boundaryCollisionDetector.retrieve(particle)
      if (!collides) break
      let normal = collides.normal
      let relativePosition = vec.sub(particle.position, collides.position)
      let pNormalMag = vec.dot(normal, relativePosition)
      if (pNormalMag > particle.radius) break
    }
    particle.sprite = this.connector.createSprite(particle)
    this.particles.push(particle)
  }
  destroyParticle(r = null) {
    if (r === null) r = Math.floor(Math.random() * this.particles.length)
    const p = this.particles.splice(r, 1)[0]
    this.connector.destroySprite(p.sprite)
  }
  // adds, removes & scales particles to satisfy configured parameters
  normaliseParticles() {
    let $p = this.params
    let $P = this.particles
    let count = Math.round($p.particleCount)
    for (let i = 0; i < $P.length; i++) {
      // just in case
      if (isNaN($P[i].position[0]) || isNaN($P[i].position[1])) {
        this.destroyParticle(i)
      }
    }
    if ($P.length < count) {
      const toAdd = count - $P.length
      for (let i = 0; i < toAdd; i++) this.createParticle()
    }
    if ($P.length > count) {
      const toDestroy = $P.length - count
      for (let i = 0; i < toDestroy; i++) this.destroyParticle()
    }

    if (!$P.length) return
    let totalVelocity = 0

    let min = $P[0].radius
    let max = $P[0].radius
    for (let i = 0; i < $P.length; i++) {
      totalVelocity += vec.length($P[i].velocity)
      if ($P[i].radius > max) max = $P[i].radius
      if ($P[i].radius < min) min = $P[i].radius
    }
    let e = 0.000001
    const range = Math.max(max - min, e)
    const desiredMin = $p.particleRadiusMin
    const desiredRange = Math.max(
      $p.particleRadiusMax - $p.particleRadiusMin,
      e
    )

    let avgVelocity = totalVelocity / $P.length
    let velocityRatio = this.params.particleSpeed / avgVelocity
    for (let i = 0; i < $P.length; i++) {
      const r = ($P[i].radius - min) * (desiredRange / range) + desiredMin
      $P[i].radius = r
      // velocity is conserved in collisions, but average velocity can
      // still deviate from parameters due to particles despawning
      vec.$mult($P[i].velocity, velocityRatio)
    }
  }
  cycle({playing}) {
    this.normaliseParticles()
    if (playing) {
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i]
        vec.$add(p.position, p.velocity)
        p.position[0] = Math.min(Math.max(p.position[0], 0), 0.999999)
        p.position[1] = Math.min(Math.max(p.position[1], 0), 0.999999)
        const boundary = this.boundaryCollisionDetector.retrieve(p)
        if (boundary) {
          collideBoundary(
            p,
            boundary,
            this.params.boundaryStickiness,
            this.boundaryCollisionDetector
          )
        }
      }

      if (this.params.particleCollisions) {
        const particleCollisionDetector = new ParticleCollisionDetector(
          this.params.particleRadiusMax * 2
        )
        for (let i = 0; i < this.particles.length; i++) {
          const p = this.particles[i]
          particleCollisionDetector.insert(p)
        }

        const particleSpeedConstant = this.params.particleSpeedConstant
        const particleStickiness = this.params.particleStickiness
        for (let i = 0; i < this.particles.length; i++) {
          let p = this.particles[i]

          const candidates = particleCollisionDetector.retrieve(p)

          for (let k = 0; k < candidates.length; k++) {
            let candidate = candidates[k]
            if (p === candidate || !candidate) continue
            collide(p, candidate, particleSpeedConstant, particleStickiness)
          }
        }
      }
    }
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i]
      this.connector.updateSprite(p.sprite, p)
    }
  }
  updateParticleSpeed(newSpeed) {
    const oldSpeed = this.params.particleSpeed
    this.params.particleSpeed = newSpeed
    const ratio = newSpeed / oldSpeed
    for (let i = 0; i < this.particles.length; i++) {
      if (this.params.particleSpeedConstant) {
        vec.$setLength(this.particles[i].velocity, newSpeed)
      } else {
        vec.$mult(this.particles[i].velocity, ratio)
      }
    }
  }
  updateBoundary(boundary, callback = () => {}) {
    if (!this.boundaryCollisionDetector) {
      this.updateBCD(boundary, callback)
      return
    }
    if (!this._updateBCD) {
      this._updateBCD = debounce(this.updateBCD.bind(this), 100)
    }
    this._updateBCD(boundary, callback)
  }
  updateBCD(boundary, callback = () => {}) {
    console.log(boundary.name)
    this.params.boundary = boundary
    this.boundary = boundaryGenerators[boundary.name].generator(
      boundary.params,
      1000
    )
    this.boundaryCollisionDetector = new BoundaryCollisionDetector()
    this.boundary.forEach(([polygon, inside], i) => {
      let more = i < boundary.length - 1
      this.boundaryCollisionDetector.insert(polygon, inside, more)
    })
    callback()
  }
  updateRedFraction(redFraction) {
    let redCount = 0
    for (let i = 0; i < this.particles.length; i++) {
      redCount += this.particles[i].red
    }
    let desiredRedCount = Math.round(this.particles.length * redFraction)
    let discrepancy = desiredRedCount - redCount
    let wrongColor = []
    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i]
      if (p.red && discrepancy < 0) wrongColor.push(p)
      if (!p.red && discrepancy > 0) wrongColor.push(p)
    }
    shuffle(wrongColor)
    discrepancy = Math.abs(discrepancy)
    for (let i = 0; i < discrepancy; i++) {
      let p = wrongColor[i]
      this.connector.destroySprite(p.sprite)
      p.sprite = null
      p.red = !p.red
      p.sprite = this.connector.createSprite(p)
    }
  }
}

const Particles = () => {
  const ref = useRef()
  const [sim] = useState(() => {
    const sim = new Simulation()
    return sim
  })
  const [nonce, setNonce] = useState(0)
  const state = useRef({
    playing: false,
    app: null,
    ticker: null,
    trailFilter: null,
  })

  const letTickerGoForASecond = () => {
    if (!state.current.playing && state.current.ticker) {
      state.current.ticker.start()
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
      const scale = app.screen.width * 0.96
      const padding = app.screen.width * 0.02
      sprite.x = particle.position[0] * scale + padding
      sprite.y = particle.position[1] * scale + padding
      sprite.width = particle.radius * 2 * scale + padding
      sprite.height = particle.radius * 2 * scale + padding
      sprite.rotation = Math.atan2(particle.velocity[1], particle.velocity[0])
      ;(particle.red ? spriteContainerRed : spriteContainer).addChild(sprite)

      const trail = PIXI.Sprite.from(
        particle.red ? '/trail_red.png' : '/trail.png'
      )
      trail.anchor.set(0.5)
      trail.x = particle.position[0] * scale + padding
      trail.y = particle.position[1] * scale + padding
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
      const scale = app.screen.width * 0.96
      const padding = app.screen.width * 0.02
      sprite.x = particle.position[0] * scale + padding
      sprite.y = particle.position[1] * scale + padding
      sprite.width = particle.radius * 2 * scale
      sprite.height = particle.radius * 2 * scale
      sprite.rotation = Math.atan2(particle.velocity[1], particle.velocity[0])
      sprite.alpha = sim.params.trailDisplay === 'trailOnly' ? 0 : 1

      trail.x = particle.position[0] * scale + padding
      trail.y = particle.position[1] * scale + padding
      trail.alpha = sim.params.trailDisplay === 'disabled' ? 0 : 1
      return true
    }

    const resizeWindow = () => {
      const windowSize = Math.min(window.innerWidth, window.innerHeight) - 50
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
        sim.params.trailDisplay === 'disabled' ? 0 : sim.params.trailLength
      sim.cycle(state.current)
    })
    state.current.ticker = ticker
    setTimeout(() => {
      if (!state.current.playing) ticker.stop()
    }, 1000)

    let _state = state.current
    return () => {
      ticker.stop()
      app.destroy(true)
      window.removeEventListener('resize', resizeWindow)
      _state.app = null
      _state.trailFilter = null
    }
  }, [sim])

  return (
    <div style={{display: 'flex', flexWrap: 'wrap'}}>
      <div
        style={{
          padding: 10,
          marginLeft: -10,
          width: '100%',
          maxWidth: 'calc(min(100vh, 100vw) - 50px)',
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
            // showDecals
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
      <div>
        <button
          onClick={() => {
            state.current.playing = !state.current.playing
            setNonce(Math.random())
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
            sim.normaliseParticles()
            letTickerGoForASecond()
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
            if (params.spawnArea !== sim.params.spawnArea) {
              setNonce(Math.random())
            }
            if (params.boundary !== sim.params.boundary) {
              sim.updateBoundary(params.boundary, () => {
                setNonce(Math.random())
              })
            }
            if (params.redFraction !== sim.params.redFraction) {
              sim.updateRedFraction(params.redFraction)
            }

            sim.params.particleSpeedConstant = params.particleSpeedConstant
            sim.updateParticleSpeed(params.particleSpeed)
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
          defaultValue={sim.params}
          getSuggestedRadius={(particleCount) =>
            sim.getSuggestedRadius(particleCount)
          }
        />
      </div>
    </div>
  )
}

export default Particles
