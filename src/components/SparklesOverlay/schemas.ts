import tgpu from "typegpu";
import * as d from "typegpu/data";

const purple = d.vec4f(0.769, 0.392, 1.0, 1);
const blue = d.vec4f(0.114, 0.447, 0.941, 1);

const getGradientColor = tgpu['~unstable'].fn(
  { ratio: d.f32 },
  d.vec4f,
) /* wgsl */`{
    let color = mix(purple, blue, ratio);
    return color;
  }`
  .$uses({ purple, blue })
  .$name('getGradientColor');

export const mainVertex = tgpu['~unstable'].vertexFn({
  in: { vertexIndex: d.builtin.vertexIndex },
  out: { outPos: d.builtin.position, uv: d.vec2f },
}) /* wgsl */`{
    var pos = array<vec2f, 3>(
      vec2(0.0, 0.5),
      vec2(-0.5, -0.5),
      vec2(0.5, -0.5)
    );

    var uv = array<vec2f, 3>(
      vec2(0.5, 1.0),
      vec2(0.0, 0.0),
      vec2(1.0, 0.0),
    );

    return Out(vec4f(pos[in.vertexIndex], 0.0, 1.0), uv[in.vertexIndex]);
  }`;

export const mainFragment = tgpu['~unstable'].fragmentFn({
  in: { uv: d.vec2f },
  out: d.vec4f,
}) /* wgsl */`{
    return getGradientColor((in.uv[0] + in.uv[1]) / 2);
  }`.$uses({ getGradientColor });
