import { useEffect, useMemo } from 'react';
import { AudioContext, GainNode } from 'react-native-audio-api';

import { NoteName, Song, SongNote } from '@/songs';

import useLoadAssets, { AudioAsset } from './useLoadAssets';
import { PlayerState } from './types';
import {
  isPlaying,
  clicksForBeat,
  noteToFrequency,
  getInitialKeyStates,
} from './utils';
import { getBarsFromTime, getTimeFromBars, countdownBars } from '@/utils/utils';

interface PlaybackOptions {
  bpm: number;

  keysState: Record<NoteName, boolean>;
  setKeysState: (keysState: Record<NoteName, boolean>) => void;

  songDuration: number;
  state: PlayerState;
  metronome: 0 | 1 | 2 | 4;
  song: Song;
}

const scheduleAheadTime = 0.15;

export default function usePlayback(options: PlaybackOptions) {
  const { bpm, keysState, setKeysState, state, song, metronome } = options;

  const audioContext = useMemo(() => new AudioContext(), []);
  const assets = useLoadAssets(audioContext, song.assets);

  const player = useMemo(
    () =>
      new Player({
        song,
        audioContext,
        getAsset: assets.getAsset,
        updateRemoteKeysState: setKeysState,
      }),
    [song, audioContext, assets, setKeysState]
  );

  useEffect(() => {
    player.setBpm(bpm);
  }, [player, bpm]);

  useEffect(() => {
    player.setKeysState(keysState);
  }, [player, keysState]);

  useEffect(() => {
    player.setMetronomeOption(metronome);
  }, [player, metronome]);

  useEffect(() => {
    if (isPlaying(state) && !assets.isLoading) {
      player.start(state);
    } else {
      player.stop();
    }

    return () => {
      player.stop();
    };
  }, [state, player, assets]);
}

interface PlayerInitOptions {
  song: Song;
  audioContext: AudioContext;
  getAsset: (assetId: string) => AudioAsset;
  updateRemoteKeysState: (keysState: Record<NoteName, boolean>) => void;
}

class Player {
  private song: Song;
  private mainGain: GainNode;
  private synthGain: GainNode;
  private audioContext: AudioContext;

  private getAsset: (assetId: string) => AudioAsset;
  private updateRemoteKeysState: (keysState: Record<NoteName, boolean>) => void;

  private startTime = 0;
  private scheduledTime = 0;

  private bpm = 120;
  private metronomeOption: 0 | 1 | 2 | 4 = 0;
  private playType: 'idle' | 'playback' | 'playing' = 'idle';
  private keysState: Record<NoteName, boolean>;

  constructor(options: PlayerInitOptions) {
    this.song = options.song;
    this.audioContext = options.audioContext;
    this.getAsset = options.getAsset;
    this.keysState = getInitialKeyStates();
    this.updateRemoteKeysState = options.updateRemoteKeysState;
    this.mainGain = this.audioContext.createGain();
    this.mainGain.connect(this.audioContext.destination);
    this.synthGain = this.audioContext.createGain();

    this.synthGain.connect(this.mainGain);

    this.mainGain.gain.value = 1;
    this.synthGain.gain.value = 0.8;
  }

  scheduleSourceNode = async (
    assetId: string,
    startAtBeat: number,
    stopAtBeat?: number,
    timeStretch?: boolean
  ) => {
    const startTime =
      getTimeFromBars(startAtBeat, this.bpm) / 1000 + this.startTime;
    const stopTime = stopAtBeat
      ? getTimeFromBars(stopAtBeat, this.bpm) / 1000 + this.startTime
      : undefined;

    const asset = this.getAsset(assetId);

    const sourceNode = await this.audioContext.createBufferSource({
      pitchCorrection: timeStretch,
    });
    sourceNode.buffer = asset.audioBuffer;

    if (timeStretch) {
      sourceNode.playbackRate.value = this.bpm / this.song.baseBpm;
    }

    sourceNode.connect(this.mainGain);
    sourceNode.start(startTime);

    if (stopTime) {
      sourceNode.stop(stopTime);
    }
  };

  scheduleSynth = (
    noteName: NoteName,
    startAtBeat: number,
    stopAtBeat: number
  ) => {
    const frequency = noteToFrequency(noteName);
    const oscillator = this.audioContext.createOscillator();
    const envelope = this.audioContext.createGain();
    const lowPass = this.audioContext.createBiquadFilter();

    oscillator.frequency.value = frequency;
    oscillator.type = 'triangle';

    lowPass.type = 'lowpass';
    lowPass.frequency.value = 800;
    lowPass.Q.value = 15;

    oscillator.connect(lowPass);
    lowPass.connect(envelope);
    envelope.connect(this.synthGain);

    const startTime =
      getTimeFromBars(startAtBeat, this.bpm) / 1000 + this.startTime;
    const stopTime =
      getTimeFromBars(stopAtBeat, this.bpm) / 1000 + this.startTime;

    envelope.gain.setValueAtTime(0, startTime);
    envelope.gain.linearRampToValueAtTime(1, startTime + 0.03);
    envelope.gain.linearRampToValueAtTime(0.5, startTime + 0.2);
    envelope.gain.setValueAtTime(0.5, stopTime - 0.2);
    envelope.gain.linearRampToValueAtTime(0, stopTime);

    oscillator.start(startTime);
    oscillator.stop(stopTime);
  };

  getMetronomeBeats = (beatStart: number, beatEnd: number) => {
    const metronomeBeats = [];

    const start = Math.floor(beatStart);
    const end = Math.ceil(beatEnd);

    for (let i = start; i < end; i += 1) {
      if (
        this.metronomeOption !== 0 &&
        clicksForBeat(i, this.metronomeOption)
      ) {
        metronomeBeats.push(i);
      }
    }

    return metronomeBeats;
  };

  scheduleMetronome = (
    lastBeat: number,
    currentBeat: number,
    aheadBeat: number
  ) => {
    if (this.metronomeOption === 0) {
      return;
    }

    const metronomeBeats = this.getMetronomeBeats(currentBeat, aheadBeat);

    metronomeBeats.forEach((beat) => {
      if (beat < lastBeat || beat > aheadBeat) {
        return;
      }

      const beatInBar = beat % 4;

      this.scheduleSourceNode(
        beatInBar === 0 ? 'metronome-01' : 'metronome-02',
        beat
      );
    });
  };

  scheduleSongNote = (note: SongNote, lastBeat: number, aheadBeat: number) => {
    const noteStartBeat =
      note.startAt + (note.type === 'i' ? countdownBars : 0);

    if (noteStartBeat < lastBeat || noteStartBeat > aheadBeat) {
      return;
    }

    if (note.type === 'a') {
      this.scheduleSourceNode(note.assetId, noteStartBeat, undefined, true);
      return;
    }

    const noteEndBeat = noteStartBeat + note.duration;

    if (this.playType === 'playing') {
      return;
    }

    if (note.assetId) {
      this.scheduleSourceNode(note.assetId, noteStartBeat, noteEndBeat, false);
      return;
    }

    this.scheduleSynth(note.noteName, noteStartBeat, noteEndBeat);
  };

  scheduleSongNotes = (lastBeat: number, aheadBeat: number) => {
    this.song.voices.forEach((voice) => {
      voice.notes.forEach((note) =>
        this.scheduleSongNote(note, lastBeat, aheadBeat)
      );
    });
  };

  playerLoop = () => {
    if (this.playType === 'idle') {
      return;
    }

    const tNow = this.audioContext.currentTime;
    const timeFromStart = tNow - this.startTime;

    const lastBeat = getBarsFromTime(
      (this.scheduledTime - this.startTime) * 1000,
      this.bpm
    );

    const currentBeat = getBarsFromTime(timeFromStart * 1000, this.bpm);
    const aheadBeat = getBarsFromTime(
      (timeFromStart + scheduleAheadTime) * 1000,
      this.bpm
    );

    this.scheduleMetronome(lastBeat, currentBeat, aheadBeat);
    this.scheduleSongNotes(lastBeat, aheadBeat);

    this.scheduledTime = tNow + scheduleAheadTime;
    this.requestNextLoop();
  };

  requestNextLoop = () => {
    requestAnimationFrame(this.playerLoop);
  };

  start = (type: 'playback' | 'playing') => {
    this.scheduledTime = this.audioContext.currentTime;
    this.startTime = this.scheduledTime;
    this.playType = type;

    this.requestNextLoop();
  };

  stop = () => {
    this.playType = 'idle';
  };

  setBpm = (bpm: number) => {
    this.bpm = bpm;
  };

  setMetronomeOption = (metronomeOption: 0 | 1 | 2 | 4) => {
    this.metronomeOption = metronomeOption;
  };

  setKeysState = (keysState: Record<NoteName, boolean>) => {
    this.keysState = keysState;
  };
}
