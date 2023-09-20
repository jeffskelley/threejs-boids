/**
 * Curl noise
 * https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph2007-curlnoise.pdf
 */

import {
  BufferGeometry,
  BufferAttribute,
  Points,
  ShaderMaterial,
  DoubleSide,
  Clock,
  Vector3,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'
import { GUI } from 'dat.gui'

import { RenderableScene } from '~/glxp/abstract/renderableScene'
import { FadePass } from '~/glxp/abstract/FadePass'

import defaultVert from '~/glxp/shaders/default.vert'
import particleVert from '~/glxp/shaders/curlParticle.vert'
import particleFrag from '~/glxp/shaders/curlParticle.frag'
import positionFrag from '~/glxp/shaders/curlPosition.frag'
import velocityFrag from '~/glxp/shaders/curlVelocity.frag'

const config = {
  simSize: 256, // should be a power of 2. number of particles is this squared
  velocity: 5,
  noiseAcceleration: 1,
  noiseMagnitude: 1,
  noiseChangeRate: 1,
  gravity: 0.01,
  source: new Vector3(0, 5, 0),
}

export class CurlScene extends RenderableScene {
  setup() {
    this.camera.position.z = 8

    this.initGUI()
    this.initParticles()
    this.initSimulation()
    this.initComposer()

    this.clock = new Clock()
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    // Call setup() of parent class at end
    super.setup()
  }

  initGUI() {
    const gui = new GUI()
    gui.useLocalStorage = true
    gui.remember(config)

    const folder = gui.addFolder('Curl Noise')
    folder.add(config, 'velocity', 0, 10, 0.001)
    folder.add(config, 'noiseAcceleration', 0, 10, 0.001)
    folder.add(config, 'noiseMagnitude', 0, 10, 0.001)
    folder.add(config, 'noiseChangeRate', 0, 10, 0.001)
    folder.add(config, 'gravity', 0, 1, 0.001)
    folder.open()

    this.gui = gui
  }

  initSimulation() {
    this.gpuCompute = new GPUComputationRenderer(
      config.simSize,
      config.simSize,
      this.renderer
    )

    const dtPosition = this.gpuCompute.createTexture()
    const dtVelocity = this.gpuCompute.createTexture()

    this.fillTextures(dtPosition, dtVelocity)

    this.position = this.gpuCompute.addVariable(
      'tPosition',
      positionFrag,
      dtPosition
    )
    this.velocity = this.gpuCompute.addVariable(
      'tVelocity',
      velocityFrag,
      dtVelocity
    )

    this.gpuCompute.setVariableDependencies(this.position, [
      this.position,
      this.velocity,
    ])
    this.gpuCompute.setVariableDependencies(this.velocity, [
      this.position,
      this.velocity,
    ])

    this.position.material.uniforms = {
      uSource: { value: config.source },
      uDeltaTime: { value: 0 },
    }
    this.velocity.material.uniforms = {
      ...this.velocity.material.uniforms,
      uTime: { value: 0 },
      uVelocity: { value: config.velocity },
      uNoiseAcceleration: { value: config.noiseAcceleration },
      uNoiseMagnitude: { value: config.noiseMagnitude },
      uNoiseChangeRate: { value: config.noiseChangeRate },
      uGravity: { value: config.gravity },
    }

    const error = this.gpuCompute.init()
    if (error !== null) {
      console.error(error)
    }
  }

  initParticles() {
    const geometry = new BufferGeometry()
    const vertices = new Float32Array(Math.pow(config.simSize, 2) * 3)
    const uvs = new Float32Array(Math.pow(config.simSize, 2) * 2)

    this.uniforms = {
      tVelocity: { value: null },
      tPosition: { value: null },
      uCameraPosition: { value: null },
    }

    for (let j = 0; j < config.simSize; j++) {
      for (let k = 0; k < config.simSize; k++) {
        let v = j + k * config.simSize
        vertices[v * 3 + 0] = j // x
        vertices[v * 3 + 1] = k // y
        vertices[v * 3 + 2] = 0 // z

        uvs[v * 2 + 0] = j / (config.simSize - 1) // x
        uvs[v * 2 + 1] = k / (config.simSize - 1) // y
      }
    }

    geometry.setAttribute('position', new BufferAttribute(vertices, 3))
    geometry.setAttribute('uv', new BufferAttribute(uvs, 2))

    this.particleMaterial = new ShaderMaterial({
      vertexShader: particleVert,
      fragmentShader: particleFrag,
      uniforms: this.uniforms,
      side: DoubleSide,
    })

    this.particleMaterial.extensions.drawBuffers = true
    this.particleMesh = new Points(geometry, this.particleMaterial)

    this.scene.add(this.particleMesh)
  }

  fillTextures(dtPosition, dtVelocity) {
    const positionArray = dtPosition.image.data
    const velocityArray = dtVelocity.image.data

    const positionConstant = 6
    const velocityConstant = 1

    for (let k = 0, kl = velocityArray.length; k < kl; k += 4) {
      positionArray[k + 0] =
        (Math.random() * 2 - 1) * positionConstant + config.source.x
      positionArray[k + 1] =
        (Math.random() * 2 - 1) * positionConstant + config.source.y
      positionArray[k + 2] =
        (Math.random() * 2 - 1) * positionConstant + config.source.z
      positionArray[k + 3] = 1

      velocityArray[k + 0] = (Math.random() * 2 - 1) * velocityConstant
      velocityArray[k + 1] = (Math.random() * 2 - 1) * velocityConstant
      velocityArray[k + 2] = (Math.random() * 2 - 1) * velocityConstant
      velocityArray[k + 3] = 1
    }
  }

  initComposer() {
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.composer.addPass(new FadePass())
  }

  update() {
    const deltaTime = Math.min(this.clock.getDelta(), 1.0) // prevent large leaps

    this.controls.update()

    // position shader uniforms
    this.position.material.uniforms.uDeltaTime.value = deltaTime
    this.position.material.uniforms.uSource.value = config.source

    // velocity shader uniforms
    this.velocity.material.uniforms.uTime.value = this.clock.elapsedTime
    this.velocity.material.uniforms.uVelocity.value = config.velocity
    this.velocity.material.uniforms.uNoiseAcceleration.value =
      config.noiseAcceleration
    this.velocity.material.uniforms.uNoiseMagnitude.value =
      config.noiseMagnitude
    this.velocity.material.uniforms.uNoiseChangeRate.value =
      config.noiseChangeRate
    this.velocity.material.uniforms.uGravity.value = config.gravity

    this.gpuCompute.compute()

    // particles uniforms
    this.uniforms.tPosition.value = this.gpuCompute.getCurrentRenderTarget(
      this.position
    ).texture
    this.uniforms.uCameraPosition.value = this.camera.position
  }

  render() {
    this.update()
    this.composer.render()
  }
}
