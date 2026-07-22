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
      // ── Stitzzy Brand Colors (per 01-brand-identity.md) ──────────────────
      // Navy is the ONLY primary-CTA color. Gold is reserved for trust/status
      // badges — never a button fill. Warm off-white surfaces, never clinical.
      colors: {
        // Primary brand accent — navy (#1B2A4A = navy-600). The full scale is
        // navy-anchored so every existing bg-brand-*/text-brand-* usage reskins
        // to the institutional navy automatically.
        brand: {
          50:  "#EEF0F5",
          100: "#E6EAF2", // navy-100 — chip bg, selected-state fill
          200: "#C7D0E0",
          300: "#9FADC7",
          400: "#5A6E93",
          500: "#2A3D5F",
          600: "#1B2A4A", // navy-600 — primary CTA, links, active states
          700: "#16223C",
          800: "#111A2E",
          900: "#0C1220",
        },
        // Navy semantic aliases
        navy: {
          DEFAULT: "#1B2A4A",
          100:     "#E6EAF2",
        },
        // Sky / accent (kept for incidental use)
        sky: {
          400: "#38BDF8",
          500: "#0EA5E9",
        },
        // Ink (dark text system)
        ink: {
          DEFAULT: "#14161B", // ink-900 — body text, logo
          muted:   "#4A4D57", // ink-600 — secondary text
          faint:   "#9A9DA8", // ink-300 — muted, placeholders, disabled
        },
        // Canvas — warm off-white, not clinical pure white
        canvas: {
          DEFAULT: "#FAF9F6", // surface-0 — page bg
          2:       "#F2F0EA", // warm hairline fill
          white:   "#FFFFFF", // surface-1 — cards, panels
        },
        // Brass / gold — verified/premium accent (badges & status only)
        brass: {
          DEFAULT: "#B8863B", // gold-500
          light:   "#F5EBDA", // gold-100 — badge backgrounds
        },
        // Status colors (per brand spec §3.2)
        success: "#1F7A4D",
        warning: "#B8863B",
        danger:  "#B23A3A",
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
        card:    "0 1px 3px rgba(20,22,27,0.06), 0 4px 12px rgba(20,22,27,0.03)",
        "card-hover": "0 4px 16px rgba(20,22,27,0.10), 0 8px 24px rgba(20,22,27,0.05)",
        stitch:  "inset 0 0 0 1.5px rgba(27,42,74,0.25)",
        glow:    "0 0 24px rgba(27,42,74,0.18)",
      },

      // ── Gradients via backgroundImage ────────────────────────────────────
      backgroundImage: {
        "brand-gradient":  "linear-gradient(135deg, #1B2A4A 0%, #2A3D5F 100%)",
        "brand-gradient-v": "linear-gradient(180deg, #1B2A4A 0%, #2A3D5F 100%)",
        "hero-gradient":   "linear-gradient(135deg, #F5EBDA 0%, #FAF9F6 55%, #E6EAF2 100%)",
        "dark-gradient":   "linear-gradient(135deg, #0C1220 0%, #1B2A4A 100%)",
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
        // ── Calm brand motion (loading screen + reveals) ──
        "logo-in": {
          from: { opacity: "0", transform: "scale(0.92)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "loader-bar": {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "reveal": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "tag-sway":       "tag-sway 5s ease-in-out infinite",
        "fade-in":        "fade-in 0.4s ease-out",
        "slide-up":       "slide-up 0.5s ease-out",
        "shimmer":        "shimmer 2s linear infinite",
        "logo-in":        "logo-in 0.5s cubic-bezier(0.22,1,0.36,1)",
        "loader-bar":     "loader-bar 1.1s cubic-bezier(0.65,0,0.35,1) infinite",
        "reveal":         "reveal 0.45s cubic-bezier(0.22,1,0.36,1)",
      },
    },
  },
  plugins: [],
};

export default config;
