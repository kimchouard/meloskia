import React, { memo } from 'react';
import { Group, Rect } from '@shopify/react-native-skia';

import { KeysState } from '@/hooks/useKeyboard';
import { keyWidth, gameHeight, accidentalNoteColors } from '@/utils/utils';

import { accidentalNames } from '../PianoKeyboard';

interface NoteRollLinesProps {
  keysState: KeysState;
}

const linesArray = new Array(11).fill(0);

const NoteRollLines: React.FC<NoteRollLinesProps> = (props) => {
  const { keysState } = props;

  const renderLine = (_v: number, i: number) => {
    const xPos = i * keyWidth;
    const yPos = -2 * gameHeight;
    const height = 4 * gameHeight;

    const accidentalPressed = keysState[accidentalNames[i]];

    const defaultAccidentalColor =
      i === 10 || accidentalNames[i] === '' ? '#333' : '#666';

    return (
      <Rect
        key={`line_${i}`}
        x={xPos}
        y={yPos}
        width={accidentalPressed ? 2 : 1}
        height={height}
        color={
          accidentalPressed
            ? accidentalNoteColors[i - 1]
            : defaultAccidentalColor
        }
      />
    );
  };

  return <Group>{linesArray.map(renderLine)}</Group>;
};

export default memo(NoteRollLines);
