/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg0': '#0A0F0D',
        'bg1': '#101820',
        'bg2': '#141F1A',
        'bg3': '#1A2830',
        'bg4': '#1E3038',
        'bginput': '#0C1614',
        'emerald': {
          primary: '#00C26A',
          bright:  '#00E87A',
          glow:    '#00FF88',
          muted:   '#0D3D26',
          deep:    '#071F14',
        },
        'chart': {
          green:  '#00C26A',
          blue:   '#4A9EFF',
          orange: '#FF8C42',
          purple: '#9B6DFF',
          teal:   '#00D4CC',
        },
        'gold':   '#F5A623',
        'danger': '#FF4D4D',
        'cyan':   '#00D4CC',
        'content': {
          primary:   '#E8F5EC',
          secondary: '#9AB8A4',
          muted:     '#5A7A65',
        },
      },
      boxShadow: {
        'neo':       '4px 4px 12px rgba(0,0,0,0.5), -2px -2px 8px rgba(255,255,255,0.03)',
        'neo-inset': 'inset 3px 3px 8px rgba(0,0,0,0.5), inset -1px -1px 4px rgba(255,255,255,0.03)',
        'glow-sm':   '0 0 12px rgba(0,194,106,0.3)',
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
      }
    },
  },
  plugins: [],
}
