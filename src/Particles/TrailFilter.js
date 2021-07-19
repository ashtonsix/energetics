import * as PIXI from 'pixi.js'

let fragmentShader = `
precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uSamplerPrev;
uniform float uAlpha;
uniform float uStopAt;

void main(void)
{
  vec4 color1 = texture2D(uSampler, vTextureCoord);
  vec4 color2 = texture2D(uSamplerPrev, vTextureCoord) * uAlpha;
  if (color2.a <= uStopAt) color2 = vec4(0.0, 0.0, 0.0, 0.0);
  gl_FragColor = color2 * (1.0 - color1.a) + color1;
}
`

new PIXI.Point()

export default class TrailFilter extends PIXI.Filter {
  constructor() {
    super('', fragmentShader)

    this.doNothingFilter = new PIXI.Filter()
    this.uniforms.uAlpha = 0
    this.uniforms.uStopAt = 0.3
    this.uniforms.uSamplerPrev = null
  }

  trailLength = 0
  isActive = () => false

  apply(filterManager, input, output, clear) {
    this.filterManager = filterManager
    const numSteps = this.trailLength * 4
    const stopAt = this.uniforms.uStopAt - 0.01
    // calculate how many steps of x_{i+1} = x_{i} * y are required until x<stopAt, for x_{0} = 1:
    this.uniforms.uAlpha =
      this.trailLength >= 1000 ? 1 : (stopAt ** 0.5) ** (2 / numSteps)
    if (!this.isActive()) {
      this.doNothingFilter.apply(
        filterManager,
        this.uniforms.uSamplerPrev || input,
        output,
        clear
      )
      return
    }
    filterManager.texturePool.textureOptions.type = PIXI.TYPES.FLOAT

    if (!this.uniforms.uSamplerPrev) {
      let tex = filterManager.getFilterTexture()
      filterManager.renderer.renderTexture.bind(tex, tex.filterFrame)
      filterManager.renderer.renderTexture.clear()
      this.uniforms.uSamplerPrev = tex
    }

    let prevFrame = filterManager.getFilterTexture()
    filterManager.renderer.renderTexture.bind(prevFrame, prevFrame.filterFrame)
    filterManager.renderer.renderTexture.clear()

    filterManager.applyFilter(this, input, prevFrame, true)
    this.doNothingFilter.apply(filterManager, prevFrame, output, clear)

    let expiredTexture = this.uniforms.uSamplerPrev
    this.uniforms.uSamplerPrev = prevFrame
    setTimeout(() => {
      try {
        filterManager.returnFilterTexture(expiredTexture)
      } catch (e) {
        // error occurs when navigating away from particle simulator, when
        // filterManager is destroyed, along with the filterTexturePool.
        // this means the texture cannot be returned and an error occurs,
        // but it's unimportant so we ignore it.
      }
    })
  }
}
