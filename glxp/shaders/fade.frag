varying vec2 vUV;

uniform sampler2D tOld;
uniform sampler2D tNew;
uniform float damp;

vec4 when_gt( vec4 x, float y ) {
  return max( sign( x - y ), 0.0 );
}

void main() {
  vec4 texelOld = texture2D(tOld, vUV);
  vec4 texelNew = texture2D(tNew, vUV);
  texelOld *= damp * when_gt(texelOld, 0.01);
  gl_FragColor = max(texelNew, texelOld);

}