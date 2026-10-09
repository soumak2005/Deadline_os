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
        abyss: '#0B0F17',
        surface: '#111827',
        'surface-card': '#161F30',
        'surface-hover': '#1F2937',
        'surface-border': 'rgba(255, 255, 255, 0.08)',
        'surface-border-bright': 'rgba(255, 255, 255, 0.16)',
        sos: {
          crimson: '#FF3B5C',
          amber: '#F59E0B',
          cyan: '#00F0FF',
          violet: '#6366F1',
          mint: '#10B981',
          darkRed: '#380D17',
          darkCyan: '#00363D'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'glow-crimson': '0 0 25px -5px rgba(255, 59, 92, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(0, 240, 255, 0.4)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
        'glow-violet': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'glow-mint': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'cyber-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 3s linear infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 12px rgba(255, 59, 92, 0.8))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 4px rgba(255, 59, 92, 0.3))' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        }
      }
    },
  },
  plugins: [],
}
