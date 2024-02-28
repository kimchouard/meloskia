import { Group, Line, SkPoint } from "@shopify/react-native-skia";
import { FC } from "react";
import { SharedValue, useDerivedValue } from "react-native-reanimated";
import { IPianoKeys } from "../controller";
import { PIANO_KEYS_BLACK } from "../data";

type Props = {
  p1: SkPoint;
  p2: SkPoint;
  lineWidth: number;
  targetKeyName: (typeof PIANO_KEYS_BLACK)[number] | undefined;
  activeKeys: SharedValue<IPianoKeys>;
  color: string;
  activeColor: string;
};

export const NoteStreamLine: FC<Props> = ({
  p1,
  p2,
  lineWidth,
  targetKeyName,
  activeKeys,
  color,
  activeColor,
}) => {
  const lineColor = useDerivedValue(() => {
    if (targetKeyName) {
      return activeKeys.value.includes(targetKeyName) ? activeColor : color;
    }
    return color;
  }, [targetKeyName, activeColor, activeKeys]);

  return (
    <Group>
      <Line p1={p1} p2={p2} color={lineColor} strokeWidth={lineWidth} />
    </Group>
  );
};
