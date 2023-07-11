import { WebGLRenderTarget } from 'three'

export class SingleFBO {
  constructor(width, height, renderer, options) {
    this.width = width
    this.height = height
    this.renderer = renderer

    this.target = new WebGLRenderTarget(width, height, renderer, options)
  }

  getTexture() {
    return this.target.texture
  }

  // convenience functions to match DoubleFBO
  getReadTarget() {
    return this.target
  }

  getWriteTarget() {
    return this.target
  }
}
