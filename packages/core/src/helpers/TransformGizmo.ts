import type * as THREE from 'three';
import type { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import type { DevtoolProbe } from '../probe/DevtoolProbe';
import type { ThreeNamespace } from '../types';

export type TransformMode = 'translate' | 'rotate' | 'scale';
export type TransformSpace = 'world' | 'local';

export interface TransformSnapshot {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface TransformHistoryEntry {
  objectUuid: string;
  objectName: string;
  before: TransformSnapshot;
  after: TransformSnapshot;
  timestamp: number;
}

/**
 * Manages transform gizmos for manipulating 3D objects
 * Wraps Three.js TransformControls with additional features
 */
export class TransformGizmo {
  private transformControls: TransformControls | null = null;
  private THREE: ThreeNamespace | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.Camera | null = null;
  private domElement: HTMLElement | null = null;
  private currentObject: THREE.Object3D | null = null;
  private enabled = false;
  private mode: TransformMode = 'translate';
  private space: TransformSpace = 'world';
  private snapEnabled = false;
  private translationSnap = 1;
  private rotationSnap = Math.PI / 12; // 15 degrees
  private scaleSnap = 0.1;

  // Undo/redo history
  private history: TransformHistoryEntry[] = [];
  private historyIndex = -1;
  private maxHistorySize = 50;
  private transformStart: TransformSnapshot | null = null;

  // Callbacks
  private onDraggingChangedCallbacks: Array<(isDragging: boolean) => void> = [];
  private onTransformChangedCallbacks: Array<
    (entry: TransformHistoryEntry) => void
  > = [];

  constructor(private probe: DevtoolProbe) {}

  /**
   * Initialize the transform gizmo with scene, camera, and renderer
   */
  initialize(
    scene: THREE.Scene,
    camera: THREE.Camera,
    domElement: HTMLElement,
    three: ThreeNamespace
  ): void {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.THREE = three;
  }

  /**
   * Check if the gizmo is initialized
   */
  isInitialized(): boolean {
    return (
      this.scene !== null &&
      this.camera !== null &&
      this.domElement !== null &&
      this.THREE !== null
    );
  }

  /**
   * Enable the transform gizmo
   */
  async enable(): Promise<void> {
    if (!this.isInitialized()) {
      console.warn('TransformGizmo: Not initialized. Call initialize() first.');
      return;
    }

    if (this.transformControls) {
      this.enabled = true;
      this.updateAttachment();
      return;
    }

    // Dynamically import TransformControls
    try {
      const { TransformControls } =
        await import('three/examples/jsm/controls/TransformControls.js');

      this.transformControls = new TransformControls(
        this.camera!,
        this.domElement!
      );

      this.transformControls.name = '__3lens_transform_controls__';

      // Set initial mode and space
      this.transformControls.setMode(this.mode);
      this.transformControls.setSpace(this.space);

      // Set up snapping
      this.updateSnapping();

      // Add event listeners
      this.transformControls.addEventListener(
        'dragging-changed',
        this.handleDraggingChanged
      );
      this.transformControls.addEventListener(
        'objectChange',
        this.handleObjectChange
      );
      this.transformControls.addEventListener(
        'mouseDown',
        this.handleMouseDown
      );
      this.transformControls.addEventListener('mouseUp', this.handleMouseUp);

      // Add to scene
      this.scene!.add(this.transformControls);

      this.enabled = true;
      this.updateAttachment();
    } catch (error) {
      console.error('TransformGizmo: Failed to load TransformControls', error);
    }
  }

  /**
   * Disable the transform gizmo
   */
  disable(): void {
    this.enabled = false;
    if (this.transformControls) {
      this.transformControls.detach();
    }
  }

  /**
   * Check if the gizmo is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set the transform mode
   */
  setMode(mode: TransformMode): void {
    this.mode = mode;
    if (this.transformControls) {
      this.transformControls.setMode(mode);
    }
  }

  /**
   * Get the current transform mode
   */
  getMode(): TransformMode {
    return this.mode;
  }

  /**
   * Set the transform space (world or local)
   */
  setSpace(space: TransformSpace): void {
    this.space = space;
    if (this.transformControls) {
      this.transformControls.setSpace(space);
    }
  }

  /**
   * Get the current transform space
   */
  getSpace(): TransformSpace {
    return this.space;
  }

  /**
   * Toggle between world and local space
   */
  toggleSpace(): TransformSpace {
    const newSpace = this.space === 'world' ? 'local' : 'world';
    this.setSpace(newSpace);
    return newSpace;
  }

  /**
   * Enable or disable snapping
   */
  setSnapEnabled(enabled: boolean): void {
    this.snapEnabled = enabled;
    this.updateSnapping();
  }

  /**
   * Check if snapping is enabled
   */
  isSnapEnabled(): boolean {
    return this.snapEnabled;
  }

  /**
   * Set snap values
   */
  setSnapValues(translation?: number, rotation?: number, scale?: number): void {
    if (translation !== undefined) this.translationSnap = translation;
    if (rotation !== undefined) this.rotationSnap = rotation;
    if (scale !== undefined) this.scaleSnap = scale;
    this.updateSnapping();
  }

  /**
   * Get snap values
   */
  getSnapValues(): { translation: number; rotation: number; scale: number } {
    return {
      translation: this.translationSnap,
      rotation: this.rotationSnap,
      scale: this.scaleSnap,
    };
  }

  /**
   * Attach the gizmo to the currently selected object
   */
  private updateAttachment(): void {
    const selectedObject = this.probe.getSelectedObject();

    if (this.enabled && this.transformControls && selectedObject) {
      // Don't attach to 3lens helpers or the scene itself
      if (
        selectedObject.name.startsWith('__3lens') ||
        selectedObject.name.startsWith('3lens_') ||
        selectedObject.type === 'Scene'
      ) {
        this.transformControls.detach();
        this.currentObject = null;
        return;
      }

      this.transformControls.attach(selectedObject);
      this.currentObject = selectedObject;
    } else if (this.transformControls) {
      this.transformControls.detach();
      this.currentObject = null;
    }
  }

  /**
   * Update the gizmo when selection changes
   */
  onSelectionChanged(): void {
    this.updateAttachment();
  }

  /**
   * Update snapping settings on the transform controls
   */
  private updateSnapping(): void {
    if (!this.transformControls) return;

    if (this.snapEnabled) {
      this.transformControls.setTranslationSnap(this.translationSnap);
      this.transformControls.setRotationSnap(this.rotationSnap);
      this.transformControls.setScaleSnap(this.scaleSnap);
    } else {
      this.transformControls.setTranslationSnap(null);
      this.transformControls.setRotationSnap(null);
      this.transformControls.setScaleSnap(null);
    }
  }

  /**
   * Handle dragging state changes
   */
  private handleDraggingChanged = (event: { value: unknown }): void => {
    const isDragging = Boolean(event.value);

    for (const callback of this.onDraggingChangedCallbacks) {
      callback(isDragging);
    }
  };

  /**
   * Handle mouse down - capture initial transform state for undo
   */
  private handleMouseDown = (): void => {
    if (this.currentObject) {
      this.transformStart = this.captureTransform(this.currentObject);
    }
  };

  /**
   * Handle mouse up - save transform to history
   */
  private handleMouseUp = (): void => {
    if (this.currentObject && this.transformStart) {
      const transformEnd = this.captureTransform(this.currentObject);

      // Only add to history if something actually changed
      if (!this.transformsEqual(this.transformStart, transformEnd)) {
        const entry: TransformHistoryEntry = {
          objectUuid: this.currentObject.uuid,
          objectName: this.currentObject.name || this.currentObject.type,
          before: this.transformStart,
          after: transformEnd,
          timestamp: Date.now(),
        };

        this.addToHistory(entry);

        // Notify callbacks
        for (const callback of this.onTransformChangedCallbacks) {
          callback(entry);
        }
      }

      this.transformStart = null;
    }
  };

  /**
   * Handle object change events (called during dragging)
   */
  private handleObjectChange = (): void => {
    // Could emit real-time updates here if needed
  };

  /**
   * Capture current transform state of an object
   */
  private captureTransform(obj: THREE.Object3D): TransformSnapshot {
    return {
      position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
      rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
      scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
    };
  }

  /**
   * Apply a transform snapshot to an object
   */
  private applyTransform(
    obj: THREE.Object3D,
    transform: TransformSnapshot
  ): void {
    obj.position.set(
      transform.position.x,
      transform.position.y,
      transform.position.z
    );
    obj.rotation.set(
      transform.rotation.x,
      transform.rotation.y,
      transform.rotation.z
    );
    obj.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
  }

  /**
   * Check if two transforms are equal
   */
  private transformsEqual(a: TransformSnapshot, b: TransformSnapshot): boolean {
    const epsilon = 0.0001;
    return (
      Math.abs(a.position.x - b.position.x) < epsilon &&
      Math.abs(a.position.y - b.position.y) < epsilon &&
      Math.abs(a.position.z - b.position.z) < epsilon &&
      Math.abs(a.rotation.x - b.rotation.x) < epsilon &&
      Math.abs(a.rotation.y - b.rotation.y) < epsilon &&
      Math.abs(a.rotation.z - b.rotation.z) < epsilon &&
      Math.abs(a.scale.x - b.scale.x) < epsilon &&
      Math.abs(a.scale.y - b.scale.y) < epsilon &&
      Math.abs(a.scale.z - b.scale.z) < epsilon
    );
  }

  /**
   * Add an entry to the history
   */
  private addToHistory(entry: TransformHistoryEntry): void {
    // Remove any redo entries
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Add new entry
    this.history.push(entry);
    this.historyIndex = this.history.length - 1;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  /**
   * Find an object by UUID across all observed scenes
   */
  private findObjectByUuid(uuid: string): THREE.Object3D | null {
    for (const scene of this.probe.getObservedScenes()) {
      let found: THREE.Object3D | null = null;
      scene.traverse((obj) => {
        if (obj.uuid === uuid) {
          found = obj;
        }
      });
      if (found) return found;
    }
    return null;
  }

  /**
   * Undo the last transform
   */
  undo(): boolean {
    if (this.historyIndex < 0) {
      return false;
    }

    const entry = this.history[this.historyIndex];
    const obj = this.findObjectByUuid(entry.objectUuid);

    if (obj) {
      this.applyTransform(obj, entry.before);
      this.historyIndex--;
      return true;
    }

    return false;
  }

  /**
   * Redo the last undone transform
   */
  redo(): boolean {
    if (this.historyIndex >= this.history.length - 1) {
      return false;
    }

    this.historyIndex++;
    const entry = this.history[this.historyIndex];
    const obj = this.findObjectByUuid(entry.objectUuid);

    if (obj) {
      this.applyTransform(obj, entry.after);
      return true;
    }

    return false;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.historyIndex >= 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * Get the transform history
   */
  getHistory(): TransformHistoryEntry[] {
    return [...this.history];
  }

  /**
   * Clear the transform history
   */
  clearHistory(): void {
    this.history = [];
    this.historyIndex = -1;
  }

  /**
   * Subscribe to dragging state changes
   */
  onDraggingChanged(callback: (isDragging: boolean) => void): () => void {
    this.onDraggingChangedCallbacks.push(callback);
    return () => {
      const index = this.onDraggingChangedCallbacks.indexOf(callback);
      if (index >= 0) {
        this.onDraggingChangedCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to transform changes
   */
  onTransformChanged(
    callback: (entry: TransformHistoryEntry) => void
  ): () => void {
    this.onTransformChangedCallbacks.push(callback);
    return () => {
      const index = this.onTransformChangedCallbacks.indexOf(callback);
      if (index >= 0) {
        this.onTransformChangedCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Update the gizmo (call in animation loop if camera changes)
   */
  update(): void {
    // TransformControls handles its own updates, but we could add
    // additional update logic here if needed
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    if (this.transformControls) {
      this.transformControls.removeEventListener(
        'dragging-changed',
        this.handleDraggingChanged
      );
      this.transformControls.removeEventListener(
        'objectChange',
        this.handleObjectChange
      );
      this.transformControls.removeEventListener(
        'mouseDown',
        this.handleMouseDown
      );
      this.transformControls.removeEventListener('mouseUp', this.handleMouseUp);

      this.transformControls.detach();

      if (this.scene) {
        this.scene.remove(this.transformControls);
      }

      this.transformControls.dispose();
      this.transformControls = null;
    }

    this.currentObject = null;
    this.scene = null;
    this.camera = null;
    this.domElement = null;
    this.THREE = null;
    this.enabled = false;
    this.history = [];
    this.historyIndex = -1;
    this.onDraggingChangedCallbacks = [];
    this.onTransformChangedCallbacks = [];
  }
}
