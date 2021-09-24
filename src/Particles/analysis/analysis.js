import vec from '../vec'
import Delaunator from 'delaunator'
import Heap from 'heap'
import LZMA from './LZMA'
const lzma = new LZMA()
const {min, max, abs, floor, ceil, round, log2, PI, acos, atan2} = Math

// Delaunay Triangulation
export const triangulate = {
  run(points, getCoords) {
    let coords = new Float32Array(points.length * 2)
    points.forEach((p, i) => {
      let [x, y] = getCoords(p)
      coords[i * 2 + 0] = x
      coords[i * 2 + 1] = y
    })
    return new Delaunator(coords)
  },
  forEachTriangle(delaunay, callback) {
    for (let t = 0; t < delaunay.triangles.length / 3; t++) {
      callback(
        [3 * t, 3 * t + 1, 3 * t + 2].map((e) => delaunay.triangles[e]),
        t
      )
    }
  },
  forEachEdge(delaunay, callback) {
    for (let e = 0; e < delaunay.triangles.length; e++) {
      if (e > delaunay.halfedges[e]) {
        const p = delaunay.triangles[e]
        const q = delaunay.triangles[e % 3 === 2 ? e - 2 : e + 1]
        callback([p, q], e)
      }
    }
  },
}

// Prim's lazy algorithm, with a modification to
// include the grandparent in weight calculation
export const minimumSpanningTree = (nodes, edges, getWeight) => {
  let marked = new Array(nodes).fill(false)

  let priorityQueue = new Heap((a, b) => a[2] - b[2])

  let parents = new Array(nodes).fill(-1)
  let parentsFound = 0
  let adjacent = new Array(nodes.length).fill(null).map(() => [])

  for (let [a, b] of edges) {
    adjacent[a].push(b)
    adjacent[b].push(a)
  }

  let visit = (b) => {
    marked[b] = true
    for (let a of adjacent[b]) {
      if (marked[a]) continue
      let c = parents[b] || -1
      // a=child, b=parent, c=grandparent
      let w = getWeight(a, b, c)
      priorityQueue.push([a, b, w])
    }
  }

  visit(0)

  while (priorityQueue.size() && parentsFound < nodes.length - 1) {
    let e = priorityQueue.pop()
    let [a, b] = e
    if (marked[a]) continue

    parents[a] = b
    parentsFound++
    visit(a)
  }

  let mst = []
  for (let a in parents) {
    let b = parents[a]
    if (b !== -1) mst.push([+a, b])
  }

  return {edgelist: mst, root: 0}
}

export const getSample = (sim) => {
  return sim.particles.map((p) => {
    return {position: p.position, velocity: p.velocity, radius: p.radius}
  })
}

const scaleParticles = (particles) => {
  return particles.map((p) => ({
    position: vec.mult(p.position, 2),
    velocity: vec.mult(p.velocity, 2 / 1000),
    radius: p.radius * 2,
  }))
}

export const bits = (x) => log2(abs(x) + 2 ** -29) + 30

const difference = (a, b, radial) => {
  let diff = a - b
  if (radial) {
    diff = (diff + PI * 2) % (PI * 2)
    if (diff > PI) diff -= 2 * PI
  }
  return diff
}

export const getEdgesDelaunay = (data) => {
  data = scaleParticles(data)
  let delaunay = triangulate.run(data, (p) => p.position)
  let edgelist = []
  triangulate.forEachEdge(delaunay, ([a, b]) => {
    let na = data[a]
    let nb = data[b]
    let positionMag = vec.length(vec.sub(na.position, nb.position))
    let positionMagBits = bits(positionMag)
    let positionMagTouching = positionMag - (na.radius + nb.radius)
    let positionMagTouchingBits = bits(positionMagTouching)
    let velocityMag = vec.length(vec.sub(na.velocity, nb.velocity))
    let velocityMagBits = bits(velocityMag)
    // prettier-ignore
    let velocityTheta = acos(vec.cosineSimilarity(na.velocity, nb.velocity))
    let velocityThetaBits = bits(velocityTheta)
    let radius = na.radius - nb.radius
    let radiusBits = bits(radius)
    edgelist.push({
      a,
      b,
      positionMag,
      positionMagBits,
      positionMagTouching,
      positionMagTouchingBits,
      positionTheta: null,
      positionThetaBits: null,
      velocityMag,
      velocityMagBits,
      velocityTheta,
      velocityThetaBits,
      radius,
      radiusBits,
      totalBits: null,
    })
  })

  let nodelist = new Array(data.length).fill(null).map(() => [])

  for (let e of edgelist) {
    let {a, b} = e
    nodelist[a].push(e)
    nodelist[b].push(e)
  }

  let other = (n, e) => (e.a === +n ? e.b : e.a)
  for (let n in nodelist) {
    let edges = nodelist[n]
    let angles = {}
    for (let e of edges) {
      let o = other(n, e)
      let v = vec.sub(data[n].position, data[o].position)
      angles[o] = atan2(v[1], v[0])
    }
    edges.sort((a, b) => {
      return angles[other(n, a)] - angles[other(n, b)]
    })
    for (let i in edges) {
      let a = edges[(+i - 1 + edges.length) % edges.length]
      let b = edges[+i]
      let c = edges[(+i + 1) % edges.length]
      a = abs(difference(angles[other(n, a)], angles[other(n, b)], true))
      c = abs(difference(angles[other(n, b)], angles[other(n, c)], true))
      let diff = abs(max(a, c) - min(a, c) * round(max(a, c) / min(a, c)))
      // compare(59, 180) = 3, because |177 - 180| = 3
      if (b.positionTheta === null) {
        b.positionTheta = diff
      } else {
        b.positionTheta += diff
        b.positionTheta /= 2
        b.positionThetaBits = bits(b.positionTheta)
      }
    }
  }

  for (let e of edgelist) {
    e.totalBits =
      e.positionMagTouchingBits +
      e.positionThetaBits +
      e.velocityMagBits +
      e.velocityThetaBits +
      e.radiusBits
  }

  return edgelist
}

// first do: let edges = getEdgesDelaunay(data)
export const getEdgesMST = (data, edges, metric) => {
  data = scaleParticles(data)
  let edgemap = new Array(edges.length)
  let edgelist = new Array(edges.length)
  edges.forEach((e, i) => {
    edgemap[min(e.a, e.b) + ',' + max(e.a, e.b)] = e
    edgelist[i] = [e.a, e.b]
  })

  let mst = minimumSpanningTree(data, edgelist, (a, b, c) => {
    if (c === -1) c = a
    let e = edgemap[min(a, b) + ',' + max(a, b)]
    let v1 = vec.sub(data[a].position, data[b].position)
    let v2 = vec.sub(data[b].position, data[c].position)
    let angle1 = atan2(v1[1], v1[0])
    let angle2 = atan2(v2[1], v2[0])
    e.positionTheta = difference(angle1, angle2, true)
    e.positionThetaBits = bits(e.positionTheta)
    e.totalBits =
      e.positionMagTouchingBits +
      e.positionThetaBits +
      e.velocityMagBits +
      e.velocityThetaBits +
      e.radiusBits
    return e[metric]
  })

  return mst.edgelist.map(([a, b]) => edgemap[min(a, b) + ',' + max(a, b)])
}

export const getEdgesBaseline = (data) => {
  return data.map((d, i) => {
    let v = vec.sub(d.position, [1, 1]) // relative to center
    let positionMag = vec.length(v)
    let positionMagBits = bits(positionMag)
    let positionMagTouching = positionMag - d.radius
    let positionMagTouchingBits = bits(positionMagTouching)
    let positionTheta = atan2(v[1], v[0])
    let positionThetaBits = bits(positionTheta)
    let velocityMag = vec.length(d.velocity)
    let velocityMagBits = bits(velocityMag)
    let velocityTheta = atan2(d.velocity[1], d.velocity[0])
    let velocityThetaBits = bits(velocityTheta)
    let radius = d.radius
    let radiusBits = bits(radius)
    let totalBits =
      positionMagTouchingBits +
      positionThetaBits +
      velocityMagBits +
      velocityThetaBits +
      radiusBits

    return {
      a: i,
      b: -1,
      positionMag,
      positionMagBits,
      positionMagTouching,
      positionMagTouchingBits,
      positionTheta,
      positionThetaBits,
      velocityMag,
      velocityMagBits,
      velocityTheta,
      velocityThetaBits,
      radius,
      radiusBits,
      totalBits,
    }
  })
}

const getMean = (a, f) => {
  return a.reduce((pv, v) => pv + f(v), 0) / a.length
}
const getPercentiles = (a, k, p) => {
  let sorted = a.slice().sort((a, b) => abs(a[k]) - abs(b[k]))
  return p.map((p) => {
    let i
    i = floor(a.length * p)
    i = max(min(i, a.length - 1), 0)
    return abs(sorted[i][k])
  })
}
const getVarwidthBits = (a, k) => {
  k = k.replace('Bits', '')
  let value = 0
  let sorted = a.map((v) => abs(v[k])).sort((a, b) => a - b)
  let Varwidths = [0.5, 0.75, 0.875, 1].map((x) => {
    return sorted[floor(x * (a.length - 1))]
  })
  for (let i in a) {
    let c = Varwidths.filter((b) => b >= abs(a[i][k]))
    let v = ceil(bits(min(...c)))
    value += v / a.length
  }
  return value
}
const getLZMABits = (data) => {
  let dataBuffer = new Int32Array(data.length)
  for (let i in data) {
    dataBuffer[i] = floor(data[i] * 2 ** 29)
  }

  return new Promise((resolve, reject) => {
    lzma.compress(
      dataBuffer,
      1, // supposedly affects speed/quality trade-off, makes no difference in practice
      (result, error) => {
        if (error) console.error(error)
        resolve((result?.length || 0) * 8)
      },
      (percentComplete) => {}
    )
  })
}

export const statsBreakdown = (data, sampleName, async) => {
  let byMethod = [
    {method: 'baseline', data: getEdgesBaseline(data)},
    {method: 'delaunay', data: getEdgesDelaunay(data)},
  ]
  for (let metric of [
    'positionMag',
    // 'positionMagBits',
    // 'positionMagTouchingBits',
    // 'positionThetaBits',
    // 'velocityMagBits',
    // 'velocityThetaBits',
    // 'radiusBits',
    'totalBits',
  ]) {
    let delaunay = byMethod[1].data
    byMethod.push({
      method: 'mst.' + metric,
      data: getEdgesMST(data, delaunay, metric),
    })
  }
  let stats = []
  for (let {method, data} of byMethod) {
    let s = []
    for (let attribute of [
      'positionMag',
      'positionMagBits',
      'positionMagTouching',
      'positionMagTouchingBits',
      'positionTheta',
      'positionThetaBits',
      'velocityMag',
      'velocityMagBits',
      'velocityTheta',
      'velocityThetaBits',
      'radius',
      'radiusBits',
      'totalBits',
    ]) {
      let isBits = attribute.endsWith('Bits')
      let mean = getMean(data, (v) => abs(v[attribute]))

      let [min, p5, p25, p50, p75, p95, max] = getPercentiles(
        data,
        attribute,
        [0, 0.05, 0.25, 0.5, 0.75, 0.95, 1]
      )
      let ss = {min, p5, p25, p50, p75, p95, max, mean}
      let trueMean = getMean(data, (v) => v[attribute.replace('Bits', '')])
      if (!isBits) {
        ss.trueMean = trueMean
      }
      if (attribute !== 'totalBits') {
        ss.meanDeviation = getMean(data, (v) => {
          let diff = difference(
            v[attribute.replace('Bits', '')],
            trueMean,
            attribute.includes('Theta')
          )
          return isBits ? bits(diff) : abs(diff)
        })
      }
      if (isBits && attribute !== 'totalBits') {
        ss.column = ceil(ss.max)
        ss.varwidth = getVarwidthBits(data, attribute)
        let lzmaPrepared = data.map((v) => v[attribute])
        ss.lzma = getLZMABits(lzmaPrepared).then((v) => v / data.length)
      }
      for (let stat in ss) {
        let statName = isBits ? stat + 'Bits' : stat
        // prettier-ignore
        s.push({sample: sampleName, method, attribute: attribute.replace('Bits', ''), stat: statName, value: ss[stat]})
      }
    }
    let totalContributors = [
      'positionMagTouching',
      'positionTheta',
      'velocityMag',
      'velocityTheta',
      'radius',
    ]
    let trueMeans = {}
    for (let ss of s) {
      if (!totalContributors.includes(ss.attribute)) continue
      if (ss.stat === 'trueMean') trueMeans[ss.attribute] = ss.value
    }
    let meanDeviationBitsTotal = getMean(data, (v) => {
      let deviation = 0
      for (let k in trueMeans) {
        deviation += bits(difference(v[k], trueMeans[k], k.includes('Theta')))
      }
      return deviation
    })
    let columnBitsTotal = 0
    let varwidthBitsTotal = 0
    for (let ss of s) {
      if (!totalContributors.includes(ss.attribute)) continue
      if (ss.stat === 'columnBits') columnBitsTotal += ss.value
      if (ss.stat === 'varwidthBits') varwidthBitsTotal += ss.value
    }
    let lzmaPrepared = []
    for (let d of data) {
      for (let k of totalContributors) {
        lzmaPrepared.push(d[k])
      }
    }
    let lzmaBitsTotal = getLZMABits(lzmaPrepared).then((v) => v / data.length)
    for (let {stat, value} of [
      {stat: 'meanDeviationBits', value: meanDeviationBitsTotal},
      {stat: 'columnBits', value: columnBitsTotal},
      {stat: 'varwidthBits', value: varwidthBitsTotal},
      {stat: 'lzmaBits', value: lzmaBitsTotal},
    ]) {
      s.push({sample: sampleName, method, attribute: 'total', stat, value})
    }
    for (let ss of s) stats.push(ss)
  }

  let p = []
  for (let s of stats) {
    if (s.value instanceof Promise) {
      p.push(s.value)
      s.value = s.value.then((v) => {
        s.value = v
        return v
      })
    }
  }

  if (async) {
    return Promise.all(p).then(() => stats)
  } else {
    return stats
  }
}

export const statsBreakdownMini = (data) => {
  data = getEdgesDelaunay(data)

  let stats = []
  for (let attribute of [
    'positionMagTouchingBits',
    'positionThetaBits',
    'velocityMagBits',
    'velocityThetaBits',
    'radiusBits',
    'totalBits',
  ]) {
    let mean = getMean(data, (v) => abs(v[attribute]))

    let [min, p5, p25, p50, p75, p95, max] = getPercentiles(
      data,
      attribute,
      [0, 0.05, 0.25, 0.5, 0.75, 0.95, 1]
    )
    let ss = {min, p5, p25, p50, p75, p95, max, mean}
    for (let stat in ss) {
      let statName = stat + 'Bits'
      // prettier-ignore
      stats.push({attribute: attribute.replace('Bits', ''), stat: statName, value: ss[stat]})
    }
  }

  return stats
}
