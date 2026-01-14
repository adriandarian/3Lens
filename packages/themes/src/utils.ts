import type { ThemeMode, ResolvedTheme, Theme } from './types.js';

/**
 * Resolve theme mode to actual theme
 * 'auto' resolves based on system preference
 */
export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'auto') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark';
    }
    return 'dark'; // Default to dark if can't detect
  }
  return mode;
}

/**
 * Get CSS variable name for a theme token
 */
export function getCSSVariable(token: string): string {
  return `--3lens-${token}`;
}

/**
 * Get CSS variable value
 */
export function getCSSVariableValue(
  token: string,
  element?: HTMLElement
): string {
  const root =
    element ||
    (typeof document !== 'undefined' ? document.documentElement : null);
  if (!root) {
    return '';
  }
  const value = getComputedStyle(root).getPropertyValue(getCSSVariable(token));
  return value.trim();
}

/**
 * Set CSS variable value
 */
export function setCSSVariable(
  token: string,
  value: string,
  element?: HTMLElement
): void {
  const root =
    element ||
    (typeof document !== 'undefined' ? document.documentElement : null);
  if (!root) {
    return;
  }
  root.style.setProperty(getCSSVariable(token), value);
}

/**
 * Apply theme by loading the appropriate CSS file
 */
export function applyTheme(theme: ResolvedTheme): void {
  if (typeof document === 'undefined') {
    return;
  }

  // Remove existing theme links
  const existingLinks = document.querySelectorAll('link[data-3lens-theme]');
  existingLinks.forEach((link) => link.remove());

  // Create new theme link
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.setAttribute('data-3lens-theme', theme);

  // In a real implementation, this would load from the package
  // For now, we'll set CSS variables directly
  const themeStyles = getThemeStyles(theme);
  const style = document.createElement('style');
  style.setAttribute('data-3lens-theme', theme);
  style.textContent = themeStyles;
  document.head.appendChild(style);
}

/**
 * Get theme CSS as string (for inline injection)
 */
function getThemeStyles(theme: ResolvedTheme): string {
  // This would typically import from the CSS files
  // For now, return empty - CSS files will be imported separately
  return '';
}

/**
 * Get current theme from document
 */
export function getCurrentTheme(): ResolvedTheme | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const themeLink = document.querySelector(
    'link[data-3lens-theme]'
  ) as HTMLLinkElement;
  if (themeLink) {
    return themeLink.getAttribute('data-3lens-theme') as ResolvedTheme;
  }

  // Check for inline style
  const themeStyle = document.querySelector('style[data-3lens-theme]');
  if (themeStyle) {
    return themeStyle.getAttribute('data-3lens-theme') as ResolvedTheme;
  }

  return null;
}

/**
 * Watch for system theme changes
 */
export function watchSystemTheme(
  callback: (theme: ResolvedTheme) => void
): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {}; // No-op cleanup
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

  const handler = (e: MediaQueryListEvent | MediaQueryList) => {
    callback(e.matches ? 'light' : 'dark');
  };

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }

  // Legacy browsers
  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
}
