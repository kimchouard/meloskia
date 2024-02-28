import {
  Group,
  LinearGradient,
  Rect,
  SkRect,
  vec,
} from "@shopify/react-native-skia";
import { FC } from "react";
import { SharedValue, useDerivedValue } from "react-native-reanimated";
import { IPianoKeys } from "../controller";
import { PIANO_KEYS_WHITE } from "../data";

type Props = {
  rect: SkRect;
  targetKeyName: (typeof PIANO_KEYS_WHITE)[number];
  activeKeys: SharedValue<IPianoKeys>;
  color: string;
  activeColor: string;
};

export const NoteStreamLineBackground: FC<Props> = ({
  rect,
  targetKeyName,
  activeKeys,
  color,
  activeColor,
}) => {
  const { x, y, width, height } = rect;
  const colors = useDerivedValue(() => {
    return activeKeys.value.includes(targetKeyName)
      ? [color, activeColor, activeColor]
      : [color];
  }, [targetKeyName, activeColor, activeKeys]);

  return (
    <Group>
      <Rect rect={rect}>
        <LinearGradient
          start={vec(x, y)}
          end={vec(x, y + height)}
          colors={colors}
        />
      </Rect>
    </Group>
  );
};
