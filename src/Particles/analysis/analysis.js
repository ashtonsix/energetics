import MakeSet from 'union-find'
import vec from '../vec'
import Delaunator from 'delaunator'
import LZMA from './LZMA'
const lzma = new LZMA()

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

const addSecondDegreeConnections = (edgelist, nodecount) => {
  let grouped = new Array(nodecount).fill(null).map(() => [])

  for (let i in edgelist) {
    let [a, b] = edgelist[i]
    grouped[a].push(b)
    grouped[b].push(a)
  }

  let grouped2 = new Array(nodecount).fill(null).map(() => [])
  for (let i in grouped) {
    grouped2[i].push(...grouped[i])
    for (let j of grouped[i]) {
      grouped2[i].push(...grouped[j])
    }
  }

  let edgelist2 = []
  for (let a in grouped2) {
    for (let b of grouped2[a]) {
      edgelist2.push([+a, b])
    }
  }

  let seen = {}
  edgelist2 = edgelist2.filter(([a, b]) => {
    if (a === b) return false
    let k = Math.min(a, b) + ',' + Math.max(a, b)
    if (seen[k]) return false
    seen[k] = true
    return true
  })

  return edgelist2
}

// Kruskal's Algorithm
export const minimumSpanningTree = (nodes, edges, getWeight) => {
  let prunedEdges = []

  let disjointSet = new MakeSet(nodes.length)

  let weightedEdges = []
  for (let i in edges) {
    let u = edges[i][0]
    let v = edges[i][1]
    let e = {edge: edges[i], weight: getWeight(nodes[u], nodes[v])}
    weightedEdges.push(e)
  }

  weightedEdges.sort(function (a, b) {
    return a.weight - b.weight
  })

  for (let i = 0; i < weightedEdges.length; i++) {
    let u = weightedEdges[i].edge[0]
    let v = weightedEdges[i].edge[1]

    if (disjointSet.find(u) !== disjointSet.find(v)) {
      prunedEdges.push([u, v])
      disjointSet.link(u, v)
    }
  }

  let maxRank = disjointSet.ranks[0]
  let maxRankIndex = 0

  for (var i = 0; i < disjointSet.ranks.length; i++) {
    if (disjointSet.ranks[i] > maxRank) {
      maxRankIndex = i
      maxRank = disjointSet.ranks[i]
    }
  }

  return {
    edgelist: prunedEdges,
    root: disjointSet.roots[maxRankIndex],
  }
}

const edgelistToTree = (edgelist, root) => {
  let grouped = new Array(edgelist.length + 1).fill(null).map(() => [])

  for (let i in edgelist) {
    let [a, b] = edgelist[i]
    grouped[a].push(b)
    grouped[b].push(a)
  }

  let tree = {index: root, parent: -1, children: [], depth: 0}
  let queue = [tree]
  let nodelist = [tree]
  while (queue.length) {
    let node = queue.shift()
    let children = grouped[node.index]
    for (let j = 0; j < children.length; j++) {
      if (children[j] !== node.parent) {
        let child = {
          index: children[j],
          parent: node.index,
          children: [],
          depth: node.depth + 1,
        }
        node.children.push(child)
        queue.push(child)
        nodelist.push(child)
      }
    }
  }
  nodelist = nodelist.map((c) => ({
    ...c,
    children: c.children.map((c) => c.index),
  }))
  return {tree, nodelist}
}

export const getSample = (sim) => {
  return sim.particles.map((p) => {
    return {position: p.position, velocity: p.velocity, radius: p.radius}
  })
}

export const transformParticle = (
  particle,
  origin = {position: [0.5, 0.5], unitX: [1, 0], radius: 0}
) => {
  let originTheta = Math.atan2(origin.unitX[1], origin.unitX[0])
  let position = vec.mult(vec.sub(particle.position, origin.position), 2)
  let positionTheta = Math.atan2(position[1], position[0]) - originTheta
  let velocity = vec.mult(particle.velocity, 1 / 2000)
  let velocityTheta = Math.atan2(velocity[1], velocity[0]) - originTheta
  let radius = particle.radius * 2

  positionTheta = (positionTheta + Math.PI * 2) % (Math.PI * 2)
  velocityTheta = (velocityTheta + Math.PI * 2) % (Math.PI * 2)
  if (positionTheta > Math.PI) positionTheta -= Math.PI * 2
  if (velocityTheta > Math.PI) velocityTheta -= Math.PI * 2

  let updated = {
    positionTheta,
    positionMag: vec.length(position),
    positionMagSubRadii: vec.length(position) - (radius + origin.radius),
    velocityTheta,
    velocityMag: vec.length(velocity),
    radius,
  }

  return updated
}

const bits = (x) => Math.log2(Math.abs(x) + 2 ** -29) + 30

const difference = (a, b, radial) => {
  let diff = a - b
  if (radial) {
    diff = (diff + Math.PI * 2) % (Math.PI * 2)
    if (diff > Math.PI) diff -= 2 * Math.PI
  }
  return diff
}

const minabs = (a, b) => (Math.abs(a) <= Math.abs(b) ? a : b)

const distanceBasic = (a, b) => vec.length(vec.sub(a.position, b.position))

const distanceBits = (a, b) => {
  let c = a
  a = transformParticle(a, {
    position: b.position,
    unitX: b.velocity,
    radius: b.radius * 2,
  })
  b = transformParticle(b, {
    position: c.position,
    unitX: c.velocity,
    radius: c.radius * 2,
  })
  return (
    // bits(minabs(a.positionTheta, b.positionTheta)) +
    // 1 +
    // bits(a.positionMagSubRadii) +
    // bits(a.velocityTheta) +
    bits(difference(a.velocityMag, b.velocityMag)) // +
    // bits(difference(a.radius, b.radius))
  )
}

export const dataToMST = (data, strategy) => {
  if (!data.length) return []
  let bitsStrategy = {bits: true, euclidean: false}[strategy]

  let delaunay = triangulate.run(data, (p) => p.position)
  let edges = []
  triangulate.forEachEdge(delaunay, (e) => edges.push(e))
  // if (bitsStrategy) {
  //   edges = addSecondDegreeConnections(edges, data.length)
  // }
  let distanceMetric = bitsStrategy ? distanceBits : distanceBasic
  let mst = minimumSpanningTree(data, edges, distanceMetric)
  let {nodelist} = edgelistToTree(mst.edgelist, mst.root)

  return nodelist
}

const prune = (edgelist) => {}

export const prunedDelaunay = (data) => {
  let distance = (a, b) => vec.length(vec.sub(a.position, b.position)) // - a.radius - b.radius
  let delaunay = triangulate.run(data, (p) => p.position)
  let edgelist = []
  triangulate.forEachEdge(delaunay, ([a, b]) =>
    edgelist.push([a, b, distance(data[a], data[b]), 0])
  )

  let edgelist2 = []

  let nodelist = new Array(data.length)
    .fill(null)
    .map(() => ({edges: [], distanceTotal: 0}))

  for (let e in edgelist) {
    let [a, b] = edgelist[e]
    nodelist[a].edges.push(edgelist[e])
    nodelist[b].edges.push(edgelist[e])
  }
  for (let n of nodelist) {
    n.distanceTotal = n.edges.reduce((pv, e) => pv + e[2], 0)
  }
  for (let e in edgelist) {
    let [a, b, distance] = edgelist[e]
    let na = nodelist[a]
    let nb = nodelist[b]
    let adjacentEdgeCount = na.edges.length + nb.edges.length - 2
    let adjacentEdgeTotal = na.distanceTotal + nb.distanceTotal - distance * 2
    let mean = adjacentEdgeTotal / adjacentEdgeCount
    let deviationFactor = distance / mean
    edgelist[e][3] += deviationFactor > 2 ? 1 : 0
  }

  for (let n of nodelist) {
    n.distanceTotal = n.edges.reduce((pv, e) => pv + e[2] * e[3], 0)
  }
  for (let e in edgelist) {
    let [a, b, distance] = edgelist[e]
    let na = nodelist[a]
    let nb = nodelist[b]
    let adjacentEdgeCount = na.edges.length + nb.edges.length - 2
    let adjacentEdgeTotal = na.distanceTotal + nb.distanceTotal - distance * 2
    let mean = adjacentEdgeTotal / adjacentEdgeCount
    let deviationFactor = distance / mean
    edgelist[e][3] += deviationFactor > 2 ? 1 : 0
  }

  // return edgelist

  // for (let i in nodelist) {
  //   let n = nodelist[i].sort((a, b) => a[3] - b[3])
  //   let mean = 0
  //   for (let [, , , distance] of n) mean += distance / n.length
  //   for (let [, , e, distance] of n) {
  //     if (!edgelist[e][2]) edgelist[e][2] += distance / mean
  //     else {
  //       edgelist[e][2] *= distance / mean
  //       edgelist[e][2] = edgelist[e][2] > 2 ? 1 : 0
  //     }
  //   }
  // }

  return edgelist
}

const MSTCompression = (strategy) => (data) => {
  const nodelist = dataToMST(data, strategy)

  let compressedData = new Array(nodelist.length).fill(null)
  let nil = {position: [0, 0], velocity: [0, 0], radius: 0}
  for (let i = 0; i < nodelist.length; i++) {
    let n = nodelist[i]
    let parent = data[n.parent] || nil
    let node = data[n.index]
    let child = node
    node = transformParticle(node, {
      position: parent.position,
      unitX: parent.velocity,
      radius: parent.radius * 2,
    })
    parent = transformParticle(parent, {
      position: child.position,
      unitX: child.velocity,
      radius: child.radius * 2,
    })
    let compressed = {
      positionTheta: minabs(node.positionTheta, parent.positionTheta),
      positionMag: node.positionMag,
      positionMagSubRadii: node.positionMagSubRadii,
      velocityTheta: node.velocityTheta,
      velocityMag: node.velocityMag - parent.velocityMag,
      radius: node.radius - parent.radius,
    }
    compressedData[n.index] = compressed
  }

  return compressedData
}

export const MSTCompressionEuclidean = MSTCompression('euclidean')

export const MSTCompressionBits = MSTCompression('bits')

export const LZMATotalBits = (data) => {
  let dataBuffer = new Int32Array(data.length)
  for (let i in data) {
    dataBuffer[i] = data[i] * 2 ** 29
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

export const analyse = (data, plusOneBitForPositionTheta) => {
  let {min, max, abs, floor, ceil} = Math
  let stats = {}
  for (let k in data[0]) {
    stats[k] = {
      min: abs(data[0][k]),
      minBits: bits(data[0][k]),
      max: abs(data[0][k]),
      maxBits: bits(data[0][k]),
      mean: null,
      meanBits: null,
      trueMean: null,
      meanDeviation: null,
      meanDeviationBits: null,
      maxDeviation: 0,
      maxDeviationBits: 0,
      meanBitsColumnStrategy: 0,
      meanBitsBucketStrategy: 2,
    }
  }
  for (let i in data) {
    for (let k in data[i]) {
      stats[k].min = min(stats[k].min, abs(data[i][k]))
      stats[k].max = max(stats[k].max, abs(data[i][k]))
      stats[k].mean += abs(data[i][k]) / data.length
      stats[k].meanBits += bits(data[i][k]) / data.length
      stats[k].trueMean += data[i][k] / data.length
    }
  }
  for (let i in data) {
    for (let k in data[i]) {
      let deviation = difference(
        data[i][k],
        stats[k].trueMean,
        k === 'positionTheta' || k === 'velocityTheta'
      )
      stats[k].meanDeviation += abs(deviation) / data.length
      stats[k].meanDeviationBits += bits(deviation) / data.length
      stats[k].maxDeviation = max(stats[k].maxDeviation, abs(deviation))
    }
  }
  for (let k in data[0]) {
    stats[k].minBits = bits(stats[k].min)
    stats[k].maxBits = bits(stats[k].max)
    stats[k].meanBitsColumnStrategy = ceil(bits(stats[k].max))
    stats[k].maxDeviationBits = bits(stats[k].maxDeviation)
  }

  stats.total = {
    minBits: 32 * Object.keys(data[0]).length,
    maxBits: 0,
    meanBits: null,
    meanDeviationBits: null,
    maxDeviationBits: 0,
    meanBitsColumnStrategy: 0,
    meanBitsBucketStrategy: 2 * Object.keys(data[0]).length,
    meanBitsLZMA: null,
  }

  let totalContributors = {
    positionTheta: 0,
    positionMagSubRadii: 1,
    velocityTheta: 2,
    velocityMag: 3,
    radius: 4,
  }
  for (let i in data) {
    let total = {bits: 0, bitsDeviation: 0}
    for (let k in totalContributors) {
      let deviation = difference(
        data[i][k],
        stats[k].trueMean,
        k === 'positionTheta' || k === 'velocityTheta'
      )

      total.bits += bits(data[i][k])
      total.bitsDeviation += bits(deviation)
    }
    stats.total.minBits = min(stats.total.minBits, total.bits)
    stats.total.maxBits = max(stats.total.maxBits, total.bits)
    stats.total.meanBits += total.bits / data.length
    stats.total.maxDeviationBits = max(
      stats.total.maxDeviationBits,
      total.bitsDeviation
    )
    stats.total.meanDeviationBits += total.bitsDeviation / data.length
  }

  for (let k in totalContributors) {
    stats.total.meanBitsColumnStrategy += stats[k].meanBitsColumnStrategy
  }

  let buckets = {}
  for (let k in data[0]) {
    let sorted = data.map((d) => abs(d[k])).sort((a, b) => a - b)
    buckets[k] = [0.5, 0.75, 0.875, 1].map((x) => {
      return sorted[floor(x * (data.length - 1))]
    })
  }
  for (let k in data[0]) {
    for (let i in data) {
      let c = buckets[k].filter((b) => b >= abs(data[i][k]))
      let v = ceil(bits(min(...c)))
      stats[k].meanBitsBucketStrategy += v / data.length
      if (totalContributors[k] != null) {
        stats.total.meanBitsBucketStrategy += v / data.length
      }
    }
  }

  if (plusOneBitForPositionTheta) {
    stats.positionTheta.minBits++
    stats.positionTheta.maxBits++
    stats.positionTheta.meanBits++
    stats.positionTheta.meanDeviationBits++
    stats.positionTheta.maxDeviationBits++
    stats.total.minBits++
    stats.total.maxBits++
    stats.total.meanBits++
    stats.total.meanDeviationBits++
    stats.total.maxDeviationBits++
  }

  let flat = {total: []}
  for (let k in data[0]) {
    flat[k] = []
    for (let i in data) {
      flat[k].push(data[i][k])
      if (totalContributors[k] != null) {
        flat.total.push(data[i][k])
      }
    }
  }

  return Promise.all(
    Object.keys(flat).map((key) => {
      return LZMATotalBits(flat[key]).then((totalBits) => {
        stats[key].meanBitsLZMA = totalBits / data.length
      })
    })
  ).then(() => stats)
}

export const generateFullStats = async (data, sampleName = null) => {
  let statsObject = {
    basic: await analyse(data.map((p) => transformParticle(p))),
    MSTEuclidean: await analyse(MSTCompressionEuclidean(data), true),
    MSTInformation: await analyse(MSTCompressionBits(data), true),
  }
  let stats = []

  for (let method in statsObject) {
    for (let attribute in statsObject[method]) {
      for (let stat in statsObject[method][attribute]) {
        let value = statsObject[method][attribute][stat]
        stats.push({sample: sampleName, method, attribute, stat, value})
      }
    }
  }

  return stats
}

// does meanBits for MSTCompressionBits only
export const generateShortStats = (data) => {
  let compressed = MSTCompressionBits(data)

  let stats = {
    positionTheta: 0,
    positionMagSubRadii: 0,
    velocityTheta: 0,
    velocityMag: 0,
    radius: 0,
  }
  for (let i in compressed) {
    for (let k in compressed[i]) {
      stats[k] += bits(compressed[i][k]) / compressed.length
    }
  }

  let total = 0
  for (let i in compressed) {
    for (let k in stats) {
      total += bits(compressed[i][k]) / compressed.length
    }
  }

  stats.total = total
  stats.total++
  stats.positionTheta++

  return stats
}
