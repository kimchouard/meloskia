import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { accidentalNames, keyNames } from './PianoKeyboard';

const verbose = false;

export type KeysState = { [key:string]: true | false };
type KeyboardListener = (e: KeyboardEvent) => void;

const useKeyboard = ({
  keyboardType,
}:{
  keyboardType: 'laptop' | 'midi', // TODO: Add midi keyboard support
}) => {
  const initKeysState:KeysState = {
    ...keyNames.reduce((acc, key) => ({ ...acc, [key]: false }), {}),
    ...accidentalNames.reduce((acc, key) => (key !== '') && ({ ...acc, [key]: false }), {}),
  };
  const [keysState, setKeyState] = useState<KeysState>(initKeysState);

  const currentKeyboardListener = useRef<{ keydown: KeyboardListener, keyup: KeyboardListener }>();

  const onKey = (e: KeyboardEvent, keyDown: boolean) => {
    const letterName = e.key?.replace('Key', '').toUpperCase();
    // If the key is included in the keyNames array, then we can use it
    if (keyNames.includes(letterName) || accidentalNames.includes(letterName)) {
      e.preventDefault();

      if (keysState[letterName] === keyDown) return;

      verbose && console.log(`Key ${e.code} (${letterName}) changed to ${keyDown} with current keysState:`, keysState);
      setKeyState({ ...keysState, [letterName]: keyDown });
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
  }, [keysState]);

  return { keysState };
};

export default useKeyboard;
