import React, { memo, useRef, useState } from 'react';
import { Canvas, Group } from '@shopify/react-native-skia';
import {
  Platform,
  Pressable, Text, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { GestureDetector } from 'react-native-gesture-handler';
import PianoKeyboard from './PianoKeyboard';
import NoteRoll from './NoteRoll';
import {
  countdownBars,
  gameHeight, gameWidth, getDurationInBars, getOnPressKeyboardGestureHandler, getTimeFromBars, isGamePlaying, screenHeight, screenWidth,
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
    }, getTimeFromBars((songData) && (getDurationInBars(songData) + countdownBars), songData?.bpm));
  };

  // ==============================
  //    Keyboard Handler

  const {
    keysState, keyPressed, releaseLastKey,
  } = useKeyboard({
    keyboardType: 'laptop', playMode, startGame, restart, songData,
  });

  // ==============================
  //    CTAs

  const renderWebCTAs = () => (<View className="flex absolute bottom-[200px] w-full bg-neutral-950/70 py-5">
    { (playMode === 'start') ? <>
      <Text className="text-white text-lg text-center">Press Spacebar to start playing</Text>
      <Text className="text-neutral-400 text-regular text-center">Press Enter if you're feeling lazy. </Text>
    </> : <Text className="text-white text-lg text-center">Press Spacebar or Enter to restart.</Text> }
  </View>);

  const renderMobileCTAs = () => (<View className="bg-neutral-950/70 absolute top-0 left-0 w-full h-full flex-1 flex-col items-center">
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

  const renderCTAs = () => (<View className="absolute top-0 left-0 w-full h-full flex-1 flex-col items-center">
    { (Platform.OS === 'web') ? renderWebCTAs() : renderMobileCTAs()}

    {/* Close icon on the top right */}
    <Link href="/" className="absolute top-3 left-3 py-3 px-5">
      <Text className="text-neutral-400 text-lg">&lt; Back</Text>
      {/* <Text className="text-neutral-200 font-medium text-3xl">x</Text> */}
    </Link>
  </View>);

  // ==============================
  //    Skia Canvas

  if (songData) {
    return (
      <View className="flex-1">
        {/* Start button, centered on the screen */}
        { !isGamePlaying(playMode) && ((Platform.OS === 'web') ? renderCTAs() : renderMobileCTAs()) }

        {/* Piano sound */}
        <KeyboardAudio {...{ playMode, keysState, songData }} />

        <GestureDetector gesture={getOnPressKeyboardGestureHandler(keyPressed, releaseLastKey)}>
          <Canvas style={{ width: screenWidth, height: screenHeight }}>
            <Group transform={[
              // Center the game
              { translateX: (screenWidth - gameWidth) / 2 },
              { translateY: (screenHeight - gameHeight) / 2 },
            ]}>
              <NoteRoll {...{ playMode, keysState, songData }} />
              <PianoKeyboard keysState={keysState} songName={songData.name} />
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
