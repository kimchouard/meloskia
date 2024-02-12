import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 bg-neutral-950 items-center justify-center">
        <Text className="text-lg font-bold text-white">This screen doesn't exist.</Text>

        <Link href="/" className="mt-4 py-4">
          <Text className="text-regular text-cyan-600 web:hover:text-cyan-500">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
