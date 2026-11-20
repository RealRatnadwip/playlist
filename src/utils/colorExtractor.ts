/**
 * Helper to generate ambient atmospheric glow colors from album artwork
 */

export interface AmbientPalette {
  primary: string;
  secondary: string;
  glow: string;
}

// Fallback atmospheric palettes inspired by nocturnal, analog, and moody music
const DEFAULT_PALETTES: AmbientPalette[] = [
  {
    primary: 'rgba(56, 189, 248, 0.12)', // sky blue tint
    secondary: 'rgba(147, 51, 234, 0.08)',
    glow: 'rgba(56, 189, 248, 0.25)',
  },
  {
    primary: 'rgba(224, 241, 31, 0.12)', // signature yellow-green accent
    secondary: 'rgba(16, 185, 129, 0.06)',
    glow: 'rgba(224, 241, 31, 0.2)',
  },
  {
    primary: 'rgba(244, 63, 94, 0.12)', // warm rose
    secondary: 'rgba(249, 115, 22, 0.08)',
    glow: 'rgba(244, 63, 94, 0.22)',
  },
  {
    primary: 'rgba(168, 85, 247, 0.12)', // deep violet
    secondary: 'rgba(59, 130, 246, 0.07)',
    glow: 'rgba(168, 85, 247, 0.22)',
  },
];

export function getAmbientGlow(seedString?: string | null): AmbientPalette {
  if (!seedString) return DEFAULT_PALETTES[1]; // default accent glow

  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }

  const index = Math.abs(hash) % DEFAULT_PALETTES.length;
  return DEFAULT_PALETTES[index];
}

