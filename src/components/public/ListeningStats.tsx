import React from 'react';
import { ArchiveStats } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Disc, Music, Users, Sparkles, Eye } from 'lucide-react';

interface ListeningStatsProps {
  stats: ArchiveStats | null;
  isLoading?: boolean;
}

export const ListeningStats: React.FC<ListeningStatsProps> = ({ stats, isLoading = false }) => {
  if (isLoading && !stats) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 my-10 animate-pulse">
        <div className="h-20 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  const items = [
    {
      label: 'Playlists Curated',
      value: stats?.totalPlaylists ?? 5,
      icon: Disc,
      detail: 'hand-crafted archives',
    },
    {
      label: 'Tracks Collected',
      value: stats?.totalSongs ?? 12,
      icon: Music,
      detail: 'songs with context',
    },
    {
      label: 'Featured Artists',
      value: stats?.totalArtists ?? 9,
      icon: Users,
      detail: 'across multiple eras',
    },
    {
      label: 'Archive Visits',
      value: stats?.totalVisits ?? 140,
      icon: Eye,
      detail: 'kind visitors like you',
    },
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 my-8 sm:my-12">
      <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 shadow-glass">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`flex flex-col items-center md:items-start text-center md:text-left ${
                  idx > 0 ? 'pt-4 md:pt-0 md:pl-6' : ''
                }`}
              >
                <div className="flex items-center gap-2 text-secondary mb-1">
                  <Icon className="w-3.5 h-3.5 text-accent/80" />
                  <span className="text-xs font-mono tracking-wider uppercase">
                    {item.label}
                  </span>
                </div>
                <div className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-primary">
                  {item.value}
                </div>
                <span className="text-xs text-secondary/70 font-sans mt-0.5">
                  {item.detail}
                </span>
              </div>
            );
          })}
        </div>

        {stats?.latestPlaylist && (
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-secondary font-mono">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Latest archive addition:</span>
              <a
                href={`/playlist/${stats.latestPlaylist.slug}`}
                className="text-primary hover:text-accent underline font-sans ml-1"
              >
                {stats.latestPlaylist.title}
              </a>
            </span>
            <span className="text-secondary/60">
              Updated {formatDate(stats.latestPlaylist.updated_at)}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

