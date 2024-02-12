/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        pastels: {
          0: '#FF7A7A',
          1: '#FFA94D',
          2: '#FFD747',
          3: '#9DFFB0',
          4: '#7ABDFF',
          5: '#6A8AFF',
          6: '#8A6AFF',
          7: '#FF6AFF',
          8: '#FF6ACD',
          9: '#FF6A6A',
        },
      },
    },
  },
  plugins: [],
};
