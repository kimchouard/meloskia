import { useRef } from 'react';
import { useRenderLoop } from './useRenderLoop';
import tgpu from 'typegpu';
import { mainFragment, mainVertex } from './schemas';

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
    .createPipeline();

  return {
    dispose() {
      root.destroy()
    },
    frame() {
      pipeline
        .withColorAttachment({
          view: context.getCurrentTexture().createView(),
          clearValue: [0, 0, 0, 0],
          loadOp: 'clear',
          storeOp: 'store',
        })
        .draw(3);
    }
  };
}

const SparklesOverlay = ({ width, height }: { width: number, height: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>();

  useRenderLoop(canvasRef, {
    init: setup,
  });

  return <canvas
    ref={canvasRef}
    className='absolute inset-0 pointer-events-none'
    width={width * window.devicePixelRatio}
    height={height * window.devicePixelRatio}
    style={{ width, height }}
  />;
};

export default SparklesOverlay;
