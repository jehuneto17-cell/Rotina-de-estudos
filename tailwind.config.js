// Tokens do DESIGN-SYSTEM.md — "Estudo Vermelho Minimal"
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAFA',
        surface: '#FFFFFF',
        border: '#E8E8E8',
        rowBorder: '#F0F0F0',

        text: '#141414',
        textMuted: '#6E6E6E',
        textFaint: '#9A9A9A',

        primary: '#D42027',
        primaryHover: '#B81C22',
        primaryFaint: '#FBEAEA',

        sidebar: '#141414',
        textOnDark: '#FFFFFF',
        textOnDarkMuted: '#8A8A8A',
        textOnDarkIdle: '#B8B8B8',

        success: '#2F8F5E',
      },
      borderRadius: {
        sm: '8px',
        md: '10px',
        card: '14px',
        lg: '18px',
        pill: '999px',
      },
      fontFamily: {
        display: ['SpaceGrotesk'],
        body: ['Inter'],
      },
    },
  },
  plugins: [],
};
