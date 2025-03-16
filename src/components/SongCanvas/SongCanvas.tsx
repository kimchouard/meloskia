import { Platform, Text } from 'react-native';
import { Canvas, Group } from '@shopify/react-native-skia';
import { memo, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  clamp,
  Easing,
  withTiming,
  useSharedValue,
  useDerivedValue,
} from 'react-native-reanimated';
import { GainNode, AudioContext } from 'react-native-audio-api';

import { AssetNote, InstrumentNote, Song } from '@/songs';

import NoteRoll from '../NoteRoll';

import { PlayerState, SongCanvasContextType } from './types';
import { SongCanvasContext } from './SongCanvasContext';
import useLoadAssets from './useAudioPlayback/useLoadAssets';
import SongNotFound from './SongNotFound';
import CanvasHeader from './CanvasHeader';
import CanvasCTA from './CanvasCTA';
import { isPlaying, noteToFrequency } from './utils';
import {
  gameWidth,
  gameHeight,
  screenWidth,
  screenHeight,
  getDistFromBars,
  getTimeFromBars,
  getSongBarCountWithCountdownPlusClosing,
  getBarsFromTime,
  countdownBars,
} from '@/utils/utils';

interface SongCanvasProps {
  song?: Song;
}

interface Audio {
  aCtx: AudioContext;
  outputs: {
    piano: GainNode;
    metronome: GainNode;
    backingTrack: GainNode;
  };
}

function createAudio(): Audio {
  const aCtx = new AudioContext();
  const pianoOutput = aCtx.createGain();
  const metronomeOutput = aCtx.createGain();
  const backingTrackOutput = aCtx.createGain();

  pianoOutput.connect(aCtx.destination);
  metronomeOutput.connect(aCtx.destination);
  backingTrackOutput.connect(aCtx.destination);

  backingTrackOutput.gain.value = 0.6;
  metronomeOutput.gain.value = 1;
  pianoOutput.gain.value = 0.3;

  return {
    aCtx,
    outputs: {
      piano: pianoOutput,
      metronome: metronomeOutput,
      backingTrack: backingTrackOutput,
    },
  };
}

const SongCanvas: React.FC<SongCanvasProps> = ({ song }) => {
  const [state, setState] = useState<PlayerState>('stopped');
  const [bpm, setBpm] = useState<number>(song?.baseBpm ?? 120);
  const [metronome, setMetronome] = useState<0 | 1 | 2 | 4>(0);
  const currentBeatSV = useSharedValue(0);

  const audio = useMemo(() => createAudio(), []);
  const resetTimeoutRef = useRef<NodeJS.Timeout>();
  const isPlayingRef = useRef(false);
  const bpmRef = useRef(bpm);
  const metronomeRef = useRef(metronome);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    metronomeRef.current = metronome;
  }, [metronome]);

  useEffect(() => {
    isPlayingRef.current = isPlaying(state);
  }, [state]);

  const assets = useLoadAssets(audio.aCtx, song?.assets ?? []);

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

  const noteRollY = useDerivedValue(
    () => (currentBeatSV.value / songBeatCount) * songDistance
  );

  const startGame = useCallback(
    (startMode: 'playing' | 'playback') => {
      setState(startMode);

      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }

      resetTimeoutRef.current = setTimeout(() => {
        setState('stopped');
        currentBeatSV.value = withTiming(0, { duration: 500 });
      }, songDuration);
    },
    [songDuration, currentBeatSV]
  );

  const restartGame = useCallback(() => {
    setState('stopped');
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (state === 'stopped') {
      currentBeatSV.value = withTiming(0, { duration: 500 });
      return;
    }

    if (!isPlaying(state)) {
      return;
    }

    currentBeatSV.value = withTiming(songDistance, {
      duration: songDuration,
      easing: Easing.linear,
    });
  }, [state, songDistance, songDuration, currentBeatSV]);

  const stableContext = useMemo<SongCanvasContextType>(
    () => ({
      song,
      bpm,
      state,
      audio,
      metronome,
      noteRollY,
      isLoading: false,
      setBpm,
      startGame,
      restartGame,
      setMetronome,
    }),
    [
      bpm,
      song,
      state,
      audio,
      noteRollY,
      metronome,
      startGame,
      restartGame,
      setMetronome,
    ]
  );

  const handleScrolling = (e: WheelEvent) => {
    if (isPlaying(state)) {
      return false;
    }
    const scrolledVerticallyBy = e?.deltaY;
    const translateX = noteRollY.value - scrolledVerticallyBy;
    currentBeatSV.value = clamp(
      (translateX / songDistance) * songBeatCount,
      0,
      songBeatCount
    );

    return false;
  };

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
  }, [song, state]);

  useEffect(() => {
    let startTime = audio.aCtx.currentTime;
    let lastTickCount = 0;

    async function scheduleMetronome(currentBeat: number, deltaBeat: number) {
      const highClick = assets.getAsset('metronome-01');
      const lowClick = assets.getAsset('metronome-02');

      if (metronomeRef.current === 0) {
        return;
      }

      const nextClickBeat = Math.floor(currentBeat) + 1;

      if (
        nextClickBeat < currentBeat ||
        nextClickBeat > currentBeat + deltaBeat
      ) {
        return;
      }

      const beatInBar = nextClickBeat % 4;

      if (beatInBar % (4 / metronomeRef.current) !== 0) {
        return;
      }

      const source = await audio.aCtx.createBufferSource();
      source.buffer =
        beatInBar === 0 ? highClick.audioBuffer : lowClick.audioBuffer;
      source.connect(audio.outputs.metronome);
      source.start(
        startTime +
          getTimeFromBars(nextClickBeat - currentBeat, bpmRef.current, {
            roundValue: false,
          }) /
            1000
      );
    }

    async function scheduleAssetNote(note: AssetNote) {
      const asset = assets.getAsset(note.assetId);
      const buffer = asset.audioBuffer;
      const source = await audio.aCtx.createBufferSource({
        pitchCorrection: true,
      });

      const noteStartTime = startTime + (note.startAt * 60) / bpmRef.current;
      source.buffer = buffer;
      source.connect(audio.outputs.backingTrack);
      source.playbackRate.value = bpmRef.current / song.baseBpm;
      source.start(noteStartTime);
    }

    async function scheduleInstrumentNote(note: InstrumentNote) {
      const asset = note.assetId ? assets.getAsset(note.assetId) : null;

      if (!asset) {
        const noteStartTime =
          startTime + ((note.startAt + countdownBars) * 60) / bpmRef.current;
        const noteEndTime =
          noteStartTime + getTimeFromBars(note.duration, bpmRef.current) / 1000;

        // const envelope = audio.aCtx.createGain();
        // envelope.connect(audio.outputs.piano);
        // envelope.gain.value = 0;
        // envelope.gain.setValueAtTime(1, noteStartTime, 0.1);
        // envelope.gain.setValueAtTime(0, endTime, 0.2);

        // const oscillator = audio.aCtx.createOscillator();
        // oscillator.connect(envelope);

        // const vibrato = audio.aCtx.createGain();
        // vibrato.gain.value = 30;

        // const lfo = audio.aCtx.createOscillator();
        // lfo.connect(vibrato);
        // lfo.frequency.value = 5;

        // oscillator.type = 'sawtooth';
        // // oscillator.detune.value =
        // vibrato.connect(oscillator.detune);

        // oscillator.start(noteStartTime);
        // oscillator.stop(endTime + 0.2);

        // lfo.start(noteStartTime);
        // lfo.stop(endTime + 0.2);

        const oscillator = audio.aCtx.createOscillator();
        oscillator.frequency.value = noteToFrequency(note.noteName);
        oscillator.type = 'sawtooth';
        oscillator.connect(audio.outputs.piano);
        oscillator.start(noteStartTime);
        oscillator.stop(noteEndTime);
        return;
      }
    }

    function playerLoop() {
      if (!isPlayingRef.current) {
        return;
      }

      const tNow = audio.aCtx.currentTime;
      const timeFromStart = tNow - startTime;
      currentBeatSV.value = getBarsFromTime(
        timeFromStart * 1000,
        bpmRef.current
      );

      const deltaTime = tNow - lastTickCount;
      const deltaBeat = getBarsFromTime(deltaTime * 1000, bpmRef.current);

      scheduleMetronome(currentBeatSV.value, deltaBeat);

      song.voices.forEach((voice) => {
        voice.notes.forEach((note) => {
          const startAt = note.startAt;

          if (
            startAt <= currentBeatSV.value ||
            startAt >= currentBeatSV.value + deltaBeat
          ) {
            return;
          }

          if (note.type === 'a') {
            scheduleAssetNote(note);
          } else {
            scheduleInstrumentNote(note);
          }
        });
      });

      document.getElementById('counter')!.innerText = (
        Math.floor(currentBeatSV.value) + 1
      ).toString();

      lastTickCount = tNow;
      setTimeout(playerLoop, 20);
    }

    if (isPlaying(state) && !assets.isLoading) {
      lastTickCount = audio.aCtx.currentTime;
      startTime = lastTickCount + 0.1;
      playerLoop();
    }
  }, [song, state, audio, assets, currentBeatSV]);

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
          <NoteRoll keysState={{}} song={song} noteRollY={noteRollY} />
        </Group>
      </Canvas>
      {!isPlaying(state) && <CanvasCTA />}
    </SongCanvasContext.Provider>
  );
};

export default memo(SongCanvas);
