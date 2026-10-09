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
        abyss: '#F6F8FC',
        surface: '#FFFFFF',
        'surface-card': '#FFFFFF',
        'surface-hover': '#F1F5F9',
        'surface-border': '#E2E8F0',
        'surface-border-bright': '#CBD5E1',
        sos: {
          crimson: '#E5484D',
          amber: '#D97706',
          cyan: '#168AAD',
          violet: '#635BCE',
          mint: '#159570',
          darkRed: '#FDECEC',
          darkCyan: '#E8F7FB'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      boxShadow: {
        'glow-crimson': '0 8px 24px -8px rgba(229, 72, 77, 0.22)',
        'glow-cyan': '0 8px 24px -8px rgba(22, 138, 173, 0.20)',
        'glow-amber': '0 8px 24px -8px rgba(217, 119, 6, 0.18)',
        'glow-violet': '0 8px 24px -8px rgba(99, 91, 206, 0.18)',
        'glow-mint': '0 8px 24px -8px rgba(21, 149, 112, 0.18)',
        'cyber-card': '0 10px 30px rgba(15, 23, 42, 0.07)'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 3s linear infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.72' },
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
