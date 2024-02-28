import { KeyboardController } from "@/controller";
import { FC, memo } from "react";
import { View } from "react-native";
import { SongData } from "../utils/songs";
import KeyboardAudio2 from "./KeyboardAudio2.web";
import { NoteStream } from "./NoteStream";
import { PianoKeyboard } from "./PianoKeyboard2";

export type PlayMode = "start" | "playing" | "playback" | "restart";

type Props = {
  songData: SongData;
};

const PlayingUI2: FC<Props> = ({ songData }) => {
  return (
    <KeyboardController>
      <View
        style={{
          alignItems: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "black",
        }}
      >
        <KeyboardAudio2 />
        <NoteStream songData={songData} />
        <PianoKeyboard />
      </View>
    </KeyboardController>
  );
};

export default memo(PlayingUI2);
