/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          light: '#3b82f6',
          dark: '#1d4ed8',
        },
        secondary: {
          DEFAULT: '#50c878',
          light: '#6ee7a0',
          dark: '#45a663',
        },
        background: {
          DEFAULT: '#f5f7fa',
          card: '#ffffff',
          dark: '#333333',
        },
        text: {
          DEFAULT: '#1f2937',
          light: '#6b7280',
          dark: '#111827',
        },
        border: '#e5e7eb',
        gray: {
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
        },
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
        },
        red: {
          50: '#fef2f2',
          100: '#fee2e2',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 4px 6px rgba(0, 0, 0, 0.1)',
        hover: '0 8px 16px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '2rem',
        lg: '4rem',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '1rem',
      },
    },
  },
  plugins: [],
} 