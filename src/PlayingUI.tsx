import React, { memo } from 'react';
import { Canvas, Group } from '@shopify/react-native-skia';
import {
  Pressable, Text, StyleSheet,
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import PianoKeyboard from './PianoKeyboard';
import NoteRoll from './NoteRoll';
import {
  bgColor,
  gameHeight, gameWidth, screenHeight, screenWidth,
} from './utils';
import useKeyboard from './useKeyboard';
import KeyboardAudio from './KeyboardAudio';

const PlayingUI = () => {
  const {
    playMode, restart, startGame, // Playing State
    keysState, onPressKeyboard, // Keyboard State
  } = useKeyboard({ keyboardType: 'laptop' });

  // ==============================
  //    Skia Canvas and Start Btn
  // ==============================

  return (
    <>
      {/* Start button, centered on the screen */}
      { playMode !== 'playing' && <Pressable style={styles.btn} onPress={() => ((playMode === 'start') ? startGame() : restart()) }>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 24 }}>{(playMode === 'start') ? 'Start Playing' : 'AGAIN!'}</Text>
      </Pressable>}

      {/* Piano sound */}
      <KeyboardAudio keysState={keysState} />

      <GestureDetector gesture={onPressKeyboard}>
        <Canvas style={{ width: screenWidth, height: screenHeight }}>
          <Group transform={[
            // Center the game
            { translateX: (screenWidth - gameWidth) / 2 },
            { translateY: (screenHeight - gameHeight) / 2 },
          ]}>
            <NoteRoll playMode={playMode} keysState={keysState} />
            <PianoKeyboard keysState={keysState} />
          </Group>
        </Canvas>
      </GestureDetector>
    </>
  );
};

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    height: 80,
    width: 200,
    backgroundColor: bgColor,
    top: screenHeight / 2 - 40,
    left: screenWidth / 2 - 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});

export default memo(PlayingUI);
