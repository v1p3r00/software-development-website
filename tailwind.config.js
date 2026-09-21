/** @type {import('tailwindcss').Config} */
const c = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        rail: '1780px',
      },
      colors: {
        bg: c('bg'),
        surface: c('surface'),
        surface2: c('surface-2'),
        line: c('line'),
        'line-strong': c('line-strong'),
        text: c('text'),
        muted: c('muted'),
        dim: c('dim'),
        accent: c('accent'),
        sand: c('sand'),
      },
      fontFamily: {
        display: ['"Archivo Variable"', 'Archivo', 'Arial Narrow', 'sans-serif'],
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
        hand: ['"Caveat"', 'cursive'],
      },
      letterSpacing: {
        tech: '0.18em',
        wide2: '0.32em',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      transitionTimingFunction: {
        tech: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        blink: { '0%,49%': { opacity: '1' }, '50%,100%': { opacity: '0' } },
        scan: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(1000%)' } },
        dash: { to: { strokeDashoffset: '0' } },
      },
      animation: {
        blink: 'blink 1.05s steps(1) infinite',
      },
    },
  },
  plugins: [],
};
