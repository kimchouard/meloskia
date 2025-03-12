import React, { memo, useEffect, useRef, useState } from "react";
import { Canvas, Group } from "@shopify/react-native-skia";
import {
  Easing,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import PianoKeyboard from "./PianoKeyboard";
import NoteRoll from "./NoteRoll";
import {
  cn,
  countdownBars,
  gameHeight,
  gameWidth,
  getBarsFromDist,
  getDistFromBars,
  getDurationInBars,
  getOnPressKeyboardGestureHandler,
  getSongBarCountWithCountdownPlusClosing,
  getTimeFromBars,
  isGamePlaying,
  screenHeight,
  screenWidth,
} from "../utils/utils";
import useKeyboard from "../hooks/useKeyboard";
import KeyboardAudio from "./KeyboardAudio";
import { SongData } from "../utils/songs";
import BackingAudioManager from "@/components/BackingAudioManager";

const verbose = false;

export type PlayMode = "stopped" | "playing" | "playback" | "restart";

const PlayingUI = ({ songData }: { songData: SongData }) => {
  // ==============================
  //    Playing State

  const playingTimeout = useRef<NodeJS.Timeout>();

  const [playMode, setPlayMode] = useState<PlayMode>("stopped");
  const [userBpm, setUserBpm] = useState<number>(songData.bpm);
  const [showBpmInput, setShowBpmInput] = useState(false);
  const [bpmInputValue, setBpmInputValue] = useState(songData.bpm.toString());
  const [trackVolumes, setTrackVolumes] = useState({
    instrumental: 1,
    clicks: 1,
  });

  // Function to handle BPM changes
  const handleBpmChange = (newBpm: number) => {
    // Ensure BPM is within bounds
    const boundedBpm = Math.max(40, Math.min(180, newBpm));
    setUserBpm(boundedBpm);
    setBpmInputValue(boundedBpm.toString());
  };

  // Function to handle BPM input submission
  const handleBpmInputSubmit = () => {
    const newBpm = parseInt(bpmInputValue, 10);
    if (!isNaN(newBpm)) {
      handleBpmChange(newBpm);
    } else {
      setBpmInputValue(userBpm.toString());
    }
    setShowBpmInput(false);
  };

  // Function to handle track volume toggle
  const toggleTrackVolume = (track: "instrumental" | "clicks") => {
    setTrackVolumes((prev) => ({
      ...prev,
      [track]: prev[track] === 0 ? 1 : 0,
    }));
  };

  const restart = () => {
    setPlayMode("stopped");
    clearTimeout(playingTimeout.current);
  };

  const startGame = (startMode: "playing" | "playback") => {
    setPlayMode(startMode);

    // TEMP: Allow the user to restart the game after the animation
    playingTimeout.current = setTimeout(() => {
      setPlayMode("restart");
    }, getTimeFromBars(songData && getSongBarCountWithCountdownPlusClosing(songData), songData?.bpm));
  };

  // ==============================
  //    Keyboard Handler

  const { keysState, keyPressed, releaseLastKey, playNotesFromBars } =
    useKeyboard({
      keyboardType: "laptop",
      playMode,
      startGame,
      restart,
      songData,
      userBpm,
    });

  // ==============================
  //    Animations

  // NoteRoll Animation
  const noteRollY = useSharedValue(0);
  useEffect(() => {
    if (isGamePlaying(playMode)) {
      const songBarCountWithCountdownPlusClosing =
        getSongBarCountWithCountdownPlusClosing(songData);
      noteRollY.value = withTiming(
        getDistFromBars(songBarCountWithCountdownPlusClosing, userBpm),
        {
          duration: getTimeFromBars(
            songBarCountWithCountdownPlusClosing,
            userBpm
          ),
          easing: Easing.linear,
        }
      );
    } else if (playMode === "stopped") {
      noteRollY.value = withTiming(0, {
        duration: 500,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playMode, userBpm]);

  // CTA Animation
  const height = useSharedValue(0);

  useEffect(() => {
    if (playMode === "stopped" && noteRollY.value === 0) {
      height.value = 0;
      height.value = withDelay(
        1000,
        withTiming(Platform.OS === "web" ? 85 : 200, {
          duration: 250,
          easing: Easing.inOut(Easing.ease),
        })
      );
    }

    return () => {
      height.value = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songData.name]);

  // ===========================
  //        Scroll (web)

  const handleScrolling = (e: WheelEvent) => {
    if (isGamePlaying(playMode)) return false;

    // Hide the CTA
    if (height.value !== 0) {
      height.value = withTiming(0, {
        duration: 250,
        easing: Easing.inOut(Easing.ease),
      });
    }

    const scrolledVerticallyBy = e?.deltaY;

    const translateX = noteRollY.value - scrolledVerticallyBy;
    // Set the limit as the end of the song
    const translateEndLimit =
      getDistFromBars(getDurationInBars(songData) + countdownBars, userBpm) +
      20;
    verbose &&
      console.log(
        "Scrolled!",
        scrolledVerticallyBy,
        translateX,
        noteRollY.value
      );

    // If we're in the boundaries
    if (translateX > 0 && translateX < translateEndLimit) {
      // We move the scene
      noteRollY.value = translateX;

      // Play the notes as we scroll
      const currentTimeInBars = getBarsFromDist(translateX, userBpm);
      verbose && console.log("Scrolling", currentTimeInBars, translateX);
      playNotesFromBars(currentTimeInBars);
    }

    return false;
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      verbose && console.log("Scrolling start", window);
      window.addEventListener("wheel", handleScrolling);

      return () => {
        if (Platform.OS === "web") {
          verbose && console.log("Scrolling removed", window);
          window.removeEventListener("wheel", handleScrolling);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songData, playMode]);

  // ==============================
  //    CTAs

  const renderWebCTAs = () => (
    <Animated.View
      className="flex absolute bottom-[200px] w-full h-0 bg-neutral-950/70 overflow-hidden"
      style={{ height }}
    >
      {playMode === "stopped" ? (
        <>
          <Text className="text-white text-lg text-center mt-5">
            Press Spacebar to start playing
          </Text>
          <Text className="text-neutral-400 text-regular text-center mb-5">
            Press Enter if you're feeling lazy. Or simply Scroll away.
          </Text>
        </>
      ) : (
        <Text className="text-white text-lg text-center my-5">
          Press Spacebar or Enter to restart.
        </Text>
      )}
    </Animated.View>
  );

  const renderMobileCTAs = () => (
    <Animated.View
      className="absolute bottom-[200px] left-0 w-full pb-10"
      style={{ height }}
    >
      <Pressable
        onPress={() =>
          playMode === "stopped" ? startGame("playing") : restart()
        }
      >
        <LinearGradient
          colors={
            playMode === "stopped"
              ? ["#6A8AFF", "#8A6AFF", "#FF6AFF"]
              : ["#FF6AFF", "#8A6AFF", "#6A8AFF"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="content-center items-center rounded-lg py-5 px-10 mx-auto"
        >
          <Text className="text-white font-medium text-2xl">
            {playMode === "stopped" ? "Start Playing" : "Restart"}
          </Text>
        </LinearGradient>
      </Pressable>

      {playMode === "stopped" && (
        <Pressable
          className="content-center items-center rounded-lg py-3"
          onPress={() => startGame("playback")}
        >
          <Text className="text-neutral-400 text-lg">Feeling lazy?</Text>
        </Pressable>
      )}
    </Animated.View>
  );

  const renderCTAs = () => (
    <>{Platform.OS === "web" ? renderWebCTAs() : renderMobileCTAs()}</>
  );

  // ==============================
  //    Header Component

  const renderHeader = () => (
    <View className="absolute top-0 left-0 right-0 min-h-16 backdrop-blur-sm bg-black/30 border-b border-neutral-800 flex-col sm:flex-row items-center px-4 py-2 sm:py-0 z-10">
      {/* Top line: Back + Title */}
      <View className="w-full sm:w-auto flex-row items-center">
        {/* Back Button */}
        <Link
          href="/"
          className="py-2 px-3 rounded-lg hover:bg-neutral-800/50 flex flex-row items-center"
        >
          <MaterialIcons name="arrow-back" size={24} color="#9ca3af" />
          <Text className="text-neutral-400 text-lg ml-2 leading-6 hidden sm:block">
            Back
          </Text>
        </Link>

        {/* Song Title */}
        <Text className="text-white text-xl font-medium flex-1 text-center sm:hidden">
          {songData.name}
        </Text>
      </View>

      {/* Song Title (desktop) */}
      <Text className="text-white text-xl font-medium hidden sm:block absolute left-1/2 -translate-x-1/2">
        {songData.name}
      </Text>

      {/* Controls */}
      <View className="w-full sm:w-auto flex-row items-center justify-between sm:justify-start space-x-4 mt-2 sm:mt-0 sm:ml-auto">
        {/* BPM Controls */}
        <View className="flex-row items-center space-x-2">
          <View className="flex-row items-center bg-neutral-900/50 backdrop-blur-sm rounded-lg overflow-hidden">
            {/* Reset BPM Button */}
            {
              <Pressable
                onPress={() => handleBpmChange(songData.bpm)}
                // Disabled look if the BPM is the default
                className={cn(
                  "p-2 rounded-lg backdrop-blur-sm bg-neutral-900/50",
                  userBpm === songData.bpm
                    ? "opacity-50"
                    : "hover:bg-neutral-800/50"
                )}
                disabled={userBpm === songData.bpm}
              >
                <MaterialIcons name="refresh" size={20} color="#9ca3af" />
              </Pressable>
            }

            <Pressable
              onPress={() => handleBpmChange(Math.floor((userBpm - 5) / 5) * 5)}
              className="p-2 hover:bg-neutral-800/50"
            >
              <MaterialIcons name="remove" size={20} color="#9ca3af" />
            </Pressable>

            {showBpmInput ? (
              <TextInput
                value={bpmInputValue}
                onChangeText={setBpmInputValue}
                onBlur={handleBpmInputSubmit}
                onSubmitEditing={handleBpmInputSubmit}
                keyboardType="number-pad"
                className="w-16 text-center text-white bg-neutral-800/50 py-1"
                autoFocus
              />
            ) : (
              <Pressable
                onPress={() => setShowBpmInput(true)}
                className="px-3 py-1"
              >
                <Text className="text-white">{userBpm} BPM</Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => handleBpmChange(Math.ceil((userBpm + 5) / 5) * 5)}
              className="p-2 hover:bg-neutral-800/50"
            >
              <MaterialIcons name="add" size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </View>

        {/* Track Volume Controls */}
        <View className="flex-row space-x-2">
          <Pressable
            onPress={() => toggleTrackVolume("instrumental")}
            className={`p-2 rounded-full backdrop-blur-sm ${
              trackVolumes.instrumental === 0
                ? "bg-neutral-800/50"
                : "bg-neutral-700/50 hover:bg-neutral-600/50"
            }`}
          >
            <MaterialIcons
              name={
                trackVolumes.instrumental === 0 ? "volume-off" : "volume-up"
              }
              size={20}
              color={trackVolumes.instrumental === 0 ? "#9ca3af" : "#ffffff"}
            />
          </Pressable>

          <Pressable
            onPress={() => toggleTrackVolume("clicks")}
            className={`p-2 rounded-full backdrop-blur-sm ${
              trackVolumes.clicks === 0
                ? "bg-neutral-800/50"
                : "bg-neutral-700/50 hover:bg-neutral-600/50"
            }`}
          >
            <MaterialIcons
              name={trackVolumes.clicks === 0 ? "timer-off" : "timer"}
              size={20}
              color={trackVolumes.clicks === 0 ? "#9ca3af" : "#ffffff"}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );

  // ==============================
  //    Skia Canvas

  if (songData) {
    return (
      <View className="flex-1">
        {/* Header */}
        {renderHeader()}

        {/* Start button, centered on the screen */}
        {!isGamePlaying(playMode) &&
          (Platform.OS === "web" ? renderCTAs() : renderMobileCTAs())}

        {/* Piano sound */}
        <KeyboardAudio {...{ playMode, keysState, songData }} />

        {/* Backing tracks */}
        <BackingAudioManager
          {...{ playMode, userBpm, songData, trackVolumes }}
        />

        <GestureDetector
          gesture={getOnPressKeyboardGestureHandler(keyPressed, releaseLastKey)}
        >
          <Canvas
            style={{
              width: screenWidth,
              height: screenHeight,
              flex: 1,
              overflow: "hidden",
            }}
          >
            <Group
              transform={[
                // Center the game
                { translateX: (screenWidth - gameWidth) / 2 },
                { translateY: (screenHeight - gameHeight) / 2 },
              ]}
            >
              <NoteRoll
                {...{
                  keysState,
                  songData,
                  noteRollY,
                }}
              />
              <PianoKeyboard keysState={keysState} songName={songData.name} />
            </Group>
          </Canvas>
        </GestureDetector>
      </View>
    );
  }

  // ==============================
  //    Invalid songData

  return (
    <View className="flex-1 bg-neutral-950 items-center justify-center">
      <Text className="text-lg font-bold text-white">
        Invalid ID. This song doesn't exist.
      </Text>

      <Link href="/" className="mt-4 py-4">
        <Text className="text-regular text-cyan-600 web:hover:text-cyan-500">
          Go to home screen
        </Text>
      </Link>
    </View>
  );
};

export default memo(PlayingUI);
