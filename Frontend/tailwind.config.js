/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg0': 'rgb(var(--bg0) / <alpha-value>)',
        'bg1': 'rgb(var(--bg1) / <alpha-value>)',
        'bg2': 'rgb(var(--bg2) / <alpha-value>)',
        'bg3': 'rgb(var(--bg3) / <alpha-value>)',
        'bg4': 'rgb(var(--bg4) / <alpha-value>)',
        'bginput': 'rgb(var(--bginput) / <alpha-value>)',
        'emerald': {
          primary: 'rgb(var(--emerald-primary) / <alpha-value>)',
          bright:  'rgb(var(--emerald-bright) / <alpha-value>)',
          glow:    'rgb(var(--emerald-glow) / <alpha-value>)',
          muted:   'rgb(var(--emerald-muted) / <alpha-value>)',
          deep:    'rgb(var(--emerald-deep) / <alpha-value>)',
        },
        'chart': {
          green:  'rgb(var(--chart-green) / <alpha-value>)',
          blue:   'rgb(var(--chart-blue) / <alpha-value>)',
          orange: 'rgb(var(--chart-orange) / <alpha-value>)',
          purple: 'rgb(var(--chart-purple) / <alpha-value>)',
          teal:   'rgb(var(--chart-teal) / <alpha-value>)',
        },
        'gold':   'rgb(var(--gold) / <alpha-value>)',
        'danger': 'rgb(var(--danger) / <alpha-value>)',
        'cyan':   'rgb(var(--cyan) / <alpha-value>)',
        'content': {
          primary:   'rgb(var(--content-primary) / <alpha-value>)',
          secondary: 'rgb(var(--content-secondary) / <alpha-value>)',
          muted:     'rgb(var(--content-muted) / <alpha-value>)',
        },
      },
      boxShadow: {
        'neo': 'var(--shadow-neo)',
        'neo-inset': 'var(--shadow-neo-inset)',
        'glow-sm': 'var(--shadow-glow-sm)',
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
      }
    },
  },
  plugins: [],
}
