/**
 * Custom Element Registration
 *
 * Auto-registers all 3Lens Web Components when imported.
 *
 * @example
 * ```typescript
 * // Auto-register all components
 * import '@3lens/ui-web/register';
 *
 * // Or import individual components and register manually
 * import { ThreeLensOverlay } from '@3lens/ui-web';
 * customElements.define('three-lens-overlay', ThreeLensOverlay);
 * ```
 *
 * @packageDocumentation
 */

import { ThreeLensPanel } from './elements/ThreeLensPanel';
import { ThreeLensOverlay } from './elements/ThreeLensOverlay';
import { ThreeLensDock } from './elements/ThreeLensDock';

/**
 * Component definitions with their tag names
 */
const COMPONENTS = [
  { tagName: 'three-lens-panel', component: ThreeLensPanel },
  { tagName: 'three-lens-overlay', component: ThreeLensOverlay },
  { tagName: 'three-lens-dock', component: ThreeLensDock },
] as const;

/**
 * Register all 3Lens Web Components
 *
 * This function is safe to call multiple times - it will skip
 * components that are already registered.
 */
export function registerComponents(): void {
  for (const { tagName, component } of COMPONENTS) {
    if (!customElements.get(tagName)) {
      customElements.define(tagName, component);
    }
  }
}

/**
 * Check if all components are registered
 */
export function areComponentsRegistered(): boolean {
  return COMPONENTS.every(({ tagName }) => customElements.get(tagName) !== undefined);
}

/**
 * Wait for all components to be defined
 */
export async function whenComponentsDefined(): Promise<void> {
  await Promise.all(COMPONENTS.map(({ tagName }) => customElements.whenDefined(tagName)));
}

/**
 * Get a list of all component tag names
 */
export function getComponentTagNames(): string[] {
  return COMPONENTS.map(({ tagName }) => tagName);
}

// Auto-register when this module is imported
registerComponents();

// TypeScript declarations for HTML elements
declare global {
  interface HTMLElementTagNameMap {
    'three-lens-panel': ThreeLensPanel;
    'three-lens-overlay': ThreeLensOverlay;
    'three-lens-dock': ThreeLensDock;
  }
}
