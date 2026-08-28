import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#082f5b',
        chakra: '#1f5fa8',
        saffron: '#d97706',
        'paper-white': '#fdfcf8',
      },
    },
  },
} satisfies Config;
