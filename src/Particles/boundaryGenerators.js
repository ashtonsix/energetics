const clamp = (value, min, max) => {
  return Math.min(Math.max(+value || 0, min), max)
}

const circleSquare = (params, numPoints = 1000) => {
  const [c] = params
  const polygon = []
  for (let t = 0; t < 1; t += 1 / numPoints) {
    const x = Math.cos(t * Math.PI * 2)
    const y = Math.sin(t * Math.PI * 2)
    polygon.push([
      Math.abs(x) ** c * Math.sign(x) * 0.5 + 0.5,
      Math.abs(y) ** c * Math.sign(y) * 0.5 + 0.5,
    ])
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

  const polygon = []
  for (let t = 0; t < 1; t += 1 / numPoints) {
    let x = Math.cos(t * Math.PI * 2) * radius
    let y = Math.sin(t * Math.PI * 2) * radius
    x += Math.sign(x) * (width - radius)
    y += Math.sign(y) * (height - radius)
    polygon.push([x * 0.5 + 0.5, y * 0.5 + 0.5])
  }
  return [[polygon, 'inside']]
}

const starHexagon = (params, _) => {
  const [numPoints, innerRadius] = params
  let polygon = []
  for (let t = 0; t < 0.999; t += 1 / numPoints) {
    const x1 = Math.cos(t * Math.PI * 2)
    const y1 = Math.sin(t * Math.PI * 2)
    const x2 = Math.cos((t + 0.5 / numPoints) * Math.PI * 2) * innerRadius
    const y2 = Math.sin((t + 0.5 / numPoints) * Math.PI * 2) * innerRadius
    polygon.push([x1 * 0.5 + 0.5, y1 * 0.5 + 0.5])
    polygon.push([x2 * 0.5 + 0.5, y2 * 0.5 + 0.5])
  }
  console.log(polygon)
  return [[polygon, 'inside']]
}

const chambers = (params, numPoints = 1000) => {
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
  const outer = []
  const inner = []
  for (let t = 0; t < 1; t += 1 / numPoints) {
    const x = Math.cos(t * Math.PI * 2)
    const y = Math.sin(t * Math.PI * 2)
    outer.push([x * 0.5 + 0.5, y * 0.5 + 0.5])
    inner.push([
      clamp(x * r * 0.5 + 0.5 + X, 0, 1),
      clamp(y * r * 0.5 + 0.5 + Y, 0, 1),
    ])
  }
  return [
    [outer, 'inside'],
    [inner, 'outside'],
  ]
}

const boundaryGenerators = {
  circleSquare: {
    generator: circleSquare,
    params: [{min: 0, max: 3, step: 1 / 10, defaultValue: 1}],
  },
  rectanglePill: {
    generator: rectanglePill,
    params: [
      {min: -2, max: 2, step: 0.1, defaultValue: -1},
      {min: 0, max: 1, step: 0.05, defaultValue: 0.5},
    ],
  },
  starHexagon: {
    generator: starHexagon,
    params: [
      {min: 3, max: 8, step: 1, defaultValue: 6},
      {min: 0.25, max: 1, step: 0.05, defaultValue: 0.5},
    ],
  },
  chambers: {
    generator: chambers,
    params: [
      {min: 2, max: 18, step: 1, defaultValue: 3},
      {min: 0, max: 1.8, step: 0.1, defaultValue: 1.2},
    ],
  },
  doughnut: {
    generator: doughnut,
    params: [
      {min: -0.8, max: 0.8, step: 1 / 10, defaultValue: 0},
      {min: -0.8, max: 0.8, step: 1 / 10, defaultValue: 0},
      {min: 0.4, max: 0.975, step: 1 / 40, defaultValue: 0.5},
    ],
  },
}

export default boundaryGenerators
