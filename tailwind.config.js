import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',

    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Paleta 
                purple: {
                    light: "#c4b4d4",
                    DEFAULT: "#9333ea",
                    dark: "#4B0082",
                },
                darkgrayblue: "#3B3F58",
                lightpurple: "#c4b4d4",
                darkpurple: "#4B0082",
                darkbg: "#0f172a", 
            },
        },
    },

    plugins: [forms],
};
