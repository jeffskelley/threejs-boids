import { WebGLManager } from '~/glxp/webglManager'

export default defineNuxtPlugin(() => ({
  provide: {
    webglManager: new WebGLManager(),
  },
}))
