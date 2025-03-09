import { useWindowDimensions } from "react-native";
import { PIANO_KEYS_WHITE } from "../data";

export const usePianoLayout = () => {
  const { width: stageWidth, height: stageHeight } = useWindowDimensions();
  const keyboardWidth = Math.min(stageWidth, 768);
  const keyboardHeight = stageHeight / 5;
  const keyboardTop = stageHeight - keyboardHeight;
  const noteStreamWidth = keyboardWidth;
  const noteStreamHeight = stageHeight - keyboardHeight;
  const noteOutlineWidth = 8;
  const noteRadius = 5;
  const keyPaddingBottom = 12;
  const keyRadius = 4;
  const gap = 4;
  const lineWidth = 2;
  const totalGap = gap * (PIANO_KEYS_WHITE.length - 1);
  const whiteKeyWidth = (keyboardWidth - totalGap) / PIANO_KEYS_WHITE.length;
  const blackKeyWidth = whiteKeyWidth / 1.5;

  return {
    stageWidth,
    stageHeight,
    keyboardWidth,
    keyboardHeight,
    keyboardTop,
    noteStreamWidth,
    noteStreamHeight,
    noteOutlineWidth,
    noteRadius,
    keyPaddingBottom,
    keyRadius,
    gap,
    whiteKeyWidth,
    blackKeyWidth,
    lineWidth,
  };
};
