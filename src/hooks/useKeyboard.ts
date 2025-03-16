import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import {
  accidentalNames,
  keyNames,
  noteToKeyboardKey,
} from '../components/PianoKeyboard';
import { PlayMode } from '../components/PlayingUI';
import { SongData } from '@/utils/songs';
import { countdownBars, getBarsFromTime } from '@/utils/utils';

const verbose = false;

export type KeysState = { [key: string]: true | false };
type KeyboardListener = (e: KeyboardEvent) => void;

const useKeyboard = ({
  keyboardType,
  playMode,
  songData,
  userBpm,
  startGame,
  restart,
}: {
  keyboardType: 'laptop' | 'midi'; // TODO: Add midi keyboard support
  playMode: PlayMode;
  songData?: SongData;
  userBpm?: number;
  startGame: (startMode: 'playing' | 'playback') => void;
  restart: () => void; // used for the escape key
}) => {
  // ==============================
  //      Keyboard State
  // ==============================

  const initKeysState: KeysState = {
    ...keyNames.reduce((acc, key) => ({ ...acc, [key]: false }), {}),
    ...accidentalNames.reduce(
      (acc, key) => key !== '' && { ...acc, [key]: false },
      {}
    ),
  };
  const [keysState, setKeysState] = useState<KeysState>(initKeysState);

  const keyPressedName = useRef<string>();

  const releaseLastKey = () => {
    const keyReleased = keyPressedName.current;
    keyPressedName.current = null;

    if (!keyReleased) return;

    verbose && console.log('Key released:', keyReleased, keysState);
    setKeysState((prev) => ({ ...prev, [keyReleased]: false }));
  };

  const releaseAllKeys = () => {
    verbose && console.log('Releasing all keys');
    setKeysState((prev) => {
      const newKeysState = { ...prev };
      Object.keys(newKeysState).forEach((key) => {
        newKeysState[key] = false;
      });

      keyPressedName.current = null;

      return newKeysState;
    });
  };

  const keyPressed = (
    keyName: string,
    shoudReleasePreviousKey: boolean = false
  ) => {
    if (shoudReleasePreviousKey) releaseLastKey();

    // If the key is the same as the last one, we skip the press
    if (keyName === keyPressedName.current) return;

    verbose && console.log('Changed key', keyName);
    keyPressedName.current = keyName;
    setKeysState((prev) => ({ ...prev, [keyName]: true }));
  };

  const keyRelease = (keyName: string) => {
    verbose && console.log('Key release', keyName);
    setKeysState((prev) => ({ ...prev, [keyName]: false }));
    keyPressedName.current = null;
  };

  const resartAndStopPlayingNotes = () => {
    releaseAllKeys();
    restart();
  };

  // ==============================
  //    Keyboard Listener
  // ==============================

  const currentKeyboardListener = useRef<{
    keydown: KeyboardListener;
    keyup: KeyboardListener;
  }>();

  const onKey = (e: KeyboardEvent, keyDown: boolean) => {
    verbose && console.log('onKey', e, keyDown);

    // Spacebar pressed (onKeyUp only, to avoid multiple restarts on key hold)
    if (e.code === 'Space' && !keyDown) {
      if (playMode === 'stopped') startGame('playing');
      else resartAndStopPlayingNotes();
    }

    // Spacebar pressed (onKeyUp only, to avoid multiple restarts on key hold)
    if (e.code === 'Enter' && !keyDown) {
      if (playMode === 'stopped') startGame('playback');
      else resartAndStopPlayingNotes();
    }

    // Restart on escape
    if (e.code === 'Escape' && !keyDown) {
      if (playMode !== 'stopped') resartAndStopPlayingNotes();
      else router.replace('/');
    }

    const letterName = e.key?.replace('Key', '').toUpperCase();
    // If the key is included in the keyNames array, then we can use it
    if (keyNames.includes(letterName) || accidentalNames.includes(letterName)) {
      // e.preventDefault();

      if (keysState[letterName] === keyDown) return;

      verbose &&
        console.log(
          `Key ${e.code} (${letterName}) changed to ${keyDown} with current keysState:`,
          keysState
        );
      setKeysState({ ...keysState, [letterName]: keyDown });
    }
  };

  const onKeyDown = (e: KeyboardEvent) => onKey(e, true);
  const onKeyUp = (e: KeyboardEvent) => onKey(e, false);

  const cleanListeners = () => {
    window.removeEventListener(
      'keydown',
      currentKeyboardListener.current?.keydown
    );
    window.removeEventListener('keyup', currentKeyboardListener.current?.keyup);
  };

  // Listeners need to be updated on each state change
  useEffect(() => {
    if (Platform.OS === 'web' && keyboardType === 'laptop') {
      verbose && console.log('(re)Setting keyboard listeners');
      // Remove prior listeners
      cleanListeners();

      // Create new listeners
      currentKeyboardListener.current = {
        keydown: onKeyDown,
        keyup: onKeyUp,
      };

      // Add new listener
      window.addEventListener(
        'keydown',
        currentKeyboardListener.current.keydown
      );
      window.addEventListener('keyup', currentKeyboardListener.current.keyup);

      return () => {
        cleanListeners();
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysState, playMode]);

  // ==============================
  //      Auto Play
  // ==============================

  const autoPlayFrameAnimationRequest = useRef<number>();
  const startedPlayingAt = useRef<number>();
  const currentPlayingNotes = useRef<number[]>([]);

  const stopAutoPlayLooper = () => {
    verbose && console.log('Stop frame animation!!');

    // Stop current animation frame
    cancelAnimationFrame(autoPlayFrameAnimationRequest.current);
    autoPlayFrameAnimationRequest.current = null;
    startedPlayingAt.current = null;
  };

  const playNotesFromBars = (currentTimeInBars: number) => {
    const perfStart = performance.now();

    // Get the notes (index) that are currently playing and needs to be stopped
    const notesToStop = currentPlayingNotes.current.filter((noteIndex) => {
      const note = songData.notes[noteIndex];
      const noteStart = note.startAtBar + countdownBars;
      const noteEnd = noteStart + note.durationInBars;
      // Check that the note is playing
      const noteIsPlaying = currentPlayingNotes.current.includes(
        songData.notes.indexOf(note)
      );

      // If we've finished the note or if the note should not play yet
      if (currentTimeInBars >= noteEnd || currentTimeInBars < noteStart) {
        // verbose && console.log(perfStart, 'STOP noteIsPlaying', noteIsPlaying);
        return noteIsPlaying;
      }

      // If the not is not playing anymore or shouldn't be stopped yet
      return false;
    });

    // Get the new notes that are should be playing but are not currently playing
    const newNotesToPlay = songData.notes.filter((note) => {
      const noteStart = note.startAtBar + countdownBars;
      const noteEnd = noteStart + note.durationInBars;

      if (currentTimeInBars >= noteStart && currentTimeInBars < noteEnd) {
        // Check that the note is not currently playing (unless it just has been stopped)
        const noteIsntPlaying = !currentPlayingNotes.current.includes(
          songData.notes.indexOf(note)
        );
        const noteJustStopped = notesToStop.includes(
          songData.notes.indexOf(note)
        );
        // verbose && console.log(perfStart, 'START noteIsntPlaying', noteIsntPlaying, 'noteJustStopped', noteJustStopped);
        return noteIsntPlaying || noteJustStopped;
      }

      // If the note is not playing or currently tagged as is, we return false
      return false;
    });

    // Stop the notes that are no longer playing
    notesToStop.forEach((noteIndex) => {
      const note = songData.notes[noteIndex];
      const keyboardKey = noteToKeyboardKey[note.noteName];

      verbose &&
        console.log(
          perfStart,
          `Stopping note at index ${noteIndex}:`,
          note,
          keyboardKey
        );
      keyRelease(keyboardKey);
    });

    // Start the notes that are now playing
    newNotesToPlay.forEach((note) => {
      const keyboardKey = noteToKeyboardKey[note.noteName];

      verbose && console.log(perfStart, 'Starting note:', note, keyboardKey);
      keyPressed(keyboardKey);
    });

    // If we need the update the currentPlayingNotes array
    if (newNotesToPlay.length > 0 || notesToStop.length > 0) {
      verbose &&
        console.log(perfStart, 'Updating notes', newNotesToPlay, notesToStop);
      // Update the currentPlayingNotes
      currentPlayingNotes.current = [
        ...currentPlayingNotes.current.filter(
          (noteIndex) => !notesToStop.includes(noteIndex)
        ),
        ...newNotesToPlay.map((note) => songData.notes.indexOf(note)),
      ];
    }

    // Calculate the time it took to process the frame
    const perfEnd = performance.now();
    const perfDuration = perfEnd - perfStart;
    verbose && console.log('Evaluated frame in (ms):', perfDuration);
  };

  // Check if there is are notes that needs to be started or stopped
  const autoPlayLooper = () => {
    if (!startedPlayingAt.current) startedPlayingAt.current = Date.now();

    if (songData?.notes) {
      const currentTimeInMs = Date.now() - startedPlayingAt.current;
      const currentTimeInBars = getBarsFromTime(currentTimeInMs, userBpm);

      playNotesFromBars(currentTimeInBars);
    } else {
      console.error('No songData.notes');
      return stopAutoPlayLooper();
    }

    // Looping on next animation frame
    if (playMode === 'playback') {
      autoPlayFrameAnimationRequest.current =
        requestAnimationFrame(autoPlayLooper);
    }
  };

  useEffect(() => {
    if (playMode === 'playback') {
      // Use animationFrames to detect when to play the next note
      autoPlayFrameAnimationRequest.current =
        requestAnimationFrame(autoPlayLooper);
    } else {
      // We stop the frame calculations
      stopAutoPlayLooper();
    }

    // Stop the frame calculations on unmounting
    return () => {
      stopAutoPlayLooper();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playMode]);

  // ==============================
  //    Export

  return {
    // Keyboard state
    keysState,
    keyPressed,
    keyRelease,
    releaseLastKey,
    releaseAllKeys,
    playNotesFromBars,
  };
};

export default useKeyboard;
