import {useDebouncedCallback} from 'use-debounce'
import React, {useRef, useState} from 'react'
import useInterval from '../useInterval'

const Input = React.forwardRef(
  ({label, note, debounce, onChange, onBlur, ...props}, ref) => {
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

const clamp = (value, min, max) => {
  return Math.min(Math.max(+value || 0, min), max)
}

const UserInterface = ({
  playing,
  onChange,
  defaultValue,
  getSuggestedRadius,
}) => {
  const [suggestedRadius, setSuggestedRadius] = useState(
    getSuggestedRadius(defaultValue.particleCount)
  )
  const params = useRef({...defaultValue, spawnRate: 0})
  const inputs = useRef({
    particleCount: {},
    particleRadiusMin: {},
    particleRadiusMax: {},
    particleSpeed: {},
    spawnRate: {},
  })
  const scale = 1000

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
    debugger
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
    const $p = params.current
    onChange({
      particleCount: $p.particleCount,
      particleRadiusMin: $p.particleRadiusMin,
      particleRadiusMax: $p.particleRadiusMax,
      particleSpeed: $p.particleSpeed,
    })
  }

  return (
    <div>
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
        label="Particle Speed"
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
      <Input
        label="Spawn Rate"
        debounce={500}
        defaultValue={params.current.spawnRate.toFixed(2)}
        onChange={(value) => {
          params.current.spawnRate = clamp(value, -1000, 1000)
        }}
        onBlur={(e) => {
          e.target.value = params.current.spawnRate.toFixed(2)
        }}
      />
    </div>
  )
}

export default UserInterface
