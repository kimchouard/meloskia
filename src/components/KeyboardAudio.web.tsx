import { Song, Track, Instrument } from 'reactronica';
import { useEffect, useState } from 'react';
import { KeysState } from '../hooks/useKeyboard';
import { keyboardKeyToNote } from './PianoKeyboard';
import { PlayMode } from './PlayingUI';
// import { countdownBars, isGamePlaying } from '../utils/utils';
import { SongData } from '@/utils/songs';

// const verbose = false;

const KeyboardAudio = ({
  // playMode,
  keysState,
  // songData,
}:{
  playMode: PlayMode,
  keysState: KeysState,
  songData: SongData
}) => {
  const [notes, setNotes] = useState([]);
  // const [steps, setSteps] = useState([]);

  useEffect(() => {
    // Convert the keysState to an array of notes
    const newNotes = Object.keys(keysState).filter((key) => keysState[key])
      // Convert the key name to a note
      .map((key) => ({
        name: keyboardKeyToNote[key],
      }));

    setNotes(newNotes);
  }, [keysState]);

  // useEffect(() => {
  //   if (playMode === 'playback') {
  //   // Create a null step for each coundown bar
  //   // Convert the songData to an array of steps
  //     const newSteps = [...[...Array(countdownBars)].map(() => null), ...songData.notes.map((note) => [{ name: note.noteName, duration: note.durationInBars }])];
  //     verbose && console.log('newSteps', newSteps, isGamePlaying(playMode));
  //     setSteps(newSteps);
  //   } else {
  //     setSteps([]);
  //   }
  // }, [songData.notes, playMode]);

  return (
    <>
      <Song
        // isPlaying={isGamePlaying(playMode) && steps.length !== 0}
        // bpm={songData.bpm}
      >
        <Track
          // steps={steps}
          // onStepPlay={(stepNotes, index) => {
          //   verbose && console.log('onStepPlay', stepNotes, index);
          // }}
        >
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
