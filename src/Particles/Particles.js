import * as PIXI from 'pixi.js'
import {useDebouncedCallback} from 'use-debounce'
import React, {useEffect, useRef, useState} from 'react'
import useInterval from '../useInterval'
import {
  ParticleCollisionDetector,
  BoundaryCollisionDetector,
} from './CollisionDetectors'
import vec from './vec'

function collide(p1, p2, particleSpeed = null, boundary = false) {
  const radii = p1.r + p2.r
  const normal = vec.$sub([p1.x, p1.y], [p2.x, p2.y])
  if (!boundary && !vec.lengthLessThan(normal, radii)) {
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
  p1v = temp
  if (false) {
    vec.$setLength(p1v, particleSpeed)
    vec.$setLength(p2v, particleSpeed)
  } else if (boundary) {
    const l = vec.length([p1.vx, p1.vy]) + vec.length([p2.vx, p2.vy])
    vec.$setLength(p1v, l)
  }

  p1.x = p1p[0]
  p1.y = p1p[1]
  p1.vx = p1v[0]
  p1.vy = p1v[1]
  p2.x = p2p[0]
  p2.y = p2p[1]
  p2.vx = p2v[0]
  p2.vy = p2v[1]
}

function boundaryCollide(p, angle, particleSpeed) {
  const p2 = {
    r: 0,
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

const curve = (t) => {
  const x = Math.cos(t * Math.PI * 2)
  const y = Math.sin(t * Math.PI * 2)
  return [Math.abs(x) ** 1 * Math.sign(x), Math.abs(y) ** 1 * Math.sign(y)]
}

const bc = new BoundaryCollisionDetector().addCurve(curve, true).finemesh
const bc_data = []
for (let i = 0; i < bc.data.length; i += 6) {
  let [x, y, distance, nx, ny, type] = bc.data.slice(i, i + 6)
  let xi = ((i / 6) % bc.length) / bc.length
  let yi = Math.floor(i / 6 / bc.length) / bc.length
  if (distance !== -1 && Math.random())
    bc_data.push({
      xi,
      yi,
      x,
      y,
      distance,
      nx,
      ny,
      type,
    })
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
    if (Date.now() % 1000 < 100) setSuggestedSize(sz)
  }, 100)

  useEffect(() => {
    const app = new PIXI.Application({backgroundAlpha: 0})
    ref.current.appendChild(app.view)

    const resizeWindow = () => {
      const windowSize = Math.min(window.innerWidth, window.innerHeight) - 50
      app.renderer.resize(windowSize, windowSize)
      setSuggestedSize(getSuggestedSize(params.current.particleCount))
    }
    resizeWindow()
    window.addEventListener('resize', resizeWindow)

    let particles = []
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

      const particleGrid = new ParticleCollisionDetector(
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
          boundaryCollide(p, Math.atan2(p.y - cy, p.x - cx), $.particleSpeed)
        }
        p.rotation = Math.atan2(p.vy, p.vx)

        particleGrid.insert(p, p.x, p.y)
      }
      for (let i = 0; i < particles.length; i++) {
        let particle = particles[i]

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

  let arenaVertices = new Array(1000).fill(null).map((_, i) => curve(i / 1000))
  let minX = arenaVertices[0][0]
  let maxX = arenaVertices[0][0]
  let minY = arenaVertices[0][1]
  let maxY = arenaVertices[0][1]
  for (let i = 0; i < arenaVertices.length; i++) {
    const [x, y] = arenaVertices[i]
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  arenaVertices = arenaVertices.map(([x, y]) => [
    (x - minX) / (maxX - minX),
    (y - minY) / (maxY - minY),
  ])

  return (
    <div style={{display: 'flex', flexWrap: 'wrap'}}>
      <div
        style={{
          padding: 10,
          marginLeft: -10,
          width: '100%',
          maxWidth: 'calc(100vh - 50px)',
        }}
      >
        <div style={{position: 'relative', width: '100%', paddingTop: '100%'}}>
          {/* for outline (TODO): https://stackoverflow.com/questions/9391945/outline-a-group-of-touching-shapes-with-svg */}
          <svg
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
            }}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect fill="#222" width="100" height="100"></rect>
            <polygon
              fill="#000"
              // stroke="#add8e6"
              // strokeWidth={0.1}
              // prettier-ignore
              points={arenaVertices
                .map(([x, y]) => (x * 96 + 2) + ',' + (y * 96 + 2))
                .join(' ')}
            />
            {bc_data.map(({x, y, xi, yi, nx, distance, type}, i) => (
              <>
                {/* <rect
                  key={i}
                  x={xi * 96 + 2}
                  y={yi * 96 + 2}
                  height={sz * 96}
                  width={sz * 96}
                  fill={'lightBlue'}
                  opacity={distance}
                /> */}
                <line
                  x1={x * 96 + 2}
                  y1={y * 96 + 2}
                  x2={xi * 96 + 2 + bc.cellSize * 48}
                  y2={yi * 96 + 2 + bc.cellSize * 48}
                  stroke="lightBlue"
                  strokeWidth={0.02}
                />
              </>
            ))}
            {/* {bc.polygon.map(([x, y], i) => (
              <circle
                key={i}
                cx={x * 96 + 2}
                cy={y * 96 + 2}
                r={0.1}
                fill="green"
              />
            ))} */}
          </svg>
          <div
            ref={ref}
            style={{
              opacity: 0,
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
