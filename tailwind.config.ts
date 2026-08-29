import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'chakra-blue': '#1A4E9A',
        'deep-navy': '#0B1F3A',
        saffron: '#FF8F1F',
        'india-green': '#138A43',
        'paper-white': '#FFFDF7',
        mist: '#F4F7FB',
        ink: '#172033',
        'alert-red': '#C62828',
        'warning-amber': '#F6B73C',
        'success-green': '#1F9D55',
        'border-soft': '#D8E1EF',
        'muted-text': '#5B6577',
        chakra: '#1A4E9A',
        navy: '#0B1F3A',
      },
      fontFamily: {
        sans: ['Inter', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        md: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['24px', { lineHeight: '32px' }],
        '2xl': ['32px', { lineHeight: '40px' }],
        hero: ['48px', { lineHeight: '56px' }],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
        16: '64px',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '14px',
        pill: '999px',
      },
      screens: {
        xs: '480px',
      },
    },
  },
} satisfies Config;
