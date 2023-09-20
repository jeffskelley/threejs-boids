// uniform sampler2D tPosition;
// uniform sampler2D tVelocity;
uniform float uDeltaTime;
uniform vec3 uSource;

const float BOUNDARY = 10.0;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 p = texture2D(tPosition, uv).xyz;

  // reset position if particle is out of radius
  float isInsideRadius = float(distance(p, uSource) <= BOUNDARY);
  p = isInsideRadius * p + (1.0 - isInsideRadius) * uSource;

  vec3 v = texture2D(tVelocity, uv).xyz;
  vec3 newPosition = p + v * uDeltaTime;
  gl_FragColor = vec4(newPosition, 1.0);
}