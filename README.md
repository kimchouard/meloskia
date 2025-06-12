# MeloSkia

Open-source Music 2.5D Game to demonstrate the power of the "Final Tech Stack": React Native.

![meloskia-final-tech-stack-sparkle-demo](https://github.com/user-attachments/assets/935e2cf5-d800-49bf-b1e1-130cb21bfe0d)

👉 Try it live here: [meloskia.choaurd.kim](https://meloskia.chouard.kim/)

## Tech Stack

This mainly highlights how to universally (Web, Mobile, etc.):
- Build a **60 FPS 2.5D Game interface** with [React Native Skia](https://github.com/shopify/react-native-skia) (*@wcandillon* 🫶)
- Run a **high performance Audio Engine** with [React Native Audio API](https://docs.swmansion.com/react-native-audio-api/) (*@michalsek* 🫶)
- Add some some **sparkle love** when playing with [TypeGPU](https://docs.swmansion.com/TypeGPU/) (*@iwoplaza* 🫶)
- Gluing all this together with universal routes, navigation, etc. with [Expo Router](https://docs.expo.dev/router/introduction/) (*@EvanBacon* 🫶)

## Get Started

Simply run `yarn install` to install all the dependency and `yarn start` to start the dev server.

Press `W` or simply go to `http://localhost:8081` to see the live demo with auto-refresh.

Note: Will also work out of the box for iOS (`yarn ios`) and android (`yarn android`) soon (see roadmap)

## Roadmap

- [x] Build the 2.5D Game Engine in `react-native-skia` and the app's foundation (understanding MIDI, etc.)
- [x] Have a true universal Audio Engine using `react-native-audio-api`
- [x] Add some basic sparkles when you play the right note on time with `type-gpu`
- [ ] Fix the routing deployment issue to be able to load a song directly
- [ ] Add the ability to create your own tracks locally (MIDI & MP3 files) to test the engine
- [ ] Fix the mobile build and release the app on the stores for demo purposes 📲 🚀
- [ ] Improve the sparkles and the synth sound to make it even more... 💣 🥹
