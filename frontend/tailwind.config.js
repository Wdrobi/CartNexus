/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0fdf9",
          100: "#ccfbef",
          200: "#99f6e0",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        ink: {
          950: "#0c0f14",
          900: "#121826",
          800: "#1a2234",
        },
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, rgba(12,15,20,0.92), rgba(12,15,20,0.98)), radial-gradient(ellipse 80% 50% at 50% -20%, rgba(20,184,166,0.35), transparent)",
        "hero-mesh":
          "radial-gradient(ellipse 100% 80% at 70% 10%, rgba(20,184,166,0.18), transparent 50%), radial-gradient(ellipse 60% 50% at 10% 60%, rgba(45,212,191,0.08), transparent 45%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(13,148,136,0.12), transparent 40%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        "float-delayed": "float 5s ease-in-out 1.2s infinite",
        "float-slow": "float 7s ease-in-out 0.5s infinite",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};
