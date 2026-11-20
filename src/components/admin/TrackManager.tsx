import React, { useState } from 'react';
import { lookupSpotifyTrack } from '../../services/api';
import { Song } from '../../types';
import { formatDuration } from '../../utils/formatters';
import { Search, Plus, Trash2, ArrowUp, ArrowDown, Music, Loader2 } from 'lucide-react';

interface TrackManagerProps {
  tracks: Song[];
  onAddSong: (songData: any) => Promise<boolean>;
  onRemoveSong: (playlistSongId: string) => Promise<boolean>;
  onReorder: (tracks: Song[]) => Promise<boolean>;
  onUpdateNote?: (playlistSongId: string, note: string) => Promise<boolean>;
}

export const TrackManager: React.FC<TrackManagerProps> = ({
  tracks,
  onAddSong,
  onRemoveSong,
  onReorder,
}) => {
  const [activeTab, setActiveTab] = useState<'spotify' | 'manual'>('spotify');
  const [spotifyQuery, setSpotifyQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Manual Form
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [artworkUrl, setArtworkUrl] = useState('');
  const [durationStr, setDurationStr] = useState('3:30');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [personalNote, setPersonalNote] = useState('');

  // Handle Spotify track lookup
  const handleSpotifyLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotifyQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const trackData = await lookupSpotifyTrack(spotifyQuery.trim());
      // Auto add
      const success = await onAddSong({
        spotifyTrackId: trackData.spotifyTrackId,
        title: trackData.title,
        artist: trackData.artist,
        album: trackData.album,
        artworkUrl: trackData.artworkUrl,
        durationMs: trackData.durationMs,
        spotifyUrl: trackData.spotifyUrl,
        personalNote: personalNote.trim() || undefined,
      });

      if (success) {
        setSpotifyQuery('');
        setPersonalNote('');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Track not found');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Manual Add
  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    // Parse duration "3:30" -> ms
    let ms = 210000;
    if (durationStr.includes(':')) {
      const [min, sec] = durationStr.split(':').map((n) => parseInt(n, 10));
      ms = ((min || 0) * 60 + (sec || 0)) * 1000;
    }

    const success = await onAddSong({
      title: title.trim(),
      artist: artist.trim(),
      album: album.trim() || null,
      artworkUrl: artworkUrl.trim() || null,
      durationMs: ms,
      spotifyUrl: spotifyUrl.trim() || null,
      personalNote: personalNote.trim() || undefined,
    });

    if (success) {
      setTitle('');
      setArtist('');
      setAlbum('');
      setArtworkUrl('');
      setDurationStr('3:30');
      setSpotifyUrl('');
      setPersonalNote('');
    }
  };

  // Move track position up / down
  const moveTrack = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tracks.length) return;

    const newTracks = [...tracks];
    const temp = newTracks[index];
    newTracks[index] = newTracks[targetIndex];
    newTracks[targetIndex] = temp;

    onReorder(newTracks);
  };

  return (
    <div className="space-y-6">
      {/* Add Song Form Card */}
      <div className="rounded-2xl glass-panel p-5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Songs to Playlist</span>
          </span>

          <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('spotify')}
              className={`px-3 py-1 rounded text-xs font-mono ${activeTab === 'spotify' ? 'bg-accent text-background font-semibold' : 'text-secondary'
                }`}
            >
              Spotify URL Lookup
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-1 rounded text-xs font-mono ${activeTab === 'manual' ? 'bg-accent text-background font-semibold' : 'text-secondary'
                }`}
            >
              Manual Entry
            </button>
          </div>
        </div>

        {activeTab === 'spotify' ? (
          <form onSubmit={handleSpotifyLookup} className="space-y-3">
            <div>
              <label className="block text-xs font-mono text-secondary mb-1">
                Spotify Track URL or ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"
                  value={spotifyQuery}
                  onChange={(e) => setSpotifyQuery(e.target.value)}
                  className="flex-1 bg-surface-elevated border border-white/10 rounded-xl px-4 py-2.5 text-sm text-primary placeholder-secondary/40 focus:outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={isSearching || !spotifyQuery.trim()}
                  className="px-5 py-2.5 rounded-xl bg-accent text-background font-semibold text-xs font-mono uppercase tracking-wider hover:bg-accent-muted disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Lookup & Add</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-secondary mb-1">
                Personal Track Note (Optional annotation)
              </label>
              <input
                type="text"
                placeholder='e.g. "Track 04 — This one always reminds me of the way home."'
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-4 py-2 text-xs text-primary placeholder-secondary/40 focus:outline-none focus:border-accent"
              />
            </div>

            {searchError && (
              <p className="text-xs text-red-400 font-mono mt-1">{searchError}</p>
            )}
          </form>
        ) : (
          <form onSubmit={handleManualAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-secondary mb-1">Song Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-sm text-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-secondary mb-1">Artist *</label>
              <input
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-sm text-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-secondary mb-1">Album</label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-sm text-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-secondary mb-1">Duration (m:ss)</label>
              <input
                type="text"
                value={durationStr}
                onChange={(e) => setDurationStr(e.target.value)}
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-sm text-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-secondary mb-1">Artwork URL</label>
              <input
                type="url"
                value={artworkUrl}
                onChange={(e) => setArtworkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-sm text-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-secondary mb-1">Spotify URL</label>
              <input
                type="url"
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-sm text-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-secondary mb-1">Personal Note</label>
              <input
                type="text"
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                placeholder="Memories attached to this song..."
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-sm text-primary"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-accent text-background font-semibold text-xs font-mono uppercase tracking-wider hover:bg-accent-muted"
              >
                Add Track Manually
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Ordered Tracklist View */}
      <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between text-xs font-mono text-secondary">
          <span>Current Tracklist ({tracks.length})</span>
          <span>Use arrows to reorder</span>
        </div>

        {tracks.length === 0 ? (
          <div className="p-8 text-center text-secondary text-sm">
            <Music className="w-8 h-8 mx-auto mb-2 text-secondary/40" />
            <p>No tracks added yet. Use the tool above to add songs.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {tracks.map((t, idx) => (
              <div key={t.playlist_song_id || t.id || idx} className="p-3 sm:p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="font-mono text-xs text-secondary/60 w-5">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <div className="w-9 h-9 rounded-md bg-surface-elevated overflow-hidden flex-shrink-0">
                    {t.artwork_url ? (
                      <img src={t.artwork_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-secondary">♪</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-primary text-sm truncate">{t.title}</div>
                    <div className="text-xs text-secondary truncate">{t.artist}</div>
                    {t.personal_note && (
                      <div className="text-[11px] text-accent/80 italic mt-0.5 truncate">
                        "{t.personal_note}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-xs font-mono text-secondary mr-2">
                    {formatDuration(t.duration_ms)}
                  </span>

                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveTrack(idx, 'up')}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-secondary"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={idx === tracks.length - 1}
                    onClick={() => moveTrack(idx, 'down')}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-secondary"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {t.playlist_song_id && (
                    <button
                      type="button"
                      onClick={() => onRemoveSong(t.playlist_song_id!)}
                      className="p-1 rounded hover:bg-red-500/20 text-secondary hover:text-red-400 ml-1"
                      title="Remove song from playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

