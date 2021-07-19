import * as PIXI from 'pixi.js'
import React, {useEffect, useRef, useState} from 'react'
import {useDebouncedCallback} from 'use-debounce'
import {
  ParticleCollisionDetector,
  BoundaryCollisionDetector,
} from './CollisionDetectors'
import ArenaViz from './ArenaViz'
import vec from './vec'
import UserControls from './UserControls'
import boundaryGenerators from './boundaryGenerators'
import TrailFilter from './TrailFilter'
import Explainer from './Explainer'

const collide = (p0, p1, elasticity, constantVelocity) => {
  const radii = p0.radius + p1.radius
  const normal = vec.sub(p0.position, p1.position)
  if (!vec.lengthLessThan(normal, radii)) {
    return false
  }
  const initialMomentum =
    p0.mass * vec.length(p0.velocity) + p1.mass * vec.length(p1.velocity)
  const pushAway = vec.setLength(normal, (radii - vec.length(normal)) / 2)
  vec.$add(p0.position, pushAway)
  vec.$sub(p1.position, pushAway)

  const un = vec.$setLength(normal, 1)
  const ut = [-un[1], un[0]]

  let p0vn = vec.dot(un, p0.velocity)
  let p1vn = vec.dot(un, p1.velocity)
  let p0v = vec.add(
    vec.mult(
      un,
      (elasticity * p1.mass * (p1vn - p0vn) + p0.mass * p0vn + p1.mass * p1vn) /
        (p0.mass + p1.mass)
    ),
    vec.mult(ut, vec.dot(ut, p0.velocity))
  )
  let p1v = vec.add(
    vec.mult(
      un,
      (elasticity * p0.mass * (p0vn - p1vn) + p0.mass * p0vn + p1.mass * p1vn) /
        (p0.mass + p1.mass)
    ),
    vec.mult(ut, vec.dot(ut, p1.velocity))
  )
  const currentMomentum = p0.mass * vec.length(p0v) + p1.mass * vec.length(p1v)
  vec.$mult(p0v, initialMomentum / currentMomentum)
  vec.$mult(p1v, initialMomentum / currentMomentum)

  if (constantVelocity) {
    vec.$setLength(p0v, 1)
    vec.$setLength(p1v, 1)
  }

  p0.velocity = p0v
  p1.velocity = p1v

  return true
}

const collideBoundary = (p, boundary, elastic, bcd) => {
  let normal = boundary.normal
  let un = normal
  let ut = [-un[1], un[0]]

  vec.$clamp(p.position, 0.01 + p.radius, 0.99 - p.radius)
  let relativePosition = vec.sub(p.position, boundary.position)
  let pNormalMag = vec.dot(un, relativePosition)
  let pTangentMag = vec.dot(ut, relativePosition)

  if (Math.abs(pTangentMag) > p.radius + bcd.cellSize * 2) {
    // handle edge case where arena shape changes and
    // particle is deep inside boundary
    vec.$add(p.position, vec.mult(ut, -pTangentMag))
  }
  if (pNormalMag > p.radius) return false

  vec.$add(p.position, vec.mult(un, p.radius - pNormalMag + 0.000001))

  if (elastic) {
    let projected = vec.dot(un, p.velocity) * 2
    if (projected < 0) vec.$sub(p.velocity, vec.mult(un, projected))
  } else {
    const v =
      Math.sign(vec.dot(ut, p.velocity) || Math.random() - 0.5) *
      vec.length(p.velocity)
    p.velocity = vec.mult(ut, v)
  }

  // improves behaviour of inelastic boundaries with crevices
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

  return true
}

const clamp = (value, min, max) => {
  return Math.min(Math.max(+value || 0, min), max)
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
    particleSizeDistribution: 1,
    simulationSpeed: 3 / 1000,
    particleVelocityConstant: false,
    particleCollisions: true,
    particleElasticity: 1,
    boundaryElasticity: true,
    boundary: {name: 'circleSquare', params: [1, 1]},
    spawnArea: null, // null OR {x: 0.5, y: 0.5, radius: 0.03, rotation: Math.PI * 0, rotationSpread: Math.PI * 0.15}
    redFraction: 10 / 100,
    trailDisplay: 'disabled', // disabled, enabled, or trailOnly
    trailLength: 20,
    mass: 'constant',
  }
  constructor() {
    this.updateBoundary(this.params.boundary)
    this.updateBoundaryCollisionDetector()
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
  stats = {
    step: 0,
    data: [],
    dataRetention: 100,
    histogramBuckets: 20,
  }
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
  endCycleHook = {}
  getSuggestedRadius(particleCount = null) {
    if (particleCount === null) particleCount = this.params.particleCount
    const totalArea = this.boundaryCollisionDetector.areaInside * 0.7
    const area = totalArea / particleCount
    return (area / Math.PI) ** 0.5
  }
  createParticle(averageArea) {
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
    particle.velocity = [Math.cos(rotation), Math.sin(rotation)]
    let range = $.particleRadiusMax - $.particleRadiusMin
    let power =
      $.particleSizeDistribution < 0
        ? Math.abs($.particleSizeDistribution) + 1
        : 1 / (1 + $.particleSizeDistribution)
    particle.radius = $.particleRadiusMin + Math.random() ** power * range
    particle.red = Math.random() < $.redFraction ? true : false

    for (let i = 0; i < 500; i++) {
      const distance = Math.random() ** 0.5 * spawnArea.radius
      const angle = Math.random() * Math.PI * 2
      particle.position = [
        Math.cos(angle) * distance + spawnArea.x,
        Math.sin(angle) * distance + spawnArea.y,
      ]
      let [x, y] = particle.position
      if (
        x < particle.radius ||
        x > 1 - particle.radius ||
        y < particle.radius ||
        y > 1 - particle.radius
      ) {
        continue
      }
      const collides = this.boundaryCollisionDetector.retrieve(particle)
      if (!collides) break
      if (collides.status === 'outside') continue
      let normal = collides.normal
      let relativePosition = vec.sub(particle.position, collides.position)
      let pNormalMag = vec.dot(normal, relativePosition)
      if (pNormalMag > particle.radius) break
    }
    particle.sprite = this.connector.createSprite(particle)
    this.particles.push(particle)
    return particle
  }
  destroyParticle(r = null) {
    if (r === null) r = Math.floor(Math.random() * this.particles.length)
    const p = this.particles.splice(r, 1)[0]
    this.connector.destroySprite(p.sprite)
    return true
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
      // radius is a random value between min/max,
      // velocity is the value that preserves average momentum,
      // every added particle is given the same momentum
      let averageArea = 0
      for (let i = 0; i < $P.length; i++) {
        averageArea += $P[i].radius ** 2
      }
      averageArea /= $P.length

      let addedParticles = []
      let toAdd = count - $P.length
      for (let i = 0; i < toAdd; i++) {
        addedParticles.push(this.createParticle(averageArea))
      }

      let averageAreaAdded = 0
      for (let i = 0; i < addedParticles.length; i++) {
        averageAreaAdded += addedParticles[i].radius ** 2
      }
      averageAreaAdded /= addedParticles.length
      if (!averageArea) averageArea = averageAreaAdded

      for (let i = 0; i < addedParticles.length; i++) {
        let area = addedParticles[i].radius ** 2
        vec.$setLength(
          addedParticles[i].velocity,
          $p.mass === 'constant' ? 1 : averageArea / area
        )
      }
    }
    if ($P.length > count) {
      const toDestroy = $P.length - count
      for (let i = 0; i < toDestroy; i++) this.destroyParticle()
    }

    if (!$P.length) return

    let min = $P[0].radius
    let max = $P[0].radius
    for (let i = 0; i < $P.length; i++) {
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

    for (let i = 0; i < $P.length; i++) {
      const r = ($P[i].radius - min) * (desiredRange / range) + desiredMin
      $P[i].radius = r
      $P[i].mass = $p.mass === 'constant' ? 1 : r ** 2
      if ($p.particleVelocityConstant) {
        vec.$setLength($P[i].velocity, 1)
      }
    }
    if ($p.particleVelocityConstant) return

    // only has an effect when the number of particles is reduced,
    // or any of these settings are changed:
    // Particle Mass, Simulation Speed
    let averageMass = 0
    let averageMomentum = 0
    for (let i = 0; i < $P.length; i++) {
      averageMass += $P[i].mass
    }
    averageMass /= $P.length
    for (let i = 0; i < $P.length; i++) {
      $P[i].mass /= averageMass
      averageMomentum += $P[i].mass * vec.length($P[i].velocity)
    }
    averageMomentum /= $P.length
    for (let i = 0; i < $P.length; i++) {
      vec.$mult($P[i].velocity, 1 / averageMomentum)
    }
  }
  cycle({playing}) {
    this.normaliseParticles()
    if (playing) {
      // prettier-ignore
      let s = {
        particleCollisionCount: 0,
        boundaryCollisionCount: 0,
        orientationToBoundary: new Array(this.stats.histogramBuckets).fill(0),
        orientationOfCollidingParticles: new Array(this.stats.histogramBuckets).fill(0)
      }
      this.stats.step += 1
      const {
        simulationSpeed,
        boundaryElasticity,
        particleCollisions,
        particleRadiusMax,
        particleVelocityConstant,
        particleElasticity,
      } = this.params
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i]
        vec.$add(p.position, vec.mult(p.velocity, simulationSpeed))
        p.position[0] = Math.min(Math.max(p.position[0], 0), 0.999999)
        p.position[1] = Math.min(Math.max(p.position[1], 0), 0.999999)
        const boundary = this.boundaryCollisionDetector.retrieve(p)
        if (boundary) {
          s.boundaryCollisionCount += collideBoundary(
            p,
            boundary,
            boundaryElasticity,
            this.boundaryCollisionDetector
          )
        }
      }

      let o2p = s.orientationOfCollidingParticles
      if (particleCollisions) {
        const particleCollisionDetector = new ParticleCollisionDetector(
          particleRadiusMax * 2
        )
        for (let i = 0; i < this.particles.length; i++) {
          const p = this.particles[i]
          particleCollisionDetector.insert(p)
        }

        for (let i = 0; i < this.particles.length; i++) {
          let p = this.particles[i]

          const candidates = particleCollisionDetector.retrieve(p)

          for (let k = 0; k < candidates.length; k++) {
            let candidate = candidates[k]
            if (p === candidate || !candidate) continue
            let didCollide = collide(
              p,
              candidate,
              particleElasticity,
              particleVelocityConstant
            )
            s.particleCollisionCount += didCollide
            if (didCollide) {
              let a0 = p.sprite[0].rotation
              let a1 = candidate.sprite[0].rotation
              let diff =
                (a0 - a1 + Math.PI * (2 + 1 / o2p.length)) % (Math.PI * 2)
              let j = Math.floor((diff * o2p.length) / (Math.PI * 2))
              o2p[j] += 1
            }
          }
        }
      }
      let o2b = s.orientationToBoundary
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i]
        const boundary = this.boundaryCollisionDetector.retrieve(p, false)
        if (!boundary) continue
        let pa = Math.atan2(p.velocity[1], p.velocity[0])
        let ba = Math.atan2(boundary.normal[1], boundary.normal[0])
        let diff = (pa - ba + Math.PI * (2.5 + 1 / o2b.length)) % (Math.PI * 2)
        let j = Math.floor((diff * o2b.length) / (Math.PI * 2))
        o2b[j] += 1
      }
      this.stats.data.push(s)
      if (this.stats.data.length > this.stats.dataRetention) {
        this.stats.data.shift()
      }
      for (const k in this.endCycleHook) {
        this.endCycleHook[k]()
      }
    }
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i]
      this.connector.updateSprite(p.sprite, p)
    }
  }
  updateBoundary(boundary) {
    this.params.boundary = boundary
    this.boundary = boundaryGenerators[boundary.name]
      .generator(boundary.params, 1000)
      .map(([polygon, inside]) => [
        polygon.map((p) => vec.add(vec.mult(p, 0.96), [0.02, 0.02])),
        inside,
      ])
  }
  updateBoundaryCollisionDetector() {
    this.boundaryCollisionDetector = new BoundaryCollisionDetector()
    this.boundary.forEach(([polygon, inside], i) => {
      let more = i < this.boundary.length - 1
      this.boundaryCollisionDetector.insert(polygon, inside, more)
    })
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
  updateSizeDistribution(newSizeDistribution) {
    let $ = this.params
    let oldSizeDistribution = $.particleSizeDistribution
    $.particleSizeDistribution = newSizeDistribution
    let range = $.particleRadiusMax - $.particleRadiusMin
    let oldPower =
      oldSizeDistribution < 0
        ? Math.abs(oldSizeDistribution) + 1
        : 1 / (1 + oldSizeDistribution)
    let newPower =
      newSizeDistribution < 0
        ? Math.abs(newSizeDistribution) + 1
        : 1 / (1 + newSizeDistribution)
    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i]
      let r = (p.radius - $.particleRadiusMin) / range
      r = r ** (newPower / oldPower)
      r = r * range + $.particleRadiusMin
      p.radius = r
    }
  }
}

const ParticlesNoExplainer = () => {
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
  const updateBoundaryCollisionDetector = useDebouncedCallback(() => {
    sim.updateBoundaryCollisionDetector()
    setNonce(Math.random())
    state.current.trailFilter.uniforms.uSamplerPrev = null
    state.current.app.renderer.clear()
    letTickerGoForASecond()
  }, 500)

  const letTickerGoForASecond = () => {
    if (!state.current.playing && state.current.ticker) {
      try {
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
            // showDecals={['closest']}
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
              dataRetention: 100,
              histogramBuckets: 20,
            }
            // particleCollisionCount: 0,
            // boundaryCollisionCount: 0,
            // orientationToBoundary: new Array(20).fill(0),
            // orientationOfCollidingParticles: new Array(20).fill(0),
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

const Particles = () => {
  return (
    <div>
      <ParticlesNoExplainer />
      <Explainer />
    </div>
  )
}

export default Particles
