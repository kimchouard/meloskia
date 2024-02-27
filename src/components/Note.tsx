import { keyNoteColors } from "@/utils/utils";
import {
  Group,
  Paint,
  RoundedRect,
  SkRRect,
  Transforms3d,
  rect,
  rrect,
} from "@shopify/react-native-skia";
import { FC } from "react";
import {
  SharedValue,
  clamp,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Explosion } from "./Explosion";
import { Ripple } from "./Ripple";

type Props = {
  rrectOrigin: SkRRect;
  stageWidth: number;
  stageHeight: number;
  keyIndex: number;
  noteOutlineWidth: number;
  keyboardTop: number;
  streamContentOffsetY: SharedValue<number>;
};

export const Note: FC<Props> = ({
  keyIndex,
  stageWidth,
  stageHeight,
  noteOutlineWidth,
  keyboardTop,
  streamContentOffsetY,
  rrectOrigin,
}) => {
  const opacity = useSharedValue(1);
  const fadeOutNote = () => {
    "worklet";

    opacity.value = withTiming(0, { duration: 100 });
  };

  const strokeOpacity = useDerivedValue(
    () => clamp(opacity.value - 0.5, 0, 1),
    []
  );

  const isCollidedKeyboardTop = useDerivedValue<boolean>(() => {
    const rectY = rrectOrigin.rect.y + streamContentOffsetY.value;
    return stageHeight - rectY - rrectOrigin.rect.height < 0;
  }, [rrectOrigin]);

  const transform = useDerivedValue<Transforms3d>(() => {
    if (isCollidedKeyboardTop.value) {
      return [
        {
          translate: [
            rrectOrigin.rect.x,
            keyboardTop - rrectOrigin.rect.height,
          ],
        },
      ];
    }

    return [
      {
        translate: [
          rrectOrigin.rect.x,
          rrectOrigin.rect.y + streamContentOffsetY.value,
        ],
      },
    ];
  }, [rrectOrigin]);

  useAnimatedReaction(
    () => isCollidedKeyboardTop.value,
    (currIsCollidedKeyboardTop, prevIsCollidedKeyboardTop) => {
      if (currIsCollidedKeyboardTop === prevIsCollidedKeyboardTop) {
        return;
      }

      if (currIsCollidedKeyboardTop) {
        fadeOutNote();
      }
    },
    [isCollidedKeyboardTop]
  );

  return (
    <Group transform={transform} layer>
      <RoundedRect
        rect={rrect(
          rect(0, 0, rrectOrigin.rect.width, rrectOrigin.rect.height),
          rrectOrigin.rx,
          rrectOrigin.ry
        )}
        opacity={opacity}
      >
        <Paint
          color={keyNoteColors[keyIndex]}
          style="stroke"
          strokeWidth={noteOutlineWidth}
          opacity={strokeOpacity}
        />
        <Paint color={keyNoteColors[keyIndex]} opacity={opacity} />
      </RoundedRect>
      <Explosion
        isCollidedKeyboardTop={isCollidedKeyboardTop}
        rrectOrigin={rrectOrigin}
        color={keyNoteColors[keyIndex]}
        stageWidth={stageWidth}
        stageHeight={stageHeight}
      />
      <Ripple
        isCollidedKeyboardTop={isCollidedKeyboardTop}
        cx={rrectOrigin.rect.width / 2} //
        cy={rrectOrigin.rect.height / 2}
        radius={rrectOrigin.rect.height / 2}
        color={keyNoteColors[keyIndex]}
      />
    </Group>
  );
};
