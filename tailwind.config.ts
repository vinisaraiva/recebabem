import type { Config } from 'tailwindcss'

const config: Config = {
  // Scan apenas os arquivos do projeto (performance)
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Design tokens do RecebaBem — alinhados com as CSS vars da apresentação
      colors: {
        brand: {
          blue:       '#1565C0',
          'blue-dark':'#0D47A1',
          'blue-light':'#42A5F5',
          green:      '#00897B',
          'green-dark':'#00695C',
          'green-light':'#4DB6AC',
          sand:       '#FDF6E3',
          'sand-dark':'#E8D5A3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Animações Duolingo-like para missões
      keyframes: {
        'bounce-in': {
          '0%':   { transform: 'scale(0.8)', opacity: '0' },
          '70%':  { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,137,123,0.4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(0,137,123,0)' },
        },
      },
      animation: {
        'bounce-in':   'bounce-in 0.3s ease-out',
        'slide-up':    'slide-up 0.2s ease-out',
        'pulse-green': 'pulse-green 1.5s ease-in-out infinite',
      },
      // Border radius consistente com o design
      borderRadius: {
        'xl':  '16px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
}

export default config
