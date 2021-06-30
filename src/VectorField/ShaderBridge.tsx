import {PicoGL} from 'picogl/build/module/picogl'
import raw from 'raw.macro'

const quadShader = raw('./shaders/quad.vert')
const reduce1Shader = raw('./shaders/reduce1.frag')
const reduce2Shader = raw('./shaders/reduce2.frag')

const wait = (f) => {
  let interval = 1

  return new Promise((resolve, reject) => {
    function test() {
      interval *= 1.5
      try {
        const success = f()
        if (success) resolve(null)
        else if (interval > 1000) reject(new Error('timeout'))
        else setTimeout(test, interval)
      } catch (e) {
        reject(e)
      }
    }
    test()
  })
}

export default class ShaderBridge {
  destroyed = false
  canvas = null
  pico = null
  programs = {}
  size = null
  quads = {full: null, reduce1: null, reduce2: null}
  textures = {read: {}, write: {}}
  uniformBuffers = {}
  async compute(fragShader, texturesIn, texturesOut) {
    await this.draw(fragShader, texturesIn, texturesOut, 'full')
  }
  async display(fragShader, texturesIn) {
    await this.draw(fragShader, texturesIn, 'screen', 'full')
  }
  async reduce(textureIn: string, textureOut: string) {
    await this.draw(reduce1Shader, [textureIn], ['reduce1'], 'reduce1')
    await this.draw(reduce2Shader, ['reduce1'], [textureOut], 'reduce2')
  }
  async draw(fragShader, texturesIn, texturesOut, quadName) {
    const {pico, programs, uniformBuffers} = this
    const quad = this.quads[quadName]

    let program
    if (programs[fragShader]) {
      program = programs[fragShader]
    } else {
      program = await pico.createProgram(quadShader, fragShader)
      programs[fragShader] = program
    }

    const drawCall = pico.createDrawCall(program, quad)
    for (const i in texturesIn) {
      drawCall.texture(
        'texture' + i,
        this.getTexture(texturesIn[i], 'read', 'full')
      )
    }
    for (const k in uniformBuffers) {
      const blockName = k[0].toUpperCase() + k.slice(1) + 'Uniforms'
      const uniformBuffer = uniformBuffers[k]
      drawCall.uniformBlock(blockName, uniformBuffer)
    }

    if (texturesOut === 'screen') {
      pico.defaultDrawFramebuffer().clear()
      drawCall.draw()
    } else {
      const frameBuffer = pico.createFramebuffer()
      for (const i in texturesOut) {
        frameBuffer.colorTarget(
          +i,
          this.getTexture(texturesOut[i], 'write', quadName)
        )
      }
      pico.drawFramebuffer(frameBuffer).clear()
      drawCall.draw()
      frameBuffer.delete()
      for (const i in texturesOut) {
        this.rotateTexture(texturesOut[i])
      }
    }

    return drawCall
  }
  async read(textureName) {
    const gl = this.pico.gl

    const texture = this.textures.read[textureName]
    const tw = texture.width
    const th = texture.height
    const pixels = new Float32Array(tw * th * 4)
    const buf = gl.createBuffer()
    const fb = gl.createFramebuffer()

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture.texture,
      0
    )
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buf)
    gl.bufferData(gl.PIXEL_PACK_BUFFER, pixels.byteLength, gl.STREAM_READ)
    gl.readPixels(0, 0, tw, th, gl.RGBA, gl.FLOAT, 0)
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    await this.waitUntilIdle()

    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buf)
    gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, pixels)
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null)

    gl.deleteBuffer(buf)

    return pixels
  }
  async waitUntilIdle() {
    const gl = this.pico.gl

    const start = performance.now()
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)
    gl.flush()

    await wait(() => {
      const status = gl.clientWaitSync(sync, 0, 0)
      if (status === gl.WAIT_FAILED) throw new Error('failed')
      const success = status !== gl.TIMEOUT_EXPIRED
      return success
    }).catch(() => {})
    gl.deleteSync(sync)

    const time = performance.now() - start
    return time
  }
  setTextures(textures) {
    for (const k in textures) {
      let texture = []

      textures[k].forEach((a) =>
        a.forEach((b) => b.forEach((c) => texture.push(c)))
      )

      let data = new Float32Array(texture)
      this.getTexture(k, 'read', 'full').data(data)
      this.getTexture(k, 'write', 'full').data(data)
    }
  }
  setUniforms(uniforms) {
    const {pico, uniformBuffers} = this

    for (const k in uniformBuffers) {
      uniformBuffers[k].delete()
      delete uniformBuffers[k]
    }
    for (const k in uniforms) {
      const uniform = uniforms[k]
      const uniformBuffer = pico.createUniformBuffer(
        uniform.map((v) =>
          typeof v === 'number'
            ? PicoGL.FLOAT
            : v.length === 2
            ? PicoGL.FLOAT_VEC2
            : PicoGL.FLOAT_VEC4
        )
      )
      uniform.forEach((v, i) => uniformBuffer.set(i, v))
      uniformBuffer.update()
      uniformBuffers[k] = uniformBuffer
    }
  }
  getQuad(xmin, xmax, ymin, ymax) {
    const {pico} = this

    // prettier-ignore
    const quadGeom = new Float32Array([
      xmin,ymin, xmin,ymax, xmax,ymax,
      xmin,ymin, xmax,ymin, xmax,ymax,
    ])
    const quadVertexBuffer = pico.createVertexBuffer(PicoGL.FLOAT, 2, quadGeom)
    const quadVertexArray = pico
      .createVertexArray()
      .vertexAttributeBuffer(0, quadVertexBuffer)

    return quadVertexArray
  }
  getTexture(
    name,
    io: 'read' | 'write',
    quadName: 'full' | 'reduce1' | 'reduce2'
  ) {
    const {pico, textures, size} = this
    const [width, height] = {
      full: [size, size],
      reduce1: [1, size],
      reduce2: [1, 1],
    }[quadName]

    if (textures[io][name]) return textures[io][name]

    const params = {internalFormat: PicoGL.RGBA32F}
    textures.read[name] = pico.createTexture2D(width, height, params)
    textures.write[name] = pico.createTexture2D(width, height, params)
    textures.read[name].data(
      new Float32Array(new Array(width * height * 4).fill(0))
    )
    textures.write[name].data(
      new Float32Array(new Array(width * height * 4).fill(0))
    )

    return textures[io][name]
  }
  rotateTexture(name) {
    const {textures} = this
    const t = textures.read[name]
    textures.read[name] = textures.write[name]
    textures.write[name] = t
  }
  constructor(size) {
    this.size = size
    ;(window as any).shaderBridge = this

    const canvas = document.createElement('canvas')
    canvas.style.width = size + 'px'
    canvas.style.height = size + 'px'
    canvas.style.imageRendering = 'pixelated'
    canvas.setAttribute('width', size + 'px')
    canvas.setAttribute('height', size + 'px')

    const pico = PicoGL.createApp(canvas).clearColor(1.0, 1.0, 1.0, 1.0)

    this.canvas = canvas
    this.pico = pico

    const oz = -1 + 2 / size
    this.quads.full = this.getQuad(-1, 1, -1, 1)
    this.quads.reduce1 = this.getQuad(-1, oz, -1, 1)
    this.quads.reduce2 = this.getQuad(-1, oz, -1, oz)
  }
  destroy() {
    for (const k in this.textures.read) this.textures.read[k].delete()
    for (const k in this.textures.write) this.textures.write[k].delete()
    this.destroyed = true
  }
}
