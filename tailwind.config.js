/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  darkMode: ['class'],
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A1A2E',
          light: '#16213E',
          dark: '#0F0F0F',
        },
        accent: {
          DEFAULT: '#E8C547',
          light: '#F2D76A',
          dark: '#C9A827',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8F8F6',
          tertiary: '#EFEFED',
        },
        text: {
          primary: '#0F0F0F',
          secondary: '#6B6B6B',
          muted: '#A0A0A0',
          inverse: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E5E5E3',
          strong: '#D0D0CE',
        },
        danger: '#DC2626',
        success: '#16A34A',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};