import ShaderBridge from './ShaderBridge'
import {configToUniforms, generateTextures, substanceReactParse} from './common'
import jsonStringify from 'json-stable-stringify'
import raw from 'raw.macro'
const cycle = raw('./shaders/cycle.frag')
const display = raw('./shaders/display.frag')
const hsluv = raw('./shaders/hsluv.glsl')

const compile = (str, inserts, optimised) => {
  str = str.replace(
    /\/\*\s*insert:(\w+)(?:.|\n)*?\*\//gm,
    (match, key) => inserts[key] || match
  )
  str = str.replace(
    /\/\*\s*insert-start:(\w+)(?:.|\n)*?insert-end(?:.|\n)*?\*\//gm,
    (match, key) => inserts[key] || match
  )
  if (!optimised) {
    str = str.replace(/\/\*8\s*/g, '')
    str = str.replace(/\s*8\*\//g, '')
  }
  return str
}

function substanceReactGenerator(config, optimised) {
  const parsed = substanceReactParse(config)

  if (parsed.length === 0) {
    return compile(
      cycle,
      {main: 'substanceReact();', reactionCount: 0},
      optimised
    )
  }

  const reactions = parsed
    .map(({uniforms}) => {
      return (
        'Reaction(' +
        uniforms
          .map((u) => `vec4(${u.map((v) => v.toFixed(1)).join(', ')})`)
          .join(', ') +
        ')'
      )
    })
    .join(', ')

  const reactionWeights = parsed.map(({weight}) => weight).join(', ')

  return compile(
    cycle,
    {
      main: 'substanceReact();',
      reactions,
      reactionWeights,
      reactionCount: parsed.length,
    },
    optimised
  )
}

const optimised = {
  copyPaste: compile(cycle, {main: 'copyPaste();'}, true),
  compactLength: compile(cycle, {main: 'compactLength();'}, true),
  transferPrepare: compile(cycle, {main: 'transferPrepare();'}, true),
  transferRun: compile(cycle, {main: 'transferRun();'}, true),
  addressPrepare: compile(cycle, {main: 'addressPrepare();'}, true),
  addressRun: compile(cycle, {main: 'addressRun();'}, true),
  substanceReactGenerator: (config) => substanceReactGenerator(config, true),
  display: compile(display, {hsluv}, true),
}

const regular = {
  copyPaste: compile(cycle, {main: 'copyPaste();'}, false),
  compactLength: compile(cycle, {main: 'compactLength();'}, false),
  transferPrepare: compile(cycle, {main: 'transferPrepare();'}, false),
  transferRun: compile(cycle, {main: 'transferRun();'}, false),
  addressPrepare: compile(cycle, {main: 'addressPrepare();'}, false),
  addressRun: compile(cycle, {main: 'addressRun();'}, false),
  substanceReactGenerator: (config) => substanceReactGenerator(config, false),
  display: compile(display, {hsluv}, false),
}

export default class Sim {
  config = null
  uniformsKey = null
  shaderBridge: ShaderBridge = null
  canvas: HTMLCanvasElement = null
  resizeCanvas(magnification = 1) {
    this.canvas.style.width = this.config.size * magnification + 'px'
    this.canvas.style.height = this.config.size * magnification + 'px'
  }
  updateShaderBridgeConfig() {
    const uniforms = configToUniforms(this.config)
    const uniformsKey = jsonStringify(uniforms)
    if (this.uniformsKey !== uniformsKey) {
      this.uniformsKey = uniformsKey
      this.shaderBridge.setUniforms(uniforms)
    }
  }
  async cycle() {
    const sim = this.shaderBridge
    this.updateShaderBridgeConfig()
    const p = this.config.substances.length > 3 ? regular : optimised
    await sim.compute(p.copyPaste, ['s01'], ['s01Prev'])
    await sim.compute(p.copyPaste, ['s23'], ['s23Prev'])
    await sim.compute(p.copyPaste, ['s45'], ['s45Prev'])
    await sim.compute(p.copyPaste, ['s67'], ['s67Prev'])
    await sim.compute(p.compactLength, ['s01', 's23'], ['s0123Len'])
    await sim.compute(p.compactLength, ['s45', 's67'], ['s4567Len'])
    // prettier-ignore
    await sim.compute(
      p.transferPrepare,
      ['s01', 's23', 's0123Len', 's45', 's67', 's4567Len'],
      [
        's01FWTFS', 's2_FWTFS', 's01Given', 's23Given',
        's45FWTFS', 's67FWTFS', 's45Given', 's67Given',
      ]
    );
    // prettier-ignore
    await sim.compute(
      p.transferRun,
      [
        's01', 's23', 's01FWTFS', 's2_FWTFS', 's01Given', 's23Given',
        's45', 's67', 's45FWTFS', 's67FWTFS', 's45Given', 's67Given',
      ],
      ['s01', 's23', 's45', 's67']
    );
    await sim.compute(
      p.substanceReactGenerator(this.config),
      ['s01', 's23', 'a0123', 'a4567', 's45', 's67'],
      ['s01', 's23', 'a0123', 'a4567', 's45', 's67']
    )
    await sim.compute(
      p.addressPrepare,
      ['a0123', 'a4567'],
      ['ap0123', 'ap4567']
    )
    await sim.reduce('ap0123', 'at0123')
    await sim.reduce('ap4567', 'at4567')
    await sim.compute(
      p.addressRun,
      ['a0123', 'a4567', 'at0123', 'at4567'],
      ['a0123', 'a4567']
    )
    // prettier-ignore
    await sim.display(p.display, [
      's01', 's23', 's01Prev', 's23Prev', 's01Given', 's23Given', 'a0123', 'a4567',
      's45', 's67', 's45Prev', 's67Prev', 's45Given', 's67Given',
    ])
    sim.read('s01')
    await sim.waitUntilIdle()
  }
  async display() {
    const sim = this.shaderBridge
    this.updateShaderBridgeConfig()
    const p = this.config.substances.length > 3 ? regular : optimised
    // prettier-ignore
    await sim.display(p.display, [
      's01', 's23', 's01Prev', 's23Prev', 's01Given', 's23Given', 'a0123', 'a4567',
      's45', 's67', 's45Prev', 's67Prev', 's45Given', 's67Given',
    ])
  }
  destroy() {
    this.shaderBridge.destroy()
  }
  constructor(config, texturePack) {
    const textures = generateTextures(texturePack, config)
    this.config = config
    this.shaderBridge = new ShaderBridge(config.size)
    this.shaderBridge.setTextures(textures)
    this.canvas = this.shaderBridge.canvas
  }
}
