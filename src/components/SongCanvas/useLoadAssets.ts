import { useCallback, useEffect, useMemo, useState } from 'react';
import { AudioContext, AudioBuffer } from 'react-native-audio-api';

import { commonAssets, SongAsset } from '@/songs';

export interface AudioAsset {
  songAsset: SongAsset;
  audioBuffer: AudioBuffer;
}

const verbose = true;

export default function useLoadAssets(
  audioContext: AudioContext,
  assets: SongAsset[]
) {
  const [isLoading, setIsLoading] = useState(true);
  const [audioAssets, setAudioAssets] = useState<Record<string, AudioAsset>>(
    {}
  );

  useEffect(() => {
    async function loadAsset(asset: SongAsset) {
      if (audioAssets[asset.id]) {
        return;
      }

      try {
        const audioBuffer = await audioContext.decodeAudioDataSource(asset.url);

        setAudioAssets((prev) => ({
          ...prev,
          [asset.id]: {
            songAsset: asset,
            audioBuffer,
          },
        }));
      } catch {
        console.warn(`[AudioPlayback] Failed to load asset: ${asset.name}`);
      }
    }

    assets.forEach(loadAsset);
    commonAssets.forEach(loadAsset);
  }, [audioContext, audioAssets, assets]);

  const getAsset = useCallback(
    (assetId: string) => {
      return audioAssets[assetId];
    },
    [audioAssets]
  );

  useEffect(() => {
    if (
      Object.keys(audioAssets).length !==
      assets.length + commonAssets.length
    ) {
      return;
    }

    setIsLoading(false);

    if (verbose) {
      console.log(
        '[AudioPlayback] All assets loaded:\r\n',
        Object.values(audioAssets)
          .map((asset) => `• ${asset.songAsset.name}\n`)
          .join('')
      );
    }
  }, [audioAssets, assets]);

  return useMemo(
    () => ({
      isLoading,
      getAsset,
    }),
    [isLoading, getAsset]
  );
}
