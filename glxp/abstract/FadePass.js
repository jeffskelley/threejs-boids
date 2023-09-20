import {
  HalfFloatType,
  MeshBasicMaterial,
  NearestFilter,
  ShaderMaterial,
  UniformsUtils,
  WebGLRenderTarget,
} from 'three'

import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js'

import defaultVert from '~/glxp/shaders/default.vert'
import fadeFrag from '~/glxp/shaders/fade.frag'

class FadePass extends Pass {
  constructor(damp = 0.96) {
    super()

    this.shader = {
      uniforms: {
        tOld: { value: null },
        tNew: { value: null },
        damp: { value: null },
      },
      vertexShader: defaultVert,
      fragmentShader: fadeFrag,
    }

    this.uniforms = UniformsUtils.clone(this.shader.uniforms)

    this.uniforms['damp'].value = damp

    this.textureComp = new WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        magFilter: NearestFilter,
        type: HalfFloatType,
      }
    )

    this.textureOld = new WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        magFilter: NearestFilter,
        type: HalfFloatType,
      }
    )

    this.compFsMaterial = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.shader.vertexShader,
      fragmentShader: this.shader.fragmentShader,
    })

    this.compFsQuad = new FullScreenQuad(this.compFsMaterial)

    this.copyFsMaterial = new MeshBasicMaterial()
    this.copyFsQuad = new FullScreenQuad(this.copyFsMaterial)
  }

  render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive*/) {
    this.uniforms['tOld'].value = this.textureOld.texture
    this.uniforms['tNew'].value = readBuffer.texture

    renderer.setRenderTarget(this.textureComp)
    this.compFsQuad.render(renderer)

    this.copyFsQuad.material.map = this.textureComp.texture

    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
      this.copyFsQuad.render(renderer)
    } else {
      renderer.setRenderTarget(writeBuffer)

      if (this.clear) renderer.clear()

      this.copyFsQuad.render(renderer)
    }

    const temp = this.textureOld
    this.textureOld = this.textureComp
    this.textureComp = temp
  }

  setSize(width, height) {
    this.textureComp.setSize(width, height)
    this.textureOld.setSize(width, height)
  }

  dispose() {
    this.textureComp.dispose()
    this.textureOld.dispose()

    this.compFsMaterial.dispose()
    this.copyFsMaterial.dispose()

    this.compFsQuad.dispose()
    this.copyFsQuad.dispose()
  }
}

export { FadePass }
