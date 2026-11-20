import React, { useState, useEffect } from 'react';
import { Playlist, ArchiveStats, SiteSettings } from '../types';
import { fetchPlaylists, fetchStats, fetchPublicSettings, recordVisit } from '../services/api';
import { Navigation } from '../components/common/Navigation';
import { Footer } from '../components/common/Footer';
import { SEO } from '../components/common/SEO';
import { NowPlayingHero } from '../components/public/NowPlayingHero';
import { ListeningStats } from '../components/public/ListeningStats';
import { PlaylistGrid } from '../components/public/PlaylistGrid';
import { AboutSection } from '../components/public/AboutSection';

export const HomePage: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Record visit on arrival
    recordVisit();

    async function loadData() {
      try {
        const [loadedPlaylists, loadedStats, loadedSettings] = await Promise.all([
          fetchPlaylists(),
          fetchStats(),
          fetchPublicSettings(),
        ]);
        setPlaylists(loadedPlaylists);
        setStats(loadedStats);
        setSettings(loadedSettings);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-accent selection:text-background relative">
      <SEO
        title="ratnadwip. // playlist journal"
        description="A personal music archive, listening journal and playlist collection belonging to Ratnadwip Sarkar. Real-time listening status, curated playlists, and the stories behind them."
      />

      {/* Floating Header */}
      <Navigation />

      {/* Main Public Content */}
      <main>
        {/* 1. Hero: Currently Playing */}
        <NowPlayingHero />

        {/* 2. Personal Listening Statistics */}
        <ListeningStats stats={stats} isLoading={isLoading} />

        {/* 3. Curated Playlists Collection */}
        <PlaylistGrid playlists={playlists} isLoading={isLoading} />

        {/* 4. About & Personal Context */}
        <AboutSection settings={settings} />
      </main>

      {/* 5. Minimal Personal Signature Footer */}
      <Footer />
    </div>
  );
};

