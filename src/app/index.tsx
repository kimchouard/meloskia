import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PlayingUI from '@/components/PlayingUI';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-neutral-950 items-center justify-center">
        <PlayingUI />

        <StatusBar style="auto" />
      </View>
    </GestureHandlerRootView>
  );
}
