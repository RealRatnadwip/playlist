import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { NowPlaying } from '../types';
import { fetchNowPlaying } from '../services/api';

interface NowPlayingContextType {
  nowPlaying: NowPlaying | null;
  isLoading: boolean;
  lastFetched: number | null;
  refresh: () => Promise<void>;
}

const NowPlayingContext = createContext<NowPlayingContextType>({
  nowPlaying: null,
  isLoading: true,
  lastFetched: null,
  refresh: async () => {},
});

export const NowPlayingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const timerRef = useRef<any>(null);
  const isPlayingRef = useRef<boolean>(false);

  // Keep isPlayingRef updated without triggering effect re-runs
  useEffect(() => {
    isPlayingRef.current = Boolean(nowPlaying?.isPlaying);
  }, [nowPlaying?.isPlaying]);

  const fetchStatus = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await fetchNowPlaying();
      setNowPlaying(data);
      setLastFetched(Date.now());
      isPlayingRef.current = Boolean(data?.isPlaying);

      // Preload album artwork in the background so it's instantly decoded by the browser
      if (data?.albumArtwork) {
        const img = new Image();
        img.src = data.albumArtwork;
      }
    } catch (err) {
      console.error('Failed to fetch now-playing status:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const poll = async () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (document.hidden || !isMounted) return;

      await fetchStatus(false);
      if (!isMounted || document.hidden) return;

      // 10s when music is playing (real-time responsive), 25s when quiet
      const delay = isPlayingRef.current ? 10000 : 25000;
      timerRef.current = setTimeout(poll, delay);
    };

    // Initial fetch on mount
    fetchStatus(true).then(() => {
      if (isMounted && !document.hidden) {
        const delay = isPlayingRef.current ? 10000 : 25000;
        timerRef.current = setTimeout(poll, delay);
      }
    });

    const handleVisibilityChange = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (!document.hidden && isMounted) {
        // Tab restored from background: immediately poll for freshest status and resume loop
        poll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchStatus]);

  return (
    <NowPlayingContext.Provider
      value={{
        nowPlaying,
        isLoading,
        lastFetched,
        refresh: () => fetchStatus(false),
      }}
    >
      {children}
    </NowPlayingContext.Provider>
  );
};

export const useNowPlayingContext = () => useContext(NowPlayingContext);
