import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        serif:   ["'Cormorant Garamond'", "serif"],
        script:  ["'Cormorant Garamond'", "serif"],
        display: ["'Raleway'", "sans-serif"],
        sans:    ["'Inter'", "system-ui", "sans-serif"],
      },
      colors: {
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* ── Gold scale — mirrors CSS vars in index.css ── */
        gold: {
          50:  "#faf6ee",
          100: "#f0e4c4",
          200: "#e2c98a",
          300: "#c4a35a",
          400: "#b8902f",
          500: "#9a7520",
          600: "#7d6038",
          700: "#5e4820",
          800: "#3d2e10",
          900: "#1e1708",
        },
        luxuryGold:  "hsl(var(--luxury-gold))",
        "gold-light": "hsl(var(--luxury-gold-light))",
        "gold-dark":  "hsl(var(--luxury-gold-dark))",
        sidebar: {
          DEFAULT:             "hsl(var(--sidebar-background))",
          foreground:          "hsl(var(--sidebar-foreground))",
          primary:             "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent:              "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border:              "hsl(var(--sidebar-border))",
          ring:                "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionTimingFunction: {
        cinematic: "cubic-bezier(0.22, 1, 0.36, 1)",
        spring:    "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        fast:  "200ms",
        base:  "400ms",
        slow:  "700ms",
        crawl: "1100ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.92)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to:   { backgroundPosition: "-200% 0" },
        },
        "skeleton-wave": {
          "0%":   { transform: "translateX(-100%)" },
          "60%":  { transform: "translateX(100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "gold-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(196,163,90,0)" },
          "50%":      { boxShadow: "0 0 0 8px rgba(196,163,90,0.12)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%":  { transform: "translate(-5%, -10%)" },
          "20%":  { transform: "translate(-15%, 5%)" },
          "30%":  { transform: "translate(7%, -25%)" },
          "40%":  { transform: "translate(-5%, 25%)" },
          "50%":  { transform: "translate(-15%, 10%)" },
          "60%":  { transform: "translate(15%, 0%)" },
          "70%":  { transform: "translate(0%, 15%)" },
          "80%":  { transform: "translate(3%, 35%)" },
          "90%":  { transform: "translate(-10%, 10%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in":        "fade-in 0.4s cubic-bezier(0.22,1,0.36,1) both",
        "slide-up":       "slide-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "slide-down":     "slide-down 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "scale-in":       "scale-in 0.4s cubic-bezier(0.22,1,0.36,1) both",
        shimmer:          "shimmer 3s linear infinite",
        "skeleton-wave":  "skeleton-wave 1.8s ease-in-out infinite",
        "gold-pulse":     "gold-pulse 2.4s ease-in-out infinite",
        grain:            "grain 8s steps(10) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
