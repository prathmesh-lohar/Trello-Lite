/** @type {import('tailwindcss').Config} */
module.exports = {
    // 1. Content: Now correctly scanning your files
    darkMode: "class",
  content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            // 2. Extend Colors: Mapping classes to CSS variables
            colors: {
                // Used for bg-primary, text-primary, focus:ring-primary, etc.
                primary: 'var(--color-primary)',
                // Used for bg-background-light
                'background-light': 'var(--color-background-light)',
                // Used for dark:bg-background-dark and dark:focus:ring-offset-background-dark
                'background-dark': 'var(--color-background-dark)',
            },
            // 3. Extend Font Family: Mapping font-display to a CSS variable
            fontFamily: {
                // Used for font-display
                display: ['var(--font-display)', 'sans-serif'],
            },
        },
    },
    plugins: [],
}