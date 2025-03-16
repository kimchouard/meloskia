import { MaterialIcons } from '@expo/vector-icons';
import { memo, useCallback, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { cn } from '@/utils/utils';

import { useSongCanvasContext } from '../SongCanvasContext';

const BpmControl: React.FC = () => {
  const { song, bpm, setBpm } = useSongCanvasContext();

  const [showBpmInput, setShowBpmInput] = useState(false);
  const [bpmInputValue, setBpmInputValue] = useState(song.baseBpm.toString());

  const handleBpmChange = useCallback(
    (newBpm: number) => {
      // Ensure BPM is within bounds
      const boundedBpm = Math.max(40, Math.min(180, newBpm));
      setBpm(boundedBpm);
      setBpmInputValue(boundedBpm.toString());
    },
    [setBpm]
  );

  const handleBpmInputSubmit = useCallback(() => {
    const newBpm = parseInt(bpmInputValue, 10);

    if (!isNaN(newBpm)) {
      handleBpmChange(newBpm);
    } else {
      setBpmInputValue(bpm.toString());
    }

    setShowBpmInput(false);
  }, [bpm, handleBpmChange, bpmInputValue]);

  const onBpmDown = useCallback(() => {
    handleBpmChange(Math.floor((bpm - 5) / 5) * 5);
  }, [bpm, handleBpmChange]);

  const onBpmUp = useCallback(() => {
    handleBpmChange(Math.ceil((bpm + 5) / 5) * 5);
  }, [bpm, handleBpmChange]);

  const isBaseBpm = bpm === song.baseBpm;

  return (
    <View className="flex-row items-center space-x-2">
      <View className="flex-row items-center bg-neutral-900/50 backdrop-blur-sm rounded-lg overflow-hidden">
        {/* Reset BPM Button */}
        {
          <Pressable
            onPress={() => handleBpmChange(song.baseBpm)}
            // Disabled look if the BPM is the default
            className={cn(
              'p-2 rounded-lg backdrop-blur-sm bg-neutral-900/50',
              isBaseBpm ? 'opacity-50' : 'hover:bg-neutral-800/50'
            )}
            disabled={isBaseBpm}>
            <MaterialIcons name="refresh" size={20} color="#9ca3af" />
          </Pressable>
        }

        <Pressable onPress={onBpmDown} className="p-2 hover:bg-neutral-800/50">
          <MaterialIcons name="remove" size={20} color="#9ca3af" />
        </Pressable>

        {showBpmInput ? (
          <TextInput
            value={bpmInputValue}
            onChangeText={setBpmInputValue}
            onBlur={handleBpmInputSubmit}
            onSubmitEditing={handleBpmInputSubmit}
            keyboardType="number-pad"
            className="w-16 text-center text-white bg-neutral-800/50 py-1"
            autoFocus
          />
        ) : (
          <Pressable
            onPress={() => setShowBpmInput(true)}
            className="px-3 py-1">
            <Text className="text-white">{bpm} BPM</Text>
          </Pressable>
        )}

        <Pressable onPress={onBpmUp} className="p-2 hover:bg-neutral-800/50">
          <MaterialIcons name="add" size={20} color="#9ca3af" />
        </Pressable>
      </View>
    </View>
  );
};

export default memo(BpmControl);
