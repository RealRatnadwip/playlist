import React from 'react';

interface LiveIndicatorProps {
  isLive: boolean;
  compact?: boolean;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({ isLive, compact = false }) => {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        {isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isLive ? 'bg-accent shadow-accent-glow' : 'bg-secondary/40'
          }`}
        />
      </span>
      {!compact && (
        <span className="text-[11px] font-mono tracking-wider uppercase text-secondary">
          {isLive ? 'Listening live' : 'In silence'}
        </span>
      )}
    </div>
  );
};

