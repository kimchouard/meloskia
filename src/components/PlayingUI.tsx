import React, { memo, useRef, useState } from 'react';
import { Canvas, Group } from '@shopify/react-native-skia';
import {
  Pressable, Text, StyleSheet, View,
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import PianoKeyboard from './PianoKeyboard';
import NoteRoll from './NoteRoll';
import {
  bgColor,
  countdownBars,
  gameHeight, gameWidth, getTimeFromBars, screenHeight, screenWidth,
} from '../utils/utils';
import useKeyboard from '../hooks/useKeyboard';
import KeyboardAudio from './KeyboardAudio';
import { songs } from '../utils/songs';

export interface SongData {
  bpm: number,
  durationInBars: number,
  notes: { noteName: string, startAtBar: number, durationInBars: number }[],
}

const songData = songs[0];

export const isGamePlaying = (playMode) => playMode === 'playing' || playMode === 'playback';

export type PlayMode = 'start' | 'playing' | 'playback' | 'restart';

const PlayingUI = () => {
  // ==============================
  //    Playing State

  const playingTimeout = useRef<NodeJS.Timeout>();

  const [playMode, setPlayMode] = useState<PlayMode>('start');
  const restart = () => {
    setPlayMode('start');
    clearTimeout(playingTimeout.current);
  };

  const startGame = (startMode: 'playing' | 'playback') => {
    setPlayMode(startMode);

    // TEMP: Allow the user to restart the game after the animation
    playingTimeout.current = setTimeout(() => {
      setPlayMode('restart');
    }, getTimeFromBars(songData.durationInBars + countdownBars, songData.bpm));
  };

  // ==============================
  //    Keyboard Handler
  const {
    keysState, onPressKeyboard, // Keyboard State
  } = useKeyboard({
    keyboardType: 'laptop', playMode, startGame, restart,
  });

  // ==============================
  //    Skia Canvas and Start Btn
  // ==============================

  const renderCTAs = () => (<View style={styles.CTAs}>
    <Pressable onPress={() => ((playMode === 'start') ? startGame('playing') : restart()) }>
      <LinearGradient
        colors={
          (playMode === 'start') ? ['#6A8AFF', '#8A6AFF', '#FF6AFF'] : ['#FF6AFF', '#8A6AFF', '#6A8AFF']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.btn, styles.btnMain]}
      >
        <Text style={[styles.btnText, styles.btnMainText]}>{(playMode === 'start') ? 'Start Playing' : 'Restart'}</Text>
      </LinearGradient>
    </Pressable>

    { (playMode === 'start') && <Pressable style={[styles.btn, styles.btnSecondary]} onPress={() => startGame('playback')}>
        <Text style={[styles.btnText, styles.btnSecondaryText]}>Feeling lazy?</Text>
    </Pressable>}
  </View>);

  return (
    <View style={styles.container}>
      {/* Start button, centered on the screen */}
      { !isGamePlaying(playMode) && renderCTAs()}

      {/* Piano sound */}
      <KeyboardAudio {...{ playMode, keysState, songData }} />

      <GestureDetector gesture={onPressKeyboard}>
        <Canvas style={{ width: screenWidth, height: screenHeight }}>
          <Group transform={[
            // Center the game
            { translateX: (screenWidth - gameWidth) / 2 },
            { translateY: (screenHeight - gameHeight) / 2 },
          ]}>
            <NoteRoll {...{ playMode, keysState, songData }} />
            <PianoKeyboard keysState={keysState} />
          </Group>
        </Canvas>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  CTAs: {
    flex: 1,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  btnText: {
    color: 'white',
  },
  btnMain: {
    backgroundColor: bgColor,
    paddingVertical: 25,
    paddingHorizontal: 40,
  },
  btnMainText: {
    fontWeight: '600',
    fontSize: 24,
  },
  btnSecondary: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  btnSecondaryText: {
    color: '#757575',
    fontWeight: '500',
    fontSize: 18,
  },
});

export default memo(PlayingUI);
