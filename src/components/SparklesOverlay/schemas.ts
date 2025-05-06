import tgpu from 'typegpu';
import * as d from 'typegpu/data';
import * as std from 'typegpu/std';
import { randf } from '@typegpu/noise';
import ParticleSystem from './particleSystem';
import { encroach } from './helpers';

const UniformsSchema = d.struct({
  projectionMat: d.mat4x4f,
  modelMat: d.mat4x4f,
})

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

/**
 * Vertex positions of a quad using triangle-strip topology
 */
const POS = tgpu['~unstable'].const(d.arrayOf(d.vec2f, 4), [
  d.vec2f(1, 1), // top-right
  d.vec2f(-1, 1), // top-left
  d.vec2f(1, -1), // bottom-right
  d.vec2f(-1, -1) // bottom-left
]);

/**
 * UV coordinates of a quad using triangle-strip topology
 */
const UV = tgpu['~unstable'].const(d.arrayOf(d.vec2f, 4), [
  d.vec2f(1.0, 1.0),
  d.vec2f(0.0, 1.0),
  d.vec2f(1.0, 0.0),
  d.vec2f(0.0, 0.0),
]);

export const slowParticleSystem = new ParticleSystem<typeof UniformsSchema>({
  UniformsSchema,
  maxCount: 1000,
  spawnRate: 200,

  getInitialPosition: (spawner) => std.add(spawner, std.mul(30, d.vec2f(Math.random() - 0.5, Math.random() - 0.7))),
  getInitialVelocity: () => d.vec2f((Math.random() - 0.5) * 50, 200),

  computePipeline(root, { $$ }) {
    const updateFn = tgpu['~unstable'].computeFn({
      workgroupSize: [1],
      in: { gid: d.builtin.globalInvocationId },
    })((input) => {
      const particle = $$.particles[input.gid.x];
      particle.vel.y = encroach(particle.vel.y, 0, 0.1, $$.deltaTime);
      particle.pos = std.add(particle.pos, std.mul($$.deltaTime, particle.vel));
    
      $$.particles[input.gid.x] = particle;
    });

    return root['~unstable']
      .withCompute(updateFn)
      .createPipeline();
  },

  renderPipeline(root, { presentationFormat, $$ }) {
    const Varying = {
      age: d.f32,
      seed: d.f32,
      uv: d.vec2f,
    };
    
    const mainVertex = tgpu['~unstable'].vertexFn({
      in: { vertexIndex: d.builtin.vertexIndex, instanceIdx: d.builtin.instanceIndex },
      out: { outPos: d.builtin.position, ...Varying },
    })`{
      let particle = $$.particles[in.instanceIdx];
      let fadein = clamp((1. - particle.age) * 10., 0, 1);
      let fadeout = clamp(particle.age, 0, 1);
      let scale: f32 = fadein * fadeout * 18.0;
      let position = $$.uniforms.projectionMat * $$.uniforms.modelMat * vec4f(particle.pos + POS[in.vertexIndex] * scale, 0.0, 1.0);
      
      return Out(position, particle.age, particle.seed, UV[in.vertexIndex]);
    }`
    .$uses({ $$, POS, UV });
  
    const mainFragment = tgpu['~unstable'].fragmentFn({
      in: Varying,
      out: d.vec4f,
    })`{
      if (in.age <= 0) {
        discard;
      }
      let sq_dist_to_center = clamp(1 - distance(in.uv, vec2f(.5, .5)) * 2., 0, 1);
      let ttt = pow(sq_dist_to_center, 2);
      let fadeOut = clamp(in.age * 0.5, 0, 1);
      return vec4f(0.4 + in.seed * 0.2, 0.9 - in.seed * 0.4, 1, 1) * ttt * fadeOut;
    }`;
    
    return root['~unstable']
      .withVertex(mainVertex, {})
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
  maxCount: 500,
  spawnRate: 100,

  getInitialVelocity: () => d.vec2f((Math.random() - 0.5) * 50, 200),

  computePipeline(root, { $$ }) {
    const updateFn = tgpu['~unstable'].computeFn({
      workgroupSize: [1],
      in: { gid: d.builtin.globalInvocationId },
    })`{
      let deltaTime = $$.deltaTime;
      var particle = $$.particles[in.gid.x];
    
      randf.seed2(vec2f(particle.seed, particle.age));
      particle.vel.x += (randf.sample() - .5) * 100;
      particle.vel.y += (randf.sample() - .5) * 100;
      particle.vel.x = encroach(particle.vel.x, 0, 0.001, deltaTime);
      particle.vel.y = encroach(particle.vel.y, 0, 0.001, deltaTime);
      particle.vel.y += 10;
      particle.pos += particle.vel * deltaTime;
    
      $$.particles[in.gid.x] = particle;
    }
    `.$uses({ $$, encroach, randf });
    
    return root['~unstable']
      .withCompute(updateFn)
      .createPipeline();
  },

  renderPipeline(root, { presentationFormat, $$ }) {
    const Varying = {
      age: d.f32,
      seed: d.f32,
      uv: d.vec2f,
    };
    
    const mainVertex = tgpu['~unstable'].vertexFn({
      in: { vertexIndex: d.builtin.vertexIndex, instanceIdx: d.builtin.instanceIndex },
      out: { outPos: d.builtin.position, ...Varying },
    })`{
      let scale: f32 = 3.0;
      let particle = $$.particles[in.instanceIdx];
      let position = $$.uniforms.projectionMat * $$.uniforms.modelMat * vec4f(particle.pos + POS[in.vertexIndex] * scale, 0.0, 1.0);
  
      return Out(position, particle.age, particle.seed, UV[in.vertexIndex]);
    }`
    .$uses({ $$, POS, UV });
  
    const mainFragment = tgpu['~unstable'].fragmentFn({
      in: Varying,
      out: d.vec4f,
    })`{
      if (in.age <= 0) {
        discard;
      }
      let sq_dist_to_center = clamp(1 - distance(in.uv, vec2f(.5, .5)) * 2., 0, 1);
      let ttt = pow(sq_dist_to_center, 0.5);
      let fadeOut = clamp(in.age * 0.5, 0, 1);
      return vec4f(0.6, 0.9 - in.seed * 0.2, 1, 1) * ttt * fadeOut;
    }`;
    
    return root['~unstable']
      .withVertex(mainVertex, {})
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
