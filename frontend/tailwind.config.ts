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
        // Borgdanet Brand Colors
        brand: {
          green: {
            DEFAULT: '#2D5A27',
            light: '#4A7C43',
            dark: '#1E3D1A',
          },
          gold: {
            DEFAULT: '#D4A84B',
            light: '#E5C77A',
            dark: '#B8923D',
          },
          brown: {
            DEFAULT: '#5C4033',
            light: '#7A5A4A',
            dark: '#3D2A22',
          },
          cream: {
            DEFAULT: '#FDF8F0',
            dark: '#F5EDE0',
          },
          terracotta: {
            DEFAULT: '#C75B39',
            light: '#D97B5C',
          },
          sky: {
            DEFAULT: '#87CEEB',
          },
        },
        // Keep legacy colors for backward compatibility
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        secondary: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['IBM Plex Sans Arabic', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "linear-gradient(rgba(45, 90, 39, 0.7), rgba(45, 90, 39, 0.5))",
      },
    },
  },
  plugins: [],
}

export default config
