import {
  circleMaze,
  peach,
  squareMaze,
  teslaValve,
  thermodynamicsBuster0,
  thermodynamicsBuster1,
  thermodynamicsBuster2,
} from './boundariesPreGenerated'
import vec from './vec'

const arc = ([cx, cy], radius, start, end, numPoints = 1000) => {
  let arc = []
  for (let t = 0; t < 1; t += 1 / numPoints) {
    let p = t * (end - start) + start
    const x = Math.cos(p)
    const y = Math.sin(p)
    arc.push([x * radius + cx, y * radius + cy])
  }
  return arc
}

const fatLine = (line, width) => {
  let polygon = []
  for (let i = 0; i < line.length - 1; i++) {
    let p0 = line[i]
    let p1 = line[i + 1]
    let tangent = vec.setLength(vec.sub(p0, p1), 1)
    let normal = [-tangent[1], tangent[0]]
    polygon.push(vec.add(p0, vec.mult(normal, width)))
  }
  let p0 = line[line.length - 1]
  let p1 = line[line.length - 2]
  let tangent = vec.setLength(vec.sub(p0, p1), 1)
  let normal = [-tangent[1], tangent[0]]
  polygon.push(vec.sub(p0, vec.mult(normal, width)))
  polygon.push(vec.add(p0, vec.mult(normal, width)))
  for (let i = line.length - 2; i >= 0; i--) {
    let p0 = line[i]
    let p1 = line[i + 1]
    let tangent = vec.setLength(vec.sub(p0, p1), 1)
    let normal = [-tangent[1], tangent[0]]
    polygon.push(vec.sub(p0, vec.mult(normal, width)))
  }
  return polygon
}

const circleSquare = (params, numPoints = 1000) => {
  const [c, squish] = params
  const polygon = arc([0, 0], 1, 0, Math.PI * 2, numPoints)
  for (let i = 0; i < polygon.length; i++) {
    let [x, y] = polygon[i]
    x = Math.abs(x) ** c * Math.sign(x)
    y = Math.abs(y) ** c * Math.sign(y)
    if (c > 1) {
      const cos = Math.cos(Math.PI / 4)
      const sin = Math.sin(Math.PI / 4)
      let t = x
      x = x * cos - y * sin
      y = t * sin + y * cos
      let v = (2 ** 0.5 * 0.5) ** (1 / c) / (2 ** 0.5 * 0.5)
      x *= v
      y *= v
    }
    polygon[i] = [x * 0.5 + 0.5, (y * 0.5) / squish + 0.5]
  }
  return [[polygon, 'inside']]
}

const rectanglePill = (params, numPoints = 1000) => {
  const [ratio, cornerRoundness] = params

  let width = 1
  let height = 1
  if (ratio > 0) width = 1 / (1 + Math.abs(ratio))
  if (ratio < 0) height = 1 / (1 + Math.abs(ratio))
  let radius = Math.max(cornerRoundness * Math.min(width, height), 0.000001)

  const polygon = arc([0, 0], radius, 0, Math.PI * 2, numPoints)
  for (let i = 0; i < polygon.length; i++) {
    let [x, y] = polygon[i]
    x += Math.sign(x) * (width - radius)
    y += Math.sign(y) * (height - radius)
    polygon[i] = [x * 0.5 + 0.5, y * 0.5 + 0.5]
  }
  return [[polygon, 'inside']]
}

const starHexagon = (params, _) => {
  const [numPoints, innerRadius, extraOffset = 1] = params
  let polygon = []
  let offset = (Math.PI * extraOffset) / numPoints
  let outer = arc([0.5, 0.5], 0.5, 0, Math.PI * 1.999, numPoints)
  let inner = arc(
    [0.5, 0.5],
    0.5 * innerRadius,
    offset,
    offset + Math.PI * 1.999,
    numPoints
  )
  for (let i = 0; i < outer.length; i++) {
    polygon.push(outer[i])
    polygon.push(inner[i])
  }
  // for some reason, 6 & 7 pointed shapes have two vertices at the start point,
  // which causes weird issues with the
  return [[polygon.slice(numPoints === 6 || numPoints === 7 ? 1 : 0), 'inside']]
}

const wave = (params, numPoints = 1000) => {
  const [n, r] = params
  const polygon = []
  for (let t = 0; t < Math.PI * 2; t += (Math.PI * 2) / numPoints) {
    const x = (Math.cos(t) * (Math.PI + Math.sin(n * t) * r)) / (Math.PI + r)
    const y = (Math.sin(t) * (Math.PI + Math.sin(n * t) * r)) / (Math.PI + r)
    polygon.push([x * 0.5 + 0.5, y * 0.5 + 0.5])
  }
  return [[polygon, 'inside']]
}

const doughnut = (params, numPoints = 1000) => {
  const [X, Y, r] = params
  const outer = arc([0.5, 0.5], 0.5, 0, Math.PI * 2, numPoints)
  const inner = arc([0.5 + X, 0.5 + Y], 0.5 * r, 0, Math.PI * 2, numPoints)
  return [
    [outer, 'inside'],
    [inner, 'outside'],
  ]
}

const mixedShapes = [
  (() => {
    // pin
    let polygon = arc([0.5, 0.5], 0.5, Math.PI, Math.PI * 2, 500)
    polygon.push([0.75, 0.5])
    polygon.push([0.5, 1])
    polygon.push([0.25, 0.5])
    return [[polygon, 'inside']]
  })(),
  (() => {
    // pinched square (one corner)
    const polygon = arc([0, 0], 1, Math.PI * 1.25, Math.PI * 1.75, 250)
    for (let i = 0; i < polygon.length; i++) {
      let [x, y] = polygon[i]
      x = Math.abs(x) ** 3 * Math.sign(x)
      y = Math.abs(y) ** 3 * Math.sign(y)
      const cos = Math.cos(Math.PI / 4)
      const sin = Math.sin(Math.PI / 4)
      let t = x
      x = x * cos - y * sin
      y = t * sin + y * cos
      let v = (2 ** 0.5 * 0.5) ** (1 / 3) / (2 ** 0.5 * 0.5)
      x *= v
      y *= v
      polygon[i] = [x * 0.5 + 0.5, y * 0.5 + 0.5]
    }
    polygon.push([0.815, 1], [0, 1], [0, 1 - 0.815])
    return [[polygon, 'inside']]
  })(),
  (() => {
    // manta ray
    const polygon = arc([0, 0], 1, 0, Math.PI * 2, 1000)
    for (let i = 0; i < polygon.length; i++) {
      let [x, y] = polygon[i]
      const c = Math.abs(i - 500) / 250 + 1
      x = Math.abs(x) ** c * Math.sign(x)
      y = Math.abs(y) ** c * Math.sign(y)
      const cos = Math.cos(Math.PI * 1.75)
      const sin = Math.sin(Math.PI * 1.75)
      let t = x
      x = x * cos - y * sin
      y = t * sin + y * cos
      let v = (2 ** 0.5 * 0.5) ** (1 / c ** 3.5) * 1.25
      x *= v
      y *= v
      polygon[i] = [x * 0.5 + 0.5, y * 0.5 + 0.5]
    }
    return [[polygon, 'inside']]
  })(),
  (() => {
    return peach
  })(),
  (() => {
    // sinai billiard
    const square = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]
    const circle = arc([0.5, 0.5], 0.25, 0, Math.PI * 2, 1000)
    return [
      [square, 'inside'],
      [circle, 'outside'],
    ]
  })(),
  (() => {
    // hollow sinai billiard
    const square = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]
    let circle = fatLine(
      arc([0.5, 0.5], 0.25, Math.PI * 0.05, Math.PI * 1.95, 1000),
      0.05
    )
    const outer = circle.slice(0, circle.length / 2)
    const inner = circle.slice(circle.length / 2)
    circle = [].concat(inner.slice(30, -30), outer)
    return [
      [square, 'inside'],
      [circle, 'outside'],
    ]
  })(),
  (() => {
    let straight = [
      [0, 0],
      [1, 0],
    ]
    let zig = [
      [-1, 0],
      [-0.5, 0],
      [0, 0.5],
      [0.5, 0],
      [1, 0],
    ]
    zig = [].concat(
      zig.map((p) => vec.add(vec.mult(p, 0.7), [0, -0.25])),
      zig.reverse()
    )
    let shallow = []
    for (let x = -3; x <= 3; x += 0.01) shallow.push([x, (1 / 2 ** x) ** x])
    let uBend = [].concat(
      arc([-1.5, 0], 0.5, Math.PI * 1.5, Math.PI * 2, 500).slice(1, -1),
      arc([0, 0], 1, 0, Math.PI, 500).reverse().slice(1, -1),
      arc([1.5, 0], 0.5, Math.PI, Math.PI * 1.5, 500).slice(1, -1)
    )

    straight = straight.map((p) => vec.add(vec.mult(p, 0.5), [0.25, 0.125]))
    zig = zig.map((p) => vec.add(vec.mult(p, 1 / 3), [0.5, 0.3]))
    shallow = shallow.map((p) => vec.add(vec.mult(p, 1 / 9), [0.5, 0.5]))
    uBend = uBend.map((p) => vec.add(vec.mult(p, 1 / 8), [0.5, 0.8]))

    straight = fatLine(straight, 0.05)
    shallow = fatLine(shallow, 0.05)
    uBend = fatLine(uBend, 0.05)

    let straightTop = straight.slice(0, straight.length / 2)
    let straightBottom = straight.slice(straight.length / 2)
    let zigTop = zig.slice(0, zig.length / 2)
    let zigBottom = zig.slice(zig.length / 2)
    let shallowTop = shallow.slice(0, shallow.length / 2)
    let shallowBottom = shallow.slice(shallow.length / 2)
    let uBendTop = uBend.slice(0, uBend.length / 2)
    let uBendBottom = uBend.slice(uBend.length / 2)

    // prettier-ignore
    let polygon = [].concat(
      straightTop,
      [[0.83, 0.075], [0.85, 0.04], [1, 0.04], [1, 0.19], [0.85, 0.19], [0.83, 0.175]],
      straightBottom,
      [[0.17, 0.175], [0.17, 0.217]],
      zigTop,
      [[0.83, 0.217], [0.85, 0.21], [1, 0.21], [1, 0.36], [0.85, 0.36]],
      zigBottom,
      shallowTop,
      [[0.85, 0.425], [1, 0.425], [1, 0.575], [0.85, 0.575]],
      shallowBottom,
      [[0.17, 0.688]],
      uBendTop,
      [[0.83, 0.688], [0.85, 0.66], [1, 0.66], [1, 0.81], [0.85, 0.81], [0.83, 0.787]],
      uBendBottom,
      [[0.17, 0.787], [0.17, 0.835], [0, 0.835], [0, 0], [0.17, 0], [0.17, 0.075]]
    )

    return [[polygon, 'inside']]
  })(),
  (() => {
    return teslaValve
  })(),
  (() => {
    return circleMaze
  })(),
  (() => {
    return squareMaze
  })(),
]

const mixedShapesGenerator = (params, _) => {
  const [i] = params
  return mixedShapes[i]
}

const thermodynamicsBuster = (params, _) => {
  const [i] = params
  return [
    thermodynamicsBuster0,
    thermodynamicsBuster1,
    thermodynamicsBuster2,
    thermodynamicsBuster1,
  ][i]
}

const boundaryGenerators = {
  circleSquare: {
    generator: circleSquare,
    params: [
      {min: 0, max: 3, step: 1 / 10, defaultValue: 1},
      {min: 1, max: 3, step: 1 / 40, defaultValue: 1},
    ],
  },
  rectanglePill: {
    generator: rectanglePill,
    params: [
      {min: -2, max: 2, step: 0.1, defaultValue: -1},
      {min: 0, max: 1, step: 0.025, defaultValue: 0.5},
    ],
  },
  starHexagon: {
    generator: starHexagon,
    params: [
      {min: 3, max: 8, step: 1, defaultValue: 6},
      {min: 0.25, max: 1, step: 0.025, defaultValue: 0.5},
      {min: 0, max: 2, step: 0.05, defaultValue: 1},
    ],
  },
  wave: {
    generator: wave,
    params: [
      {min: 2, max: 18, step: 1, defaultValue: 3},
      {min: 0, max: 2.4, step: 0.05, defaultValue: 1.2},
    ],
  },
  doughnut: {
    generator: doughnut,
    params: [
      {min: -0.6, max: 0.6, step: 1 / 40, defaultValue: 0},
      {min: -0.6, max: 0.6, step: 1 / 40, defaultValue: 0},
      {min: 0.4, max: 0.975, step: 1 / 80, defaultValue: 0.6},
    ],
  },
  mixedShapes: {
    generator: mixedShapesGenerator,
    params: [{min: 0, max: mixedShapes.length - 1, step: 1, defaultValue: 0}],
  },
  thermodynamicsBuster: {
    generator: thermodynamicsBuster,
    note: 'Enable inelastic collisions, and slowly move the slider from left-to-right. Most of the particles should spontaneously move into the bottom-left chamber, violating the second law of thermodynamics.',
    params: [{min: 0, max: 3, step: 1, defaultValue: 0}],
  },
}

export default boundaryGenerators
