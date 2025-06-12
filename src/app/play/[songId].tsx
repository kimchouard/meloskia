import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, useLocalSearchParams } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SongCanvas from '@/components/SongCanvas';

import songs from '@/songs';

export default function App() {
  // Get context on the current URL params
  const { songId } = useLocalSearchParams<{ songId: string }>();

  const song = useMemo(() => songs.find((s) => s.id === songId), [songId]);

  if (!song) {
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
      <View className="flex-1 bg-neutral-950 items-center justify-center relative">
        <StatusBar style="auto" />
        <SongCanvas song={song} />
      </View>
    </GestureHandlerRootView>
  );
}
