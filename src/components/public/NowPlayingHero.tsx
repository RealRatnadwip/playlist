import React, { useState, useEffect } from 'react';
import { useNowPlayingContext } from '../../context/NowPlayingContext';
import { Equalizer } from '../common/Equalizer';
import { LiveIndicator } from '../common/LiveIndicator';
import { getAmbientGlow } from '../../utils/colorExtractor';
import { formatRelativeTime } from '../../utils/formatters';
import { ExternalLink, Disc, Radio, Clock, ChevronDown } from 'lucide-react';

export const NowPlayingHero: React.FC = () => {
  const { nowPlaying, lastFetched } = useNowPlayingContext();
  const [progress, setProgress] = useState(0);
  const [viewport, setViewport] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1200,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const isPlaying = Boolean(nowPlaying?.isPlaying);
  const title = nowPlaying?.title;
  const artist = nowPlaying?.artist;
  const album = nowPlaying?.album;
  const artwork = nowPlaying?.albumArtwork;
  const spotifyUrl = nowPlaying?.spotifyUrl;
  const isRecent = Boolean(nowPlaying?.isRecent);

  const ambient = getAmbientGlow(title || 'default');

  const isMobile = viewport.w < 768;
  // Snappy 240px runway for mobile touch scrolls, 360px for desktop mouse wheel
  const runway = isMobile ? 240 : 360;

  useEffect(() => {
    const updateDimensions = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };

    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        const top = window.scrollY;
        // Continuous, smooth 0 -> 1 progress directly tied to user scroll; clamps iOS bounce
        const currentRunway = window.innerWidth < 768 ? 240 : 360;
        const p = Math.min(1, Math.max(0, top / currentRunway));
        setProgress(p);
        rafId = null;
      });
    };

    updateDimensions();
    handleScroll();
    window.addEventListener('resize', updateDimensions, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const handleScrollToArchive = () => {
    const target = document.getElementById('stats') || document.getElementById('playlists');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight * 0.9, behavior: 'smooth' });
    }
  };

  // Continuous dimensions calculation:
  // At progress = 0: exactly 100% full screen (border-radius 0, edge-to-edge)
  // At progress = 1: floating glass card (contained, rounded, shadow, borderless)
  const targetWidth = Math.min(1240, Math.max(300, viewport.w - (viewport.w < 640 ? 20 : 48)));
  const targetHeight = isMobile
    ? Math.min(540, Math.max(400, viewport.h - 40))
    : Math.min(500, Math.max(380, viewport.h - 80));

  const currentWidth = viewport.w - progress * (viewport.w - targetWidth);
  const currentHeight = viewport.h - progress * (viewport.h - targetHeight);
  const currentRadius = progress * (isMobile ? 22 : 28);
  const currentShadow = progress > 0.02 ? `0 ${progress * 24}px ${progress * 64}px -${progress * 12}px rgba(0, 0, 0, ${progress * 0.85})` : 'none';
  const currentBg = `rgba(255, 255, 255, ${progress * 0.04})`;
  const currentBlur = progress * 24;

  return (
    /* Section runway maintains constant layout height so page never collapses or jumps */
    <section id="now-playing" className="relative w-full" style={{ height: `calc(100dvh + ${runway}px)` }}>
      {/* Sticky viewport frame: keeps the hero pinned while user scrolls through the morph runway */}
      <div className="sticky top-0 h-[100dvh] w-full flex items-center justify-center overflow-hidden p-0">
        {/* Full-bleed Ambient Glow Backdrop */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none opacity-40 transition-all duration-1000 -z-30 w-[900px] sm:w-[1300px] h-[600px] sm:h-[850px] blur-[140px] sm:blur-[200px]"
          style={{
            background: `radial-gradient(circle, ${ambient.glow} 0%, ${ambient.secondary} 70%, transparent 100%)`,
          }}
        />

        {/* The Hero Stage:
            - At progress = 0: Fills 100% of the screen (edge to edge, border-0, rounded-0).
              The album art is the rich, glowing, frosted glass background of the ENTIRE viewport.
            - As user scrolls (0 -> 1): Pulls inward continuously and smoothly, forming into the floating glass card.
            - Border is strictly 'none' so no wired border shows up. */}
        <div
          className="relative overflow-y-auto sm:overflow-hidden flex flex-col justify-between p-4 xs:p-6 sm:p-8 md:p-10 select-none"
          style={{
            width: `${currentWidth}px`,
            height: progress >= 1 ? 'auto' : `${currentHeight}px`,
            minHeight: progress >= 1 ? `${targetHeight}px` : undefined,
            maxHeight: isMobile ? 'calc(100dvh - 16px)' : undefined,
            borderRadius: `${currentRadius}px`,
            backgroundColor: currentBg,
            boxShadow: currentShadow,
            backdropFilter: `blur(${currentBlur}px)`,
            WebkitBackdropFilter: `blur(${currentBlur}px)`,
            border: 'none',
            outline: 'none',
          }}
        >
          {/* Frosted Glass Album Artwork Background (Full-bleed at start, neatly contained in card as it morphs) */}
          {artwork && (
            <div
              key={`frosted-bg-${artwork}`}
              className="absolute inset-0 w-full h-full bg-cover bg-center pointer-events-none -z-10"
              style={{
                backgroundImage: `url(${artwork})`,
                filter: `blur(${45 + progress * 15}px) saturate(${150 - progress * 20}%)`,
                transform: 'scale(1.15)',
                opacity: 0.48 - progress * 0.18,
              }}
            />
          )}

          {/* Frosted Glass Dark Contrast Scrim (Guarantees high contrast text over album art) */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none -z-10"
            style={{
              background: `linear-gradient(to right, rgba(0, 0, 0, ${0.75 + progress * 0.1}), rgba(0, 0, 0, ${0.58 + progress * 0.12}), rgba(0, 0, 0, ${0.35 + progress * 0.15}))`,
            }}
          />

          {/* Top clearance spacer in full page mode */}
          <div className="w-full h-1 sm:h-4 flex-shrink-0" />

          {/* Main Music Showcase Content */}
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start my-auto w-full gap-4 sm:gap-8 lg:gap-12">
            {/* Album Artwork Jacket (Crisply sized for mobile & desktop, no vinyl, no harsh wireframe border) */}
            <div className="relative flex-shrink-0">
              <div className="w-36 h-36 xs:w-44 xs:h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-2xl overflow-hidden shadow-2xl bg-surface relative group/art">
                {artwork ? (
                  <img
                    key={artwork}
                    src={artwork}
                    alt={title ? `${title} by ${artist}` : 'Album Artwork'}
                    loading="eager"
                    decoding="async"
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out animate-fade-in ${isPlaying ? 'group-hover/art:scale-105' : 'grayscale-[25%]'
                      }`}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-surface-elevated text-secondary/50">
                    <Disc className="w-12 h-12 sm:w-16 sm:h-16 animate-spin-slow stroke-[1.2]" />
                    <span className="text-[10px] sm:text-xs font-mono mt-2 sm:mt-3 uppercase tracking-wider">Awaiting playback</span>
                  </div>
                )}

                {/* Subtle sleeve highlight sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />

                {/* Live Equalizer Overlay Badge */}
                {isPlaying && (
                  <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full bg-black/75 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                    <Equalizer isPlaying={true} height={12} barCount={4} />
                    <span className="text-[9px] sm:text-[10px] font-mono text-white/90 uppercase tracking-wider">On Air</span>
                  </div>
                )}
              </div>
            </div>

            {/* Song Information & Editorial Context */}
            <div className="flex-1 text-center md:text-left flex flex-col justify-between self-stretch">
              <div>
                {/* Status Indicator Pill */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                  {isPlaying ? (
                    <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-accent/15 text-[11px] sm:text-xs font-mono text-accent">
                      <LiveIndicator isLive={true} compact />
                      <span className="font-semibold uppercase tracking-wider">Currently Listening To</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] sm:text-xs font-mono text-neutral-200 shadow-sm">
                      <Radio className="w-3.5 h-3.5 text-accent" />
                      <span>
                        {nowPlaying?.message ||
                          (isRecent ? 'Last played on speakers' : 'A rare moment of silence.')}
                      </span>
                    </div>
                  )}

                  {lastFetched && (
                    <span className="text-[11px] sm:text-xs text-neutral-400 font-mono hidden sm:inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{formatRelativeTime(lastFetched)}</span>
                    </span>
                  )}
                </div>

                {/* Song Title */}
                <h1
                  key={title || 'quiet-title'}
                  className="font-display font-bold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] line-clamp-2 leading-[0.96] text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mt-1 sm:mt-1.5"
                >
                  {title || 'Quiet Hours'}
                </h1>

                {/* Artist & Album */}
                <p
                  key={`${artist || 'artist'}-${album || 'album'}`}
                  className="text-white/95 font-medium flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] text-base sm:text-xl lg:text-2xl mt-1.5 sm:mt-2.5"
                >
                  <span className="text-white font-semibold">{artist || 'Ratnadwip Sarkar'}</span>
                  {album && (
                    <>
                      <span className="text-white/40 font-light">·</span>
                      <span className="text-white/80 font-normal truncate max-w-[200px] sm:max-w-none">{album}</span>
                    </>
                  )}
                </p>

                {/* Warm Editorial Journal Note */}
                <p className="text-neutral-200/90 text-xs sm:text-sm md:text-base mt-2.5 sm:mt-3.5 leading-relaxed max-w-xl drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] font-normal line-clamp-2 sm:line-clamp-none">
                  {isPlaying
                    ? '@realratnadwip is maybe lost in deep work or music.'
                    : 'Currently the speakers are quiet, but the archive below is always open.'}
                </p>
              </div>

              {/* Actions & Spotify Link - Touch-friendly 44px tap targets */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-4 pt-4 sm:pt-7">
                {spotifyUrl ? (
                  <a
                    href={spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-full bg-accent text-background font-semibold text-xs sm:text-sm hover:bg-accent-muted transition-all duration-300 shadow-glass hover:shadow-accent-glow focus:outline-none min-h-[42px]"
                  >
                    <span>Open in Spotify</span>
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </a>
                ) : (
                  <a
                    href="https://open.spotify.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-full bg-black/50 text-white font-medium text-xs sm:text-sm hover:bg-black/70 transition-all backdrop-blur-md min-h-[42px]"
                  >
                    <span>Visit Spotify Profile</span>
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                  </a>
                )}

                <a
                  href="#playlists"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToArchive();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs sm:text-sm font-medium transition-all backdrop-blur-md shadow-sm min-h-[42px]"
                >
                  <span>Explore Playlists</span>
                  <span className="text-accent text-xs">↓</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Scroll Cue: Fades out continuously as user begins scrolling */}
          <div
            className="w-full flex flex-col items-center justify-center pt-1.5 sm:pt-2 flex-shrink-0"
            style={{
              opacity: Math.max(0, 1 - progress * 3.5),
              transform: `translateY(${progress * 16}px)`,
              pointerEvents: progress > 0.15 ? 'none' : 'auto',
            }}
          >
            <button
              onClick={handleScrollToArchive}
              className="flex flex-col items-center gap-1 text-neutral-400 hover:text-accent transition-colors group cursor-pointer focus:outline-none py-1"
              aria-label="Scroll down to explore archive"
            >
              <span className="font-mono text-[9px] xs:text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase text-neutral-400/80 group-hover:text-accent transition-colors">
                Scroll to archive
              </span>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
