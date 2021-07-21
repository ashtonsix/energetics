import {useDebouncedCallback} from 'use-debounce'
import React, {useEffect, useRef, useState} from 'react'
import useInterval from '../useInterval'
import boundaryGenerators from './boundaryGenerators'
import vec from './vec'

const Input = React.forwardRef(
  (
    {label, note, debounce, onChange, onChangeImmediate, onBlur, ...props},
    ref
  ) => {
    const handleOnChange = useDebouncedCallback(onChange, debounce)
    return (
      <label style={{display: 'block', width: 335, padding: '3px 0'}}>
        {!!label && <span style={{fontSize: 27}}>{label}</span>}
        {!!label && <br />}
        {!!note && <span style={{fontSize: 20}}>{note}</span>}
        {!!note && <br />}
        <input
          ref={ref}
          style={{fontSize: 27, width: 270}}
          onChange={(e) => {
            if (onChangeImmediate) onChangeImmediate(e.target.value)
            handleOnChange(e.target.value)
          }}
          onBlur={(e) => {
            handleOnChange.flush()
            if (onBlur) onBlur(e)
          }}
          {...props}
        ></input>
      </label>
    )
  }
)

const Select = React.forwardRef(
  ({label, note, onChange, options, ...props}, ref) => {
    return (
      <label style={{display: 'block', width: 335, padding: '3px 0'}}>
        <span style={{fontSize: 27}}>{label}</span>
        <br />
        {!!note && <span style={{fontSize: 20}}>{note}</span>}
        {!!note && <br />}
        <select
          ref={ref}
          style={{fontSize: 27, verticalAlign: 'top'}}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        >
          {options.map(({label, value}) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    )
  }
)

const clamp = (value, min, max) => {
  return Math.min(Math.max(+value || 0, min), max)
}

const generateStats = (stats, rollingMeanWindow) => {
  let data = stats.data.slice(-rollingMeanWindow)
  let empty = new Array(stats.histogramBuckets).fill(0)
  let particleCollisionCount = 0
  let boundaryCollisionCount = 0
  let distanceToBoundary = empty.slice()
  let orientationToBoundary = empty.slice()
  let orientationOfCollidingParticles = empty.slice()
  // prettier-ignore
  for (let i = 0; i < data.length; i++) {
    particleCollisionCount += data[i].particleCollisionCount / data.length
    boundaryCollisionCount += data[i].boundaryCollisionCount / data.length
    for (let j = 0; j < empty.length; j++) {
      distanceToBoundary[j] += data[i].distanceToBoundary[j]
      orientationToBoundary[j] += data[i].orientationToBoundary[j]
      orientationOfCollidingParticles[j] += data[i].orientationOfCollidingParticles[j]
    }
  }

  // prettier-ignore
  const collisions = +(particleCollisionCount + boundaryCollisionCount).toFixed(0)
  let d2bMax = Math.max(...distanceToBoundary) || 1
  let o2bMax = Math.max(...orientationToBoundary) || 1
  let o2pMax = Math.max(...orientationOfCollidingParticles) || 1
  return `
    <span>Collisions during last step: ${collisions.toLocaleString()}</span>
    <br />
    <span>Distance of particles from boundary:</span>
    <br />
    <br />
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      style="display: block; width: 300px; height: 80px;"
    >
      ${[]
        .concat(
          ...distanceToBoundary.map((height, i) => {
            let h = (height * 95) / d2bMax + 5
            let w = 100 / distanceToBoundary.length
            return `<rect
            x="${i * w}"
            y="${100 - h}"
            height="${h}"
            width="${w}"
            fill="grey"
          />`
          })
        )
        .join('')}
    </svg>
    <span>Orientation of particles relative to boundary:</span>
    <br />
    <br />
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      style="display: block; width: 300px; height: 80px;"
    >
      ${[]
        .concat(
          ...orientationToBoundary.map((height, i) => {
            let h = (height * 95) / o2bMax + 5
            let w = 100 / orientationToBoundary.length
            return `<rect
            x="${i * w}"
            y="${100 - h}"
            height="${h}"
            width="${w}"
            fill="grey"
          />`
          })
        )
        .join('')}
    </svg>
    <br />
    <span>Relative orientation of colliding particles:</span>
    <br />
    <br />
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      style="display: block; width: 300px; height: 80px;"
    >
      ${[]
        .concat(
          ...orientationOfCollidingParticles.map((height, i) => {
            let h = (height * 95) / o2pMax + 5
            let w = 100 / orientationOfCollidingParticles.length
            return `<rect
            x="${i * w}"
            y="${100 - h}"
            height="${h}"
            width="${w}"
            fill="grey"
          />`
          })
        )
        .join('')}
    </svg>
  `
}

const UserControls = ({
  playing,
  onChange,
  defaultValue,
  getSuggestedRadius,
  sim,
}) => {
  const [, setSuggestedRadius] = useState(
    getSuggestedRadius(defaultValue.particleCount)
  )
  const [, setNonce] = useState(0)
  const params = useRef({
    ...defaultValue,
    spawnRate: 0,
    _spawnArea: defaultValue.spawnArea || {
      x: 0.5,
      y: 0.5,
      radius: 0.175,
      rotation: Math.PI * 0.15,
      rotationSpread: Math.PI * 0.25,
    },
    _boundary: {},
    _particleSizeDistributionTouched: false,
    spawnAdjustsRadius: true,
    _statsPlaying: true,
    _rollingMeanWindow: 1,
  })
  const inputs = useRef({
    particleCount: {},
    particleRadiusMin: {},
    particleRadiusMax: {},
    mass: {},
    particleVelocityConstant: {},
  })
  const [initialStats] = useState(
    generateStats(sim.stats, params.current._rollingMeanWindow)
  )
  const stats = useRef(null)
  const stepCounter = useRef(null)
  const scale = 1000
  const suggestedRadius = getSuggestedRadius(params.current.particleCount)

  useEffect(() => {
    sim.endCycleHook.UserControls = () => {
      if (params.current._statsPlaying) {
        stepCounter.current.innerHTML = sim.stats.step.toLocaleString()
        stats.current.innerHTML = generateStats(
          sim.stats,
          params.current._rollingMeanWindow
        )
      }
    }
    return () => {
      delete sim.endCycleHook.UserControls
    }
  }, [sim.endCycleHook, sim.stats])

  useInterval(() => {
    const $p = params.current
    const $i = inputs.current
    const typing = [
      $i.particleCount,
      $i.particleRadiusMin,
      $i.particleRadiusMax,
    ].includes(document.activeElement)

    if (!playing || !$p.spawnRate || typing) return

    const old_r = getSuggestedRadius($p.particleCount)

    $p.particleCount = Math.min($p.particleCount + $p.spawnRate / 10, 20000)
    $i.particleCount.value = $p.particleCount.toFixed(0)

    const r = getSuggestedRadius($p.particleCount)
    setSuggestedRadius(r)
    if (params.current.spawnAdjustsRadius) {
      $p.particleRadiusMin = clamp(
        r * ($p.particleRadiusMin / old_r),
        2 / scale,
        100 / scale
      )
      $p.particleRadiusMax = clamp(
        r * ($p.particleRadiusMax / old_r),
        2 / scale,
        100 / scale
      )

      $i.particleRadiusMin.value = ($p.particleRadiusMin * scale).toFixed(2)
      $i.particleRadiusMax.value = ($p.particleRadiusMax * scale).toFixed(2)
    }
    submitChange()
  }, 100)

  const submitChange = () => {
    onChange(params.current)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        maxHeight: 'calc(min(100vh, 100vw) - 100px)',
      }}
    >
      <Input
        label="Particle Count"
        debounce={500}
        key="particleCount"
        defaultValue={params.current.particleCount.toFixed(0)}
        onChange={(value) => {
          params.current.particleCount = clamp(value, 0, 20000)
          setSuggestedRadius(getSuggestedRadius(params.current.particleCount))
          submitChange()
        }}
        onBlur={(e) => {
          e.target.value = params.current.particleCount.toFixed(0)
        }}
        ref={(input) => (inputs.current.particleCount = input)}
      />
      <div>
        <Input
          label="Particle Radius"
          note={
            'Min, Suggested = ' +
            clamp(suggestedRadius * scale * 0.95, 2, 200).toFixed(2)
          }
          debounce={500}
          key="particleRadiusMin"
          defaultValue={(params.current.particleRadiusMin * scale).toFixed(2)}
          onChange={(value) => {
            params.current.particleRadiusMin = clamp(value, 2, 200) / scale
            submitChange()
            setNonce(Math.random())
          }}
          onBlur={(e) => {
            e.target.value = (params.current.particleRadiusMin * scale).toFixed(
              2
            )
          }}
          ref={(input) => (inputs.current.particleRadiusMin = input)}
        />
        <Input
          note={
            'Max, Suggested = ' +
            clamp(suggestedRadius * scale * 1.05, 2, 200).toFixed(2)
          }
          debounce={500}
          key="particleRadiusMax"
          defaultValue={(params.current.particleRadiusMax * scale).toFixed(2)}
          onChange={(value) => {
            params.current.particleRadiusMax = clamp(value, 2, 200) / scale
            submitChange()
            setNonce(Math.random())
          }}
          onBlur={(e) => {
            e.target.value = (params.current.particleRadiusMax * scale).toFixed(
              2
            )
          }}
          ref={(input) => (inputs.current.particleRadiusMax = input)}
        />
        {(params.current.particleRadiusMin * 1.5 <
          params.current.particleRadiusMax ||
          params.current._particleSizeDistributionTouched) && (
          <>
            <span style={{fontSize: 20}}>Distribution</span>
            <br />
            <input
              type="range"
              style={{display: 'block', width: 270}}
              min={-5}
              max={5}
              step={1}
              key="particleSizeDistribution"
              defaultValue={params.current.particleSizeDistribution}
              onChange={(e) => {
                params.current._particleSizeDistributionTouched = true
                params.current.particleSizeDistribution = +e.target.value
                submitChange()
              }}
            />
          </>
        )}
      </div>
      <Select
        label="Particle Mass"
        key="mass"
        defaultValue={params.current.mass}
        onChange={(value) => {
          params.current.mass = value
          if (params.current.mass === 'area') {
            params.current.particleVelocityConstant = false
            inputs.current.particleVelocityConstant.value = 'false'
          }
          submitChange()
        }}
        options={[
          {value: 'constant', label: 'Constant'},
          {value: 'area', label: '∝ Area'},
        ]}
        ref={(input) => (inputs.current.mass = input)}
      />
      <Select
        label="Particle Velocity"
        key="particleVelocityConstant"
        defaultValue={
          params.current.particleVelocityConstant ? 'true' : 'false'
        }
        onChange={(value) => {
          params.current.particleVelocityConstant = JSON.parse(value)
          if (params.current.particleVelocityConstant) {
            params.current.mass = 'constant'
            inputs.current.mass.value = 'constant'
          }
          submitChange()
        }}
        options={[
          {value: 'true', label: 'Constant'},
          {value: 'false', label: 'Variable'},
        ]}
        ref={(input) => (inputs.current.particleVelocityConstant = input)}
      />
      <Input
        label="Simulation Speed"
        note="Decrease for accurate physics"
        debounce={500}
        key="simulationSpeed"
        defaultValue={(params.current.simulationSpeed * scale).toFixed(2)}
        onChange={(value) => {
          params.current.simulationSpeed = clamp(value, 0.1, 10) / scale
          submitChange()
        }}
        onBlur={(e) => {
          e.target.value = (params.current.simulationSpeed * scale).toFixed(2)
        }}
      />
      <Select
        label="Particle Collisions"
        key="particleCollisions"
        defaultValue={params.current.particleCollisions ? 'true' : 'false'}
        onChange={(value) => {
          params.current.particleCollisions = JSON.parse(value)
          submitChange()
          setNonce(Math.random())
        }}
        options={[
          {value: 'true', label: 'Enabled'},
          {value: 'false', label: 'Disabled'},
        ]}
      />
      {params.current.particleCollisions && (
        <div>
          <Select
            label="Particle Elasticity (%)"
            key="particleElasticity.select"
            defaultValue={
              params.current.particleElasticity === 1
                ? 'elastic'
                : params.current.particleElasticity < 1
                ? 'inelastic'
                : 'superelastic'
            }
            onChange={(value) => {
              let $p = params.current
              let currentValue =
                $p.particleElasticity === 1
                  ? 'elastic'
                  : $p.particleElasticity < 1
                  ? 'inelastic'
                  : 'superelastic'
              if (value === currentValue) return
              if (value === 'inelastic') $p.particleElasticity = 0.9
              if (value === 'elastic') $p.particleElasticity = 1
              if (value === 'superelastic') $p.particleElasticity = 1.1
              inputs.current.particleElasticityInput.value = (
                $p.particleElasticity * 100
              ).toFixed(2)
              submitChange()
            }}
            options={[
              {value: 'inelastic', label: 'Inelastic'},
              {value: 'elastic', label: 'Elastic'},
              {value: 'superelastic', label: 'Superelastic'},
            ]}
            ref={(input) => (inputs.current.particleElasticitySelect = input)}
          />
          <Input
            debounce={500}
            key="particleElasticity.input"
            defaultValue={(params.current.particleElasticity * 100).toFixed(2)}
            onChangeImmediate={(value) => {
              value = clamp(value, 0, 200) / 100
              inputs.current.particleElasticitySelect.value =
                value === 1
                  ? 'elastic'
                  : value < 1
                  ? 'inelastic'
                  : 'superelastic'
            }}
            onChange={(value) => {
              params.current.particleElasticity = clamp(value, 0, 200) / 100
              inputs.current.particleElasticitySelect.value =
                params.current.particleElasticity === 1
                  ? 'elastic'
                  : params.current.particleElasticity < 1
                  ? 'inelastic'
                  : 'superelastic'
              submitChange()
            }}
            onBlur={(e) => {
              e.target.value = (
                params.current.particleElasticity * 100
              ).toFixed(2)
            }}
            ref={(input) => (inputs.current.particleElasticityInput = input)}
          />
        </div>
      )}
      <Select
        label="Boundary Elasticity"
        key="boundaryElasticity"
        defaultValue={params.current.boundaryElasticity ? 'true' : 'false'}
        onChange={(value) => {
          params.current.boundaryElasticity = JSON.parse(value)
          submitChange()
        }}
        options={[
          {value: 'true', label: 'Elastic'},
          {value: 'false', label: 'Inelastic'},
        ]}
      />
      <div>
        <Select
          label="Boundary Shape"
          key="boundary"
          defaultValue={params.current.boundary.name}
          onChange={(value) => {
            params.current._boundary[params.current.boundary.name] =
              params.current.boundary.params
            const boundary = {
              name: value,
              params:
                params.current._boundary[value] ||
                boundaryGenerators[value].params.map(
                  ({defaultValue}) => defaultValue
                ),
            }
            params.current.boundary = boundary
            submitChange()
          }}
          options={[
            {value: 'circleSquare', label: 'Circle / Square'},
            {value: 'rectanglePill', label: 'Rectangle / Pill'},
            {value: 'starHexagon', label: 'Star / Hexagon'},
            {value: 'wave', label: 'Wave'},
            {value: 'doughnut', label: 'Doughnut'},
            {value: 'mixedShapes', label: 'Mixed Shapes'},
            {value: 'thermodynamicsBuster', label: 'Thermo Buster'},
          ]}
        />
        {boundaryGenerators[params.current.boundary.name].note && (
          <span style={{fontSize: 16, display: 'block', maxWidth: '350px'}}>
            {boundaryGenerators[params.current.boundary.name].note}
          </span>
        )}
        {boundaryGenerators[params.current.boundary.name].params.map(
          ({min, max, step, defaultValue}, i) => (
            <input
              key={params.current.boundary.name + '.' + i}
              type="range"
              style={{display: 'block', width: 270}}
              min={min}
              max={max}
              step={step}
              defaultValue={
                params.current._boundary[params.current.boundary.name]?.[i] ||
                defaultValue
              }
              onChange={(e) => {
                const boundary = {...params.current.boundary}
                boundary.params = [...boundary.params]
                boundary.params[i] = +e.target.value
                params.current.boundary = boundary
                submitChange()
              }}
            />
          )
        )}
      </div>
      <Input
        label="Spawn Rate"
        debounce={500}
        key="spawnRate"
        defaultValue={params.current.spawnRate.toFixed(2)}
        onChange={(value) => {
          params.current.spawnRate = clamp(value, -1000, 1000)
          submitChange()
        }}
        onBlur={(e) => {
          e.target.value = params.current.spawnRate.toFixed(2)
        }}
      />
      <Select
        label="Spawn Adjusts Radius"
        key="spawnAdjustsRadius"
        defaultValue={params.current.spawnAdjustsRadius ? 'true' : 'false'}
        onChange={(value) => {
          params.current.spawnAdjustsRadius = JSON.parse(value)
          submitChange()
        }}
        options={[
          {value: 'true', label: 'Enabled'},
          {value: 'false', label: 'Disabled'},
        ]}
      />
      <div>
        <Select
          label="Spawn Area"
          key="spawnArea"
          defaultValue={params.current.spawnArea ? 'true' : 'false'}
          onChange={(value) => {
            let enabled = JSON.parse(value)
            if (enabled) {
              params.current.spawnArea = params.current._spawnArea
            } else {
              params.current._spawnArea = params.current.spawnArea
              params.current.spawnArea = null
            }
            submitChange()
            setNonce(Math.random())
          }}
          options={[
            {value: 'true', label: 'Enabled'},
            {value: 'false', label: 'Disabled'},
          ]}
        />
        {!!params.current.spawnArea && (
          <div>
            <input
              type="range"
              style={{display: 'block', width: 270}}
              min={0}
              max={1}
              step={0.02}
              key="spawnArea.x"
              defaultValue={params.current.spawnArea?.x}
              onChange={(e) => {
                const $p = params.current
                if (!$p.spawnArea) return
                $p.spawnArea = {...$p.spawnArea, x: +e.target.value}
                submitChange()
              }}
            />
            <input
              type="range"
              style={{display: 'block', width: 270}}
              min={0}
              max={1}
              step={0.02}
              key="spawnArea.y"
              defaultValue={params.current.spawnArea?.y}
              onChange={(e) => {
                const $p = params.current
                if (!$p.spawnArea) return
                $p.spawnArea = {...$p.spawnArea, y: +e.target.value}
                submitChange()
              }}
            />
            <input
              type="range"
              style={{display: 'block', width: 270}}
              min={0.02}
              max={0.8}
              step={0.02}
              key="spawnArea.radius"
              defaultValue={params.current.spawnArea?.radius}
              onChange={(e) => {
                const $p = params.current
                if (!$p.spawnArea) return
                $p.spawnArea = {...$p.spawnArea, radius: +e.target.value}
                submitChange()
              }}
            />
            <input
              type="range"
              style={{display: 'block', width: 270}}
              min={0}
              max={Math.PI * 2 + 0.000001}
              step={Math.PI / 20}
              key="spawnArea.rotation"
              defaultValue={params.current.spawnArea?.rotation}
              onChange={(e) => {
                const $p = params.current
                if (!$p.spawnArea) return
                $p.spawnArea = {...$p.spawnArea, rotation: +e.target.value}
                submitChange()
              }}
            />
            <input
              type="range"
              style={{display: 'block', width: 270}}
              min={0}
              max={Math.PI + 0.000001}
              step={Math.PI / 40}
              key="spawnArea.rotationSpread"
              defaultValue={params.current.spawnArea?.rotationSpread}
              onChange={(e) => {
                const $p = params.current
                if (!$p.spawnArea) return
                $p.spawnArea = {
                  ...$p.spawnArea,
                  rotationSpread: +e.target.value,
                }
                submitChange()
              }}
            />
          </div>
        )}
      </div>
      <Input
        label="Tracer Particles (%)"
        debounce={500}
        key="redFraction"
        defaultValue={(params.current.redFraction * 100).toFixed(2)}
        onChange={(value) => {
          params.current.redFraction = clamp(value, 0, 100) / 100
          submitChange()
        }}
        onBlur={(e) => {
          e.target.value = (params.current.redFraction * 100).toFixed(2)
        }}
      />
      <div>
        <Select
          label={
            params.current.trailDisplay !== 'disabled'
              ? 'Particle Trail (length)'
              : 'Particle Trail'
          }
          note={
            params.current.trailLength >= 1000 && 'The trail will never fade'
          }
          key="trailDisplay"
          defaultValue={params.current.trailDisplay}
          onChange={(value) => {
            params.current.trailDisplay = value
            submitChange()
            setNonce(Math.random())
          }}
          options={[
            {value: 'disabled', label: 'Disabled'},
            {value: 'enabled', label: 'Enabled'},
            {value: 'trailOnly', label: 'Show Trail Only'},
          ]}
        />
        {params.current.trailDisplay !== 'disabled' && (
          <Input
            debounce={500}
            key="trailLength"
            defaultValue={params.current.trailLength.toFixed(2)}
            onChange={(value) => {
              params.current.trailLength = clamp(value, 0, 1000)
              submitChange()
              setNonce(Math.random())
            }}
            onBlur={(e) => {
              e.target.value = params.current.trailLength.toFixed(2)
            }}
          />
        )}
      </div>
      <div>
        <span style={{fontSize: 27}}>Actions</span>
        <br />
        <button
          onClick={() => {
            sim.particles.forEach((p) => vec.$mult(p.velocity, -1))
            submitChange()
          }}
          style={{fontSize: 21}}
        >
          Reverse All Velocities
        </button>
        <span style={{display: 'block', paddingTop: '5px'}} />
        <button
          onClick={() => {
            sim.particles.forEach((p) => {
              let rotation = Math.random() * Math.PI * 2
              p.velocity = vec.setLength(
                [Math.cos(rotation), Math.sin(rotation)],
                vec.length(p.velocity)
              )
            })
            submitChange()
          }}
          style={{fontSize: 21}}
        >
          Randomise All Velocities
        </button>
      </div>
      <div style={{maxWidth: 340}}>
        <span style={{fontSize: 27}}>Stats</span>
        {playing && (
          <button
            onClick={() => {
              params.current._statsPlaying = !params.current._statsPlaying
              setNonce(Math.random())
            }}
            style={{
              fontSize: '1.5rem',
              background: 'none',
              border: 'none',
              outline: 'none',
              verticalAlign: 'middle',
              lineHeight: '1.5',
              position: 'absolute',
            }}
          >
            {params.current._statsPlaying ? '⏸' : '▶️'}
          </button>
        )}
        <div>
          Step:{' '}
          <span
            ref={stepCounter}
            dangerouslySetInnerHTML={{__html: '0'}}
          ></span>
        </div>
        <div>
          Rolling mean window:{' '}
          <input
            defaultValue={params.current._rollingMeanWindow.toFixed(0)}
            style={{width: 40}}
            onChange={(e) => {
              let value = +clamp(e.target.value, 1, 100).toFixed(0)
              params.current._rollingMeanWindow = value
              stepCounter.current.innerHTML = sim.stats.step.toLocaleString()
              stats.current.innerHTML = generateStats(
                sim.stats,
                params.current._rollingMeanWindow
              )
            }}
            onBlur={(e) => {
              e.target.value = params.current._rollingMeanWindow.toFixed(0)
            }}
          ></input>
        </div>
        <div ref={stats} dangerouslySetInnerHTML={{__html: initialStats}}></div>
      </div>
    </div>
  )
}

export default UserControls
