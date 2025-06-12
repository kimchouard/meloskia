import React, { useEffect, useRef } from 'react';

import { NoteName } from '@/songs';
import { PlayerState } from '@/types';
import { useSongCanvasContext } from './SongCanvas/SongCanvasContext';
import { Piano } from '@/sounds';
import Logger from '@/utils/Logger';

const Log = Logger.spawn('KeyboardAudio', false);

interface KeyboardAudioProps {
  playMode: PlayerState;
  keysState: Record<NoteName, boolean>;
}

type ActiveNotes = Partial<Record<NoteName, Piano>>;

const KeyboardAudio: React.FC<KeyboardAudioProps> = (props) => {
  const { playMode, keysState } = props;

  const { audioContext } = useSongCanvasContext();
  const activeNotes = useRef<ActiveNotes>({});

  useEffect(() => {
    if (playMode === 'playback') {
      // If the playMode is playback, we don't need to do anything
      return;
    }

    Object.entries(keysState).forEach(([key, isActive]) => {
      // if the key is active, trigger its sound if necessary
      if (isActive) {
        // key is already playing, nothing to do
        if (activeNotes.current[key]) {
          Log.info('Key is already playing, nothing to do');
          return;
        }

        Log.info('Key is not playing, creating new note');
        activeNotes.current[key] = new Piano(
          audioContext,
          key as NoteName,
          audioContext.destination
        );

        activeNotes.current[key].start();
        return;
      }

      // if the key is not active, stop its sound if necessary
      if (activeNotes.current[key]) {
        Log.info('Key is active, stopping note');
        activeNotes.current[key].stop();
        delete activeNotes.current[key];
      }
    });
  }, [keysState, playMode, audioContext]);

  return null;
};

export default KeyboardAudio;
