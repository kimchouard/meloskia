import { SetStateAction, useEffect, useMemo } from 'react';
import { GainNode, AudioContext } from 'react-native-audio-api';

import { Piano } from '@/sounds';
import { PlayerState } from '@/types';
import { NoteName, Song, SongNote } from '@/songs';
import { getBarsFromTime, getTimeFromBars, countdownBars } from '@/utils/utils';
import { isPlaying, clicksForBeat } from '@/components/SongCanvas/utils';
import useLoadAssets, { AudioAsset } from './useLoadAssets';

interface PlaybackOptions {
  bpm: number;
  audioContext: AudioContext;

  setKeysState: (keysState: SetStateAction<Record<NoteName, boolean>>) => void;

  songDuration: number;
  state: PlayerState;
  metronome: 0 | 1 | 2 | 4;
  song: Song;
}

const scheduleAheadTime = 0.15;

export default function usePlayback(options: PlaybackOptions) {
  const { bpm, setKeysState, state, song, metronome, audioContext } = options;

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
  updateRemoteKeysState: (
    keysState: SetStateAction<Record<NoteName, boolean>>
  ) => void;
}

interface SimplifiedSource {
  stop: () => void;
}

class Player {
  private song: Song;
  private mainGain: GainNode;
  private synthGain: GainNode;
  private audioContext: AudioContext;

  private getAsset: (assetId: string) => AudioAsset;
  private updateRemoteKeysState: (
    keysState: SetStateAction<Record<NoteName, boolean>>
  ) => void;

  private startTime = 0;
  private scheduledTime = 0;

  private bpm = 120;
  private metronomeOption: 0 | 1 | 2 | 4 = 0;
  private playType: 'idle' | 'playback' | 'playing' = 'idle';

  private activeSources: SimplifiedSource[] = [];

  constructor(options: PlayerInitOptions) {
    this.song = options.song;
    this.audioContext = options.audioContext;
    this.getAsset = options.getAsset;
    this.updateRemoteKeysState = options.updateRemoteKeysState;
    this.mainGain = this.audioContext.createGain();
    this.mainGain.connect(this.audioContext.destination);
    this.synthGain = this.audioContext.createGain();

    this.synthGain.connect(this.mainGain);

    this.mainGain.gain.value = 1;
    this.synthGain.gain.value = 1;
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

    this.activeSources.push(sourceNode);

    if (stopTime) {
      sourceNode.stop(stopTime);
    }
  };

  scheduleSynth = (
    noteName: NoteName,
    startAtBeat: number,
    stopAtBeat: number
  ) => {
    const pianoSynth = new Piano(this.audioContext, noteName, this.synthGain);
    this.activeSources.push(pianoSynth);

    pianoSynth.start(
      getTimeFromBars(startAtBeat - 0.5, this.bpm) / 1000 + this.startTime
    );
    pianoSynth.stop(
      getTimeFromBars(stopAtBeat - 0.5, this.bpm) / 1000 + this.startTime
    );
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

    if (this.playType === 'playback' && note.type === 'i' && note.noteName) {
      this.updateRemoteKeysState((keysState) => ({
        ...keysState,
        [note.noteName]: true,
      }));
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

  scheduleSongNoteOff = (
    note: SongNote,
    lastBeat: number,
    aheadBeat: number
  ) => {
    if (note.type !== 'i' || !note.noteName) {
      return;
    }
    const noteStartBeat = note.startAt + countdownBars;
    const noteEndBeat = noteStartBeat + note.duration;

    if (noteEndBeat < lastBeat || noteEndBeat > aheadBeat) {
      return;
    }

    this.updateRemoteKeysState((keysState) => ({
      ...keysState,
      [note.noteName]: false,
    }));
  };

  scheduleSongNotes = (lastBeat: number, aheadBeat: number) => {
    this.song.voices.forEach((voice) => {
      voice.notes.forEach((note) =>
        this.scheduleSongNote(note, lastBeat, aheadBeat)
      );
    });
  };

  scheduleSongNotesOff = (lastBeat: number, aheadBeat: number) => {
    this.song.voices.forEach((voice) => {
      voice.notes.forEach((note) =>
        this.scheduleSongNoteOff(note, lastBeat, aheadBeat)
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
    this.scheduleSongNotesOff(lastBeat, aheadBeat);

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

    this.activeSources.forEach((source) => {
      source.stop();
    });

    this.activeSources = [];
  };

  setBpm = (bpm: number) => {
    this.bpm = bpm;
  };

  setMetronomeOption = (metronomeOption: 0 | 1 | 2 | 4) => {
    this.metronomeOption = metronomeOption;
  };
}
