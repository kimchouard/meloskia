import { Pressable, Text, View } from 'react-native';
import React, { memo, useCallback, useState } from 'react';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import { useSongCanvasContext } from '../SongCanvasContext';

interface Option {
  label: string;
  value: 0 | 1 | 2 | 4;
  icon: keyof typeof Icon.glyphMap;
}

const metronomeOptions: Option[] = [
  {
    label: 'Off',
    value: 0,
    icon: 'music-note-off-outline',
  },
  {
    label: 'Whole',
    value: 1,
    icon: 'music-note-whole',
  },
  {
    label: 'Half',
    value: 2,
    icon: 'music-note-half',
  },
  {
    label: 'Quarter',
    value: 4,
    icon: 'music-note-quarter',
  },
];

const MetronomeControl: React.FC = () => {
  const { metronome, setMetronome } = useSongCanvasContext();
  const [expanded, setExpanded] = useState(false);

  const option = metronomeOptions.find((o) => o.value === metronome);

  const onToggleExpand = useCallback(() => {
    setExpanded((exp) => !exp);
  }, []);

  return (
    <View className="relative">
      <Pressable onPress={onToggleExpand}>
        <View className="flex-row items-center bg-neutral-700/50 backdrop-blur-sm rounded-lg p-2">
          <Icon name="metronome" size={20} color="#9ca3af" />
          <View className="w-2" />
          <Text className="text-white">{option.label}</Text>
        </View>
      </Pressable>
      {expanded && (
        <View className="absolute top-12 right-0 bg-neutral-700/50 backdrop-blur-sm p-2 rounded-lg">
          {metronomeOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                setMetronome(option.value);
                setExpanded(false);
              }}>
              <View className="flex-row items-center space-x-2 p-2">
                <Icon name={option.icon} size={20} color="#9ca3af" />
                <Text className="text-white min-w-[60px]">{option.label}</Text>
                <Icon
                  name="check"
                  size={20}
                  color={option.value === metronome ? '#9ca3af' : 'transparent'}
                />
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

export default memo(MetronomeControl);
