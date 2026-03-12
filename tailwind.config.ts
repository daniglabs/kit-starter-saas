import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8fafc",
        foreground: "#0f172a",
        primary: {
          DEFAULT: "#4f46e5",
          foreground: "#ffffff"
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b"
        },
        border: "#e2e8f0"
      },
      borderRadius: {
        lg: "0.75rem",
        full: "9999px"
      }
    }
  },
  plugins: []
};

export default config;
