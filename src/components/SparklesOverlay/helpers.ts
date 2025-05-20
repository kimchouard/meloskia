import tgpu from 'typegpu';
import { f32, vec2f } from 'typegpu/data';
import { pow, mix, abs, max, dot, mul, sub, length, clamp, distance } from 'typegpu/std';

/**
 * Nudges `start` towards `end` at a rate such that the distance
 * will be `abs(end-start) * factorPerSecond` after a second.
 * 
 * Can be used to dampen movement in a frame-independent way.
 */
export const encroach = tgpu['~unstable'].fn([f32, f32, f32, f32], f32)(
  (start, end, factorPerSecond, deltaTime) => {
    const factor = pow(factorPerSecond, deltaTime);
    return mix(start, end, (1 - factor));
  }
);

const sign = tgpu['~unstable'].fn([f32], f32)`(a: f32) -> f32 {
  return sign(a);
}`;

/**
 * Source: https://iquilezles.org/articles/distfunctions2d/
 */
export const sdPentagram = tgpu['~unstable'].fn([vec2f, f32], f32)((p, r) => {
  const k1x = 0.809016994; // cos(π/ 5) = ¼(√5+1)
  const k2x = 0.309016994; // sin(π/10) = ¼(√5-1)
  const k1y = 0.587785252; // sin(π/ 5) = ¼√(10-2√5)
  const k2y = 0.951056516; // cos(π/10) = ¼√(10+2√5)
  const k1z = 0.726542528; // tan(π/ 5) = √(5-2√5)
  const v1 = vec2f( k1x, -k1y);
  const v2 = vec2f(-k1x, -k1y);
  const v3 = vec2f( k2x, -k2y);
  
  let pp = p;
  pp.x = abs(pp.x);
  pp = sub(pp, mul(2.0 * max(dot(v1, pp), 0.0), v1));
  pp = sub(pp, mul(2.0 * max(dot(v2, pp), 0.0), v2));
  pp.x = abs(pp.x);
  pp.y -= r;
  return distance(pp, mul(clamp(dot(pp,v3), 0.0, k1z*r), v3))
          * sign(pp.y * v3.x - pp.x * v3.y);
});