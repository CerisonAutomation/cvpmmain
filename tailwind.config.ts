import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  prefix: "",
  future: {
    hoverOnlyWhenSupported: true,
    respectDefaultRingColorOpacity: true,
  },
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        serif:   ["'Cormorant Garamond'", ...fontFamily.serif],
        script:  ["'Cormorant Garamond'", ...fontFamily.serif],
        display: ["'Raleway'", ...fontFamily.sans],
        sans:    ["'Inter'", ...fontFamily.sans],
        mono:    ["'JetBrains Mono'", ...fontFamily.mono],
      },
      colors: {
        border:     "hsl(var(--border) / <alpha-value>)",
        input:      "hsl(var(--input) / <alpha-value>)",
        ring:       "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT:    "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT:    "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT:    "hsl(var(--success, 142 76% 36%) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground, 0 0% 100%) / <alpha-value>)",
        },
        warning: {
          DEFAULT:    "hsl(var(--warning, 38 92% 50%) / <alpha-value>)",
          foreground: "hsl(var(--warning-foreground, 0 0% 100%) / <alpha-value>)",
        },
        info: {
          DEFAULT:    "hsl(var(--info, 217 91% 60%) / <alpha-value>)",
          foreground: "hsl(var(--info-foreground, 0 0% 100%) / <alpha-value>)",
        },
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
        luxuryGold:   "hsl(var(--luxury-gold) / <alpha-value>)",
        "gold-light": "hsl(var(--luxury-gold-light) / <alpha-value>)",
        "gold-dark":  "hsl(var(--luxury-gold-dark) / <alpha-value>)",
        sidebar: {
          DEFAULT:              "hsl(var(--sidebar-background) / <alpha-value>)",
          foreground:           "hsl(var(--sidebar-foreground) / <alpha-value>)",
          primary:              "hsl(var(--sidebar-primary) / <alpha-value>)",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          accent:               "hsl(var(--sidebar-accent) / <alpha-value>)",
          "accent-foreground":  "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border:               "hsl(var(--sidebar-border) / <alpha-value>)",
          ring:                 "hsl(var(--sidebar-ring) / <alpha-value>)",
        },
      },
      spacing: {
        "4.5": "1.125rem",
        "13":  "3.25rem",
        "15":  "3.75rem",
        "18":  "4.5rem",
        "22":  "5.5rem",
        "30":  "7.5rem",
      },
      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
        xl:  "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        luxury:  "0 4px 24px -4px rgba(196,163,90,0.18), 0 1px 4px rgba(0,0,0,0.08)",
        "luxury-lg": "0 12px 48px -8px rgba(196,163,90,0.22), 0 4px 16px rgba(0,0,0,0.12)",
        float:   "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        inset:   "inset 0 2px 4px rgba(0,0,0,0.06)",
      },
      transitionTimingFunction: {
        cinematic: "cubic-bezier(0.22, 1, 0.36, 1)",
        spring:    "cubic-bezier(0.34, 1.56, 0.64, 1)",
        snap:      "cubic-bezier(0.77, 0, 0.175, 1)",
        expo:      "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        fast:  "150ms",
        base:  "300ms",
        slow:  "500ms",
        crawl: "900ms",
      },
      zIndex: {
        dropdown: "1000",
        sticky:   "1020",
        fixed:    "1030",
        backdrop: "1040",
        modal:    "1050",
        popover:  "1060",
        tooltip:  "1070",
        toast:    "1080",
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
        "fade-in":  { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-out": { from: { opacity: "1" }, to: { opacity: "0" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "scale-out": {
          from: { opacity: "1", transform: "scale(1)" },
          to:   { opacity: "0", transform: "scale(0.95)" },
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
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)", animationTimingFunction: "cubic-bezier(0.8,0,1,1)" },
          "50%":      { transform: "translateY(-10%)", animationTimingFunction: "cubic-bezier(0,0,0.2,1)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0,0)" },
          "10%": { transform: "translate(-5%,-10%)" },
          "20%": { transform: "translate(-15%,5%)" },
          "30%": { transform: "translate(7%,-25%)" },
          "40%": { transform: "translate(-5%,25%)" },
          "50%": { transform: "translate(-15%,10%)" },
          "60%": { transform: "translate(15%,0%)" },
          "70%": { transform: "translate(0%,15%)" },
          "80%": { transform: "translate(3%,35%)" },
          "90%": { transform: "translate(-10%,10%)" },
        },
      },
      animation: {
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        "fade-in":         "fade-in 0.35s cubic-bezier(0.22,1,0.36,1) both",
        "fade-out":        "fade-out 0.2s cubic-bezier(0.22,1,0.36,1) both",
        "slide-up":        "slide-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "slide-down":      "slide-down 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "slide-in-left":   "slide-in-left 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "slide-in-right":  "slide-in-right 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "scale-in":        "scale-in 0.3s cubic-bezier(0.22,1,0.36,1) both",
        "scale-out":       "scale-out 0.2s cubic-bezier(0.22,1,0.36,1) both",
        shimmer:           "shimmer 2.5s linear infinite",
        "skeleton-wave":   "skeleton-wave 1.8s ease-in-out infinite",
        "gold-pulse":      "gold-pulse 2.4s ease-in-out infinite",
        "spin-slow":       "spin-slow 3s linear infinite",
        grain:             "grain 8s steps(10) infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
} satisfies Config;
