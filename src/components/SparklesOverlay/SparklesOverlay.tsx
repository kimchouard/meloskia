import tgpu, { TgpuRoot } from 'typegpu';
import * as d from 'typegpu/data';
import { RefObject, useEffect, useMemo, useRef } from 'react';
import { mat4 } from 'wgpu-matrix';
import { gameWidth, keyWidth, pianoKeyboardHeight } from '@/utils/utils';
import { KeysState } from '@/hooks/useKeyboard';
import { useRenderLoop } from './useRenderLoop';
import { slowParticleSystem, turbulentParticleSystem } from './schemas';
import { accidentalNames, keyNames } from '../PianoKeyboard';

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

function setupParticles(root: TgpuRoot) {
  function update(deltaTime: number) {

  }

  return {
    update,
  };
}

function createSetup(stateRef: RefObject<State>) {
  return async function setup(canvas: HTMLCanvasElement, context: GPUCanvasContext) {
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    const root = await tgpu.init();
    
    context.configure({
      device: root.device,
      format: presentationFormat,
      alphaMode: 'premultiplied',
    });

    const slowParticles = slowParticleSystem.create(root, presentationFormat);
    const turbulentParticles = turbulentParticleSystem.create(root, presentationFormat);

    const projectionMat = mat4.ortho(0, canvas.clientWidth, 0, canvas.clientHeight, -100, 100, d.mat4x4f());

    let lastTime = Date.now();

    return {
      frame() {
        const now = Date.now();
        const deltaTime = (now - lastTime) * 0.001;
        lastTime = now;

        const modelMat = mat4.translation(d.vec3f((stateRef.current.screenWidth - gameWidth) / 2, 0, 0), d.mat4x4f());

        const pressedKeys = Object.entries(stateRef.current.keysState)
          .filter(([, pressed]) => pressed)
          .map(([key]) => key);
  
        const spawners = pressedKeys.map((pressedKey) => d.vec2f(keyPositions[pressedKey] ?? 0, pianoKeyboardHeight));
        slowParticles.spawners = spawners;
        turbulentParticles.spawners = spawners;

        const outputView = context.getCurrentTexture().createView();

        slowParticles.setUniforms({ projectionMat, modelMat });
        turbulentParticles.setUniforms({ projectionMat, modelMat });

        slowParticles.update(deltaTime);
        turbulentParticles.update(deltaTime);

        root['~unstable'].beginRenderPass(
          {
            colorAttachments: [
              {
                view: outputView,
                loadOp: 'clear',
                storeOp: 'store',
                clearValue: [0, 0, 0, 0],
              },
            ],
          },
          (pass) => {
            slowParticles.draw(pass);
            turbulentParticles.draw(pass);
          },
        );
    
        root['~unstable'].flush();
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
