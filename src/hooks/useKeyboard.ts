import { router } from 'expo-router';
import { Platform } from 'react-native';
import { SetStateAction, useCallback, useEffect } from 'react';

import { getInitialKeyStates } from '@/components/SongCanvas/utils';
import { accidentalNames, keyboardKeyToNote, keyNames } from '@/constants';
import { KeysState, PlayerState } from '@/types';
import Logger from '@/utils/Logger';

interface UseKeyboardOptions {
  keyboardType: 'laptop' | 'midi'; // TODO: Add midi keyboard support
  startGame: (state: 'playing' | 'playback') => void;
  restartGame: () => void;
  keysState: KeysState;
  state: PlayerState;
  setKeysState: (setState: SetStateAction<KeysState>) => void;
}

const Log = Logger.spawn('UseKeyboard', true);

export default function useKeyboard(options: UseKeyboardOptions) {
  const {
    state,
    keysState,
    keyboardType,
    startGame,
    restartGame,
    setKeysState,
  } = options;

  const restartAndReleaseKeys = useCallback(() => {
    restartGame();
    setKeysState(getInitialKeyStates());
  }, [restartGame, setKeysState]);

  const toggleStartGame = useCallback(
    (newState: 'playing' | 'playback') => {
      if (state === 'stopped') {
        startGame(newState);
      } else {
        restartAndReleaseKeys();
      }
    },
    [restartAndReleaseKeys, startGame, state]
  );

  const onKey = useCallback(
    (event: KeyboardEvent, isDown: boolean) => {
      // Space-bar pressed (onKeyUp only, to prevent multiple starts on key hold)
      if (event.code === 'Space' && !isDown) {
        toggleStartGame('playing');
        return;
      }

      // Enter/Return pressed (onKeyUp only, to prevent multiple starts on key hold)
      if (event.code === 'Enter' && !isDown) {
        toggleStartGame('playback');
        return;
      }

      // Escape pressed (onKeyUp only, to prevent multiple starts on key hold)
      if (event.code === 'Escape' && !isDown) {
        if (state !== 'stopped') {
          restartAndReleaseKeys();
        } else {
          router.replace('/');
        }

        return;
      }

      const letterName = event.key?.replace('Key', '').toUpperCase();

      if (
        !keyNames.includes(letterName) &&
        !accidentalNames.includes(letterName)
      ) {
        return;
      }

      if (keysState[letterName] === isDown) {
        return;
      }

      Log.info(`Key ${event.code} (${letterName}) changed to ${isDown}`);
      setKeysState((prevState) => ({
        ...prevState,
        [keyboardKeyToNote[letterName]]: isDown,
      }));
    },
    [toggleStartGame, restartAndReleaseKeys, setKeysState, keysState, state]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      onKey(event, true);
    },
    [onKey]
  );

  const onKeyUp = useCallback(
    (event: KeyboardEvent) => {
      onKey(event, false);
    },
    [onKey]
  );

  useEffect(() => {
    if (Platform.OS !== 'web' || keyboardType === 'midi') {
      return () => {};
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [keyboardType, onKeyDown, onKeyUp]);
}
