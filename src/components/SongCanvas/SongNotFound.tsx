import { memo } from 'react';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';

const SongNotFound: React.FC = () => (
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

export default memo(SongNotFound);
