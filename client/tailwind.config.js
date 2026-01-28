/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#FFA500', // Orange
                    50: '#FFF8E6',
                    100: '#FFF0CC',
                    200: '#FFE0A3',
                    300: '#FFD17A',
                    400: '#FFC152',
                    500: '#FFA500', // Base Orange
                    600: '#E69500',
                    700: '#CC8500',
                    800: '#B37400',
                    900: '#996300',
                    950: '#805200',
                },
                dark: {
                    DEFAULT: '#000000', // Black
                    50: '#F2F2F2',
                    100: '#E6E6E6',
                    200: '#CCCCCC',
                    300: '#B3B3B3',
                    400: '#999999',
                    500: '#808080',
                    600: '#666666',
                    700: '#4D4D4D',
                    800: '#333333',
                    900: '#1A1A1A',
                    950: '#000000', // Black
                },
                accent: {
                    DEFAULT: '#FFFFFF', // White
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
