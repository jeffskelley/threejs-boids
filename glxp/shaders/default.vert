varying vec2 vUV;
varying vec3 vPosition;

void main() {
  vUV = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
