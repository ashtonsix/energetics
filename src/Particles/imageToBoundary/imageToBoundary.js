/**
 *
 * this script converts images to arenas. first of all, save
 * the image as a .bmp file, and then convert it to a .svg
 * with this command (installing potrace if necessary):
 *
 * potrace -a 0 -s -z black [filename].bmp
 *
 * then run this:
 *
 * node imageToBoundary [filename].svg
 *
 * and then copy the output into the source code to use it.
 *
 **/

const {parseSVG, makeAbsolute} = require('svg-path-parser')
const fs = require('fs')

// http://antigrain.com/research/adaptive_bezier/
function sampleCubicBezier(x0, y0, x1, y1, x2, y2, x3, y3) {
  const tolerance = 1
  // Calculate all the mid-points of the line segments
  const x01 = (x0 + x1) / 2
  const y01 = (y0 + y1) / 2
  const x12 = (x1 + x2) / 2
  const y12 = (y1 + y2) / 2
  const x23 = (x2 + x3) / 2
  const y23 = (y2 + y3) / 2
  const x012 = (x01 + x12) / 2
  const y012 = (y01 + y12) / 2
  const x123 = (x12 + x23) / 2
  const y123 = (y12 + y23) / 2
  const x0123 = (x012 + x123) / 2
  const y0123 = (y012 + y123) / 2

  // Try to approximate the full cubic curve by a single straight line
  const dx = x3 - x0
  const dy = y3 - y0

  const d1 = Math.abs((x1 - x3) * dy - (y1 - y3) * dx)
  const d2 = Math.abs((x2 - x3) * dy - (y2 - y3) * dx)

  if ((d1 + d2) * (d1 + d2) < tolerance * (dx * dx + dy * dy)) {
    return [[x0123, y0123]]
  } else {
    // Continue subdivision
    return [].concat(
      sampleCubicBezier(x0, y0, x01, y01, x012, y012, x0123, y0123),
      sampleCubicBezier(x0123, y0123, x123, y123, x23, y23, x3, y3)
    )
  }
}

const filename = process.argv[2]

if (!filename) {
  console.log()
  console.log('ERROR: no image path given')
  console.log()
  console.log('Try running this script like so:')
  console.log('node bitmapToBoundary.js [filename]')
  console.log()
  process.exit(2)
}
console.log('Converting ' + filename + ' to arena...')

let image,
  paths = [],
  flipX,
  flipY
try {
  image = fs.readFileSync(filename, 'utf8')
} catch (e) {
  console.error(e.message)
  process.exit(2)
}

try {
  let regex = /path d="([^"]+)/gm
  let matches
  while ((matches = regex.exec(image))) {
    paths.push(matches[1])
  }
  paths = paths.map((path) => makeAbsolute(parseSVG(path)))
  let [xScale, yScale] = image.match(/scale\(([^)]+)\)/)[1].split(',')
  flipX = +xScale < 0
  flipY = +yScale < 0
} catch (e) {
  console.log('Could not parse image, is it an svg created by potrace?')
  process.exit(2)
}

let insiders = []
let polygons = []
let current = []

for (let p = 0; p < paths.length; p++) {
  let path = paths[p]

  for (let i = 0; i < path.length; i++) {
    if (i === 0) insiders.push(polygons.length)
    let prev = path[i - 1]
    let cmd = path[i]
    let {x, y} = cmd

    switch (cmd.code) {
      case 'M':
        current = []
        polygons.push(current)
        current.push([x, y])
        break
      case 'L':
      case 'H':
      case 'V':
      case 'Z':
        current.push([x, y])
        break
      case 'C':
        current.push(
          ...sampleCubicBezier(
            cmd.x0,
            cmd.y0,
            cmd.x1,
            cmd.y1,
            cmd.x2,
            cmd.y2,
            cmd.x,
            cmd.y
          )
        )
        current.push([x, y])
        break
      case 'S':
        let x1 = 0
        let y1 = 0
        if (prev) {
          if (prev.code === 'C') {
            x1 = prev.x * 2 - prev.x2
            y1 = prev.y * 2 - prev.y2
          } else {
            x1 = prev.x
            y1 = prev.y
          }
        }
        current.push(
          ...sampleCubicBezier(
            cmd.x0,
            cmd.y0,
            x1,
            y1,
            cmd.x2,
            cmd.y2,
            cmd.x,
            cmd.y
          )
        )
        current.push([x, y])
        break
      default:
        break
    }
  }
}

let minX = polygons[0][0][0]
let maxX = polygons[0][0][0]
let minY = polygons[0][0][1]
let maxY = polygons[0][0][1]
for (let p = 0; p < polygons.length; p++) {
  let polygon = polygons[p]
  for (let i = 0; i < polygon.length; i++) {
    let [x, y] = polygon[i]
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
}
let range = Math.max(maxX - minX, maxY - minY)

for (let p = 0; p < polygons.length; p++) {
  let polygon = polygons[p]
  for (let i = 0; i < polygon.length; i++) {
    let [x, y] = polygon[i]
    x = +((x - minX) / range).toFixed(4)
    y = +((y - minY) / range).toFixed(4)
    if (flipX) x = +(1 - x).toFixed(4)
    if (flipY) y = +(1 - y).toFixed(4)
    polygon[i] = [x, y]
  }
}

polygons = polygons.map((polygon, i) => [
  polygon,
  insiders.includes(i) ? 'inside' : 'outside',
])

console.log(JSON.stringify(polygons))
