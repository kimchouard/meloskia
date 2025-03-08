import type { PlayMode } from "@/components/PlayingUI";
import type { SongData } from "@/utils/songs";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as FileSystem from 'expo-file-system';
import { AudioContext, type AudioBuffer, type StretcherNode, type GainNode, type AudioBufferSourceNode } from 'react-native-audio-api';
import { isGamePlaying } from "@/utils/utils";

const verbose = true;

// ===========================
//    Types
// ===========================

interface SoundObj {
  status: 'disabled' | 'idle' | 'loaded' | 'failed' | 'loading' | 'playing' | 'paused' | 'stopped',
  playerNode: StretcherNode | AudioBufferSourceNode;
  gainNode: GainNode;
  audioBuffer: AudioBuffer;
  url?: string, // to detect if a new sound needs to be loaded
  duration?: number,
}

interface SoundObjs {
  'instrumental': SoundObj;
  'clicks': SoundObj;
}

// Add SoundName type based on the SoundObjs interface keys
type SoundName = keyof SoundObjs;

const BackingAudioManager = ({
  playMode,
  userBpm,
  songData,
  trackVolumes,
}: {
  playMode: PlayMode,
  userBpm: number,
  songData: SongData,
  trackVolumes: {
    instrumental: number,
    clicks: number,
  }
}) => {
  // Local State
  const [isLoadingSounds, setIsLoadingSounds] = useState(false);
  
  // REFS
  const soundObjs = useRef<Partial<SoundObjs>>({
    instrumental: {
      status: 'idle',
      playerNode: null,
      gainNode: null,
      audioBuffer: null,
    },
    clicks: {
      status: 'idle',
      playerNode: null,
      gainNode: null,
      audioBuffer: null,
    },
  });

  // ===========================
  //      UTILS
  // ===========================

  const getRateForSounds = (currentBPM: number, originalBPM: number): number => currentBPM / originalBPM;

  const isSoundDisabled = (soundName: SoundName): boolean => soundName && (!soundObjs.current[soundName] || soundObjs.current[soundName].status === 'disabled'); 
  const isSoundLoaded = (soundName: SoundName): boolean => soundName && soundObjs.current[soundName] && soundObjs.current[soundName].status === 'loaded';
  const isSoundPlaying = (soundName: SoundName): boolean => soundName && soundObjs.current[soundName] && soundObjs.current[soundName].status === 'playing';

  // ===========================
  //    Init RN-Audio Context
  // ===========================

  const audioContext = useRef<AudioContext | null>(null);

  const getOrInitializeAudioContext = useCallback(() => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext();

      // TODO: store the current time so that we know when `audioContext.currentTime` has started! (value = 0)
    }
    return audioContext.current;
  }, []);


  // ===========================
  //    RN-Audio API Utils
  // ===========================

  const getPlayerNode = async (audioContext: AudioContext, soundObj: {
    gainNode: GainNode;
    audioBuffer: AudioBuffer;
    // Plus any other properties
    [key: string]: any;
  }) => {
    if (!audioContext || !soundObj) {
      console.error('[BackingAudioManager/getPlayerNode] No audio context or sound object passed', { audioContext, soundObj });
      return null;
    }

    const originalPartitionBPM = songData.bpm;
    const globalRate = getRateForSounds(userBpm, originalPartitionBPM); // from 0 to 1

    verbose && console.log('[BackingAudioManager/getPlayerNode] Creating player node, with rate:', { audioContext, soundObj, globalRate, BPM: songData.bpm, originalPartitionBPM });

    // const playerNode = audioContext.createBufferSource();
    const playerNode = (globalRate !== 1) ? await audioContext.createStretcher() : await audioContext.createBufferSource();

    if (!playerNode){
      console.error('[BackingAudioManager/getPlayerNode] Error while creating player node for sound', { audioContext, soundObj, playerNode });
      return null;
    }

    // Connect to a gain node to control the volume instead!
    // playerNode.connect(audioContext.destination);
    playerNode.connect(soundObj.gainNode);
    
    playerNode.buffer = soundObj.audioBuffer;

    // Setting the proper rate for the sound
    if (globalRate !== 1) {
      verbose && console.log('[BackingAudioManager/getPlayerNode] Setting the proper rate for the sound:', { playerNode, globalRate });
      (playerNode as StretcherNode).playbackRate = globalRate;
    }
  
    verbose && console.log('[BackingAudioManager] Player node created, sound loaded in the BackingAudioManager engine:', { playerNode, audioContext_currentTime: audioContext.currentTime, globalRate });

    return playerNode;
  };

  const updateGainNodeVolume = useCallback((gainNode: GainNode, volume: number, soundName?: SoundName) => {
    // Update the gain node volume, taking into account the track volume state
    const trackVolume = soundName ? trackVolumes[soundName] : 1;
    gainNode.gain.value = volume * trackVolume;

    verbose && console.log(`[BackingAudioManager/updateGainNodeVolume] Updated sound ${soundName} gain node volume to ${volume} (gainNode.gain.value: ${gainNode.gain.value}, trackVolume: ${trackVolume})`);
  }, [trackVolumes]);

  // ===========================
  //      LOAD sounds
  // ===========================

  const loadSound = async (soundName: SoundName, isLooping = false) => {
    const soundObj = soundObjs.current[soundName];
    if (!soundObj) {
      console.error(`[BackingAudioManager/loadSound] No sound found with this name: "${soundName}".`, { soundObjs: soundObjs.current });
      return;
    }

    if (soundObj.status === 'loaded' || soundObj.status === 'disabled') {
      verbose && console.log(`[BackingAudioManager/loadSound] Sound "${soundName}" is already loaded or disabled.`, { soundObj });
      return; // Sound is already loaded
    }

    // Update the status to loading
    soundObjs.current[soundName].status = 'loading';

    // Get the sound data
    const soundData = songData.backingTracks?.find((track) => track.type === soundName);

    if (!soundData || !soundData.url) {
      console.error(`[BackingAudioManager] Can't load sound "${soundName}": data or url not defined. Disabling it.`, { soundData });
      soundObjs.current[soundName].status = 'disabled';
      soundObjs.current[soundName].playerNode = null;
      soundObjs.current[soundName].gainNode = null;
      soundObjs.current[soundName].audioBuffer = null;
      
      return;
    }

    const audioContext = getOrInitializeAudioContext();
    if (!audioContext) {
      throw new Error('Error while initializing the Audio context');
    }
    verbose && console.log('[BackingAudioManager/loadSound] Audio context pulled:', { audioContext });

    const audioBuffer = (Platform.OS === 'web')
      ? await audioContext.decodeAudioDataSource(soundData.url)
      : await FileSystem.downloadAsync(
        soundData.url,
        `${FileSystem.documentDirectory}/${songData.id}/${soundName}.mp3`
      ).then(({ uri }) => audioContext.decodeAudioDataSource(uri));

    if (!audioBuffer) {
      console.error(`[BackingAudioManager/loadSound] Can't load sound "${soundName}": url not defined`, { sourceUrl: soundData.url, audioContext, audioBuffer });
      throw new Error(`Error while loading sound "${soundName}".`);
    }

    verbose && console.log('[BackingAudioManager/loadSound] URL loaded into an audio buffer:', { sourceUrl: soundData.url, audioBuffer });

    const gainNode = audioContext.createGain();
    if (!gainNode) {
      console.error(`[BackingAudioManager/loadSound] Can't create gain node for sound "${soundName}"`);
      throw new Error(`Error while creating gain node for sound "${soundName}".`);
    }
    updateGainNodeVolume(gainNode, soundData.volume, soundName);
    gainNode.connect(audioContext.destination);

    verbose && console.log('[BackingAudioManager/loadSound] Gain node created and connected to audio context destination:', { gainNode, audioContext_destination: audioContext.destination });

    const playerNode = await getPlayerNode(audioContext, {
      gainNode,
      audioBuffer,
    });
    if (!playerNode) {
      console.error(`[BackingAudioManager] Can't create player node for sound "${soundName}"`);
      throw new Error(`Error while creating player node for sound "${soundName}".`);
    }

    verbose && console.log('[BackingAudioManager/loadSound] Player node created and connected to gain node:', { playerNode, gainNode });

    soundObjs.current[soundName] = {
      status: 'loaded',
      duration: audioBuffer.duration,
      url: soundData.url,
      playerNode,
      gainNode,
      audioBuffer,
    };
  };

  const loadSounds = async () => {
    // If we're already loading the sounds OR the redux sound state hasn't been set from a specific partition
    // => Then we don't load the sounds
    if (isLoadingSounds) return;

    setIsLoadingSounds(true);
    verbose && console.log('[BackingAudioManager] Checking sound loading sound statuses:', soundObjs.current);
    
    for (const soundName of Object.keys(soundObjs.current) as SoundName[]) {
      // const soundData = songData.backingTracks?.find((track) => track.type === soundName);
      // if (soundData && soundData.url) {
        verbose && console.log(`[BackingAudioManager] Loading sound: ${soundName}`);
        await loadSound(soundName, false);
      // }
    }

    setIsLoadingSounds(false);
  };
  

  // ===========================
  //      PLAY sounds
  // ===========================

  // startAtTime is in ms!
  const playSounds = async (options?: {trackList?: SoundName[], startAtTime?: number}) => {
    const backingTrackNames: SoundName[] = options?.trackList ?? ['instrumental', 'clicks'];

    const audioContext = getOrInitializeAudioContext();

    // Convert the startAtTime to seconds, from ms!
    const startTime = (options?.startAtTime ?? 0) / 1000;

    // Reset the backing tracks in case some of them are already playing
    for (const soundName of backingTrackNames) {
      if (isSoundPlaying(soundName)) {
        await stopSound(soundName);
      }
    }
    
    for (const soundName of backingTrackNames) {
      if (soundObjs.current[soundName]?.status === 'loaded') {
        const soundObj = soundObjs.current[soundName];
        if (!soundObj) {
          console.error('[AudioManager/playSounds] No sound object found for', soundName);
          return;
        }

        const { playerNode } = soundObj;

        if (playerNode) {
          try {
            if (!audioContext) {
              throw new Error('Error while initializing the Audio context while starting the sounds');
            }
  
            // `0` means start NOW!
            playerNode.start(0, 0); // (startTime) ? startTime : 0);

            // Update the status to playing
            soundObjs.current[soundName].status = 'playing';

            verbose && console.log(`[BackingAudioManager/playSounds] Started sound ${soundName} at time ${startTime}`, { playerNode });
          } catch (error) {
            // reportErrorToSentry(error, 'AudioManager/playSounds');
            console.error(`[BackingAudioManager/playSounds] Error playing sound ${soundName}:`, error);
          }
        }
      }
    };

    verbose && console.log('[BackingAudioManager/playSounds] Started all sounds', { backingTrackNames });
  };

  // ===========================
  //      STOP sounds
  // ===========================

  const stopSound = async (soundName: SoundName) => {
    verbose && console.log('[BackingAudioManager/stopSound] Stopping sound', { soundName });

    const audioContext = getOrInitializeAudioContext();
    const soundObj = soundObjs.current[soundName];
    if (!audioContext || !soundObj) {
      console.error('[AudioManager/stopSound] Error while initializing the Audio context while stopping the sound', { audioContext, soundObj, soundName });
      return;
    }

    try {
      const { playerNode } = soundObj;
  
      if (!playerNode || isSoundDisabled(soundName)) {
        console.error(`[AudioManager/stopSound] Attempted to stop non-existent or disabled sound: ${soundName}`);
        return;
      } 

      // `0` and not `audioContext.currentTime`, to be sure it stops NOW!
      playerNode.stop(0);

      // Update the status to stopped
      soundObjs.current[soundName].status = 'stopped';
    
      verbose && console.log(`[BackingAudioManager/stopSound] Successfully stopped sound ${soundName} at audioContext.currentTime: ${audioContext.currentTime}`);
    } catch (e) {
      //// reportErrorToSentry(e, 'AudioManager/stopSound');
      console.error(`[BackingAudioManager/stopSound] Error while stopping sound ${soundName}:`, e);
    }

    // Recreate the player node for the sound so it can be played again 👀
    const newPlayerNode = await getPlayerNode(audioContext, soundObj);

    if (!newPlayerNode) {
      console.error(`[AudioManager] Can't recreate player node for sound "${soundName}"`);
      throw new Error(`Error while recreating player node for sound "${soundName}".`);
    }

    verbose && console.log('[BackingAudioManager] New player node (re)created for sound', { newPlayerNode, soundObj });

    soundObjs.current[soundName] = {
      status: 'loaded',
      url: soundObj.url,
      duration: soundObj.duration,
      playerNode: newPlayerNode,
      gainNode: soundObj.gainNode,
      audioBuffer: soundObj.audioBuffer,
    };
  };
  
  const stopBackingSounds = async () => {
    verbose && console.log('[BackingAudioManager/stopBackingSounds] Stopping playing backing sounds');

    for (const soundName of Object.keys(soundObjs.current) as SoundName[]) {
      const soundObj = soundObjs.current[soundName];
      if (soundObj && isSoundPlaying(soundName)) {
        await stopSound(soundName);
      }
    }
  };

  // ===========================
  //  useEffect (isPlaying: Play/Pause/Stop)
  // ===========================

  useEffect(() => {
    if (isGamePlaying(playMode)) {
      verbose && console.log('[BackingAudioManager/useEffect>playMode] Game is playing, starting the sounds', { playMode });
      playSounds();
    } else {
      verbose && console.log('[BackingAudioManager/useEffect>playMode] Game is not playing, stopping the sounds', { playMode });
      stopBackingSounds();
    }
  }, [playMode]);

  // ===========================
  //  useEffect (Triggering Sounds Loading)
  // ===========================


  useEffect(() => {

    loadSounds();
  }, [songData.backingTracks]);

  // ===========================
  //   useEffect (Volumes)
  // ===========================

  useEffect(() => {
    verbose && console.log('[BackingAudioManager/useEffect>volumes] Updating sounds volumes:', { soundObjs: soundObjs.current });
    for (const soundName of Object.keys(soundObjs.current) as SoundName[]) {
      const soundObj = soundObjs.current[soundName as SoundName];
      const soundData = songData.backingTracks?.find((track) => track.type === soundName);
      if (soundData && soundObj && soundObj.status === 'loaded') {
        updateGainNodeVolume(soundObj.gainNode, soundData.volume, soundName as SoundName);
      }
    }
  }, [songData.backingTracks, trackVolumes]);

  // ===========================
  //   useEffect (BPM / Rate)
  // ===========================

  const updatePlayerNodeRate = async (audioContext: AudioContext, soundName: SoundName) => {
    const soundObj = soundObjs.current[soundName];
    if (soundObj && soundObj.status === 'loaded') {
      const newPlayerNode = await getPlayerNode(audioContext, soundObj);
      
      soundObjs.current[soundName].playerNode = newPlayerNode;
      
      verbose && console.log('[BackingAudioManager/updatePlayerNodeRate] Updating player node rate for', { soundObj, newPlayerNode });
    }
  };

  const updateAllPlayerNodeRates = async () => {
    const audioContext = getOrInitializeAudioContext();
    for (const soundName of Object.keys(soundObjs.current) as SoundName[]) {
      await updatePlayerNodeRate(audioContext, soundName);
    }
  };

  useEffect(() => {
    if (userBpm) {
      verbose && console.log('[BackingAudioManager/useEffect>userBpm] Updating sounds rate based on BPM:', { userBpm });

      updateAllPlayerNodeRates();
    }
  }, [userBpm]);



  // Return nothing, it's only a "Manager"
  return <></>;
};

export default BackingAudioManager;