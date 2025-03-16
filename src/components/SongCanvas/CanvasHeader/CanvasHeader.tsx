import { memo } from 'react';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useSongCanvasContext } from '../SongCanvasContext';
import MetronomeControl from './MetronomeControl';
import VolumeControl from './VolumeControl';
import BpmControl from './BpmControl';

const CanvasHeader: React.FC = () => {
  const { song } = useSongCanvasContext();

  return (
    <View className="absolute top-0 left-0 right-0 min-h-16 backdrop-blur-sm bg-black/30 border-b border-neutral-800 flex flex-col md:flex-row items-center px-4 py-2 md:py-0 z-10">
      {/* Top line: Back + Title */}
      <View className="w-full justify-between swm:w-auto flex-1 flex-row items-center">
        {/* Back Button */}
        <Link
          href="/"
          className="py-2 px-3 rounded-lg hover:bg-neutral-800/50 flex flex-row items-center">
          <MaterialIcons name="arrow-back" size={24} color="#9ca3af" />
          <Text className="text-neutral-400 text-lg ml-2 leading-6 hidden md:block">
            Back
          </Text>
        </Link>

        {/* Song Title */}
        <Text className="flex-1 absolute left-0 right-0 text-white text-xl font-medium text-center md:hidden">
          {song.name}
        </Text>
      </View>

      {/* Song Title (desktop) */}
      <Text className="text-white text-xl text-center hidden md:block md:flex-[5]">
        {song.name}
      </Text>

      {/* Controls */}
      <View className="w-full md:flex-1 md:w-auto flex-row items-center justify-end space-x-4 mt-2 md:mt-0 md:ml-auto">
        <MetronomeControl />
        <BpmControl />
        <VolumeControl />
      </View>
    </View>
  );
};

export default memo(CanvasHeader);
