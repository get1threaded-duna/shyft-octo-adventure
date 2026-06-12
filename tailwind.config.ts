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
          DEFAULT: '#000000',
          card: '#1c1c1e',
          elevated: '#2c2c2e',
          border: '#38383a',
        },
        accent: {
          green: '#34c759',
          red: '#ff453a',
          yellow: '#ffd60a',
          blue: '#0a84ff',
          purple: '#bf5af2',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SF Mono', 'monospace'],
      },
      fontSize: {
        'display': ['56px', { lineHeight: '1', fontWeight: '700', letterSpacing: '-0.03em' }],
        'display-sm': ['40px', { lineHeight: '1', fontWeight: '700', letterSpacing: '-0.02em' }],
      },
    },
  },
  plugins: [],
}

export default config
