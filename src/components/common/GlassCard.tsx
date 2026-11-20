import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  elevated = false,
  interactive = false,
  onClick,
}) => {
  const baseClass = elevated
    ? 'glass-panel-elevated'
    : interactive
      ? 'glass-panel-interactive'
      : 'glass-panel';

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl ${baseClass} ${className}`}
    >
      {children}
    </div>
  );
};

