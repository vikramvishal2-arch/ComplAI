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
          /** Marketing dark base (fallback solid; use gradient utilities on sections) */
          navy: '#12141c',
          'navy-light': '#1e212b',
          /** Primary green accent */
          teal: '#10b981',
          /** Lighter green for hovers and secondary emphasis */
          blue: '#34d399',
        },
      },
      backgroundImage: {
        'scrut-gradient': 'linear-gradient(135deg, #34d399 0%, #10b981 55%, #059669 100%)',
        'marketing-surface':
          'linear-gradient(180deg, #454956 0%, #323641 24%, #22252f 52%, #12141c 78%, #060708 100%)',
        'marketing-surface-alt':
          'linear-gradient(180deg, #3d404c 0%, #2c303b 45%, #181b24 100%)',
        'marketing-header':
          'linear-gradient(180deg, rgba(69,73,86,0.96) 0%, rgba(34,37,47,0.94) 55%, rgba(12,14,20,0.92) 100%)',
        'scrut-hero':
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16, 185, 129, 0.16) 0%, transparent 52%), linear-gradient(180deg, #4a4e5a 0%, #343845 28%, #1e212b 58%, #0a0b10 100%)',
      },
    },
  },
  plugins: [],
};
