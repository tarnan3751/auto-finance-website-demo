module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: { 
    extend: {
      colors: {
        'dark-green': {
          900: '#0a2818',
          800: '#0f3420',
          700: '#144028',
          600: '#1a4d30',
          500: '#215938',
        },
        'accent-blue': {
          600: '#1e40af',
          500: '#3b82f6',
          400: '#60a5fa',
        }
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'sans': ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    } 
  },
  plugins: []
};
