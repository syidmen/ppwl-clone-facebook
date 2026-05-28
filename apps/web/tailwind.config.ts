import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          500: "#1877f2",
          600: "#166fe5",
          700: "#145ec1"
        }
      },
      fontFamily: {
        sans: ['"Segoe UI Historic"', '"Segoe UI"', "Helvetica", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
