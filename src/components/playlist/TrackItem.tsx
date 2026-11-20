import React from 'react';
import { Song } from '../../types';
import { formatDuration } from '../../utils/formatters';
import { ExternalLink, MessageSquare } from 'lucide-react';

interface TrackItemProps {
  track: Song;
  index: number;
}

export const TrackItem: React.FC<TrackItemProps> = ({ track, index }) => {
  const trackNumber = String(index + 1).padStart(2, '0');

  return (
    <div className="group rounded-xl p-3 sm:p-4 hover:bg-white/[0.04] border border-transparent hover:border-white/10 transition-all duration-200 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Track #, Artwork, Title & Artist */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <span className="w-6 text-center font-mono text-xs text-secondary/70 group-hover:text-accent font-medium">
            {trackNumber}
          </span>

          {/* Small Artwork Thumbnail */}
          <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-surface-elevated border border-white/10 relative">
            {track.artwork_url ? (
              <img
                src={track.artwork_url}
                alt={track.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-mono text-secondary/50">
                ♪
              </div>
            )}
          </div>

          {/* Title & Artist */}
          <div className="flex-1 min-w-0">
            <h4 className="text-primary text-sm sm:text-base font-medium truncate group-hover:text-accent transition-colors">
              {track.title}
            </h4>
            <p className="text-secondary text-xs sm:text-sm truncate">
              <span>{track.artist}</span>
              {track.album && (
                <>
                  <span className="text-secondary/40 mx-1.5">·</span>
                  <span className="text-secondary/70">{track.album}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right: Duration & Spotify Outbound Link */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-xs font-mono text-secondary">
            {formatDuration(track.duration_ms)}
          </span>

          {track.spotify_url ? (
            <a
              href={track.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-accent hover:text-background text-secondary hover:text-background transition-colors focus:outline-none"
              title="Open song in Spotify"
              aria-label={`Open ${track.title} in Spotify`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <div className="w-[30px]" />
          )}
        </div>
      </div>

      {/* Personal Annotation / Note if available */}
      {track.personal_note && (
        <div className="ml-10 sm:ml-14 pl-3 border-l-2 border-accent/40 text-xs sm:text-sm text-secondary/90 italic font-sans flex items-start gap-2 py-1">
          <MessageSquare className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
          <span>{track.personal_note}</span>
        </div>
      )}
    </div>
  );
};

