import React from 'react';
import { BookOpen } from 'lucide-react';

interface PlaylistStoryProps {
  storyContent: string | null | undefined;
  playlistTitle: string;
}

export const PlaylistStory: React.FC<PlaylistStoryProps> = ({ storyContent, playlistTitle }) => {
  if (!storyContent || storyContent.trim().length === 0) {
    return null;
  }

  // Split into paragraphs
  const paragraphs = storyContent.split('\n\n').filter((p) => p.trim().length > 0);

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 my-12 sm:my-16">
      <div className="relative rounded-3xl glass-panel p-8 sm:p-12 border border-white/10 shadow-glass">
        {/* Editorial Journal Tag */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>The Story Behind This Archive</span>
          </div>
          <span className="text-[11px] font-mono text-secondary/60">Journal Entry</span>
        </div>

        {/* Story Text formatted for long-form reading comfort */}
        <div className="space-y-6 text-primary/85 text-lg sm:text-xl font-light leading-relaxed">
          {paragraphs.map((para, index) => {
            // Check if paragraph looks like a quote (starts with ">" or quotation marks)
            if (para.startsWith('>')) {
              return (
                <blockquote
                  key={index}
                  className="pl-5 border-l-2 border-accent text-primary italic font-serif my-6 text-xl sm:text-2xl"
                >
                  {para.replace(/^>\s*/, '')}
                </blockquote>
              );
            }

            return <p key={index}>{para}</p>;
          })}
        </div>

        {/* Subtle Sign-off */}
        <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between text-xs font-mono text-secondary/60">
          <span>Curated with memory by Ratnadwip</span>
          <span>Archive Record</span>
        </div>
      </div>
    </section>
  );
};

