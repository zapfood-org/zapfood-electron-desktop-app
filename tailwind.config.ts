import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FFF1EC",
          100: "#FFD6C9",
          200: "#FFB39A",
          300: "#FF8A63",
          400: "#FF6233",
          500: "#FF3E00", // base
          600: "#E63700",
          700: "#C82F00",
          800: "#A82700",
          900: "#7F1E00",
          DEFAULT: "#FF3E00",
          foreground: "#FFFFFF",
        },
        "default-10": "#0D0D0D",
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#ff3e00",
              foreground: "#ffffff",
            },
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: "#ff3e00",
              foreground: "#ffffff",
            },
          },
        },
      },
    }),
  ],
};
