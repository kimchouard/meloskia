import Constants from 'expo-constants';
import { Text, View, StyleSheet } from 'react-native';
import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

const SkiaUI = () => {
  return <View style={styles.container}>
    <WithSkiaWeb
      opts={{ locateFile: () => `/static/js/canvaskit.wasm` }}
      getComponent={() => require('./PlayingUI')}
      fallback={<Text style={{ textAlign: 'center' }}>Loading Skia...</Text>}
    />
  </View>
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
  },
});

export default SkiaUI;