import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#A4D12C",
          dark: "#8AB524",
          light: "#C2E468",
          50: "#F5FAEB",
          100: "#E8F5CC",
          200: "#D4EC9E",
          300: "#C2E468",
          400: "#A4D12C",
          500: "#8AB524",
          600: "#6D9219",
          700: "#536E13",
          800: "#3A4D0E",
          900: "#202B08",
        },
        dental: {
          bg: "#F8FAF5",
          sidebar: "#1A2332",
          "sidebar-hover": "#243044",
          "sidebar-active": "#2D3D56",
          card: "#FFFFFF",
          border: "#E5E7EB",
          text: "#1F2937",
          "text-muted": "#6B7280",
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', "sans-serif"],
        body: ['"Inter"', "sans-serif"],
        mono: ['"Space Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
