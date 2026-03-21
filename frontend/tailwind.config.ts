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
        anthropic: {
          bg: "#F5F0E8",
          secondary: "#EDE8DF",
          dark: "#1A1612",
          orange: "#CC5500",
          coral: "#E8724A",
          text: "#1A1612",
          gray: "#6B6459",
          muted: "#9E948A",
          border: "#DDD8CF",
          white: "#FDFAF5"
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      animation: {
        'reveal': 'reveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
