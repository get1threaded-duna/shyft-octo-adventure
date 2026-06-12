import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0a0a0f',
          card: '#111118',
          elevated: '#1a1a24',
          border: '#2a2a3a',
        },
        accent: {
          green: '#00d97e',
          red: '#ff4757',
          yellow: '#ffd32a',
          blue: '#4a9eff',
          purple: '#a855f7',
        },
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
