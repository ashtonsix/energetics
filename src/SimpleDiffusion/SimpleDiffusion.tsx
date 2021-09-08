import React, {useState} from 'react'
import useInterval from '../useInterval'

const {PI, sin, cos} = Math

const gradientRedBlue = (x) => {
  x = 1 / (1 + 2 ** (8 - 16 * x))
  const mix = (a, b, m) => {
    m = Math.min(m, 1)
    return a * m + b * (1 - m)
  }
  const red = [255, 80, 80]
  const grey = [165, 165, 165]
  const blue = [80, 80, 255]
  const out =
    x < 0.5
      ? [
          mix(grey[0], blue[0], x * 2),
          mix(grey[1], blue[1], x * 2),
          mix(grey[2], blue[2], x * 2),
        ]
      : [
          mix(red[0], grey[0], x * 2 - 1),
          mix(red[1], grey[1], x * 2 - 1),
          mix(red[2], grey[2], x * 2 - 1),
        ]
  return `rgb(${out[0]}, ${out[1]}, ${out[2]})`
}

const Display = ({state}) => {
  const {cellEnergy, flowOrientation} = state
  const cx = 50
  const cy = 50
  const r = 30
  const s = 50

  const numCells = cellEnergy.length
  const fontSize = [0, 0, 16, 14, 12, 10, 9, 8, 7][numCells]
  const arrowSize = [0, 0, 3, 3, 2.5, 2, 1.5, 1, 1][numCells]
  const gapSize = [0, 0, 0.65, 0.55, 0.4, 0.3, 0.28, 0.24, 0.22][numCells] * PI
  const cellSize = [0, 0, 36, 28, 24, 18, 18, 16, 14][numCells]

  const arcSize = (PI * 2) / numCells - gapSize
  const arcs = new Array(numCells).fill(null).map((_, i) => {
    const bisector = (i / numCells) * PI * 2
    const lo = bisector + gapSize / 2
    const hi = lo + arcSize
    return [lo, hi]
  })
  const cells = new Array(numCells)
    .fill(null)
    .map((_, i) => (i / numCells) * PI * 2)

  return (
    <svg
      style={{width: '600px'}}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
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
      {arcs.map(([lo, hi], i) => (
        <polyline
          key={i}
          points={new Array(s)
            .fill(null)
            .map((_, i) => {
              const theta = lo + (hi - lo) / (s / i)
              return cx + cos(theta) * r + ',' + (cy + sin(theta) * r)
            })
            .join(' ')}
          fill="none"
          stroke="black"
          strokeWidth={arrowSize}
          markerStart={
            flowOrientation[i] === 'RIGHT' || flowOrientation[i] === 'BOTH'
              ? 'url(#arrowHead)'
              : null
          }
          markerEnd={
            flowOrientation[i] === 'LEFT' || flowOrientation[i] === 'BOTH'
              ? 'url(#arrowHead)'
              : null
          }
        />
      ))}
      {cells.map((theta, i) => {
        const x = cx + cos(theta) * r - cellSize / 2
        const y = cx + sin(theta) * r - cellSize / 2

        return (
          <g key={i}>
            <rect
              fill={gradientRedBlue(cellEnergy[i] / 100)}
              width={cellSize}
              height={cellSize}
              rx={3}
              stroke="black"
              strokeWidth={0.75}
              x={x}
              y={y}
            ></rect>
            <text
              fontSize={fontSize}
              x={x + cellSize / 2}
              y={y + cellSize / 2}
              dominantBaseline="middle"
              textAnchor="middle"
              fill="black"
            >
              {cellEnergy[i].toFixed(0)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

const initialise = ({cellNumber, flowOrientation, cellEnergy}) => {
  const s = {
    cellEnergy: null,
    flowOrientation: null,
  }
  if (cellEnergy === 'RANDOM') {
    s.cellEnergy = new Array(cellNumber).fill(null).map(() => Math.random())
    let total = s.cellEnergy.reduce((pv, v) => pv + v, 0)
    s.cellEnergy = s.cellEnergy.map((e) => (e / total) * (50 * cellNumber))
  }
  if (cellEnergy === 'ONE_HOT') {
    s.cellEnergy = new Array(cellNumber).fill(0)
    s.cellEnergy[Math.floor(Math.random() * cellNumber)] = 50 * cellNumber
  }

  if (flowOrientation === 'BIDIRECTIONAL') {
    s.flowOrientation = new Array(cellNumber).fill('BOTH')
  }
  if (flowOrientation === 'UNIFORM') {
    s.flowOrientation = new Array(cellNumber).fill(
      Math.random() < 1 / 2 ? 'LEFT' : 'RIGHT'
    )
  }
  if (flowOrientation === 'RANDOM') {
    s.flowOrientation = new Array(cellNumber)
      .fill(null)
      .map(() =>
        Math.random() < 1 / 3
          ? 'LEFT'
          : Math.random() < 1 / 2
          ? 'RIGHT'
          : 'BOTH'
      )
  }
  return s
}

const cycle = ({cellEnergy, flowOrientation}, flow) => {
  const leftRight = flowOrientation.map(() => ({left: false, right: false}))
  flowOrientation.forEach((o, i) => {
    const s0 = leftRight[i]
    const s1 = leftRight[(i + 1) % leftRight.length]
    if (o === 'LEFT' || o === 'BOTH') s0.left = true
    if (o === 'RIGHT' || o === 'BOTH') s1.right = true
  })

  const l = leftRight.length
  const delta = new Array(l).fill(0)
  cellEnergy.forEach((energy, i) => {
    const {left, right} = leftRight[i]
    delta[i] -= left || right ? energy * flow : 0
    const t = (left && right ? flow / 2 : flow) * energy
    if (left) {
      delta[(i + 1 + l) % l] += t
    }
    if (right) {
      delta[(i - 1 + l) % l] += t
    }
  })

  return {
    cellEnergy: cellEnergy.map((energy, i) => Math.max(energy + delta[i], 0)),
    flowOrientation,
  }
}

const DiffusionDemo = () => {
  const [playing, setPlaying] = useState(false)
  const [fastMode, setFastMode] = useState(false)
  const [cellNumber, setCellNumber] = useState(2)
  const [flow, setFlow] = useState(0.4)
  const [flowOrientation, setFlowOrientation] = useState('UNIFORM')
  const [cellEnergy, setCellEnergy] = useState('ONE_HOT')
  const [state, setState] = useState({
    cellEnergy: [0, 100],
    flowOrientation: ['LEFT', 'LEFT'],
  })

  useInterval(
    async () => {
      if (playing) setState(cycle(state, flow))
    },
    fastMode ? 6 : 300
  )

  return (
    <div>
      <div className="DiffusionDemo-ControlContainer">
        <style>
          {`
            .DiffusionDemo-ControlContainer {
              margin: 5px -5px 0;
            }
            .DiffusionDemo-ControlContainer * {
              margin: 0 5px;
            }
            .DiffusionDemo-ControlContainer .break {
              display: block;
              padding-top: 5px;
            }
          `}
        </style>
        {playing ? (
          <button onClick={() => setPlaying(false)}>Pause</button>
        ) : (
          <button onClick={() => setPlaying(true)}>Play</button>
        )}
        <button onClick={() => setState(cycle(state, flow))}>Step</button>
        <button
          onClick={() =>
            setState(initialise({cellNumber, flowOrientation, cellEnergy}))
          }
        >
          Reset
        </button>
        <span className="break" />
        <label>
          Cell Number
          <select
            onChange={(e) => {
              setCellNumber(+e.target.value)
              setState(
                initialise({
                  cellNumber: +e.target.value,
                  flowOrientation,
                  cellEnergy,
                })
              )
            }}
            defaultValue={cellNumber}
          >
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
            <option>7</option>
            <option>8</option>
          </select>
        </label>
        <label>
          Cell Energy
          <select
            onChange={(e) => {
              setCellEnergy(e.target.value)
              setState(
                initialise({
                  cellNumber,
                  flowOrientation,
                  cellEnergy: e.target.value,
                })
              )
            }}
            defaultValue={cellEnergy}
          >
            <option value="ONE_HOT">One Hot</option>
            <option value="RANDOM">Random</option>
          </select>
        </label>
        <label>
          Flow Orientation
          <select
            onChange={(e) => {
              setFlowOrientation(e.target.value)
              setState(
                initialise({
                  cellNumber,
                  flowOrientation: e.target.value,
                  cellEnergy,
                })
              )
            }}
            defaultValue={flowOrientation}
          >
            <option value="UNIFORM">Uniform</option>
            <option value="BIDIRECTIONAL">Bidirectional</option>
            <option value="RANDOM">Random</option>
          </select>
        </label>
        <label>
          Fast Mode
          <input
            type="checkbox"
            onChange={(e) => {
              setFastMode(e.target.checked)
            }}
            defaultChecked={fastMode}
          />
        </label>
        <span className="break" />
        <label>
          Flow Percentage ({(flow * 100).toFixed(2)}%)
          <span className="break" />
          <input
            type="range"
            defaultValue={flow}
            style={{width: '400px'}}
            min={0}
            max={1}
            step={1 / 1000}
            onChange={(e) => {
              let x = +e.target.value
              if (x <= 0.5) return setFlow(x)
              // prettier-ignore
              x = (x - 0.2) + (x - 0.5) * 5.5
              setFlow((10 ** x - 1) / 10 ** x)
            }}
          />
        </label>
      </div>
      {cellNumber === 2 ? (
        <p style={{maxWidth: 530}}>
          This model behaves identically to the{' '}
          <a
            href="https://www.youtube.com/watch?v=ovJcsL7vyrk"
            target="_blank"
            rel="noopener"
          >
            logistic map function
          </a>{' '}
          for r=1 to r=3, &lt;50% corresponds to r&lt;2, &gt;50% corresponds to
          r&gt;2.
        </p>
      ) : (
        <p>
          See how the model converges rapidly at 50%, and slower at the extremes
        </p>
      )}
      <br />
      <Display state={state} />
    </div>
  )
}

export default DiffusionDemo
