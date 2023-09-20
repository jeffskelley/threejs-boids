varying vec2 vUV;
varying vec3 vPosition;

uniform vec3 uCameraPosition;

void main() {
  float f = length( gl_PointCoord - vec2( 0.5, 0.5 ) );
  if ( f > 0.5 ) {
    discard;
  }
  float d = distance(uCameraPosition, vPosition);
  vec3 color = vec3(1.0 - (d * 0.1));
  gl_FragColor = vec4(color, 1.0);
}