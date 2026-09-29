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
        nexus: {
          bg: '#0B0E14',
          surface: '#121722',
          card: '#161C2A',
          border: '#1E293B',
          muted: '#64748B',
          text: '#F8FAFC',
          accent: '#3B82F6',
          healthy: '#10B981',
          warning: '#F59E0B',
          critical: '#EF4444',
          info: '#06B6D4',
          analytics: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
