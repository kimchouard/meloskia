import tgpu from 'typegpu';
import * as d from 'typegpu/data';

export const encroach = tgpu['~unstable'].fn([d.f32, d.f32, d.f32, d.f32], d.f32)`(
  start: f32,
  end: f32,
  factorPerSecond: f32,
  deltaTime: f32,
) -> f32 {
  let diff = end - start;
  let factor = pow(factorPerSecond, deltaTime);
  return start + diff * (1 - factor);
}`;