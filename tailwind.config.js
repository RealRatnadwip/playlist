/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#121212',
        surface: {
          DEFAULT: '#181818',
          subtle: '#151515',
          elevated: '#202020',
          hover: '#262626',
        },
        primary: {
          DEFAULT: '#F0F0F0',
          muted: '#D0D0D0',
        },
        secondary: {
          DEFAULT: '#929292',
          muted: '#686868',
        },
        accent: {
          DEFAULT: '#E0F11F',
          muted: '#C5D615',
          glow: 'rgba(224, 241, 31, 0.15)',
          subtle: 'rgba(224, 241, 31, 0.08)',
        },
        glass: {
          surface: 'rgba(255, 255, 255, 0.045)',
          hover: 'rgba(255, 255, 255, 0.08)',
          active: 'rgba(255, 255, 255, 0.12)',
          border: 'rgba(255, 255, 255, 0.09)',
          'border-strong': 'rgba(255, 255, 255, 0.16)',
        },
        spotify: {
          green: '#1DB954',
          hover: '#1ed760',
        }
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
        wide: '0.04em',
        widest: '0.12em',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
        'glass-lg': '0 12px 48px 0 rgba(0, 0, 0, 0.5)',
        'accent-glow': '0 0 25px rgba(224, 241, 31, 0.25)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'equalizer-1': 'equalize-1 1.2s ease-in-out infinite',
        'equalizer-2': 'equalize-2 0.8s ease-in-out infinite 0.2s',
        'equalizer-3': 'equalize-3 1.0s ease-in-out infinite 0.4s',
        'equalizer-4': 'equalize-4 1.4s ease-in-out infinite 0.1s',
      },
      keyframes: {
        'equalize-1': {
          '0%, 100%': { height: '30%' },
          '50%': { height: '100%' },
        },
        'equalize-2': {
          '0%, 100%': { height: '80%' },
          '50%': { height: '25%' },
        },
        'equalize-3': {
          '0%, 100%': { height: '40%' },
          '50%': { height: '90%' },
        },
        'equalize-4': {
          '0%, 100%': { height: '95%' },
          '50%': { height: '35%' },
        },
      },
      maxWidth: {
        'editorial': '68ch',
      }
    },
  },
  plugins: [],
}

