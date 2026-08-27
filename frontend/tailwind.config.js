/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exact User Provided Hex Values
        brand: {
          50: '#F2F5FF',   // Surface Tint
          100: '#CEDEFF',  // Soft Pastel Blue Container
          200: '#A8B1CE',  // Border & Divider
          300: '#8ba2f5',
          400: '#6f90fa',
          500: '#5B81FA',  // Exact Primary Electric Royal Blue
          600: '#486de8',
          700: '#3857d4',
          800: '#2d43b3',
          900: '#253591',
          950: '#171f59',
        },
        navy: {
          50: '#f3f4fa',
          100: '#e4e7f5',
          200: '#ced5ed',
          300: '#a8b6e0',
          400: '#7c90d0',
          500: '#596ebc',
          600: '#4656a8',
          700: '#3a4491',
          900: '#29318A',  // Exact Deep Midnight Navy
          950: '#191d59',
        },
        charcoal: '#1F1F1F', // Exact Dark Text
        mutedSlate: '#6B6E84', // Exact Muted Slate
        canvas: '#F8F9FC', // Exact App Background
      },
      fontFamily: {
        sans: ['"Kind Sans"', '"Plus Jakarta Sans"', '"DM Sans"', 'Poppins', 'Inter', 'sans-serif'],
        kind: ['"Kind Sans"', '"Plus Jakarta Sans"', '"DM Sans"', 'Poppins', 'sans-serif'],
        heading: ['"Kind Sans"', '"Plus Jakarta Sans"', '"DM Sans"', 'Poppins', 'sans-serif'],
        poppins: ['"Kind Sans"', 'Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px -2px rgba(91, 129, 250, 0.12), 0 1px 4px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 14px 28px -6px rgba(91, 129, 250, 0.22), 0 6px 12px -4px rgba(41, 49, 138, 0.15)',
        'material-1': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(91,129,250,0.12)',
        'material-2': '0 4px 14px rgba(91,129,250,0.2), 0 2px 4px rgba(0,0,0,0.06)',
        'material-3': '0 16px 32px rgba(41,49,138,0.25), 0 6px 12px rgba(91,129,250,0.12)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [],
}
