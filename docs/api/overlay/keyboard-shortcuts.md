# Keyboard Shortcuts

The 3Lens overlay provides comprehensive keyboard navigation and shortcuts for efficient devtools usage.

## Quick Reference

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` | Toggle overlay menu |
| `Ctrl+`` ` | Toggle overlay visibility |
| `Ctrl+Shift+T` | Toggle light/dark theme |
| `Ctrl+K` | Open command palette |
| `Escape` | Close current panel |

### Panel Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+1` | Open Scene panel |
| `Ctrl+2` | Open Performance panel |
| `Ctrl+3` | Open Materials panel |
| `Ctrl+4` | Open Textures panel |
| `Ctrl+5` | Open Plugins panel |

### Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl+F` | Focus search |
| `↑` | Select previous sibling |
| `↓` | Select next sibling |
| `←` | Select parent object |
| `→` | Expand/enter children |

### View Controls

| Shortcut | Action |
|----------|--------|
| `W` | Toggle wireframe mode |
| `H` | Reset camera to home |
| `G` | Toggle transform gizmo |

### Editing

| Shortcut | Action |
|----------|--------|
| `Delete` / `Backspace` | Delete selected object |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |

## KeyboardManager API

The `KeyboardManager` class handles all keyboard shortcuts.

### Import

```typescript
import { KeyboardManager, getDefaultShortcuts } from '@3lens/overlay';
```

### Creating a Manager

```typescript
const keyboard = new KeyboardManager();
keyboard.initialize();
```

### Registering Shortcuts

```typescript
keyboard.register({
  id: 'my-shortcut',
  key: 'm',
  modifiers: { ctrl: true },
  description: 'My custom action',
  category: 'tools',
  handler: () => {
    console.log('Shortcut triggered!');
  },
});
```

### KeyboardShortcut Interface

```typescript
interface KeyboardShortcut {
  /** Unique identifier */
  id: string;
  
  /** Key to press (e.g., 'k', 'Escape', 'ArrowUp') */
  key: string;
  
  /** Modifier keys required */
  modifiers?: KeyModifiers;
  
  /** Human-readable description */
  description: string;
  
  /** Category for grouping in help */
  category: 'navigation' | 'panels' | 'scene' | 'view' | 'tools' | 'general';
  
  /** Function to execute */
  handler: () => void;
  
  /** Whether shortcut is active (default: true) */
  enabled?: boolean;
}

interface KeyModifiers {
  ctrl?: boolean;   // Ctrl key
  alt?: boolean;    // Alt key
  shift?: boolean;  // Shift key
  meta?: boolean;   // Cmd (Mac) / Windows key
}
```

### Enabling/Disabling Shortcuts

```typescript
// Disable all shortcuts (e.g., when in text input)
keyboard.setEnabled(false);

// Re-enable
keyboard.setEnabled(true);

// Disable specific shortcut
keyboard.setShortcutEnabled('delete-selected', false);
```

### Unregistering Shortcuts

```typescript
keyboard.unregister('my-shortcut');
```

### Getting Shortcut Groups

```typescript
const groups = keyboard.getShortcutGroups();

groups.forEach(group => {
  console.log(`${group.category}:`);
  group.shortcuts.forEach(shortcut => {
    console.log(`  ${keyboard.getShortcutDisplay(shortcut)} - ${shortcut.description}`);
  });
});
```

### Display Formatting

The manager formats shortcuts for display, adapting to the platform:

```typescript
// On Mac
keyboard.getShortcutDisplay(shortcut); // "⌘K"

// On Windows/Linux
keyboard.getShortcutDisplay(shortcut); // "Ctrl+K"
```

| Key | Mac Display | Windows Display |
|-----|-------------|-----------------|
| Ctrl | ⌃ | Ctrl |
| Alt | ⌥ | Alt |
| Shift | ⇧ | Shift |
| Meta | ⌘ | Win |
| Escape | ⎋ | Esc |
| Enter | ↵ | Enter |
| Backspace | ⌫ | Backspace |
| Tab | ⇥ | Tab |

## Default Shortcuts

Use `getDefaultShortcuts()` to get the standard 3Lens shortcuts:

```typescript
import { getDefaultShortcuts } from '@3lens/overlay';

const shortcuts = getDefaultShortcuts({
  toggleOverlay: () => overlay.toggle(),
  toggleTheme: () => themeManager.toggle(),
  openCommandPalette: () => commandPalette.open(),
  openScenePanel: () => overlay.showPanel('scene'),
  openPerformancePanel: () => overlay.showPanel('stats'),
  openMaterialsPanel: () => overlay.showPanel('materials'),
  openTexturesPanel: () => overlay.showPanel('textures'),
  openPluginsPanel: () => overlay.showPanel('plugins'),
  closePanel: () => overlay.hidePanel(currentPanel),
  focusSearch: () => document.querySelector('input')?.focus(),
  toggleWireframe: () => probe.toggleWireframe(),
  goHome: () => probe.resetCamera(),
  toggleGizmo: () => probe.toggleGizmo(),
  selectParent: () => selectParentNode(),
  selectNext: () => selectNextSibling(),
  selectPrev: () => selectPrevSibling(),
  deleteSelected: () => deleteSelectedObject(),
  undo: () => probe.undo(),
  redo: () => probe.redo(),
});

// Register all default shortcuts
shortcuts.forEach(s => keyboard.register(s));
```

## Focus Trap

For modal dialogs, use focus trapping:

```typescript
// Enable focus trap on modal
keyboard.setFocusTrap(modalElement);

// Disable when closing
keyboard.setFocusTrap(null);
```

Focus trap behavior:
- Tab cycles through focusable elements within the container
- Focus cannot leave the trapped element
- Previous focus is restored when trap is disabled

## Input Field Handling

Shortcuts are automatically disabled when typing in inputs:

```typescript
// In the keyboard handler:
const target = e.target as HTMLElement;
if (
  target.tagName === 'INPUT' || 
  target.tagName === 'TEXTAREA' || 
  target.isContentEditable
) {
  // Only Escape works in inputs
  if (e.key !== 'Escape') return;
}
```

## Custom Shortcut Example

### Adding a Screenshot Shortcut

```typescript
keyboard.register({
  id: 'take-screenshot',
  key: 's',
  modifiers: { ctrl: true, shift: true },
  description: 'Take screenshot',
  category: 'tools',
  handler: () => {
    const canvas = renderer.domElement;
    const dataUrl = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = 'screenshot.png';
    link.href = dataUrl;
    link.click();
    
    overlay.showToast('Screenshot saved', 'success');
  },
});
```

### Panel-Specific Shortcuts

```typescript
// Register when panel opens
overlay.registerPanel({
  id: 'editor',
  title: 'Editor',
  // ...
  onMount: (context) => {
    keyboard.register({
      id: 'editor-save',
      key: 's',
      modifiers: { ctrl: true },
      description: 'Save changes',
      category: 'tools',
      handler: () => saveChanges(),
    });
  },
  onDestroy: (context) => {
    keyboard.unregister('editor-save');
  },
});
```

## Cleanup

Dispose the keyboard manager when done:

```typescript
keyboard.dispose();
```

## See Also

- [Overlay Positioning](./overlay-positioning.md) - Panel positioning
- [Resize Behavior](./resize-behavior.md) - Panel resizing
- [ThreeLensOverlay](./overlay-class.md) - Full class API
- [Command Palette](./command-palette.md) - Command interface
