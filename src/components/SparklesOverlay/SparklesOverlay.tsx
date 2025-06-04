import tgpu from 'typegpu';
import * as d from 'typegpu/data';
import { RefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import { mat4 } from 'wgpu-matrix';
import {
  keyWidth,
  gameWidth,
  countdownBars,
  getBarsFromDist,
  getBarsFromTime,
  pianoKeyboardHeight,
} from '@/utils/utils';
import { progressAtom } from '@/atoms/progressAtom';
import { KeysState } from '@/types';
import { keyNames, accidentalNames, noteToKeyboardKey } from '@/constants';
import { InstrumentNote, Song } from '@/songs';
import { useRenderLoop } from './useRenderLoop';
import {
  slowParticleSystem,
  starParticleSystem,
  turbulentParticleSystem,
} from './schemas';
import { useReadAtom } from '@/hooks/useReadAtom';

interface State {
  readonly keysState: KeysState;
  readonly screenWidth: number;
  getExpectedNotes(): readonly string[];
}

const keyPositions = Object.fromEntries([
  ...keyNames.map((keyName, i) => {
    return [keyName, (i + 0.5) * keyWidth] as const;
  }),
  ...accidentalNames.map((keyName, i) => {
    return [keyName, i * keyWidth] as const;
  }),
]);

function createSetup(stateRef: RefObject<State>) {
  return async function setup(
    canvas: HTMLCanvasElement,
    context: GPUCanvasContext
  ) {
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    const root = await tgpu.init();

    context.configure({
      device: root.device,
      format: presentationFormat,
      alphaMode: 'premultiplied',
    });

    const slowParticles = slowParticleSystem.create(root, presentationFormat);
    const turbulentParticles = turbulentParticleSystem.create(
      root,
      presentationFormat
    );
    const starParticles = starParticleSystem.create(root, presentationFormat);

    const projectionMat = mat4.ortho(
      0,
      canvas.clientWidth,
      0,
      canvas.clientHeight,
      -100,
      100,
      d.mat4x4f()
    );

    let lastTime = Date.now();

    return {
      frame() {
        const now = Date.now();
        const deltaTime = (now - lastTime) * 0.001;
        lastTime = now;

        const modelMat = mat4.translation(
          d.vec3f((stateRef.current.screenWidth - gameWidth) / 2, 0, 0),
          d.mat4x4f()
        );

        const expectedNotes = stateRef.current.getExpectedNotes();
        const goodKeys = Object.entries(stateRef.current.keysState)
        .filter(([note, pressed]) => pressed && expectedNotes.includes(note))
        .map(([note]) => noteToKeyboardKey[note]);

        const spawners = goodKeys.map((pressedKey) =>
          d.vec2f(keyPositions[pressedKey] ?? 0, pianoKeyboardHeight)
        );
        slowParticles.spawners = spawners;
        turbulentParticles.spawners = spawners;
        starParticles.spawners = spawners;

        const outputView = context.getCurrentTexture().createView();

        slowParticles.setUniforms({ projectionMat, modelMat });
        turbulentParticles.setUniforms({ projectionMat, modelMat });
        starParticles.setUniforms({ projectionMat, modelMat });

        slowParticles.update(deltaTime);
        turbulentParticles.update(deltaTime);
        starParticles.update(deltaTime);

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
            starParticles.draw(pass);
          }
        );

        root['~unstable'].flush();
      },
      dispose() {
        root.destroy();
      },
    };
  };
}

interface SparklesOverlayProps {
  songData: Song;
  keysState: KeysState;
  screenWidth: number;
  width: number;
  height: number;
}

/**
 * Returns a function that can be called to retrieve what notes
 * are expected to be played by the player at a given point in time.
 *
 * @param songData The song that is being played
 * @returns A function that returns an array of note names
 */
function useGetExpectedNotes(songData: Song): () => string[] {
  const getProgress = useReadAtom(progressAtom);

  return useCallback(() => {
    const progress = getProgress();
    let currentTimeInBars = 0;

    if (progress.playMode === 'playback' || progress.playMode === 'playing') {
      const currentTimeInMs = Date.now() - progress.startedPlayingAt;
      currentTimeInBars = getBarsFromTime(currentTimeInMs, songData.baseBpm);
    } else if (
      progress.playMode === 'stopped' ||
      progress.playMode === 'restart'
    ) {
      currentTimeInBars = getBarsFromDist(progress.noteRollY, songData.baseBpm);
    }

    return songData.voices
      .find((voice) => voice.id === 'piano')
      .notes.filter((note) => {
        if (note.type !== 'i') {
          return false; // Only consider instrument notes
        }

        const noteStart = note.startAt + countdownBars;
        const noteEnd = noteStart + note.duration;
        return currentTimeInBars >= noteStart && currentTimeInBars < noteEnd;
      })
      .map((note: InstrumentNote) => note.noteName);
  }, [songData, getProgress]);
}

const SparklesOverlay = ({
  keysState,
  screenWidth,
  songData,
  height,
}: SparklesOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const getExpectedNotes = useGetExpectedNotes(songData);

  const stateRef = useRef<State>({ keysState, screenWidth, getExpectedNotes });

  useEffect(() => {
    stateRef.current = { keysState, screenWidth, getExpectedNotes };
  }, [keysState, screenWidth, getExpectedNotes]);

  useRenderLoop(canvasRef, {
    init: useMemo(() => createSetup(stateRef), []),
  });

  return (
    <div className="pointer-events-none absolute inset-0">
      <canvas
        ref={canvasRef}
        width={screenWidth * window.devicePixelRatio}
        height={height * window.devicePixelRatio}
        style={{ width: screenWidth, height, backgroundColor: '#abcdef22' }}
      />
    </div>
  );
};

export default SparklesOverlay;
