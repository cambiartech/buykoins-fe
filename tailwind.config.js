/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        tiktok: {
          // primary: '#e81155',
          primary: '#ff4aff', // Soft Purple from brand guide
          dark: '#000000',
          light: '#ffffff',
          'dark-base': '#29013a', // Deep Purple from brand guide
        },
      },
      fontFamily: {
        'monument': ['ABCMonumentGrotesk', 'sans-serif'],
        'sequel': ['Sequel Sans', 'arial', 'sans-serif'],
      },
      backgroundImage: {
        // 'gradient-tiktok': 'linear-gradient(135deg, #e81155 0%, #000000 50%, #ffffff 100%)',
        // 'gradient-pink': 'linear-gradient(135deg, #e81155 0%, rgba(232, 17, 85, 0.8) 50%, rgba(232, 17, 85, 0.4) 100%)',
        'gradient-tiktok': 'linear-gradient(135deg, #ff4aff 0%, #000000 50%, #ffffff 100%)',
        'gradient-pink': 'linear-gradient(135deg, #ff4aff 0%, rgba(255, 74, 255, 0.8) 50%, rgba(255, 74, 255, 0.4) 100%)',
      },
    },
  },
  plugins: [],
}

