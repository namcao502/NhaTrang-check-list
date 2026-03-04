import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#fdf8f0",
          100: "#faefd8",
          200: "#f4dba8",
          300: "#ecc471",
          400: "#e2a83a",
          500: "#d4891e",
        },
        ocean: {
          50: "#eff8ff",
          100: "#dbeffe",
          200: "#bfe3fd",
          300: "#93d1fc",
          400: "#5eb5f9",
          500: "#3b96f5",
          600: "#1d74e8",
          700: "#1860d5",
        },
        coral: {
          100: "#fff3e0",
          500: "#f77f00",
          600: "#e65c00",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        "dm-sans": ["var(--font-dm-sans)", "sans-serif"],
      },
      keyframes: {
        "wave-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "300% 50%" },
        },
      },
      animation: {
        "wave-shift": "wave-shift 4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
