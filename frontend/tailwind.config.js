/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.css",
    ],
    theme: {
        extend: {
            backgroundColor: {
                'dark-bg': '#242424',
                'dark-component': '#1a1a1a',
            },
            textColor: {
                'dark-text': 'rgba(255, 255, 255, 0.87)',
            },
            colors: {
              'taiga-primary': 'rgb(153, 214, 220)', // New primary color
              'taiga-secondary': 'rgb(70, 130, 140)', // Darker version for contrast
              'taiga-dark': '#292f3b', // Dark background color
              'taiga-light': '#f4f5fb', // Light background color
              'taiga-gray': '#767676', // Gray text
              'taiga-light-gray': '#e8e8e8', // Light gray backgrounds
            },
            fontFamily: {
              sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
}

