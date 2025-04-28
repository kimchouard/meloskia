import tgpu from "typegpu";
import * as d from "typegpu/data";

export const Uniforms = d.struct({
  projectionMat: d.mat4x4f,
  modelMat: d.mat4x4f,
});

export const SimParams = d.struct({
  deltaTime: d.f32,
});

export const Particle = d.struct({
  pos: d.vec2f,
  vel: d.vec2f,
  kind: d.u32,
  age: d.f32,
});

export const updateLayout = tgpu.bindGroupLayout({
  simParams: { uniform: SimParams },
  particles: { storage: (n: number) => d.arrayOf(Particle, n), access: 'mutable' },
});

export const renderLayout = tgpu.bindGroupLayout({
  uniforms: { uniform: Uniforms },
  particles: { storage: (n: number) => d.arrayOf(Particle, n), access: 'readonly' },
});

export const update = tgpu['~unstable'].computeFn({
  workgroupSize: [1],
  in: { gid: d.builtin.globalInvocationId },
})`{
  let deltaTime = updateLayout.$.simParams.deltaTime;
  var particle = updateLayout.$.particles[in.gid.x];

  if (particle.age > 0) {
    particle.age -= deltaTime;
  }

  particle.vel.y += -400 * deltaTime;
  particle.pos += particle.vel * deltaTime;

  updateLayout.$.particles[in.gid.x] = particle;
}
`.$uses({ updateLayout });

const Varying = {
  age: d.f32,
  uv: d.vec2f,
};

export const mainVertex = tgpu['~unstable'].vertexFn({
  in: { vertexIndex: d.builtin.vertexIndex, instanceIdx: d.builtin.instanceIndex },
  out: { outPos: d.builtin.position, ...Varying },
})`{
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

  let scale: f32 = 12.0;

  let particle = renderLayout.$.particles[in.instanceIdx];
  let position = renderLayout.$.uniforms.projectionMat * renderLayout.$.uniforms.modelMat * vec4f(particle.pos + pos[in.vertexIndex] * scale, 0.0, 1.0);

  return Out(position, particle.age, uv[in.vertexIndex]);
}`
.$uses({ renderLayout });

export const mainFragment = tgpu['~unstable'].fragmentFn({
  in: Varying,
  out: d.vec4f,
})`{
  if (in.age <= 0) {
    discard;
  }
  let sq_dist_to_center = clamp(1 - distance(in.uv, vec2f(.5, .5)) * 2., 0, 1);
  let fadeOut = clamp(in.age * 0.5, 0, 1);
  return mix(vec4f(0, 0, 0, 0), vec4f(1, 0, 0, 1) * sq_dist_to_center, fadeOut);
}`;
