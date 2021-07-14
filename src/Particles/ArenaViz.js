import React, {useRef, useEffect} from 'react'

const ArenaViz = ({sim, showDecals, ...props}) => {
  const ref = useRef()

  const scale = 96
  const padding = 2

  useEffect(() => {
    if (!showDecals) return
    const data = []
    let bcd = sim.boundaryCollisionDetector
    for (let i = 0; i < bcd.data.length; i += 6) {
      let xi = ((i / 6) % bcd.length) / bcd.length + bcd.cellSize / 2
      let yi = Math.floor(i / 6 / bcd.length) / bcd.length + bcd.cellSize / 2
      let [x, y, d, nx, ny, status] = bcd.data.slice(i, i + 6)
      if (d !== -1) {
        data.push({xi, yi, x, y, d, nx, ny, status})
      }
    }
    let svg = ''
    data.forEach(({xi, yi, x, y, nx, ny, status}, i) => {
      svg += `
        <line
          x1="${xi * scale + padding}"
          y1="${yi * scale + padding}"
          x2="${x * scale + padding}"
          y2="${y * scale + padding}"
          stroke="lightBlue"
          stroke-width="${0.02}"
        />
      `
      // svg += `
      //   <circle
      //     cx="${xi * scale + padding}"
      //     cy="${yi * scale + padding}"
      //     fill="${['white', 'red', 'green', 'blue', 'yellow'][status]}"
      //     r="${0.2}"
      //   />
      // `
    })
    let el = ref.current
    el.innerHTML = svg
    return () => {
      el.innerHTML = ''
    }
  }, [sim.boundaryCollisionDetector, showDecals])

  let polygons = sim.boundary.map(([polygon, inside]) => [
    polygon
      .map(([x, y]) => +(x * scale + padding) + ',' + +(y * scale + padding))
      .join(' '),
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
          cx={sim.params.spawnArea.x * scale + padding}
          cy={sim.params.spawnArea.y * scale + padding}
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
                x1={$.x * scale + padding}
                y1={$.y * scale + padding}
                x2={($.x + Math.cos($.rotation) * radius) * scale + padding}
                y2={($.y + Math.sin($.rotation) * radius) * scale + padding}
                stroke="green"
                strokeWidth={0.5}
                mask="url(#mask)"
              />
            )
          }
          const arc = [[$.x * scale + padding, $.y * scale + padding]]
          for (
            let t = $.rotation - $.rotationSpread;
            t < $.rotation + $.rotationSpread;
            t += 1 / 100
          ) {
            const x = Math.cos(t) * radius
            const y = Math.sin(t) * radius
            arc.push([($.x + x) * scale + padding, ($.y + y) * scale + padding])
          }
          return <polygon points={arc} fill="green" mask="url(#mask)" />
        })()}
      <g ref={ref} />
    </svg>
  )
}

export default ArenaViz
