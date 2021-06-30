// adapted from https://github.com/henshmi/Classic-8-Ball-Pool/blob/ede58b77bb7d5b9d3a5d7ccf4c93df4e8437d3b9/src/geom/vector2.ts
const mix = (a, b, m) => a * m + b * (1 - m)

export default class Vector2 {
  constructor(x, y) {
    this._x = x
    this._y = y
  }

  get x() {
    return this._x
  }

  get y() {
    return this._y
  }

  static get zero() {
    return new Vector2(0, 0)
  }

  get length() {
    return Math.sqrt(Math.pow(this._x, 2) + Math.pow(this._y, 2))
  }

  static copy(vector) {
    return new Vector2(vector.x, vector.y)
  }

  addX(x) {
    return new Vector2(this._x, this._y).addToX(x)
  }

  addY(y) {
    return new Vector2(this._x, this._y).addToY(y)
  }

  addToX(x) {
    this._x += x
    return this
  }

  addToY(y) {
    this._y += y
    return this
  }

  addTo(vector) {
    return this.addToX(vector.x).addToY(vector.y)
  }

  add(vector) {
    return new Vector2(this._x, this._y).addTo(vector)
  }

  subtractTo(vector) {
    this._x -= vector.x
    this._y -= vector.y
    return this
  }

  subtract(vector) {
    return new Vector2(this._x, this._y).subtractTo(vector)
  }

  mult(v) {
    return new Vector2(this._x, this._y).multBy(v)
  }

  multBy(v) {
    this._x *= v
    this._y *= v
    return this
  }

  dot(vector) {
    return this._x * vector.x + this._y * vector.y
  }

  distFrom(vector) {
    return this.subtract(vector).length
  }
}
