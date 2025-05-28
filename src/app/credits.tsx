import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Text, View } from 'react-native';

export default function ModalScreen() {
  return (
    <View className="flex-1 bg-neutral-950 items-center justify-center">
      <Text className="text-xl font-bold text-white">Credits</Text>

      <Link href="/" className="mt-4 py-4">
        <Text className="text-regular text-cyan-600 web:hover:text-cyan-500">
          &lt; Home
        </Text>
      </Link>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
