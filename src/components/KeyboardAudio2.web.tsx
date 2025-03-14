import { useKeyboard } from "@/controller";
import { useState } from "react";
import { runOnJS, useAnimatedReaction } from "react-native-reanimated";
import { Instrument, MidiNote, Song, StepNoteType, Track } from "reactronica";
import { keyboardKeyToNote } from "./PianoKeyboard";

const KeyboardAudio2 = () => {
  const { activeKeys } = useKeyboard();
  const [notes, setNotes] = useState<StepNoteType[]>([]);

  const updateNotes = (notes: StepNoteType[]) => {
    setNotes(notes);
  };

  useAnimatedReaction(
    () => activeKeys.value,
    (activeKeys) => {
      const newNotes = activeKeys.map((key) => ({
        name: keyboardKeyToNote[key] as MidiNote,
      }));
      runOnJS(updateNotes)(newNotes);
    },
    [activeKeys]
  );

  return (
    <Song>
      <Track>
        <Instrument type="synth" notes={notes} />
      </Track>
    </Song>
  );
};

export default KeyboardAudio2;
