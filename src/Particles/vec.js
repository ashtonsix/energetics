const vec = {
  $add(a, b) {
    a[0] += b[0]
    a[1] += b[1]
    return a
  },
  add(a, b) {
    return [a[0] + b[0], a[1] + b[1]]
  },
  $sub(a, b) {
    a[0] -= b[0]
    a[1] -= b[1]
    return a
  },
  sub(a, b) {
    return [a[0] - b[0], a[1] - b[1]]
  },
  $mult(a, b) {
    a[0] *= b
    a[1] *= b
    return a
  },
  mult(a, b) {
    return [a[0] * b, a[1] * b]
  },
  dot(a, b) {
    return a[0] * b[0] + a[1] * b[1]
  },
  length(a) {
    return (a[0] ** 2 + a[1] ** 2) ** 0.5
  },
  lengthLessThan(a, b) {
    return a[0] ** 2 + a[1] ** 2 < b ** 2
  },
  $setLength(a, b) {
    return vec.$mult(a, b / vec.length(a))
  },
  setLength(a, b) {
    return vec.mult(a, b / vec.length(a))
  },
  $mix(a, b, m) {
    a[0] = a[0] * (1 - m) + b[0] * m
    a[1] = a[1] * (1 - m) + b[1] * m
    return a
  },
  mix(a, b, m) {
    return [a[0] * (1 - m) + b[0] * m, a[1] * (1 - m) + b[1] * m]
  },
}

export default vec
