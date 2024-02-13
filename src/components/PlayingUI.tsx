import React, { memo, useRef, useState } from 'react';
import { Canvas, Group } from '@shopify/react-native-skia';
import {
  Pressable, Text, View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import PianoKeyboard, { accidentalNames, keyNames } from './PianoKeyboard';
import NoteRoll from './NoteRoll';
import {
  countdownBars,
  gameHeight, gameWidth, getTimeFromBars, isGamePlaying, pianoKeyboardHeight, screenHeight, screenWidth,
} from '../utils/utils';
import useKeyboard from '../hooks/useKeyboard';
import KeyboardAudio from './KeyboardAudio';
import { SongData } from '../utils/songs';

const verbose = false;

export type PlayMode = 'start' | 'playing' | 'playback' | 'restart';

const PlayingUI = ({
  songData,
}:{
  songData: SongData
}) => {
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
    }, getTimeFromBars((songData) && (songData.durationInBars + countdownBars), songData?.bpm));
  };

  // ==============================
  //    Keyboard Handler

  const {
    keysState, keyPressed, releaseLastKey,
  } = useKeyboard({
    keyboardType: 'laptop', playMode, startGame, restart, songData,
  });

  // ==============================
  //    Gesture Handler

  const getKeyNameFromPosition = (x: number, y: number) => {
    const keyFloatIndex = (x - (screenWidth - gameWidth) / 2) / (gameWidth / 10);
    const keyIndex = Math.floor(keyFloatIndex);

    // Detect key accidentals
    if (y < gameHeight - pianoKeyboardHeight / 2) {
      // If we're on a black key, which are 1/4 of the width of a white key and inbetween white key 1 and 2, 2 and 3, 4 and 5, 5 and 6, 6 and 7, 8 and 9 and 9 and 10
      if ((keyFloatIndex > 0.73 && keyFloatIndex < 1.27) // W
      || (keyFloatIndex > 1.73 && keyFloatIndex < 2.27) // E
      || (keyFloatIndex > 3.73 && keyFloatIndex < 4.27) // T
      || (keyFloatIndex > 4.73 && keyFloatIndex < 5.27) // Y
      || (keyFloatIndex > 5.73 && keyFloatIndex < 6.27) // U
      || (keyFloatIndex > 7.73 && keyFloatIndex < 8.27) // O
      || (keyFloatIndex > 8.73 && keyFloatIndex < 9.27) // P
      ) {
        return accidentalNames[Math.round(keyFloatIndex)];
      }
    }

    // We're on a white key
    return keyNames[keyIndex];
  };

  const onPressKeyboardGestureHandler = Gesture.Pan().minDistance(0)
    .onStart((e) => {
      // If the key is pressed on the keyboard
      if (e.y > gameHeight - pianoKeyboardHeight) {
        verbose && console.log('Key pressed:', e);

        keyPressed(getKeyNameFromPosition(e.x, e.y));
      }
    })
    .onChange((e) => {
      // If the key is pressed on the keyboard
      if (e.y > gameHeight - pianoKeyboardHeight) {
        const keyName = getKeyNameFromPosition(e.x, e.y);
        // If we're on an unknown key
        if (!keyName) return releaseLastKey();

        keyPressed(keyName, true);

      // If we've left the keyboard area
      } else {
        releaseLastKey();
      }
    })
    .onEnd(() => {
      releaseLastKey();
    });

  // ==============================
  //    Skia Canvas and Start Btn

  if (songData) {
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

      {/* Close icon on the top right */}
      <Link href="/" className="absolute top-3 left-3 py-3 px-5">
        <Text className="text-neutral-400 text-lg">&lt; Back</Text>
        {/* <Text className="text-neutral-200 font-medium text-3xl">x</Text> */}
      </Link>
    </View>);

    return (
      <View className="flex-1">
        {/* Start button, centered on the screen */}
        { !isGamePlaying(playMode) && renderCTAs()}

        {/* Piano sound */}
        <KeyboardAudio {...{ playMode, keysState, songData }} />

        <GestureDetector gesture={onPressKeyboardGestureHandler}>
          <Canvas style={{ width: screenWidth, height: screenHeight }}>
            <Group transform={[
              // Center the game
              { translateX: (screenWidth - gameWidth) / 2 },
              { translateY: (screenHeight - gameHeight) / 2 },
            ]}>
              <NoteRoll {...{ playMode, keysState, songData }} />
              <PianoKeyboard keysState={keysState} autoPlay={(playMode === 'playback')} />
            </Group>
          </Canvas>
        </GestureDetector>
      </View>
    );
  }

  // ==============================
  //    Invalid songData

  return <View className="flex-1 bg-neutral-950 items-center justify-center">
    <Text className="text-lg font-bold text-white">Invalid ID. This song doesn't exist.</Text>

    <Link href="/" className="mt-4 py-4">
      <Text className="text-regular text-cyan-600 web:hover:text-cyan-500">Go to home screen</Text>
    </Link>
  </View>;
};

export default memo(PlayingUI);
