import tgpu from "typegpu";
import * as d from "typegpu/data";

export const Uniforms = d.struct({
  projectionMat: d.mat4x4f,
});

export const Particle = d.struct({
  pos: d.vec2f,
  vel: d.vec2f,
  kind: d.u32,
  age: d.f32,
});

export const layout = tgpu.bindGroupLayout({
  uniforms: { uniform: Uniforms },
  particles: { storage: (n: number) => d.arrayOf(Particle, n) },
});

const purple = d.vec4f(0.769, 0.392, 1.0, 1);
const blue = d.vec4f(0.114, 0.447, 0.941, 1);

const getGradientColor = tgpu['~unstable'].fn(
  { ratio: d.f32 },
  d.vec4f,
)/* wgsl */`{
  let color = mix(purple, blue, ratio);
  return color;
}`
.$uses({ purple, blue })
.$name('getGradientColor');

export const mainVertex = tgpu['~unstable'].vertexFn({
  in: { vertexIndex: d.builtin.vertexIndex, instanceIdx: d.builtin.instanceIndex },
  out: { outPos: d.builtin.position, uv: d.vec2f },
})/* wgsl */`{
  var pos = array<vec2f, 4>(
    vec2(1, 1), // top-right
    vec2(-1, 1), // top-left
    vec2(1, -1), // bottom-right
    vec2(-1, -1) // bottom-left
  );

  var uv = array<vec2f, 4>(
    vec2(1.0, 1.0),
    vec2(0.0, 1.0),
    vec2(1.0, 0.0),
    vec2(0.0, 0.0),
  );

  let scale: f32 = 64.0;

  let particle = layout.$.particles[in.instanceIdx];
  let position = layout.$.uniforms.projectionMat * vec4f(particle.pos + pos[in.vertexIndex] * scale, 0.0, 1.0);

  return Out(position, uv[in.vertexIndex]);
}`
.$uses({ layout });

export const mainFragment = tgpu['~unstable'].fragmentFn({
  in: { uv: d.vec2f },
  out: d.vec4f,
})/* wgsl */`{
  return getGradientColor((in.uv[0] + in.uv[1]) / 2);
}
`.$uses({ getGradientColor });
