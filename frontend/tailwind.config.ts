import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "#080E1A",
        surface: "#0F1929",
        card: "#141F33",
        card2: "#192540",
        border: "#1E3050",
        border2: "#243760",
        em: "#10B981",          // Success/Green glow
        em2: "#059669",
        ind: "#6366F1",         // Indigo indicators
        amber: "#F59E0B",
        red: "#EF4444",
        text: "#F0F6FF",
        text2: "#8BA4C4",       // Dimmed
        text3: "#4A6285",       // Muted/Lower opacity
      },
      fontFamily: {
        head: ['var(--font-head)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        'em-glow': '0 8px 24px rgba(16,185,129,0.25)',
        'ind-glow': '0 8px 24px rgba(99,102,241,0.25)',
      },
      animation: {
        'pulse-live': 'pulse-live 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'blink': 'blink 1s infinite',
      },
      keyframes: {
        'pulse-live': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.8)' },
        },
        'fadeIn': {
          'from': { opacity: '0', transform: 'translateY(8px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'blink': {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        }
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;

