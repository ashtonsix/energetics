import {hexToHpluv, hexToHsluv} from 'hsluv'

export const defaultConfig = {
  seed: -1,
  size: 150,
  transferRadius: 2,
  substances: [
    {name: 'A', arc: 2 / 3, flo: 0.5},
    {name: 'W', arc: 0.99, flo: 0},
    {name: 'B', arc: 0.999999, flo: 1},
  ],
  substanceAttractionMatrix: {
    A2W: 1,
    B2W: 0,
  },
  reactionParameters: {},
  reactions: [
    'A -> B, input0.y > 0.0 ? 1.0 : 0.0',
    'B -> A, input0.y > 0.0 ? 0.0 : 1.0',
  ],
  display: {
    magnification: 1,
    iterationsPerSecond: 500,
    brightness: 0,
    contrast: 18,
    scheme: 'gradient', // gradient, softmax
    quantity: 'energy', // energy, direction, energyDelta
    chroma: 'HPLuv', // HSLuv, HPLuv
    dynamicRange: 'sigmoid', // linear, logarithmic, sigmoid
    gradient: {
      interpolation: 'palette', // palette, monochrome, divergent, greyscale, hue
      palette: {
        toneA: {hex: '#00070E'},
        toneB: {hex: '#ffa600'},
      },
      monochrome: {
        tone: {hex: '#004c6d'},
        shiftLuminance: 90,
        shiftSaturation: 20,
      },
      divergent: {
        toneA: {hex: '#31408F'},
        toneB: {hex: '#de425b'},
        midpointLuminance: 80,
        midpointSaturation: 0,
      },
    },
    softmax: {
      saturation: 'checkbox', // checkbox, radio
    },
    substances: (() => {
      const substances = new Array(9).fill(null).map((_, i) => ({
        active: true,
        relativeBrightness: 1 / 4,
        alpha: false,
        hot: true,
        softmaxHue: [0, 3, 6, 1, 4, 7, 2, 8, 10][i],
      }))
      substances[1].alpha = true
      substances[2].active = false
      return substances
    })(),
  },
}

const defaultSubstance = {
  name: null,
  // behaviour
  arc: null,
  arcWeight: 1,
  arcBlending: 0,
  flo: null,
  floWeight: 1,
  floBlending: 0,
  dirWeight: 1,
  dirBlending: 0,
  // display
  active: true,
  relativeBrightness: 0,
  alpha: false,
  hot: true,
  softmaxHue: null,
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const epsilon10 = 0.00000001
const bigilon10 = 99999999.9

const attributeClamps = {
  arc: [epsilon10, 1], // espsilon * 10
  arcWeight: [0, bigilon10],
  arcBlending: [0, 1],
  flo: [0, 1],
  floWeight: [0, bigilon10],
  floBlending: [0, 1],
  dirWeight: [0, bigilon10],
  dirBlending: [0, 1],
  relativeBrightness: [0, 1],
  softmaxHue: [0, bigilon10],
}

export const texturePacks = {
  contained: (x, y, size) => {
    const cx = size / 2
    const cy = size / 2
    const wall = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 >= size / 2 - 5

    return {
      A: {energy: wall ? 0 : Math.random()},
      W: {energy: wall ? 1 : 0},
    }
  },
  notContained: (x, y, size) => {
    return {A: {energy: Math.random()}}
  },
  mobiusStrip: (x, y, size) => {
    const wall = x < 5 || x > size - 5
    return {
      A: {energy: wall ? 0 : Math.random()},
      W: {energy: wall ? 1 : 0},
    }
  },
}

const mix = (a, b, m) => a * (1 - m) + b * m
const mixRing = (a, b, m, r) => {
  if (Math.abs(a + r - b) < Math.abs(a - b)) a += r
  else if (Math.abs(b + r - a) < Math.abs(a - b)) b += r
  const c = a * (1 - m) + b * m
  return c % r
}
const mixColors = (a, b, m): [number, number, number] => {
  const e = 0.01
  const h = a[1] < e ? b[0] : b[1] < e ? a[0] : mixRing(a[0], b[0], m, 360)
  return [h, mix(a[1], b[1], m), mix(a[2], b[2], m)]
}

export const gradientToColors = ({chroma, gradient}) => {
  const hexToHsl =
    chroma === 'HSLuv'
      ? hexToHsluv
      : (hex: string) => {
          const [h, s, l] = hexToHpluv(hex)
          return [h, Math.min(s, 100), l]
        }

  return {
    palette: () => {
      const a = hexToHsl(gradient.palette.toneA.hex)
      const b = hexToHsl(gradient.palette.toneB.hex)
      return [
        a,
        mixColors(a, b, 1 / 4),
        mixColors(a, b, 2 / 4),
        mixColors(a, b, 3 / 4),
        b,
      ]
    },
    monochrome: () => {
      const a = hexToHsl(gradient.monochrome.tone.hex)
      const b = [
        a[0],
        gradient.monochrome.shiftSaturation,
        gradient.monochrome.shiftLuminance,
      ]
      return [
        a,
        mixColors(a, b, 1 / 4),
        mixColors(a, b, 2 / 4),
        mixColors(a, b, 3 / 4),
        b,
      ]
    },
    divergent: () => {
      const a = hexToHsl(gradient.divergent.toneA.hex)
      const b = hexToHsl(gradient.divergent.toneB.hex)
      const mid = [
        mixRing(a[0], b[0], 0.5, 360),
        gradient.divergent.midpointSaturation,
        gradient.divergent.midpointLuminance,
      ]
      return [a, mixColors(a, mid, 1 / 2), mid, mixColors(mid, b, 1 / 2), b]
    },
    greyscale: () => {
      return [
        [0, 0, 0 / 4],
        [0, 0, 100 / 4],
        [0, 0, 200 / 4],
        [0, 0, 300 / 4],
        [0, 0, 400 / 4],
      ]
    },
    hue: () => {
      const s = 100
      const l = 70
      return [
        [0, s, l],
        [90, s, l],
        [180, s, l],
        [270, s, l],
        [360, s, l],
      ]
    },
  }[gradient.interpolation]()
}

export function configToUniforms(config) {
  const substances = config.substances.slice()
  const displaySubstances = config.display
    ? config.display.substances.slice()
    : []
  const avgRelativeBrightness =
    displaySubstances.reduce(
      (pv, v) => pv + (v.active ? +v.relativeBrightness : 0),
      0
    ) / displaySubstances.length
  substances.splice(3, 0, {...defaultSubstance})
  displaySubstances.splice(3, 0, {...defaultSubstance})
  const substanceAttribute = (offset, key) => {
    const a = new Array(4).fill(0)
    for (let i = 0; i < 4; i++) {
      const s = substances[offset * 4 + i] || defaultSubstance
      const sd = displaySubstances[offset * 4 + i] || defaultSubstance
      a[i] = +(s[key] || sd[key] || defaultSubstance[key] || 0)
      a[i] = clamp(a[i], attributeClamps[key][0], attributeClamps[key][1])
      if (key === 'arc') a[i] *= Math.PI
      if (key === 'relativeBrightness') a[i] /= avgRelativeBrightness
    }
    return a
  }
  const displaySubstanceBitArray = (key) => {
    let value = 0
    const sd = config.display ? config.display.substances.slice() : []
    sd.splice(3, 0, null)
    for (let i = 0; i < 10; i++) {
      if (i === 3) continue
      value += sd[i]?.[key] ? 2 ** i : 0
    }
    return value
  }

  let transferRadius = config.transferRadius
  if (transferRadius - 0.5 === Math.floor(transferRadius))
    transferRadius -= 0.000001

  const am = new Array(8).fill(null).map(() => new Array(8).fill(1))
  for (const k in config.substanceAttractionMatrix) {
    const [a, b] = k.split('2')
    const v = config.substanceAttractionMatrix[k]
    const ai = substances.findIndex((s) => s.name === a)
    const bi = substances.findIndex((s) => s.name === b)
    if (ai === -1 || bi === -1) continue
    am[ai][bi] = clamp(v, -bigilon10, bigilon10)
  }

  const display = {...defaultConfig.display, ...config.display}
  const colors = gradientToColors(display)

  // prettier-ignore
  const uniforms = {
    static: [clamp(config.size, 3, 1024), clamp(transferRadius, 2 ** 0.5 * 0.5, 12)],
    substance: [
      substanceAttribute(0, 'arc'), substanceAttribute(0, 'arcWeight'), substanceAttribute(0, 'arcBlending'),
      substanceAttribute(0, 'flo'), substanceAttribute(0, 'floWeight'), substanceAttribute(0, 'floBlending'),
                                    substanceAttribute(0, 'dirWeight'), substanceAttribute(0, 'dirBlending'),
      substanceAttribute(1, 'arc'), substanceAttribute(1, 'arcWeight'), substanceAttribute(1, 'arcBlending'),
      substanceAttribute(1, 'flo'), substanceAttribute(1, 'floWeight'), substanceAttribute(1, 'floBlending'),
                                    substanceAttribute(1, 'dirWeight'), substanceAttribute(1, 'dirBlending'),
    ],
    substanceAttractionMatrix: [
      [am[0][0],am[0][1],am[0][2],am[0][3]], [am[1][0],am[1][1],am[1][2],am[1][3]],
      [am[2][0],am[2][1],am[2][2],am[2][3]], [am[3][0],am[3][1],am[3][2],am[3][3]],
      [am[4][0],am[4][1],am[4][2],am[4][3]], [am[5][0],am[5][1],am[5][2],am[5][3]],
      [am[6][0],am[6][1],am[6][2],am[6][3]], [am[7][0],am[7][1],am[7][2],am[7][3]],
      [am[0][4],am[0][5],am[0][6],am[0][7]], [am[1][4],am[1][5],am[1][6],am[1][7]],
      [am[2][4],am[2][5],am[2][6],am[2][7]], [am[3][4],am[3][5],am[3][6],am[3][7]],
      [am[4][4],am[4][5],am[4][6],am[4][7]], [am[5][4],am[5][5],am[5][6],am[5][7]],
      [am[6][4],am[6][5],am[6][6],am[6][7]], [am[7][4],am[7][5],am[7][6],am[7][7]],
    ],
    display: [
      display.scheme === 'gradient' ? 0 : 1,
      ['energy', 'direction', 'energyDelta', 'cosineNormalised', 'cosine'].indexOf(display.quantity),
      display.chroma === 'HSLuv' ? 0 : 1,
      display.dynamicRange === 'linear' ? 0 : display.dynamicRange === 'logarithmic' ? 1 : 2,
      +display.brightness,
      +display.contrast / (32 - +display.contrast),
      displaySubstanceBitArray('active'),
      displaySubstanceBitArray('alpha'),
      displaySubstanceBitArray('hot'),
      colors[0].concat(0),
      colors[1].concat(0),
      colors[2].concat(0),
      colors[3].concat(0),
      colors[4].concat(0),
      substanceAttribute(0, 'relativeBrightness'),
      substanceAttribute(1, 'relativeBrightness'),
      [+config.display?.substances?.[7]?.relativeBrightness, +config.display?.substances?.[8]?.relativeBrightness, 0, 0],
      substanceAttribute(0, 'softmaxHue'),
      substanceAttribute(1, 'softmaxHue'),
      [+config.display?.substances?.[7]?.softmaxHue, +config.display?.substances?.[8]?.softmaxHue, 0, 0],
    ]
  }

  return uniforms
}

export function generateTextures(generator, config) {
  let data = new Array(config.size)
    .fill(null)
    .map((_, y) =>
      new Array(config.size)
        .fill(null)
        .map((_, x) => generator(x, y, config.size))
    )
  const avgEnergy =
    data.reduce(
      (pv, row) =>
        pv +
        row.reduce(
          (pv, cell) =>
            pv + Object.values(cell).reduce((pv, v: any) => pv + v.energy, 0),
          0
        ),
      0
    ) /
    config.size ** 2

  data.forEach((row) =>
    row.forEach((cell) =>
      Object.values(cell).forEach((v: any) => (v.energy /= avgEnergy))
    )
  )

  let textureCount = config.substances.length
  if (textureCount >= 4) textureCount += 1

  let textures = {}
  // prettier-ignore
  let indices = [[0, 1], [2, -1], [3, 4], [5, 6]].slice(0, Math.ceil(textureCount / 2));
  for (let [i, j] of indices) {
    let texture = new Array(config.size).fill(null).map((_, y) =>
      new Array(config.size).fill(null).map((_, x) => {
        const s0 = config.substances[i]?.name
        const s1 = config.substances[j]?.name
        let e0 = data[y][x][s0]?.energy ?? 0
        let d0 = data[y][x][s0]?.direction ?? Math.random() * Math.PI * 2
        let e1 = data[y][x][s1]?.energy ?? 0
        let d1 = data[y][x][s1]?.direction ?? Math.random() * Math.PI * 2
        return [
          Math.cos(d0) * e0,
          Math.sin(d0) * e0,
          Math.cos(d1) * e1,
          Math.sin(d1) * e1,
        ]
      })
    )
    if (i >= 3) i++
    textures[`s${i}${i + 1}`] = texture
  }
  return textures
}

export function substanceReactParse(config) {
  const reactionStrings = config.reactions
  const names = new Array(8).fill('')
  config.substances.forEach((s, i) => {
    if (i >= 3) i += 1
    names[i] = s.name
  })
  if (Array.from(new Set(names)).length < config.substances.length + 1) {
    throw new Error('Every name must be unique')
  }
  if (config.substances.includes((s) => /[^A-Z]/.test(s.name))) {
    throw new Error('names can only include capitalised letters')
  }
  names.push(...['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'])

  /**
   * 'A + B -> 2A, 1.0' =>
   * input: [{quantity: 1, name: 'A'}, {quantity: 1, name: 'B'}],
   * output: [{quantity: 2, name: 'A'}],
   * weight: 1
   */
  const reactions = reactionStrings
    .map((text) => {
      const [, input, output, weight] = text.match(/(.+)->(.+),(.+)/)
      const reaction = {
        text,
        input: input.split('+').map((str) => {
          const [, quantity, name] = str.match(/(\d*)([A-Za-z]\w*)/)
          return {quantity: +(quantity || '1'), name}
        }),
        output: output.split('+').map((str) => {
          const [, quantity, name] = str.match(/(\d*)([A-Za-z]\w*)/)
          return {quantity: +(quantity || '1'), name}
        }),
        weight: weight.trim(),
      }
      if (
        reaction.input.reduce((pv, v) => pv + v.quantity, 0) !==
        reaction.output.reduce((pv, v) => pv + v.quantity, 0)
      ) {
        throw new Error(
          `Every reaction must be balanced ('${reaction.text}' is not)`
        )
      }
      let inputAddresses = {}
      reaction.input.forEach(({name}) => {
        if (/a[0-7]/.test(name)) inputAddresses[name] = true
      })
      reaction.output.forEach(({name}) => {
        if (inputAddresses[name]) {
          throw new Error(
            `An address cannot send energy to itself (${name} -> ${name})`
          )
        }
      })
      return reaction
    })
    .map((reaction) => {
      const input = new Array(16).fill(0)
      const output = new Array(16).fill(0)
      reaction.input.forEach(({quantity, name}) => {
        const index = names.indexOf(name)
        if (index === -1) throw new Error(`${name} is not a defined name`)
        input[index] += quantity
      })
      reaction.output.forEach(({quantity, name}) => {
        const index = names.indexOf(name)
        if (index === -1) throw new Error(`${name} is not a defined name`)
        output[index] += quantity
      })
      // TODO: parse weight
      // all names in equation must be described elsewhere.
      // weight must simultaneously be a valid JavaScript and GLSL expression which yields a float
      // must not contain a semicolon
      // prettier-ignore
      return {
        uniforms: [
          input.slice(0, 4), input.slice(4, 8), input.slice(8, 12), input.slice(12, 16),
          output.slice(0, 4), output.slice(4, 8), output.slice(8, 12), output.slice(12, 16),
        ],
        weight: reaction.weight,
      };
    })

  return reactions
}
