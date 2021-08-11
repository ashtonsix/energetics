import React, {useRef, useEffect} from 'react'
import {triangulate, dataToMST, prunedDelaunay} from './analysis/analysis'
import vec from './vec'
import {hexToHpluv, hpluvToRgb} from 'hsluv'

const mix = (a, b, m) => a * (1 - m) + b * m
const mixRing = (a, b, m, r) => {
  if (Math.abs(a + r - b) < Math.abs(a - b)) a += r
  else if (Math.abs(b + r - a) < Math.abs(a - b)) b += r
  const c = a * (1 - m) + b * m
  return c % r
}
const mixColors = (a, b, m) => {
  const e = 0.01
  const h = a[1] < e ? b[0] : b[1] < e ? a[0] : mixRing(a[0], b[0], m, 360)
  return [h, mix(a[1], b[1], m), mix(a[2], b[2], m)]
}
const mixColorGradient = (colors, m) => {
  const i = Math.floor(Math.min(m, 0.999) * 4)
  const a = colors[i]
  const b = colors[i + 1]
  return mixColors(a, b, (m * 4) % 1)
}
const divergentColorScheme = (() => {
  let divergent = {
    toneA: {hex: '#31408F'},
    toneB: {hex: '#de425b'},
    midpointLuminance: 80,
    midpointSaturation: 0,
  }
  const a = hexToHpluv(divergent.toneA.hex)
  const b = hexToHpluv(divergent.toneB.hex)
  const mid = [
    mixRing(a[0], b[0], 0.5, 360),
    divergent.midpointSaturation,
    divergent.midpointLuminance,
  ]
  return [a, mixColors(a, mid, 1 / 2), mid, mixColors(mid, b, 1 / 2), b]
})()
const sampleDivergentColourScheme = (percentValue) => {
  let hsl = mixColorGradient(divergentColorScheme, percentValue)
  let [r, g, b] = hpluvToRgb(hsl).map((v) => Math.floor(v * 255))
  return '#' + r.toString(16) + g.toString(16) + b.toString(16)
}

const ArenaViz = ({sim, showDecal = null, finemesh, ...props}) => {
  const ref = useRef()

  const scale = 100

  useEffect(() => {
    if (!showDecal) return
    let svg = ''
    const boundaryPoints = []
    let bcd = sim.boundaryCollisionDetector
    if (finemesh) bcd = bcd.finemesh
    for (let i = 0; i < bcd.data.length; i += 6) {
      let xi = ((i / 6) % bcd.length) / bcd.length + bcd.cellSize / 2
      let yi = Math.floor(i / 6 / bcd.length) / bcd.length + bcd.cellSize / 2
      let [x, y, d, nx, ny, status] = bcd.data.slice(i, i + 6)
      if (d !== -1) {
        boundaryPoints.push({xi, yi, x, y, d, nx, ny, status})
      }
    }
    boundaryPoints.forEach(({xi, yi, x, y, nx, ny, status}, i) => {
      if (showDecal === 'boundaryStatus') {
        svg += `
          <circle
            cx="${xi * scale}"
            cy="${yi * scale}"
            fill="${['white', 'red', 'green', 'blue', 'yellow'][status]}"
            r="${finemesh ? 0.05 : 0.2}"
          />
        `
      }
      if (showDecal === 'boundaryNormal') {
        svg += `
          <line
            x1="${x * scale}"
            y1="${y * scale}"
            x2="${(x + nx * 0.05) * scale}"
            y2="${(y + ny * 0.05) * scale}"
            stroke="lightBlue"
            stroke-width="${finemesh ? 0.005 : 0.02}"
          />
        `
      }
      if (showDecal === 'boundaryClosest') {
        svg += `
          <line
            x1="${xi * scale}"
            y1="${yi * scale}"
            x2="${x * scale}"
            y2="${y * scale}"
            stroke="lightBlue"
            stroke-width="${finemesh ? 0.005 : 0.02}"
          />
        `
      }
    })
    if (showDecal === 'delaunay') {
      // let delaunay = triangulate.run(sim.particles, (p) => p.position)
      // triangulate.forEachEdge(delaunay, ([a, b], t) => {
      //   let [ax, ay] = vec.mult(sim.particles[a].position, 100)
      //   let [bx, by] = vec.mult(sim.particles[b].position, 100)
      //   svg += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke-width="0.2" stroke="white" />`
      // })
      let edgelist = prunedDelaunay(sim.particles)
      let best = edgelist[0][3]
      let worst = edgelist[0][3]
      edgelist.forEach(([, , , m]) => {
        best = Math.min(m, best)
        worst = Math.max(m, worst)
      })
      edgelist.forEach(([a, b, d, m], t) => {
        let [ax, ay] = vec.mult(sim.particles[a].position, 100)
        let [bx, by] = vec.mult(sim.particles[b].position, 100)
        // let stroke = ['white', 'blue', 'red'][m]
        // console.log((m - best) / (worst - best))
        let stroke = sampleDivergentColourScheme(
          ((m - best) / (worst - best)) ** 0.25
        )
        svg += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke-width="0.2" stroke="${stroke}" />`
      })
    }

    if (showDecal === 'mstEuclidean' || showDecal === 'mstBits') {
      let nodelist = dataToMST(
        sim.particles,
        showDecal === 'mstEuclidean' ? 'euclidean' : 'bits'
      )
      let maxDepth = nodelist.slice(-1)[0]?.depth || 0
      nodelist.forEach(({index, parent, depth}) => {
        if (parent === -1) return
        let [ax, ay] = vec.mult(sim.particles[index].position, 100)
        let [bx, by] = vec.mult(sim.particles[parent].position, 100)
        let stroke = sampleDivergentColourScheme((depth + 1) / (maxDepth + 1))
        svg += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke-width="0.2" stroke="${stroke}" />`
      })
    }
    let el = ref.current
    el.innerHTML = svg
    return () => {
      el.innerHTML = ''
    }
  }, [sim.boundaryCollisionDetector, showDecal, finemesh])

  let polygons = sim.boundary.map(([polygon, inside]) => [
    polygon.map(([x, y]) => +(x * scale) + ',' + +(y * scale)).join(' '),
    inside === 'inside',
  ])

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect fill="#222" width="100" height="100"></rect>
      <defs>
        <filter id="outline">
          <feColorMatrix
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    1 1 1 0 0"
          />
          <feMorphology operator="dilate" radius="0.1" />
          <feColorMatrix
            values="0 0 0 0 0.678
                    0 0 0 0 0.847
                    0 0 0 0 0.901
                    0 0 0 1 0"
          />
        </filter>
      </defs>
      <rect fill="#222" x="0" y="0" width="100" height="100" />
      <mask id="mask">
        {polygons.map(([polygon, inside], i) => (
          <polygon key={i} points={polygon} fill={inside ? 'white' : 'black'} />
        ))}
      </mask>
      <g filter="url(#outline)">
        {polygons.map(([polygon, inside], i) => (
          <polygon key={i} points={polygon} fill={inside ? 'white' : 'black'} />
        ))}
      </g>
      <rect
        fill="#000"
        x="0"
        y="0"
        width="100"
        height="100"
        mask="url(#mask)"
      />
      {!!sim.params.spawnArea && (
        <circle
          fill="#004e10"
          cx={sim.params.spawnArea.x * scale}
          cy={sim.params.spawnArea.y * scale}
          r={sim.params.spawnArea.radius * scale}
          mask="url(#mask)"
        />
      )}
      {!!sim.params.spawnArea &&
        (() => {
          const $ = sim.params.spawnArea
          const radius = Math.min(0.1, $.radius * 0.8)
          if ($.rotationSpread === 0) {
            return (
              <line
                x1={$.x * scale}
                y1={$.y * scale}
                // +0.001 is a workaround for Chrome display bug
                // that occurs when $.rotation === 0
                x2={($.x + Math.cos($.rotation + 0.001) * radius) * scale}
                y2={($.y + Math.sin($.rotation + 0.001) * radius) * scale}
                stroke="green"
                strokeWidth={0.5}
                mask="url(#mask)"
              />
            )
          }
          const arc = [[$.x * scale, $.y * scale]]
          for (
            let t = $.rotation - $.rotationSpread;
            t < $.rotation + $.rotationSpread;
            t += 1 / 100
          ) {
            const x = Math.cos(t) * radius
            const y = Math.sin(t) * radius
            arc.push([($.x + x) * scale, ($.y + y) * scale])
          }
          return <polygon points={arc} fill="green" mask="url(#mask)" />
        })()}
      <g ref={ref} />
    </svg>
  )
}

export default ArenaViz
