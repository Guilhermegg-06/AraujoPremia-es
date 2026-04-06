/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3fdf3',
          100: '#def9df',
          200: '#b7f0b7',
          300: '#7fe178',
          400: '#49c73e',
          500: '#28a31e',
          600: '#1e7e16',
          700: '#195d12',
          800: '#15450f',
          900: '#12360f'
        }
      }
    }
  },
  plugins: []
};
