import React, {useRef, useEffect, useState} from 'react'
import {useDebouncedCallback} from 'use-debounce'
import useInterval from '../useInterval'
import Sim from './Sim'
import ConfigPreview from './ConfigPreview'
import {defaultConfig, texturePacks} from './common'

const optimiseParams = ({inputs, labels, params, map}) => {
  params = params.slice()
  const evaluate = (params) =>
    inputs.reduce(
      (pv, v, i) => pv + Math.abs(map(v, params) - labels[i]) || 1000,
      0
    )
  let bestError = evaluate(params)
  for (let i = 0; i < 60; i++) {
    // eslint-disable-next-line
    const tests = new Array(10).fill(null).map(() => {
      return params.slice().map((v) => (v += Math.random() * 2 - 1))
    })
    const scores = tests.map(evaluate)
    const test = tests[scores.indexOf(Math.min(...scores))]

    if (evaluate(test) < bestError) {
      params = test
      bestError = evaluate(test)
    }
  }

  return params
}

const Input: React.FC<{
  label: string
  debounce?: number
  onChange: (value: string) => any
  defaultValue: string | number
}> = ({label, debounce, onChange, defaultValue}) => {
  const handleOnChange = useDebouncedCallback(onChange, debounce || 0)
  return (
    <label style={{display: 'block', fontSize: 32}}>
      <span>{label}</span>
      <br />
      <input
        style={{fontSize: 32, width: 300}}
        defaultValue={defaultValue}
        onChange={(e) => handleOnChange(e.target.value)}
      ></input>
    </label>
  )
}

const NewExperiment = ({sim, onSubmit}) => {
  const [size, setSize] = useState(sim.config.size || defaultConfig.size)
  const [texturePack, setTexturePack] = useState('contained')
  return (
    <div style={{maxWidth: 450}}>
      <h3>Option 1: Use the Generator</h3>
      <p>
        Note: The boundary field takes up 10 grid cells, any thickness less than
        double the arc radius is permeable
      </p>
      <Input
        onChange={(value) => setSize(+value || 0)}
        label="Field Size"
        defaultValue={size}
      />
      <label style={{display: 'block', fontSize: 32}}>
        <span>Boundary Field</span>
        <br />
        <select
          style={{fontSize: 32, verticalAlign: 'top'}}
          onChange={(e) => {
            setTexturePack(e.target.value)
          }}
          defaultValue={texturePack}
        >
          <option value="contained">Enabled</option>
          <option value="notContained">Disabled</option>
          <option value="mobiusStrip">Mobius Strip</option>
        </select>
      </label>
      <button
        onClick={() => {
          onSubmit({
            size: Math.max(Math.min(1024, size), 4),
            texturePack: texturePacks[texturePack],
          })
        }}
        style={{fontSize: '1.5rem', marginTop: 10}}
      >
        Generate
      </button>
      <h3>Option 2: Upload your own experiment</h3>
      <p>Download the state, modify it, re-upload, adjust brightness</p>
      <p>
        <em>colour key</em>
        <br />
        red=energy, green=energy, blue=direction, alpha=boundary
        <br />
        <br />
        <em>energy scaling formula</em>
        <br />
        x := red * 256 + green
        <br />
        energy := x / (65536 - x)
      </p>
      <button
        onClick={async () => {
          const d = await sim.shaderBridge.read('s01')
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          const size = sim.config.size
          const imgData = context.createImageData(size, size)
          canvas.height = size
          canvas.width = size

          for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
              let i = (y * size + x) * 4
              let i2 = ((size - y - 1) * size + x) * 4
              let wall = d[i + 2] + d[i + 3]
              let energy = (d[i] ** 2 + d[i + 1] ** 2) ** 0.5
              let direction = Math.atan2(d[i + 1], d[i]) + Math.PI
              direction *= 255 / (Math.PI * 2)
              if (wall) energy = 0
              if (wall) direction = 0
              const e = (65536 * energy) / (energy + 1)
              imgData.data[i2 + 0] = Math.floor(e / 256)
              imgData.data[i2 + 1] = Math.floor(e % 256)
              imgData.data[i2 + 2] = direction
              imgData.data[i2 + 3] = wall ? 0 : 255
            }
          }

          context.putImageData(imgData, 0, 0)

          const downloadLink = document.createElement('a')
          downloadLink.href = canvas.toDataURL('image/png')
          downloadLink.download = 'experiment-state.png'
          downloadLink.click()
        }}
        style={{fontSize: '1.5rem'}}
      >
        Download State
      </button>
      <button
        onClick={async () => {
          const fileUpload = document.createElement('input')
          fileUpload.type = 'file'
          fileUpload.accept = 'image/*,application/zip'
          fileUpload.multiple = false
          fileUpload.addEventListener('change', (e: any) => {
            if (!e.target.files[0]) return
            const reader = new FileReader()

            reader.addEventListener(
              'load',
              () => {
                const canvas = document.createElement('canvas')
                const context = canvas.getContext('2d')
                const image = new Image()
                image.addEventListener('load', () => {
                  canvas.width = image.width
                  canvas.height = image.height
                  context.drawImage(image, 0, 0)
                  const size = Math.min(image.width, image.height, 1024)
                  const data = context.getImageData(0, 0, size, size).data

                  const texturePack = (x, y, size) => {
                    const i = ((size - y - 1) * size + x) * 4
                    const r = data[i + 0]
                    const g = data[i + 1]
                    const b = data[i + 2]
                    const a = data[i + 3]
                    const wall = a < 128
                    const e = r * 256 + g
                    return {
                      A: {
                        energy: wall ? 0 : e / (65536 - e),
                        direction: Math.PI + (b * Math.PI * 2) / 255,
                      },
                      W: {energy: wall ? 1 : 0},
                    }
                  }
                  onSubmit({size, texturePack})
                })
                image.src = reader.result as any
              },
              false
            )

            reader.readAsDataURL(e.target.files[0])
          })
          fileUpload.click()
        }}
        style={{fontSize: '1.5rem', marginLeft: 10}}
      >
        Upload State
      </button>
    </div>
  )
}

const VectorField = () => {
  const ref = useRef(null as any)
  const [playing, setPlaying] = useState(false)
  const [sim, setSim] = useState(null as Sim)
  const [magnification, setMagnification] = useState(1)
  const [brightnessModifier, setBrightnessModifier] = useState(-0.5)
  const [renderNonce, setRenderNonce] = useState(0)
  const [newExperiment, setNewExperiment] = useState(false)
  const [texturePack, setTexturePack] = useState(
    () => texturePacks.contained as any
  )

  const generateSim = (config, texturePack) => {
    const sim = new Sim(config, texturePack)
    setSim(sim)

    const container = ref.current
    sim.resizeCanvas(magnification)
    container.appendChild(sim.shaderBridge.canvas)
    sim.display()

    setTimeout(() => adjustBrightnessContrast(sim), 100)
  }
  const destroySim = (sim) => {
    if (sim) sim.destroy()
    if (ref.current) ref.current.innerHTML = ''
  }
  const adjustBrightnessContrast = async (sim) => {
    if (!sim) return
    const pr = await sim.shaderBridge.read('s01Prev')
    const r = await sim.shaderBridge.read('s01')
    const mag = []
    for (let i = 0; i < r.length; i += 4) {
      let m = (r[i] ** 2 + r[i + 1] ** 2) ** 0.5
      let mr = (pr[i] ** 2 + pr[i + 1] ** 2) ** 0.5
      if (sim.config.display.quantity === 'energyDelta') {
        m = Math.abs(m - mr)
      }
      if (m && !r[i + 2] && !r[i + 3]) mag.push(m)
    }
    let sample = []
    if (mag.length > 10000) {
      for (let i = 0; i < 10000; i++) {
        sample.push(mag[Math.floor(Math.random() * mag.length)])
      }
    } else {
      sample = mag
    }
    sample.sort((a, b) => a - b)
    const inputs = [
      sample[Math.floor(sample.length * 0.1)],
      sample[Math.floor(sample.length * (0.7 - brightnessModifier * 0.2999))],
    ]
    const labels = [0.15, 0.75]
    const params = [0, 0]
    const map = (x, params) => {
      let brightness, contrast, zeroPoint
      brightness = params[0]
      contrast = params[1]
      contrast = contrast / (32 - contrast)
      zeroPoint = 0.5

      if (sim.config.display.quantity === 'energyDelta') {
        x *= 256
        contrast = contrast ** 3
        zeroPoint = 0
      }

      x = (x + brightness / contrast - zeroPoint) * contrast + zeroPoint
      x = 0.25 / (0.25 + 2 ** ((-x * 4.0) / 3.0))

      return x
    }
    const [brightness, contrast] = optimiseParams({
      inputs,
      labels,
      params,
      map,
    })

    sim.config.display.brightness = brightness
    sim.config.display.contrast = contrast
    if (!playing) sim.display()
  }

  useEffect(() => {
    const config = JSON.parse(JSON.stringify(defaultConfig))
    generateSim(config, texturePack)
    return () => destroySim(sim)
  }, []) // eslint-disable-line

  useEffect(() => {
    const resizeWindow = () => {
      if (!sim) return
      const windowSize = Math.min(window.innerWidth, window.innerHeight) - 50
      const magnification = Math.max(
        Math.floor(windowSize / sim.config.size),
        1
      )
      sim.resizeCanvas(magnification)
      setMagnification(magnification)
    }
    resizeWindow()
    window.addEventListener('resize', resizeWindow)
    return () => window.removeEventListener('resize', resizeWindow)
  }, [sim])

  useInterval(
    async () => {
      if (!playing || !sim) return

      await sim.cycle()
    },
    playing ? 5 : null
  )

  return (
    <div style={{display: 'flex'}}>
      <div
        ref={ref}
        style={{
          display: 'inline-block',
          width: (sim ? sim.config.size : defaultConfig.size) * magnification,
          marginRight: 10,
        }}
      ></div>
      <div>
        <button
          onClick={() => {
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
            if (!playing) sim.cycle()
          }}
          style={{fontSize: '2rem'}}
        >
          Step
        </button>
        <button
          onClick={() => {
            const config = JSON.parse(JSON.stringify(sim.config))
            destroySim(sim)
            generateSim(config, texturePack)
          }}
          style={{fontSize: '2rem', marginLeft: 10}}
        >
          Reset
        </button>
        <button
          onClick={() => {
            setNewExperiment(!newExperiment)
          }}
          style={{fontSize: '2rem', marginLeft: 10}}
        >
          {newExperiment ? 'Go Back' : 'New Experiment'}
        </button>
        {newExperiment ? (
          <NewExperiment
            sim={sim}
            onSubmit={({size, texturePack}) => {
              setTexturePack(() => texturePack)
              const config = JSON.parse(JSON.stringify(sim.config))
              config.size = size
              destroySim(sim)
              generateSim(config, texturePack)
            }}
          />
        ) : (
          <>
            <Input
              label="Arc Length (degrees)"
              debounce={500}
              onChange={(value) => {
                let parsed
                parsed = +value / 360 || 0
                parsed = Math.max(Math.min(parsed, 1 - 1e-10), 1 / 100)
                sim.config.substances[0].arc = parsed
                setRenderNonce(Math.random())
              }}
              defaultValue={Math.floor(
                (sim ? sim.config : defaultConfig).substances[0].arc * 360
              )}
            />
            <Input
              label="Arc Radius (grid lengths)"
              debounce={500}
              onChange={(value) => {
                let parsed = Math.max(+value || 0, 2 ** 0.5 * 0.5)
                sim.config.transferRadius = parsed
                setRenderNonce(Math.random())
              }}
              defaultValue={(sim ? sim.config : defaultConfig).transferRadius}
            />
            <Input
              label="Flow Rate (%)"
              debounce={500}
              onChange={(value) => {
                let parsed = Math.max(Math.min(+value / 100 || 0, 1), 0)
                sim.config.substances[0].flo = parsed
                setRenderNonce(Math.random())
              }}
              defaultValue={Math.floor(
                (sim ? sim.config : defaultConfig).substances[0].flo * 100
              )}
            />
            <label style={{display: 'block', fontSize: 32}}>
              <span>Showing</span>
              <br />
              <select
                style={{fontSize: 32, verticalAlign: 'top'}}
                onChange={(e) => {
                  const showing = e.target.value

                  const d = sim.config.display
                  switch (showing) {
                    case 'energy': {
                      d.quantity = 'energy'
                      if (d.gradient.interpolation === 'hue') {
                        d.gradient.interpolation = 'palette'
                      }
                      break
                    }
                    case 'energyDelta': {
                      d.quantity = 'energyDelta'
                      if (d.gradient.interpolation === 'hue') {
                        d.gradient.interpolation = 'palette'
                      }
                      break
                    }
                    case 'direction': {
                      d.quantity = 'direction'
                      if (d.gradient.interpolation === 'divergent') {
                        d.gradient.interpolation = 'palette'
                      }
                      break
                    }
                  }
                  adjustBrightnessContrast(sim)
                  setRenderNonce(Math.random())
                }}
                defaultValue={
                  (sim ? sim.config : defaultConfig).display.quantity
                }
              >
                <option value="energy">Energy</option>
                <option value="energyDelta">
                  Change in Energy (since last step)
                </option>
                <option value="direction">Direction</option>
              </select>
            </label>
            <div>
              <label style={{display: 'inline-block', fontSize: 32}}>
                <span>Chroma</span>
                <br />
                <select
                  style={{fontSize: 32, verticalAlign: 'top'}}
                  onChange={(e) => {
                    sim.config.display.chroma = e.target.value
                    if (!playing) sim.display()
                  }}
                  defaultValue={
                    (sim ? sim.config : defaultConfig).display.chroma
                  }
                >
                  <option value="HPLuv">HPLuv (accurate)</option>
                  <option value="HSLuv">HSLuv (vivid)</option>
                </select>
              </label>
              <label
                style={{display: 'inline-block', fontSize: 32, marginLeft: 10}}
              >
                <span>Gradient</span>
                <br />
                <select
                  style={{fontSize: 32, verticalAlign: 'top'}}
                  onChange={(e) => {
                    sim.config.display.gradient.interpolation = e.target.value
                    if (!playing) sim.display()
                    setRenderNonce(Math.random())
                  }}
                  value={
                    (sim ? sim.config : defaultConfig).display.gradient
                      .interpolation
                  }
                >
                  <option value="palette">Default</option>
                  {(sim ? sim.config : defaultConfig).display.quantity ===
                  'direction' ? (
                    <option value="hue">Hue</option>
                  ) : (
                    <option value="divergent">Divergent</option>
                  )}
                </select>
              </label>
            </div>
            <label style={{fontSize: '2rem', marginTop: 10}}>
              <button
                style={{fontSize: '2rem', marginTop: 10}}
                onClick={() => adjustBrightnessContrast(sim)}
              >
                Adjust Brightness / Contrast
              </button>
              <br />
              <input
                type="range"
                defaultValue={brightnessModifier}
                style={{width: '320px'}}
                min={-1}
                max={1}
                step={1 / 100}
                onChange={(e) => {
                  setBrightnessModifier(+e.target.value)
                }}
              />
            </label>
            <br />
            <ConfigPreview
              nonce={renderNonce}
              transferRadius={sim ? sim.config.transferRadius : 0}
              arc={sim ? sim.config.substances[0].arc : 0}
              flo={sim ? sim.config.substances[0].flo : 0}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default VectorField
