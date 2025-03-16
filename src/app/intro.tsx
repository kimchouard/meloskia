import { View } from 'react-native';

import IntroBRollAnimation from '@/components/introBRollAnimation';

export default function ModalScreen() {
  return (
    <View className="flex-1 bg-neutral-950 items-center justify-center">
      <IntroBRollAnimation />
    </View>
  );
}
