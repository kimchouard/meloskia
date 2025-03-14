import PlayingUI2 from "@/components/PlayingUI2";
import { songs } from "@/utils/songs";
import { getNumberedUrlParams } from "@/utils/utils";
import { Link, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  // Get context on the current URL params
  const { songId } = useLocalSearchParams<{ songId: string }>();

  const songIdNumber = getNumberedUrlParams(songId);

  return songIdNumber !== null && songIdNumber !== undefined ? (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-neutral-950 items-center justify-center">
        <PlayingUI2 songData={songs[songIdNumber]} />
        <StatusBar style="auto" />
      </View>
    </GestureHandlerRootView>
  ) : (
    <View className="flex-1 bg-neutral-950 items-center justify-center">
      <Text className="text-lg font-bold text-white">
        Invalid ID. This song doesn't exist.
      </Text>

      <Link href="/" className="mt-4 py-4">
        <Text className="text-regular text-cyan-600 web:hover:text-cyan-500">
          Go to home screen!
        </Text>
      </Link>
    </View>
  );
}
