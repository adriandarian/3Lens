/**
 * Host Interface
 *
 * Hosts attach to runtime environments and emit events.
 *
 * @packageDocumentation
 */

import type { CaptureContext } from '@3lens/kernel';

/**
 * Host configuration
 */
export interface HostConfig {
  /** Host ID */
  id?: string;
  /** Host name */
  name?: string;
}

/**
 * Host interface
 */
export interface Host {
  /** Host identifier */
  readonly id: string;
  /** Host name */
  readonly name: string;

  /** Attach to capture context */
  attach(context: CaptureContext): void | Promise<void>;

  /** Detach from capture context */
  detach(): void;

  /** Get the renderer */
  getRenderer(): unknown | null;

  /** Get the scene */
  getScene(): unknown | null;

  /** Get the camera */
  getCamera(): unknown | null;

  /** Whether host is attached */
  isAttached(): boolean;
}

/**
 * Base host implementation helper
 */
export abstract class BaseHost implements Host {
  readonly id: string;
  readonly name: string;

  protected context: CaptureContext | null = null;
  protected renderer: unknown | null = null;
  protected scene: unknown | null = null;
  protected camera: unknown | null = null;

  constructor(config: HostConfig = {}) {
    this.id = config.id ?? 'host';
    this.name = config.name ?? 'Host';
  }

  abstract attach(context: CaptureContext): void | Promise<void>;

  detach(): void {
    this.context = null;
  }

  getRenderer() {
    return this.renderer;
  }

  getScene() {
    return this.scene;
  }

  getCamera() {
    return this.camera;
  }

  isAttached(): boolean {
    return this.context !== null;
  }
}
