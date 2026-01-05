import type * as THREE from 'three';
import type { DevtoolProbe } from '../probe/DevtoolProbe';
import type { ThreeNamespace } from '../types';

/**
 * InspectMode handles interactive object selection via raycasting
 * Enables clicking and hovering on objects in the 3D scene to select them
 */
export class InspectMode {
  private inspecting = false;
  private raycaster: THREE.Raycaster | null = null;
  private pointer: THREE.Vector2 | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private camera: THREE.Camera | null = null;
  private pickableObjects: THREE.Object3D[] = [];

  constructor(private probe: DevtoolProbe) {
    // Raycaster and pointer will be initialized when THREE is available
  }

  /**
   * Initialize inspect mode with canvas and camera
   * Must be called before enabling inspect mode
   */
  initialize(canvas: HTMLCanvasElement, camera: THREE.Camera, three: ThreeNamespace): void {
    this.canvas = canvas;
    this.camera = camera;
    this.raycaster = new three.Raycaster();
    this.pointer = new three.Vector2();
    this.setupEventListeners();
  }

  /**
   * Enable or disable inspect mode
   */
  setEnabled(enabled: boolean): void {
    if (enabled && (!this.canvas || !this.camera || !this.raycaster)) {
      console.warn('[3Lens] InspectMode: Cannot enable - not initialized. Call initialize() first.');
      return;
    }

    this.inspecting = enabled;
    if (this.canvas) {
      this.canvas.style.cursor = enabled ? 'crosshair' : 'default';
    }

    // Clear hover highlight when disabling
    if (!enabled) {
      this.probe.setHoveredObject(null);
    }
  }

  /**
   * Check if inspect mode is currently enabled
   */
  isEnabled(): boolean {
    return this.inspecting;
  }

  /**
   * Set the camera to use for raycasting
   * Useful when camera changes during runtime
   */
  setCamera(camera: THREE.Camera): void {
    this.camera = camera;
  }

  /**
   * Set specific objects to be pickable (optional)
   * If not set, all meshes in observed scenes will be pickable
   */
  setPickableObjects(objects: THREE.Object3D[]): void {
    this.pickableObjects = objects;
  }

  /**
   * Setup event listeners on the canvas
   */
  private setupEventListeners(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerleave', this.handlePointerLeave);
  }

  /**
   * Handle pointer down events (click to select)
   */
  private handlePointerDown = (event: PointerEvent): void => {
    if (!this.inspecting || !this.canvas || !this.camera || !this.raycaster || !this.pointer) {
      return;
    }

    const intersection = this.getIntersection(event);
    if (intersection) {
      this.probe.selectObject(intersection.object);
    } else {
      // Click on empty space - deselect
      this.probe.selectObject(null);
    }

    // Prevent default to avoid interfering with app interactions
    event.preventDefault();
    event.stopPropagation();
  };

  /**
   * Handle pointer move events (hover highlighting)
   */
  private handlePointerMove = (event: PointerEvent): void => {
    if (!this.inspecting || !this.canvas || !this.camera || !this.raycaster || !this.pointer) {
      return;
    }

    const intersection = this.getIntersection(event);
    const hoveredObject = intersection?.object ?? null;
    this.probe.setHoveredObject(hoveredObject);
  };

  /**
   * Handle pointer leave events (clear hover when mouse leaves canvas)
   */
  private handlePointerLeave = (): void => {
    if (!this.inspecting) return;
    this.probe.setHoveredObject(null);
  };

  /**
   * Perform raycasting to find intersected object
   */
  private getIntersection(event: PointerEvent): THREE.Intersection | null {
    if (!this.canvas || !this.camera || !this.raycaster || !this.pointer) {
      return null;
    }

    const rect = this.canvas.getBoundingClientRect();
    
    // Convert mouse coordinates to normalized device coordinates (-1 to +1)
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update raycaster with camera and pointer
    this.raycaster.setFromCamera(this.pointer, this.camera);

    // Get pickable objects
    const objects = this.getPickableObjects();

    // Perform intersection test
    const intersects = this.raycaster.intersectObjects(objects, true); // recursive = true

    // Return the closest intersection
    return intersects.length > 0 ? intersects[0] : null;
  }

  /**
   * Get the list of objects that can be picked
   */
  private getPickableObjects(): THREE.Object3D[] {
    // If specific pickable objects are set, use those
    if (this.pickableObjects.length > 0) {
      return this.pickableObjects;
    }

    // Otherwise, collect all meshes from observed scenes
    const objects: THREE.Object3D[] = [];
    const scenes = this.probe.getObservedScenes();
    
    for (const scene of scenes) {
      scene.traverse((obj) => {
        // Only pick meshes (skip lights, cameras, helpers, etc.)
        // Check for isMesh property which is set by THREE.Mesh
        if ('isMesh' in obj && obj.isMesh === true) {
          // Skip selection helpers themselves
          if (obj.name !== '__3lens_selection_helper__' && 
              obj.name !== '__3lens_hover_helper__') {
            objects.push(obj);
          }
        }
      });
    }

    return objects;
  }

  /**
   * Dispose of event listeners and clean up
   */
  dispose(): void {
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
      this.canvas.removeEventListener('pointermove', this.handlePointerMove);
      this.canvas.removeEventListener('pointerleave', this.handlePointerLeave);
      this.canvas.style.cursor = 'default';
    }

    this.inspecting = false;
    this.canvas = null;
    this.camera = null;
    this.raycaster = null;
    this.pointer = null;
    this.pickableObjects = [];
  }
}

