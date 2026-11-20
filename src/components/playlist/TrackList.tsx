import React from 'react';
import { Song } from '../../types';
import { TrackItem } from './TrackItem';
import { Music2, Clock } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

interface TrackListProps {
  tracks: Song[] | undefined;
  className?: string;
  maxHeight?: string;
}

export const TrackList: React.FC<TrackListProps> = ({ tracks, className = '', maxHeight }) => {
  if (!tracks || tracks.length === 0) {
    return (
      <div className={`w-full text-center py-12 rounded-2xl sm:rounded-3xl glass-panel text-secondary border border-white/10 ${className}`}>
        <Music2 className="w-8 h-8 mx-auto mb-2 text-secondary/40" />
        <p className="text-sm font-mono">No tracks added to this playlist yet.</p>
      </div>
    );
  }

  // Calculate total duration
  const totalMs = tracks.reduce((acc, t) => acc + (t.duration_ms || 0), 0);

  return (
    <div className={`w-full rounded-2xl sm:rounded-3xl glass-panel p-5 sm:p-7 md:p-8 border border-white/10 shadow-glass flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 text-xs font-mono text-secondary flex-shrink-0">
        <span className="uppercase tracking-widest text-primary font-semibold flex items-center gap-2">
          <Music2 className="w-4 h-4 text-accent" />
          <span>Tracklist ({tracks.length})</span>
        </span>
        <span className="flex items-center gap-1.5 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-secondary/70" />
          <span>{formatDuration(totalMs)}</span>
        </span>
      </div>

      {/* Tracks List with smooth internal scrolling and flex-1 min-h-0 constraint */}
      <div
        className="divide-y divide-white/5 space-y-1 flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2 tracklist-scroll"
        style={maxHeight ? { maxHeight } : undefined}
      >
        {tracks.map((track, idx) => (
          <TrackItem key={track.id || idx} track={track} index={idx} />
        ))}
      </div>

      {/* Subtle Sign-off matching the Story Card footer */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-secondary/60 flex-shrink-0">
        <span>{tracks.length} curated {tracks.length === 1 ? 'track' : 'tracks'}</span>
        <span>Archive Audio</span>
      </div>
    </div>
  );
};
