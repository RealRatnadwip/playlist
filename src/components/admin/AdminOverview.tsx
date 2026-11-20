import React from 'react';
import { Playlist, SpotifyConnectionStatus } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Plus, Disc, Music, Radio, Edit3, Eye, Clock } from 'lucide-react';

interface AdminOverviewProps {
  playlists: Playlist[];
  spotifyStatus: SpotifyConnectionStatus | null;
  onNewPlaylist: () => void;
  onEditPlaylist: (id: string) => void;
  onTabChange: (tab: string) => void;
  onTogglePublish: (id: string, currentStatus: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  playlists,
  spotifyStatus,
  onNewPlaylist,
  onEditPlaylist,
  onTabChange,
  onTogglePublish,
}) => {
  const publishedCount = playlists.filter((p) => p.status === 'published').length;
  const draftCount = playlists.filter((p) => p.status === 'draft').length;
  const totalSongs = playlists.reduce((acc, p) => acc + (p.track_count || 0), 0);

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-primary">
            Archive Overview
          </h1>
          <p className="text-secondary text-sm font-light mt-1">
            Manage your personal music archives, essays, tracks, and Spotify playback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNewPlaylist}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-background font-semibold text-sm hover:bg-accent-muted transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Playlist</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-2xl glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between text-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Published</span>
            <Disc className="w-4 h-4 text-accent" />
          </div>
          <div className="font-display text-3xl sm:text-4xl font-bold text-primary">
            {publishedCount}
          </div>
          <p className="text-xs text-secondary/70 mt-1">visible on public site</p>
        </div>

        <div className="rounded-2xl glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between text-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Drafts</span>
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="font-display text-3xl sm:text-4xl font-bold text-primary">
            {draftCount}
          </div>
          <p className="text-xs text-secondary/70 mt-1">private / unpublished</p>
        </div>

        <div className="rounded-2xl glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between text-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Total Songs</span>
            <Music className="w-4 h-4 text-accent" />
          </div>
          <div className="font-display text-3xl sm:text-4xl font-bold text-primary">
            {totalSongs}
          </div>
          <p className="text-xs text-secondary/70 mt-1">across all collections</p>
        </div>

        <div className="rounded-2xl glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between text-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Spotify Status</span>
            <Radio className="w-4 h-4 text-accent" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                spotifyStatus?.isConnected ? 'bg-accent shadow-accent-glow' : 'bg-red-500'
              }`}
            />
            <span className="text-base font-semibold text-primary">
              {spotifyStatus?.isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
          <button
            onClick={() => onTabChange('spotify')}
            className="text-xs text-accent hover:underline mt-2 font-mono"
          >
            Manage Spotify →
          </button>
        </div>
      </div>

      {/* Playlists Management Table */}
      <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden shadow-glass">
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-primary">
            All Curated Playlists
          </h2>
          <button
            onClick={() => onTabChange('playlists')}
            className="text-xs font-mono text-accent hover:underline"
          >
            Manage in detail →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.02] border-b border-white/10 text-xs font-mono uppercase text-secondary">
              <tr>
                <th className="py-3 px-4">Playlist</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Tracks</th>
                <th className="py-3 px-4">Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {playlists.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-elevated flex-shrink-0">
                        {p.cover_image_url ? (
                          <img src={p.cover_image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-secondary">
                            ♪
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-primary flex items-center gap-2">
                          <span>{p.title}</span>
                          {p.is_featured ? (
                            <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                              Featured
                            </span>
                          ) : null}
                        </div>
                        <div className="text-xs text-secondary font-mono">/{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onTogglePublish(p.id, p.status)}
                      className={`px-2.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider border ${
                        p.status === 'published'
                          ? 'bg-accent/10 border-accent/30 text-accent hover:bg-accent/20'
                          : 'bg-white/5 border-white/15 text-secondary hover:bg-white/10'
                      }`}
                    >
                      {p.status}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-secondary">
                    {p.track_count || 0} songs
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-secondary">
                    {formatDate(p.updated_at)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditPlaylist(p.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-secondary hover:text-primary transition-colors"
                        title="Edit Playlist"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <a
                        href={`/playlist/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-white/10 text-secondary hover:text-primary transition-colors"
                        title="View Public Page"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

