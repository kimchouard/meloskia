import { memo, useMemo, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { Song } from '@/songs';
import SongNotFound from './SongNotFound';
import { isGamePlaying } from '@/utils/utils';

import { PlayerState, SongCanvasContextType } from './types';
import { SongCanvasContext } from './SongCanvasContext';
import CanvasHeader from './CanvasHeader';
import CanvasCTA from './CanvasCTA';

interface SongCanvasProps {
  song?: Song;
}

const SongCanvas: React.FC<SongCanvasProps> = ({ song }) => {
  const [state, setState] = useState<PlayerState>('stopped');
  const [bpm, setBpm] = useState<number>(song?.baseBpm ?? 120);
  const noteRollY = useSharedValue(0);

  const startGame = (startMode: 'playing' | 'playback') => {
    setState(startMode);
  };

  const restartGame = () => {
    setState('stopped');
  };

  const stableContext = useMemo<SongCanvasContextType>(
    () => ({
      song,
      bpm,
      state,
      noteRollY,
      setBpm,
      startGame,
      restartGame,
    }),
    [state, song, bpm, noteRollY]
  );

  if (!song) {
    return <SongNotFound />;
  }

  return (
    <SongCanvasContext.Provider value={stableContext}>
      <CanvasHeader />
      {!isGamePlaying(state) && <CanvasCTA />}
    </SongCanvasContext.Provider>
  );
};

export default memo(SongCanvas);
