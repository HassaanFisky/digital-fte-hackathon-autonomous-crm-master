import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./posts/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#0F172A",
          800: "#1E293B",
          700: "#334155"
        },
        emerald: {
          500: "#10B981"
        },
        indigo: {
          500: "#6366F1"
        },
        amber: {
          500: "#F59E0B"
        },
        text: {
          primary: "#F8FAFC",
          muted: "#94A3B8"
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
