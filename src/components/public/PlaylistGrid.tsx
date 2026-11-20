import React, { useState, useMemo } from 'react';
import { Playlist } from '../../types';
import { PlaylistCard } from './PlaylistCard';
import { Filter, ArrowUpDown } from 'lucide-react';

interface PlaylistGridProps {
  playlists: Playlist[];
  isLoading?: boolean;
}

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({ playlists, isLoading = false }) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Gather unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    playlists.forEach((p) => {
      (p.tags || []).forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [playlists]);

  // Filter & sort
  const filteredPlaylists = useMemo(() => {
    let result = [...playlists];

    if (selectedTag !== 'all') {
      result = result.filter((p) =>
        p.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'featured') {
        const featA = a.is_featured ? 1 : 0;
        const featB = b.is_featured ? 1 : 0;
        if (featA !== featB) return featB - featA;
        return (a.display_order || 0) - (b.display_order || 0);
      }
      if (sortBy === 'recent_added') {
        return (b.published_at || b.created_at) - (a.published_at || a.created_at);
      }
      if (sortBy === 'recent_updated') {
        return b.updated_at - a.updated_at;
      }
      if (sortBy === 'oldest') {
        return (a.published_at || a.created_at) - (b.published_at || b.created_at);
      }
      return (a.display_order || 0) - (b.display_order || 0);
    });

    return result;
  }, [playlists, selectedTag, sortBy]);

  return (
    <section id="playlists" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
        <div>
          <span className="text-xs font-mono tracking-widest uppercase text-accent font-semibold">
            Archive Catalog
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary mt-1">
            A collection of things I've been listening to.
          </h2>
          <p className="text-secondary text-base sm:text-lg mt-2 max-w-2xl font-light">
            Some made, some borrowed, all kept for a reason.
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-secondary">
            <ArrowUpDown className="w-3.5 h-3.5 text-accent" />
            <span>Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-surface-elevated text-primary text-xs font-sans rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:border-accent"
          >
            <option value="featured">Featured First</option>
            <option value="recent_added">Recently Added</option>
            <option value="recent_updated">Recently Updated</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Filter Tags (only show if tags exist) */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <span className="text-xs font-mono text-secondary/70 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            <span>Filter:</span>
          </span>
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wide transition-colors ${selectedTag === 'all'
                ? 'bg-accent text-background font-semibold shadow-sm'
                : 'bg-white/5 border border-white/10 text-secondary hover:text-primary hover:bg-white/10'
              }`}
          >
            All Archives ({playlists.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wide whitespace-nowrap transition-colors ${selectedTag.toLowerCase() === tag.toLowerCase()
                  ? 'bg-accent text-background font-semibold shadow-sm'
                  : 'bg-white/5 border border-white/10 text-secondary hover:text-primary hover:bg-white/10'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Playlists Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-2xl glass-panel p-4 h-96 animate-pulse" />
          ))}
        </div>
      ) : filteredPlaylists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPlaylists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-20 rounded-2xl glass-panel p-8 border border-white/5 max-w-md mx-auto">
          <p className="text-primary text-base font-medium mb-1">The shelves are being arranged.</p>
          <p className="text-secondary text-xs leading-relaxed">
            No playlists have been published to the archive yet. Check back soon or visit the admin desk to curate the first collection.
          </p>
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl glass-panel p-8">
          <p className="text-lg text-secondary">No playlists found for tag "{selectedTag}".</p>
          <button
            onClick={() => setSelectedTag('all')}
            className="mt-4 px-4 py-2 rounded-full bg-accent text-background text-xs font-mono font-semibold"
          >
            Clear Filter
          </button>
        </div>
      )}
    </section>
  );
};
