import type * as THREE from 'three';

/**
 * Creates and manages visual selection highlights in the 3D scene
 */
export class SelectionHelper {
  private boxHelper: THREE.BoxHelper | null = null;
  private hoverBoxHelper: THREE.BoxHelper | null = null;
  private currentObject: THREE.Object3D | null = null;
  private hoveredObject: THREE.Object3D | null = null;
  private scene: THREE.Scene | null = null;
  private hoverScene: THREE.Scene | null = null;
  private THREE: typeof import('three') | null = null;

  // Highlight styling
  private highlightColor = 0x22d3ee; // Cyan accent color for selection
  private hoverColor = 0x60a5fa; // Blue accent color for hover

  /**
   * Initialize the selection helper with three.js reference
   * We need the THREE namespace to create helpers
   */
  initialize(threeNamespace: typeof import('three')): void {
    this.THREE = threeNamespace;
  }

  /**
   * Set the color used for selection highlight
   */
  setHighlightColor(color: number): void {
    this.highlightColor = color;
    if (this.boxHelper) {
      (this.boxHelper.material as THREE.LineBasicMaterial).color.setHex(color);
    }
  }

  /**
   * Highlight an object in the scene
   */
  highlight(object: THREE.Object3D | null): void {
    // Clear previous highlight
    this.clearHighlight();

    if (!object || !this.THREE) {
      this.currentObject = null;
      return;
    }

    this.currentObject = object;

    // Find the scene this object belongs to
    let parent = object.parent;
    while (parent) {
      if (parent.type === 'Scene') {
        this.scene = parent as THREE.Scene;
        break;
      }
      parent = parent.parent;
    }

    // If object is a scene itself
    if (object.type === 'Scene') {
      this.scene = object as THREE.Scene;
      // Don't draw box around the scene itself
      return;
    }

    if (!this.scene) {
      return;
    }

    // Create box helper
    this.boxHelper = new this.THREE.BoxHelper(object, this.highlightColor);
    this.boxHelper.name = '__3lens_selection_helper__';
    
    // Make the lines render properly in 3D space (back lines behind object)
    const material = this.boxHelper.material as THREE.LineBasicMaterial;
    material.linewidth = 2;
    material.depthTest = true; // Proper depth - back lines hidden behind object
    material.transparent = true;
    material.opacity = 1.0;

    // Add to scene
    this.scene.add(this.boxHelper);
  }

  /**
   * Update the highlight box (call this in animation loop if object moves)
   */
  update(): void {
    if (this.boxHelper && this.currentObject) {
      this.boxHelper.update();
    }
    if (this.hoverBoxHelper && this.hoveredObject) {
      this.hoverBoxHelper.update();
    }
  }

  /**
   * Clear the current highlight
   */
  clearHighlight(): void {
    if (this.boxHelper && this.scene) {
      this.scene.remove(this.boxHelper);
      this.boxHelper.geometry.dispose();
      (this.boxHelper.material as THREE.Material).dispose();
      this.boxHelper = null;
    }
    this.currentObject = null;
    this.scene = null;
  }

  /**
   * Highlight an object on hover (different color, lighter appearance)
   */
  highlightHover(object: THREE.Object3D | null): void {
    // Clear previous hover highlight
    this.clearHoverHighlight();

    if (!object || !this.THREE) {
      this.hoveredObject = null;
      return;
    }

    // Don't show hover if object is already selected
    if (object === this.currentObject) {
      return;
    }

    this.hoveredObject = object;

    // Find the scene this object belongs to
    let parent = object.parent;
    while (parent) {
      if (parent.type === 'Scene') {
        this.hoverScene = parent as THREE.Scene;
        break;
      }
      parent = parent.parent;
    }

    // If object is a scene itself
    if (object.type === 'Scene') {
      this.hoverScene = object as THREE.Scene;
      // Don't draw box around the scene itself
      return;
    }

    if (!this.hoverScene) {
      return;
    }

    // Create box helper for hover
    this.hoverBoxHelper = new this.THREE.BoxHelper(object, this.hoverColor);
    this.hoverBoxHelper.name = '__3lens_hover_helper__';
    
    // Style for hover - more subtle than selection
    const material = this.hoverBoxHelper.material as THREE.LineBasicMaterial;
    material.linewidth = 1;
    material.depthTest = true;
    material.transparent = true;
    material.opacity = 0.7;

    // Add to scene
    this.hoverScene.add(this.hoverBoxHelper);
  }

  /**
   * Clear the current hover highlight
   */
  clearHoverHighlight(): void {
    if (this.hoverBoxHelper && this.hoverScene) {
      this.hoverScene.remove(this.hoverBoxHelper);
      this.hoverBoxHelper.geometry.dispose();
      (this.hoverBoxHelper.material as THREE.Material).dispose();
      this.hoverBoxHelper = null;
    }
    this.hoveredObject = null;
    this.hoverScene = null;
  }

  /**
   * Get the currently highlighted object
   */
  getHighlightedObject(): THREE.Object3D | null {
    return this.currentObject;
  }

  /**
   * Get the currently hovered object
   */
  getHoveredObject(): THREE.Object3D | null {
    return this.hoveredObject;
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.clearHighlight();
    this.clearHoverHighlight();
    this.THREE = null;
  }
}

