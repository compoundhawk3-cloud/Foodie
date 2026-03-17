import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#2E5B4E",
          50: "#E8F0EE",
          100: "#D1E1DC",
          200: "#A3C3B9",
          300: "#75A597",
          400: "#518071",
          500: "#2E5B4E",
          600: "#264C41",
          700: "#1E3D34",
          800: "#162E27",
          900: "#0F1F1A",
        },
        accent: {
          DEFAULT: "#2DB67D",
          50: "#E9F8F1",
          100: "#D3F1E3",
          200: "#A7E3C7",
          300: "#7BD5AB",
          400: "#4FC78F",
          500: "#2DB67D",
          600: "#249564",
          700: "#1B734C",
          800: "#125133",
          900: "#09301B",
        },
        gold: {
          DEFAULT: "#F5A623",
          50: "#FEF5E6",
          100: "#FDEBCD",
          200: "#FBD79B",
          300: "#F9C369",
          400: "#F7B546",
          500: "#F5A623",
          600: "#D48B0E",
          700: "#A06A0A",
          800: "#6C4807",
          900: "#382503",
        },
        cream: "#F5F5F0",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
