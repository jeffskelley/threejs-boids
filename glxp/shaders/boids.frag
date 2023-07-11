varying vec2 vUV;

void main() {
  float f = length( gl_PointCoord - vec2( 0.5, 0.5 ) );
  if ( f > 0.5 ) {
    discard;
  }
  gl_FragColor = vec4(vUV.x, vUV.y, (1.0 - vUV.x * vUV.y), 1.0);
}