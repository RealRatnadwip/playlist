import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  refresh: async () => { },
});

export const NowPlayingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const fetchStatus = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await fetchNowPlaying();
      setNowPlaying(data);
      setLastFetched(Date.now());
    } catch (err) {
      console.error('Failed to fetch now-playing status:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchStatus(true);

    // Periodic polling (25 seconds interval)
    // Only poll when the tab is currently visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchStatus(false);
      }
    }, 25000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStatus(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
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

