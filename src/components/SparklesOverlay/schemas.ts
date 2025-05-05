import tgpu from 'typegpu';
import * as d from 'typegpu/data';
import ParticleSystem, { RenderCtx } from './particleSystem';

const UniformsSchema = d.struct({
  projectionMat: d.mat4x4f,
  modelMat: d.mat4x4f,
})

const Varying = {
  age: d.f32,
  uv: d.vec2f,
};

const AdditiveBlending = {
  color: {
    operation: 'add',
    dstFactor: 'one',
    srcFactor: 'one',
  },
  alpha: {
    operation: 'add',
    dstFactor: 'one',
    srcFactor: 'one',
  },
} as const;

const mainVertex = ($$: RenderCtx<typeof UniformsSchema>['$$']) =>
  tgpu['~unstable'].vertexFn({
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

    let particle = $$.particles[in.instanceIdx];
    let position = $$.uniforms.projectionMat * $$.uniforms.modelMat * vec4f(particle.pos + pos[in.vertexIndex] * scale, 0.0, 1.0);

    return Out(position, particle.age, uv[in.vertexIndex]);
  }`
  .$uses({ $$ });

export const slowParticleSystem = new ParticleSystem<typeof UniformsSchema>({
  UniformsSchema,
  maxCount: 100,
  spawnRate: 10,

  getInitialVelocity: () => d.vec2f((Math.random() - 0.5) * 50, 200),

  computePipeline(root, { $$ }) {
    const updateFn = tgpu['~unstable'].computeFn({
      workgroupSize: [1],
      in: { gid: d.builtin.globalInvocationId },
    })`{
      let deltaTime = $$.deltaTime;
      var particle = $$.particles[in.gid.x];
    
      particle.vel.y += -400 * deltaTime;
      particle.pos += particle.vel * deltaTime;
    
      $$.particles[in.gid.x] = particle;
    }
    `.$uses({ $$ });
    
    return root['~unstable']
      .withCompute(updateFn)
      .createPipeline();
  },

  renderPipeline(root, { presentationFormat, $$ }) {
    const mainFragment = tgpu['~unstable'].fragmentFn({
      in: Varying,
      out: d.vec4f,
    })`{
      if (in.age <= 0) {
        discard;
      }
      let sq_dist_to_center = clamp(1 - distance(in.uv, vec2f(.5, .5)) * 2., 0, 1);
      let fadeOut = clamp(in.age * 0.5, 0, 1);
      return vec4f(1, 0, 0, 1) * sq_dist_to_center * fadeOut;
    }`;
    
    return root['~unstable']
      .withVertex(mainVertex($$), {})
      .withFragment(mainFragment, {
        format: presentationFormat,
        blend: AdditiveBlending,
      })
      .withPrimitive({
        topology: 'triangle-strip',
      })
      .createPipeline();
  },
});


export const turbulentParticleSystem = new ParticleSystem<typeof UniformsSchema>({
  UniformsSchema,
  maxCount: 100,
  spawnRate: 10,

  getInitialVelocity: () => d.vec2f((Math.random() - 0.5) * 50, 200),

  computePipeline(root, { $$ }) {
    const updateFn = tgpu['~unstable'].computeFn({
      workgroupSize: [1],
      in: { gid: d.builtin.globalInvocationId },
    })`{
      let deltaTime = $$.deltaTime;
      var particle = $$.particles[in.gid.x];
    
      particle.vel.y += -400 * deltaTime;
      particle.pos += particle.vel * deltaTime;
    
      $$.particles[in.gid.x] = particle;
    }
    `.$uses({ $$ });
    
    return root['~unstable']
      .withCompute(updateFn)
      .createPipeline();
  },

  renderPipeline(root, { presentationFormat, $$ }) {
    const mainFragment = tgpu['~unstable'].fragmentFn({
      in: Varying,
      out: d.vec4f,
    })`{
      if (in.age <= 0) {
        discard;
      }
      let sq_dist_to_center = clamp(1 - distance(in.uv, vec2f(.5, .5)) * 2., 0, 1);
      let fadeOut = clamp(in.age * 0.5, 0, 1);
      return vec4f(0, 1, 0, 1) * sq_dist_to_center * fadeOut;
    }`;
    
    return root['~unstable']
      .withVertex(mainVertex($$), {})
      .withFragment(mainFragment, {
        format: presentationFormat,
        blend: AdditiveBlending,
      })
      .withPrimitive({
        topology: 'triangle-strip',
      })
      .createPipeline();
  },
});
