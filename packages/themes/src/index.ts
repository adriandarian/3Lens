/**
 * @3lens/themes
 *
 * 3Lens design system themes and styles for consistent UI across applications.
 *
 * @example
 * ```html
 * <!-- Import complete styles (dark theme + base) -->
 * <link rel="stylesheet" href="@3lens/themes/styles.css">
 *
 * <!-- Or import specific theme -->
 * <link rel="stylesheet" href="@3lens/themes/theme-dark.css">
 * <link rel="stylesheet" href="@3lens/themes/base.css">
 * ```
 *
 * @example
 * ```typescript
 * import '@3lens/themes/styles.css';
 * import { applyTheme, resolveTheme } from '@3lens/themes';
 *
 * // Apply dark theme
 * applyTheme('dark');
 *
 * // Auto-detect system preference
 * const theme = resolveTheme('auto');
 * applyTheme(theme);
 * ```
 */

// Export types
export type {
  ThemeMode,
  ResolvedTheme,
  ThemeColors,
  ThemeSpacing,
  ThemeRadius,
  ThemeShadows,
  ThemeTransitions,
  Theme,
} from './types.js';

// Export utilities
export {
  resolveTheme,
  getCSSVariable,
  getCSSVariableValue,
  setCSSVariable,
  applyTheme,
  getCurrentTheme,
  watchSystemTheme,
} from './utils.js';

// Note: CSS files should be imported separately:
// import '@3lens/themes/styles.css'
// or
// import '@3lens/themes/theme-dark.css'
// import '@3lens/themes/base.css'
