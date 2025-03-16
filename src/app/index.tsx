import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { cn } from '@/utils/utils';
import songs from '@/songs';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-neutral-950 items-center justify-center">
        <Text className="text-4xl font-bold text-white mb-5">
          Welcome to Melo'Skia!
        </Text>
        <Text className="text-xl text-neutral-400">Available songs:</Text>

        <View className="border-t border-neutral-900 w-full m-5">
          {songs.map((song, i) => {
            let textColor = 'text-pastels-0';
            switch (i % 10) {
              case 0:
                textColor = 'text-pastels-0';
                break;
              case 1:
                textColor = 'text-pastels-1';
                break;
              case 2:
                textColor = 'text-pastels-2';
                break;
              case 3:
                textColor = 'text-pastels-3';
                break;
              case 4:
                textColor = 'text-pastels-4';
                break;
              case 5:
                textColor = 'text-pastels-5';
                break;
              case 6:
                textColor = 'text-pastels-6';
                break;
              case 7:
                textColor = 'text-pastels-7';
                break;
              case 8:
                textColor = 'text-pastels-8';
                break;
              case 9:
                textColor = 'text-pastels-9';
                break;
              default:
                textColor = 'text-pastels-0';
                break;
            }

            return (
              <Link
                key={`song-${song.id}`}
                href={`/play/${song.id}`}
                className={cn(
                  'py-5 border-b border-neutral-900 text-center w-full hover:bg-neutral-900',
                  textColor
                )}>
                <Text className="text-lg">{song.name}</Text>
              </Link>
            );
          })}
        </View>

        <StatusBar style="auto" />
      </View>
    </GestureHandlerRootView>
  );
}
