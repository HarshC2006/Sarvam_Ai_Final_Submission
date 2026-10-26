/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFBF7',
          100: '#FAF8F5',
          200: '#F5F2EB',
          300: '#EBE5D8',
        },
        forest: {
          50: '#F2F8F5',
          100: '#E1EFEA',
          600: '#2D6A4F',
          700: '#1B4332',
          800: '#143527',
          900: '#0B2319',
        },
        stone: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { borderColor: '#1B4332', backgroundColor: '#F0FDF4' },
          '50%': { borderColor: '#059669', backgroundColor: '#DCFCE7' },
        },
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
