import React, { useState } from 'react';
import { Canvas, Group } from '@shopify/react-native-skia';
import {
  Pressable, Text, StyleSheet,
} from 'react-native';
import PianoKeyboard from './PianoKeyboard';
import NoteRoll from './NoteRoll';
import {
  bgColor,
  gameHeight, gameWidth, screenHeight, screenWidth,
} from './utils';

export type PlayMode = 'start' | 'playing' | 'restart';

const PlayingUI = () => {
  const [playMode, setPlayMode] = useState<PlayMode>('start');

  const restart = () => {
    setPlayMode('start');
  };

  const startGame = () => {
    setPlayMode('playing');

    // TEMP: Allow the user to restart the game after the animation
    setTimeout(() => {
      setPlayMode('restart');
    }, 4500);
  };

  return (
    <>
      {/* Start button, centered on the screen */}
      { playMode !== 'playing' && <Pressable style={styles.btn} onPress={() => ((playMode === 'start') ? startGame() : restart()) }>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 24 }}>{(playMode === 'start') ? 'Start Playing' : 'AGAIN!'}</Text>
      </Pressable>}
      <Canvas style={{ width: screenWidth, height: screenHeight }}>
        <Group transform={[
          // Center the game
          { translateX: (screenWidth - gameWidth) / 2 },
          { translateY: (screenHeight - gameHeight) / 2 },
        ]}>
          <NoteRoll playMode={playMode} />
          <PianoKeyboard />
        </Group>
      </Canvas>
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

export default PlayingUI;
