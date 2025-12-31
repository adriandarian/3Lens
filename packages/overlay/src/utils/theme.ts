/**
 * 3Lens Theme System
 * 
 * Provides theme management with auto-detection, custom themes,
 * and accessibility features.
 */

export type ThemeMode = 'dark' | 'light' | 'high-contrast' | 'auto';
export type ResolvedTheme = 'dark' | 'light' | 'high-contrast';

/**
 * Custom theme definition
 */
export interface CustomTheme {
  name: string;
  
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
  accent: string;
  accentHover: string;
  accentBlue?: string;
  accentCyan?: string;
  accentEmerald?: string;
  accentAmber?: string;
  accentRose?: string;
  accentViolet?: string;
  
  // Semantic colors
  success: string;
  successBg?: string;
  warning: string;
  warningBg?: string;
  error: string;
  errorBg?: string;
  info?: string;
  infoBg?: string;
  
  // Shadows
  shadowSm?: string;
  shadowMd?: string;
  shadowLg?: string;
  
  // Color scheme
  colorScheme: 'dark' | 'light';
}

/**
 * Theme change event
 */
export interface ThemeChangeEvent {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  isAuto: boolean;
}

type ThemeChangeCallback = (event: ThemeChangeEvent) => void;

/**
 * Theme Manager
 * 
 * Handles theme switching, auto-detection, and custom themes.
 */
export class ThemeManager {
  private root: HTMLElement | null = null;
  private mode: ThemeMode = 'auto';
  private resolved: ResolvedTheme = 'dark';
  private customThemes: Map<string, CustomTheme> = new Map();
  private callbacks: ThemeChangeCallback[] = [];
  private mediaQuery: MediaQueryList | null = null;
  private mediaQueryHandler: ((e: MediaQueryListEvent) => void) | null = null;
  private storageKey = '3lens-theme';
  
  /**
   * Initialize the theme manager with a root element
   */
  initialize(root: HTMLElement): void {
    this.root = root;
    
    // Load saved preference
    this.loadSavedTheme();
    
    // Set up auto-detection
    this.setupAutoDetection();
    
    // Apply initial theme
    this.applyTheme();
  }
  
  /**
   * Get the current theme mode
   */
  getMode(): ThemeMode {
    return this.mode;
  }
  
  /**
   * Get the resolved theme (actual theme being displayed)
   */
  getResolvedTheme(): ResolvedTheme {
    return this.resolved;
  }
  
  /**
   * Set the theme mode
   */
  setTheme(mode: ThemeMode): void {
    this.mode = mode;
    this.saveTheme();
    this.applyTheme();
    this.notifyCallbacks();
  }
  
  /**
   * Toggle between dark and light themes
   */
  toggleTheme(): void {
    if (this.mode === 'auto') {
      // If auto, switch to the opposite of current
      this.mode = this.resolved === 'dark' ? 'light' : 'dark';
    } else if (this.mode === 'dark') {
      this.mode = 'light';
    } else if (this.mode === 'light') {
      this.mode = 'dark';
    }
    // high-contrast stays as is unless explicitly changed
    
    this.saveTheme();
    this.applyTheme();
    this.notifyCallbacks();
  }
  
  /**
   * Cycle through all themes
   */
  cycleTheme(): void {
    const themes: ThemeMode[] = ['dark', 'light', 'auto'];
    const currentIndex = themes.indexOf(this.mode);
    this.mode = themes[(currentIndex + 1) % themes.length];
    
    this.saveTheme();
    this.applyTheme();
    this.notifyCallbacks();
  }
  
  /**
   * Register a custom theme
   */
  registerCustomTheme(id: string, theme: CustomTheme): void {
    this.customThemes.set(id, theme);
  }
  
  /**
   * Apply a custom theme by ID
   */
  applyCustomTheme(id: string): boolean {
    const theme = this.customThemes.get(id);
    if (!theme || !this.root) return false;
    
    // Apply custom theme as CSS variables
    this.root.style.setProperty('--3lens-bg-primary', theme.bgPrimary);
    this.root.style.setProperty('--3lens-bg-secondary', theme.bgSecondary);
    this.root.style.setProperty('--3lens-bg-tertiary', theme.bgTertiary);
    this.root.style.setProperty('--3lens-bg-elevated', theme.bgElevated);
    this.root.style.setProperty('--3lens-bg-hover', theme.bgHover);
    this.root.style.setProperty('--3lens-bg-active', theme.bgActive);
    
    this.root.style.setProperty('--3lens-border', theme.border);
    this.root.style.setProperty('--3lens-border-subtle', theme.borderSubtle);
    this.root.style.setProperty('--3lens-border-focus', theme.borderFocus);
    
    this.root.style.setProperty('--3lens-text-primary', theme.textPrimary);
    this.root.style.setProperty('--3lens-text-secondary', theme.textSecondary);
    this.root.style.setProperty('--3lens-text-tertiary', theme.textTertiary);
    this.root.style.setProperty('--3lens-text-disabled', theme.textDisabled);
    this.root.style.setProperty('--3lens-text-inverse', theme.textInverse);
    
    this.root.style.setProperty('--3lens-accent', theme.accent);
    this.root.style.setProperty('--3lens-accent-hover', theme.accentHover);
    
    if (theme.accentBlue) this.root.style.setProperty('--3lens-accent-blue', theme.accentBlue);
    if (theme.accentCyan) this.root.style.setProperty('--3lens-accent-cyan', theme.accentCyan);
    if (theme.accentEmerald) this.root.style.setProperty('--3lens-accent-emerald', theme.accentEmerald);
    if (theme.accentAmber) this.root.style.setProperty('--3lens-accent-amber', theme.accentAmber);
    if (theme.accentRose) this.root.style.setProperty('--3lens-accent-rose', theme.accentRose);
    if (theme.accentViolet) this.root.style.setProperty('--3lens-accent-violet', theme.accentViolet);
    
    this.root.style.setProperty('--3lens-success', theme.success);
    this.root.style.setProperty('--3lens-warning', theme.warning);
    this.root.style.setProperty('--3lens-error', theme.error);
    
    if (theme.successBg) this.root.style.setProperty('--3lens-success-bg', theme.successBg);
    if (theme.warningBg) this.root.style.setProperty('--3lens-warning-bg', theme.warningBg);
    if (theme.errorBg) this.root.style.setProperty('--3lens-error-bg', theme.errorBg);
    if (theme.info) this.root.style.setProperty('--3lens-info', theme.info);
    if (theme.infoBg) this.root.style.setProperty('--3lens-info-bg', theme.infoBg);
    
    if (theme.shadowSm) this.root.style.setProperty('--3lens-shadow-sm', theme.shadowSm);
    if (theme.shadowMd) this.root.style.setProperty('--3lens-shadow-md', theme.shadowMd);
    if (theme.shadowLg) this.root.style.setProperty('--3lens-shadow-lg', theme.shadowLg);
    
    this.root.setAttribute('data-theme', 'custom');
    this.root.style.colorScheme = theme.colorScheme;
    
    return true;
  }
  
  /**
   * Get list of registered custom themes
   */
  getCustomThemes(): string[] {
    return Array.from(this.customThemes.keys());
  }
  
  /**
   * Subscribe to theme changes
   */
  onChange(callback: ThemeChangeCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index !== -1) this.callbacks.splice(index, 1);
    };
  }
  
  /**
   * Dispose and clean up
   */
  dispose(): void {
    if (this.mediaQuery && this.mediaQueryHandler) {
      this.mediaQuery.removeEventListener('change', this.mediaQueryHandler);
    }
    this.callbacks = [];
    this.root = null;
  }
  
  // ───────────────────────────────────────────────────────────────
  // PRIVATE METHODS
  // ───────────────────────────────────────────────────────────────
  
  private setupAutoDetection(): void {
    if (typeof window === 'undefined') return;
    
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    this.mediaQueryHandler = (e: MediaQueryListEvent) => {
      if (this.mode === 'auto') {
        this.resolved = e.matches ? 'dark' : 'light';
        this.applyTheme();
        this.notifyCallbacks();
      }
    };
    
    this.mediaQuery.addEventListener('change', this.mediaQueryHandler);
  }
  
  private loadSavedTheme(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved && ['dark', 'light', 'high-contrast', 'auto'].includes(saved)) {
        this.mode = saved as ThemeMode;
      }
    } catch {
      // localStorage not available
    }
  }
  
  private saveTheme(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, this.mode);
    } catch {
      // localStorage not available
    }
  }
  
  private applyTheme(): void {
    if (!this.root) return;
    
    // Resolve 'auto' to actual theme
    if (this.mode === 'auto') {
      const prefersDark = typeof window !== 'undefined' && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.resolved = prefersDark ? 'dark' : 'light';
    } else {
      this.resolved = this.mode;
    }
    
    // Clear any custom styles
    this.clearCustomStyles();
    
    // Apply theme attribute
    this.root.setAttribute('data-theme', this.resolved);
  }
  
  private clearCustomStyles(): void {
    if (!this.root) return;
    
    // List of custom properties that might have been set
    const props = [
      '--3lens-bg-primary', '--3lens-bg-secondary', '--3lens-bg-tertiary',
      '--3lens-bg-elevated', '--3lens-bg-hover', '--3lens-bg-active',
      '--3lens-border', '--3lens-border-subtle', '--3lens-border-focus',
      '--3lens-text-primary', '--3lens-text-secondary', '--3lens-text-tertiary',
      '--3lens-text-disabled', '--3lens-text-inverse',
      '--3lens-accent', '--3lens-accent-hover', '--3lens-accent-blue',
      '--3lens-accent-cyan', '--3lens-accent-emerald', '--3lens-accent-amber',
      '--3lens-accent-rose', '--3lens-accent-violet',
      '--3lens-success', '--3lens-success-bg', '--3lens-warning', '--3lens-warning-bg',
      '--3lens-error', '--3lens-error-bg', '--3lens-info', '--3lens-info-bg',
      '--3lens-shadow-sm', '--3lens-shadow-md', '--3lens-shadow-lg',
    ];
    
    for (const prop of props) {
      this.root.style.removeProperty(prop);
    }
  }
  
  private notifyCallbacks(): void {
    const event: ThemeChangeEvent = {
      mode: this.mode,
      resolved: this.resolved,
      isAuto: this.mode === 'auto',
    };
    
    for (const callback of this.callbacks) {
      try {
        callback(event);
      } catch (e) {
        console.warn('[3Lens Theme] Callback error:', e);
      }
    }
  }
}

/**
 * Pre-built custom themes
 */
export const PRESET_THEMES: Record<string, CustomTheme> = {
  'monokai': {
    name: 'Monokai',
    bgPrimary: '#272822',
    bgSecondary: '#1e1f1c',
    bgTertiary: '#3e3d32',
    bgElevated: '#49483e',
    bgHover: '#75715e',
    bgActive: '#a59f85',
    border: '#75715e',
    borderSubtle: '#49483e',
    borderFocus: '#f92672',
    textPrimary: '#f8f8f2',
    textSecondary: '#a6e22e',
    textTertiary: '#75715e',
    textDisabled: '#49483e',
    textInverse: '#272822',
    accent: '#66d9ef',
    accentHover: '#a6e22e',
    success: '#a6e22e',
    warning: '#e6db74',
    error: '#f92672',
    colorScheme: 'dark',
  },
  
  'dracula': {
    name: 'Dracula',
    bgPrimary: '#282a36',
    bgSecondary: '#21222c',
    bgTertiary: '#44475a',
    bgElevated: '#383a4a',
    bgHover: '#44475a',
    bgActive: '#6272a4',
    border: '#44475a',
    borderSubtle: '#383a4a',
    borderFocus: '#bd93f9',
    textPrimary: '#f8f8f2',
    textSecondary: '#f8f8f2',
    textTertiary: '#6272a4',
    textDisabled: '#44475a',
    textInverse: '#282a36',
    accent: '#bd93f9',
    accentHover: '#ff79c6',
    success: '#50fa7b',
    warning: '#f1fa8c',
    error: '#ff5555',
    colorScheme: 'dark',
  },
  
  'github-light': {
    name: 'GitHub Light',
    bgPrimary: '#ffffff',
    bgSecondary: '#f6f8fa',
    bgTertiary: '#eaeef2',
    bgElevated: '#ffffff',
    bgHover: '#f3f4f6',
    bgActive: '#e5e7eb',
    border: '#d0d7de',
    borderSubtle: '#eaeef2',
    borderFocus: '#0969da',
    textPrimary: '#1f2328',
    textSecondary: '#656d76',
    textTertiary: '#8c959f',
    textDisabled: '#afb8c1',
    textInverse: '#ffffff',
    accent: '#0969da',
    accentHover: '#0550ae',
    success: '#1a7f37',
    warning: '#9a6700',
    error: '#cf222e',
    colorScheme: 'light',
  },
  
  'nord': {
    name: 'Nord',
    bgPrimary: '#2e3440',
    bgSecondary: '#3b4252',
    bgTertiary: '#434c5e',
    bgElevated: '#4c566a',
    bgHover: '#434c5e',
    bgActive: '#4c566a',
    border: '#4c566a',
    borderSubtle: '#434c5e',
    borderFocus: '#88c0d0',
    textPrimary: '#eceff4',
    textSecondary: '#e5e9f0',
    textTertiary: '#d8dee9',
    textDisabled: '#4c566a',
    textInverse: '#2e3440',
    accent: '#88c0d0',
    accentHover: '#8fbcbb',
    success: '#a3be8c',
    warning: '#ebcb8b',
    error: '#bf616a',
    colorScheme: 'dark',
  },
};

