import React from 'react';
import { Playlist } from '../../types';
import { formatDate } from '../../utils/formatters';
import { ArrowLeft, ExternalLink, Music, Users, Calendar } from 'lucide-react';

interface PlaylistHeaderProps {
  playlist: Playlist;
}

export const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({ playlist }) => {
  return (
    <div className="relative pt-24 sm:pt-32 pb-12 sm:pb-16 overflow-hidden">
      {/* Blurred artwork backdrop */}
      {playlist.cover_image_url && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 filter blur-3xl scale-125 pointer-events-none -z-10"
          style={{ backgroundImage: `url(${playlist.cover_image_url})` }}
        />
      )}

      <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-secondary hover:text-accent transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to all archives</span>
        </a>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 sm:gap-12">
          {/* Large Playlist Artwork */}
          <div className="relative flex-shrink-0 w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-surface">
            {playlist.cover_image_url ? (
              <img
                src={playlist.cover_image_url}
                alt={playlist.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-elevated text-secondary/40">
                <Music className="w-20 h-20 stroke-[1.2]" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>

          {/* Playlist Metadata & Details */}
          <div className="flex-1 text-center md:text-left flex flex-col justify-between">
            <div>
              {/* Tags */}
              {playlist.tags && playlist.tags.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 mb-3">
                  {playlist.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-[11px] font-mono tracking-wider uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary leading-tight">
                {playlist.title}
              </h1>

              {/* Short Description */}
              {playlist.description && (
                <p className="text-secondary text-base sm:text-lg mt-3 font-light leading-relaxed max-w-xl">
                  {playlist.description}
                </p>
              )}

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-6 text-xs font-mono text-secondary">
                <span className="flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-accent" />
                  <span>{playlist.track_count || (playlist.tracks ? playlist.tracks.length : 0)} tracks</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-accent" />
                  <span>{playlist.artist_count || 1} artists</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  <span>Published {formatDate(playlist.published_at || playlist.created_at)}</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4">
              {playlist.spotify_playlist_url && (
                <a
                  href={playlist.spotify_playlist_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-accent text-background font-semibold text-sm hover:bg-accent-muted transition-all shadow-glass hover:shadow-accent-glow"
                >
                  <span>Open Playlist in Spotify</span>
                  <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

