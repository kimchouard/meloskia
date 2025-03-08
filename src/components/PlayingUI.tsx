import React, {
  memo, useEffect, useRef, useState,
} from 'react';
import { Canvas, Group } from '@shopify/react-native-skia';
import {
  Easing,
  Platform,
  Pressable, Text, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, withDelay, withTiming,
} from 'react-native-reanimated';
import PianoKeyboard from './PianoKeyboard';
import NoteRoll from './NoteRoll';
import {
  countdownBars,
  gameHeight, gameWidth, getBarsFromDist, getDistFromBars, getDurationInBars, getOnPressKeyboardGestureHandler, getTimeFromBars, isGamePlaying, screenHeight, screenWidth,
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
    keysState, keyPressed, releaseLastKey, playNotesFromBars,
  } = useKeyboard({
    keyboardType: 'laptop', playMode, startGame, restart, songData,
  });

  // ==============================
  //    Animations

  // NoteRoll Animation
  const noteRollY = useSharedValue(0);
  useEffect(() => {
    if (isGamePlaying(playMode)) {
      const songDurationWithCountdown = getDurationInBars(songData) + countdownBars;
      noteRollY.value = withTiming(
        getDistFromBars(songDurationWithCountdown, songData.bpm),
        {
          duration: getTimeFromBars(songDurationWithCountdown, songData.bpm),
          easing: Easing.linear,
        },
      );
    } else if (playMode === 'start') {
      noteRollY.value = withTiming(0, {
        duration: 500,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playMode]);

  // CTA Animation
  const height = useSharedValue(0);
  useEffect(() => {
    if (playMode === 'start' && noteRollY.value === 0) {
      height.value = 0;
      height.value = withDelay(1000, withTiming((Platform.OS === 'web') ? 85 : 200, { duration: 250, easing: Easing.inOut(Easing.ease) }));
    }

    return () => {
      height.value = 0;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songData.name]);

  // ===========================
  //        Scroll (web)

  const handleScrolling = (e: WheelEvent) => {
    if (isGamePlaying(playMode)) return false;

    // Hide the CTA
    if (height.value !== 0) {
      height.value = withTiming(0, { duration: 250, easing: Easing.inOut(Easing.ease) });
    }

    const scrolledVerticallyBy = e?.deltaY;

    const translateX = noteRollY.value - scrolledVerticallyBy;
    // Set the limit as the end of the song
    const translateEndLimit = getDistFromBars(getDurationInBars(songData) + countdownBars, songData.bpm) + 20;
    verbose && console.log('Scrolled!', scrolledVerticallyBy, translateX, noteRollY.value);

    // If we're in the boundaries
    if (translateX > 0 && translateX < translateEndLimit) {
      // We move the scene
      noteRollY.value = translateX;

      // Play the notes as we scroll
      const currentTimeInBars = getBarsFromDist(translateX, songData.bpm);
      verbose && console.log('Scrolling', currentTimeInBars, translateX);
      playNotesFromBars(currentTimeInBars);
    }

    return false;
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      verbose && console.log('Scrolling start', window);
      window.addEventListener('wheel', handleScrolling);

      return () => {
        if (Platform.OS === 'web') {
          verbose && console.log('Scrolling removed', window);
          window.removeEventListener('wheel', handleScrolling);
        }
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songData, playMode]);

  // ==============================
  //    CTAs

  const renderWebCTAs = () => (<Animated.View
    className="flex absolute bottom-[200px] w-full h-0 bg-neutral-950/70 overflow-hidden"
    style={{ height }}
  >
    { (playMode === 'start') ? <>
      <Text className="text-white text-lg text-center mt-5">Press Spacebar to start playing</Text>
      <Text className="text-neutral-400 text-regular text-center mb-5">Press Enter if you're feeling lazy. Or simply Scroll away.</Text>
    </> : <Text className="text-white text-lg text-center my-5">Press Spacebar or Enter to restart.</Text> }
  </Animated.View>);

  const renderMobileCTAs = () => (<Animated.View
    className="absolute bottom-[200px] left-0 w-full pb-10"
    style={{ height }}
  >
    <Pressable onPress={() => ((playMode === 'start') ? startGame('playing') : restart()) }>
      <LinearGradient
        colors={
          (playMode === 'start') ? ['#6A8AFF', '#8A6AFF', '#FF6AFF'] : ['#FF6AFF', '#8A6AFF', '#6A8AFF']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="content-center items-center rounded-lg py-5 px-10 mx-auto"
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
  </Animated.View>);

  const renderCTAs = () => (<>
    { (Platform.OS === 'web') ? renderWebCTAs() : renderMobileCTAs()}

    {/* Close icon on the top right */}
    <Link href="/" className="absolute top-3 left-3 py-3 px-5">
      <Text className="text-neutral-400 text-lg">&lt; Back</Text>
      {/* <Text className="text-neutral-200 font-medium text-3xl">x</Text> */}
    </Link>
  </>);

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
          <Canvas style={{ width: screenWidth, height: screenHeight, flex: 1, overflow: 'hidden' }}>
            <Group transform={[
              // Center the game
              { translateX: (screenWidth - gameWidth) / 2 },
              { translateY: (screenHeight - gameHeight) / 2 },
            ]}>
              <NoteRoll {...{
                playMode, keysState, songData, noteRollY,
              }} />
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
