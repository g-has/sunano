/**
 * Centralized Theme System
 * All colors, spacing, and design tokens defined here
 */

export const THEME = {
  // Main Background Colors
  bg: {
    primary: "#0f1420", // Main page background
    secondary: "#131a28", // Card background
    tertiary: "#0a0e18", // Admin sidebar background
    hover: "#1a2333", // Hover state
    light: "#1a2436", // Lighter surfaces
  },

  // Border Colors
  border: {
    default: "border-white/10",
    light: "border-white/5",
    hover: "border-white/20",
    accent: "border-sky-400/30",
    accentHover: "border-sky-400/40",
  },

  // Text Colors
  text: {
    primary: "text-slate-50", // Primary text
    secondary: "text-slate-200", // Secondary text
    tertiary: "text-slate-300", // Tertiary text
    muted: "text-slate-400", // Muted text
    dimmed: "text-slate-500", // Dimmed text
  },

  // Accent Colors
  accent: {
    sky: {
      bg: "bg-sky-500/20",
      text: "text-sky-200",
      border: "border-sky-400/40",
    },
    amber: {
      bg: "bg-amber-500/20",
      text: "text-amber-200",
      border: "border-amber-400/40",
    },
    emerald: {
      bg: "bg-emerald-500/20",
      text: "text-emerald-200",
      border: "border-emerald-400/40",
    },
    red: {
      bg: "bg-red-500/10",
      text: "text-red-300",
      border: "border-red-500/30",
    },
    rose: {
      bg: "bg-rose-500/20",
      text: "text-rose-200",
      border: "border-rose-400/40",
    },
    blue: {
      bg: "bg-blue-500/20",
      text: "text-blue-200",
      border: "border-blue-400/40",
    },
    green: {
      bg: "bg-green-500/20",
      text: "text-green-200",
      border: "border-green-400/40",
    },
  },

  // Spacing Scale
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
  },

  // Radius
  radius: {
    sm: "rounded-md",
    base: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
  },

  // Sidebar
  sidebar: {
    width: "w-60",
    collapsedWidth: "w-20",
    bgColor: "bg-[#0a0e18]",
    borderColor: "border-white/10",
  },

  // Component Sizes
  icon: {
    xs: "size-3",
    sm: "size-4",
    base: "size-5",
    lg: "size-6",
  },

  // Layout
  layout: {
    mainPadding: "p-4 md:p-5 lg:p-6",
    adminPadding: "p-6",
    contentMaxWidth: "max-w-[1720px]",
    adminMaxWidth: "max-w-7xl",
  },

  // Shadows
  shadow: {
    sm: "shadow-sm",
    base: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    "2xl": "shadow-2xl",
    glow: "shadow-[0_8px_32px_rgba(0,0,0,0.24)]",
    glowLarge: "shadow-[0_8px_44px_rgba(0,0,0,0.32)]",
    glowXL: "shadow-[0_25px_50px_rgba(0,0,0,0.8)]",
  },

  // Transitions
  transition: {
    fast: "transition-all duration-150",
    base: "transition-all duration-200",
    slow: "transition-all duration-300",
  },

  // Z-Index
  zIndex: {
    sidebar: "z-40",
    modal: "z-50",
    dropdown: "z-30",
  },
} as const

// Convenience function to get card styling
export const cardStyles = {
  base: `border ${THEME.border.default} ${THEME.bg.secondary}/90 ${THEME.shadow.glow} backdrop-blur`,
  hover: `hover:${THEME.border.hover} hover:${THEME.bg.hover}/90 transition-all`,
  interactive: `cursor-pointer border ${THEME.border.default} ${THEME.bg.secondary}/90 ${THEME.shadow.glow} backdrop-blur hover:${THEME.border.accentHover} hover:${THEME.bg.hover}/90 transition-all`,
}

// Convenience function to get button styling
export const buttonStyles = {
  primary: `bg-slate-100 text-slate-900 hover:bg-slate-200`,
  secondary: `bg-white/10 text-slate-100 hover:bg-white/20`,
  outline: `border border-white/20 text-slate-100 hover:bg-white/5`,
  danger: `border border-red-500/30 text-red-300 hover:bg-red-500/10`,
  ghost: `text-slate-300 hover:bg-white/5 hover:text-slate-100`,
}
