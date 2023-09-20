attribute vec2 aReference;

varying vec2 vUV;
varying vec3 vPosition;

uniform sampler2D tPosition;
uniform vec3 uCameraPosition;


void main() {
  vUV = uv;

  vec3 pos = texture2D( tPosition, vUV ).xyz;
  float d = distance(uCameraPosition, pos);

  vPosition = pos;

  gl_PointSize = 50.0 / d;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
