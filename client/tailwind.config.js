/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fk: {
          blue: '#2874f0',
          darkBlue: '#1a56bc',
          yellow: '#ffe11b',
          starYellow: '#388e3c',
          green: '#388e3c',
          lightGrey: '#f1f2f4',
          borderGrey: '#e0e0e0',
          textGrey: '#878787',
          darkGrey: '#212121',
          orange: '#fb641b',
          badgeBlue: '#0055ff'
        }
      },
      fontFamily: {
        sans: ['Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      boxShadow: {
        'fk-card': '0 2px 4px 0 rgba(0,0,0,.08)',
        'fk-hover': '0 4px 16px 0 rgba(0,0,0,.15)',
        'fk-dropdown': '0 4px 16px 0 rgba(0,0,0,.2)'
      }
    },
  },
  plugins: [],
}
