import React, { useState, useRef } from 'react';
import { lookupSpotifyTrack, lookupSpotifyPlaylist } from '../../services/api';
import { Song } from '../../types';
import { formatDuration } from '../../utils/formatters';
import {
  Search,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Music,
  Loader2,
  ListPlus,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  XCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface BatchItem {
  id: string; // trackId or original query
  originalQuery: string;
  status: 'pending' | 'fetching' | 'success' | 'error';
  trackData?: {
    spotifyTrackId: string;
    title: string;
    artist: string;
    album: string;
    artworkUrl: string;
    durationMs: number;
    spotifyUrl: string;
  };
  personalNote: string;
  error?: string;
}

interface TrackManagerProps {
  tracks: Song[];
  onAddSong: (songData: any) => Promise<boolean>;
  onAddBatchSongs?: (songsData: any[]) => Promise<boolean>;
  onRemoveSong: (playlistSongId: string) => Promise<boolean>;
  onReorder: (tracks: Song[]) => Promise<boolean>;
  onUpdateNote?: (playlistSongId: string, note: string) => Promise<boolean>;
}

export const TrackManager: React.FC<TrackManagerProps> = ({
  tracks,
  onAddSong,
  onAddBatchSongs,
  onRemoveSong,
  onReorder,
}) => {
  const [activeTab, setActiveTab] = useState<'batch' | 'spotify' | 'manual'>('batch');

  // Single Spotify Form
  const [spotifyQuery, setSpotifyQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [singleNote, setSingleNote] = useState('');

  // Manual Form
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [artworkUrl, setArtworkUrl] = useState('');
  const [durationStr, setDurationStr] = useState('3:30');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [manualNote, setManualNote] = useState('');

  // Batch Form States
  const [batchRawInput, setBatchRawInput] = useState('');
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [fetchPaceMs, setFetchPaceMs] = useState(280); // ~280ms delay between fetches to respect rate limits
  const [currentFetchingIndex, setCurrentFetchingIndex] = useState<number>(-1);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [batchNotification, setBatchNotification] = useState<string | null>(null);

  const isPausedRef = useRef(false);
  const isCancelledRef = useRef(false);

  // Helper to extract track IDs from text
  const parseRawInput = (text: string) => {
    const lines = text.split(/[\r\n,]+/);
    const trackIds = new Set<string>();
    let playlistId: string | null = null;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Check for Spotify playlist link
      const plMatch = line.match(/spotify\.com\/playlist\/([a-zA-Z0-9]{22})/);
      const plUriMatch = line.match(/spotify:playlist:([a-zA-Z0-9]{22})/);
      if (plMatch) playlistId = plMatch[1];
      else if (plUriMatch) playlistId = plUriMatch[1];

      // Check for individual track links / URIs / IDs
      const trackUrlMatch = line.match(/spotify\.com\/track\/([a-zA-Z0-9]{22})/);
      const trackUriMatch = line.match(/spotify:track:([a-zA-Z0-9]{22})/);
      const rawIdMatch = line.match(/^([a-zA-Z0-9]{22})$/);

      if (trackUrlMatch) {
        trackIds.add(trackUrlMatch[1]);
      } else if (trackUriMatch) {
        trackIds.add(trackUriMatch[1]);
      } else if (rawIdMatch) {
        trackIds.add(rawIdMatch[1]);
      } else {
        // Find all occurrences in messy text
        const matches = line.matchAll(/track\/([a-zA-Z0-9]{22})/g);
        for (const m of matches) {
          trackIds.add(m[1]);
        }
      }
    }

    return { playlistId, trackIds: Array.from(trackIds) };
  };

  const detected = parseRawInput(batchRawInput);

  // Start Batch Fetch Queue
  const handleStartBatchFetch = async () => {
    const { playlistId, trackIds } = parseRawInput(batchRawInput);

    if (!playlistId && trackIds.length === 0) {
      alert('Please paste at least one Spotify track link or playlist URL.');
      return;
    }

    isCancelledRef.current = false;
    isPausedRef.current = false;
    setIsPaused(false);
    setIsProcessingQueue(true);
    setBatchNotification(null);

    // Scenario A: If a Spotify playlist link is provided, fetch all its tracks
    if (playlistId && trackIds.length === 0) {
      try {
        setBatchNotification('Fetching tracks from Spotify playlist...');
        const res = await lookupSpotifyPlaylist(playlistId);
        const items: BatchItem[] = res.tracks.map((t) => ({
          id: t.spotifyTrackId,
          originalQuery: t.spotifyUrl,
          status: 'success',
          trackData: t,
          personalNote: '',
        }));
        setBatchItems(items);
        setBatchNotification(`Successfully loaded ${items.length} tracks with album art from Spotify playlist!`);
      } catch (err: any) {
        setBatchNotification(`Error loading playlist: ${err.message}`);
      } finally {
        setIsProcessingQueue(false);
      }
      return;
    }

    // Scenario B: Progressive queue for list of track links
    const initialItems: BatchItem[] = trackIds.map((id) => ({
      id,
      originalQuery: `https://open.spotify.com/track/${id}`,
      status: 'pending',
      personalNote: '',
    }));

    setBatchItems(initialItems);

    for (let i = 0; i < initialItems.length; i++) {
      if (isCancelledRef.current) break;

      // Handle pause loop
      while (isPausedRef.current) {
        await new Promise((r) => setTimeout(r, 200));
        if (isCancelledRef.current) break;
      }
      if (isCancelledRef.current) break;

      setCurrentFetchingIndex(i);

      // Set current item to fetching
      setBatchItems((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: 'fetching' } : item))
      );

      try {
        const trackData = await lookupSpotifyTrack(initialItems[i].id);
        setBatchItems((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'success', trackData } : item
          )
        );
      } catch (err: any) {
        setBatchItems((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'error', error: err.message || 'Lookup failed' } : item
          )
        );
      }

      // Respectful delay between requests to prevent Spotify rate limiting
      if (i < initialItems.length - 1 && fetchPaceMs > 0) {
        await new Promise((r) => setTimeout(r, fetchPaceMs));
      }
    }

    setCurrentFetchingIndex(-1);
    setIsProcessingQueue(false);
  };

  // Toggle Pause / Resume
  const togglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
  };

  // Cancel Queue
  const cancelQueue = () => {
    isCancelledRef.current = true;
    setIsProcessingQueue(false);
    setIsPaused(false);
    setCurrentFetchingIndex(-1);
  };

  // Update note for an item in the batch preview
  const updateBatchItemNote = (index: number, note: string) => {
    setBatchItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, personalNote: note } : item))
    );
  };

  // Remove single item from batch preview
  const removeBatchItem = (index: number) => {
    setBatchItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Add all fetched tracks into playlist
  const handleAddAllToPlaylist = async () => {
    const successfulItems = batchItems.filter(
      (item) => item.status === 'success' && item.trackData
    );

    if (successfulItems.length === 0) {
      alert('No successfully fetched tracks to add.');
      return;
    }

    setIsSubmittingBatch(true);
    setBatchNotification(null);

    const payload = successfulItems.map((item) => ({
      spotifyTrackId: item.trackData!.spotifyTrackId,
      title: item.trackData!.title,
      artist: item.trackData!.artist,
      album: item.trackData!.album,
      artworkUrl: item.trackData!.artworkUrl,
      durationMs: item.trackData!.durationMs,
      spotifyUrl: item.trackData!.spotifyUrl,
      personalNote: item.personalNote.trim() || undefined,
    }));

    try {
      if (onAddBatchSongs) {
        const ok = await onAddBatchSongs(payload);
        if (ok) {
          setBatchNotification(`Added ${payload.length} songs to your playlist!`);
          setBatchItems([]);
          setBatchRawInput('');
        }
      } else {
        // Fallback: Add one by one
        let addedCount = 0;
        for (const song of payload) {
          const ok = await onAddSong(song);
          if (ok) addedCount++;
        }
        setBatchNotification(`Added ${addedCount} songs to your playlist!`);
        setBatchItems([]);
        setBatchRawInput('');
      }
    } catch (err: any) {
      alert(`Error saving batch tracks: ${err.message}`);
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  // Handle Spotify Single Lookup
  const handleSingleSpotifyLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotifyQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const trackData = await lookupSpotifyTrack(spotifyQuery.trim());
      const success = await onAddSong({
        spotifyTrackId: trackData.spotifyTrackId,
        title: trackData.title,
        artist: trackData.artist,
        album: trackData.album,
        artworkUrl: trackData.artworkUrl,
        durationMs: trackData.durationMs,
        spotifyUrl: trackData.spotifyUrl,
        personalNote: singleNote.trim() || undefined,
      });

      if (success) {
        setSpotifyQuery('');
        setSingleNote('');
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
      personalNote: manualNote.trim() || undefined,
    });

    if (success) {
      setTitle('');
      setArtist('');
      setAlbum('');
      setArtworkUrl('');
      setDurationStr('3:30');
      setSpotifyUrl('');
      setManualNote('');
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

  const successBatchCount = batchItems.filter((i) => i.status === 'success').length;
  const progressPercent = batchItems.length
    ? Math.round(((batchItems.filter((i) => i.status !== 'pending').length) / batchItems.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Add Songs Card with Tabs */}
      <div className="rounded-2xl glass-panel p-5 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-white/5">
          <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Songs to Playlist</span>
          </span>

          <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setActiveTab('batch')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                activeTab === 'batch'
                  ? 'bg-accent text-background font-semibold shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>Bulk / List Import</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('spotify')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                activeTab === 'spotify'
                  ? 'bg-accent text-background font-semibold shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Single Track</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                activeTab === 'manual'
                  ? 'bg-accent text-background font-semibold shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <span>Manual</span>
            </button>
          </div>
        </div>

        {/* 1. BATCH IMPORT TAB */}
        {activeTab === 'batch' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-secondary">
                  Paste a list of Spotify track links or a playlist link
                </label>
                {detected.playlistId ? (
                  <span className="text-[11px] font-mono text-accent flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Spotify Playlist detected
                  </span>
                ) : detected.trackIds.length > 0 ? (
                  <span className="text-[11px] font-mono text-accent">
                    {detected.trackIds.length} track{detected.trackIds.length > 1 ? 's' : ''} detected
                  </span>
                ) : null}
              </div>

              <textarea
                rows={5}
                value={batchRawInput}
                onChange={(e) => setBatchRawInput(e.target.value)}
                disabled={isProcessingQueue}
                placeholder={`Paste track links (one per line) or a Spotify playlist link:
https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
https://open.spotify.com/track/1BxfuPKGuaTgP7aM0fbdZZ
https://open.spotify.com/track/5chkAMk1uvRbzqJVs4KEoE`}
                className="w-full bg-surface-elevated border border-white/10 rounded-xl p-3.5 text-xs font-mono text-primary placeholder-secondary/40 focus:outline-none focus:border-accent leading-relaxed disabled:opacity-50"
              />
            </div>

            {/* Fetch Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3 text-xs font-mono text-secondary">
                <span>Fetch Pace:</span>
                <select
                  value={fetchPaceMs}
                  onChange={(e) => setFetchPaceMs(Number(e.target.value))}
                  disabled={isProcessingQueue}
                  className="bg-surface-elevated border border-white/10 rounded-lg px-2.5 py-1 text-xs text-primary focus:outline-none focus:border-accent"
                >
                  <option value={350}>Gentle (350ms delay)</option>
                  <option value={280}>Standard (280ms delay)</option>
                  <option value={150}>Fast (150ms delay)</option>
                  <option value={0}>Instant (0ms delay)</option>
                </select>
                <span className="text-[10px] text-secondary/60 hidden sm:inline">
                  (Pacing prevents Spotify rate limits)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isProcessingQueue ? (
                  <>
                    <button
                      type="button"
                      onClick={togglePause}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-primary text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      <span>{isPaused ? 'Resume' : 'Pause'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={cancelQueue}
                      className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartBatchFetch}
                    disabled={!batchRawInput.trim()}
                    className="px-5 py-2.5 rounded-xl bg-accent text-background font-semibold text-xs font-mono uppercase tracking-wider hover:bg-accent-muted disabled:opacity-40 transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {detected.playlistId
                        ? 'Fetch All Playlist Tracks & Album Art'
                        : detected.trackIds.length > 0
                        ? `Fetch ${detected.trackIds.length} Tracks with Album Art`
                        : 'Start Fetching Tracks'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Notification Banner */}
            {batchNotification && (
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-xs text-accent font-mono flex items-center justify-between">
                <span>{batchNotification}</span>
                <button
                  type="button"
                  onClick={() => setBatchNotification(null)}
                  className="text-accent/60 hover:text-accent ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Live Progress Bar */}
            {batchItems.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-secondary flex items-center gap-2">
                    {isProcessingQueue ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                        <span>
                          {isPaused
                            ? 'Paused'
                            : `Fetching track ${currentFetchingIndex + 1} of ${batchItems.length}...`}
                        </span>
                      </>
                    ) : (
                      <span className="text-primary font-medium">
                        Fetch completed: {successBatchCount} of {batchItems.length} tracks ready
                      </span>
                    )}
                  </span>
                  <span className="text-accent font-semibold">{progressPercent}%</span>
                </div>

                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className="bg-accent h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Batch Items Live Preview Cards */}
                <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5 max-h-[380px] overflow-y-auto bg-surface-elevated/40">
                  {batchItems.map((item, idx) => (
                    <div
                      key={item.id + idx}
                      className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                        item.status === 'fetching'
                          ? 'bg-accent/5'
                          : item.status === 'error'
                          ? 'bg-red-500/5'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Status Icon */}
                        <div className="flex-shrink-0 w-5 text-center">
                          {item.status === 'fetching' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-accent mx-auto" />
                          ) : item.status === 'success' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent mx-auto" />
                          ) : item.status === 'error' ? (
                            <AlertCircle className="w-3.5 h-3.5 text-red-400 mx-auto" />
                          ) : (
                            <span className="font-mono text-secondary/40 text-[11px]">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                          )}
                        </div>

                        {/* Album Artwork Thumbnail */}
                        <div className="w-11 h-11 rounded-lg bg-surface-elevated overflow-hidden flex-shrink-0 border border-white/10 relative">
                          {item.trackData?.artworkUrl ? (
                            <img
                              src={item.trackData.artworkUrl}
                              alt={item.trackData.album || 'Album art'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-secondary/40">
                              <Music className="w-4 h-4 stroke-[1.5]" />
                            </div>
                          )}
                        </div>

                        {/* Track Info */}
                        <div className="flex-1 min-w-0">
                          {item.trackData ? (
                            <>
                              <div className="font-medium text-primary text-sm truncate">
                                {item.trackData.title}
                              </div>
                              <div className="text-xs text-secondary truncate">
                                {item.trackData.artist} ·{' '}
                                <span className="opacity-75">{item.trackData.album}</span>
                              </div>
                            </>
                          ) : (
                            <div className="text-xs text-secondary/70 font-mono truncate">
                              {item.id}
                              {item.status === 'error' && (
                                <span className="text-red-400 ml-2">({item.error || 'Failed'})</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Personal Note input & Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0 sm:w-1/2 justify-end">
                        <input
                          type="text"
                          placeholder="Personal memory / note..."
                          value={item.personalNote}
                          onChange={(e) => updateBatchItemNote(idx, e.target.value)}
                          className="flex-1 bg-surface-elevated border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-primary placeholder-secondary/30 focus:outline-none focus:border-accent"
                        />

                        {item.trackData?.durationMs ? (
                          <span className="font-mono text-[11px] text-secondary/70">
                            {formatDuration(item.trackData.durationMs)}
                          </span>
                        ) : null}

                        {item.trackData?.spotifyUrl && (
                          <a
                            href={item.trackData.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-secondary hover:text-accent transition-colors"
                            title="Open in Spotify"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => removeBatchItem(idx)}
                          className="p-1 text-secondary hover:text-red-400 rounded transition-colors"
                          title="Remove from batch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Add Batch Button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-mono text-secondary">
                    {successBatchCount} tracks with album art ready to import
                  </span>

                  <button
                    type="button"
                    onClick={handleAddAllToPlaylist}
                    disabled={isSubmittingBatch || successBatchCount === 0}
                    className="px-6 py-2.5 rounded-xl bg-accent text-background font-semibold text-xs font-mono uppercase tracking-wider hover:bg-accent-muted disabled:opacity-40 transition-colors flex items-center gap-2"
                  >
                    {isSubmittingBatch ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>Add All {successBatchCount} Tracks to Playlist</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. SINGLE SPOTIFY TAB */}
        {activeTab === 'spotify' && (
          <form onSubmit={handleSingleSpotifyLookup} className="space-y-3">
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
                  className="px-5 py-2.5 rounded-xl bg-accent text-background font-semibold text-xs font-mono uppercase tracking-wider hover:bg-accent-muted disabled:opacity-50 flex items-center gap-1.5 transition-colors"
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
                value={singleNote}
                onChange={(e) => setSingleNote(e.target.value)}
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-4 py-2 text-xs text-primary placeholder-secondary/40 focus:outline-none focus:border-accent"
              />
            </div>

            {searchError && <p className="text-xs text-red-400 font-mono mt-1">{searchError}</p>}
          </form>
        )}

        {/* 3. MANUAL ENTRY TAB */}
        {activeTab === 'manual' && (
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
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                placeholder="Memories attached to this song..."
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-sm text-primary"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-accent text-background font-semibold text-xs font-mono uppercase tracking-wider hover:bg-accent-muted transition-colors"
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
              <div
                key={t.playlist_song_id || t.id || idx}
                className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="font-mono text-xs text-secondary/60 w-5">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <div className="w-10 h-10 rounded-md bg-surface-elevated overflow-hidden flex-shrink-0 border border-white/10">
                    {t.artwork_url ? (
                      <img src={t.artwork_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-secondary">
                        ♪
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-primary text-sm truncate">{t.title}</div>
                    <div className="text-xs text-secondary truncate">
                      {t.artist}
                      {t.album && <span className="opacity-70"> · {t.album}</span>}
                    </div>
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

                  {t.spotify_url && (
                    <a
                      href={t.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-white/10 text-secondary hover:text-accent transition-colors"
                      title="Open in Spotify"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveTrack(idx, 'up')}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-secondary transition-colors"
                    title="Move track up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={idx === tracks.length - 1}
                    onClick={() => moveTrack(idx, 'down')}
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-secondary transition-colors"
                    title="Move track down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {t.playlist_song_id && (
                    <button
                      type="button"
                      onClick={() => onRemoveSong(t.playlist_song_id!)}
                      className="p-1 rounded hover:bg-red-500/20 text-secondary hover:text-red-400 ml-1 transition-colors"
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
