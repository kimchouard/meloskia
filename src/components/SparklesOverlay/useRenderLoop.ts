import { RefObject, useEffect } from "react";

export interface UseRenderLoopOptions {
  init(canvas: HTMLCanvasElement, context: GPUCanvasContext): Promise<{
    frame(): void;
    dispose(): void;
  }>;
}

export function useRenderLoop(canvasRef: RefObject<HTMLCanvasElement>, options: UseRenderLoopOptions) {
  const { init } = options;

  useEffect(() => {
    let lastCanvas: HTMLCanvasElement | undefined;
    let onFrame: () => void | undefined;
    let onDispose: () => void | undefined;
    let running = true;

    const draw = () => {
      if (!running) {
        return;
      }
      if (lastCanvas !== canvasRef.current) {
        lastCanvas = canvasRef.current;
        onFrame = undefined;
        onDispose = undefined;
        init(lastCanvas, lastCanvas.getContext('webgpu')).then((result) => {
          if (!running) {
            result.dispose();
          }
          else {
            onFrame = result.frame;
            onDispose = result.dispose;
          }
        });
      }
      onFrame?.();
      requestAnimationFrame(draw);
    };
    draw();

    return () => {
      onDispose?.();
      running = false;
    };
  }, [init]);
}