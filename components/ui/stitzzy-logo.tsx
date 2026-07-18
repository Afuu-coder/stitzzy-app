import { cn } from "@/lib/utils";

interface StitzzyLogoProps {
  className?: string;
  variant?: "full" | "icon";
  /** "light" = dark ink on light bg (default), "dark" = white on dark bg */
  scheme?: "light" | "dark";
}

/**
 * Stitzzy SVG logo 
 * Double-wing motif (matching the official logo) + "Stitzzy" wordmark underneath.
 */
export function StitzzyLogo({
  className,
  variant = "full",
  scheme = "light",
}: StitzzyLogoProps) {
  const textColor = scheme === "dark" ? "#FFFFFF" : "#12203A";

  if (variant === "icon") {
    return (
      <svg
        viewBox="0 0 200 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-8 w-auto", className)}
        aria-label="Stitzzy"
        role="img"
      >
        <DoubleWing />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-12 w-auto", className)}
      aria-label="Stitzzy"
      role="img"
    >
      {/* Double wing centered */}
      <g transform="translate(20, 20)">
        <DoubleWing />
      </g>

      {/* Wordmark centered below the wing */}
      <text
        x="120" y="165"
        textAnchor="middle"
        fontFamily="'Bricolage Grotesque', sans-serif"
        fontSize="36"
        fontWeight="600"
        fill={textColor}
        letterSpacing="-0.5"
      >
        Stitzzy
      </text>
    </svg>
  );
}

/** The standalone Double Wing SVG component */
function DoubleWing() {
  return (
    <>
      <defs>
        <linearGradient id="wing-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      <g transform="translate(100, 100)">
        {/* ── Left Wing ── */}
        <g>
          {/* Petal 1 (Top) */}
          <path 
            d="M -2,0 C -15,-35 -30,-75 -40,-95 C -15,-65 5,-30 3,-5 Z" 
            fill="url(#wing-grad)" 
            opacity="0.6" 
          />
          {/* Petal 2 */}
          <path 
            d="M -3,4 C -35,-20 -65,-55 -85,-75 C -40,-45 -10,-15 4,0 Z" 
            fill="url(#wing-grad)" 
            opacity="0.75" 
          />
          {/* Petal 3 */}
          <path 
            d="M -4,8 C -55,-5 -95,-25 -115,-45 C -75,-20 -25,0 5,5 Z" 
            fill="url(#wing-grad)" 
            opacity="0.9" 
          />
          {/* Petal 4 (Bottom) */}
          <path 
            d="M -5,12 C -70,15 -115,10 -135,-5 C -85,15 -35,18 6,10 Z" 
            fill="url(#wing-grad)" 
          />
        </g>

        {/* ── Right Wing (Mirrored) ── */}
        <g transform="scale(-1, 1)">
          {/* Petal 1 (Top) */}
          <path 
            d="M -2,0 C -15,-35 -30,-75 -40,-95 C -15,-65 5,-30 3,-5 Z" 
            fill="url(#wing-grad)" 
            opacity="0.6" 
          />
          {/* Petal 2 */}
          <path 
            d="M -3,4 C -35,-20 -65,-55 -85,-75 C -40,-45 -10,-15 4,0 Z" 
            fill="url(#wing-grad)" 
            opacity="0.75" 
          />
          {/* Petal 3 */}
          <path 
            d="M -4,8 C -55,-5 -95,-25 -115,-45 C -75,-20 -25,0 5,5 Z" 
            fill="url(#wing-grad)" 
            opacity="0.9" 
          />
          {/* Petal 4 (Bottom) */}
          <path 
            d="M -5,12 C -70,15 -115,10 -135,-5 C -85,15 -35,18 6,10 Z" 
            fill="url(#wing-grad)" 
          />
        </g>
      </g>
    </>
  );
}
