import React from 'react';
import { Playlist } from '../../types';
import { formatDate } from '../../utils/formatters';
import { BookOpen, ExternalLink, Music, ArrowUpRight } from 'lucide-react';

interface PlaylistCardProps {
  playlist: Playlist;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  const hasStory = Boolean(playlist.story_content && playlist.story_content.length > 50);

  return (
    <article className="group relative rounded-2xl glass-panel-interactive overflow-hidden flex flex-col justify-between border border-white/10 transition-all duration-300">
      {/* Clickable Card Link to Dedicated Detail Page */}
      <a
        href={`/playlist/${playlist.slug}`}
        className="flex-1 flex flex-col focus:outline-none"
        aria-label={`View playlist ${playlist.title}`}
      >
        {/* Cover Artwork Container */}
        <div className="relative aspect-square w-full overflow-hidden bg-surface-elevated">
          {playlist.cover_image_url ? (
            <img
              src={playlist.cover_image_url}
              alt={playlist.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface to-surface-elevated text-secondary/40">
              <Music className="w-14 h-14 stroke-[1.2]" />
            </div>
          )}

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
            {/* Story Indicator Badge */}
            {hasStory && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-mono text-accent">
                <BookOpen className="w-3 h-3 text-accent" />
                <span>Story Inside</span>
              </span>
            )}

            {playlist.is_featured ? (
              <span className="ml-auto px-2 py-0.5 rounded-md bg-accent/20 border border-accent/40 text-[10px] font-mono text-accent uppercase tracking-wider">
                Featured
              </span>
            ) : null}
          </div>

          {/* Bottom Overlay Info on Artwork */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/80 font-mono z-10">
            <span>{playlist.track_count || (playlist.tracks ? playlist.tracks.length : 0)} tracks</span>
            <span>{formatDate(playlist.published_at || playlist.created_at, false)}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Tags */}
            {playlist.tags && playlist.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {playlist.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Playlist Title */}
            <h3 className="font-display text-2xl font-bold tracking-tight text-primary group-hover:text-accent transition-colors leading-tight line-clamp-2">
              {playlist.title}
            </h3>

            {/* Short Description */}
            {playlist.description && (
              <p className="text-secondary text-sm mt-2 line-clamp-2 leading-relaxed">
                {playlist.description}
              </p>
            )}
          </div>

          {/* Card Footer: Detail Link indicator */}
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-secondary group-hover:text-primary transition-colors">
            <span className="font-medium inline-flex items-center gap-1">
              Read story & listen <ArrowUpRight className="w-3.5 h-3.5 text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </a>

      {/* External Spotify Direct Link */}
      {playlist.spotify_playlist_url && (
        <a
          href={playlist.spotify_playlist_url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/80 hover:text-accent hover:border-accent/40 transition-colors z-20 focus:outline-none"
          title="Open playlist in Spotify"
          aria-label="Open playlist in Spotify"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </article>
  );
};

