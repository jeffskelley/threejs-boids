import {
  BufferGeometry,
  BufferAttribute,
  Points,
  ShaderMaterial,
  DoubleSide,
  Clock,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'
import { GUI } from 'dat.gui'

import { RenderableScene } from '~/glxp/abstract/renderableScene'
// import { DoubleFBO } from '~/glxp/abstract/DoubleFBO'

import boidsVert from '~/glxp/shaders/boids.vert'
import boidsFrag from '~/glxp/shaders/boids.frag'
import positionFrag from '~/glxp/shaders/position.frag'
import velocityFrag from '~/glxp/shaders/velocity.frag'

const config = {
  simSize: 128, // should be a power of 2. number of boids is this squared

  separation: 0.5,
  alignment: 0.08,
  cohesion: 0.69,
  perceptionRadius: 0.93,
  perceptionAngle: 0.5,
  boundaryRadius: 50,
  maxVelocity: 4.015,
  maxAcceleration: 1,
}

export class HomeScene extends RenderableScene {
  setup() {
    this.camera.position.z = 10
    this.initGUI()
    this.initParticles()
    this.initSimulation()

    this.clock = new Clock()
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    // Call setup() of parent class at end
    super.setup()
  }

  initGUI() {
    const gui = new GUI()
    gui.useLocalStorage = true
    gui.remember(config)

    const boidsFolder = gui.addFolder('Boids')
    boidsFolder.add(config, 'separation', 0, 1, 0.01)
    boidsFolder.add(config, 'alignment', 0, 1, 0.01)
    boidsFolder.add(config, 'cohesion', 0, 1, 0.01)
    boidsFolder.add(config, 'perceptionRadius', 0, 10, 0.01)
    boidsFolder.add(config, 'perceptionAngle', 0, 1, 0.01)
    boidsFolder.add(config, 'boundaryRadius', 1, 1000, 1)
    boidsFolder.add(config, 'maxVelocity', 0, 10, 0.001)
    boidsFolder.add(config, 'maxAcceleration', 0, 10, 0.001)
    boidsFolder.open()

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

    this.position.material.uniforms.uDeltaTime = { value: 0 }
    this.velocity.material.uniforms = {
      ...this.velocity.material.uniforms,
      uDeltaTime: { value: 0 },
      uSeparation: { value: config.separation },
      uAlignment: { value: config.alignment },
      uCohesion: { value: config.cohesion },
      uPerceptionRadius: { value: config.perceptionRadius },
      uPerceptionAngle: { value: config.perceptionAngle },
      uBoundaryRadius: { value: config.boundaryRadius },
      uMaxVelocity: { value: config.maxVelocity },
      uMaxAcceleration: { value: config.maxAcceleration },
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
      vertexShader: boidsVert,
      fragmentShader: boidsFrag,
      uniforms: this.uniforms,
      side: DoubleSide,
    })

    this.particleMaterial.extensions.drawBuffers = true
    this.particleMesh = new Points(geometry, this.particleMaterial)
    // this.particleMesh.matrixAutoUpdate = false
    // this.particleMesh.updateMatrix()

    this.scene.add(this.particleMesh)
  }

  fillTextures(dtPosition, dtVelocity) {
    const positionArray = dtPosition.image.data
    const velocityArray = dtVelocity.image.data

    const positionConstant = 10
    const velocityConstant = 1

    for (let k = 0, kl = velocityArray.length; k < kl; k += 4) {
      positionArray[k + 0] = (Math.random() * 2 - 1) * positionConstant
      positionArray[k + 1] = (Math.random() * 2 - 1) * positionConstant
      positionArray[k + 2] = (Math.random() * 2 - 1) * positionConstant
      positionArray[k + 3] = 1

      velocityArray[k + 0] = (Math.random() * 2 - 1) * velocityConstant
      velocityArray[k + 1] = (Math.random() * 2 - 1) * velocityConstant
      velocityArray[k + 2] = (Math.random() * 2 - 1) * velocityConstant
      velocityArray[k + 3] = 1
    }
  }

  update() {
    const deltaTime = Math.min(this.clock.getDelta(), 1.0) // prevent large leaps

    this.controls.update()

    // position shader uniforms
    this.position.material.uniforms.uDeltaTime.value = deltaTime

    // velocity shader uniforms
    this.velocity.material.uniforms.uSeparation.value = config.separation
    this.velocity.material.uniforms.uAlignment.value = config.alignment
    this.velocity.material.uniforms.uCohesion.value = config.cohesion
    this.velocity.material.uniforms.uPerceptionRadius.value =
      config.perceptionRadius
    this.velocity.material.uniforms.uPerceptionAngle.value =
      config.perceptionAngle
    this.velocity.material.uniforms.uMaxVelocity.value = config.maxVelocity
    this.velocity.material.uniforms.uMaxAcceleration.value =
      config.maxAcceleration
    this.velocity.material.uniforms.uBoundaryRadius.value =
      config.boundaryRadius
    this.gpuCompute.compute()

    // boids uniforms
    this.uniforms.tPosition.value = this.gpuCompute.getCurrentRenderTarget(
      this.position
    ).texture
    this.uniforms.uCameraPosition.value = this.camera.position

    // this.helper.material.uniforms.tTexture.value = this.velocityFBO.getTexture()
  }
}
