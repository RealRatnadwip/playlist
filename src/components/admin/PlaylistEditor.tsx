import React, { useState } from 'react';
import { Playlist, Song } from '../../types';
import { TrackManager } from './TrackManager';
import {
  createAdminPlaylist,
  updateAdminPlaylist,
  deleteAdminPlaylist,
  addSongToPlaylist,
  addBatchSongsToPlaylist,
  removeSongFromPlaylist,
  updatePlaylistSongs,
} from '../../services/api';
import { ArrowLeft, Save, Trash2, Sparkles, Image, Check, ExternalLink } from 'lucide-react';

interface PlaylistEditorProps {
  playlist: Playlist | null;
  onBack: () => void;
  onSaved: () => void;
}

export const PlaylistEditor: React.FC<PlaylistEditorProps> = ({ playlist, onBack, onSaved }) => {
  const isEditing = Boolean(playlist && playlist.id);

  // Form states
  const [title, setTitle] = useState(playlist?.title || '');
  const [slug, setSlug] = useState(playlist?.slug || '');
  const [description, setDescription] = useState(playlist?.description || '');
  const [storyContent, setStoryContent] = useState(playlist?.story_content || '');
  const [coverImageUrl, setCoverImageUrl] = useState(playlist?.cover_image_url || '');
  const [spotifyPlaylistUrl, setSpotifyPlaylistUrl] = useState(playlist?.spotify_playlist_url || '');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(playlist?.status || 'draft');
  const [isFeatured, setIsFeatured] = useState<boolean>(Boolean(playlist?.is_featured));
  const [displayOrder, setDisplayOrder] = useState<number>(playlist?.display_order || 0);
  const [tagInput, setTagInput] = useState((playlist?.tags || []).join(', '));

  const [tracks, setTracks] = useState<Song[]>(playlist?.tracks || []);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto generate slug on title change if creating new
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isEditing || !slug) {
      const generated = newTitle
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    setErrorMessage(null);

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      storyContent: storyContent.trim(),
      coverImageUrl: coverImageUrl.trim() || null,
      spotifyPlaylistUrl: spotifyPlaylistUrl.trim() || null,
      status,
      isFeatured,
      displayOrder,
      tags,
    };

    try {
      if (isEditing && playlist) {
        const res = await updateAdminPlaylist(playlist.id, payload as any);
        if (res.success) {
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
          onSaved();
        } else {
          setErrorMessage(res.error || 'Failed to update playlist');
        }
      } else {
        const res = await createAdminPlaylist(payload as any);
        if (res.success) {
          setSavedSuccess(true);
          setTimeout(() => {
            onSaved();
          }, 1000);
        } else {
          setErrorMessage(res.error || 'Failed to create playlist');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Save error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!playlist) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${playlist.title}"?`)) {
      return;
    }

    const res = await deleteAdminPlaylist(playlist.id);
    if (res.success) {
      onSaved();
    } else {
      alert(res.error || 'Failed to delete');
    }
  };

  // Track management handlers
  const handleAddSong = async (songData: any): Promise<boolean> => {
    if (!playlist?.id) {
      alert('Please save the playlist first before adding tracks.');
      return false;
    }
    const res = await addSongToPlaylist(playlist.id, songData);
    if (res.success) {
      // Reload tracks
      setTracks((prev) => [
        ...prev,
        {
          ...songData,
          id: res.songId,
          playlist_song_id: res.playlistSongId,
          position: prev.length + 1,
        },
      ]);
      return true;
    } else {
      alert(res.error || 'Failed to add song');
      return false;
    }
  };

  const handleAddBatchSongs = async (batchTracks: any[]): Promise<boolean> => {
    if (!playlist?.id) {
      alert('Please save the playlist first before adding tracks.');
      return false;
    }
    const res = await addBatchSongsToPlaylist(playlist.id, batchTracks);
    if (res.success && res.tracks) {
      setTracks((prev) => [...prev, ...res.tracks!]);
      return true;
    } else {
      alert(res.error || 'Failed to add batch tracks');
      return false;
    }
  };

  const handleRemoveSong = async (playlistSongId: string): Promise<boolean> => {
    if (!playlist?.id) return false;
    const ok = await removeSongFromPlaylist(playlist.id, playlistSongId);
    if (ok) {
      setTracks((prev) => prev.filter((t) => t.playlist_song_id !== playlistSongId));
      return true;
    }
    return false;
  };

  const handleReorder = async (newTracks: Song[]): Promise<boolean> => {
    setTracks(newTracks);
    if (!playlist?.id) return true;

    const reorderPayload = newTracks.map((t, idx) => ({
      playlistSongId: t.playlist_song_id,
      position: idx + 1,
    }));

    return await updatePlaylistSongs(playlist.id, { reorder: reorderPayload });
  };

  const handleUpdateNote = async (playlistSongId: string, note: string): Promise<boolean> => {
    if (!playlist?.id) return false;
    return await updatePlaylistSongs(playlist.id, {
      updates: [{ playlistSongId, personalNote: note }],
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-white/10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-secondary hover:text-accent transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Playlists</span>
        </button>

        <div className="flex items-center gap-3">
          {isEditing && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete Playlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-background font-semibold text-xs font-mono uppercase tracking-wider hover:bg-accent-muted transition-colors shadow-sm disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Playlist'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono">
          {errorMessage}
        </div>
      )}

      {/* Main Grid: Left Editor & Right Metadata / Tracks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Metadata & Story Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Fields */}
          <div className="rounded-2xl glass-panel p-6 border border-white/10 space-y-4">
            <div>
              <label className="block text-xs font-mono text-secondary mb-1">
                Playlist Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Late Nights in North Kolkata"
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-4 py-3 text-lg font-display font-bold text-primary placeholder-secondary/40 focus:outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-secondary mb-1">
                  URL Slug
                </label>
                <div className="flex items-center bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-secondary">
                  <span>/playlist/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 bg-transparent text-primary focus:outline-none ml-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-secondary mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Late nights, Bengali, Indie"
                  className="w-full bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-secondary mb-1">
                Short Description (1-2 sentences)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A sentence capturing the mood, setting, or purpose..."
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-4 py-2.5 text-sm text-primary placeholder-secondary/40 focus:outline-none focus:border-accent leading-relaxed"
              />
            </div>
          </div>

          {/* Story Editor: Dedicated Journal Experience */}
          <div className="rounded-2xl glass-panel p-6 border border-white/10 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Story & Listening Journal</span>
              </span>
              <span className="text-[11px] font-mono text-secondary/60">
                Supports markdown & quotes (start lines with &gt;)
              </span>
            </div>

            <p className="text-xs text-secondary leading-relaxed font-light">
              Write the memory, context, who inspired it, or what was happening in your life when you collected these tracks.
            </p>

            <textarea
              rows={12}
              value={storyContent}
              onChange={(e) => setStoryContent(e.target.value)}
              placeholder="There is a particular stillness that only North Kolkata knows once the tram lines shut down..."
              className="w-full bg-surface-elevated border border-white/10 rounded-xl p-4 text-base font-light text-primary/90 placeholder-secondary/30 focus:outline-none focus:border-accent leading-relaxed font-sans"
            />
          </div>

          {/* Tracks Manager */}
          {isEditing && (
            <TrackManager
              tracks={tracks}
              onAddSong={handleAddSong}
              onAddBatchSongs={handleAddBatchSongs}
              onRemoveSong={handleRemoveSong}
              onReorder={handleReorder}
              onUpdateNote={handleUpdateNote}
            />
          )}
        </div>

        {/* Right Col: Media, Publishing & Preview */}
        <div className="space-y-6">
          {/* Cover Artwork Preview & Input */}
          <div className="rounded-2xl glass-panel p-5 border border-white/10 space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-secondary font-semibold block">
              Cover Artwork
            </span>

            <div className="aspect-square w-full rounded-xl overflow-hidden bg-surface-elevated border border-white/10 relative">
              {coverImageUrl ? (
                <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-secondary/40 gap-2">
                  <Image className="w-12 h-12 stroke-[1.2]" />
                  <span className="text-xs font-mono">No cover image</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-secondary mb-1">Cover Image URL</label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent"
              />
              <p className="text-[10px] text-secondary/60 mt-1 font-mono">
                Paste an image URL or Spotify album art link.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-secondary mb-1">
                Spotify Playlist URL
              </label>
              <input
                type="url"
                value={spotifyPlaylistUrl}
                onChange={(e) => setSpotifyPlaylistUrl(e.target.value)}
                placeholder="https://open.spotify.com/playlist/..."
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Publishing Settings */}
          <div className="rounded-2xl glass-panel p-5 border border-white/10 space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-secondary font-semibold block">
              Publishing & Visibility
            </span>

            <div>
              <label className="block text-xs font-mono text-secondary mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-xs font-sans text-primary focus:outline-none focus:border-accent"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Public)</option>
                <option value="archived">Archived (Hidden)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="text-xs font-mono text-secondary">Feature on homepage</label>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded accent-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-secondary mb-1">Display Order</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent"
              />
            </div>

            {isEditing && slug && (
              <a
                href={`/playlist/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-primary hover:bg-white/10 transition-colors"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

