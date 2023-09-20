// uniform sampler2D tPosition;
// uniform sampler2D tVelocity;

uniform float uTime;
uniform float uVelocity;
uniform float uNoiseAcceleration;
uniform float uNoiseMagnitude;
uniform float uNoiseChangeRate;
uniform float uGravity;

#include "../../node_modules/lygia/generative/snoise.glsl";

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  
  vec3 v = texture2D(tVelocity, uv).xyz;
  vec3 p = texture2D(tPosition, uv).xyz;

  const float delta = 0.01;
  vec3 dx = vec3(delta, 0.0, 0.0);
  vec3 dy = vec3(0.0, delta, 0.0);
  vec3 dz = vec3(0.0, 0.0, delta);

  vec3 noiseA = snoise3(vec4((p + dx) / uNoiseMagnitude, uTime * uNoiseChangeRate));
  vec3 noiseB = snoise3(vec4((p - dx) / uNoiseMagnitude, uTime * uNoiseChangeRate));
  vec3 noiseC = snoise3(vec4((p + dy) / uNoiseMagnitude, uTime * uNoiseChangeRate));
  vec3 noiseD = snoise3(vec4((p - dy) / uNoiseMagnitude, uTime * uNoiseChangeRate));
  vec3 noiseE = snoise3(vec4((p + dz) / uNoiseMagnitude, uTime * uNoiseChangeRate));
  vec3 noiseF = snoise3(vec4((p - dz) / uNoiseMagnitude, uTime * uNoiseChangeRate));

  vec3 curlAcceleration = vec3(
    noiseC.z - noiseD.z - noiseE.y + noiseF.y,
    noiseE.x - noiseF.x - noiseA.z + noiseB.z,
    noiseA.y - noiseB.y - noiseC.x + noiseD.x
  ) * uNoiseAcceleration;

  vec3 gravityAcceleration = vec3(0.0, -1.0, 0.0) * uGravity;
  vec3 acceleration = curlAcceleration + gravityAcceleration;

  vec3 newVelocity = v + acceleration;
  newVelocity = normalize(newVelocity) * uVelocity; // maintain constant velocity

  gl_FragColor = vec4(newVelocity, 1.0);
}