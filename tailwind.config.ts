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
        background: "#020817",
        foreground: "#f9fafb",
        primary: {
          DEFAULT: "#4f46e5",
          foreground: "#f9fafb"
        },
        muted: {
          DEFAULT: "#111827",
          foreground: "#9ca3af"
        },
        border: "#1f2933"
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
