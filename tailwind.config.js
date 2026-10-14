/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/client/**/*.{html,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        celebration: {
          rose: '#f43f5e',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      lineHeight: {
        'script-safe': 'var(--line-height-base)',
      },
    },
  },
  plugins: [],
};
