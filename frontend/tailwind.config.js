/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF6B35", // Orange - cooking fire
          50: "#FFF4F1",
          100: "#FFE8E0",
          200: "#FFD1C1",
          300: "#FFB197",
          400: "#FF916D",
          500: "#FF6B35", // Main brand color
          600: "#E54F1F",
          700: "#C23B0F",
          800: "#9E2D08",
          900: "#7A2106",
        },
        secondary: {
          DEFAULT: "#2EC4B6", // Teal - fresh ingredients
          50: "#F0FFFE",
          100: "#E0FEFC",
          200: "#C2FCF8",
          300: "#9BF8F1",
          400: "#6FF2E8",
          500: "#2EC4B6", // Main secondary color
          600: "#20A398",
          700: "#18827A",
          800: "#13605C",
          900: "#0F4B47",
        },
        accent: {
          DEFAULT: "#FFE66D", // Yellow - warm and appetizing
          50: "#FFFEF0",
          100: "#FFFCE0",
          200: "#FFF8C2",
          300: "#FFF29B",
          400: "#FFEC6F",
          500: "#FFE66D",
          600: "#FFD632",
          700: "#FFC107",
          800: "#E6A800",
          900: "#B8850A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Merriweather", "serif"],
        brand: ["Poppins", "sans-serif"], // For headings and brand
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require("daisyui"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/line-clamp"),
  ],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#FF6B35",
          secondary: "#2EC4B6",
          accent: "#FFE66D",
          neutral: "#011627",
          "base-100": "#FFFFFF",
          "base-200": "#F8FAFC",
          "base-300": "#E2E8F0",
        },
        dark: {
          primary: "#FF6B35",
          secondary: "#2EC4B6",
          accent: "#FFE66D",
          neutral: "#D1D5DB",
          "base-100": "#1F2937",
          "base-200": "#374151",
          "base-300": "#4B5563",
        },
      },
    ],
  },
}