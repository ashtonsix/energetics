import {
  ParticleCollisionDetector,
  BoundaryCollisionDetector,
} from './CollisionDetectors'
import vec from './vec'
import boundaryGenerators from './boundaryGenerators'

export const collide = (p0, p1, elasticity, constantVelocity) => {
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
    vec.$add(p.position, vec.mult(ut, -pTangentMag))
  }
  if (pNormalMag > p.radius) return false

  vec.$add(p.position, vec.mult(un, p.radius - pNormalMag + 0.000001))

  if (elastic) {
    let projected = vec.dot(un, p.velocity) * 2
    if (projected < 0) vec.$sub(p.velocity, vec.mult(un, projected))
  } else {
    const v = Math.sign(vec.dot(ut, p.velocity) || 1) * vec.length(p.velocity)
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
    } else {
      stillCollides = null
    }
  }

  return [stillCollides]
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

export default class Simulation {
  params = {
    softwareVersion: 0,
    particleCount: 500,
    particleRadiusMin: 0,
    particleRadiusMax: 0,
    particleSizeDistribution: 1,
    simulationSpeed: 3 / 1000,
    particleVelocityConstant: false,
    particleCollisions: true,
    particleElasticity: 0.9,
    boundaryElasticity: true,
    boundary: {
      name: 'circleSquare',
      params: boundaryGenerators.circleSquare.params.map(
        ({defaultValue}) => defaultValue
      ),
    },
    spawnArea: null, // null OR {x: 0.5, y: 0.5, radius: 0.03, rotation: Math.PI * 0, rotationSpread: Math.PI * 0.15}
    tracerFraction: 10 / 100,
    trailDisplay: 'disabled', // disabled, enabled, or trailOnly
    trailLength: 30,
    trailForTracersOnly: false,
    mass: 'constant',
  }
  constructor() {
    this.updateBoundary(this.params.boundary)
    this.updateBoundaryCollisionDetector()
    this.params.particleRadiusMin = clamp(
      this.getSuggestedRadius() * 0.65,
      0.002,
      0.2
    )
    this.params.particleRadiusMax = clamp(
      this.getSuggestedRadius() * 0.75,
      0.002,
      0.2
    )
    this.particleCollisionDetector = new ParticleCollisionDetector(
      this.params.particleRadiusMax * 2
    )
  }
  recording = null
  particles = []
  boundary = []
  stats = {
    step: 0,
    data: [],
    dataRetention: 100,
    histogramBuckets: 300,
  }
  boundaryCollisionDetector = null
  connector = {
    onParticleAdded(particle) {},
    onParticleRemoved(particle) {},
    readRotationFast(particle) {
      return Math.atan2(particle.velocity[1], particle.velocity[0])
    },
    draw() {},
  }
  updateHook = {}
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
    particle.uid = Math.random().toString(36).slice(2, 13).padEnd(11, '0')

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
    particle.tracer = Math.random() < this.params.tracerFraction ? true : false
    this.connector.onParticleAdded(particle)
    this.particles.push(particle)
    return particle
  }
  destroyParticle(r = null) {
    if (r === null) r = Math.floor(Math.random() * this.particles.length)
    const p = this.particles.splice(r, 1)[0]
    this.connector.onParticleRemoved(p)
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
      let r
      if (range < e / 2) r = min + Math.random() * desiredRange
      else r = ($P[i].radius - min) * (desiredRange / range) + desiredMin
      $P[i].radius = r
      $P[i].mass = $p.mass === 'constant' ? 1 : r ** 2
      if ($p.particleVelocityConstant) {
        vec.$setLength($P[i].velocity, 1)
      }
    }
    if ($p.particleVelocityConstant) return

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
    let durationStart = performance.now()
    this.normaliseParticles()
    if (playing) {
      // prettier-ignore
      let s = {
        duration: 0,
        particleCollisionCount: 0,
        boundaryCollisionCount: 0,
        distanceToBoundary: new Array(this.stats.histogramBuckets).fill(0),
        orientationToBoundary: new Array(this.stats.histogramBuckets).fill(0),
        orientationOfCollidingParticles: new Array(this.stats.histogramBuckets).fill(0)
      }
      if (this.recording?.options?.includeCollisions) {
        this.recording.collisions = []
      }
      let collisionRecorder = this.recording?.collisions
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
          let r
          if (collisionRecorder) {
            r = {
              uid: p.uid,
              position: p.position.slice(),
              velocity: p.velocity.slice(),
              radius: p.radius,
            }
          }
          let b = collideBoundary(
            p,
            boundary,
            boundaryElasticity,
            this.boundaryCollisionDetector
          )
          s.boundaryCollisionCount += !!b

          if (collisionRecorder && b) {
            this.recording.collisions.push({
              particle0: r,
              particle1: null,
              boundary0: boundary,
              boundary1: b[0] || null,
            })
          }
        }
      }

      let o2p = s.orientationOfCollidingParticles
      if (particleCollisions) {
        const particleCollisionDetector = this.particleCollisionDetector
        particleCollisionDetector.reset(particleRadiusMax * 2)
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

            const radii = p.radius + candidate.radius
            const normal = vec.sub(p.position, candidate.position)
            const willCollide = vec.lengthLessThan(normal, radii)

            if (!willCollide) continue

            let a0 = this.connector.readRotationFast(p)
            let a1 = this.connector.readRotationFast(candidate)
            let diff =
              (a0 - a1 + Math.PI * (2 + 1 / o2p.length)) % (Math.PI * 2)
            let j = Math.floor((diff * o2p.length) / (Math.PI * 2))
            o2p[j] += 1
            s.particleCollisionCount += 1

            if (collisionRecorder) {
              this.recording.collisions.push({
                particle0: {
                  uid: p.uid,
                  position: p.position.slice(),
                  velocity: p.velocity.slice(),
                  radius: p.radius,
                },
                particle1: {
                  uid: candidate.uid,
                  position: candidate.position.slice(),
                  velocity: candidate.velocity.slice(),
                  radius: candidate.radius,
                },
                boundary0: null,
                boundary1: null,
              })
            }

            collide(p, candidate, particleElasticity, particleVelocityConstant)
          }
        }
      }
      let maxDistance = this.boundaryCollisionDetector.maxDistance
      let d2b = s.distanceToBoundary
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
        let distance =
          (boundary.distanceEstimate - p.radius * 0.75) /
          (maxDistance - p.radius * 0.75)
        let k = clamp(Math.floor(distance * d2b.length), 0, d2b.length - 1)
        d2b[k] += 1
      }
      s.duration = performance.now() - durationStart
      this.stats.data.push(s)
      if (this.stats.data.length > this.stats.dataRetention) {
        this.stats.data.shift()
      }
    }
    for (const k in this.updateHook) {
      this.updateHook[k]({playing, trigger: 'cycle'})
    }
    return this.connector.draw()
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
    for (const k in this.updateHook) {
      this.updateHook[k]({playing: '???', trigger: 'bcd'})
    }
  }
  updateTracerFraction(tracerFraction) {
    let tracerCount = 0
    for (let i = 0; i < this.particles.length; i++) {
      tracerCount += !!this.particles[i].tracer
    }
    let desiredTracerCount = Math.round(this.particles.length * tracerFraction)
    let discrepancy = desiredTracerCount - tracerCount
    let wrongColor = []
    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i]
      if (p.tracer && discrepancy < 0) wrongColor.push(p)
      if (!p.tracer && discrepancy > 0) wrongColor.push(p)
    }
    shuffle(wrongColor)
    discrepancy = Math.abs(discrepancy)
    for (let i = 0; i < discrepancy; i++) {
      let p = wrongColor[i]
      p.tracer = !p.tracer
      this.connector.onParticleRemoved(p)
      this.connector.onParticleAdded(p)
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
  resetStats() {
    this.stats = {
      step: 0,
      data: [],
      dataRetention: this.stats.dataRetention,
      histogramBuckets: this.stats.histogramBuckets,
    }
  }
}
