import tgpu from 'typegpu';
import { f32 } from 'typegpu/data';
import { pow, mix } from 'typegpu/std';

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
