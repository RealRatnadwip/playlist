import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Playlist, SpotifyConnectionStatus, SiteSettings } from '../types';
import {
  fetchAdminPlaylists,
  fetchAdminPlaylistById,
  checkSpotifyStatus,
  fetchAdminSettings,
  setPlaylistStatus,
} from '../services/api';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminLogin } from '../components/admin/AdminLogin';
import { PlaylistEditor } from '../components/admin/PlaylistEditor';
import { SpotifySettings } from '../components/admin/SpotifySettings';
import { SiteSettingsEditor } from '../components/admin/SiteSettingsEditor';
import { Plus, Disc, Edit3, Eye, Loader2 } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [spotifyStatus, setSpotifyStatus] = useState<SpotifyConnectionStatus | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});

  // Editor modal/view
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const loadAdminData = async () => {
    try {
      const [pls, spot, sett] = await Promise.all([
        fetchAdminPlaylists(),
        checkSpotifyStatus(),
        fetchAdminSettings(),
      ]);
      setPlaylists(pls);
      setSpotifyStatus(spot);
      setSiteSettings(sett);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  // Handle Playlist Actions
  const handleNewPlaylist = () => {
    setEditingPlaylist(null);
    setIsEditorOpen(true);
  };

  const handleEditPlaylist = async (id: string) => {
    try {
      const full = await fetchAdminPlaylistById(id);
      setEditingPlaylist(full);
      setIsEditorOpen(true);
    } catch {
      alert('Failed to load playlist details');
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
    const ok = await setPlaylistStatus(id, nextStatus as any);
    if (ok) {
      loadAdminData();
    }
  };

  return (
    <AdminLayout currentTab={currentTab} onTabChange={(tab) => {
      setIsEditorOpen(false);
      setCurrentTab(tab);
    }}>
      {isEditorOpen ? (
        <PlaylistEditor
          playlist={editingPlaylist}
          onBack={() => setIsEditorOpen(false)}
          onSaved={() => {
            setIsEditorOpen(false);
            loadAdminData();
          }}
        />
      ) : (
        <>
          {currentTab === 'overview' && (
            <AdminOverview
              playlists={playlists}
              spotifyStatus={spotifyStatus}
              onNewPlaylist={handleNewPlaylist}
              onEditPlaylist={handleEditPlaylist}
              onTabChange={setCurrentTab}
              onTogglePublish={handleTogglePublish}
            />
          )}

          {currentTab === 'playlists' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div>
                  <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary">
                    Playlists & Archives
                  </h1>
                  <p className="text-secondary text-sm font-light mt-1">
                    Create, edit, publish, or rearrange your collections.
                  </p>
                </div>
                <button
                  onClick={handleNewPlaylist}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-background font-semibold text-xs font-mono uppercase tracking-wider hover:bg-accent-muted transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Playlist</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl glass-panel p-5 border border-white/10 flex flex-col justify-between group hover:border-white/20 transition-all"
                  >
                    <div>
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-surface-elevated mb-4 relative">
                        {p.cover_image_url ? (
                          <img src={p.cover_image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-secondary/40">
                            <Disc className="w-12 h-12 stroke-[1.2]" />
                          </div>
                        )}
                        <span
                          className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${p.status === 'published'
                              ? 'bg-accent/20 border-accent/40 text-accent'
                              : 'bg-black/60 border-white/20 text-secondary'
                            }`}
                        >
                          {p.status}
                        </span>
                      </div>

                      <h3 className="font-display text-xl font-bold text-primary group-hover:text-accent transition-colors">
                        {p.title}
                      </h3>
                      {p.description && (
                        <p className="text-secondary text-xs mt-1.5 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-secondary">
                      <span>{p.track_count || 0} tracks</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditPlaylist(p.id)}
                          className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-primary flex items-center gap-1 font-sans"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <a
                          href={`/playlist/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded hover:bg-white/10 text-secondary hover:text-primary"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === 'spotify' && (
            <SpotifySettings status={spotifyStatus} onRefresh={loadAdminData} />
          )}

          {currentTab === 'settings' && (
            <SiteSettingsEditor settings={siteSettings} onSaved={loadAdminData} />
          )}
        </>
      )}
    </AdminLayout>
  );
};
