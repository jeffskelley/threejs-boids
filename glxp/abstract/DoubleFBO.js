import { WebGLRenderTarget } from 'three'

export class DoubleFBO {
  constructor(width, height, renderer, options) {
    this.width = width
    this.height = height
    this.renderer = renderer

    this.targets = [
      new WebGLRenderTarget(width, height, renderer, options),
      new WebGLRenderTarget(width, height, renderer, options),
    ]
    this.readIndex = 0
  }

  getReadTarget() {
    return this.targets[this.readIndex]
  }

  getWriteTarget() {
    return this.targets[this.readIndex === 0 ? 1 : 0]
  }

  getTexture() {
    return this.getReadTarget().texture
  }

  swap() {
    this.readIndex = this.readIndex === 0 ? 1 : 0
  }
}
