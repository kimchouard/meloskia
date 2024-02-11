import { Song, Track, Instrument } from 'reactronica';
import { useEffect, useState } from 'react';
import { KeysState } from './useKeyboard';
import { keyboardKeyToNote } from './PianoKeyboard';

const KeyboardAudio = ({
  keysState,
  isPlaying,
}:{
  keysState: KeysState,
  isPlaying: boolean,
}) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    // Convert the keysState to an array of notes
    const newNotes = Object.keys(keysState).filter((key) => keysState[key])
      // Convert the key name to a note
      .map((key) => ({
        name: keyboardKeyToNote[key],
      }));

    setNotes(newNotes);
  }, [keysState]);

  return (
    <>

      <Song isPlaying={isPlaying}>
        <Track>
          <Instrument
            type="synth"
            notes={notes}
          />
        </Track>
      </Song>
    </>
  );
};

export default KeyboardAudio;
