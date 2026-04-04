/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0F6E56',
          light: '#1D9E75',
          surface: '#E1F5EE',
        },
        warn: {
          DEFAULT: '#EF9F27',
          surface: '#FAEEDA',
        },
        danger: {
          DEFAULT: '#D85A30',
          surface: '#FAECE7',
        },
        app: {
          bg: '#F8F7F2',
          card: '#FFFFFF',
          border: '#D3D1C7',
          text: '#2C2C2A',
          muted: '#5F5E5A',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        hero: '16px',
      }
    }
  },
  plugins: [],
}
