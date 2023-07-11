uniform sampler2D tTexture;
uniform vec2 uResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  gl_FragColor = texture2D(tTexture, uv);
}