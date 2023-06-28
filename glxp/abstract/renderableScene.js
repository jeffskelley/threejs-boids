import { Scene, PerspectiveCamera } from "three";

export class RenderableScene {
  constructor(renderer) {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera();
    this.renderer = renderer;
    this.isLoaded = false;
    this.resize();
  }

  setup() {
    this.isLoaded = true;
  }

  update() {}

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  render(time) {
    this.update(time);
    this.renderer.render(this.scene, this.camera);
  }

  kill() {}
}
