import React from 'react';

interface EqualizerProps {
  isPlaying?: boolean;
  height?: number;
  barCount?: number;
  colorClass?: string;
}

export const Equalizer: React.FC<EqualizerProps> = ({
  isPlaying = false,
  height = 16,
  barCount = 4,
  colorClass = 'bg-accent',
}) => {
  const bars = Array.from({ length: barCount });

  return (
    <div
      className="flex items-end gap-[2px] justify-center"
      style={{ height: `${height}px` }}
      aria-label={isPlaying ? 'Music playing visualizer' : 'Equalizer inactive'}
    >
      {bars.map((_, index) => {
        // Individual animation speeds for natural organic equalizer look
        const animClass = isPlaying
          ? index === 0
            ? 'animate-equalizer-1'
            : index === 1
              ? 'animate-equalizer-2'
              : index === 2
                ? 'animate-equalizer-3'
                : 'animate-equalizer-4'
          : '';

        return (
          <span
            key={index}
            className={`w-[2.5px] rounded-full transition-all duration-300 ${colorClass} ${animClass}`}
            style={{
              height: isPlaying ? undefined : '20%',
              minHeight: '2px',
            }}
          />
        );
      })}
    </div>
  );
};

