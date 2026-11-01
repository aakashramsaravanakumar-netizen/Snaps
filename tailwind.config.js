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
        assemble: {
          dark: '#0a0b12',
          card: '#121422',
          surface: '#181b2e',
          surfaceHover: '#20243d',
          border: '#2e3357',
          neon: '#a855f7',
          neonHover: '#9333ea',
          glow: '#c084fc',
          accent: '#6366f1',
          cyan: '#06b6d4',
          danger: '#ef4444',
          dangerHover: '#dc2626',
          success: '#10b981',
          warning: '#f59e0b',
        }
      },
      boxShadow: {
        'neon': '0 0 15px rgba(168, 85, 247, 0.45)',
        'neon-strong': '0 0 25px rgba(168, 85, 247, 0.75), 0 0 50px rgba(99, 102, 241, 0.4)',
        'cyan-glow': '0 0 15px rgba(6, 182, 212, 0.45)',
        'speaking': '0 0 0 3px rgba(168, 85, 247, 0.8), 0 0 15px rgba(168, 85, 247, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 1.5s linear infinite',
        'snap-glow': 'snapGlow 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.95)', opacity: '1' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        snapGlow: {
          '0%': { filter: 'drop-shadow(0 0 5px rgba(168, 85, 247, 0.5))' },
          '100%': { filter: 'drop-shadow(0 0 20px rgba(236, 72, 153, 0.9))' },
        }
      }
    },
  },
  plugins: [],
}
