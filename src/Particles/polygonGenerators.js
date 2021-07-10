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
  return polygon
}

// rectangle/pill

// - ratio
// - corner roundness

// star/hexagon

// - star pointiness
// - number of vertices

// chambers
const chambers = (params, numPoints = 1000) => {
  const [n, r] = params
  const polygon = []
  for (let t = 0; t < Math.PI * 2; t += (Math.PI * 2) / numPoints) {
    const x = (Math.cos(t) * (Math.PI + Math.sin(n * t) * r)) / (Math.PI + r)
    const y = (Math.sin(t) * (Math.PI + Math.sin(n * t) * r)) / (Math.PI + r)
    polygon.push([x * 0.5 + 0.5, y * 0.5 + 0.5])
  }
  return polygon
}

// - number of chambers
// - radius of chambers

// doughnut

// - x
// - y
// - radius

const polygonGenerators = {circleSquare, chambers}

export default polygonGenerators
