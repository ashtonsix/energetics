import {useState} from 'react'
import Plot from 'react-plotly.js'
import csv from '../csv'
import {hsluvToHex} from 'hsluv'

const AnalysisDisplayChart = () => {
  const [analyses, setAnalyses] = useState(null)
  let min = 160
  let max = 0
  let series = []
  let attributes = [
    'positionMagTouching',
    'positionTheta',
    'velocityMag',
    'velocityTheta',
    'total',
  ]
  for (let i in attributes) {
    let attribute = attributes[i]
    let hue = i * 60
    let p25 = {
      x: [],
      y: [],
      fill: 'tozeroy',
      fillcolor: hsluvToHex([hue, 100, 50]) + '33',
      line: {color: 'transparent'},
      name: `${attribute} (p25/75)`,
      type: 'scatter',
    }
    let median = {
      x: [],
      y: [],
      type: 'scatter',
      mode: 'lines',
      name: `${attribute} (median)`,
      marker: {color: hsluvToHex([hue, 100, 50])},
    }
    for (let s of analyses ?? []) {
      if (s.attribute === attribute && s.stat === 'p75Bits') {
        p25.x.push(s.step)
        p25.y.push(s.value)
        if (s.attribute !== 'total') max = Math.max(max, s.value)
      }
      if (s.attribute === attribute && s.stat === 'p50Bits') {
        median.x.push(s.step)
        median.y.push(s.value)
      }
    }
    for (let s of (analyses ?? []).reverse()) {
      if (s.attribute === attribute && s.stat === 'p25Bits') {
        p25.x.push(s.step)
        p25.y.push(s.value)
        if (s.attribute !== 'total') min = Math.min(min, s.value)
      }
    }
    series.push(p25)
    series.push(median)
  }

  return (
    <div>
      <button
        onClick={async () => {
          let analyses
          analyses = await csv.upload()
          analyses = csv.parse(analyses[0].data)
          setAnalyses(analyses)
        }}
      >
        Upload Analyses
      </button>
      <br />
      <br />
      <div
        style={{
          padding: 10,
          border: '1px solid #ccc',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {analyses ? (
          <Plot
            data={series}
            layout={{
              // autosize: true,
              hovermode: false,
              yaxis: {
                title: 'Bits',
                zeroline: false,
                automargin: true,
                range: [min, max],
              },
              xaxis: {
                title: 'Step',
                zeroline: false,
                showline: false,
                automargin: true,
              },
              margin: {
                t: 20,
                l: 20,
                r: 20,
                b: 20,
              },
              width: Math.min(window.innerWidth, window.innerHeight) - 85,
              height: 320,
            }}
          />
        ) : (
          <img
            style={{paddingTop: 20, paddingRight: 10, maxWidth: '100%'}}
            src="/particle-txt/disorder-chart.png"
            alt="chart"
          />
        )}
      </div>
      <p style={{textAlign: 'center'}}>
        Change in disorder between random initial state and final state (
        <a href="/particle-txt/disorder-chart.csv" download>
          download analysis CSV
        </a>
        )
      </p>
    </div>
  )
}

export default AnalysisDisplayChart
