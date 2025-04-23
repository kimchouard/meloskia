import tgpu from 'typegpu';
import * as d from 'typegpu/data';
import { useRef } from 'react';
import { mat4 } from 'wgpu-matrix';
import { useRenderLoop } from './useRenderLoop';
import { layout, mainFragment, mainVertex, Particle, Uniforms } from './schemas';

const MAX_PARTICLES = 1000;

async function setup(canvas: HTMLCanvasElement, context: GPUCanvasContext) {
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  const root = await tgpu.init();
  
  context.configure({
    device: root.device,
    format: presentationFormat,
    alphaMode: 'premultiplied',
  });

  const pipeline = root['~unstable']
    .withVertex(mainVertex, {})
    .withFragment(mainFragment, { format: presentationFormat })
    .withPrimitive({
      topology: 'triangle-strip',
    })
    .createPipeline();

  const particlesBuffer = root
    .createBuffer(d.arrayOf(Particle, MAX_PARTICLES))
    .$usage('storage');
  const projectionMat = mat4.ortho(0, canvas.width, 0, canvas.height, -100, 100, d.mat4x4f());

  const bindGroup = root.createBindGroup(layout, {
    uniforms: root.createBuffer(Uniforms, {
      projectionMat,
    }).$usage('uniform'),
    particles: particlesBuffer,
  });

  return {
    frame() {
      pipeline
        .with(layout, bindGroup)
        .withColorAttachment({
          view: context.getCurrentTexture().createView(),
          clearValue: [0, 0, 0, 0],
          loadOp: 'clear',
          storeOp: 'store',
        })
        .draw(3);
    },
    dispose() {
      root.destroy();
    },
  };
}

const SparklesOverlay = ({ screenWidth, width, height }: { screenWidth: number, width: number, height: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>();

  useRenderLoop(canvasRef, {
    init: setup,
  });

  return <div className='pointer-events-none absolute inset-0'>
    <canvas
      ref={canvasRef}
      width={screenWidth * window.devicePixelRatio}
      height={height * window.devicePixelRatio}
      style={{ width: screenWidth, height }}
    />
  </div>;
};

export default SparklesOverlay;
