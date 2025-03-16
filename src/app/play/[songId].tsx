import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, useLocalSearchParams } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import PlayingUI from '@/components/PlayingUI';

import { getNumberedUrlParams } from '@/utils/utils';
import { songs } from '@/utils/songs';

export default function App() {
  // Get context on the current URL params
  const { songId } = useLocalSearchParams<{ songId: string }>();

  const songIdNumber = getNumberedUrlParams(songId);

  if (songIdNumber === null || songIdNumber === undefined) {
    return (
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-neutral-950 items-center justify-center">
        <StatusBar style="auto" />
        <PlayingUI songData={songs[songIdNumber]} />
      </View>
    </GestureHandlerRootView>
  );
}
