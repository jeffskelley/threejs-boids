import glsl from 'vite-plugin-glsl'

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
  ],
  build: {
    transpile: ['three', 'gsap'],
  },
  css: [
    '@/styles/global.scss',
  ],
  vite: {
    plugins: [glsl()]
  }
})
