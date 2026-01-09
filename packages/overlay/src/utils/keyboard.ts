/**
 * 3Lens Keyboard Shortcuts System
 *
 * Provides keyboard navigation, shortcuts, and command palette integration.
 */

/**
 * Key modifier flags
 */
export interface KeyModifiers {
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean; // Command on Mac, Windows key on Windows
}

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  id: string;
  key: string;
  modifiers?: KeyModifiers;
  description: string;
  category: 'navigation' | 'panels' | 'scene' | 'view' | 'tools' | 'general';
  handler: () => void;
  enabled?: boolean;
}

/**
 * Shortcut group for display
 */
export interface ShortcutGroup {
  category: string;
  shortcuts: KeyboardShortcut[];
}

type KeyHandler = () => void;

/**
 * Keyboard Manager
 *
 * Handles keyboard shortcuts and navigation for the 3Lens overlay.
 */
export class KeyboardManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private enabled = true;
  private listener: ((e: KeyboardEvent) => void) | null = null;
  private focusTrapElement: HTMLElement | null = null;
  private lastFocusedElement: Element | null = null;

  // Platform detection for displaying correct modifier symbols
  private isMac =
    typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);

  /**
   * Initialize keyboard handling
   */
  initialize(): void {
    this.listener = this.handleKeyDown.bind(this);
    document.addEventListener('keydown', this.listener);
  }

  /**
   * Register a keyboard shortcut
   */
  register(shortcut: KeyboardShortcut): void {
    const key = this.buildKey(shortcut.key, shortcut.modifiers);
    this.shortcuts.set(key, { ...shortcut, enabled: shortcut.enabled ?? true });
  }

  /**
   * Unregister a shortcut by ID
   */
  unregister(id: string): void {
    for (const [key, shortcut] of this.shortcuts) {
      if (shortcut.id === id) {
        this.shortcuts.delete(key);
        break;
      }
    }
  }

  /**
   * Enable/disable all shortcuts
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Enable/disable a specific shortcut
   */
  setShortcutEnabled(id: string, enabled: boolean): void {
    for (const shortcut of this.shortcuts.values()) {
      if (shortcut.id === id) {
        shortcut.enabled = enabled;
        break;
      }
    }
  }

  /**
   * Get all registered shortcuts grouped by category
   */
  getShortcutGroups(): ShortcutGroup[] {
    const groups: Map<string, KeyboardShortcut[]> = new Map();

    for (const shortcut of this.shortcuts.values()) {
      if (!groups.has(shortcut.category)) {
        groups.set(shortcut.category, []);
      }
      groups.get(shortcut.category)!.push(shortcut);
    }

    const categoryOrder = [
      'general',
      'panels',
      'navigation',
      'scene',
      'view',
      'tools',
    ];

    return categoryOrder
      .filter((cat) => groups.has(cat))
      .map((cat) => ({
        category: cat,
        shortcuts: groups.get(cat)!,
      }));
  }

  /**
   * Get shortcut display string (e.g., "⌘K" or "Ctrl+K")
   */
  getShortcutDisplay(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];

    if (shortcut.modifiers?.ctrl) {
      parts.push(this.isMac ? '⌃' : 'Ctrl');
    }
    if (shortcut.modifiers?.alt) {
      parts.push(this.isMac ? '⌥' : 'Alt');
    }
    if (shortcut.modifiers?.shift) {
      parts.push(this.isMac ? '⇧' : 'Shift');
    }
    if (shortcut.modifiers?.meta) {
      parts.push(this.isMac ? '⌘' : 'Win');
    }

    // Format key
    let keyDisplay = shortcut.key.toUpperCase();
    if (keyDisplay === ' ') keyDisplay = 'Space';
    if (keyDisplay === 'ESCAPE') keyDisplay = this.isMac ? '⎋' : 'Esc';
    if (keyDisplay === 'ENTER') keyDisplay = this.isMac ? '↵' : 'Enter';
    if (keyDisplay === 'ARROWUP') keyDisplay = '↑';
    if (keyDisplay === 'ARROWDOWN') keyDisplay = '↓';
    if (keyDisplay === 'ARROWLEFT') keyDisplay = '←';
    if (keyDisplay === 'ARROWRIGHT') keyDisplay = '→';
    if (keyDisplay === 'BACKSPACE') keyDisplay = this.isMac ? '⌫' : 'Backspace';
    if (keyDisplay === 'DELETE') keyDisplay = this.isMac ? '⌦' : 'Del';
    if (keyDisplay === 'TAB') keyDisplay = this.isMac ? '⇥' : 'Tab';

    parts.push(keyDisplay);

    return this.isMac ? parts.join('') : parts.join('+');
  }

  /**
   * Set up focus trap for modal dialogs
   */
  setFocusTrap(element: HTMLElement | null): void {
    if (element) {
      this.lastFocusedElement = document.activeElement;
      this.focusTrapElement = element;

      // Focus first focusable element
      const firstFocusable = this.getFocusableElements(element)[0];
      if (firstFocusable) {
        (firstFocusable as HTMLElement).focus();
      }
    } else {
      this.focusTrapElement = null;

      // Restore focus
      if (this.lastFocusedElement && 'focus' in this.lastFocusedElement) {
        (this.lastFocusedElement as HTMLElement).focus();
      }
    }
  }

  /**
   * Dispose and clean up
   */
  dispose(): void {
    if (this.listener) {
      document.removeEventListener('keydown', this.listener);
      this.listener = null;
    }
    this.shortcuts.clear();
    this.focusTrapElement = null;
  }

  // ───────────────────────────────────────────────────────────────
  // PRIVATE METHODS
  // ───────────────────────────────────────────────────────────────

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.enabled) return;

    // Handle focus trap
    if (this.focusTrapElement && e.key === 'Tab') {
      this.handleFocusTrap(e);
      return;
    }

    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Only allow Escape to work in inputs
      if (e.key !== 'Escape') return;
    }

    const key = this.buildKey(e.key, {
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
      meta: e.metaKey,
    });

    const shortcut = this.shortcuts.get(key);

    if (shortcut && shortcut.enabled) {
      e.preventDefault();
      e.stopPropagation();
      shortcut.handler();
    }
  }

  private handleFocusTrap(e: KeyboardEvent): void {
    if (!this.focusTrapElement) return;

    const focusable = this.getFocusableElements(this.focusTrapElement);
    if (focusable.length === 0) return;

    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    if (e.shiftKey) {
      // Shift+Tab: go to last if on first
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: go to first if on last
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  private getFocusableElements(container: HTMLElement): Element[] {
    const selector = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    return Array.from(container.querySelectorAll(selector));
  }

  private buildKey(key: string, modifiers?: KeyModifiers): string {
    const parts: string[] = [];

    if (modifiers?.ctrl) parts.push('ctrl');
    if (modifiers?.alt) parts.push('alt');
    if (modifiers?.shift) parts.push('shift');
    if (modifiers?.meta) parts.push('meta');

    parts.push(key.toLowerCase());

    return parts.join('+');
  }
}

/**
 * Default shortcuts for 3Lens
 */
export function getDefaultShortcuts(handlers: {
  toggleOverlay?: KeyHandler;
  toggleTheme?: KeyHandler;
  openCommandPalette?: KeyHandler;
  openScenePanel?: KeyHandler;
  openPerformancePanel?: KeyHandler;
  openMaterialsPanel?: KeyHandler;
  openTexturesPanel?: KeyHandler;
  openPluginsPanel?: KeyHandler;
  closePanel?: KeyHandler;
  focusSearch?: KeyHandler;
  toggleWireframe?: KeyHandler;
  goHome?: KeyHandler;
  toggleGizmo?: KeyHandler;
  selectParent?: KeyHandler;
  selectNext?: KeyHandler;
  selectPrev?: KeyHandler;
  deleteSelected?: KeyHandler;
  undo?: KeyHandler;
  redo?: KeyHandler;
}): KeyboardShortcut[] {
  const shortcuts: KeyboardShortcut[] = [];

  if (handlers.toggleOverlay) {
    shortcuts.push({
      id: 'toggle-overlay',
      key: '`',
      modifiers: { ctrl: true },
      description: 'Toggle 3Lens overlay visibility',
      category: 'general',
      handler: handlers.toggleOverlay,
    });
  }

  if (handlers.toggleTheme) {
    shortcuts.push({
      id: 'toggle-theme',
      key: 't',
      modifiers: { ctrl: true, shift: true },
      description: 'Toggle light/dark theme',
      category: 'general',
      handler: handlers.toggleTheme,
    });
  }

  if (handlers.openCommandPalette) {
    shortcuts.push({
      id: 'command-palette',
      key: 'k',
      modifiers: { ctrl: true },
      description: 'Open command palette',
      category: 'general',
      handler: handlers.openCommandPalette,
    });
  }

  if (handlers.openScenePanel) {
    shortcuts.push({
      id: 'open-scene',
      key: '1',
      modifiers: { ctrl: true },
      description: 'Open Scene panel',
      category: 'panels',
      handler: handlers.openScenePanel,
    });
  }

  if (handlers.openPerformancePanel) {
    shortcuts.push({
      id: 'open-performance',
      key: '2',
      modifiers: { ctrl: true },
      description: 'Open Performance panel',
      category: 'panels',
      handler: handlers.openPerformancePanel,
    });
  }

  if (handlers.openMaterialsPanel) {
    shortcuts.push({
      id: 'open-materials',
      key: '3',
      modifiers: { ctrl: true },
      description: 'Open Materials panel',
      category: 'panels',
      handler: handlers.openMaterialsPanel,
    });
  }

  if (handlers.openTexturesPanel) {
    shortcuts.push({
      id: 'open-textures',
      key: '4',
      modifiers: { ctrl: true },
      description: 'Open Textures panel',
      category: 'panels',
      handler: handlers.openTexturesPanel,
    });
  }

  if (handlers.openPluginsPanel) {
    shortcuts.push({
      id: 'open-plugins',
      key: '5',
      modifiers: { ctrl: true },
      description: 'Open Plugins panel',
      category: 'panels',
      handler: handlers.openPluginsPanel,
    });
  }

  if (handlers.closePanel) {
    shortcuts.push({
      id: 'close-panel',
      key: 'Escape',
      description: 'Close current panel',
      category: 'panels',
      handler: handlers.closePanel,
    });
  }

  if (handlers.focusSearch) {
    shortcuts.push({
      id: 'focus-search',
      key: 'f',
      modifiers: { ctrl: true },
      description: 'Focus search',
      category: 'navigation',
      handler: handlers.focusSearch,
    });
  }

  if (handlers.toggleWireframe) {
    shortcuts.push({
      id: 'toggle-wireframe',
      key: 'w',
      description: 'Toggle wireframe mode',
      category: 'view',
      handler: handlers.toggleWireframe,
    });
  }

  if (handlers.goHome) {
    shortcuts.push({
      id: 'go-home',
      key: 'h',
      description: 'Reset camera to home position',
      category: 'view',
      handler: handlers.goHome,
    });
  }

  if (handlers.toggleGizmo) {
    shortcuts.push({
      id: 'toggle-gizmo',
      key: 'g',
      description: 'Toggle transform gizmo',
      category: 'tools',
      handler: handlers.toggleGizmo,
    });
  }

  if (handlers.selectParent) {
    shortcuts.push({
      id: 'select-parent',
      key: 'ArrowLeft',
      description: 'Select parent object',
      category: 'navigation',
      handler: handlers.selectParent,
    });
  }

  if (handlers.selectNext) {
    shortcuts.push({
      id: 'select-next',
      key: 'ArrowDown',
      description: 'Select next sibling',
      category: 'navigation',
      handler: handlers.selectNext,
    });
  }

  if (handlers.selectPrev) {
    shortcuts.push({
      id: 'select-prev',
      key: 'ArrowUp',
      description: 'Select previous sibling',
      category: 'navigation',
      handler: handlers.selectPrev,
    });
  }

  if (handlers.deleteSelected) {
    shortcuts.push({
      id: 'delete-selected',
      key: 'Delete',
      description: 'Delete selected object',
      category: 'scene',
      handler: handlers.deleteSelected,
    });

    shortcuts.push({
      id: 'delete-selected-backspace',
      key: 'Backspace',
      description: 'Delete selected object',
      category: 'scene',
      handler: handlers.deleteSelected,
    });
  }

  if (handlers.undo) {
    shortcuts.push({
      id: 'undo',
      key: 'z',
      modifiers: { ctrl: true },
      description: 'Undo',
      category: 'general',
      handler: handlers.undo,
    });
  }

  if (handlers.redo) {
    shortcuts.push({
      id: 'redo',
      key: 'z',
      modifiers: { ctrl: true, shift: true },
      description: 'Redo',
      category: 'general',
      handler: handlers.redo,
    });

    shortcuts.push({
      id: 'redo-alt',
      key: 'y',
      modifiers: { ctrl: true },
      description: 'Redo',
      category: 'general',
      handler: handlers.redo,
    });
  }

  return shortcuts;
}
