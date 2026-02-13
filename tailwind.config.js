/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        surface: {
          DEFAULT: '#0f0d0a',
          50: '#1a1816',
          100: '#21201c',
          200: '#292724',
          300: '#413e38',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
      },
      keyframes: {
        'hero-wave-1': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-30px)' },
        },
        'hero-wave-2': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(20px)' },
        },
        'hero-wave-3': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-15px)' },
        },
        'hero-eq': {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(0.4)' },
        },
        'hero-float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        'hero-float-alt': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(-5deg)' },
        },
        'hero-float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-25px)' },
        },
        'hero-ring': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.3' },
          '50%': { transform: 'scale(1.08)', opacity: '0.08' },
        },
        'audio-eq': {
          '0%, 100%': { height: '4px' },
          '50%': { height: '16px' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0)' },
          '33%': { transform: 'translateY(-8px)' },
          '66%': { transform: 'translateY(4px)' },
        },
        'drift': {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '50%': { transform: 'translateX(8px) translateY(-6px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.05)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'hero-wave-1': 'hero-wave-1 8s ease-in-out infinite',
        'hero-wave-2': 'hero-wave-2 6s ease-in-out infinite',
        'hero-wave-3': 'hero-wave-3 10s ease-in-out infinite',
        'hero-eq': 'hero-eq 1.2s ease-in-out infinite',
        'hero-float': 'hero-float 6s ease-in-out infinite',
        'hero-float-alt': 'hero-float-alt 8s ease-in-out infinite',
        'hero-float-slow': 'hero-float-slow 10s ease-in-out infinite',
        'hero-ring': 'hero-ring 4s ease-in-out infinite',
        'audio-eq': 'audio-eq 0.8s ease-in-out infinite',
        'float-slow': 'float-slow 4s ease-in-out infinite',
        'float-delayed': 'float-delayed 5s ease-in-out infinite',
        'drift': 'drift 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
      },
    },
  },
  plugins: [],
}
