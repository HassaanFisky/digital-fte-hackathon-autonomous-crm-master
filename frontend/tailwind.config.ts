import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border-fine)",
        input: "var(--border-fine)",
        ring: "var(--accent)",
        background: "var(--bg-base)",
        foreground: "var(--text-primary)",
        primary: {
          DEFAULT: "var(--accent)",
          foreground: "var(--bg-base)",
        },
        secondary: {
          DEFAULT: "var(--bg-surface)",
          foreground: "var(--text-primary)",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--bg-elevated)",
          foreground: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--bg-base)",
        },
        popover: {
          DEFAULT: "var(--bg-surface)",
          foreground: "var(--text-primary)",
        },
        card: {
          DEFAULT: "var(--bg-surface)",
          foreground: "var(--text-primary)",
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'float': '0 10px 40px -4px rgba(0, 0, 0, 0.08)',
      },
      keyframes: {
        'bounce-x': {
          '0%, 100%': { transform: 'translateX(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateX(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'bounce-x': 'bounce-x 1s infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
