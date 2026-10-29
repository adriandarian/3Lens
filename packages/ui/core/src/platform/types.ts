import type { Lens } from '@3lens/runtime';

export type PlatformTool =
  | 'inspect'
  | 'performance'
  | 'memory'
  | 'changes'
  | 'shaders'
  | 'surfaces';

/** Shared view state. Every view navigates through the public Lens selection. */
export interface PlatformViewContext {
  lens: Lens;
  document: Document;
  selectedId?: string;
  frame?: number;
  readonly?: boolean;
  cspSafe?: boolean;
  select(id: string): void;
  notify(message: string): void;
  refresh(): void;
  setFrame?(frame: number): void;
  onInspect?(comparison: {
    entityId: string;
    before: unknown;
    after: unknown;
    changes: string[];
  }): void;
}
