import { memo, useEffect, useRef, useState } from 'react';
import { Canvas, Group } from '@shopify/react-native-skia';
import { Easing, Platform, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import PianoKeyboard from './PianoKeyboard';
import NoteRoll from './NoteRoll';
import {
  countdownBars,
  gameHeight,
  gameWidth,
  getBarsFromDist,
  getDistFromBars,
  getDurationInBars,
  getOnPressKeyboardGestureHandler,
  getSongBarCountWithCountdownPlusClosing,
  getTimeFromBars,
  isGamePlaying,
  screenHeight,
  screenWidth,
} from '../utils/utils';
import useKeyboard from '../hooks/useKeyboard';
import KeyboardAudio from './KeyboardAudio';
import { SongData } from '../utils/songs';
import BackingAudioManager from '@/components/BackingAudioManager';

const verbose = false;

export type PlayMode = 'stopped' | 'playing' | 'playback' | 'restart';

const PlayingUI = ({ songData }: { songData: SongData }) => {
  // ==============================
  //    Playing State

  const playingTimeout = useRef<NodeJS.Timeout>();

  const [playMode, setPlayMode] = useState<PlayMode>('stopped');
  const [userBpm, setUserBpm] = useState<number>(songData.bpm);
  const [trackVolumes, setTrackVolumes] = useState({
    instrumental: 1,
    clicks: 1,
  });

  // Function to handle track volume toggle
  const toggleTrackVolume = (track: 'instrumental' | 'clicks') => {
    setTrackVolumes((prev) => ({
      ...prev,
      [track]: prev[track] === 0 ? 1 : 0,
    }));
  };

  const restart = () => {
    setPlayMode('stopped');
    clearTimeout(playingTimeout.current);
  };

  const startGame = (startMode: 'playing' | 'playback') => {
    setPlayMode(startMode);

    // TEMP: Allow the user to restart the game after the animation
    playingTimeout.current = setTimeout(
      () => {
        setPlayMode('restart');
      },
      getTimeFromBars(
        songData && getSongBarCountWithCountdownPlusClosing(songData),
        songData?.bpm
      )
    );
  };

  // ==============================
  //    Keyboard Handler

  const { keysState, keyPressed, releaseLastKey, playNotesFromBars } =
    useKeyboard({
      keyboardType: 'laptop',
      playMode,
      startGame,
      restart,
      songData,
      userBpm,
    });

  // ==============================
  //    Animations

  // NoteRoll Animation
  const noteRollY = useSharedValue(0);
  useEffect(() => {
    if (isGamePlaying(playMode)) {
      const songBarCountWithCountdownPlusClosing =
        getSongBarCountWithCountdownPlusClosing(songData);
      noteRollY.value = withTiming(
        getDistFromBars(songBarCountWithCountdownPlusClosing, userBpm),
        {
          duration: getTimeFromBars(
            songBarCountWithCountdownPlusClosing,
            userBpm
          ),
          easing: Easing.linear,
        }
      );
    } else if (playMode === 'stopped') {
      noteRollY.value = withTiming(0, {
        duration: 500,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playMode, userBpm]);

  // CTA Animation
  const height = useSharedValue(0);

  useEffect(() => {
    if (playMode === 'stopped' && noteRollY.value === 0) {
      height.value = 0;
      height.value = withDelay(
        1000,
        withTiming(Platform.OS === 'web' ? 85 : 200, {
          duration: 250,
          easing: Easing.inOut(Easing.ease),
        })
      );
    }

    return () => {
      height.value = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songData.name]);

  // ===========================
  //        Scroll (web)

  const handleScrolling = (e: WheelEvent) => {
    if (isGamePlaying(playMode)) {
      return false;
    }

    // Hide the CTA
    if (height.value !== 0) {
      height.value = withTiming(0, {
        duration: 250,
        easing: Easing.inOut(Easing.ease),
      });
    }

    const scrolledVerticallyBy = e?.deltaY;

    const translateX = noteRollY.value - scrolledVerticallyBy;
    // Set the limit as the end of the song
    const translateEndLimit =
      getDistFromBars(getDurationInBars(songData) + countdownBars, userBpm) +
      20;
    verbose &&
      console.log(
        'Scrolled!',
        scrolledVerticallyBy,
        translateX,
        noteRollY.value
      );

    // If we're in the boundaries
    if (translateX > 0 && translateX < translateEndLimit) {
      // We move the scene
      noteRollY.value = translateX;

      // Play the notes as we scroll
      const currentTimeInBars = getBarsFromDist(translateX, userBpm);
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
  //    Skia Canvas

  if (songData) {
    return (
      <View className="flex-1">
        {/* Header */}

        {/* Piano sound */}
        <KeyboardAudio {...{ playMode, keysState, songData }} />

        {/* Backing tracks */}
        <BackingAudioManager
          {...{ playMode, userBpm, songData, trackVolumes }}
        />

        <GestureDetector
          gesture={getOnPressKeyboardGestureHandler(
            keyPressed,
            releaseLastKey
          )}>
          <Canvas
            style={{
              width: screenWidth,
              height: screenHeight,
              flex: 1,
              overflow: 'hidden',
            }}>
            <Group
              transform={[
                // Center the game
                { translateX: (screenWidth - gameWidth) / 2 },
                { translateY: (screenHeight - gameHeight) / 2 },
              ]}>
              <NoteRoll
                {...{
                  keysState,
                  songData,
                  noteRollY,
                }}
              />
              <PianoKeyboard keysState={keysState} songName={songData.name} />
            </Group>
          </Canvas>
        </GestureDetector>
      </View>
    );
  }

  // ==============================
  //    Invalid songData

  return (
    <View className="flex-1 bg-neutral-950 items-center justify-center">
      <Text className="text-lg font-bold text-white">
        Invalid ID. This song doesn't exist.
      </Text>

      <Link href="/" className="mt-4 py-4">
        <Text className="text-regular text-cyan-600 web:hover:text-cyan-500">
          Go to home screen
        </Text>
      </Link>
    </View>
  );
};

export default memo(PlayingUI);
