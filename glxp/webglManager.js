import { WebGLRenderer } from "three";

import { useWebGLStore } from "~/store/webgl";

import { HomeScene } from "~/glxp/scenes/home";

export class WebGLManager {
  constructor() {
    this.renderer = new WebGLRenderer({
      antialias: true,
    });
    this.scenes = {
      home: new HomeScene(this.renderer),
    };
    this.activeScene = null;
  }

  init(container) {
    this.webglStore = useWebGLStore();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);
    this.webglStore.isInitialized = true;
    this.render.bind(this)();

    window.addEventListener("resize", this.resize.bind(this));
  }

  loadScene(slug) {
    if (!this.scenes[slug].isLoaded) {
      return this.scenes[slug].setup();
    }
  }

  activateScene(slug) {
    if (this.activeScene) {
      this.deactivateScene(slug);
    }
    this.activeScene = this.scenes[slug];
  }

  deactivateScene(slug) {
    this.activeScene.kill();
    this.activeScene = null;
  }

  resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.activeScene?.resize();
  }

  render(time) {
    requestAnimationFrame(this.render.bind(this));

    if (this.activeScene) {
      this.activeScene.render(time);
    }
  }
}
