import * as PIXI from 'pixi.js'
import React, {useEffect, useRef, useState} from 'react'
import {
  ParticleCollisionDetector,
  BoundaryCollisionDetector,
  BoundaryViz,
} from './CollisionDetectors'
import vec from './vec'
import UserInterface from './UserInterface'
import polygonGenerators from './polygonGenerators'

const collide = (p1, p2, constantVelocity = true) => {
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
  if (false) {
    const v = (vec.length(p1.velocity) + vec.length(p2.velocity)) / 2
    vec.$setLength(p1v, v)
    vec.$setLength(p2v, v)
  }

  p1.velocity = p1v
  p2.velocity = p2v
}

const collideBoundary = (p, boundary) => {
  const normal = boundary.normal
  const un = normal
  const ut = [-un[1], un[0]]

  if (
    boundary.status !== 'outside' &&
    !vec.lengthLessThan(vec.sub(p.position, boundary.position), p.radius)
  ) {
    return
  }

  const relativePosition = vec.sub(p.position, boundary.position)
  const tangent = vec.mult(ut, vec.dot(ut, relativePosition))

  p.position = vec.add(boundary.position, vec.mult(un, p.radius + 0.00001))
  // vec.$add(p.position, tangent)

  let projected = vec.dot(un, p.velocity) * 2
  if (projected < 0) vec.$sub(p.velocity, vec.mult(un, projected))
}

class Simulation {
  particles = []
  boundaryCollisionDetector = null
  params = {
    particleCount: 0,
    particleRadiusMin: 0,
    particleRadiusMax: 0,
    particleSpeed: 0,
  }
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
    const rotation = Math.random() * Math.PI * 2
    particle.velocity = vec.mult(
      [Math.cos(rotation), Math.sin(rotation)],
      $.particleSpeed
    )
    let range = $.particleRadiusMax - $.particleRadiusMin
    particle.radius = $.particleRadiusMin + Math.random() * range

    for (let i = 0; i < 20; i++) {
      particle.position = [Math.random(), Math.random()]
      const collides = this.boundaryCollisionDetector.retrieve(particle)
      if (!collides) break
    }
    particle.sprite = this.connector.createSprite(particle)
    this.particles.push(particle)
  }
  destroyParticle() {
    const r = Math.floor(Math.random() * this.particles.length)
    const p = this.particles.splice(r, 1)[0]
    this.connector.destroySprite(p.sprite)
  }
  // adds, removes & scales particles to satisfy configured parameters
  normaliseParticles() {
    let $p = this.params
    let $P = this.particles
    let count = Math.round($p.particleCount)
    if ($P.length < count) {
      const toAdd = count - $P.length
      for (let i = 0; i < toAdd; i++) this.createParticle()
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
      // vec.$setLength($P[i].velocity, $p.particleSpeed)
    }
    let e = 0.000001
    const range = Math.max(max - min, e)
    const desiredMin = $p.particleRadiusMin
    const desiredRange = Math.max(
      $p.particleRadiusMax - $p.particleRadiusMin,
      e
    )

    if (Math.abs(min - desiredMin) > e || Math.abs(range - desiredRange) > e) {
      for (let i = 0; i < $P.length; i++) {
        const r = ($P[i].radius - min) * (desiredRange / range) + desiredMin
        $P[i].radius = r
      }
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
      }

      const particleCollisionDetector = new ParticleCollisionDetector(
        this.params.particleRadiusMax * 2
      )
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i]

        const boundary = this.boundaryCollisionDetector.retrieve(p)
        if (boundary) {
          collideBoundary(p, boundary)
        }

        particleCollisionDetector.insert(p)
      }

      const particleSpeed = this.params.particleSpeed
      for (let i = 0; i < this.particles.length; i++) {
        let p = this.particles[i]

        const candidates = particleCollisionDetector.retrieve(p)

        for (let k = 0; k < candidates.length; k++) {
          let candidate = candidates[k]
          if (p === candidate) continue
          if (!candidate) debugger
          collide(p, candidate, particleSpeed)
        }
      }
    }
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i]
      this.connector.updateSprite(p.sprite, p)
    }
  }
  updateBoundaryPolygons(polygons) {
    this.boundaryCollisionDetector = new BoundaryCollisionDetector()
    polygons.forEach(([polygon, inside]) => {
      this.boundaryCollisionDetector.insert(polygon, inside)
    })
  }
  constructor(polygons = []) {
    this.updateBoundaryPolygons(polygons)
    this.params.particleCount = 500
    this.params.particleRadiusMin = this.getSuggestedRadius() * 0.95
    this.params.particleRadiusMax = this.getSuggestedRadius() * 1.05
    this.params.particleSpeed = 3 / 1000
  }
}

const boundary = polygonGenerators.chambers([4, 1.55], 1000)
const polygons = [[boundary, 'inside']]

const Particles = () => {
  const ref = useRef()
  const [sim] = useState(() => {
    const sim = new Simulation(polygons)
    return sim
  })
  const [, setNonce] = useState(0)
  const state = useRef({playing: false, app: null})

  useEffect(() => {
    const app = new PIXI.Application({
      backgroundAlpha: 0,
      // preserveDrawingBuffer: true,
      // clearBeforeRender: false,
    })
    state.current.app = app
    ref.current.appendChild(app.view)
    const spriteContainer = new PIXI.ParticleContainer(20000, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true,
    })
    app.stage.addChild(spriteContainer)
    sim.connector.createSprite = (particle) => {
      const sprite = PIXI.Sprite.from('/arrow_32.png')
      sprite.anchor.set(0.5)
      const scale = app.screen.width * 0.96
      const padding = app.screen.width * 0.02
      sprite.x = particle.position[0] * scale + padding
      sprite.y = particle.position[1] * scale + padding
      sprite.width = particle.radius * 2 * scale + padding
      sprite.height = particle.radius * 2 * scale + padding
      sprite.rotation = Math.atan2(particle.velocity[1], particle.velocity[0])
      spriteContainer.addChild(sprite)
      return sprite
    }
    sim.connector.destroySprite = (sprite) => {
      sprite.destroy()
      return true
    }
    sim.connector.updateSprite = (sprite, particle) => {
      const scale = app.screen.width * 0.96
      const padding = app.screen.width * 0.02
      sprite.x = particle.position[0] * scale + padding
      sprite.y = particle.position[1] * scale + padding
      sprite.width = particle.radius * 2 * scale
      sprite.height = particle.radius * 2 * scale
      sprite.rotation = Math.atan2(particle.velocity[1], particle.velocity[0])
      return true
    }

    const resizeWindow = () => {
      const windowSize = Math.min(window.innerWidth, window.innerHeight) - 50
      app.renderer.resize(windowSize, windowSize)
      sim.particles.forEach((particle) => {
        sim.connector.updateSprite(particle.sprite, particle)
      })
    }
    resizeWindow()
    window.addEventListener('resize', resizeWindow)

    const ticker = app.ticker.add(() => {
      sim.cycle(state.current)
    })

    return () => {
      ticker.stop()
      app.destroy(true)
      window.removeEventListener('resize', resizeWindow)
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
          {/* for outline (TODO): https://stackoverflow.com/questions/9391945/outline-a-group-of-touching-shapes-with-svg */}
          <BoundaryViz
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
            }}
            boundaryCollisionDetector={sim.boundaryCollisionDetector}
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
            sim.cycle({...state.current, playing: true})
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
            sim.normaliseParticles()
          }}
          style={{
            fontSize: '2rem',
            marginLeft: 10,
          }}
        >
          Reset
        </button>
        <br />
        <UserInterface
          playing={state.current.playing}
          onChange={(params) => (sim.params = params)}
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
