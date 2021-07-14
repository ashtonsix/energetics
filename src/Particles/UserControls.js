import {useDebouncedCallback} from 'use-debounce'
import React, {useRef, useState} from 'react'
import useInterval from '../useInterval'
import boundaryGenerators from './boundaryGenerators'

const Input = React.forwardRef(
  ({label, note, debounce, onChange, onBlur, ...props}, ref) => {
    const handleOnChange = useDebouncedCallback(onChange, debounce)
    return (
      <label style={{display: 'block', width: 360}}>
        {!!label && <span style={{fontSize: 32}}>{label}</span>}
        {!!label && <br />}
        {!!note && <span style={{fontSize: 22}}>{note}</span>}
        {!!note && <br />}
        <input
          ref={ref}
          style={{fontSize: 32, width: 300}}
          onChange={(e) => {
            handleOnChange(e.target.value)
          }}
          onBlur={(e) => {
            handleOnChange.cancel()
            onChange(e.target.value)
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
      <label style={{display: 'block', width: 360, fontSize: 32}}>
        <span style={{fontSize: 32}}>{label}</span>
        <br />
        {!!note && <span style={{fontSize: 22}}>{note}</span>}
        {!!note && <br />}
        <select
          ref={ref}
          style={{fontSize: 32, verticalAlign: 'top'}}
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

const UserControls = ({
  playing,
  onChange,
  defaultValue,
  getSuggestedRadius,
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
  })
  const inputs = useRef({
    particleCount: {},
    particleRadiusMin: {},
    particleRadiusMax: {},
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
    const r = getSuggestedRadius($p.particleCount)
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

    $i.particleCount.value = $p.particleCount.toFixed(0)
    $i.particleRadiusMin.value = ($p.particleRadiusMin * scale).toFixed(2)
    $i.particleRadiusMax.value = ($p.particleRadiusMax * scale).toFixed(2)
    setSuggestedRadius(r)
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
      <Input
        label="Particle Radius (min)"
        note={
          'Suggested = ' +
          clamp(suggestedRadius * scale * 0.95, 2, 200).toFixed(2)
        }
        debounce={500}
        defaultValue={(params.current.particleRadiusMin * scale).toFixed(2)}
        onChange={(value) => {
          params.current.particleRadiusMin = clamp(value, 2, 200) / scale
          submitChange()
        }}
        onBlur={(e) => {
          e.target.value = (params.current.particleRadiusMin * scale).toFixed(2)
        }}
        ref={(input) => (inputs.current.particleRadiusMin = input)}
      />
      <Input
        label="Particle Radius (max)"
        note={
          'Suggested = ' +
          clamp(suggestedRadius * scale * 1.05, 2, 200).toFixed(2)
        }
        debounce={500}
        defaultValue={(params.current.particleRadiusMax * scale).toFixed(2)}
        onChange={(value) => {
          params.current.particleRadiusMax = clamp(value, 2, 200) / scale
          submitChange()
        }}
        onBlur={(e) => {
          e.target.value = (params.current.particleRadiusMax * scale).toFixed(2)
        }}
        ref={(input) => (inputs.current.particleRadiusMax = input)}
      />
      <Input
        label="Spawn Rate"
        debounce={500}
        defaultValue={params.current.spawnRate.toFixed(2)}
        onChange={(value) => {
          params.current.spawnRate = clamp(value, -1000, 1000)
          submitChange()
        }}
        onBlur={(e) => {
          e.target.value = params.current.spawnRate.toFixed(2)
        }}
      />
      <div>
        <Select
          label={
            params.current.particleSpeedConstant
              ? 'Particle Speed'
              : 'Particle Speed (average)'
          }
          defaultValue={params.current.particleSpeedConstant ? 'true' : 'false'}
          onChange={(value) => {
            params.current.particleSpeedConstant = JSON.parse(value)
            submitChange()
            setNonce(Math.random())
          }}
          options={[
            {value: 'false', label: 'Variable'},
            {value: 'true', label: 'Constant'},
          ]}
        />
        <span style={{display: 'block', height: 5}}></span>
        <Input
          debounce={500}
          defaultValue={(params.current.particleSpeed * scale).toFixed(2)}
          onChange={(value) => {
            params.current.particleSpeed = clamp(value, 0.5, 5) / scale
            submitChange()
          }}
          onBlur={(e) => {
            e.target.value = (params.current.particleSpeed * scale).toFixed(2)
          }}
        />
      </div>
      <Select
        label="Particle Collisions"
        defaultValue={params.current.particleCollisions ? 'true' : 'false'}
        onChange={(value) => {
          params.current.particleCollisions = JSON.parse(value)
          submitChange()
        }}
        options={[
          {value: 'false', label: 'Disabled'},
          {value: 'true', label: 'Enabled'},
        ]}
      />
      <Input
        label="Particle Stickiness"
        debounce={500}
        defaultValue={(params.current.particleStickiness * scale).toFixed(2)}
        onChange={(value) => {
          params.current.particleStickiness = clamp(value, 0, 500) / scale
          submitChange()
        }}
        onBlur={(e) => {
          e.target.value = (params.current.particleStickiness * scale).toFixed(
            2
          )
        }}
      />
      <Select
        label="Boundary Stickiness"
        defaultValue={params.current.boundaryStickiness ? 'true' : 'false'}
        onChange={(value) => {
          params.current.boundaryStickiness = JSON.parse(value)
          submitChange()
        }}
        options={[
          {value: 'false', label: 'Disabled'},
          {value: 'true', label: 'Enabled'},
        ]}
      />
      <div>
        <Select
          label="Boundary Shape"
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
            {value: 'chambers', label: 'Chambers'},
            {value: 'doughnut', label: 'Doughnut'},
          ]}
        />
        {boundaryGenerators[params.current.boundary.name].params.map(
          ({min, max, step, defaultValue}, i) => (
            <input
              key={params.current.boundary.name + '.' + i}
              type="range"
              style={{display: 'block', width: 300}}
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
      <div>
        <Select
          label="Spawn Area"
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
            {value: 'false', label: 'Disabled'},
            {value: 'true', label: 'Enabled'},
          ]}
        />
        {!!params.current.spawnArea && (
          <div>
            <input
              type="range"
              style={{display: 'block', width: 300}}
              min={0}
              max={1}
              step={0.02}
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
              style={{display: 'block', width: 300}}
              min={0}
              max={1}
              step={0.02}
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
              style={{display: 'block', width: 300}}
              min={0.02}
              max={0.8}
              step={0.02}
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
              style={{display: 'block', width: 300}}
              min={0}
              max={Math.PI * 2 + 0.000001}
              step={Math.PI / 20}
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
              style={{display: 'block', width: 300}}
              min={0}
              max={Math.PI + 0.000001}
              step={Math.PI / 40}
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
          <span style={{display: 'block', height: 5}}></span>
        )}
        {params.current.trailDisplay !== 'disabled' && (
          <Input
            debounce={500}
            defaultValue={params.current.trailLength.toFixed(2)}
            onChange={(value) => {
              params.current.trailLength = clamp(value, 0, 500)
              submitChange()
            }}
            onBlur={(e) => {
              e.target.value = params.current.trailLength.toFixed(2)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default UserControls
