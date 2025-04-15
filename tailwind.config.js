/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "spin-in-90": {
          "0%": { transform: "rotate(-90deg) scale(0)" },
          "100%": { transform: "rotate(0deg) scale(1)" }
        },
        "zoom-in-50": {
          "0%": { transform: "scale(0.5)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 }
        },
        "pulse-once": {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 }
        },
        "bounce-once": {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-25%)' }
        },
        "slide-in-center": {
          '0%': { transform: 'translateX(-50%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 }
        },
        "scale-up": {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 }
        },
        "fade-in": {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        "move-to-center": {
          "0%": {
            gridColumn: "span 3 / span 3",
            transform: "translateX(0)"
          },
          "100%": {
            gridColumn: "span 8 / span 8",
            gridColumnStart: "3",
            transform: "translateX(0)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-once": "pulse-once 1s ease-in-out",
        "bounce-once": "bounce-once 0.5s ease-in-out",
        "slide-in-center": "slide-in-center 0.8s ease-out",
        "scale-up": "scale-up 0.8s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "move-to-center": "move-to-center 0.8s ease-in-out forwards"

      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}