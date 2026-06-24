/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#0d4f8b',
          600: '#0a3d6b',
          700: '#082f52',
          800: '#061f38',
          900: '#041525',
          950: '#020c16',
        },
        scrut: {
          navy: '#031432',
          'navy-light': '#0f2752',
          teal: '#00fdb3',
          blue: '#43a6f7',
        },
      },
      backgroundImage: {
        'scrut-gradient': 'linear-gradient(147deg, #00fdb3 0%, #43a6f7 100%)',
        'scrut-hero': 'radial-gradient(ellipse at top, rgba(67,166,247,0.15) 0%, #031432 55%)',
      },
    },
  },
  plugins: [],
};
