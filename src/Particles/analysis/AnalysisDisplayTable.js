import React, {useState} from 'react'
import {statsBreakdown} from './analysis'
import Tex from '../Tex'
import csv from '../csv'

const AnalysisDisplayTableOne = ({
  data,
  groups = [],
  rows = [],
  columns = [],
  notes = [],
}) => {
  let [, setNonce] = useState(0)
  let p = []
  let dataGrouped = {}
  data.forEach(({group, column, row, value}) => {
    if (!dataGrouped[group]) dataGrouped[group] = {}
    if (!dataGrouped[group][column]) dataGrouped[group][column] = {}
    dataGrouped[group][column][row] = value
    if (value instanceof Promise) {
      dataGrouped[group][column][row] = null
      p.push(value)
      value.then((value) => {
        dataGrouped[group][column][row] = value
      })
    }
  })
  if (p.length) Promise.all(p).then(() => setNonce(Math.random()))
  return (
    <table className="stats-table">
      <tbody>
        {groups.length > 1 && (
          <tr style={{fontWeight: 'bold'}}>
            <td style={{width: '125px'}}>
              {columns.length > 1 ? '' : 'attribute'}
            </td>
            {groups.map((g) => (
              <td colSpan={columns.length} key={g.key}>
                {g.label}
              </td>
            ))}
          </tr>
        )}
        {columns.length > 1 && (
          <tr style={{fontWeight: 'bold'}}>
            <td>attribute</td>
            {[].concat(
              ...(groups.length ? groups : [{key: 'blank'}]).map((g) => {
                return columns.map((c) => {
                  return <td key={g.key + '.' + c.key}>{c.label}</td>
                })
              })
            )}
          </tr>
        )}
        {columns.length <= 1 && groups.length <= 1 && (
          <tr style={{fontWeight: 'bold'}}>
            <td>attribute</td>
            <td>value</td>
          </tr>
        )}
        {notes.map((note, i) => {
          return (
            <tr key={i}>
              <td colSpan={columns.length * groups.length + 1}>{note}</td>
            </tr>
          )
        })}
        {rows.map((r) => {
          return (
            <tr key={r.key}>
              <td>{r.label}</td>
              {!columns.length || !groups.length
                ? new Array(Math.max(columns.length, groups.length, 1))
                    .fill(null)
                    .map((_, i) => <td key={i}></td>)
                : [].concat(
                    ...groups.map((g) => {
                      return columns.map((c) => {
                        let value = dataGrouped[g.key]?.[c.key]?.[r.key]
                        return (
                          <td key={g.key + '.' + c.key}>
                            {typeof value !== 'number'
                              ? null
                              : value.toFixed(8)}
                          </td>
                        )
                      })
                    })
                  )}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

const AnalysisDisplayTable = ({statsFromProps = []}) => {
  const [uploadedStats, setUploadedStats] = useState([])
  const [showOptions, setShowOptions] = useState(false)
  const [tableOrganisation, setTableOrganisation] = useState([
    'stat',
    'method',
    'sample',
  ])
  // prettier-ignore
  let [indices, setIndices] = useState({
    stat: [
      {key: 'p5', label: 'p5', active: false},
      {key: 'p5Bits', label: 'p5 (bits)', active: false},
      {key: 'p25', label: 'p25', active: false},
      {key: 'p25Bits', label: 'p25 (bits)', active: false},
      {key: 'p50', label: 'p50', active: false},
      {key: 'p50Bits', label: 'p50 (bits)', active: false},
      {key: 'p75', label: 'p75', active: false},
      {key: 'p75Bits', label: 'p75 (bits)', active: false},
      {key: 'p95', label: 'p95', active: false},
      {key: 'p95Bits', label: 'p95 (bits)', active: false},
      {key: 'mean', label: 'mean', active: false},
      {key: 'meanBits', label: 'mean (bits)', active: true},
      {key: 'meanDeviation', label: 'mean deviation', active: false},
      {key: 'meanDeviationBits', label: 'mean deviation (bits)', active: false},
      {key: 'columnBits', label: 'columns (bits)', active: false},
      {key: 'varwidthBits', label: 'buckets (bits)', active: false},
      {key: 'lzmaBits', label: 'LZMA (bits)', active: false},
    ],
    method: [
      {key: 'baseline',  label: 'relative to origin', shortLabel: 'origin', active: false},
      {key: 'delaunay', label: 'relative to nearby particle (Δ)', shortLabel: 'relative (Δ)', active: true},
      {key: 'mst.positionMag', label: 'relative to nearby particle (→)', shortLabel: 'relative (→)', active: false},
      {key: 'mst.totalBits', label: 'relative to nearby particle (Σ)', shortLabel: 'relative (Σ)', active: false},
    ],
    sample: [],
    attribute: [
      {key: 'positionMag', label: <>position (<Tex>{`\\|x\\|`}</Tex>)</>, active: false},
      {key: 'positionMagTouching', label: <>position (<Tex>{`\\|x\\| - r`}</Tex>)</>, active: true},
      {key: 'positionTheta', label: <>position (<Tex>{`\\theta`}</Tex>)</>, active: true},
      {key: 'velocityMag', label: <>velocity (<Tex>{`\\|x\\|`}</Tex>)</>, active: true},
      {key: 'velocityTheta', label: <>velocity (<Tex>{`\\theta`}</Tex>)</>, active: true},
      {key: 'radius', label: <>radius</>, active: true},
      {key: 'total', label: <>total</>, active: true},
    ]
  })

  let stats = [].concat(statsFromProps, uploadedStats)
  indices = {
    ...indices,
    sample: Array.from(new Set(stats.map((s) => s.sample))).map((key) => {
      let current = indices.sample.find((i) => i.key === key)
      return {
        key: key,
        label: key,
        active: current?.active == null ? true : current.active,
      }
    }),
  }

  let tableMap = {}
  indices[tableOrganisation[0]].forEach(({key}) => {
    tableMap[key] = []
  })
  stats.forEach((stat) => {
    let table = stat[tableOrganisation[0]]
    if (!tableMap[table]) return
    let s = {
      group: stat[tableOrganisation[1]],
      column: stat[tableOrganisation[2]],
      row: stat.attribute,
      value: stat.value,
    }
    if (s.value instanceof Promise) {
      s.value.then((v) => {
        s.value = v
        return v
      })
    }
    tableMap[table].push(s)
  })
  let tables = indices[tableOrganisation[0]]
    .filter((t) => t.active)
    .map(({key, label}) => ({key, label, data: tableMap[key]}))
  let elements = []
  tables.forEach((table) => {
    if (!stats.length) return
    if (tables.length > 1) {
      elements.push(<p key={table.key + '.label'}>{table.label}</p>)
    } else {
      elements.push(
        <span key="padding" style={{display: 'block', paddingTop: '1em'}} />
      )
    }
    elements.push(
      <AnalysisDisplayTableOne
        key={table.key + '.table'}
        data={table.data}
        groups={indices[tableOrganisation[1]].filter((i) => i.active)}
        columns={indices[tableOrganisation[2]]
          .filter((i) => i.active)
          .map((c) => {
            if (c.shortLabel) c = {...c, label: c.shortLabel}
            return c
          })}
        rows={indices.attribute.filter((i) => i.active)}
      />
    )
  })

  const caps = (s) => s[0].toUpperCase() + s.slice(1)
  return (
    <div>
      <button onClick={() => setShowOptions(!showOptions)}>
        {showOptions ? 'Show Less' : 'Show More'}
      </button>
      <label
        style={{display: showOptions ? 'block' : 'none', paddingTop: '10px'}}
      >
        <span style={{paddingRight: '10px'}}>Table Organisation:</span>
        <select
          onChange={(e) => setTableOrganisation(e.target.value.split(','))}
          defaultValue={tableOrganisation.join(',')}
        >
          <option value="stat,method,sample">Stats ⇒ Methods ⇒ Samples</option>
          <option value="stat,sample,method">Stats ⇒ Samples ⇒ Methods</option>
          <option value="method,stat,sample">Methods ⇒ Stats ⇒ Samples</option>
          <option value="method,sample,stat">Methods ⇒ Samples ⇒ Stats</option>
          <option value="sample,method,stat">Samples ⇒ Methods ⇒ Stats</option>
          <option value="sample,stat,method">Samples ⇒ Stats ⇒ Methods</option>
        </select>
      </label>
      <div
        style={{
          display: showOptions ? 'flex' : 'none',
          flexDirection: 'column',
          flexWrap: 'wrap',
          maxHeight: '290px',
        }}
      >
        {[
          {
            key: tableOrganisation[0],
            label: 'Tables (' + caps(tableOrganisation[0]) + 's)',
          },
          {
            key: tableOrganisation[1],
            label: 'Groups (' + caps(tableOrganisation[1]) + 's)',
          },
          {
            key: tableOrganisation[2],
            label: 'Columns (' + caps(tableOrganisation[2]) + 's)',
          },
          {key: 'attribute', label: 'Rows (Attributes)'},
        ].map((index) => {
          return (
            <div
              key={index.key}
              style={{
                display: 'inline-block',
                flexBasis: 0,
                paddingTop: '10px',
              }}
            >
              {index.label}:{' '}
              <div
                style={
                  index.key === 'stat' ? {columnCount: 2, width: '340px'} : {}
                }
              >
                {indices[index.key].map(({key, label, active}) => (
                  <label
                    key={key}
                    style={{fontSize: '0.8em', display: 'block'}}
                  >
                    <input
                      type="checkbox"
                      onChange={() => {
                        let updated = {
                          ...indices,
                          [index.key]: indices[index.key].map((v) => ({...v})),
                        }
                        let u = updated[index.key]
                        u = u.find((u) => u.key === key)
                        u.active = !u.active
                        setIndices(updated)
                      }}
                      defaultChecked={active}
                    />
                    {label}
                  </label>
                ))}
                {index.key === 'sample' && (
                  <button
                    style={{display: 'block'}}
                    onClick={() => {
                      csv
                        .upload()
                        .then(({filename, data}) => {
                          return statsBreakdown(
                            csv.parse(data.split('\n').slice(2)),
                            filename.split('.')[0]
                          )
                        })
                        .then((sample) => {
                          setUploadedStats(uploadedStats.concat(sample))
                        })
                    }}
                  >
                    Upload Another Sample
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {elements}
    </div>
  )
}

export default AnalysisDisplayTable
