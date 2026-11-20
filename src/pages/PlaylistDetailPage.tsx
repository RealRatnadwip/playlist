import React, { useState, useEffect } from 'react';
import { Playlist } from '../types';
import { fetchPlaylistBySlug, recordVisit } from '../services/api';
import { Navigation } from '../components/common/Navigation';
import { Footer } from '../components/common/Footer';
import { SEO } from '../components/common/SEO';
import { PlaylistHeader } from '../components/playlist/PlaylistHeader';
import { PlaylistStory } from '../components/playlist/PlaylistStory';
import { TrackList } from '../components/playlist/TrackList';
import { ArrowLeft, Disc3 } from 'lucide-react';

interface PlaylistDetailPageProps {
  slug: string;
}

export const PlaylistDetailPage: React.FC<PlaylistDetailPageProps> = ({ slug }) => {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadPlaylist() {
      setIsLoading(true);
      setNotFound(false);
      try {
        const data = await fetchPlaylistBySlug(slug);
        if (data) {
          setPlaylist(data);
          recordVisit(data.id);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadPlaylist();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Disc3 className="w-10 h-10 text-accent animate-spin" />
        <span className="font-mono text-xs uppercase tracking-widest text-secondary mt-4">
          Unpacking archive...
        </span>
      </div>
    );
  }

  if (notFound || !playlist) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary mb-3">
            Archive Not Found
          </h1>
          <p className="text-secondary text-sm max-w-md mb-6">
            The playlist "{slug}" might be archived or still a private draft.
          </p>
          <a
            href="/"
            className="px-6 py-2.5 rounded-full bg-accent text-background font-semibold text-xs font-mono uppercase tracking-wider"
          >
            Return to Archives
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-accent selection:text-background relative">
      <SEO
        title={`${playlist.title} · Personal Playlist Archive`}
        description={playlist.description || `The story and tracks behind ${playlist.title}.`}
        image={playlist.cover_image_url || undefined}
      />

      <Navigation />

      <main className="pb-16">
        {/* Editorial Playlist Header */}
        <PlaylistHeader playlist={playlist} />

        {/* Content Section: 2-Column on Wide Screens, Stacked on Mobile */}
        <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10">
          {playlist.story_content ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* Left Column: The Editorial Story */}
              <div className="lg:col-span-7 xl:col-span-7">
                <PlaylistStory
                  storyContent={playlist.story_content}
                  playlistTitle={playlist.title}
                />
              </div>

              {/* Right Column: The Tracklist (sticky on desktop) */}
              <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-24">
                <TrackList tracks={playlist.tracks} />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <TrackList tracks={playlist.tracks} />
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="mt-14 pt-8 border-t border-white/10 flex items-center justify-between">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-secondary hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Archives</span>
            </a>

            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs font-mono text-secondary/60 hover:text-primary transition-colors"
            >
              ↑ Back to Top
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

