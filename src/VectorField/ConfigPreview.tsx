import React from 'react'
import {configToUniforms, generateTextures} from './common'
import {cycle, Sim} from './shaders/_javascriptVersion'

const Grid = ({size, children}) => {
  const unitSize = (100 - 0.125) / size

  return (
    <svg style={{width: '300px'}} viewBox="0 0 100 100">
      <defs>
        <pattern
          id="grid"
          width={unitSize}
          height={unitSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${unitSize} 0 L 0 0 0 ${unitSize}`}
            fill="none"
            stroke="black"
            strokeWidth="0.25"
          />
        </pattern>
        <marker
          id="arrowHead"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth={2.5}
          markerHeight={2.5}
          orient="auto-start-reverse"
        >
          <path stroke="black" fill="black" d={`M 0 0 L 10 5 L 0 10 z`} />
        </marker>
      </defs>
      <rect width={100} height={100} fill="url(#grid)" />
      {children.map(({xi, yi, f}) => {
        const cx = xi * unitSize + unitSize / 2
        const cy = yi * unitSize + unitSize / 2
        return f({cx, cy, unitSize})
      })}
    </svg>
  )
}

export default function ConfigPreview({nonce, transferRadius, arc, flo}) {
  transferRadius = Math.min(transferRadius, 4)
  const config = {
    seed: -1,
    size: Math.floor(transferRadius + 0.5) * 2 + 1,
    transferRadius,
    substances: [{name: 'A', arc, flo: Math.min(flo, 0.99999)}],
    substanceAttractionMatrix: {},
    reactionParameters: {},
    reactions: [],
  }
  const texturePack = (x, y, size) => {
    const center = x === (size - 1) / 2 && y === (size - 1) / 2
    return {
      A: {energy: center ? 1 : 0, direction: 0.4},
    }
  }

  const sim = new Sim()
  const uniforms = configToUniforms(config)
  const textures = generateTextures(texturePack, config)

  Object.assign(sim.textures, textures)
  sim.size = config.size
  sim.uniforms = uniforms
  cycle(sim, config)
  const maxLength = config.size ** 2

  return (
    <div style={{padding: 10}}>
      <Grid size={config.size}>
        {[].concat(
          ...sim.textures['s01']
            .map((row, yi) =>
              row.map(([x, y], xi) => {
                return {
                  xi,
                  yi,
                  f({cx, cy, unitSize}) {
                    const e =
                      ((x ** 2 + y ** 2) ** 0.5 / maxLength) ** 0.4 * 1.5
                    const length = (e * unitSize * 0.75) / 2
                    const theta = Math.atan2(y, x)
                    return (
                      <line
                        key={cx + '.' + cy}
                        stroke="black"
                        x1={cx}
                        y1={cy}
                        x2={cx + length * Math.cos(theta)}
                        y2={cy + length * Math.sin(theta)}
                        strokeWidth={length / 4}
                        markerEnd="url(#arrowHead)"
                      />
                    )
                  },
                }
              })
            )
            .concat({
              xi: (config.size - 1) / 2,
              yi: (config.size - 1) / 2,
              f({cx, cy, unitSize}) {
                return (
                  <polyline
                    key="arc"
                    points={new Array(2000)
                      .fill(null)
                      .map((_, i) => {
                        const xyi = (config.size - 1) / 2
                        const [x, y] = sim.textures['s01'][xyi][xyi]
                        const bisector = Math.atan2(y, x)
                        const lo = bisector - config.substances[0].arc * Math.PI
                        const hi = bisector + config.substances[0].arc * Math.PI
                        const theta = lo + (hi - lo) / (2000 / i)

                        const r = config.transferRadius * unitSize

                        // prettier-ignore
                        return (cx + Math.cos(theta) * r) + ',' + (cy + Math.sin(theta) * r)
                      })
                      .join(' ')}
                    fill="none"
                    stroke="black"
                    strokeWidth={0.5}
                  />
                )
              },
            })
        )}
      </Grid>
    </div>
  )
}
