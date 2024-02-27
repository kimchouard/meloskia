import { random, range, sample, textureOnUI } from "@/utils/utils";
import {
  Picture,
  SkCanvas,
  SkRRect,
  SkRect,
  Skia,
  rect,
} from "@shopify/react-native-skia";
import { FC, useMemo } from "react";
import {
  Easing,
  SharedValue,
  interpolate,
  makeMutable,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const Particle = (rectOrigin: SkRect, color: string) => {
  const opacity = makeMutable(1);
  const x = makeMutable(rectOrigin.x);
  const y = makeMutable(rectOrigin.y);
  const scale = makeMutable(1);
  const moveX = makeMutable(random(-150, 150));
  const moveY = makeMutable(random(-300, 0));
  const paint = Skia.Paint();
  paint.setColor(Skia.Color(color));

  const update = (progress: number) => {
    "worklet";

    x.value = interpolate(
      progress,
      [0, 1],
      [rectOrigin.x, rectOrigin.x + moveX.value]
    );
    y.value = interpolate(
      progress,
      [0, 1],
      [rectOrigin.y, rectOrigin.y + moveY.value]
    );
    opacity.value = interpolate(progress, [0, 1], [1, 0]);
    scale.value = interpolate(progress, [0, 1], [1, 0]);

    paint.setAlphaf(opacity.value);
  };

  const draw = (canvas: SkCanvas, progress: number) => {
    "worklet";

    update(progress);

    canvas.save();
    const width = rectOrigin.width * scale.value;
    const height = rectOrigin.height * scale.value;
    canvas.drawOval(rect(x.value, y.value, width, height), paint);
    canvas.restore();
  };

  return { draw };
};

type Props = {
  isCollidedKeyboardTop: SharedValue<boolean>;
  rrectOrigin: SkRRect;
  color: string;
  stageWidth: number;
  stageHeight: number;
};

export const Explosion: FC<Props> = ({
  isCollidedKeyboardTop,
  rrectOrigin,
  color,
  stageWidth,
  stageHeight,
}) => {
  const totalParticles = 30;
  const particles = useMemo(
    () =>
      range(0, totalParticles).map(() => {
        const size = sample([5, 10, 15]);
        return Particle(
          rect(
            rrectOrigin.rect.width / 2,
            rrectOrigin.rect.height / 2,
            size,
            size
          ),
          color
        );
      }),
    [rrectOrigin]
  );

  const progress = useSharedValue(0);
  const particleTexture = useDerivedValue(() => {
    return textureOnUI(rect(0, 0, stageWidth, stageHeight), (canvas) => {
      if (progress.value === 0) {
        return;
      }

      for (let i = 0; i < particles.length; i++) {
        particles[i].draw(canvas, progress.value);
      }
    });
  }, [particles]);

  const explode = () => {
    "worklet";

    progress.value = 0;
    progress.value = withTiming(1, {
      duration: 1200,
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

  return <Picture picture={particleTexture} />;
};
