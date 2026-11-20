import React from 'react';
import { Song } from '../../types';
import { TrackItem } from './TrackItem';
import { Music2, Clock } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

interface TrackListProps {
  tracks: Song[] | undefined;
}

export const TrackList: React.FC<TrackListProps> = ({ tracks }) => {
  if (!tracks || tracks.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 my-10 text-center py-12 rounded-2xl glass-panel text-secondary">
        <Music2 className="w-8 h-8 mx-auto mb-2 text-secondary/40" />
        <p>No tracks added to this playlist yet.</p>
      </div>
    );
  }

  // Calculate total duration
  const totalMs = tracks.reduce((acc, t) => acc + (t.duration_ms || 0), 0);

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 my-12 sm:my-16">
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 shadow-glass">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 text-xs font-mono text-secondary">
          <span className="uppercase tracking-widest text-primary font-semibold flex items-center gap-2">
            <Music2 className="w-4 h-4 text-accent" />
            <span>Tracklist ({tracks.length})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-secondary/70" />
            <span>{formatDuration(totalMs)} total runtime</span>
          </span>
        </div>

        {/* Tracks List */}
        <div className="divide-y divide-white/5 space-y-1">
          {tracks.map((track, idx) => (
            <TrackItem key={track.id || idx} track={track} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

