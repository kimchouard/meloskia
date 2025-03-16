import React, { memo } from 'react';

const VolumeControl: React.FC = () => {
  return null;
};

export default memo(VolumeControl);

/*
 <View className="flex-row space-x-2">
  <Pressable
    onPress={() => toggleTrackVolume('instrumental')}
    className={`p-2 rounded-full backdrop-blur-sm ${
      trackVolumes.instrumental === 0
        ? 'bg-neutral-800/50'
        : 'bg-neutral-700/50 hover:bg-neutral-600/50'
    }`}>
    <MaterialIcons
      name={
        trackVolumes.instrumental === 0 ? 'volume-off' : 'volume-up'
      }
      size={20}
      color={trackVolumes.instrumental === 0 ? '#9ca3af' : '#ffffff'}
    />
  </Pressable>

  <Pressable
    onPress={() => toggleTrackVolume('clicks')}
    className={`p-2 rounded-full backdrop-blur-sm ${
      trackVolumes.clicks === 0
        ? 'bg-neutral-800/50'
        : 'bg-neutral-700/50 hover:bg-neutral-600/50'
    }`}>
    <MaterialIcons
      name={trackVolumes.clicks === 0 ? 'timer-off' : 'timer'}
      size={20}
      color={trackVolumes.clicks === 0 ? '#9ca3af' : '#ffffff'}
    />
  </Pressable>
</View>
*/
