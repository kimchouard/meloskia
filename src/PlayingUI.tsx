import React, { memo } from 'react';
import { Canvas, Group } from '@shopify/react-native-skia';
import {
  Pressable, Text, StyleSheet, View,
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import PianoKeyboard from './PianoKeyboard';
import NoteRoll from './NoteRoll';
import {
  accidentalNoteColors,
  bgColor,
  gameHeight, gameWidth, screenHeight, screenWidth,
} from './utils';
import useKeyboard from './useKeyboard';
import KeyboardAudio from './KeyboardAudio';

export interface SongData {
  bpm: number,
  durationInBars: number,
  notes: { noteName: string, startAtBar: number, durationInBars: number }[],
}

const songData = {
  bpm: 120,
  durationInBars: 17,
  notes: [
    { noteName: 'C3', startAtBar: 0, durationInBars: 1 },
    { noteName: 'D3', startAtBar: 1, durationInBars: 1 },
    { noteName: 'E3', startAtBar: 2, durationInBars: 1 },
    { noteName: 'F3', startAtBar: 3, durationInBars: 1 },
    { noteName: 'G3', startAtBar: 4, durationInBars: 1 },
    { noteName: 'A3', startAtBar: 5, durationInBars: 1 },
    { noteName: 'B3', startAtBar: 6, durationInBars: 1 },
    { noteName: 'C4', startAtBar: 7, durationInBars: 1 },
    { noteName: 'D4', startAtBar: 8, durationInBars: 1 },
    { noteName: 'E4', startAtBar: 9, durationInBars: 1 },
    { noteName: 'D#4', startAtBar: 10, durationInBars: 1 },
    { noteName: 'C#4', startAtBar: 11, durationInBars: 1 },
    { noteName: 'A#3', startAtBar: 12, durationInBars: 1 },
    { noteName: 'G#3', startAtBar: 13, durationInBars: 1 },
    { noteName: 'F#3', startAtBar: 14, durationInBars: 1 },
    { noteName: 'D#3', startAtBar: 15, durationInBars: 1 },
    { noteName: 'C#3', startAtBar: 16, durationInBars: 1 },
  ],
};

export const isGamePlaying = (playMode) => playMode === 'playing' || playMode === 'playback';

const PlayingUI = () => {
  const {
    playMode, restart, startGame, // Playing State
    keysState, onPressKeyboard, // Keyboard State
  } = useKeyboard({ keyboardType: 'laptop', songData });

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
