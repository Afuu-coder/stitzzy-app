import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Stitzzy Brand Colors ──────────────────────────────────────────────
      colors: {
        // Primary brand blue gradient anchors
        brand: {
          50:  "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1", // primary
          600: "#4F46E5", // PRD primary
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        // Sky / accent
        sky: {
          400: "#38BDF8",
          500: "#0EA5E9",
        },
        // Ink (dark text system)
        ink: {
          DEFAULT: "#12203A",
          muted:   "#5B6478",
          faint:   "#8896AB",
        },
        // Canvas (light backgrounds)
        canvas: {
          DEFAULT: "#F4F6FA",
          2:       "#EAEDF3",
          white:   "#FFFFFF",
        },
        // Brass / gold (eyebrows, live badges, accents)
        brass: {
          DEFAULT: "#B8892E",
          light:   "#D4A853",
        },
        // Status colors
        success: "#22C55E",
        warning: "#F59E0B",
        danger:  "#C1502E",
        // WhatsApp green
        whatsapp: "#25D366",
        // shadcn/ui CSS-variable tokens
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
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
      },

      // ── Typography ──────────────────────────────────────────────────────
      fontFamily: {
        display: ["var(--font-bricolage)", "Poppins", "sans-serif"],
        sans:    ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono:    ["var(--font-ibm-mono)", "IBM Plex Mono", "monospace"],
      },

      // ── Border Radius ───────────────────────────────────────────────────
      borderRadius: {
        lg:   "var(--radius)",
        md:   "calc(var(--radius) - 2px)",
        sm:   "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },

      // ── Shadows ──────────────────────────────────────────────────────────
      boxShadow: {
        card:    "0 1px 3px rgba(18,32,58,0.08), 0 4px 12px rgba(18,32,58,0.04)",
        "card-hover": "0 4px 16px rgba(18,32,58,0.12), 0 8px 24px rgba(18,32,58,0.06)",
        stitch:  "inset 0 0 0 1.5px rgba(18,32,58,0.28)",
        glow:    "0 0 24px rgba(79,70,229,0.25)",
      },

      // ── Gradients via backgroundImage ────────────────────────────────────
      backgroundImage: {
        "brand-gradient":  "linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)",
        "brand-gradient-v": "linear-gradient(180deg, #4F46E5 0%, #3B82F6 100%)",
        "hero-gradient":   "linear-gradient(135deg, #EEF2FF 0%, #F4F6FA 60%, #E0E7FF 100%)",
        "dark-gradient":   "linear-gradient(135deg, #0F172A 0%, #12203A 100%)",
      },

      // ── Spacing (8px grid) ───────────────────────────────────────────────
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
      },

      // ── Keyframe animations ──────────────────────────────────────────────
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "tag-sway": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%":      { transform: "rotate(3deg)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "tag-sway":       "tag-sway 5s ease-in-out infinite",
        "fade-in":        "fade-in 0.4s ease-out",
        "slide-up":       "slide-up 0.5s ease-out",
        "shimmer":        "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
