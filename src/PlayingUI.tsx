import React from "react";
import { Canvas, Group } from "@shopify/react-native-skia";
import { Dimensions, View, Pressable, Text } from "react-native";
import PianoKeyboard from "./PianoKeyboard";
import NoteRoll from "./NoteRoll";
import { gameHeight, gameWidth, screenHeight, screenWidth } from "./utils";
 
const PlayingUI = () => {
  const minSize = Math.min(screenWidth, screenHeight);
  const r = minSize * 0.33;

  console.log('SkiaUI.tsx: screenWidth: ', screenWidth, ' screenHeight: ', screenHeight, ' r: ', r, minSize)

  return (
    <>
      
      <Canvas style={{ width: screenWidth, height: screenHeight }}>
        <Group transform={[
          // Center the game 
          { translateX: (screenWidth - gameWidth) / 2 },
          { translateY: (screenHeight - gameHeight) / 2 },
        ]}>
          <NoteRoll />
          <PianoKeyboard />
        </Group>
      </Canvas>
    </>
  );
};
 
export default PlayingUI;