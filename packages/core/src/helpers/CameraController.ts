import type * as THREE from 'three';
import type { DevtoolProbe } from '../probe/DevtoolProbe';
import type { ThreeNamespace } from '../types';

export interface CameraInfo {
  uuid: string;
  name: string;
  type: 'PerspectiveCamera' | 'OrthographicCamera' | string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  fov?: number;
  aspect?: number;
  near: number;
  far: number;
  zoom: number;
  // Orthographic-specific
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

export interface FlyToOptions {
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Easing function ('linear' | 'easeInOut' | 'easeOut') */
  easing?: 'linear' | 'easeInOut' | 'easeOut';
  /** Padding around the object (multiplier, default 1.5) */
  padding?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
}

interface AnimationState {
  startTime: number;
  duration: number;
  startPosition: { x: number; y: number; z: number };
  endPosition: { x: number; y: number; z: number };
  startTarget: { x: number; y: number; z: number };
  endTarget: { x: number; y: number; z: number };
  easing: 'linear' | 'easeInOut' | 'easeOut';
  onComplete?: () => void;
}

/**
 * CameraController manages camera operations like focus, fly-to animations,
 * and camera switching
 */
export class CameraController {
  private THREE: ThreeNamespace | null = null;
  private camera: THREE.Camera | null = null;
  private orbitTarget: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  private animation: AnimationState | null = null;
  private animationFrameId: number | null = null;
  private sceneCameras: THREE.Camera[] = [];
  private activeCameraIndex = 0;
  
  // Home position (saved on initialization)
  private homePosition: { x: number; y: number; z: number } | null = null;
  private homeTarget: { x: number; y: number; z: number } | null = null;
  
  // Track last focused object to prevent refocusing on the same object
  private lastFocusedObjectUuid: string | null = null;
  private lastFocusPadding: number = 1.5;
  
  // Callbacks
  private onCameraChangedCallbacks: Array<(camera: THREE.Camera, info: CameraInfo) => void> = [];
  private onAnimationCompleteCallbacks: Array<() => void> = [];
  
  constructor(private probe: DevtoolProbe) {}

  /**
   * Initialize the camera controller
   */
  initialize(
    camera: THREE.Camera,
    three: ThreeNamespace,
    orbitTarget?: { x: number; y: number; z: number }
  ): void {
    this.camera = camera;
    this.THREE = three;
    if (orbitTarget) {
      this.orbitTarget = { ...orbitTarget };
    }
    
    // Save home position
    this.homePosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    };
    this.homeTarget = { ...this.orbitTarget };
    
    // Scan for cameras in observed scenes
    this.updateSceneCameras();
  }

  /**
   * Set a new home position (useful if you want to update it)
   */
  setHomePosition(
    position: { x: number; y: number; z: number },
    target?: { x: number; y: number; z: number }
  ): void {
    this.homePosition = { ...position };
    if (target) {
      this.homeTarget = { ...target };
    }
  }

  /**
   * Save the current camera position as home
   */
  saveCurrentAsHome(): void {
    if (!this.camera) return;
    this.homePosition = {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z,
    };
    this.homeTarget = { ...this.orbitTarget };
  }

  /**
   * Reset camera to home position (instant)
   */
  goHome(): void {
    if (!this.camera || !this.homePosition || !this.homeTarget) return;

    this.camera.position.set(
      this.homePosition.x,
      this.homePosition.y,
      this.homePosition.z
    );
    this.orbitTarget = { ...this.homeTarget };
    this.camera.lookAt(this.homeTarget.x, this.homeTarget.y, this.homeTarget.z);
    
    // Clear focus tracking since we're no longer focused on an object
    this.lastFocusedObjectUuid = null;
  }

  /**
   * Fly camera back to home position with animation
   */
  flyHome(options: Omit<FlyToOptions, 'padding'> = {}): void {
    if (!this.camera || !this.homePosition || !this.homeTarget) return;

    const {
      duration = 800,
      easing = 'easeInOut',
      onComplete,
    } = options;

    // Clear focus tracking since we're going home
    this.lastFocusedObjectUuid = null;

    // Start animation
    this.animation = {
      startTime: performance.now(),
      duration,
      startPosition: {
        x: this.camera.position.x,
        y: this.camera.position.y,
        z: this.camera.position.z,
      },
      endPosition: { ...this.homePosition },
      startTarget: { ...this.orbitTarget },
      endTarget: { ...this.homeTarget },
      easing,
      onComplete,
    };

    this.startAnimationLoop();
  }

  /**
   * Check if home position is set
   */
  hasHomePosition(): boolean {
    return this.homePosition !== null && this.homeTarget !== null;
  }

  /**
   * Get the home position
   */
  getHomePosition(): { position: { x: number; y: number; z: number }; target: { x: number; y: number; z: number } } | null {
    if (!this.homePosition || !this.homeTarget) return null;
    return {
      position: { ...this.homePosition },
      target: { ...this.homeTarget },
    };
  }

  /**
   * Check if the controller is initialized
   */
  isInitialized(): boolean {
    return this.camera !== null && this.THREE !== null;
  }

  /**
   * Get the current camera
   */
  getCamera(): THREE.Camera | null {
    return this.camera;
  }

  /**
   * Set the current camera
   */
  setCamera(camera: THREE.Camera): void {
    this.camera = camera;
    this.notifyCameraChanged();
  }

  /**
   * Set the orbit target (the point the camera looks at)
   */
  setOrbitTarget(target: { x: number; y: number; z: number }): void {
    this.orbitTarget = { ...target };
  }

  /**
   * Get the orbit target
   */
  getOrbitTarget(): { x: number; y: number; z: number } {
    return { ...this.orbitTarget };
  }

  /**
   * Get information about the current camera
   */
  getCameraInfo(): CameraInfo | null {
    if (!this.camera) return null;
    return this.extractCameraInfo(this.camera);
  }

  /**
   * Extract camera information
   */
  private extractCameraInfo(camera: THREE.Camera): CameraInfo {
    const info: CameraInfo = {
      uuid: camera.uuid,
      name: camera.name || camera.type,
      type: camera.type,
      position: {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      },
      rotation: {
        x: camera.rotation.x,
        y: camera.rotation.y,
        z: camera.rotation.z,
      },
      near: 0.1,
      far: 1000,
      zoom: 1,
    };

    // Handle PerspectiveCamera
    if ('isPerspectiveCamera' in camera && (camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const perspCam = camera as THREE.PerspectiveCamera;
      info.fov = perspCam.fov;
      info.aspect = perspCam.aspect;
      info.near = perspCam.near;
      info.far = perspCam.far;
      info.zoom = perspCam.zoom;
    }

    // Handle OrthographicCamera
    if ('isOrthographicCamera' in camera && (camera as THREE.OrthographicCamera).isOrthographicCamera) {
      const orthoCam = camera as THREE.OrthographicCamera;
      info.left = orthoCam.left;
      info.right = orthoCam.right;
      info.top = orthoCam.top;
      info.bottom = orthoCam.bottom;
      info.near = orthoCam.near;
      info.far = orthoCam.far;
      info.zoom = orthoCam.zoom;
    }

    return info;
  }

  /**
   * Focus the camera on an object (instant)
   */
  focusOnObject(object: THREE.Object3D, padding = 1.5): void {
    if (!this.camera || !this.THREE) return;

    // Skip if already focused on this exact object with same padding
    if (this.lastFocusedObjectUuid === object.uuid && this.lastFocusPadding === padding) {
      return;
    }

    const target = this.calculateFocusPosition(object, padding);
    if (!target) return;

    // Instant move
    this.camera.position.set(target.position.x, target.position.y, target.position.z);
    this.orbitTarget = { ...target.target };
    
    // Update camera to look at target
    this.camera.lookAt(target.target.x, target.target.y, target.target.z);
    
    // Remember what we focused on
    this.lastFocusedObjectUuid = object.uuid;
    this.lastFocusPadding = padding;
  }

  /**
   * Focus the camera on the currently selected object
   */
  focusOnSelected(padding = 1.5): boolean {
    const selected = this.probe.getSelectedObject();
    if (!selected) return false;
    
    this.focusOnObject(selected, padding);
    return true;
  }

  /**
   * Fly the camera to focus on an object with animation
   */
  flyToObject(object: THREE.Object3D, options: FlyToOptions = {}): void {
    if (!this.camera || !this.THREE) return;

    const {
      duration = 800,
      easing = 'easeInOut',
      padding = 1.5,
      onComplete,
    } = options;

    // Skip if already focused on this exact object with same padding
    if (this.lastFocusedObjectUuid === object.uuid && this.lastFocusPadding === padding) {
      if (onComplete) onComplete();
      return;
    }

    const target = this.calculateFocusPosition(object, padding);
    if (!target) return;

    // Remember what we're focusing on (set before animation so repeated clicks are ignored)
    this.lastFocusedObjectUuid = object.uuid;
    this.lastFocusPadding = padding;

    // Start animation
    this.animation = {
      startTime: performance.now(),
      duration,
      startPosition: {
        x: this.camera.position.x,
        y: this.camera.position.y,
        z: this.camera.position.z,
      },
      endPosition: target.position,
      startTarget: { ...this.orbitTarget },
      endTarget: target.target,
      easing,
      onComplete,
    };

    this.startAnimationLoop();
  }

  /**
   * Fly to the currently selected object
   */
  flyToSelected(options: FlyToOptions = {}): boolean {
    const selected = this.probe.getSelectedObject();
    if (!selected) return false;
    
    this.flyToObject(selected, options);
    return true;
  }

  /**
   * Calculate the camera position to focus on an object
   */
  private calculateFocusPosition(
    object: THREE.Object3D,
    padding: number
  ): { position: { x: number; y: number; z: number }; target: { x: number; y: number; z: number } } | null {
    if (!this.THREE || !this.camera) return null;

    // Get object's world bounding box
    const box = new this.THREE.Box3().setFromObject(object);
    
    // Handle empty bounding box
    if (box.isEmpty()) {
      // Use object's world position
      const worldPos = new this.THREE.Vector3();
      object.getWorldPosition(worldPos);
      
      return {
        position: {
          x: worldPos.x + 5,
          y: worldPos.y + 5,
          z: worldPos.z + 5,
        },
        target: {
          x: worldPos.x,
          y: worldPos.y,
          z: worldPos.z,
        },
      };
    }

    // Get center and size
    const center = box.getCenter(new this.THREE.Vector3());
    const size = box.getSize(new this.THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // Calculate distance based on camera type
    let distance: number;
    
    if ('isPerspectiveCamera' in this.camera && (this.camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const perspCam = this.camera as THREE.PerspectiveCamera;
      const fov = perspCam.fov * (Math.PI / 180);
      distance = (maxDim * padding) / (2 * Math.tan(fov / 2));
    } else {
      // Orthographic camera
      distance = maxDim * padding * 2;
    }

    // Keep the same viewing angle, just adjust distance
    const direction = new this.THREE.Vector3();
    direction.subVectors(this.camera.position, new this.THREE.Vector3(this.orbitTarget.x, this.orbitTarget.y, this.orbitTarget.z));
    direction.normalize();

    // Calculate new position
    const newPosition = new this.THREE.Vector3();
    newPosition.copy(center);
    newPosition.addScaledVector(direction, distance);

    return {
      position: { x: newPosition.x, y: newPosition.y, z: newPosition.z },
      target: { x: center.x, y: center.y, z: center.z },
    };
  }

  /**
   * Start the animation loop
   */
  private startAnimationLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    const animate = () => {
      if (!this.animation || !this.camera) {
        this.animationFrameId = null;
        return;
      }

      const now = performance.now();
      const elapsed = now - this.animation.startTime;
      const progress = Math.min(elapsed / this.animation.duration, 1);
      const easedProgress = this.applyEasing(progress, this.animation.easing);

      // Interpolate position
      this.camera.position.set(
        this.lerp(this.animation.startPosition.x, this.animation.endPosition.x, easedProgress),
        this.lerp(this.animation.startPosition.y, this.animation.endPosition.y, easedProgress),
        this.lerp(this.animation.startPosition.z, this.animation.endPosition.z, easedProgress)
      );

      // Interpolate target
      this.orbitTarget = {
        x: this.lerp(this.animation.startTarget.x, this.animation.endTarget.x, easedProgress),
        y: this.lerp(this.animation.startTarget.y, this.animation.endTarget.y, easedProgress),
        z: this.lerp(this.animation.startTarget.z, this.animation.endTarget.z, easedProgress),
      };

      // Update camera to look at target
      this.camera.lookAt(this.orbitTarget.x, this.orbitTarget.y, this.orbitTarget.z);

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        // Animation complete
        const onComplete = this.animation.onComplete;
        this.animation = null;
        this.animationFrameId = null;
        
        if (onComplete) {
          onComplete();
        }
        
        for (const callback of this.onAnimationCompleteCallbacks) {
          callback();
        }
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Stop any running animation
   */
  stopAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.animation = null;
  }

  /**
   * Check if an animation is running
   */
  isAnimating(): boolean {
    return this.animation !== null;
  }

  /**
   * Linear interpolation
   */
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Apply easing function
   */
  private applyEasing(t: number, easing: 'linear' | 'easeInOut' | 'easeOut'): number {
    switch (easing) {
      case 'linear':
        return t;
      case 'easeOut':
        return 1 - Math.pow(1 - t, 3);
      case 'easeInOut':
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      default:
        return t;
    }
  }

  /**
   * Update the list of cameras in observed scenes
   */
  updateSceneCameras(): void {
    this.sceneCameras = [];
    
    for (const scene of this.probe.getObservedScenes()) {
      scene.traverse((obj) => {
        if ('isCamera' in obj && (obj as THREE.Camera).isCamera) {
          // Skip the main camera if it's the one we're controlling
          if (obj !== this.camera) {
            this.sceneCameras.push(obj as THREE.Camera);
          }
        }
      });
    }
  }

  /**
   * Get all available cameras (including the main camera)
   */
  getAvailableCameras(): CameraInfo[] {
    this.updateSceneCameras();
    
    const cameras: CameraInfo[] = [];
    
    // Add main camera first
    if (this.camera) {
      cameras.push({
        ...this.extractCameraInfo(this.camera),
        name: this.camera.name || 'Main Camera',
      });
    }
    
    // Add scene cameras
    for (const cam of this.sceneCameras) {
      cameras.push(this.extractCameraInfo(cam));
    }
    
    return cameras;
  }

  /**
   * Switch to a different camera by index
   */
  switchToCamera(index: number): boolean {
    const allCameras = [this.camera, ...this.sceneCameras].filter(Boolean) as THREE.Camera[];
    
    if (index < 0 || index >= allCameras.length) {
      return false;
    }
    
    this.activeCameraIndex = index;
    this.camera = allCameras[index];
    this.notifyCameraChanged();
    
    return true;
  }

  /**
   * Switch to a camera by UUID
   */
  switchToCameraByUuid(uuid: string): boolean {
    // Check main camera
    if (this.camera?.uuid === uuid) {
      this.activeCameraIndex = 0;
      this.notifyCameraChanged();
      return true;
    }
    
    // Check scene cameras
    const index = this.sceneCameras.findIndex((cam) => cam.uuid === uuid);
    if (index >= 0) {
      this.camera = this.sceneCameras[index];
      this.activeCameraIndex = index + 1;
      this.notifyCameraChanged();
      return true;
    }
    
    return false;
  }

  /**
   * Get the index of the active camera
   */
  getActiveCameraIndex(): number {
    return this.activeCameraIndex;
  }

  /**
   * Notify callbacks of camera change
   */
  private notifyCameraChanged(): void {
    if (!this.camera) return;
    
    const info = this.getCameraInfo();
    if (!info) return;
    
    for (const callback of this.onCameraChangedCallbacks) {
      callback(this.camera, info);
    }
  }

  /**
   * Subscribe to camera change events
   */
  onCameraChanged(callback: (camera: THREE.Camera, info: CameraInfo) => void): () => void {
    this.onCameraChangedCallbacks.push(callback);
    return () => {
      const index = this.onCameraChangedCallbacks.indexOf(callback);
      if (index >= 0) {
        this.onCameraChangedCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to animation complete events
   */
  onAnimationComplete(callback: () => void): () => void {
    this.onAnimationCompleteCallbacks.push(callback);
    return () => {
      const index = this.onAnimationCompleteCallbacks.indexOf(callback);
      if (index >= 0) {
        this.onAnimationCompleteCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.stopAnimation();
    this.camera = null;
    this.THREE = null;
    this.sceneCameras = [];
    this.onCameraChangedCallbacks = [];
    this.onAnimationCompleteCallbacks = [];
  }
}

