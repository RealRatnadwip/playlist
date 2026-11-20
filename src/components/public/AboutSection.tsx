import React from 'react';
import { SiteSettings } from '../../types';
import { Sparkles, ExternalLink } from 'lucide-react';

interface AboutSectionProps {
  settings?: SiteSettings;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings }) => {
  const heading = settings?.about_heading || "A little about what's playing in my head.";
  const bodyText =
    settings?.about_body ||
    `I've always believed that you can know someone better through what they listen to at 1 AM than through a resume. This archive is my personal catalog of sounds, memories, and the quiet records that anchor different seasons of my life.

Every playlist here has a reason to exist. Some were made for specific people, some during quiet train journeys, and some simply because a song refused to leave my chest.

No algorithms. No shuffle recommendations. Just the songs I return to when the world gets too loud.`;

  const paragraphs = bodyText.split('\n\n').filter((p) => p.trim().length > 0);

  return (
    <section id="about" className="max-w-4xl mx-auto px-4 sm:px-6 my-20 sm:my-28">
      <div className="relative rounded-3xl glass-panel p-8 sm:p-12 md:p-16 border border-white/10 shadow-glass overflow-hidden">
        {/* Subtle accent corner glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personal Note</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-primary mb-8 leading-tight">
            {heading}
          </h2>

          <div className="space-y-6 text-primary/80 text-base sm:text-lg leading-relaxed font-light">
            {paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {/* Author Signature */}
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-display text-2xl font-bold text-primary">Ratnadwip Sarkar</p>
              <p className="text-xs font-mono text-secondary mt-0.5">Kolkata, India</p>
            </div>

            <a
              href="https://ratnadwip.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-accent hover:underline py-2 px-4 rounded-full bg-accent/10 border border-accent/20"
            >
              <span>Explore My Work</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

