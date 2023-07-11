attribute vec2 aReference;

varying vec2 vUV;
varying vec3 vPosition;
varying vec2 vReference;

uniform sampler2D tPosition;
uniform vec3 uCameraPosition;


void main() {
  vUV = uv;
  vPosition = position;
  vReference = aReference;

  vec3 pos = texture2D( tPosition, vUV ).xyz;
  float d = distance(uCameraPosition, pos);

  gl_PointSize = 100.0 / d;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
