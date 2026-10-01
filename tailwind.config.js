/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        atlas: {
          bg: '#0B0B0D',
          surface: '#151518',
          elevated: '#202024',
          border: '#28282E',
          borderLight: '#34343D',
          text: '#F0EEE9',
          muted: '#94939C',
          accent: '#C7A6FF',
          accentDim: 'rgba(199, 166, 255, 0.12)',
          accentGlow: 'rgba(199, 166, 255, 0.25)',
          like: '#F472B6',
          save: '#60A5FA',
          dislike: '#F87171',
        },
      },
      fontFamily: {
        editorial: ['Newsreader', 'Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'elevated': '0 12px 32px -4px rgba(0, 0, 0, 0.7)',
        'accent': '0 0 20px -2px rgba(199, 166, 255, 0.18)',
      },
    },
  },
  plugins: [],
};
