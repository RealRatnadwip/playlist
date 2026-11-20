import React, { useState } from 'react';
import { useNowPlayingContext } from '../../context/NowPlayingContext';
import { LiveIndicator } from './LiveIndicator';
import { Equalizer } from './Equalizer';
import { Menu, X, Disc3 } from 'lucide-react';

interface NavigationProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onNavigate }) => {
  const { nowPlaying } = useNowPlayingContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (anchor: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(anchor);
    } else {
      const el = document.getElementById(anchor);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = `/#${anchor}`;
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 transition-all">
      <div className="max-w-6xl mx-auto">
        <nav className="glass-panel rounded-full px-5 py-2.5 sm:py-3 flex items-center justify-between shadow-glass">
          {/* Brand / Wordmark */}
          <a
            href="/"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
              <Disc3 className={`w-4 h-4 ${nowPlaying?.isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-primary leading-none group-hover:text-accent transition-colors">
                ratnadwip.
              </span>
              <span className="text-[9px] tracking-widest text-secondary font-mono uppercase leading-tight mt-0.5">
                PERSONAL MUSIC ARCHIVE
              </span>
            </div>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => handleNavClick('now-playing')}
              className="text-secondary hover:text-primary transition-colors flex items-center gap-2"
            >
              <span>Now Playing</span>
              {nowPlaying?.isPlaying && <Equalizer isPlaying={true} height={12} barCount={3} />}
            </button>
            <button
              onClick={() => handleNavClick('playlists')}
              className="text-secondary hover:text-primary transition-colors"
            >
              Playlists
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="text-secondary hover:text-primary transition-colors"
            >
              About
            </button>

            {/* Live Status Pill */}
            <div className="pl-2 border-l border-white/10">
              <LiveIndicator isLive={Boolean(nowPlaying?.isPlaying)} />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <LiveIndicator isLive={Boolean(nowPlaying?.isPlaying)} compact />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-secondary hover:text-primary focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 glass-panel-elevated rounded-2xl flex flex-col gap-3 shadow-glass-lg animate-in fade-in duration-200">
            <button
              onClick={() => handleNavClick('now-playing')}
              className="flex items-center justify-between text-left py-2 px-3 rounded-lg text-primary hover:bg-white/5"
            >
              <span>Now Playing</span>
              {nowPlaying?.isPlaying && <Equalizer isPlaying={true} height={14} barCount={4} />}
            </button>
            <button
              onClick={() => handleNavClick('playlists')}
              className="text-left py-2 px-3 rounded-lg text-primary hover:bg-white/5"
            >
              Playlists
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="text-left py-2 px-3 rounded-lg text-primary hover:bg-white/5"
            >
              About
            </button>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between px-3 text-xs text-secondary">
              <span>Status</span>
              <LiveIndicator isLive={Boolean(nowPlaying?.isPlaying)} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

