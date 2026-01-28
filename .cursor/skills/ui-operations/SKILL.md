---
name: ui-operations
description: UI Core and Web Components operations for building 3Lens UI panels and components. Use when creating UI panels, integrating UI Core components, or debugging UI issues.
---

# UI Operations

UI operations cover building UI components, panels, and integrating with UI Core for framework-agnostic UI development.

## When to Use

- Creating new UI panels
- Building UI Core components
- Integrating Web Components
- Debugging UI issues
- Understanding UI architecture

## UI Architecture

### UI Core (Framework-Agnostic)

```
packages/ui/core/
├── dock.ts          # Dock interface
├── overlay.ts       # Overlay interface
├── panel.ts         # Panel interface
└── types.ts         # Type definitions
```

### UI Web (Web Components)

```
packages/ui/web/
├── elements/
│   ├── ThreeLensDock.ts      # Dock Web Component
│   ├── ThreeLensOverlay.ts   # Overlay Web Component
│   └── ThreeLensPanel.ts     # Panel Web Component
└── styles.ts                 # Shared styles
```

## Commands

### Scaffold a Panel

```bash
# Create a new UI panel
3lens scaffold panel my-panel

# Create panel in specific addon
3lens scaffold panel my-panel --addon my-addon
```

Generates:
- Panel source file
- Query hooks
- Contract compliance checklist
- Test file template

## Panel Development

### Panel Structure

```typescript
// packages/ui-core/src/panels/my-panel.ts
import { Panel, PanelConfig } from '../types';
import { LensClient } from '@3lens/runtime';

export interface MyPanelConfig extends PanelConfig {
  // Panel-specific config
}

export function createMyPanel(client: LensClient, config: MyPanelConfig): Panel {
  return {
    id: 'my-panel',
    name: 'My Panel',
    
    render(container: HTMLElement) {
      // Render panel UI
    },
    
    onSelectionChange(selection: Selection) {
      // React to selection changes
    },
    
    dispose() {
      // Cleanup
    }
  };
}
```

### Panel Requirements

Every panel MUST:

1. **Answer a Clear Question**
   - What question does this panel answer?
   - What entities does it display?

2. **Show Fidelity Badges**
   ```typescript
   function renderMetric(value: number, fidelity: Fidelity) {
     return `
       <span class="metric">
         ${value}
         <span class="fidelity-badge fidelity-${fidelity}">
           ${fidelity}
         </span>
       </span>
     `;
   }
   ```

3. **Route Through Inspector**
   ```typescript
   // When user clicks something
   client.select(entityId, { source: 'my-panel' });
   
   // When selection changes
   onSelectionChange(selection) {
     this.highlightEntities(selection.entity_ids);
   }
   ```

4. **Support Offline Traces**
   ```typescript
   const data = client.isLive 
     ? await client.queryLive(query, params)
     : await client.queryTrace(query, params);
   ```

5. **Include Attribution Paths**
   ```typescript
   function renderHotspot(hotspot) {
     return `
       <div onclick="selectEntity('${hotspot.entityId}')">
         ${hotspot.gpuTime}ms
         <span class="attribution">
           ${hotspot.attribution.map(a => a.entityId).join(', ')}
         </span>
       </div>
     `;
   }
   ```

## Web Components

### Using UI Web Components

```html
<!-- Dock mode -->
<three-lens-dock>
  <three-lens-panel id="inspector"></three-lens-panel>
  <three-lens-panel id="perf"></three-lens-panel>
</three-lens-dock>

<!-- Overlay mode -->
<three-lens-overlay>
  <three-lens-panel id="inspector"></three-lens-panel>
</three-lens-overlay>
```

### Custom Panel Component

```typescript
// Custom panel Web Component
import { ThreeLensPanel } from '@3lens/ui-web';

class MyCustomPanel extends ThreeLensPanel {
  connectedCallback() {
    super.connectedCallback();
    // Custom initialization
  }
  
  render(client: LensClient) {
    // Custom rendering
  }
}

customElements.define('my-custom-panel', MyCustomPanel);
```

## UI Modes

### Dock Mode

```typescript
// Dock interface
interface Dock {
  addPanel(panel: Panel): void;
  removePanel(panelId: string): void;
  show(): void;
  hide(): void;
}
```

### Overlay Mode

```typescript
// Overlay interface
interface Overlay {
  showPanel(panelId: string): void;
  hidePanel(panelId: string): void;
  toggle(): void;
}
```

## Agent Use Cases

1. **New panel**: "Create a performance timeline panel"
2. **UI integration**: "How do I integrate 3Lens UI into my app?"
3. **Custom component**: "Create a custom panel component"
4. **Debugging**: "My panel isn't rendering, help debug"

## Post-Scaffold Steps

After scaffolding, follow the playbook:
- [agents/playbooks/add-a-panel.md](../../../agents/playbooks/add-a-panel.md)

## Additional Resources

- Contract: [agents/contracts/ui-surfaces.md](../../../agents/contracts/ui-surfaces.md)
- Contract: [agents/contracts/inspector.md](../../../agents/contracts/inspector.md)
- Rule: [.cursor/rules/ui-standards.mdc](../../../rules/ui-standards.mdc)
- Command: [.cursor/commands/scaffold-panel.md](../../../commands/scaffold-panel.md)
- Skill: [scaffold-operations](../scaffold-operations/SKILL.md)