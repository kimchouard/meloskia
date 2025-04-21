import { router } from 'expo-router';
import { Platform } from 'react-native';
import { useCallback, useEffect } from 'react';

// import { accidentalNames, keyNames, noteToKeyboardKey } from '@/constants';
import { getInitialKeyStates } from '@/components/SongCanvas/utils';
import { KeysState, PlayerState } from '@/types';

interface UseKeyboardOptions {
  keyboardType: 'laptop' | 'midi'; // TODO: Add midi keyboard support
  startGame: (state: 'playing' | 'playback') => void;
  restartGame: () => void;
  keysState: KeysState;
  state: PlayerState;
  setKeysState: (keysState: KeysState) => void;
}

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
      }
    },
    [toggleStartGame, restartAndReleaseKeys, state]
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
