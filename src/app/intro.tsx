import IntroBRollAnimation from '@/components/introBRollAnimation';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Platform, Text, View,
} from 'react-native';

export default function ModalScreen() {
  return (
    <View className="flex-1 bg-neutral-950 items-center justify-center">
      <IntroBRollAnimation />
    </View>
  );
}
