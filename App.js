import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SkiaUI from './src/SkiaUI';
import { bgColor } from './src/utils';

export default function App() {
  return (
    <View style={styles.container}>
      <SkiaUI />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bgColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
