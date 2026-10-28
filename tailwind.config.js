/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        surface: {
          DEFAULT: '#0A0A0A',
          elevated: '#111111',
          subtle: '#161616',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#888888',
          tertiary: '#555555',
        },
        border: {
          DEFAULT: '#1E1E1E',
          hover: '#333333',
        },
        cerulean: {
          DEFAULT: '#007BA7',
          light: '#0092C7',
          dark: '#006690',
        },
        rose: {
          DEFAULT: '#FF2D95',
          light: '#FF5CAE',
          dark: '#D9247D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      maxWidth: {
        'content': '64rem',
        'narrow': '36rem',
        'form': '28rem',
      },
    },
  },
  plugins: [],
}
