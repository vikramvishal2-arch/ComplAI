import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        surface: {
          navy: '#0f0d1a',
          'navy-light': '#1a1730',
        },
      },
      backgroundImage: {
        'privacy-gradient': 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 55%, #5b21b6 100%)',
        'privacy-surface':
          'linear-gradient(180deg, #2d2640 0%, #1a1730 45%, #0f0d1a 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
