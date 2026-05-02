import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/**/*.blade.php',
        './resources/**/*.{js,jsx}',
    ],
    theme: {
        extend: {
            colors: {
                'sf-navy': '#000000',
                'sf-blue': '#E30613',
                'sf-bg': '#FFFFFF',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', ...defaultTheme.fontFamily.sans],
                serif: ['Georgia', 'Cambria', 'Times New Roman', ...defaultTheme.fontFamily.serif],
            },
        },
    },
    plugins: [],
};
