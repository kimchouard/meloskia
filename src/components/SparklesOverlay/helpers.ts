import { type v2f, vec2f } from 'typegpu/data';
import { abs, clamp, distance, dot, max, mix, sign } from 'typegpu/std';

/**
 * Nudges `start` towards `end` at a rate such that the distance
 * will be `abs(end-start) * factorPerSecond` after a second.
 *
 * Can be used to dampen movement in a frame-independent way.
 */
export const encroach = (
  start: number,
  end: number,
  factorPerSecond: number,
  deltaTime: number
): number => {
  'use gpu';
  const factor = factorPerSecond ** deltaTime;
  return mix(start, end, 1 - factor);
};

/**
 * Source: https://iquilezles.org/articles/distfunctions2d/
 */
export const sdPentagram = (p: v2f, r: number): number => {
  'use gpu';
  const k1x = 0.809016994; // cos(π/ 5) = ¼(√5+1)
  const k2x = 0.309016994; // sin(π/10) = ¼(√5-1)
  const k1y = 0.587785252; // sin(π/ 5) = ¼√(10-2√5)
  const k2y = 0.951056516; // cos(π/10) = ¼√(10+2√5)
  const k1z = 0.726542528; // tan(π/ 5) = √(5-2√5)
  const v1 = vec2f(k1x, -k1y);
  const v2 = vec2f(-k1x, -k1y);
  const v3 = vec2f(k2x, -k2y);

  let pp = p;
  pp.x = abs(pp.x);
  pp = pp.sub(v1.mul(2 * max(dot(v1, pp), 0)));
  pp = pp.sub(v2.mul(2 * max(dot(v2, pp), 0)));
  pp.x = abs(pp.x);
  pp.y -= r;
  return (
    distance(pp, v3.mul(clamp(dot(pp, v3), 0, k1z * r))) *
    sign(pp.y * v3.x - pp.x * v3.y)
  );
};
