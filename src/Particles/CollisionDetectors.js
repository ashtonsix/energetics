import vec from './vec'

class ParticleCollisionDetector {
  areaSize = 10
  cellSize = 1
  length = 10
  data = []
  insert(value, x, y) {
    x = Math.floor(x / this.cellSize)
    y = Math.floor(y / this.cellSize)
    const cell = this.data[y * this.length + x]
    if (cell) cell.push(value)
  }
  retrieve(x, y) {
    const d = this.data
    const l = this.length
    x = Math.floor(x / this.cellSize)
    y = Math.floor(y / this.cellSize)
    // prettier-ignore
    return [].concat(
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
  }
  constructor(areaSize, cellSize) {
    this.areaSize = areaSize
    this.cellSize = cellSize
    this.length = Math.ceil(areaSize / cellSize)
    for (let i = 0; i < this.length ** 2; i++) {
      this.data.push([])
    }
  }
}

// ray-casting algorithm based on
// https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
const insidePolygon = (point, polygon) => {
  const [x, y] = point

  var inside = false
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
    var item = this.queue[this.offset]
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
  let t0 = performance.now()
  while (queue.length && i < maxIters) {
    i++
    const value = queue.shift()
    handleValue(value, (value) => queue.push(value), i)
  }
  console.log(i, performance.now() - t0)
}

class BoundaryCollisionDetector {
  CONSTANTS = {
    EDGE: 0,
    TEMP_EDGE: 1,
    TEMP_VISITED: 2,
    INSIDE: 3,
    OUTSIDE: 4,
  }
  addCurve(curve, inside) {
    let polygon = new Array(5000).fill(null).map((_, i) => curve(i / 5000))
    let minX = polygon[0][0]
    let maxX = polygon[0][0]
    let minY = polygon[0][1]
    let maxY = polygon[0][1]
    for (let i = 0; i < polygon.length; i++) {
      const [x, y] = polygon[i]
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }
    polygon = polygon.map(([x, y]) => [
      ((x - minX) / (maxX - minX)) * this.areaSize,
      ((y - minY) / (maxY - minY)) * this.areaSize,
    ])
    let evenlySpaced = []
    let spacing = this.cellSize / 5
    let spacingCounter = 0
    loop: for (let i = 0; i < polygon.length; i++) {
      let [x0, y0] = polygon[i % polygon.length]
      let [x1, y1] = polygon[(i + 1) % polygon.length]
      while (true) {
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
    polygon = evenlySpaced
    this.polygon = polygon

    // reversing the direction ensures the normals will point inwards
    let maybeInside
    maybeInside = vec.sub(polygon[0], polygon[1])
    maybeInside = vec.mult([-maybeInside[1], maybeInside[0]], 0.001)
    maybeInside = vec.add(polygon[0], maybeInside)
    if (!insidePolygon(maybeInside, polygon)) polygon.reverse()

    maybeInside = vec.sub(polygon[0], polygon[1])

    for (let i = 0; i < this.data.length; i += 6) {
      if (this.data[i + 5] === this.CONSTANTS.EDGE) continue
      this.data[i + 0] = -1
      this.data[i + 1] = -1
      this.data[i + 2] = -1
      this.data[i + 3] = -1
      this.data[i + 4] = -1
    }

    const cellType = inside ? this.CONSTANTS.INSIDE : this.CONSTANTS.OUTSIDE

    for (let i = 0; i < polygon.length; i++) {
      let [x0, y0] = polygon[i]
      let xi = Math.floor((x0 / this.areaSize) * this.length)
      let yi = Math.floor((y0 / this.areaSize) * this.length)
      let j = (yi * this.length + xi) * 6
      let x1 = xi / this.length + this.cellSize / 2
      let y1 = yi / this.length + this.cellSize / 2
      let distance = ((x0 - x1) ** 2 + (y0 - y1) ** 2) ** 0.5
      if (this.data[j + 2] === -1 || distance < this.data[j + 2]) {
        let pl = polygon[(i - 1 + polygon.length) % polygon.length]
        let pr = polygon[(i + 1) % polygon.length]
        let [nx, ny] = vec.setLength([-(pl[1] - pr[1]), pl[0] - pr[0]], 1)
        this.data[j + 0] = x0
        this.data[j + 1] = y0
        this.data[j + 2] = distance
        this.data[j + 3] = nx
        this.data[j + 4] = ny
        let t = [cellType, this.CONSTANTS.TEMP_VISITED]
        // TEMP_VISITED becomes INSIDE/OUTSIDE later, TEMP_EDGE becomes EDGE
        this.data[j + 5] = t.includes(this.data[j + 5])
          ? this.CONSTANTS.TEMP_VISITED
          : this.CONSTANTS.TEMP_EDGE
      }
    }

    // find a random grid cell inside the polygon
    let startingPoint = -1
    for (let i = 0; i < 50; i++) {
      let [x0, y0] = polygon[Math.floor(Math.random() * polygon.length)]
      let xi = Math.floor((x0 / this.areaSize) * this.length)
      let yi = Math.floor((y0 / this.areaSize) * this.length)
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

    // starting fill-in the polygon with TEMP_VISITED
    bfs([startingPoint], (index, visit) => {
      if (
        this.data[index * 6 + 5] === this.CONSTANTS.TEMP_VISITED ||
        this.data[index * 6 + 5] === this.CONSTANTS.TEMP_EDGE
      ) {
        return
      }

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

    let startingPoints = []
    for (let i = 0; i < this.data.length; i += 6) {
      if (this.data[i + 5] === this.CONSTANTS.TEMP_VISITED) {
        this.data[i + 5] = cellType
      }
      if (this.data[i + 5] === this.CONSTANTS.TEMP_EDGE) {
        this.data[i + 5] = this.CONSTANTS.EDGE
      }
      if (this.data[i + 5] === this.CONSTANTS.EDGE) {
        const edge = i / 6
        startingPoints.push([edge, edge, 0])
      }
    }

    // adding some guesses with a heuerstic speeds up the bfs portionb
    let extra = []
    for (let i = 0; i < startingPoints.length; i++) {
      let [x0, y0, , nx, ny] = this.data.slice(
        startingPoints[i][0] * 6,
        startingPoints[i][0] * 6 + 5
      )
      for (let j = 0; j < 20; j++) {
        let [x1, y1] = vec.add(
          [x0, y0],
          vec.mult(
            [nx, ny],
            Math.random() ** 2 *
              Math.sign(Math.random() - 0.5) *
              this.maxDistance
          )
        )
        if (x1 < 0 || y1 < 0 || x1 > this.areaSize || y1 > this.areaSize)
          continue

        let xi = Math.floor((x1 / this.areaSize) * this.length)
        let yi = Math.floor((y1 / this.areaSize) * this.length)
        let j = (yi * this.length + xi) * 6
        let sz = this.cellSize
        x1 = xi / this.length + sz / 2
        y1 = yi / this.length + sz / 2
        let distance = ((x0 - x1) ** 2 + (y0 - y1) ** 2) ** 0.5
        if (this.data[j + 5] !== this.CONSTANTS.EDGE) {
          let pl = polygon[(i - 1 + polygon.length) % polygon.length]
          let pr = polygon[(i + 1) % polygon.length]
          let [nx, ny] = vec.setLength([-(pl[1] - pr[1]), pl[0] - pr[0]], 1)
          this.data[j + 0] = x0
          this.data[j + 1] = y0
          this.data[j + 2] = distance
          this.data[j + 3] = nx
          this.data[j + 4] = ny
        }
        let point = j / 6
        extra.push([point, point, 0])
      }
    }
    startingPoints = startingPoints.concat(extra)

    bfs(startingPoints, ([origin, current, i], visit) => {
      let x0 = this.data[origin * 6 + 0]
      let y0 = this.data[origin * 6 + 1]
      let xi = current % this.length
      let yi = Math.floor(current / this.length)
      let sz = this.cellSize
      let x1 = xi / this.length + sz / 2
      let y1 = yi / this.length + sz / 2
      let distance = vec.length(vec.sub([x0, y0], [x1, y1]))
      if (this.data[current * 6 + 3] === -1) this.data[current * 6 + 3] = i
      if (
        (i !== 0 &&
          this.data[current * 6 + 2] !== -1 &&
          distance + 0.00001 > this.data[current * 6 + 2]) ||
        distance > this.maxDistance
      ) {
        return
      }
      this.data[current * 6 + 0] = this.data[origin * 6 + 0]
      this.data[current * 6 + 1] = this.data[origin * 6 + 1]
      this.data[current * 6 + 2] = distance
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

    if (this.finemesh) this.finemesh.addCurve(curve, inside)
    return this
  }
  constructor(isFinemesh = false) {
    this.areaSize = 1
    this.cellSize = isFinemesh ? 0.0025 : 0.01
    this.maxDistance = isFinemesh ? this.areaSize / 20 : this.areaSize / 1.5

    this.length = Math.ceil(this.areaSize / this.cellSize)
    // x, y, distance, normal_x, normal_y, cell_type
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
