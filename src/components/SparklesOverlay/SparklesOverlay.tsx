import tgpu from 'typegpu';
import * as d from 'typegpu/data';
import { RefObject, useEffect, useMemo, useRef } from 'react';
import { mat4 } from 'wgpu-matrix';
import { gameWidth, keyWidth, pianoKeyboardHeight } from '@/utils/utils';
import { KeysState } from '@/hooks/useKeyboard';
import { useRenderLoop } from './useRenderLoop';
import {
  Particle,
  Uniforms,
  SimParams,
  updateLayout,
  renderLayout,
  mainFragment,
  mainVertex,
  update,
} from './schemas';
import { accidentalNames, keyNames } from '../PianoKeyboard';

const MAX_PARTICLES = 1000;

interface State {
  readonly keysState: KeysState;
  readonly screenWidth: number;
}

const keyPositions = Object.fromEntries([
  ...keyNames.map((keyName, i) => {
    return [keyName, (i + 0.5) * keyWidth] as const;
  }),
  ...accidentalNames.map((keyName, i) => {
    return [keyName, (i) * keyWidth] as const;
  }),
]);

function createSetup(stateRef: RefObject<State>) {
  return async function setup(canvas: HTMLCanvasElement, context: GPUCanvasContext) {
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    const root = await tgpu.init();
    
    context.configure({
      device: root.device,
      format: presentationFormat,
      alphaMode: 'premultiplied',
    });

    const particlesBuffer = root
      .createBuffer(d.arrayOf(Particle, MAX_PARTICLES), Array.from({ length: MAX_PARTICLES }, (_, i) => ({
        kind: 0,
        pos: d.vec2f(),
        vel: d.vec2f(0, 100),
        age: -1,
      })))
      .$usage('storage');

    const projectionMat = mat4.ortho(0, canvas.clientWidth, 0, canvas.clientHeight, -100, 100, d.mat4x4f());

    const uniformsBuffer = root
      .createBuffer(Uniforms)
      .$usage('uniform');

    const simParamsBuffer = root
      .createBuffer(SimParams, { deltaTime: 0 })
      .$usage('uniform');

    const updateBindGroup = root.createBindGroup(updateLayout, {
      simParams: simParamsBuffer,
      particles: particlesBuffer,
    });

    const renderBindGroup = root.createBindGroup(renderLayout, {
      uniforms: uniformsBuffer,
      particles: particlesBuffer,
    });

    const updatePipeline = root['~unstable']
      .withCompute(update)
      .createPipeline()
      // ...
      .with(updateLayout, updateBindGroup);

    const renderPipeline = root['~unstable']
      .withVertex(mainVertex, {})
      .withFragment(mainFragment, { format: presentationFormat, blend: {
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
      } })
      .withPrimitive({
        topology: 'triangle-strip',
      })
      .createPipeline()
      // ...
      .with(renderLayout, renderBindGroup);

    let lastTime = Date.now();
    let tail = 0;

    return {
      frame() {
        const now = Date.now();
        const deltaTime = (now - lastTime) * 0.001;
        lastTime = now;

        simParamsBuffer.write({ deltaTime });

        const modelMat = mat4.translation(d.vec3f((stateRef.current.screenWidth - gameWidth) / 2, 0, 0), d.mat4x4f());
        uniformsBuffer.write({
          projectionMat,
          modelMat,
        });

        updatePipeline.dispatchWorkgroups(MAX_PARTICLES);

        const pressedKeys = Object.entries(stateRef.current.keysState)
          .filter(([, pressed]) => pressed)
          .map(([key]) => key);

        for (const pressedKey of pressedKeys) {
          particlesBuffer.writePartial([
            {
              idx: tail,
              value: {
                age: 1,
                pos: d.vec2f(keyPositions[pressedKey] ?? 0, pianoKeyboardHeight),
                vel: d.vec2f((Math.random() - 0.5) * 50, 200),
              },
            }
          ]);

          tail = (tail + 1) % MAX_PARTICLES;
        }
        
        renderPipeline
          .withColorAttachment({
            view: context.getCurrentTexture().createView(),
            clearValue: [0, 0, 0, 0],
            loadOp: 'clear',
            storeOp: 'store',
          })
          .draw(4, MAX_PARTICLES);
      },
      dispose() {
        root.destroy();
      },
    };
  }
}

interface SparklesOverlayProps {
  keysState: KeysState;
  screenWidth: number;
  width: number;
  height: number;
}

const SparklesOverlay = ({ keysState, screenWidth, width, height }: SparklesOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>();

  const stateRef = useRef<State>({ keysState, screenWidth });
  useEffect(() => {
    stateRef.current = { keysState, screenWidth };
  }, [keysState, screenWidth]);

  useRenderLoop(canvasRef, {
    init: useMemo(() => createSetup(stateRef), []),
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
