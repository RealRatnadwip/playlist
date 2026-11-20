import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8 text-secondary text-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Signature & Note */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <p className="text-primary/90 font-medium">
            Made with music and a little too much attachment to playlists.
          </p>
          <p className="text-secondary text-xs mt-1">
            A small corner of the internet curated by{' '}
            <a
              href="https://ratnadwip.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline inline-flex items-center gap-1 font-medium"
            >
              Ratnadwip Sarkar <ExternalLink className="w-3 h-3 inline" />
            </a>
          </p>
        </div>

        {/* Right: Domain, year & discreet Spotify attribution */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right gap-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-primary/70">playlist.ratnadwip.com</span>
            <span>·</span>
            <span>{currentYear}</span>
          </div>
          <p className="text-secondary/60 text-[11px] flex items-center gap-1.5 mt-0.5">
            <span>Powered by Spotify Web API</span>
            <span>·</span>
            <a href="/admin" className="hover:text-secondary hover:underline">
              Admin
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

