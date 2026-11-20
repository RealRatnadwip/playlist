import React from 'react';
import { useNowPlayingContext } from '../../context/NowPlayingContext';
import { Equalizer } from '../common/Equalizer';
import { LiveIndicator } from '../common/LiveIndicator';
import { getAmbientGlow } from '../../utils/colorExtractor';
import { formatRelativeTime } from '../../utils/formatters';
import { ExternalLink, Disc, Radio, Clock } from 'lucide-react';

export const NowPlayingHero: React.FC = () => {
  const { nowPlaying, lastFetched } = useNowPlayingContext();

  const isPlaying = Boolean(nowPlaying?.isPlaying);
  const title = nowPlaying?.title;
  const artist = nowPlaying?.artist;
  const album = nowPlaying?.album;
  const artwork = nowPlaying?.albumArtwork;
  const spotifyUrl = nowPlaying?.spotifyUrl;
  const isRecent = Boolean(nowPlaying?.isRecent);

  const ambient = getAmbientGlow(title || 'default');

  return (
    <section id="now-playing" className="relative pt-24 sm:pt-32 pb-12 sm:pb-16 overflow-hidden">
      {/* Blurred Ambient Gradient Backdrop */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[750px] h-[350px] sm:h-[450px] rounded-full blur-[100px] sm:blur-[140px] pointer-events-none opacity-40 transition-all duration-1000 -z-10"
        style={{
          background: `radial-gradient(circle, ${ambient.glow} 0%, ${ambient.secondary} 70%, transparent 100%)`,
        }}
      />

      <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header Tag */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-xs sm:text-sm tracking-widest uppercase text-accent font-semibold">
              {isPlaying ? 'Currently Listening To' : 'Listening Archive'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-secondary font-mono">
            {lastFetched && (
              <span className="hidden sm:inline-flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-secondary/70" />
                <span>{formatRelativeTime(lastFetched)}</span>
              </span>
            )}
            <LiveIndicator isLive={isPlaying} />
          </div>
        </div>

        {/* Main Currently Playing Card */}
        <div className="relative rounded-3xl glass-panel-elevated p-6 sm:p-8 md:p-10 border border-white/10 shadow-glass-lg backdrop-blur-2xl transition-all duration-500 overflow-hidden group">
          {/* Ambient blurred album artwork background layer */}
          {artwork && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 filter blur-3xl scale-110 pointer-events-none transition-opacity duration-1000"
              style={{ backgroundImage: `url(${artwork})` }}
            />
          )}

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 lg:gap-10">
            {/* Album Artwork as prominent visual anchor */}
            <div className="relative flex-shrink-0">
              <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-surface relative group/art">
                {artwork ? (
                  <img
                    src={artwork}
                    alt={title ? `${title} by ${artist}` : 'Album Artwork'}
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                      isPlaying ? 'group-hover/art:scale-105' : 'grayscale-[25%]'
                    }`}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-surface-elevated text-secondary/50">
                    <Disc className="w-16 h-16 animate-spin-slow stroke-[1.2]" />
                    <span className="text-xs font-mono mt-3 uppercase tracking-wider">Awaiting playback</span>
                  </div>
                )}

                {/* Subtle sheen highlight */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />

                {/* Live equalizer overlay on artwork */}
                {isPlaying && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center gap-1.5">
                    <Equalizer isPlaying={true} height={14} barCount={4} />
                    <span className="text-[10px] font-mono text-white/90 uppercase tracking-wider">On Air</span>
                  </div>
                )}
              </div>
            </div>

            {/* Song Information & Editorial Context */}
            <div className="flex-1 text-center md:text-left flex flex-col justify-between self-stretch">
              <div>
                {/* Status message */}
                {!isPlaying && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-secondary mb-3">
                    <Radio className="w-3.5 h-3.5 text-secondary/70" />
                    <span>
                      {nowPlaying?.message ||
                        (isRecent
                          ? 'Last played on speakers'
                          : 'Nothing playing right now. A rare moment of silence.')}
                    </span>
                  </div>
                )}

                {/* Song Title */}
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary leading-[1.05] line-clamp-2 mt-1">
                  {title || 'Quiet Hours'}
                </h1>

                {/* Artist & Album */}
                <p className="text-lg sm:text-xl text-primary/80 font-medium mt-2 flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span>{artist || 'Ratnadwip Sarkar'}</span>
                  {album && (
                    <>
                      <span className="text-secondary/40 font-light">·</span>
                      <span className="text-secondary font-normal">{album}</span>
                    </>
                  )}
                </p>

                {/* Warm intimate note */}
                <p className="text-secondary/80 text-sm sm:text-base mt-4 leading-relaxed max-w-xl">
                  {isPlaying
                    ? 'Connected live to Spotify. Sound resonates through the speakers in real-time as I work, write, or think.'
                    : 'Currently away from the turntable. The speakers are quiet, but the archive below is always open.'}
                </p>
              </div>

              {/* Actions & Spotify Link */}
              <div className="pt-6 sm:pt-8 flex flex-wrap items-center justify-center md:justify-start gap-4">
                {spotifyUrl ? (
                  <a
                    href={spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-accent text-background font-semibold text-sm hover:bg-accent-muted transition-all duration-300 shadow-glass hover:shadow-accent-glow focus:outline-none"
                  >
                    <span>Open in Spotify</span>
                    <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                  </a>
                ) : (
                  <a
                    href="https://open.spotify.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/10 text-primary font-medium text-sm hover:bg-white/15 transition-all"
                  >
                    <span>Visit Spotify Profile</span>
                    <ExternalLink className="w-4 h-4 stroke-[2]" />
                  </a>
                )}

                <a
                  href="#playlists"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-primary/90 hover:text-primary hover:bg-white/10 text-sm font-medium transition-colors"
                >
                  <span>Explore Playlists</span>
                  <span className="text-accent text-xs">↓</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

