// Tokens do DESIGN-SYSTEM.md — "Estudo Vermelho Minimal"
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // MVP é tema claro fixo (TemaContext.tsx) — 'class' evita que o NativeWind
  // tente setar color-scheme automaticamente via media query no web.
  darkMode: 'class',
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
        successBg: '#EAF5EF',
        warning: '#B67A1A', // revisões atrasadas / avisos — do handoff do Designer (Resumo.dc.html)
        warningBg: '#FBF3E3',
        neutralBg: '#F1F1F1',
      },
      borderRadius: {
        sm: '8px',
        md: '10px',
        card: '14px',
        lg: '18px',
        pill: '999px',
      },
      fontFamily: {
        // Nomes exatos registrados por @expo-google-fonts/* em app/_layout.tsx —
        // RN não sintetiza peso a partir de um único arquivo de fonte, então
        // cada peso usado no design precisa da própria entrada aqui.
        display: ['SpaceGrotesk_700Bold'],
        body: ['Inter_400Regular'],
        'body-semibold': ['Inter_600SemiBold'],
      },
    },
  },
  plugins: [],
};
