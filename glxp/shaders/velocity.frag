// uniform sampler2D tPosition;
// uniform sampler2D tVelocity;

uniform float uSeparation;
uniform float uAlignment;
uniform float uCohesion;
uniform float uPerceptionRadius;
uniform float uPerceptionAngle;
uniform float uBoundaryRadius;
uniform float uMaxVelocity;
uniform float uMaxAcceleration;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  
  vec3 selfVelocity = texture2D(tVelocity, uv).xyz;
  vec3 selfPosition = texture2D(tPosition, uv).xyz;

  float distanceFromCenter = distance(vec3(0.0), selfPosition);

  // boundary force
  vec3 boundaryVelocity = normalize(selfPosition * -1.0);
  boundaryVelocity *= float(distanceFromCenter >= uBoundaryRadius);

  // center force
  vec3 centerVelocity = normalize(selfPosition * -1.0);
  centerVelocity *= distanceFromCenter;

  // flock forces
  vec3 cohesionVelocity = vec3(0.0);
  vec3 alignmentVelocity = vec3(0.0);
  vec3 separationVelocity = vec3(0.0);

  float total = 0.0;
  for (float x = 0.0; x < resolution.x; x++) {
    for (float y = 0.0; y < resolution.y; y++) {
      vec2 st = vec2(x + 0.5, y + 0.5) / resolution.xy;
      vec3 boidPosition = texture2D(tPosition, st).xyz;
      vec3 boidVelocity = texture2D(tVelocity, st).xyz;

      float dist = distance(selfPosition, boidPosition);
      
      float isNotSelf = 1.0 - float(boidPosition == selfPosition && boidVelocity == selfVelocity);
      float inRadius = float(dist < uPerceptionRadius);
      float inAngle = float(dot(normalize(boidVelocity), normalize(selfPosition - boidPosition)) < uPerceptionAngle); // TODO:  check the math on this
      float inPerception = inRadius * inAngle * isNotSelf;
      total += 1.0 * inPerception;
      alignmentVelocity += boidVelocity * inPerception;
      cohesionVelocity += boidPosition * inPerception;

      vec3 diff = (selfPosition - boidPosition) / (dist + 0.000001); // avoid div 0
      separationVelocity += diff * inPerception;
    }
  }

  alignmentVelocity = normalize(alignmentVelocity);
  alignmentVelocity -= selfVelocity;
  cohesionVelocity /= total + 0.000001; // avoid div 0
  cohesionVelocity -= selfPosition;
  separationVelocity /= total + 0.000001; // avoid div 0
  separationVelocity -= selfVelocity;

  vec3 acceleration = vec3(0.0);

  // flocking
  acceleration += alignmentVelocity * uAlignment;
  acceleration += cohesionVelocity * uCohesion;
  acceleration += separationVelocity * uSeparation;

  acceleration += boundaryVelocity;
  acceleration += centerVelocity * 0.001;

  // limit acceleration
  float accelMagnitude = length(acceleration);
  float accelIsAboveMax = float(accelMagnitude > uMaxAcceleration);

  acceleration = accelIsAboveMax * normalize(acceleration) + (1.0 - accelIsAboveMax) * acceleration;

  vec3 newVelocity = selfVelocity + acceleration;
  // float isAboveMax = float(length(newVelocity) > uMaxVelocity);
  // newVelocity = (newVelocity * (1.0 - isAboveMax)) + normalize(newVelocity) * uMaxVelocity * isAboveMax;
  newVelocity = normalize(newVelocity) * uMaxVelocity;
  gl_FragColor = vec4(newVelocity, 1.0);
}