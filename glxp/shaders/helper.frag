varying vec2 vUV;

uniform sampler2D tTexture;

void main() {
  gl_FragColor = texture2D(tTexture, vUV.xy);

  // gl_FragColor = vec4(vUV.x, vUV.y, 0., 1.);
}
