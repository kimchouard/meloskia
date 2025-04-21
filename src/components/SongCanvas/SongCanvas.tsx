import { Platform, Text } from 'react-native';
import { Canvas, Group } from '@shopify/react-native-skia';
import { memo, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  clamp,
  Easing,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

import { PlayerState } from '@/types';
import { NoteName, Song } from '@/songs';
import {
  gameWidth,
  gameHeight,
  screenWidth,
  screenHeight,
  getDistFromBars,
  getTimeFromBars,
  getSongBarCountWithCountdownPlusClosing,
} from '@/utils/utils';
import useKeyboard from '@/hooks/useKeyboard';
import usePlayback from '@/hooks/usePlayback';

import NoteRoll from '../NoteRoll';
import PianoKeyboard from '../PianoKeyboard';

import { SongCanvasContextType } from './types';
import { isPlaying, getInitialKeyStates } from './utils';
import { SongCanvasContext } from './SongCanvasContext';
import SongNotFound from './SongNotFound';
import CanvasHeader from './CanvasHeader';
import CanvasCTA from './CanvasCTA';

interface SongCanvasProps {
  song?: Song;
}

const SongCanvas: React.FC<SongCanvasProps> = ({ song }) => {
  const [state, setState] = useState<PlayerState>('stopped');
  const [bpm, setBpm] = useState<number>(song?.baseBpm ?? 120);
  const [metronome, setMetronome] = useState<0 | 1 | 2 | 4>(0);
  const [keysState, setKeysState] = useState<Record<NoteName, boolean>>(
    getInitialKeyStates()
  );

  const noteRollY = useSharedValue(0);
  const resetTimeoutRef = useRef<NodeJS.Timeout>();

  const songBeatCount = useMemo(
    () => getSongBarCountWithCountdownPlusClosing(song),
    [song]
  );

  const songDuration = useMemo(
    () => getTimeFromBars(songBeatCount, bpm),
    [songBeatCount, bpm]
  );

  const songDistance = useMemo(
    () => getDistFromBars(songBeatCount, bpm),
    [songBeatCount, bpm]
  );

  const startGame = useCallback(
    (startMode: 'playing' | 'playback') => {
      setState(startMode);

      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }

      noteRollY.value = withTiming(songDistance, {
        duration: songDuration,
        easing: Easing.linear,
      });

      resetTimeoutRef.current = setTimeout(() => {
        setState('stopped');
        noteRollY.value = withTiming(0, { duration: 500 });
      }, songDuration);
    },
    [noteRollY, songDuration, songDistance]
  );

  const restartGame = useCallback(() => {
    setState('stopped');
    noteRollY.value = withTiming(0, { duration: 500 });

    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = undefined;
    }
  }, [noteRollY]);

  const handleScrolling = useCallback(
    (e: WheelEvent) => {
      if (isPlaying(state)) {
        return false;
      }
      const scrolledVerticallyBy = e?.deltaY;
      const translateX = noteRollY.value - scrolledVerticallyBy;

      noteRollY.value = clamp(translateX, 0, songDistance);
      return false;
    },
    [noteRollY, songDistance, state]
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      window.addEventListener('wheel', handleScrolling);

      return () => {
        if (Platform.OS === 'web') {
          window.removeEventListener('wheel', handleScrolling);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song, state, handleScrolling]);

  const stableContext = useMemo<SongCanvasContextType>(
    () => ({
      song,

      bpm,
      setBpm,

      metronome,
      setMetronome,

      state,
      isLoading: false,

      noteRollY,

      startGame,
      restartGame,
    }),
    [
      bpm,
      song,
      state,
      noteRollY,
      metronome,
      startGame,
      restartGame,
      setMetronome,
    ]
  );

  usePlayback({
    bpm,
    song,
    state,
    keysState,
    metronome,
    songDuration,
    setKeysState,
  });

  useKeyboard({
    state,
    keysState,
    keyboardType: 'laptop',

    startGame,
    restartGame,
    setKeysState,
  });

  if (!song) {
    return <SongNotFound />;
  }

  return (
    <SongCanvasContext.Provider value={stableContext}>
      <CanvasHeader />
      <Text
        id="counter"
        className="text-white text-sm absolute z-100 top-50vh left-10"></Text>
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
          <NoteRoll keysState={keysState} song={song} noteRollY={noteRollY} />
          <PianoKeyboard
            keysState={keysState}
            songName={song.name}
            showNoteNames
          />
        </Group>
      </Canvas>
      {!isPlaying(state) && <CanvasCTA />}
    </SongCanvasContext.Provider>
  );
};

export default memo(SongCanvas);
