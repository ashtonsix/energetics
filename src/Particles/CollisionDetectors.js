import vec from './vec'

const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max)
}

const outOfBounds = (x, y) => {
  return x < 0 || y < 0 || x > 1 || y > 1
}

class ParticleCollisionDetector {
  cellSize = 0.01
  length = 10
  data = []
  insert(particle) {
    let [x, y] = particle.position
    x = Math.floor(x / this.cellSize)
    y = Math.floor(y / this.cellSize)
    const cell = this.data[y * this.length + x]
    if (cell) cell.push(particle)
  }
  retrieve(particle) {
    const d = this.data
    const l = this.length
    let [x, y] = particle.position
    x = clamp(x, 0, 0.999999)
    y = clamp(y, 0, 0.999999)
    x = Math.floor(x / this.cellSize)
    y = Math.floor(y / this.cellSize)
    // prettier-ignore
    const candidates = [].concat(
      x > 0     && y > 0     ? d[(y - 1) * l + (x - 1)] : [],
                   y > 0     ? d[(y - 1) * l + (x)    ] : [],
      x < l - 1 && y > 0     ? d[(y - 1) * l + (x + 1)] : [],
      x > 0                  ? d[(y) * l     + (x - 1)] : [],
      true                   ? d[(y) * l     + (x)    ] : [],
      x < l - 1              ? d[(y) * l     + (x + 1)] : [],
      x > 0     && y < l - 1 ? d[(y + 1) * l + (x - 1)] : [],
                   y < l - 1 ? d[(y + 1) * l + (x)    ] : [],
      x < l - 1 && y < l - 1 ? d[(y + 1) * l + (x + 1)] : [],
    )
    return candidates
  }
  // cellSize should be betweem 100% & 102% of maxParticleDiameter
  // we only throw away the collider if it's outside those bounds
  // to reduce memory churn when particle sizes are small
  //
  // in practice, this reduces the program's total memory churn by 50%
  reset(newMaxParticleDiameter) {
    let tooBig = newMaxParticleDiameter > this.cellSize
    let tooSmall = newMaxParticleDiameter * 1.021 < this.cellSize
    let justRight = !tooBig && !tooSmall
    if (tooBig || tooSmall) {
      if (tooBig) console.log('too big')
      if (tooSmall) console.log('too small')
      this.data = []
      // heurestic: if particle size increased, it's more likely
      // to increase than decrease next cycle
      this.cellSize = newMaxParticleDiameter * (tooBig ? 1.02 : 1.0)
      this.length = Math.ceil(1 / this.cellSize)
      for (let i = 0; i < this.length ** 2; i++) {
        this.data.push([])
      }
    } else if (justRight) {
      console.log('just right')
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i].length) this.data[i] = []
      }
    }
  }
  constructor(maxParticleDiameter) {
    this.cellSize = maxParticleDiameter * 1.02
    this.length = Math.ceil(1 / this.cellSize)
    for (let i = 0; i < this.length ** 2; i++) {
      this.data.push([])
    }
  }
}

// ray-casting algorithm
const insidePolygon = (point, polygon) => {
  const [x, y] = point

  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i][0]
    let yi = polygon[i][1]
    let xj = polygon[j][0]
    let yj = polygon[j][1]

    // prettier-ignore
    let intersect = (yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }

  return inside
}

const evenlySpacePolygon = (polygon, spacing) => {
  let evenlySpaced = []
  let spacingCounter = 0
  loop: for (let i = 0; i < polygon.length; i++) {
    let [x0, y0] = polygon[i % polygon.length]
    let [x1, y1] = polygon[(i + 1) % polygon.length]
    if (isNaN(x0) || isNaN(y0)) throw new Error('Bad polygon')
    for (let i = 0; i < 15000; i++) {
      let distance = ((x0 - x1) ** 2 + (y0 - y1) ** 2) ** 0.5
      if (spacingCounter + distance < spacing) {
        spacingCounter += distance
        continue loop
      } else {
        const mix = (spacing - spacingCounter) / distance
        x0 = x1 * mix + x0 * (1 - mix)
        y0 = y1 * mix + y0 * (1 - mix)
        evenlySpaced.push([x0, y0])
        spacingCounter = 0
      }
    }
  }
  return evenlySpaced
}

const smoothPolygon = (polygon, rollingAverageWindow) => {
  let smoothed = []
  let rollingAverage = [0, 0]

  for (let i = 0; i < rollingAverageWindow; i++) {
    vec.$add(rollingAverage, vec.mult(polygon[i], 1 / rollingAverageWindow))
  }
  for (let i = 0; i < polygon.length; i++) {
    smoothed.push(rollingAverage.slice())
    vec.$sub(rollingAverage, vec.mult(polygon[i], 1 / rollingAverageWindow))
    vec.$add(
      rollingAverage,
      vec.mult(
        polygon[(i + rollingAverageWindow) % polygon.length],
        1 / rollingAverageWindow
      )
    )
  }
  return smoothed
}

// significantly faster than naive array-based queue for N>10k
class Queue {
  queue = []
  offset = 0
  get length() {
    return this.queue.length - this.offset
  }
  push(item) {
    this.queue.push(item)
  }
  shift() {
    if (this.queue.length === 0) return undefined
    let item = this.queue[this.offset]
    if (++this.offset * 2 >= this.queue.length) {
      this.queue = this.queue.slice(this.offset)
      this.offset = 0
    }
    return item
  }
  constructor(initialQueue = []) {
    this.queue = initialQueue
  }
}

const bfs = (initialQueue, handleValue, maxIters = 15000000) => {
  const queue = new Queue(initialQueue)
  let i = 0
  while (queue.length && i < maxIters) {
    i++
    const value = queue.shift()
    handleValue(value, (value) => queue.push(value), i)
  }
}

class BoundaryCollisionDetector {
  CONSTANTS = {
    EDGE: 0,
    TEMP_EDGE: 1,
    TEMP_VISITED: 2,
    INSIDE: 3,
    OUTSIDE: 4,
  }
  CONSTANTS_REVERSED = {
    0: 'edge',
    1: 'temp_edge',
    2: 'temp_visited',
    3: 'inside',
    4: 'outside',
  }
  areaInside = 0
  maxDistance = 0
  polygons = []
  insert(
    polygon,
    inside = 'inside',
    willImmediatelyInsertAnotherPolygon = false
  ) {
    if (this.finemesh) {
      this.finemesh.insert(polygon, inside, willImmediatelyInsertAnotherPolygon)
    }

    // ensure the arena is fully encased by boundaries
    if (inside === 'inside') {
      polygon = polygon.map(([x, y]) => [clamp(x, 0, 1), clamp(y, 0, 1)])
    }

    // smooth the polygon to make spikes and crevices easier to handle
    polygon = evenlySpacePolygon(polygon, this.cellSize / 2)
    polygon = smoothPolygon(polygon, 8)

    // space the polygon vertices evenly so there's a vertex
    // in every grid cell the polygon boundary intersects
    polygon = evenlySpacePolygon(polygon, this.cellSize / 8)
    this.polygons.push([polygon, inside])

    // maybe reverse the polygon direction so the normals will point inwards
    let isInside
    isInside = vec.sub(polygon[0], polygon[1])
    isInside = vec.mult([-isInside[1], isInside[0]], 0.001)
    isInside = vec.add(polygon[0], isInside)
    isInside = insidePolygon(isInside, polygon)
    if (inside === 'inside' && !isInside) polygon.reverse()
    if (inside !== 'inside' && isInside) polygon.reverse()

    // clear some calculations for previously added polygons so merge works nicely
    for (let i = 0; i < this.data.length; i += 6) {
      if (this.data[i + 5] === this.CONSTANTS.EDGE) continue
      this.data[i + 0] = -1
      this.data[i + 1] = -1
      this.data[i + 2] = -1
      this.data[i + 3] = -1
      this.data[i + 4] = -1
    }

    const cellType =
      inside === 'inside' ? this.CONSTANTS.INSIDE : this.CONSTANTS.OUTSIDE

    // mark the new polygon outline on the grid
    for (let i = 0; i < polygon.length; i++) {
      let [x0, y0] = polygon[i]
      if (outOfBounds(x0, y0)) continue
      let xi = Math.floor(x0 * this.length)
      let yi = Math.floor(y0 * this.length)
      let j = (yi * this.length + xi) * 6
      let x1 = xi / this.length + this.cellSize / 2
      let y1 = yi / this.length + this.cellSize / 2
      let distance = ((x0 - x1) ** 2 + (y0 - y1) ** 2) ** 0.5
      // TEMP_VISITED becomes INSIDE/OUTSIDE later, TEMP_EDGE becomes EDGE
      if (this.data[j + 5] === cellType) {
        this.data[j + 5] = this.CONSTANTS.TEMP_VISITED
      } else if (this.data[j + 5] === this.CONSTANTS.EDGE) {
        this.data[i + 0] = -1
        this.data[i + 1] = -1
        this.data[i + 2] = -1
        this.data[i + 3] = -1
        this.data[i + 4] = -1
        this.data[j + 5] = this.CONSTANTS.TEMP_VISITED
      } else if (this.data[j + 5] !== this.CONSTANTS.TEMP_VISITED) {
        if (
          this.data[j + 5] === this.CONSTANTS.TEMP_EDGE &&
          distance > this.data[j + 2] &&
          this.data[j + 2] !== -1
        ) {
          continue
        }
        let pl = polygon[(i - 1 + polygon.length) % polygon.length]
        let pr = polygon[(i + 1) % polygon.length]
        let [nx, ny] = vec.setLength([-(pl[1] - pr[1]), pl[0] - pr[0]], 1)
        this.data[j + 0] = x0
        this.data[j + 1] = y0
        this.data[j + 2] = distance
        this.data[j + 3] = nx
        this.data[j + 4] = ny
        this.data[j + 5] = this.CONSTANTS.TEMP_EDGE
      }
    }

    // find a random grid cell inside the polygon
    let startingPoint = -1
    for (let i = 0; i < 500; i++) {
      let [x0, y0] = polygon[Math.floor(Math.random() * polygon.length)]
      if (outOfBounds(x0, y0)) continue
      let xi = Math.floor(x0 * this.length)
      let yi = Math.floor(y0 * this.length)
      let sz = this.cellSize
      let x1 = xi / this.length + sz / 2
      let y1 = yi / this.length + sz / 2

      let left = yi * this.length + Math.max(xi - 1, 0)
      let right = yi * this.length + Math.min(xi + 1, this.length - 1)
      let above = Math.max(yi - 1, 0) * this.length + xi
      let below = Math.min(yi + 1, this.length - 1) * this.length + xi
      let t = [this.CONSTANTS.TEMP_VISITED, this.CONSTANTS.TEMP_EDGE]
      if (
        !t.includes(this.data[left * 6 + 5]) &&
        insidePolygon([x1 - sz, y1], polygon)
      ) {
        startingPoint = left
        break
      } else if (
        !t.includes(this.data[right * 6 + 5]) &&
        insidePolygon([x1 + sz, y1], polygon)
      ) {
        startingPoint = right
        break
      } else if (
        !t.includes(this.data[above * 6 + 5]) &&
        insidePolygon([x1, y1 - sz], polygon)
      ) {
        startingPoint = above
        break
      } else if (
        !t.includes(this.data[below * 6 + 5]) &&
        insidePolygon([x1, y1 + sz], polygon)
      ) {
        startingPoint = below
        break
      }
    }

    // fill the polygon's insides
    bfs([startingPoint], (index, visit) => {
      if (
        this.data[index * 6 + 5] === this.CONSTANTS.TEMP_VISITED ||
        this.data[index * 6 + 5] === this.CONSTANTS.TEMP_EDGE
      ) {
        return
      }

      this.data[index * 6 + 0] = -1
      this.data[index * 6 + 1] = -1
      this.data[index * 6 + 2] = -1
      this.data[index * 6 + 3] = -1
      this.data[index * 6 + 4] = -1
      this.data[index * 6 + 5] = this.CONSTANTS.TEMP_VISITED

      let xi = index % this.length
      let yi = Math.floor(index / this.length)
      let left = yi * this.length + Math.max(xi - 1, 0)
      let right = yi * this.length + Math.min(xi + 1, this.length - 1)
      let above = Math.max(yi - 1, 0) * this.length + xi
      let below = Math.min(yi + 1, this.length - 1) * this.length + xi
      visit(left)
      visit(right)
      visit(above)
      visit(below)
    })

    // finish filling the polygon
    for (let i = 0; i < this.data.length; i += 6) {
      if (this.data[i + 5] === this.CONSTANTS.TEMP_VISITED) {
        this.data[i + 5] = cellType
      }
      if (this.data[i + 5] === this.CONSTANTS.TEMP_EDGE) {
        this.data[i + 5] = this.CONSTANTS.EDGE
      }
    }

    // skip needless and expensive computation
    if (willImmediatelyInsertAnotherPolygon) return this

    // get starting points for 'closest point on boundary' BFS/calculations
    let startingPoints = []
    for (let i = 0; i < this.data.length; i += 6) {
      if (this.data[i + 5] === this.CONSTANTS.EDGE) {
        const edge = i / 6
        startingPoints.push([edge, edge, 0])
      }
    }

    // add some extra starting points to make the mapping of grid cells
    // to boundary points faster and more accurate
    let extra = []
    for (let p = 0; p < this.polygons.length; p++) {
      let polygon = this.polygons[p][0]
      for (let i = 0; i < polygon.length; i++) {
        let [x0, y0] = polygon[i]
        if (outOfBounds(x0, y0)) continue
        let xi = Math.floor(x0 * this.length)
        let yi = Math.floor(y0 * this.length)
        let j = (yi * this.length + xi) * 6
        if (this.data[j + 5] !== this.CONSTANTS.EDGE) continue
        let pl = polygon[(i - 1 + polygon.length) % polygon.length]
        let pr = polygon[(i + 1) % polygon.length]
        let [nx, ny] = vec.setLength([-(pl[1] - pr[1]), pl[0] - pr[0]], 1)
        for (let k = 0; k < 5; k++) {
          let [x1, y1] = vec.add(
            [x0, y0],
            vec.mult(
              [nx, ny],
              Math.random() ** 2 *
                Math.sign(Math.random() - 0.5) *
                this.maxDistance
            )
          )
          if (outOfBounds(x1, y1)) continue
          let xi = Math.floor(x1 * this.length)
          let yi = Math.floor(y1 * this.length)
          let j = (yi * this.length + xi) * 6
          x1 = xi / this.length + this.cellSize / 2
          y1 = yi / this.length + this.cellSize / 2
          let distance = ((x0 - x1) ** 2 + (y0 - y1) ** 2) ** 0.5

          if (this.data[j + 5] === this.CONSTANTS.EDGE) continue
          if (distance > this.data[j + 2] && this.data[j + 2] !== -1) continue
          this.data[j + 0] = x0
          this.data[j + 1] = y0
          this.data[j + 2] = distance
          this.data[j + 3] = nx
          this.data[j + 4] = ny
          let point = j / 6
          extra.push([point, point, 0])
        }
      }
    }
    startingPoints = startingPoints.concat(extra)

    // map every grid cell to closest point on the boundary
    bfs(startingPoints, ([origin, current, i], visit) => {
      let x0 = this.data[origin * 6 + 0]
      let y0 = this.data[origin * 6 + 1]
      let xi = current % this.length
      let yi = Math.floor(current / this.length)
      let sz = this.cellSize
      let x1 = xi / this.length + sz / 2
      let y1 = yi / this.length + sz / 2
      let distance = vec.length(vec.sub([x0, y0], [x1, y1]))
      if (
        (i !== 0 &&
          this.data[current * 6 + 2] !== -1 &&
          distance + 0.000001 > this.data[current * 6 + 2]) ||
        distance > this.maxDistance
      ) {
        return
      }
      this.data[current * 6 + 0] = this.data[origin * 6 + 0]
      this.data[current * 6 + 1] = this.data[origin * 6 + 1]
      this.data[current * 6 + 2] = distance
      this.data[current * 6 + 3] = this.data[origin * 6 + 3]
      this.data[current * 6 + 4] = this.data[origin * 6 + 4]

      let left = yi * this.length + Math.max(xi - 1, 0)
      let right = yi * this.length + Math.min(xi + 1, this.length - 1)
      let top = Math.max(yi - 1, 0) * this.length + xi
      let bottom = Math.min(yi + 1, this.length - 1) * this.length + xi
      // prettier-ignore
      let topLeft = Math.max(yi - 1, 0) * this.length + Math.max(xi - 1, 0)
      // prettier-ignore
      let topRight = Math.max(yi - 1, 0) * this.length + Math.min(xi + 1, this.length - 1)
      // prettier-ignore
      let bottomLeft = Math.min(yi + 1, this.length - 1) * this.length + Math.max(xi - 1, 0)
      // prettier-ignore
      let bottomRight = Math.min(yi + 1, this.length - 1) * this.length + Math.min(xi + 1, this.length - 1)
      visit([origin, left, i + 1])
      visit([origin, right, i + 1])
      visit([origin, top, i + 1])
      visit([origin, bottom, i + 1])
      visit([origin, topLeft, i + 1])
      visit([origin, topRight, i + 1])
      visit([origin, bottomLeft, i + 1])
      visit([origin, bottomRight, i + 1])
    })

    let areaInside = 0
    let maxDistance = 0
    for (let i = 0; i < this.data.length; i += 6) {
      if (this.data[i + 5] === this.CONSTANTS.INSIDE) areaInside += 1
      if (this.data[i + 5] === this.CONSTANTS.EDGE) areaInside += 0.5
      if (
        this.data[i + 2] > maxDistance &&
        [this.CONSTANTS.INSIDE, this.CONSTANTS.EDGE].includes(this.data[i + 5])
      ) {
        maxDistance = this.data[i + 2]
      }
    }
    this.areaInside = areaInside / this.length ** 2
    this.maxDistance = maxDistance

    return this
  }
  retrieve(particle, returnNullIfNoCollision = true) {
    if (this.finemesh) {
      let f = this.finemesh.retrieve(particle, returnNullIfNoCollision)
      if (f) return f
    }

    let xi = Math.floor(clamp(particle.position[0], 0, 0.999999) * this.length)
    let yi = Math.floor(clamp(particle.position[1], 0, 0.999999) * this.length)
    let j = (yi * this.length + xi) * 6
    let d = this.data
    if (d[j + 2] === -1) return null
    if (
      returnNullIfNoCollision &&
      d[j + 5] === this.CONSTANTS.INSIDE &&
      d[j + 2] > particle.radius + this.cellSize * 2
    ) {
      return null
    }
    return {
      position: [d[j + 0], d[j + 1]],
      normal: [d[j + 3], d[j + 4]],
      distanceEstimate: d[j + 2],
      status: this.CONSTANTS_REVERSED[d[j + 5]],
    }
  }
  constructor(isFinemesh = false) {
    this.cellSize = isFinemesh ? 0.0025 : 0.01
    this.maxDistance = isFinemesh ? 1 / 20 : 1

    this.length = Math.ceil(1 / this.cellSize)
    // x, y, distance, normal_x, normal_y, status
    this.data = new Float32Array(this.length ** 2 * 6).fill(-1)
    for (let i = 0; i < this.data.length; i += 6) {
      this.data[i + 5] = this.CONSTANTS.OUTSIDE
    }
    if (!isFinemesh) {
      this.finemesh = new BoundaryCollisionDetector(true)
    }
  }
}

export {ParticleCollisionDetector, BoundaryCollisionDetector}
