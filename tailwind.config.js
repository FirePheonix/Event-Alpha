/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Regular Awesome Serif variants
        'awesome-serif': ['AwesomeSerif', 'Playfair Display', 'serif'],
        'awesome-serif-italic': ['AwesomeSerifItalic', 'Playfair Display', 'serif'],
        
        // Variable font variants (for modern browsers that support them)
        'awesome-serif-var': ['AwesomeSerifVar', 'AwesomeSerif', 'Playfair Display', 'serif'],
        'awesome-serif-italic-var': ['AwesomeSerifItalicVar', 'AwesomeSerifItalic', 'Playfair Display', 'serif'],
        
        // Convenient aliases
        'serif-awesome': ['AwesomeSerif', 'Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
