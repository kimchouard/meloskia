import tgpu, {
  StorageFlag,
  TgpuBindGroup,
  TgpuBuffer,
  TgpuComputePipeline,
  TgpuRenderPipeline,
  TgpuRoot,
  UniformFlag,
} from 'typegpu';
import * as d from 'typegpu/data';

export type ComputeCtx<T extends d.AnyWgslData> = {
  readonly $$: {
    readonly particles: d.Infer<Particle>[];
    readonly deltaTime: number;
    readonly uniforms: d.InferGPU<T>;
  };
};

export type RenderCtx<T extends d.AnyWgslData> = {
  readonly presentationFormat: GPUTextureFormat;
  readonly $$: {
    readonly particles: d.Infer<Particle>[];
    readonly uniforms: d.InferGPU<T>;
  };
};

export interface ParticleSystemOptions<T extends d.AnyWgslData> {
  maxCount: number;
  /**
   * particles per second
   */
  spawnRate: number;
  UniformsSchema: T;
  computePipeline: (root: TgpuRoot, ctx: ComputeCtx<T>) => TgpuComputePipeline;
  renderPipeline: (root: TgpuRoot, ctx: RenderCtx<T>) => TgpuRenderPipeline;
  getInitialPosition?: (spawner: d.v2f) => d.v2f;
  getInitialVelocity?: (spawner: d.v2f) => d.v2f;
  getInitialAge?: (spawner: d.v2f) => number;
}

const DEFAULT_INIT_POSITION = (spawner: d.v2f) => spawner;
const DEFAULT_INIT_VELOCITY = (_spawner: d.v2f) => d.vec2f();
const DEFAULT_INIT_AGE = (_spawner: d.v2f) => 1;

export type Particle = typeof Particle;
export const Particle = d.struct({
  pos: d.vec2f,
  vel: d.vec2f,
  age: d.f32,
  seed: d.f32,
});

export const SimParams = d.struct({
  deltaTime: d.f32,
});

export const updateLayout = tgpu
  .bindGroupLayout({
    simParams: { uniform: SimParams },
    particles: {
      storage: (n: number) => d.arrayOf(Particle, n),
      access: 'mutable',
    },
  })
  .$name('updateLayout');

export const renderLayout = tgpu
  .bindGroupLayout({
    particles: {
      storage: (n: number) => d.arrayOf(Particle, n),
      access: 'readonly',
    },
  })
  .$name('renderLayout');

const ageFn = tgpu['~unstable'].computeFn({
  workgroupSize: [1],
  in: { gid: d.builtin.globalInvocationId },
})(({ gid }) => {
  const deltaTime = updateLayout.$.simParams.deltaTime;
  const particle = updateLayout.$.particles[gid.x];
  if (particle.age > 0) {
    particle.age -= deltaTime;
  }
  updateLayout.$.particles[gid.x] = particle;
});

class ParticleSystemInstance<T extends d.AnyWgslData> {
  #root: TgpuRoot;
  #getInitialPosition: (spawner: d.v2f) => d.v2f;
  #getInitialVelocity: (spawner: d.v2f) => d.v2f;
  #getInitialAge: (spawner: d.v2f) => number;
  /**
   * Counts up the amount of particles that should be spawned in the next frame.
   * Can be fractional.
   */
  #particlesToSpawnAggregate = 0;
  #tail = 0;
  #simParamsBuffer: TgpuBuffer<typeof SimParams> & UniformFlag;
  #uniformsBuffer: TgpuBuffer<T> & UniformFlag;
  #updateBindGroup: TgpuBindGroup<(typeof updateLayout)['entries']>;
  #renderBindGroup: TgpuBindGroup<(typeof renderLayout)['entries']>;
  #computePipeline: TgpuComputePipeline;
  #agePipeline: TgpuComputePipeline;
  #renderPipeline: TgpuRenderPipeline;

  readonly options: ParticleSystemOptions<T>;
  readonly particlesBuffer: TgpuBuffer<d.WgslArray<Particle>> & StorageFlag;
  spawners: d.v2f[] = [];

  constructor(
    root: TgpuRoot,
    outputFormat: GPUTextureFormat,
    options: ParticleSystemOptions<T>
  ) {
    this.#root = root;
    this.#getInitialPosition =
      options.getInitialPosition ?? DEFAULT_INIT_POSITION;
    this.#getInitialVelocity =
      options.getInitialVelocity ?? DEFAULT_INIT_VELOCITY;
    this.#getInitialAge = options.getInitialAge ?? DEFAULT_INIT_AGE;
    this.options = options;

    this.particlesBuffer = root
      .createBuffer(
        d.arrayOf(Particle, options.maxCount),
        Array.from({ length: options.maxCount }, (_, i) => ({
          pos: d.vec2f(),
          vel: d.vec2f(),
          age: -1,
          seed: 0,
        }))
      )
      .$usage('storage');

    this.#simParamsBuffer = root.createBuffer(SimParams).$usage('uniform');

    this.#uniformsBuffer = root
      .createBuffer(options.UniformsSchema as d.AnyWgslData)
      .$usage('uniform') as TgpuBuffer<T> & UniformFlag;

    const uniforms = this.#uniformsBuffer.as('uniform');

    this.#updateBindGroup = root.createBindGroup(updateLayout, {
      simParams: this.#simParamsBuffer,
      particles: this.particlesBuffer,
    });

    this.#renderBindGroup = root.createBindGroup(renderLayout, {
      particles: this.particlesBuffer,
    });

    this.#computePipeline = options
      .computePipeline(root, {
        $$: {
          get deltaTime() {
            return updateLayout.$.simParams.deltaTime;
          },
          get particles() {
            return updateLayout.$.particles;
          },
          get uniforms() {
            return uniforms.value as d.InferGPU<T>;
          },
        },
      })
      // ...
      .with(updateLayout, this.#updateBindGroup);

    this.#agePipeline = root['~unstable']
      .withCompute(ageFn)
      .createPipeline()
      // ...
      .with(updateLayout, this.#updateBindGroup);

    this.#renderPipeline = options
      .renderPipeline(root, {
        presentationFormat: outputFormat,
        $$: {
          get particles() {
            return renderLayout.$.particles;
          },
          get uniforms() {
            return uniforms.value as d.InferGPU<T>;
          },
        },
      })
      // ...
      .with(renderLayout, this.#renderBindGroup);
  }

  setUniforms(values: d.Infer<T>) {
    this.#uniformsBuffer.write(values);
  }

  update(deltaTime: number) {
    this.#simParamsBuffer.write({ deltaTime });
    this.#agePipeline.dispatchWorkgroups(this.options.maxCount);
    this.#computePipeline.dispatchWorkgroups(this.options.maxCount);

    this.#particlesToSpawnAggregate += this.options.spawnRate * deltaTime;
    if (this.#particlesToSpawnAggregate < 1) {
      // No particles to spawn yet...
      return;
    }

    const particlesToSpawn: { idx: number; value: d.Infer<Particle> }[] = [];

    for (const spawner of this.spawners) {
      for (let i = 0; i < Math.floor(this.#particlesToSpawnAggregate); i++) {
        particlesToSpawn.push({
          idx: this.#tail,
          value: {
            age: this.#getInitialAge(spawner),
            pos: this.#getInitialPosition(spawner),
            vel: this.#getInitialVelocity(spawner),
            seed: Math.random(),
          },
        });

        this.#tail = (this.#tail + 1) % this.options.maxCount;
      }
    }

    this.particlesBuffer.writePartial(particlesToSpawn);
    this.#particlesToSpawnAggregate %= 1; // resetting to fractional part
  }

  // TODO: Replace `any` with RenderPass when it gets exported from 'typegpu'
  draw(pass: any) {
    pass.setPipeline(this.#renderPipeline);
    pass.draw(4, this.options.maxCount);
  }
}

class ParticleSystem<T extends d.AnyWgslData> {
  readonly options: ParticleSystemOptions<T>;

  constructor(options: ParticleSystemOptions<T>) {
    this.options = options;
  }

  create(
    root: TgpuRoot,
    outputFormat: GPUTextureFormat
  ): ParticleSystemInstance<T> {
    return new ParticleSystemInstance(root, outputFormat, this.options);
  }
}

export default ParticleSystem;
