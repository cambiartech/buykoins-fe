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
          primary: '#e81155',
          dark: '#000000',
          light: '#ffffff',
        },
      },
      fontFamily: {
        'monument': ['ABCMonumentGrotesk', 'sans-serif'],
        'sequel': ['Sequel Sans', 'arial', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-tiktok': 'linear-gradient(135deg, #e81155 0%, #000000 50%, #ffffff 100%)',
        'gradient-pink': 'linear-gradient(135deg, #e81155 0%, rgba(232, 17, 85, 0.8) 50%, rgba(232, 17, 85, 0.4) 100%)',
      },
    },
  },
  plugins: [],
}

