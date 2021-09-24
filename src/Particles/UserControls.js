import {useDebouncedCallback} from 'use-debounce'
import React, {useRef, useState} from 'react'
import useInterval from '../useInterval'
import boundaryGenerators from './boundaryGenerators'
import Stats from './Stats'
import vec from './vec'
import csv from './csv'

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
        {!!label && <span style={{fontSize: 27}}>{label}</span>}
        {!!label && <br />}
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

const stitchCSVs = async (cb) => {
  const files = await csv.upload({multiple: true, onStart: cb})

  let result = {
    settings: '',
    state: '',
    collisions: '',
    analysis: '',
  }

  let files2 = []
  for (let {filename, data} of files) {
    let [datatype, step] = filename.replace('.csv', '').split('_')
    if (datatype === 'state') {
      let [settings, state] = data.split('\n\n')
      files2.push({data: settings, datatype: 'settings', step})
      files2.push({data: state, datatype: 'state', step})
    } else {
      files2.push({data, datatype, step})
    }
  }

  files2.sort((a, b) => +a.step - +b.step)

  for (let {datatype, step, data} of files2) {
    if (!data) continue
    data = data.split('\n').filter((l) => l)
    if (data.length <= 1) continue
    if (!result[datatype]) {
      result[datatype] = 'step,' + data[0]
    }
    data =
      '\n' +
      data
        .slice(1)
        .map((line) => step + ',' + line)
        .join('\n')
    result[datatype] += data
  }

  if (result.settings) csv.download(result.settings, 'settings.csv')
  if (result.state) csv.download(result.state, 'state.csv')
  if (result.collisions) csv.download(result.collisions, 'collisions.csv')
  if (result.analysis) csv.download(result.analysis, 'analysis.csv')
}

const UserControls = ({
  playing,
  onChange,
  onAnalyseCurrentState,
  onMakeRecordingStart,
  onMakeRecordingStop,
  defaultValue,
  getSuggestedRadius,
  sim,
}) => {
  const [, setSuggestedRadius] = useState(
    getSuggestedRadius(defaultValue.particleCount)
  )
  const [, setNonce] = useState(0)
  const [superNonce, setSuperNonce] = useState(0)
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
    _uploadStateMessage: null,
    spawnAdjustsRadius: true,
    visualisation: defaultValue.visualisation || {
      name: 'particles',
      particlesMetric: 'totalBits',
      particlesColorIntensity: 3,
      boundaryFeature: 'status',
    },
  })
  const inputs = useRef({
    particleCount: {},
    particleRadiusMin: {},
    particleRadiusMax: {},
    mass: {},
    particleVelocityConstant: {},
  })
  const scale = 1000
  const suggestedRadius = getSuggestedRadius(params.current.particleCount)

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
      key={superNonce}
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
          params.current.simulationSpeed = clamp(value, 0.01, 10) / scale
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
                params.current._boundary[params.current.boundary.name] =
                  params.current.boundary.params
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
                $p._spawnArea = $p.spawnArea
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
                $p._spawnArea = $p.spawnArea
                submitChange()
              }}
            />
            <input
              type="range"
              style={{display: 'block', width: 270}}
              min={0.02}
              max={0.5}
              step={0.02}
              key="spawnArea.radius"
              defaultValue={params.current.spawnArea?.radius}
              onChange={(e) => {
                const $p = params.current
                if (!$p.spawnArea) return
                $p.spawnArea = {...$p.spawnArea, radius: +e.target.value}
                $p._spawnArea = $p.spawnArea
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
                $p._spawnArea = $p.spawnArea
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
                $p._spawnArea = $p.spawnArea
                submitChange()
              }}
            />
          </div>
        )}
      </div>
      <Input
        label="Tracer Particles (%)"
        debounce={500}
        key="tracerFraction"
        defaultValue={(params.current.tracerFraction * 100).toFixed(2)}
        onChange={(value) => {
          params.current.tracerFraction = clamp(value, 0, 100) / 100
          submitChange()
        }}
        onBlur={(e) => {
          e.target.value = (params.current.tracerFraction * 100).toFixed(2)
        }}
      />
      <div>
        <Select
          label={'Particle Trail'}
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
            note={
              <>
                Length
                {params.current.trailLength >= 1000 && ' (will never fade)'}
              </>
            }
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
        {params.current.trailDisplay !== 'disabled' && (
          <Select
            note="For tracers only"
            key="trailForTracersOnly"
            defaultValue={params.current.trailForTracersOnly ? 'true' : 'false'}
            onChange={(value) => {
              params.current.trailForTracersOnly = JSON.parse(value)
              submitChange()
            }}
            options={[
              {value: 'true', label: 'Enabled'},
              {value: 'false', label: 'Disabled'},
            ]}
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
          🔁 Reverse All Velocities
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
          🔀 Randomise All Velocities
        </button>
        <span style={{display: 'block', paddingTop: '5px'}} />
        <button
          onClick={() => {
            csv.upload().then(([{filename, data}]) => {
              try {
                let [settingsCSV, particlesCSV] = data.split('\n\n')
                let newParams = csv.parse(settingsCSV)[0]
                if (typeof newParams.particleRadiusMin !== 'number') {
                  throw new Error('Missing Parameter')
                }
                if (!newParams.spawnArea.radius) {
                  newParams.spawnArea = null
                }
                newParams.visualisation = {
                  ...params.current.visualisation,
                  name: 'particles',
                }
                let newParticles = csv.parse(particlesCSV)
                newParams.tracerFraction =
                  newParticles.reduce((pv, p) => pv + p.tracer, 0) /
                    newParticles.length || 0

                sim.params.particleCount = 0
                sim.normaliseParticles()
                newParticles.forEach((p) => {
                  sim.connector.onParticleAdded(p)
                  sim.particles.push(p)
                })
                Object.assign(params.current, newParams)
                submitChange()
                sim.resetStats()
                sim.updateBoundary(sim.params.boundary)
                sim.updateBoundaryCollisionDetector()
                sim.cycle({playing: false})
                params.current._uploadStateMessage = null
                setSuperNonce(Math.random())
              } catch (e) {
                console.error(e)
                let shouldGiveAdvice =
                  !filename.endsWith('csv') || !filename.includes('state')
                params.current._uploadStateMessage = (
                  <div style={{fontSize: '20px'}}>
                    That didn't work! 😬
                    {shouldGiveAdvice && <br />}
                    {shouldGiveAdvice && 'Try it with state.csv'}
                  </div>
                )
                setNonce(Math.random())
              }
            })
          }}
          style={{fontSize: 21}}
        >
          ⬆ Upload Current State
        </button>
        {!!params.current._uploadStateMessage && (
          <span style={{display: 'block', paddingTop: '5px'}} />
        )}
        {params.current._uploadStateMessage}
        <span style={{display: 'block', paddingTop: '5px'}} />
        <button
          onClick={() => {
            let filecontent = ''
            filecontent += csv.serialise(
              [params.current],
              [
                'softwareVersion',
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
            filecontent += '\n\n'
            filecontent += csv.serialise(sim.particles, [
              'uid',
              'position.0',
              'position.1',
              'velocity.0',
              'velocity.1',
              'radius',
              'tracer',
            ])
            csv.download(filecontent, 'state.csv')
          }}
          style={{fontSize: 21}}
        >
          ⬇ Download Current State
        </button>
        <span style={{display: 'block', paddingTop: '5px'}} />
        <button
          onClick={() => {
            params.current._analysisMessage = (
              <div style={{fontSize: '20px'}}>Analysing...</div>
            )
            setNonce(Math.random())
            // make the analysis take at least 2 seconds, so it is perceived as in-depth / sophisticated
            setTimeout(() => {
              onAnalyseCurrentState().then(() => {
                params.current._analysisMessage = (
                  <div style={{fontSize: '20px'}}>
                    Done! Scroll down for table
                  </div>
                )
                setNonce(Math.random())
              })
            }, 2000)
          }}
          style={{fontSize: 21}}
        >
          🤔 Analyse Current State
        </button>
        {!!params.current._analysisMessage && (
          <span style={{display: 'block', paddingTop: '5px'}} />
        )}
        {params.current._analysisMessage}
        <span style={{display: 'block', paddingTop: '5px'}} />
        <button
          onClick={() => {
            if (params.current._recording) {
              params.current._recording = false
              params.current._recordingMessage = (
                <div style={{fontSize: '20px'}}>Done!</div>
              )
              onMakeRecordingStop()
              setNonce(Math.random())
              return
            }
            params.current._recordingMessage = null
            setNonce(Math.random())
            let background = document.createElement('div')
            background.style =
              'position: fixed; background: #000; opacity: 0.5; inset: 0;'
            document.body.appendChild(background)
            let resolution = 1080
            let modal = document.createElement('div')
            modal.style =
              'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);' +
              'background: #fff; border: 1px solid #ccc; min-width: 100px; min-height: 100px; padding: 15px;'
            modal.innerHTML =
              `<span id="modal-close-1" style="position: absolute; top: 10px; right: 10px; text-decoration: underline; cursor: pointer;">Cancel</span>` +
              `<h2 style="margin-top: 15px;">Make Video Recording</h4>` +
              `<p>This records all the data generated by the simulation, this can use a lot of diskspace ` +
              `(up to 20 GB per minute). To handle this amount of data we split the data across multiple files, so ` +
              `you will need to select an empty folder for us to place everything in.</p>` +
              `<p>This uses non-standard web browser technology (the ` +
              `<a target="_blank" rel="noopener" href="https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API">File System Access API</a>` +
              `) so may not work for you. If it doesn't, you could try switching to one of ` +
              `<a target="_blank" rel="noopener" href="https://caniuse.com/mdn-api_filesystemwritablefilestream_write">these supported web browsers</a>` +
              `, or alternatively, get this project's source code from ` +
              `<a target="_blank" rel="noopener" href="https://github.com/ashtonsix/energetics">github.com/ashtonsix/energetics</a> ` +
              `and fix it.</p>` +
              `<p>What would you like to include in the recording?:</p>` +
              `<label><input id="checkbox-select-video" type="checkbox" checked /> An actual video (exported as individual frames)</label><br />` +
              `<label id="input-video-resolution"><input value="${resolution}" style="margin-left: 30px; width: 60px;" /> pixels across<br /></label>` +
              `<label><input id="checkbox-select-state" type="checkbox" checked /> State at every step</label><br />` +
              `<label><input id="checkbox-select-collisions" type="checkbox" checked /> Every collision (state immediately before collision)</label><br />` +
              `<label><input id="checkbox-select-analysis" type="checkbox" /> Analysis at every step (disorder, measured via triangulation)</label><br />` +
              `<div style="margin-top: 15px;">` +
              `<button id="modal-close-2" style="font-size: 17px;">Cancel</button>` +
              `<button id="select-folder" style="font-size: 17px; margin-left: 15px;">🎥 Select Folder</button>` +
              `<button id="select-cached-folder" style="font-size: 17px; margin-left: 15px; display: ${
                params.current._recordingDirectoryCached ? 'inline' : 'none'
              };">🎥 Use /${
                params.current._recordingDirectoryCached?.name
              } again</button>` +
              `<p>To stitch the video frames together into a single file, try <a rel="noopener" target="_blank" href="https://www.google.com/search?q=create+video+from+frames+ffmpeg">ffmpeg</a>. ` +
              `To stitch multiple CSVs together, click below (may not work if the files have been renamed, ` +
              `or one tries to combine many large files at once):</p>` +
              `<button id="combine-csv" style="font-size: 17px;">♋ Combine CSVs</button> ` +
              `<span id="combine-csv-working" style="display: none;">Working...</span>` +
              `</div>`
            let close = () => {
              document.body.removeChild(background)
              document.body.removeChild(modal)
            }
            background.addEventListener('click', close)
            let cl1 = modal.querySelector('#modal-close-1')
            let cl2 = modal.querySelector('#modal-close-2')
            let sel = modal.querySelector('#select-folder')
            let cachedSelect = modal.querySelector('#select-cached-folder')
            let stitch = modal.querySelector('#combine-csv')
            let stitchWorking = modal.querySelector('#combine-csv-working')
            let vid = modal.querySelector('#checkbox-select-video')
            let res = modal.querySelector('#input-video-resolution')
            let resInput = modal.querySelector('#input-video-resolution input')
            cl1.addEventListener('click', close)
            cl2.addEventListener('click', close)
            vid.addEventListener('change', () => {
              res.style.display = vid.checked ? 'block' : 'none'
            })
            resInput.addEventListener('input', () => {
              resolution = +clamp(resInput.value, 480, 4320).toFixed(0)
            })
            resInput.addEventListener('blur', () => {
              resInput.value = resolution.toFixed(0)
            })
            let submit = (directory) => {
              let c = (o) => document.querySelector(o).checked
              let includeVideo = c('#checkbox-select-video')
              let videoResolution = includeVideo ? resolution : null
              let includeCollisions = c('#checkbox-select-collisions')
              let includeState = c('#checkbox-select-state')
              let includeAnalysis = c('#checkbox-select-analysis')
              close()
              params.current._recording = true
              params.current._recordingMessage = null
              setNonce(Math.random())
              onMakeRecordingStart({
                directory,
                includeVideo,
                videoResolution,
                includeCollisions,
                includeState,
                includeAnalysis,
              })
            }
            let d = new Date()
            // prettier-ignore
            let date =
              d.getFullYear() + '-' + d.getMonth().toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0') + '-' +
              (d.getMilliseconds() * 1 + d.getSeconds() * 1000 + d.getMinutes() * 60000 + d.getHours() * 24 * 60000)
            sel.addEventListener('click', async () => {
              let directory = await window.showDirectoryPicker()
              params.current._recordingDirectoryCached = directory
              directory = await directory.getDirectoryHandle(date, {
                create: true,
              })
              submit(directory)
            })
            cachedSelect.addEventListener('click', async () => {
              let directory = params.current._recordingDirectoryCached
              directory = await directory.getDirectoryHandle(date, {
                create: true,
              })
              submit(directory)
            })
            stitch.addEventListener('click', async () => {
              await stitchCSVs(() => {
                stitch.disabled = true
                stitchWorking.style.display = 'inline'
              })
              stitch.disabled = false
              stitchWorking.style.display = 'none'
            })
            document.body.appendChild(modal)
          }}
          style={{fontSize: 21}}
        >
          {params.current._recording
            ? '■ Stop Recording'
            : '🎥 Make Video Recording'}
        </button>
        {!!params.current._recordingMessage && (
          <span style={{display: 'block', paddingTop: '5px'}} />
        )}
        {params.current._recordingMessage}
      </div>
      {!playing && (
        <div>
          <Select
            label="Visualisation"
            key="visualisation.name"
            defaultValue={params.current.visualisation.name}
            onChange={(value) => {
              const $p = params.current
              $p.visualisation = {...$p.visualisation, name: value}
              submitChange()
              setNonce(Math.random())
            }}
            options={[
              {value: 'particles', label: 'Particles'},
              {value: 'delaunay', label: 'Triangulation'},
              {value: 'mst', label: 'Tree'},
              {value: 'boundary', label: 'Boundary'},
            ]}
          />
          {['delaunay', 'mst'].includes(params.current.visualisation.name) && (
            <Select
              note="Metric (difference in...)"
              key="visualisation.particlesMetric"
              defaultValue={params.current.visualisation.particlesMetric}
              onChange={(value) => {
                const $p = params.current
                $p.visualisation = {...$p.visualisation, particlesMetric: value}
                submitChange()
              }}
              options={[
                // {value: 'positionMagBits', label: 'Position (‖x‖)'},
                {value: 'positionMagTouchingBits', label: 'Position (‖x‖ - r)'},
                {value: 'positionThetaBits', label: 'Position (θ)'},
                {value: 'velocityMagBits', label: 'Velocity (‖x‖)'},
                {value: 'velocityThetaBits', label: 'Velocity (θ)'},
                {value: 'radiusBits', label: 'Radius (r)'},
                {value: 'totalBits', label: 'Combination'},
              ]}
            />
          )}
          {['delaunay', 'mst'].includes(params.current.visualisation.name) && (
            <Select
              note="Color Intensity"
              key="visualisation.particlesColorIntensity"
              defaultValue={params.current.visualisation.particlesColorIntensity.toString()}
              onChange={(value) => {
                const $p = params.current
                $p.visualisation = {
                  ...$p.visualisation,
                  particlesColorIntensity: +value,
                }
                submitChange()
              }}
              options={[
                {value: '-1', label: 'none'},
                {value: '5', label: '1'},
                {value: '4', label: '2'},
                {value: '3', label: '3'},
                {value: '2', label: '4'},
                {value: '1', label: '5'},
              ]}
            />
          )}
          {params.current.visualisation.name === 'boundary' && (
            <Select
              note="Viewing"
              key="visualisation.boundaryFeature"
              defaultValue={params.current.visualisation.boundaryFeature}
              onChange={(value) => {
                const $p = params.current
                $p.visualisation = {...$p.visualisation, boundaryFeature: value}
                submitChange()
              }}
              options={[
                {value: 'status', label: 'Inside / Outside'},
                {value: 'normal', label: 'Normals'},
                {value: 'closest', label: 'Closest Point'},
              ]}
            />
          )}
        </div>
      )}
      <Stats sim={sim} />
    </div>
  )
}

export default UserControls
