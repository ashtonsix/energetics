import React, {useState} from 'react'
import {generateFullStats} from './analysis'

const AnalysisDisplayTableOne = ({
  data,
  groups = [],
  rows = [],
  columns = [],
  notes = [],
}) => {
  let dataGrouped = {}
  data.forEach(({group, column, row, value}) => {
    if (!dataGrouped[group]) dataGrouped[group] = {}
    if (!dataGrouped[group][column]) dataGrouped[group][column] = {}
    dataGrouped[group][column][row] = value
  })
  return (
    <table className="stats-table">
      <tbody>
        <tr style={{fontWeight: 'bold'}}>
          <td style={{width: '125px'}}></td>
          {groups.map((g) => (
            <td colSpan={columns.length} key={g.key}>
              {g.label}
            </td>
          ))}
        </tr>
        <tr style={{fontWeight: 'bold'}}>
          <td></td>
          {[].concat(
            ...groups.map((g) => {
              return columns.map((c) => {
                return <td key={g.key + '.' + c.key}>{c.label}</td>
              })
            })
          )}
        </tr>
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
              {[].concat(
                ...groups.map((g) => {
                  return columns.map((c) => {
                    let value = dataGrouped[g.key]?.[c.key]?.[r.key]
                    return (
                      <td key={g.key + '.' + c.key}>
                        {typeof value !== 'number' ? null : value.toFixed(8)}
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

const AnalysisDisplayTable = ({defaultStats = []}) => {
  const [stats, setStats] = useState(defaultStats)
  const [showOptions, setShowOptions] = useState(false)
  const [tableOrganisation, setTableOrganisation] = useState([
    'stat',
    'method',
    'sample',
  ])
  // prettier-ignore
  const [indices, setIndices] = useState({
    stat: [
      {key: 'min', label: 'min', active: false},
      {key: 'minBits', label: 'min (bits)', active: false},
      {key: 'max', label: 'max', active: false},
      {key: 'maxBits', label: 'max (bits)', active: false},
      {key: 'trueMean', label: 'true mean', active: false},
      {key: 'mean', label: 'mean', active: false},
      {key: 'meanBits', label: 'mean (bits)', active: true},
      {key: 'meanDeviation', label: 'mean deviation', active: false},
      {key: 'meanDeviationBits', label: 'mean deviation (bits)', active: false},
      {key: 'maxDeviation', label: 'max deviation', active: false},
      {key: 'maxDeviationBits', label: 'max deviation (bits)', active: false},
      {key: 'meanBitsColumnStrategy', label: 'columns (bits)', active: false},
      {key: 'meanBitsBucketStrategy', label: 'buckets (bits)', active: false},
      {key: 'meanBitsLZMA', label: 'LZMA (bits)', active: false},
    ],
    method: [
      {key: 'basic', label: 'relative to origin', shortLabel: 'origin', active: true},
      {key: 'MSTEuclidean', label: 'relative to nearby particle (A)', shortLabel: 'relative (A)', active: true},
      {key: 'MSTInformation', label: 'relative to nearby particle (B)', shortLabel: 'relative (B)', active: true},
    ],
    sample: Array.from(new Set(defaultStats.map((s) => s.sample))).map((key) => {
      return {key: key, label: key, active: true}
    }),
    attribute: [
      {key: 'positionTheta', label: `position ( $\\theta$ )`, active: true},
      {key: 'positionMag', label: `true position ($\\|x\\|$)`, active: false},
      {key: 'positionMagSubRadii', label: `position ($\\|x\\|$)`, active: true},
      {key: 'velocityTheta', label: `velocity ( $\\theta$ )`, active: true},
      {key: 'velocityMag', label: `velocity ($\\|x\\|$)`, active: true},
      {key: 'radius', label: `radius`, active: true},
      {key: 'total', label: `total`, active: true},
    ]
  })

  let tableMap = {}
  indices[tableOrganisation[0]].forEach(({key}) => {
    tableMap[key] = []
  })
  stats.forEach((stat) => {
    let table = stat[tableOrganisation[0]]
    if (!tableMap[table]) return
    tableMap[table].push({
      group: stat[tableOrganisation[1]],
      column: stat[tableOrganisation[2]],
      row: stat.attribute,
      value: stat.value,
    })
  })
  let tables = indices[tableOrganisation[0]].map(({key, label, active}) => ({
    key,
    label,
    active,
    data: tableMap[key],
  }))
  let elements = []
  tables.forEach((table) => {
    if (!table.active || !stats.length) return
    elements.push(<p key={table.key + '.label'}>{table.label}</p>)
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
          display: showOptions ? 'block' : 'none',
          columnCount: 4,
          columnWidth: '240px',
          maxHeight: '300px',
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
                width: '100%',
                display: 'inline-block',
                paddingTop: '10px',
              }}
            >
              {index.label}:{' '}
              {indices[index.key].map(({key, label, active}) => (
                <label key={key} style={{fontSize: '0.8em', display: 'block'}}>
                  <input
                    type="checkbox"
                    onChange={() => {
                      let updated = JSON.parse(JSON.stringify(indices))
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
                  onClick={() => {
                    let fileUpload = document.createElement('input')
                    fileUpload.type = 'file'
                    fileUpload.addEventListener('change', (e) => {
                      let file = fileUpload.files[0]
                      let sampleName = file.name.split('.')[0]
                      const reader = new FileReader()
                      new Promise((resolve, reject) => {
                        reader.onload = (event) => resolve(event.target.result)
                        reader.onerror = (error) => reject(error)
                        reader.readAsText(file)
                      })
                        .then((content) => {
                          const sample = JSON.parse(content)
                          return generateFullStats(sample, sampleName)
                        })
                        .then((s) => {
                          setStats(stats.concat(s))
                          let updated = JSON.parse(JSON.stringify(indices))
                          updated.sample.push({
                            key: sampleName,
                            label: sampleName,
                            active: true,
                          })
                          setIndices(updated)
                        })
                    })
                    fileUpload.click()
                  }}
                >
                  Upload Sample
                </button>
              )}
            </div>
          )
        })}
      </div>
      {elements}
    </div>
  )
}

export default AnalysisDisplayTable
