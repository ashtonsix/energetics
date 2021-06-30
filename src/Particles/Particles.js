import * as PIXI from 'pixi.js'
import Quadtree from '@timohausmann/quadtree-js'
import {useDebouncedCallback} from 'use-debounce'
import {useEffect, useRef, useState} from 'react'
import Vector2 from './Vector2'

// adapted from https://github.com/henshmi/Classic-8-Ball-Pool/blob/ede58b77bb7d5b9d3a5d7ccf4c93df4e8437d3b9/src/game-objects/game-world.ts#L160
function collide(p1, p2, particleSpeed) {
  const pr2 = p1.r + p2.r

  let p1p = new Vector2(p1.x, p1.y)
  let p1v = new Vector2(p1.vx, p1.vy)
  let p2p = new Vector2(p2.x, p2.y)
  let p2v = new Vector2(p2.vx, p2.vy)

  // Find a normal vector
  const n = p1p.subtract(p2p)

  // Find distance
  const dist = n.length

  if (dist > pr2) {
    return false
  }

  // Find minimum translation distance
  const mtd = n.mult((pr2 - dist) / dist)

  // Push-pull particles apart
  p1p = p1p.add(mtd.mult(0.5))
  p2p = p2p.subtract(mtd.mult(0.5))
  p1.x = p1p.x
  p1.y = p1p.y
  p2.x = p2p.x
  p2.y = p2p.y

  // Find unit normal vector
  const un = n.mult(1 / n.length)

  // Find unit tangent vector
  const ut = new Vector2(-un.y, un.x)

  // Project velocities onto the unit normal and unit tangent vectors
  const v1n = un.dot(p1v)
  const v1t = ut.dot(p1v)
  const v2n = un.dot(p2v)
  const v2t = ut.dot(p2v)

  // Convert the scalar normal and tangential velocities into vectors
  const v1nTag = un.mult(v2n)
  const v1tTag = ut.mult(v1t)
  const v2nTag = un.mult(v1n)
  const v2tTag = ut.mult(v2t)

  // Update velocities
  p1v = v1nTag.add(v1tTag)
  p2v = v2nTag.add(v2tTag)

  // Reset velocity magnitude
  p1v.multBy(particleSpeed / p1v.length)
  p2v.multBy(particleSpeed / p2v.length)

  p1.vx = p1v.x
  p1.vy = p1v.y
  p2.vx = p2v.x
  p2.vy = p2v.y
}

function wallCollide(p, angle, particleSpeed) {
  const p2 = {
    r: p.r,
    x: p.x + Math.cos(angle) * p.r * 2,
    y: p.y + Math.sin(angle) * p.r * 2,
    vx: 0,
    vy: 0,
  }
  return collide(p, p2, particleSpeed)
}

const Input = ({label, debounce, onChange, defaultValue}) => {
  const handleOnChange = useDebouncedCallback(onChange, debounce)
  return (
    <label style={{display: 'block', fontSize: 64}}>
      <span>{label}</span>
      <br />
      <input
        style={{fontSize: 64, width: 300}}
        defaultValue={defaultValue}
        onChange={(e) => handleOnChange(e.target.value)}
      ></input>
    </label>
  )
}

const Particles = () => {
  const ref = useRef()
  const [ticker, setTicker] = useState(null)
  const [playing, setPlaying] = useState(false)
  const params = useRef({
    particleCount: 1000,
    particleSizeMin: 10,
    particleSizeMax: 12,
    particleSpeed: 3,
  })

  useEffect(() => {
    const app = new PIXI.Application()
    ref.current.appendChild(app.view)

    const resizeWindow = () => {
      const windowSize = Math.min(window.innerWidth, window.innerHeight) - 50
      app.renderer.resize(windowSize, windowSize)
    }
    resizeWindow()
    window.addEventListener('resize', resizeWindow)

    let particles = []
    const quadtree = new Quadtree({
      x: 0,
      y: 0,
      width: app.screen.width,
      height: app.screen.height,
    })

    const spriteContainer = new PIXI.ParticleContainer(5000, {
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
      if (particles.length > $.particleCount) {
        const toRemove = particles.length - $.particleCount
        for (let i = 0; i < toRemove; i++) particles[i].destroy()
        particles = particles.slice(toRemove)
      }
      if (particles.length < $.particleCount) {
        const toAdd = $.particleCount - particles.length
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

      quadtree.clear()
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

        quadtree.insert(p)
      }
      for (let i = 0; i < particles.length; i++) {
        let particle = particles[i]

        let candidates = quadtree.retrieve({
          x: particle.x - particle.r,
          y: particle.y - particle.r,
          width: particle.r * 2,
          height: particle.r * 2,
        })

        for (let k = 0; k < candidates.length; k++) {
          let candidate = candidates[k]
          if (particle === candidate) continue
          collide(particle, candidate, Math.max($.particleSpeed, 0.1))
        }
      }
    })
    ticker.stop()
    ticker.update()
    setTimeout(() => ticker.update(), 64)

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
            ticker.update()
          }}
        />
        <Input
          label="Particle Size (min)"
          debounce={500}
          defaultValue={params.current.particleSizeMin}
          onChange={(value) => {
            params.current.particleSizeMin = parseFloat(value) || 0
            ticker.update()
          }}
        />
        <Input
          label="Particle Size (max)"
          debounce={500}
          defaultValue={params.current.particleSizeMax}
          onChange={(value) => {
            params.current.particleSizeMax = parseFloat(value) || 0
            ticker.update()
          }}
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
      </div>
    </div>
  )
}

export default Particles
