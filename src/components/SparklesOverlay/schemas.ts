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
      out: { position: d.builtin.position, ...Varying },
    })((input) => {
      const particle = $$.particles[input.instanceIdx];
      const fadein = std.clamp((1. - particle.age) * 10., 0, 1);
      const fadeout = std.clamp(particle.age, 0, 1);
      const scale = fadein * fadeout * 18.0;
      const localPos = std.add(particle.pos, std.mul(scale, POS.value[input.vertexIndex]));
      const position = std.mul(std.mul($$.uniforms.projectionMat, $$.uniforms.modelMat), d.vec4f(localPos, 0.0, 1.0));
      
      return {
        position,
        age: particle.age,
        seed: particle.seed,
        uv: UV.value[input.vertexIndex],
      };
    });
  
    const mainFragment = tgpu['~unstable'].fragmentFn({
      in: Varying,
      out: d.vec4f,
    })((input) => {
      if (input.age <= 0) {
        std.discard();
      }
      const sq_dist_to_center = std.clamp(1 - std.distance(input.uv, d.vec2f(.5, .5)) * 2., 0, 1);
      const ttt = std.pow(sq_dist_to_center, 2);
      const fadeOut = std.clamp(input.age * 0.5, 0, 1);
      return std.mul(ttt * fadeOut, d.vec4f(0.4 + input.seed * 0.2, 0.9 - input.seed * 0.4, 1, 1));
    });
    
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
    })((input) => {
      const particle = $$.particles[input.gid.x];
    
      randf.seed2(d.vec2f(particle.seed, particle.age));
      particle.vel.x += (randf.sample() - .5) * 100;
      particle.vel.y += (randf.sample() - .5) * 100;
      particle.vel.x = encroach(particle.vel.x, 0, 0.001, $$.deltaTime);
      particle.vel.y = encroach(particle.vel.y, 0, 0.001, $$.deltaTime);
      particle.vel.y += 10;
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
      out: { position: d.builtin.position, ...Varying },
    })((input) => {
      const scale = d.f32(3.0);
      let particle = $$.particles[input.instanceIdx];
      const localPos = std.add(particle.pos, std.mul(scale, POS.value[input.vertexIndex]));
      const position = std.mul(std.mul($$.uniforms.projectionMat, $$.uniforms.modelMat), d.vec4f(localPos, 0.0, 1.0));
  
      return {
        position,
        age: particle.age,
        seed: particle.seed,
        uv: UV.value[input.vertexIndex],
      };
    });
  
    const mainFragment = tgpu['~unstable'].fragmentFn({
      in: Varying,
      out: d.vec4f,
    })((input) => {
      if (input.age <= 0) {
        std.discard();
      }
      const sq_dist_to_center = std.clamp(1 - std.distance(input.uv, d.vec2f(.5, .5)) * 2., 0, 1);
      const ttt = std.pow(sq_dist_to_center, 0.5);
      const fadeOut = std.clamp(input.age * 0.5, 0, 1);
      return std.mul(ttt * fadeOut, d.vec4f(0.6, 0.9 - input.seed * 0.2, 1, 1));
    });
    
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
