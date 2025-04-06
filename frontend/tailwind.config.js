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
            }
        },
    },
    plugins: [],
}

