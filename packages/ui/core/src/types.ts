/**
 * UI Core Types
 *
 * @packageDocumentation
 */

import type { LensClient, Selection } from '@3lens/runtime';

/**
 * Panel interface
 */
export interface Panel {
  /** Panel identifier */
  id: string;
  /** Panel display name */
  name: string;
  /** Render the panel */
  render(container: HTMLElement, client: LensClient): void;
  /** Called when selection changes */
  onSelectionChange?(selection: Selection): void;
  /** Dispose the panel */
  dispose?(): void;
}

/**
 * Panel configuration
 */
export interface PanelConfig {
  /** Panel ID */
  id: string;
  /** Panel name */
  name: string;
  /** Default width */
  defaultWidth?: number;
  /** Default height */
  defaultHeight?: number;
  /** Icon */
  icon?: string;
}

/**
 * UI adapter interface
 */
export interface UIAdapter {
  /** Mount the UI */
  mount(container: HTMLElement): void;
  /** Unmount the UI */
  unmount(): void;
  /** Show the UI */
  show(): void;
  /** Hide the UI */
  hide(): void;
  /** Toggle visibility */
  toggle(): void;
  /** Whether visible */
  isVisible(): boolean;
  /** Register a panel */
  registerPanel(panel: Panel): void;
  /** Unregister a panel */
  unregisterPanel(panelId: string): void;
}
