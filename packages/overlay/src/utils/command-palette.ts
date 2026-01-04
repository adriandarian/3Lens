/**
 * 3Lens Command Palette
 * 
 * A searchable command palette (like VS Code's Ctrl+K or Spotlight)
 * for quick access to all 3Lens features.
 */

import { type KeyboardManager } from './keyboard';

/**
 * Command definition
 */
export interface Command {
  id: string;
  title: string;
  description?: string;
  category: string;
  icon?: string;
  shortcut?: string;
  keywords?: string[];
  handler: () => void;
  enabled?: () => boolean;
}

/**
 * Command group for display
 */
export interface CommandGroup {
  category: string;
  commands: Command[];
}

/**
 * Command Palette Manager
 */
export class CommandPalette {
  private commands: Map<string, Command> = new Map();
  private isOpen = false;
  private container: HTMLElement | null = null;
  private keyboardManager: KeyboardManager | null = null;
  private onCloseCallback: (() => void) | null = null;
  private searchQuery = '';
  private selectedIndex = 0;
  private filteredCommands: Command[] = [];
  
  /**
   * Register the keyboard manager for focus trapping
   */
  setKeyboardManager(manager: KeyboardManager): void {
    this.keyboardManager = manager;
  }
  
  /**
   * Register a command
   */
  register(command: Command): void {
    this.commands.set(command.id, {
      ...command,
      enabled: command.enabled ?? (() => true),
    });
  }
  
  /**
   * Register multiple commands
   */
  registerAll(commands: Command[]): void {
    for (const cmd of commands) {
      this.register(cmd);
    }
  }
  
  /**
   * Unregister a command
   */
  unregister(id: string): void {
    this.commands.delete(id);
  }
  
  /**
   * Get all commands
   */
  getCommands(): Command[] {
    return Array.from(this.commands.values());
  }
  
  /**
   * Get commands grouped by category
   */
  getCommandGroups(): CommandGroup[] {
    const groups: Map<string, Command[]> = new Map();
    
    for (const cmd of this.commands.values()) {
      if (!groups.has(cmd.category)) {
        groups.set(cmd.category, []);
      }
      groups.get(cmd.category)!.push(cmd);
    }
    
    return Array.from(groups.entries()).map(([category, commands]) => ({
      category,
      commands,
    }));
  }
  
  /**
   * Search commands
   */
  search(query: string): Command[] {
    if (!query.trim()) {
      return Array.from(this.commands.values()).filter(cmd => 
        cmd.enabled?.() !== false
      );
    }
    
    const lowerQuery = query.toLowerCase();
    const terms = lowerQuery.split(/\s+/);
    
    const scored = Array.from(this.commands.values())
      .filter(cmd => cmd.enabled?.() !== false)
      .map(cmd => {
        let score = 0;
        const title = cmd.title.toLowerCase();
        const category = cmd.category.toLowerCase();
        const description = cmd.description?.toLowerCase() ?? '';
        const keywords = cmd.keywords?.join(' ').toLowerCase() ?? '';
        
        for (const term of terms) {
          // Exact title match
          if (title === term) score += 100;
          // Title starts with
          else if (title.startsWith(term)) score += 50;
          // Title contains
          else if (title.includes(term)) score += 25;
          // Category match
          else if (category.includes(term)) score += 15;
          // Description match
          else if (description.includes(term)) score += 10;
          // Keyword match
          else if (keywords.includes(term)) score += 10;
          // Fuzzy match on title
          else if (this.fuzzyMatch(title, term)) score += 5;
        }
        
        return { cmd, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    
    return scored.map(item => item.cmd);
  }
  
  /**
   * Open the command palette
   */
  open(parentElement: HTMLElement): void {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.searchQuery = '';
    this.selectedIndex = 0;
    this.filteredCommands = this.search('');
    
    this.render(parentElement);
    
    // Set up focus trap
    if (this.keyboardManager && this.container) {
      this.keyboardManager.setFocusTrap(this.container);
    }
  }
  
  /**
   * Close the command palette
   */
  close(): void {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    
    // Remove focus trap
    if (this.keyboardManager) {
      this.keyboardManager.setFocusTrap(null);
    }
    
    // Remove from DOM
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    
    this.onCloseCallback?.();
  }
  
  /**
   * Toggle the command palette
   */
  toggle(parentElement: HTMLElement): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open(parentElement);
    }
  }
  
  /**
   * Check if palette is open
   */
  isVisible(): boolean {
    return this.isOpen;
  }
  
  /**
   * Set callback for when palette closes
   */
  onClose(callback: () => void): void {
    this.onCloseCallback = callback;
  }
  
  /**
   * Execute a command by ID
   */
  execute(id: string): boolean {
    const cmd = this.commands.get(id);
    if (cmd && cmd.enabled?.() !== false) {
      this.close();
      cmd.handler();
      return true;
    }
    return false;
  }
  
  // ───────────────────────────────────────────────────────────────
  // RENDERING
  // ───────────────────────────────────────────────────────────────
  
  private render(parent: HTMLElement): void {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'three-lens-command-palette';
    this.container.innerHTML = this.getHTML();
    parent.appendChild(this.container);
    
    // Attach events
    this.attachEvents();
    
    // Focus input
    const input = this.container.querySelector('.command-palette-input') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  }
  
  private getHTML(): string {
    return `
      <div class="command-palette-backdrop"></div>
      <div class="command-palette-dialog" role="dialog" aria-modal="true" aria-label="Command Palette">
        <div class="command-palette-header">
          <input 
            type="text" 
            class="command-palette-input" 
            placeholder="Type a command..." 
            value="${this.escapeHtml(this.searchQuery)}"
            autocomplete="off"
            spellcheck="false"
          />
          <button class="command-palette-close" aria-label="Close">×</button>
        </div>
        <div class="command-palette-results">
          ${this.renderResults()}
        </div>
        <div class="command-palette-footer">
          <span class="command-palette-hint">
            <kbd>↑↓</kbd> navigate
            <kbd>↵</kbd> select
            <kbd>esc</kbd> close
          </span>
        </div>
      </div>
    `;
  }
  
  private renderResults(): string {
    if (this.filteredCommands.length === 0) {
      return '<div class="command-palette-empty">No matching commands</div>';
    }
    
    // Group by category
    const groups: Map<string, Command[]> = new Map();
    for (const cmd of this.filteredCommands) {
      if (!groups.has(cmd.category)) {
        groups.set(cmd.category, []);
      }
      groups.get(cmd.category)!.push(cmd);
    }
    
    let html = '';
    let globalIndex = 0;
    
    for (const [category, commands] of groups) {
      html += `<div class="command-palette-group">`;
      html += `<div class="command-palette-group-title">${this.escapeHtml(category)}</div>`;
      
      for (const cmd of commands) {
        const isSelected = globalIndex === this.selectedIndex;
        html += `
          <div 
            class="command-palette-item ${isSelected ? 'selected' : ''}" 
            data-id="${cmd.id}"
            data-index="${globalIndex}"
            role="option"
            aria-selected="${isSelected}"
          >
            ${cmd.icon ? `<span class="command-palette-icon">${cmd.icon}</span>` : ''}
            <span class="command-palette-title">${this.highlightMatch(cmd.title, this.searchQuery)}</span>
            ${cmd.description ? `<span class="command-palette-desc">${this.escapeHtml(cmd.description)}</span>` : ''}
            ${cmd.shortcut ? `<kbd class="command-palette-shortcut">${cmd.shortcut}</kbd>` : ''}
          </div>
        `;
        globalIndex++;
      }
      
      html += '</div>';
    }
    
    return html;
  }
  
  private attachEvents(): void {
    if (!this.container) return;
    
    // Backdrop click
    const backdrop = this.container.querySelector('.command-palette-backdrop');
    backdrop?.addEventListener('click', () => this.close());
    
    // Close button
    const closeBtn = this.container.querySelector('.command-palette-close');
    closeBtn?.addEventListener('click', () => this.close());
    
    // Input events
    const input = this.container.querySelector('.command-palette-input') as HTMLInputElement;
    if (input) {
      input.addEventListener('input', () => {
        this.searchQuery = input.value;
        this.filteredCommands = this.search(this.searchQuery);
        this.selectedIndex = 0;
        this.updateResults();
      });
      
      input.addEventListener('keydown', (e) => this.handleInputKeydown(e));
    }
    
    // Item click
    const items = this.container.querySelectorAll('.command-palette-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const id = (item as HTMLElement).dataset.id;
        if (id) this.execute(id);
      });
      
      item.addEventListener('mouseenter', () => {
        const index = parseInt((item as HTMLElement).dataset.index ?? '0', 10);
        this.selectedIndex = index;
        this.updateSelection();
      });
    });
  }
  
  private handleInputKeydown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredCommands.length - 1);
        this.updateSelection();
        this.scrollToSelected();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.updateSelection();
        this.scrollToSelected();
        break;
        
      case 'Enter':
        e.preventDefault();
        const cmd = this.filteredCommands[this.selectedIndex];
        if (cmd) this.execute(cmd.id);
        break;
        
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
    }
  }
  
  private updateResults(): void {
    if (!this.container) return;
    
    const results = this.container.querySelector('.command-palette-results');
    if (results) {
      results.innerHTML = this.renderResults();
      
      // Re-attach item events
      const items = this.container.querySelectorAll('.command-palette-item');
      items.forEach(item => {
        item.addEventListener('click', () => {
          const id = (item as HTMLElement).dataset.id;
          if (id) this.execute(id);
        });
        
        item.addEventListener('mouseenter', () => {
          const index = parseInt((item as HTMLElement).dataset.index ?? '0', 10);
          this.selectedIndex = index;
          this.updateSelection();
        });
      });
    }
  }
  
  private updateSelection(): void {
    if (!this.container) return;
    
    const items = this.container.querySelectorAll('.command-palette-item');
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
        item.setAttribute('aria-selected', 'true');
      } else {
        item.classList.remove('selected');
        item.setAttribute('aria-selected', 'false');
      }
    });
  }
  
  private scrollToSelected(): void {
    if (!this.container) return;
    
    const selected = this.container.querySelector('.command-palette-item.selected');
    if (selected) {
      selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }
  
  private highlightMatch(text: string, query: string): string {
    if (!query) return this.escapeHtml(text);
    
    const escaped = this.escapeHtml(text);
    const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
    return escaped.replace(regex, '<mark>$1</mark>');
  }
  
  private fuzzyMatch(text: string, pattern: string): boolean {
    let patternIdx = 0;
    for (let i = 0; i < text.length && patternIdx < pattern.length; i++) {
      if (text[i] === pattern[patternIdx]) {
        patternIdx++;
      }
    }
    return patternIdx === pattern.length;
  }
  
  private escapeHtml(str: string): string {
    return str.replace(/[&<>"']/g, c => 
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c
    );
  }
  
  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

/**
 * Get default commands for 3Lens
 */
export function getDefaultCommands(handlers: {
  openScenePanel?: () => void;
  openPerformancePanel?: () => void;
  openMaterialsPanel?: () => void;
  openTexturesPanel?: () => void;
  openPluginsPanel?: () => void;
  openWebGPUPanel?: () => void;
  toggleTheme?: () => void;
  toggleWireframe?: () => void;
  goHome?: () => void;
  focusSelected?: () => void;
  toggleGizmo?: () => void;
  setGizmoTranslate?: () => void;
  setGizmoRotate?: () => void;
  setGizmoScale?: () => void;
  undo?: () => void;
  redo?: () => void;
  showShortcuts?: () => void;
}): Command[] {
  const commands: Command[] = [];
  
  // Panels
  if (handlers.openScenePanel) {
    commands.push({
      id: 'open-scene-panel',
      title: 'Scene Panel',
      description: 'View and edit scene hierarchy',
      category: 'Panels',
      icon: 'S',
      shortcut: '⌃1',
      keywords: ['tree', 'hierarchy', 'objects'],
      handler: handlers.openScenePanel,
    });
  }
  
  if (handlers.openPerformancePanel) {
    commands.push({
      id: 'open-performance-panel',
      title: 'Performance Panel',
      description: 'Monitor FPS and draw calls',
      category: 'Panels',
      icon: '⚡',
      shortcut: '⌃2',
      keywords: ['stats', 'fps', 'memory', 'profiler'],
      handler: handlers.openPerformancePanel,
    });
  }
  
  if (handlers.openMaterialsPanel) {
    commands.push({
      id: 'open-materials-panel',
      title: 'Materials Panel',
      description: 'Browse scene materials',
      category: 'Panels',
      icon: '🎨',
      shortcut: '⌃3',
      keywords: ['shaders', 'textures'],
      handler: handlers.openMaterialsPanel,
    });
  }
  
  if (handlers.openTexturesPanel) {
    commands.push({
      id: 'open-textures-panel',
      title: 'Textures Panel',
      description: 'View texture resources',
      category: 'Panels',
      icon: '🖼️',
      shortcut: '⌃4',
      keywords: ['images', 'maps'],
      handler: handlers.openTexturesPanel,
    });
  }
  
  if (handlers.openPluginsPanel) {
    commands.push({
      id: 'open-plugins-panel',
      title: 'Plugins Panel',
      description: 'Manage plugins',
      category: 'Panels',
      icon: '🔌',
      shortcut: '⌃5',
      keywords: ['extensions', 'addons'],
      handler: handlers.openPluginsPanel,
    });
  }
  
  if (handlers.openWebGPUPanel) {
    commands.push({
      id: 'open-webgpu-panel',
      title: 'WebGPU Panel',
      description: 'WebGPU pipelines and timing',
      category: 'Panels',
      icon: '🔷',
      keywords: ['gpu', 'pipelines', 'shaders'],
      handler: handlers.openWebGPUPanel,
    });
  }
  
  // View
  if (handlers.toggleTheme) {
    commands.push({
      id: 'toggle-theme',
      title: 'Toggle Theme',
      description: 'Switch between light and dark theme',
      category: 'View',
      icon: '🌙',
      shortcut: '⌃⇧T',
      keywords: ['dark', 'light', 'appearance'],
      handler: handlers.toggleTheme,
    });
  }
  
  if (handlers.toggleWireframe) {
    commands.push({
      id: 'toggle-wireframe',
      title: 'Toggle Wireframe',
      description: 'Show wireframe overlay',
      category: 'View',
      icon: '📐',
      shortcut: 'W',
      keywords: ['mesh', 'geometry'],
      handler: handlers.toggleWireframe,
    });
  }
  
  if (handlers.goHome) {
    commands.push({
      id: 'go-home',
      title: 'Reset Camera',
      description: 'Return camera to home position',
      category: 'View',
      icon: '🏠',
      shortcut: 'H',
      keywords: ['camera', 'reset', 'home'],
      handler: handlers.goHome,
    });
  }
  
  if (handlers.focusSelected) {
    commands.push({
      id: 'focus-selected',
      title: 'Focus on Selected',
      description: 'Focus camera on selected object',
      category: 'View',
      icon: '🎯',
      shortcut: 'F',
      keywords: ['camera', 'zoom', 'center'],
      handler: handlers.focusSelected,
    });
  }
  
  // Tools
  if (handlers.toggleGizmo) {
    commands.push({
      id: 'toggle-gizmo',
      title: 'Toggle Transform Gizmo',
      description: 'Show/hide transform gizmo',
      category: 'Tools',
      icon: '🔧',
      shortcut: 'G',
      keywords: ['transform', 'move', 'rotate', 'scale'],
      handler: handlers.toggleGizmo,
    });
  }
  
  if (handlers.setGizmoTranslate) {
    commands.push({
      id: 'gizmo-translate',
      title: 'Translate Mode',
      description: 'Set gizmo to translate mode',
      category: 'Tools',
      icon: '↔️',
      keywords: ['move', 'position'],
      handler: handlers.setGizmoTranslate,
    });
  }
  
  if (handlers.setGizmoRotate) {
    commands.push({
      id: 'gizmo-rotate',
      title: 'Rotate Mode',
      description: 'Set gizmo to rotate mode',
      category: 'Tools',
      icon: '🔄',
      keywords: ['rotation', 'spin'],
      handler: handlers.setGizmoRotate,
    });
  }
  
  if (handlers.setGizmoScale) {
    commands.push({
      id: 'gizmo-scale',
      title: 'Scale Mode',
      description: 'Set gizmo to scale mode',
      category: 'Tools',
      icon: '📏',
      keywords: ['size', 'resize'],
      handler: handlers.setGizmoScale,
    });
  }
  
  // Edit
  if (handlers.undo) {
    commands.push({
      id: 'undo',
      title: 'Undo',
      description: 'Undo last action',
      category: 'Edit',
      icon: '↩️',
      shortcut: '⌃Z',
      keywords: ['revert', 'back'],
      handler: handlers.undo,
    });
  }
  
  if (handlers.redo) {
    commands.push({
      id: 'redo',
      title: 'Redo',
      description: 'Redo last undone action',
      category: 'Edit',
      icon: '↪️',
      shortcut: '⌃⇧Z',
      keywords: ['forward'],
      handler: handlers.redo,
    });
  }
  
  // Help
  if (handlers.showShortcuts) {
    commands.push({
      id: 'show-shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'View all keyboard shortcuts',
      category: 'Help',
      icon: '⌨️',
      shortcut: '?',
      keywords: ['keys', 'hotkeys', 'bindings'],
      handler: handlers.showShortcuts,
    });
  }
  
  return commands;
}

