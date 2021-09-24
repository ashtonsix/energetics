import csv from '../csv'
import vec from '../vec'
import {bits} from './analysis'
import {collide} from '../Simulation'
import {useState} from 'react'

const {sin, cos, atan2} = Math

let vecRotate = ([x, y], rad) => {
  return [cos(rad) * x - sin(rad) * y, sin(rad) * x + cos(rad) * y]
}

export const normaliseCollision = ({p1, p2}) => {
  let scaleRadius = 1 / p1.radius
  let translate = p1.position
  let rotate = -atan2(p1.velocity[1], p1.velocity[0])
  let scaleVelocity = 1 / vec.length(p1.velocity)

  p1 = {radius: 1, position: [0, 0], velocity: [1, 0]}
  p2 = {
    radius: p2.radius * scaleRadius,
    position: vec.setLength(
      vecRotate(vec.sub(p2.position, translate), rotate),
      1
    ),
    velocity: vec.mult(vecRotate(p2.velocity, rotate), scaleVelocity),
  }

  let flip = p2.position[1] < 0
  if (flip) {
    p2.position[1] *= -1
    p2.velocity[1] *= -1
  }

  return {p1, p2}
}

const simplifyCollision = ({p2}) => ({
  contactPoint: Math.atan2(p2.position[1], p2.position[0]),
  relativeVelocity: vec.sub(p2.velocity, [1, 0]),
  relativeRadius: p2.radius,
})

const doCollision = (
  {p1, p2},
  {elasticity, constantMass, constantVelocity}
) => {
  let x = {p1, p2}
  x = normaliseCollision(x)
  x.p1.mass = 1
  x.p2.mass = constantMass ? 1 : p2.radius ** 2
  if (constantVelocity) x.p2.velocity = vec.setLength(x.p2.velocity, 1)
  let y = JSON.parse(JSON.stringify(x))
  collide(y.p1, y.p2, elasticity, constantVelocity)
  y = normaliseCollision(y)
  let beforeCollision = simplifyCollision(x)
  let afterCollision = simplifyCollision(y)
  delete afterCollision.contactPoint
  delete afterCollision.relativeRadius
  let informationChange = {
    orientation:
      bits(atan2(y.p2.velocity[1], y.p2.velocity[0])) -
      bits(atan2(x.p2.velocity[1], x.p2.velocity[0])),
    velocity:
      bits(vec.length(afterCollision.relativeVelocity)) -
      bits(vec.length(beforeCollision.relativeVelocity)),
    momentum:
      bits(vec.length(vec.mult(afterCollision.relativeVelocity, x.p2.mass))) -
      bits(vec.length(vec.mult(beforeCollision.relativeVelocity, x.p2.mass))),
  }
  let parameters = {elasticity, constantMass, constantVelocity}

  return {
    beforeCollision,
    afterCollision,
    informationChange,
    parameters,
  }
}

const AnalysisCollisions = () => {
  const [filename, setFilename] = useState(null)
  const [collisions, setCollisions] = useState(null)
  const [stats, setStats] = useState({
    mean: {orientation: 0.01069, velocity: 0.00171, momentum: 0.00171},
    range: {
      orientation: [-0.29752, 0.3099],
      velocity: [-0.52055, 0.51137],
      momentum: [-0.52055, 0.51137],
    },
  })
  const [elasticity, setElasticity] = useState(1)
  const [constantMass, setConstantMass] = useState(false)
  const [constantVelocity, setConstantVelocity] = useState(false)

  const doMath = () => {
    let results = collisions.map((c) =>
      doCollision(c, {elasticity, constantMass, constantVelocity})
    )
    let mean = results.reduce(
      (pv, v) => {
        let l = results.length
        pv.orientation += v.informationChange.orientation / l
        pv.velocity += v.informationChange.velocity / l
        pv.momentum += v.informationChange.momentum / l
        return pv
      },
      {orientation: 0, velocity: 0, momentum: 0}
    )
    let p25 = Math.floor(results.length * 0.25)
    let p75 = Math.floor(results.length * 0.75)
    let ic = results.map((c) => c.informationChange)
    let o = ic.map((c) => c.orientation).sort((a, b) => a - b)
    let v = ic.map((c) => c.velocity).sort((a, b) => a - b)
    let m = ic.map((c) => c.momentum).sort((a, b) => a - b)
    let range = {
      orientation: [o[p25], o[p75]],
      velocity: [v[p25], v[p75]],
      momentum: [m[p25], m[p75]],
    }

    setStats({mean, range})
    return results
  }

  return (
    <div>
      <span>Step 1: Upload collisions.csv</span>
      <br />
      <button
        onClick={() => {
          csv.upload().then(([{filename, data: filecontent}]) => {
            let collisions = csv.parse(filecontent)
            collisions = collisions.filter((c) => c.particle1.uid)
            // prettier-ignore
            collisions = collisions.map((c) => ({p1: c.particle0, p2: c.particle1}))
            collisions = collisions.map((c) => normaliseCollision(c))
            setCollisions(collisions)
            setFilename(filename)
          })
        }}
      >
        Upload collisions.csv
      </button>
      {!!filename && <span> {filename} uploaded</span>}
      <br />
      <br />
      <span>Step 2: Set parameters</span>
      <br />
      <label>
        Elasticity
        <br />
        <input
          disabled={!collisions}
          defaultValue={elasticity.toFixed(2)}
          onChange={(e) => {
            let v = Math.max(Math.min(+e.target.value, 2), 0)
            setElasticity(isNaN(v) ? 1 : v)
          }}
          onBlur={(e) => {
            e.target.value = elasticity.toFixed(2)
          }}
        />
      </label>
      <br />
      <label>
        Constant Mass
        <input
          disabled={!collisions}
          checked={constantMass}
          type="checkbox"
          onChange={(e) => {
            setConstantMass(e.target.checked)
            if (!e.target.checked) setConstantVelocity(false)
          }}
        />
      </label>
      <br />
      <label>
        Constant Velocity
        <input
          disabled={!collisions}
          checked={constantVelocity}
          type="checkbox"
          onChange={(e) => {
            setConstantVelocity(e.target.checked)
            if (e.target.checked) setConstantMass(true)
          }}
        />
      </label>
      <br />
      <br />
      <span>Step 3: Do Math</span>
      <br />
      <button disabled={!collisions} onClick={doMath}>
        Do Math
      </button>
      <button
        disabled={!collisions}
        style={{marginLeft: 10}}
        onClick={() => {
          let results = doMath()
          csv.download(
            csv.serialise(results, [
              'parameters.elasticity',
              'parameters.constantMass',
              'parameters.constantVelocity',
              'beforeCollision.contactPoint',
              'beforeCollision.relativeVelocity.0',
              'beforeCollision.relativeVelocity.1',
              'beforeCollision.relativeRadius',
              'afterCollision.relativeVelocity.0',
              'afterCollision.relativeVelocity.1',
              'informationChange.orientation',
              'informationChange.velocity',
              'informationChange.momentum',
            ]),
            filename.split('.')[0] + '-normalised.csv'
          )
        }}
      >
        Do Math and Download
      </button>
      <br />
      <ol>
        <li>
          Δ Relative Orientation
          <ul>
            <li>Average: {stats.mean.orientation.toFixed(5)}</li>
            <li>
              p25 to p75: {stats.range.orientation[0].toFixed(5)} to{' '}
              {stats.range.orientation[1].toFixed(5)}
            </li>
          </ul>
        </li>
        <li>
          Δ Relative Velocity
          <ul>
            <li>Average: {stats.mean.velocity.toFixed(5)}</li>
            <li>
              p25 to p75: {stats.range.velocity[0].toFixed(5)} to{' '}
              {stats.range.velocity[1].toFixed(5)}
            </li>
          </ul>
        </li>
        <li>
          Δ Relative Momentum
          <ul>
            <li>Average: {stats.mean.momentum.toFixed(5)}</li>
            <li>
              p25 to p75: {stats.range.momentum[0].toFixed(5)} to{' '}
              {stats.range.momentum[1].toFixed(5)}
            </li>
          </ul>
        </li>
      </ol>
    </div>
  )
}

export default AnalysisCollisions
