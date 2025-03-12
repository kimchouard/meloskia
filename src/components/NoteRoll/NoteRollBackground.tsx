import React, { memo, useCallback } from "react";
import { Group, Rect } from "@shopify/react-native-skia";

import { KeysState } from "@/hooks/useKeyboard";
import { gameHeight, keyNoteColors, keyWidth } from "@/utils/utils";

import { keyNames } from "../PianoKeyboard";
import colors from "tailwindcss/colors";

interface NoteRollBackgroundProps {
  keysState: KeysState;
}

const bgsArray = new Array(10).fill(0);

const NoteRollBackground: React.FC<NoteRollBackgroundProps> = (props) => {
  const { keysState } = props;

  const renderBackground = (_v: number, i: number) => {
    const keyPressed = keysState[keyNames[i]];
    const xPos = i * keyWidth;
    const yPos = -2 * gameHeight;
    const height = 4 * gameHeight;

    return (
      <Rect
        key={`bg_${i}`}
        x={xPos}
        y={yPos}
        width={keyWidth}
        height={height}
        color={keyPressed ? keyNoteColors[i] : colors.neutral[950]}
        opacity={keyPressed ? 0.1 : 1}
      />
    );
  };

  return <Group>{bgsArray.map(renderBackground)}</Group>;
};

export default memo(NoteRollBackground);
