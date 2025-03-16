import React, { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, Text } from 'react-native';
import Animated, {
  Easing,
  withDelay,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

import { useSongCanvasContext } from './SongCanvasContext';

const CanvasCTA: React.FC = () => {
  const { state, startGame, restartGame } = useSongCanvasContext();
  const height = useSharedValue(0);

  const onToggleStart = () => {
    if (state === 'stopped') {
      startGame('playing');
    } else {
      restartGame();
    }
  };

  const onStartPlayback = () => {
    startGame('playback');
  };

  useEffect(() => {
    if (state === 'stopped') {
      height.value = 0;
      height.value = withDelay(
        1000,
        withTiming(Platform.OS === 'web' ? 85 : 200, {
          duration: 250,
          easing: Easing.inOut(Easing.ease),
        })
      );
    }

    return () => {
      height.value = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (Platform.OS === 'web') {
    return (
      <Animated.View
        className="flex absolute bottom-[200px] w-full h-0 bg-neutral-950/70 overflow-hidden"
        style={{ height }}>
        {state === 'stopped' ? (
          <>
            <Pressable onPress={onStartPlayback}>
              <Text className="text-white text-lg text-center my-5">
                Press Space bar or Enter to restart.
              </Text>
            </Pressable>
            <Text className="text-neutral-400 text-regular text-center mb-5">
              Press Enter if you're feeling lazy. Or simply Scroll away.
            </Text>
          </>
        ) : (
          <Pressable onPress={onStartPlayback}>
            <Text className="text-white text-lg text-center my-5">
              Press Space bar or Enter to restart.
            </Text>
          </Pressable>
        )}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      className="absolute bottom-[200px] left-0 w-full pb-10"
      style={{ height }}>
      <Pressable onPress={onToggleStart}>
        <LinearGradient
          colors={
            state === 'stopped'
              ? ['#6A8AFF', '#8A6AFF', '#FF6AFF']
              : ['#FF6AFF', '#8A6AFF', '#6A8AFF']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="content-center items-center rounded-lg py-5 px-10 mx-auto">
          <Text className="text-white font-medium text-2xl">
            {state === 'stopped' ? 'Start Playing' : 'Restart'}
          </Text>
        </LinearGradient>
      </Pressable>

      {state === 'stopped' && (
        <Pressable
          className="content-center items-center rounded-lg py-3"
          onPress={onStartPlayback}>
          <Text className="text-neutral-400 text-lg">Feeling lazy?</Text>
        </Pressable>
      )}
    </Animated.View>
  );
};

export default CanvasCTA;
