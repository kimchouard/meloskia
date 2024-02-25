import { Canvas, Group } from "@shopify/react-native-skia";
import PianoKeyboard from "./PianoKeyboard";
import { gameHeight, gameWidth, screenHeight, screenWidth } from "@/utils/utils";
import { Pressable, View } from "react-native";
import { Easing, useDerivedValue, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { useEffect, useRef, useState } from "react";
import NoteRoll from "./NoteRoll";
import { songs } from "@/utils/songs";

const SideRoll = ({
  startAnimation,
  side,
}:{
  startAnimation?: number,
  side: 'Right2Left' | 'Left2Right',
}) => {
  const startPos = (side === 'Right2Left') ? gameWidth * 1.35 : -gameWidth * 3;
  const endPos = (side === 'Right2Left') ? -gameWidth : gameWidth;
  const xPos = useSharedValue(startPos);

  const sideTransform = (side === 'Right2Left') ? [
    { perspective: 800 },
    { rotateY: 0.60 }, // Math.PI / 10
    { rotateX: 0.3 },
    { rotateZ: 0.2 },
  ] : [

    // Go to the top right of the piano keys
    { translateX: gameWidth },

    // Apply the perspective effect
    { perspective: 800 },
    { rotateY: -0.5 }, // Math.PI / 10
    { rotateX: 0.1 },
    { rotateZ: -0.1},

    // Go back to the top left of the piano keys
    { translateX: -gameWidth },
    { translateY: -gameHeight / 5 },
  ];

  const xPosTransform = useDerivedValue(() => [
    { scale: 3 },

    // Apply the perspective effect
    ...sideTransform,

    // DEBUG Left2Right
    // { translateX: - gameWidth },
    
    // Center the game
    { translateX: xPos?.value },
    { translateY: - (gameHeight) / 1.5 },
  ]);

  useEffect(() => {
    if (startAnimation) {
      xPos.value = startPos;
      xPos.value = withDelay((side === 'Right2Left') ? 0 : 2500,
        withTiming(endPos, {
          duration: 2500,
          easing: Easing.in(Easing.quad),
        }, () => {
          xPos.value = startPos;
        })
      );
    } else {
      xPos.value = startPos;
    }
  }, [startAnimation])

  return (
    <Group transform={xPosTransform}>
      <PianoKeyboard 
        keysState={{}}
        songName="intro"
        disableAnimation={true}
        showNoteNames={false}
        hideSideBackground={true}
      />
    </Group>
  );
}

const AnimatedNoteRoll = () => {
  const notesStartPos = - gameHeight * 1.5;
  const notesEndPos = gameHeight * 2;
  const notesY = useSharedValue(notesStartPos);

  const startPos = -gameHeight;
  const midPos = 0;
  // const endPos = gameHeight * 2;
  const noteRollYFadeOut = useSharedValue(startPos);
  const opacity = useSharedValue(1);
  const noteRollTransform = useDerivedValue(() => [
    // Center
    { translateX: gameWidth / 2 },

    // Animation
    { translateY: noteRollYFadeOut?.value }
  ]);

  useEffect(() => {
    // if (startAnimation) {
      opacity.value = 1;
      notesY.value = notesStartPos;
      notesY.value = withDelay(1500, withTiming(notesEndPos, {
        duration: 2000,
        easing: Easing.out(Easing.ease),
      }));

      noteRollYFadeOut.value = startPos;
      noteRollYFadeOut.value = withDelay(500,
        withTiming(midPos, {
          duration: 2000,
          easing: Easing.out(Easing.quad),
        }, () => {
          opacity.value = withDelay(
            600, 
            withTiming(0, {
              duration: 500,
              easing: Easing.in(Easing.quad),
            })
          )
        })
      );
    // } else {
    //   noteRollY.value = startPos;
    // }
  }, []);

  return <Group
    transform={noteRollTransform}
    opacity={opacity}
  >
    <NoteRoll
      keysState={{}}
      songData={songs[0]}
      noteRollY={notesY}
    />
  </Group>;
}


const IntroBRollAnimation = () => {
  // const [currentAnimation, setCurrentAnimation] = useState<'animation1' | 'animation2'>()
  const [animationStarted, setAnimationStarted] = useState<{ [key:string]:number}>({
    animation1: 0,
  })

  const animationTimeout = useRef<NodeJS.Timeout>();

  const animationToggle = (animationToToggle: string) => {
    clearTimeout(animationTimeout.current);

    const newAnimation = {};
    newAnimation[animationToToggle] = (animationStarted[animationToToggle] === 1) ? 2 : 1;
    console.log('new animation', newAnimation);
    setAnimationStarted(newAnimation);
    
    if (animationToToggle === 'animation1') {
      console.log('setting timeout for next animation');
      animationTimeout.current = setTimeout(() => {
        console.log('animation continuing');
        animationToggle('animation2');
      }, 5000);
    } else {
      clearTimeout(animationTimeout.current);
    }
  }

  return <Pressable
    className="flex-1"
    onPress={() => animationToggle('animation1') }
  >
    <Canvas style={{ width: screenWidth, height: screenHeight }}>
      <SideRoll side={'Right2Left'} startAnimation={animationStarted.animation1} />
      <SideRoll side={'Left2Right'} startAnimation={animationStarted.animation1} />

      { animationStarted.animation2 ? <AnimatedNoteRoll /> : null }
    </Canvas>
  </Pressable>;
};

export default IntroBRollAnimation;