import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { accidentalNames, keyNames } from './PianoKeyboard';
import {
  countdownBars,
  gameHeight, gameWidth, getTimeFromBars, pianoKeyboardHeight, screenWidth,
} from './utils';
import { SongData } from './PlayingUI';

const verbose = false;

export type KeysState = { [key:string]: true | false };
type KeyboardListener = (e: KeyboardEvent) => void;

export type PlayMode = 'start' | 'playing' | 'playback' | 'restart';

const useKeyboard = ({
  keyboardType,
  songData,
}:{
  keyboardType: 'laptop' | 'midi', // TODO: Add midi keyboard support
  songData: SongData,
}) => {
  // ==============================
  //    Playing State
  // ==============================

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
    }, getTimeFromBars(songData.durationInBars + countdownBars, songData.bpm));
  };

  // ==============================
  //    Keyboard State
  // ==============================

  const initKeysState:KeysState = {
    ...keyNames.reduce((acc, key) => ({ ...acc, [key]: false }), {}),
    ...accidentalNames.reduce((acc, key) => (key !== '') && ({ ...acc, [key]: false }), {}),
  };
  const [keysState, setKeysState] = useState<KeysState>(initKeysState);

  const currentKeyboardListener = useRef<{ keydown: KeyboardListener, keyup: KeyboardListener }>();

  const onKey = (e: KeyboardEvent, keyDown: boolean) => {
    verbose && console.log('onKey', e, keyDown);

    // Spacebar pressed (onKeyUp only, to avoid multiple restarts on key hold)
    if (e.code === 'Space' && !keyDown) {
      if (playMode === 'start') startGame('playing');
      else restart();
    }

    // Spacebar pressed (onKeyUp only, to avoid multiple restarts on key hold)
    if (e.code === 'Enter' && !keyDown) {
      if (playMode === 'start') startGame('playback');
    }

    const letterName = e.key?.replace('Key', '').toUpperCase();
    // If the key is included in the keyNames array, then we can use it
    if (keyNames.includes(letterName) || accidentalNames.includes(letterName)) {
      e.preventDefault();

      if (keysState[letterName] === keyDown) return;

      verbose && console.log(`Key ${e.code} (${letterName}) changed to ${keyDown} with current keysState:`, keysState);
      setKeysState({ ...keysState, [letterName]: keyDown });
    }
  };

  const onKeyDown = (e: KeyboardEvent) => onKey(e, true);
  const onKeyUp = (e: KeyboardEvent) => onKey(e, false);

  const cleanListeners = () => {
    window.removeEventListener('keydown', currentKeyboardListener.current?.keydown);
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
      window.addEventListener('keydown', currentKeyboardListener.current.keydown);
      window.addEventListener('keyup', currentKeyboardListener.current.keyup);

      return () => {
        cleanListeners();
      };
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysState, playMode]);

  // ==============================
  //      Keyboard Gesture
  // ==============================

  const keyPressedName = useRef<string>();

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

  const releaseLastKey = () => {
    const keyReleased = keyPressedName.current;
    keyPressedName.current = null;

    verbose && console.log('Key released:', keyReleased, keysState);
    setKeysState((prev) => ({ ...prev, [keyReleased]: false }));
  };

  const keyPressed = (keyName: string) => {
    keyPressedName.current = keyName;
    setKeysState((prev) => ({ ...prev, [keyName]: true }));
  };

  const onPressKeyboard = Gesture.Pan().minDistance(0)
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
        // If the key is the same as the last one
        if (keyName === keyPressedName.current) return;

        verbose && console.log('Changed key', keyName, e);
        releaseLastKey();
        keyPressed(keyName);

      // If we've left the keyboard area
      } else {
        releaseLastKey();
      }
    })
    .onEnd(() => {
      releaseLastKey();
    });

  // ==============================
  //    Export

  return {
    // Playing state
    playMode,
    restart,
    startGame,
    // Keyboard state
    keysState,
    onPressKeyboard,
  };
};

export default useKeyboard;
