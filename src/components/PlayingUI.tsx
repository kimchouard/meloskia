import React, { memo, useRef, useState } from 'react';
import { Canvas, Group } from '@shopify/react-native-skia';
import {
  Pressable, Text, View,
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import PianoKeyboard from './PianoKeyboard';
import NoteRoll from './NoteRoll';
import {
  countdownBars,
  gameHeight, gameWidth, getTimeFromBars, isGamePlaying, screenHeight, screenWidth,
} from '../utils/utils';
import useKeyboard from '../hooks/useKeyboard';
import KeyboardAudio from './KeyboardAudio';
import { songs } from '../utils/songs';

const songData = songs[0];

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

  const renderCTAs = () => (<View className="flex-1 absolute top-0 left-0 bg-neutral-950/70 w-full h-full flex-col items-center justify-center">
    <Pressable onPress={() => ((playMode === 'start') ? startGame('playing') : restart()) }>
      <LinearGradient
        colors={
          (playMode === 'start') ? ['#6A8AFF', '#8A6AFF', '#FF6AFF'] : ['#FF6AFF', '#8A6AFF', '#6A8AFF']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="content-center items-center rounded-lg py-5 px-10"
      >
        <Text className='text-white font-medium text-2xl'>{(playMode === 'start') ? 'Start Playing' : 'Restart'}</Text>
      </LinearGradient>
    </Pressable>

    { (playMode === 'start') && <Pressable
      className="content-center items-center rounded-lg py-3"
      onPress={() => startGame('playback')}
    >
        <Text className="text-neutral-400 text-lg">Feeling lazy?</Text>
    </Pressable>}
  </View>);

  return (
    <View className="flex-1">
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

export default memo(PlayingUI);
