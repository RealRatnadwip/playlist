import React from 'react';
import { BookOpen } from 'lucide-react';

interface PlaylistStoryProps {
  storyContent: string | null | undefined;
  playlistTitle?: string;
  className?: string;
}

export const PlaylistStory: React.FC<PlaylistStoryProps> = ({ storyContent, className = '' }) => {
  if (!storyContent || storyContent.trim().length === 0) {
    return null;
  }

  // Split into paragraphs
  const paragraphs = storyContent.split('\n\n').filter((p) => p.trim().length > 0);

  return (
    <div className={`relative rounded-2xl sm:rounded-3xl glass-panel p-6 sm:p-8 md:p-10 border border-white/10 shadow-glass flex flex-col justify-between ${className}`}>
      <div>
        {/* Editorial Journal Tag */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>The Story Behind This Archive</span>
          </div>
          <span className="text-[11px] font-mono text-secondary/60">Journal Entry</span>
        </div>

        {/* Story Text formatted for comfortable, long-form editorial reading */}
        <div className="space-y-4 sm:space-y-5 text-primary/85 text-sm sm:text-base leading-[1.8] font-normal tracking-[0.01em]">
          {paragraphs.map((para, index) => {
            // Check if paragraph is a quote
            if (para.startsWith('>')) {
              return (
                <blockquote
                  key={index}
                  className="pl-4 border-l-2 border-accent text-accent/90 italic font-serif my-5 text-base sm:text-lg leading-relaxed bg-accent/5 py-2.5 px-3.5 rounded-r-xl"
                >
                  {para.replace(/^>\s*/, '')}
                </blockquote>
              );
            }

            // Opening lead paragraph styling for index 0
            if (index === 0) {
              return (
                <p key={index} className="text-primary/95 text-base sm:text-[17px] font-normal leading-relaxed">
                  {para}
                </p>
              );
            }

            return <p key={index}>{para}</p>;
          })}
        </div>
      </div>

      {/* Subtle Sign-off */}
      <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between text-xs font-mono text-secondary/60">
        <span>Curated with memory by Ratnadwip</span>
        <span>Archive Record</span>
      </div>
    </div>
  );
};
