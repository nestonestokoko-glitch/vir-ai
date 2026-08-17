/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'mobile': '{320px}',
        'tablet': '{640px}',
        'laptop': '{1024px}',
        'desktop': '{1440px}',
        // Override defaults to match PRD
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
      },
      colors: {
        // Brand colors from PRD
        vir: {
          blue: '#0488C5',
          light: '#E5E6E7',
          accent: '#526EF5',
        }
      },
      fontFamily: {
        sans: ['Nimbus Sans TW01', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
