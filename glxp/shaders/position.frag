// uniform sampler2D tPosition;
// uniform sampler2D tVelocity;
uniform float uDeltaTime;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 currentPos = texture2D(tPosition, uv).xyz;
  vec3 velocity = texture2D(tVelocity, uv).xyz;
  vec3 newPos = currentPos + velocity * uDeltaTime;
  gl_FragColor = vec4(newPos, 1.0);
}