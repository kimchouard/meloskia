import { range, sample } from "@/utils/utils";
import { Group, SkRRect, rect } from "@shopify/react-native-skia";
import { FC } from "react";
import {
  Easing,
  SharedValue,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Sparkle } from "./Sparkle";

type Props = {
  isCollidedKeyboardTop: SharedValue<boolean>;
  rrectOrigin: SkRRect;
  color: string;
};

export const Explosion: FC<Props> = ({
  isCollidedKeyboardTop,
  rrectOrigin,
  color,
}) => {
  const totalSparkles = 10;
  const progress = useSharedValue(0);

  const explode = () => {
    "worklet";

    progress.value = 0;
    progress.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.ease),
    });
  };

  useAnimatedReaction(
    () => isCollidedKeyboardTop.value,
    (currIsCollidedKeyboardTop, prevIsCollidedKeyboardTop) => {
      if (currIsCollidedKeyboardTop === prevIsCollidedKeyboardTop) {
        return;
      }

      if (currIsCollidedKeyboardTop) {
        explode();
      }
    },
    [isCollidedKeyboardTop]
  );

  return (
    <Group>
      {range(0, totalSparkles).map((_, i) => {
        const size = sample([5, 10, 15]);
        return (
          <Sparkle
            key={i}
            rect={rect(
              rrectOrigin.rect.width / 2,
              rrectOrigin.rect.height / 2,
              size,
              size
            )}
            color={color}
            totalParticles={8}
            progress={progress}
          />
        );
      })}
    </Group>
  );
};
