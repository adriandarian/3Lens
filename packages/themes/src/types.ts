/**
 * Theme mode options
 */
export type ThemeMode = 'dark' | 'light' | 'high-contrast' | 'auto';

/**
 * Resolved theme (auto resolves to dark or light)
 */
export type ResolvedTheme = 'dark' | 'light' | 'high-contrast';

/**
 * Theme color tokens
 */
export interface ThemeColors {
  // Background colors
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgElevated: string;
  bgHover: string;
  bgActive: string;

  // Border colors
  border: string;
  borderSubtle: string;
  borderFocus: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textInverse: string;

  // Accent colors
  accentBlue: string;
  accentCyan: string;
  accentEmerald: string;
  accentAmber: string;
  accentRose: string;
  accentViolet: string;
  accentPink: string;

  // Semantic colors
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  info: string;
  infoBg: string;

  // Object type colors
  colorScene: string;
  colorMesh: string;
  colorGroup: string;
  colorLight: string;
  colorCamera: string;
  colorBone: string;
  colorHelper: string;
}

/**
 * Theme spacing tokens
 */
export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * Theme radius tokens
 */
export interface ThemeRadius {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * Theme shadow tokens
 */
export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  glow: string;
}

/**
 * Theme transition tokens
 */
export interface ThemeTransitions {
  fast: string;
  normal: string;
  slow: string;
}

/**
 * Complete theme definition
 */
export interface Theme {
  name: string;
  mode: ResolvedTheme;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  shadows: ThemeShadows;
  transitions: ThemeTransitions;
  fonts: {
    mono: string;
    sans: string;
  };
}
