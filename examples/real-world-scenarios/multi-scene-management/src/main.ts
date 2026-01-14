import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe, DevtoolProbe } from '@3lens/core';
import { createOverlay, ThreeLensOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ============================================================================
// Types
// ============================================================================

interface SceneConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'geometry' | 'particles' | 'animation' | 'environment';
}

interface ManagedScene {
  config: SceneConfig;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  container: HTMLElement;
  active: boolean;
  paused: boolean;
  objects: THREE.Object3D[];
  animationMixer?: THREE.AnimationMixer;
  clock: THREE.Clock;
  stats: {
    objects: number;
    triangles: number;
    drawCalls: number;
  };
}

interface SceneMessage {
  from: string;
  to: string;
  type: string;
  data: unknown;
  timestamp: number;
}

type LayoutType = 'single' | '2x2' | '2x1' | '1-2' | '3x1' | 'tabs';

// ============================================================================
// Scene Manager
// ============================================================================

class MultiSceneManager {
  private scenes: Map<string, ManagedScene> = new Map();
  private probe: DevtoolProbe | null = null;
  private overlay: ThreeLensOverlay | null = null;
  private activeSceneId: string | null = null;
  private layout: LayoutType = '2x2';
  private messages: SceneMessage[] = [];
  private sharedGeometries: Map<string, THREE.BufferGeometry> = new Map();
  private sharedMaterials: Map<string, THREE.Material> = new Map();
  private syncCameras: boolean = false;
  private autoPauseHidden: boolean = true;
  private tabModeActiveScene: string | null = null;

  constructor() {
    this.initDevtools();
    this.setupEventListeners();
    this.createDefaultScenes();
    this.updateUI();
    this.animate();
  }

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------

  private initDevtools(): void {
    this.probe = createProbe({
      appName: 'Multi-Scene Manager',
    });

    this.overlay = createOverlay(this.probe);
  }

  private setupEventListeners(): void {
    // Layout buttons
    document.querySelectorAll('.layout-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const layout = btn.getAttribute('data-layout') as LayoutType;
        this.setLayout(layout);
      });
    });

    // Add scene button
    document.getElementById('add-scene')?.addEventListener('click', () => {
      this.addNewScene();
    });

    // Transfer button
    document.getElementById('transfer-btn')?.addEventListener('click', () => {
      this.handleObjectTransfer();
    });

    // Transfer source change - update object list
    document.getElementById('transfer-source')?.addEventListener('change', () => {
      this.updateTransferObjectList();
    });

    // Toggles
    document.getElementById('sync-cameras')?.addEventListener('click', (e) => {
      const toggle = e.currentTarget as HTMLElement;
      toggle.classList.toggle('active');
      this.syncCameras = toggle.classList.contains('active');
    });

    document.getElementById('auto-pause')?.addEventListener('click', (e) => {
      const toggle = e.currentTarget as HTMLElement;
      toggle.classList.toggle('active');
      this.autoPauseHidden = toggle.classList.contains('active');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  private handleKeyboard(e: KeyboardEvent): void {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

    switch (e.key) {
      case '1':
      case '2':
      case '3':
      case '4':
        const index = parseInt(e.key) - 1;
        const sceneIds = Array.from(this.scenes.keys());
        if (sceneIds[index]) {
          this.selectScene(sceneIds[index]);
        }
        break;
      case 'f':
      case 'F':
        if (this.activeSceneId) {
          this.toggleFullscreen(this.activeSceneId);
        }
        break;
      case 'Tab':
        e.preventDefault();
        this.cycleScenes();
        break;
      case ' ':
        e.preventDefault();
        if (this.activeSceneId) {
          this.togglePause(this.activeSceneId);
        }
        break;
      case 'r':
      case 'R':
        this.resetAllScenes();
        break;
      case 'd':
      case 'D':
        this.overlay?.toggle();
        break;
    }
  }

  // --------------------------------------------------------------------------
  // Scene Creation
  // --------------------------------------------------------------------------

  private createDefaultScenes(): void {
    const defaultConfigs: SceneConfig[] = [
      { id: 'geometry', name: 'Geometry Lab', icon: '🔷', color: '#3b82f6', type: 'geometry' },
      { id: 'particles', name: 'Particle Field', icon: '✨', color: '#8b5cf6', type: 'particles' },
      { id: 'animation', name: 'Animation Stage', icon: '🎬', color: '#f59e0b', type: 'animation' },
      { id: 'environment', name: 'Environment', icon: '🌍', color: '#10b981', type: 'environment' },
    ];

    defaultConfigs.forEach(config => this.createScene(config));

    // Select first scene
    if (defaultConfigs.length > 0) {
      this.selectScene(defaultConfigs[0].id);
    }
  }

  private createScene(config: SceneConfig): ManagedScene {
    // Create container
    const container = document.createElement('div');
    container.className = 'viewport';
    container.id = `viewport-${config.id}`;
    container.innerHTML = `
      <div class="viewport-label">
        <span class="status"></span>
        <span>${config.icon} ${config.name}</span>
      </div>
    `;

    // Click to select
    container.addEventListener('click', () => this.selectScene(config.id));
    container.addEventListener('dblclick', () => this.toggleFullscreen(config.id));

    // Create Three.js components
    const scene = new THREE.Scene();
    scene.name = config.name;
    scene.background = new THREE.Color(0x1a1a2e);

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.set(5, 5, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Camera sync
    controls.addEventListener('change', () => {
      if (this.syncCameras && config.id === this.activeSceneId) {
        this.syncCameraToAll(camera);
      }
    });

    // Add to DOM
    document.getElementById('viewports')?.appendChild(container);

    const managedScene: ManagedScene = {
      config,
      scene,
      camera,
      renderer,
      controls,
      container,
      active: true,
      paused: false,
      objects: [],
      clock: new THREE.Clock(),
      stats: { objects: 0, triangles: 0, drawCalls: 0 },
    };

    // Populate scene based on type
    this.populateScene(managedScene);

    // Register with 3Lens
    this.probe?.observeScene(scene);
    this.probe?.observeRenderer(renderer);

    this.scenes.set(config.id, managedScene);

    // Initial resize
    this.resizeScene(managedScene);

    return managedScene;
  }

  private populateScene(managedScene: ManagedScene): void {
    const { scene, config } = managedScene;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add grid
    const grid = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(grid);

    // Type-specific content
    switch (config.type) {
      case 'geometry':
        this.createGeometryScene(managedScene);
        break;
      case 'particles':
        this.createParticleScene(managedScene);
        break;
      case 'animation':
        this.createAnimationScene(managedScene);
        break;
      case 'environment':
        this.createEnvironmentScene(managedScene);
        break;
    }
  }

  private createGeometryScene(managedScene: ManagedScene): void {
    const { scene, objects, config } = managedScene;

    // Create shared geometries
    const boxGeometry = this.getSharedGeometry('box', () => new THREE.BoxGeometry(1, 1, 1));
    const sphereGeometry = this.getSharedGeometry('sphere', () => new THREE.SphereGeometry(0.5, 32, 32));
    const cylinderGeometry = this.getSharedGeometry('cylinder', () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32));
    const torusGeometry = this.getSharedGeometry('torus', () => new THREE.TorusGeometry(0.5, 0.2, 16, 32));
    const coneGeometry = this.getSharedGeometry('cone', () => new THREE.ConeGeometry(0.5, 1, 32));

    const geometries = [boxGeometry, sphereGeometry, cylinderGeometry, torusGeometry, coneGeometry];
    const colors = [0x3b82f6, 0x8b5cf6, 0xf59e0b, 0x10b981, 0xef4444];

    // Create a grid of shapes
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        const index = Math.abs(x + z) % geometries.length;
        const material = new THREE.MeshStandardMaterial({
          color: colors[index],
          metalness: 0.3,
          roughness: 0.7,
        });

        const mesh = new THREE.Mesh(geometries[index], material);
        mesh.position.set(x * 2, 0.5, z * 2);
        mesh.name = `Shape_${x + 2}_${z + 2}`;
        mesh.userData.sceneId = config.id;
        mesh.userData.transferable = true;

        scene.add(mesh);
        objects.push(mesh);
      }
    }
  }

  private createParticleScene(managedScene: ManagedScene): void {
    const { scene, objects, config } = managedScene;

    // Create multiple particle systems
    const particleCounts = [1000, 2000, 500];
    const colors = [0x8b5cf6, 0x06b6d4, 0xf43f5e];

    particleCounts.forEach((count, index) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const velocities = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const radius = 5 + index * 2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);

        velocities[i3] = (Math.random() - 0.5) * 0.02;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

      const material = new THREE.PointsMaterial({
        color: colors[index],
        size: 0.05 + index * 0.02,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(geometry, material);
      particles.name = `ParticleSystem_${index}`;
      particles.userData.sceneId = config.id;
      particles.userData.velocities = velocities;

      scene.add(particles);
      objects.push(particles);
    });

    // Add central emitter
    const emitterGeometry = new THREE.IcosahedronGeometry(0.5, 2);
    const emitterMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.5,
    });
    const emitter = new THREE.Mesh(emitterGeometry, emitterMaterial);
    emitter.name = 'ParticleEmitter';
    emitter.userData.sceneId = config.id;
    emitter.userData.transferable = true;
    scene.add(emitter);
    objects.push(emitter);
  }

  private createAnimationScene(managedScene: ManagedScene): void {
    const { scene, objects, config } = managedScene;

    // Create animated objects
    const group = new THREE.Group();
    group.name = 'AnimationGroup';

    // Orbiting spheres
    for (let i = 0; i < 8; i++) {
      const geometry = this.getSharedGeometry('animSphere', () => new THREE.SphereGeometry(0.3, 16, 16));
      const hue = i / 8;
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(hue, 0.8, 0.5),
        metalness: 0.5,
        roughness: 0.3,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `OrbitingSphere_${i}`;
      mesh.userData.orbitIndex = i;
      mesh.userData.orbitRadius = 3;
      mesh.userData.orbitSpeed = 0.5 + i * 0.1;
      mesh.userData.sceneId = config.id;
      mesh.userData.transferable = true;

      group.add(mesh);
      objects.push(mesh);
    }

    // Central rotating object
    const torusKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1, 0.3, 128, 16),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.7,
        roughness: 0.2,
      })
    );
    torusKnot.name = 'CentralTorusKnot';
    torusKnot.userData.sceneId = config.id;
    torusKnot.userData.transferable = true;
    group.add(torusKnot);
    objects.push(torusKnot);

    scene.add(group);
    objects.push(group);
  }

  private createEnvironmentScene(managedScene: ManagedScene): void {
    const { scene, objects, config } = managedScene;

    // Create terrain-like floor
    const terrainGeometry = new THREE.PlaneGeometry(20, 20, 64, 64);
    const positions = terrainGeometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 0.5;
      positions.setZ(i, z);
    }
    terrainGeometry.computeVertexNormals();

    const terrainMaterial = new THREE.MeshStandardMaterial({
      color: 0x228b22,
      flatShading: true,
    });

    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.rotation.x = -Math.PI / 2;
    terrain.name = 'Terrain';
    terrain.userData.sceneId = config.id;
    scene.add(terrain);
    objects.push(terrain);

    // Add trees
    for (let i = 0; i < 15; i++) {
      const tree = this.createTree();
      tree.position.set(
        (Math.random() - 0.5) * 16,
        0,
        (Math.random() - 0.5) * 16
      );
      tree.scale.setScalar(0.5 + Math.random() * 0.5);
      tree.name = `Tree_${i}`;
      tree.userData.sceneId = config.id;
      tree.userData.transferable = true;
      scene.add(tree);
      objects.push(tree);
    }

    // Add water plane
    const waterGeometry = new THREE.PlaneGeometry(8, 8);
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x0077be,
      transparent: true,
      opacity: 0.6,
      metalness: 0.9,
      roughness: 0.1,
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.set(-4, 0.1, 4);
    water.name = 'WaterPlane';
    water.userData.sceneId = config.id;
    water.userData.transferable = true;
    scene.add(water);
    objects.push(water);

    // Sky dome
    const skyGeometry = new THREE.SphereGeometry(50, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    sky.name = 'SkyDome';
    scene.add(sky);
    objects.push(sky);
  }

  private createTree(): THREE.Group {
    const tree = new THREE.Group();

    // Trunk
    const trunkGeometry = this.getSharedGeometry('trunk', () => new THREE.CylinderGeometry(0.1, 0.15, 1, 8));
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 0.5;
    tree.add(trunk);

    // Foliage
    const foliageGeometry = this.getSharedGeometry('foliage', () => new THREE.ConeGeometry(0.5, 1.5, 8));
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 1.5;
    tree.add(foliage);

    return tree;
  }

  // --------------------------------------------------------------------------
  // Shared Resources
  // --------------------------------------------------------------------------

  private getSharedGeometry(key: string, factory: () => THREE.BufferGeometry): THREE.BufferGeometry {
    if (!this.sharedGeometries.has(key)) {
      this.sharedGeometries.set(key, factory());
    }
    return this.sharedGeometries.get(key)!;
  }

  // --------------------------------------------------------------------------
  // Scene Management
  // --------------------------------------------------------------------------

  public selectScene(sceneId: string): void {
    this.activeSceneId = sceneId;

    // Update UI
    document.querySelectorAll('.scene-item').forEach(item => {
      item.classList.toggle('selected', item.getAttribute('data-scene') === sceneId);
    });

    document.querySelectorAll('.viewport').forEach(viewport => {
      viewport.classList.toggle('active', viewport.id === `viewport-${sceneId}`);
    });

    // Tab mode
    document.querySelectorAll('.scene-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-scene') === sceneId);
    });

    if (this.layout === 'tabs') {
      this.tabModeActiveScene = sceneId;
      this.updateTabVisibility();
    }

    // Update 3Lens to show this scene
    const managedScene = this.scenes.get(sceneId);
    if (managedScene && this.probe) {
      // Select the first object to highlight scene
      // This helps users understand which scene is active
    }

    this.updateUI();
  }

  private toggleFullscreen(sceneId: string): void {
    const managedScene = this.scenes.get(sceneId);
    if (!managedScene) return;

    managedScene.container.classList.toggle('fullscreen');

    if (managedScene.container.classList.contains('fullscreen')) {
      this.resizeScene(managedScene);
    } else {
      this.handleResize();
    }
  }

  private togglePause(sceneId: string): void {
    const managedScene = this.scenes.get(sceneId);
    if (!managedScene) return;

    managedScene.paused = !managedScene.paused;
    if (managedScene.paused) {
      managedScene.clock.stop();
    } else {
      managedScene.clock.start();
    }

    // Send message
    this.sendMessage(sceneId, 'all', managedScene.paused ? 'paused' : 'resumed', null);

    this.updateUI();
  }

  private addNewScene(): void {
    const types: SceneConfig['type'][] = ['geometry', 'particles', 'animation', 'environment'];
    const icons = ['🔷', '✨', '🎬', '🌍'];
    const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];

    const existingCount = this.scenes.size;
    const typeIndex = existingCount % types.length;

    const config: SceneConfig = {
      id: `scene-${Date.now()}`,
      name: `Scene ${existingCount + 1}`,
      icon: icons[typeIndex],
      color: colors[typeIndex],
      type: types[typeIndex],
    };

    this.createScene(config);
    this.setLayout(this.layout); // Refresh layout
    this.updateUI();
  }

  private removeScene(sceneId: string): void {
    const managedScene = this.scenes.get(sceneId);
    if (!managedScene) return;

    // Don't remove if it's the last scene
    if (this.scenes.size <= 1) return;

    // Cleanup
    managedScene.scene.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    managedScene.renderer.dispose();
    managedScene.container.remove();

    this.scenes.delete(sceneId);

    // Select another scene
    if (this.activeSceneId === sceneId) {
      const firstScene = Array.from(this.scenes.keys())[0];
      if (firstScene) this.selectScene(firstScene);
    }

    this.setLayout(this.layout);
    this.updateUI();
  }

  private resetAllScenes(): void {
    this.scenes.forEach((managedScene, sceneId) => {
      managedScene.camera.position.set(5, 5, 5);
      managedScene.camera.lookAt(0, 0, 0);
      managedScene.controls.reset();
      managedScene.paused = false;
      managedScene.clock.start();
    });

    this.sendMessage('system', 'all', 'reset', { timestamp: Date.now() });
    this.updateUI();
  }

  private cycleScenes(): void {
    const sceneIds = Array.from(this.scenes.keys());
    const currentIndex = this.activeSceneId ? sceneIds.indexOf(this.activeSceneId) : -1;
    const nextIndex = (currentIndex + 1) % sceneIds.length;
    this.selectScene(sceneIds[nextIndex]);
  }

  // --------------------------------------------------------------------------
  // Layout Management
  // --------------------------------------------------------------------------

  public setLayout(layout: LayoutType): void {
    this.layout = layout;

    // Update button states
    document.querySelectorAll('.layout-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-layout') === layout);
    });

    const viewports = document.getElementById('viewports');
    const tabs = document.getElementById('scene-tabs');
    if (!viewports || !tabs) return;

    // Show/hide tabs
    tabs.classList.toggle('visible', layout === 'tabs');

    // Update grid layout
    switch (layout) {
      case 'single':
        viewports.style.gridTemplateColumns = '1fr';
        viewports.style.gridTemplateRows = '1fr';
        break;
      case '2x2':
        viewports.style.gridTemplateColumns = 'repeat(2, 1fr)';
        viewports.style.gridTemplateRows = 'repeat(2, 1fr)';
        break;
      case '2x1':
        viewports.style.gridTemplateColumns = 'repeat(2, 1fr)';
        viewports.style.gridTemplateRows = '1fr';
        break;
      case '1-2':
        viewports.style.gridTemplateColumns = '2fr 1fr';
        viewports.style.gridTemplateRows = 'repeat(2, 1fr)';
        break;
      case '3x1':
        viewports.style.gridTemplateColumns = 'repeat(3, 1fr)';
        viewports.style.gridTemplateRows = '1fr';
        break;
      case 'tabs':
        viewports.style.gridTemplateColumns = '1fr';
        viewports.style.gridTemplateRows = '1fr';
        this.updateTabVisibility();
        break;
    }

    // Update viewport visibility for single/tabs
    if (layout === 'single' || layout === 'tabs') {
      const sceneIds = Array.from(this.scenes.keys());
      this.scenes.forEach((scene, id) => {
        const isVisible = layout === 'tabs' 
          ? id === this.tabModeActiveScene
          : id === (this.activeSceneId || sceneIds[0]);
        scene.container.style.display = isVisible ? 'block' : 'none';
      });
    } else {
      this.scenes.forEach(scene => {
        scene.container.style.display = 'block';
      });
    }

    // Handle resize
    setTimeout(() => this.handleResize(), 0);
  }

  private updateTabVisibility(): void {
    this.scenes.forEach((scene, id) => {
      scene.container.style.display = id === this.tabModeActiveScene ? 'block' : 'none';
    });
    this.handleResize();
  }

  // --------------------------------------------------------------------------
  // Cross-Scene Communication
  // --------------------------------------------------------------------------

  private sendMessage(from: string, to: string, type: string, data: unknown): void {
    const message: SceneMessage = {
      from,
      to,
      type,
      data,
      timestamp: Date.now(),
    };

    this.messages.push(message);
    if (this.messages.length > 50) this.messages.shift();

    this.updateMessageLog();

    // Handle message
    if (to === 'all') {
      this.scenes.forEach((_, id) => {
        if (id !== from) this.handleMessage(message, id);
      });
    } else {
      this.handleMessage(message, to);
    }
  }

  private handleMessage(message: SceneMessage, targetId: string): void {
    const targetScene = this.scenes.get(targetId);
    if (!targetScene) return;

    // Process message types
    switch (message.type) {
      case 'object_transferred':
        // Object was transferred from another scene
        break;
      case 'camera_sync':
        if (this.syncCameras && message.data instanceof THREE.Vector3) {
          targetScene.camera.position.copy(message.data);
        }
        break;
    }
  }

  private updateMessageLog(): void {
    const log = document.getElementById('message-log');
    if (!log) return;

    const recentMessages = this.messages.slice(-10).reverse();
    log.innerHTML = recentMessages.map(msg => {
      const time = new Date(msg.timestamp).toLocaleTimeString();
      return `<div class="message-item">
        <span class="message-time">${time}</span>
        <span class="message-from">${msg.from}</span>→
        <span class="message-to">${msg.to}</span>:
        <span class="message-content">${msg.type}</span>
      </div>`;
    }).join('');
  }

  // --------------------------------------------------------------------------
  // Object Transfer
  // --------------------------------------------------------------------------

  private handleObjectTransfer(): void {
    const sourceSelect = document.getElementById('transfer-source') as HTMLSelectElement;
    const targetSelect = document.getElementById('transfer-target') as HTMLSelectElement;
    const objectSelect = document.getElementById('transfer-object') as HTMLSelectElement;

    const sourceId = sourceSelect.value;
    const targetId = targetSelect.value;
    const objectName = objectSelect.value;

    if (!sourceId || !targetId || !objectName || sourceId === targetId) return;

    const sourceScene = this.scenes.get(sourceId);
    const targetScene = this.scenes.get(targetId);

    if (!sourceScene || !targetScene) return;

    // Find and transfer object
    const object = sourceScene.objects.find(obj => obj.name === objectName);
    if (!object || !object.userData.transferable) return;

    // Remove from source
    sourceScene.scene.remove(object);
    sourceScene.objects = sourceScene.objects.filter(obj => obj !== object);

    // Add to target
    object.userData.sceneId = targetId;
    targetScene.scene.add(object);
    targetScene.objects.push(object);

    // Send message
    this.sendMessage(sourceId, targetId, 'object_transferred', { objectName });

    this.updateUI();
  }

  private updateTransferObjectList(): void {
    const sourceSelect = document.getElementById('transfer-source') as HTMLSelectElement;
    const objectSelect = document.getElementById('transfer-object') as HTMLSelectElement;

    const sourceId = sourceSelect.value;
    const sourceScene = this.scenes.get(sourceId);

    objectSelect.innerHTML = sourceScene
      ? sourceScene.objects
          .filter(obj => obj.userData.transferable)
          .map(obj => `<option value="${obj.name}">${obj.name}</option>`)
          .join('')
      : '';
  }

  // --------------------------------------------------------------------------
  // Camera Sync
  // --------------------------------------------------------------------------

  private syncCameraToAll(sourceCamera: THREE.Camera): void {
    this.scenes.forEach((scene, id) => {
      if (id !== this.activeSceneId) {
        scene.camera.position.copy(sourceCamera.position);
        scene.camera.quaternion.copy(sourceCamera.quaternion);
        scene.controls.update();
      }
    });
  }

  // --------------------------------------------------------------------------
  // Animation Loop
  // --------------------------------------------------------------------------

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    let totalObjects = 0;
    let totalTriangles = 0;
    let totalDrawCalls = 0;

    this.scenes.forEach((managedScene, sceneId) => {
      const { scene, camera, renderer, controls, paused, clock, objects, config, container } = managedScene;

      // Check visibility for auto-pause
      const isVisible = container.style.display !== 'none';
      const shouldRender = !paused && (!this.autoPauseHidden || isVisible);

      if (shouldRender) {
        const delta = clock.getDelta();

        // Update controls
        controls.update();

        // Scene-specific animations
        this.updateSceneAnimation(managedScene, delta);

        // Render
        renderer.render(scene, camera);

        // Update stats
        managedScene.stats = {
          objects: scene.children.length,
          triangles: renderer.info.render.triangles,
          drawCalls: renderer.info.render.calls,
        };
      }

      // Update status indicator
      const status = container.querySelector('.status');
      if (status) {
        status.classList.toggle('inactive', paused);
      }

      // Accumulate stats
      totalObjects += managedScene.stats.objects;
      totalTriangles += managedScene.stats.triangles;
      totalDrawCalls += managedScene.stats.drawCalls;
    });

    // Update combined stats
    this.updateGlobalStats(totalObjects, totalTriangles, totalDrawCalls);
  };

  private updateSceneAnimation(managedScene: ManagedScene, delta: number): void {
    const { config, objects, clock } = managedScene;
    const time = clock.getElapsedTime();

    switch (config.type) {
      case 'particles':
        // Animate particles
        objects.forEach(obj => {
          if (obj instanceof THREE.Points) {
            const positions = obj.geometry.attributes.position;
            const velocities = obj.userData.velocities;

            if (positions && velocities) {
              for (let i = 0; i < positions.count; i++) {
                const i3 = i * 3;
                positions.array[i3] += velocities[i3];
                positions.array[i3 + 1] += velocities[i3 + 1];
                positions.array[i3 + 2] += velocities[i3 + 2];

                // Boundary check
                const dist = Math.sqrt(
                  positions.array[i3] ** 2 +
                  positions.array[i3 + 1] ** 2 +
                  positions.array[i3 + 2] ** 2
                );

                if (dist > 15) {
                  velocities[i3] *= -1;
                  velocities[i3 + 1] *= -1;
                  velocities[i3 + 2] *= -1;
                }
              }
              positions.needsUpdate = true;
            }
          }
        });

        // Rotate emitter
        const emitter = objects.find(o => o.name === 'ParticleEmitter');
        if (emitter) {
          emitter.rotation.y = time * 0.5;
          emitter.rotation.x = Math.sin(time) * 0.3;
        }
        break;

      case 'animation':
        // Orbit spheres
        objects.forEach(obj => {
          if (obj.userData.orbitIndex !== undefined) {
            const { orbitIndex, orbitRadius, orbitSpeed } = obj.userData;
            const angle = time * orbitSpeed + (orbitIndex * Math.PI * 2) / 8;
            obj.position.x = Math.cos(angle) * orbitRadius;
            obj.position.z = Math.sin(angle) * orbitRadius;
            obj.position.y = Math.sin(time * 2 + orbitIndex) * 0.5 + 1;
            obj.rotation.x = time;
            obj.rotation.y = time * 1.5;
          }
        });

        // Rotate torus knot
        const torusKnot = objects.find(o => o.name === 'CentralTorusKnot');
        if (torusKnot) {
          torusKnot.rotation.x = time * 0.3;
          torusKnot.rotation.y = time * 0.5;
        }
        break;

      case 'environment':
        // Animate water
        const water = objects.find(o => o.name === 'WaterPlane');
        if (water) {
          water.position.y = 0.1 + Math.sin(time) * 0.05;
        }
        break;

      case 'geometry':
        // Gentle hover animation for shapes
        objects.forEach((obj, i) => {
          if (obj instanceof THREE.Mesh && obj.name.startsWith('Shape_')) {
            obj.position.y = 0.5 + Math.sin(time * 2 + i * 0.5) * 0.1;
            obj.rotation.y = time * 0.2;
          }
        });
        break;
    }
  }

  // --------------------------------------------------------------------------
  // UI Updates
  // --------------------------------------------------------------------------

  private updateUI(): void {
    this.updateSceneList();
    this.updateTransferSelects();
    this.updateTabBar();
  }

  private updateSceneList(): void {
    const list = document.getElementById('scene-list');
    if (!list) return;

    list.innerHTML = Array.from(this.scenes.entries())
      .map(([id, scene]) => {
        const isSelected = id === this.activeSceneId;
        return `
          <div class="scene-item ${isSelected ? 'selected' : ''}" data-scene="${id}">
            <div class="scene-info">
              <div class="scene-icon" style="background: ${scene.config.color}22; color: ${scene.config.color}">
                ${scene.config.icon}
              </div>
              <div>
                <div class="scene-name">${scene.config.name}</div>
                <div class="scene-stats">${scene.stats.objects} objects • ${scene.stats.triangles} tris</div>
              </div>
            </div>
            <div class="scene-actions">
              <button onclick="event.stopPropagation(); window.sceneManager.togglePauseScene('${id}')">${scene.paused ? '▶' : '⏸'}</button>
              <button onclick="event.stopPropagation(); window.sceneManager.removeSceneById('${id}')">✕</button>
            </div>
          </div>
        `;
      })
      .join('');

    // Add click handlers
    list.querySelectorAll('.scene-item').forEach(item => {
      item.addEventListener('click', () => {
        const sceneId = item.getAttribute('data-scene');
        if (sceneId) this.selectScene(sceneId);
      });
    });
  }

  private updateTransferSelects(): void {
    const sourceSelect = document.getElementById('transfer-source') as HTMLSelectElement;
    const targetSelect = document.getElementById('transfer-target') as HTMLSelectElement;

    const options = Array.from(this.scenes.entries())
      .map(([id, scene]) => `<option value="${id}">${scene.config.name}</option>`)
      .join('');

    if (sourceSelect) sourceSelect.innerHTML = options;
    if (targetSelect) targetSelect.innerHTML = options;

    this.updateTransferObjectList();
  }

  private updateTabBar(): void {
    const tabs = document.getElementById('scene-tabs');
    if (!tabs) return;

    tabs.innerHTML = Array.from(this.scenes.entries())
      .map(([id, scene]) => `
        <button class="scene-tab ${id === this.tabModeActiveScene ? 'active' : ''}" data-scene="${id}">
          ${scene.config.icon} ${scene.config.name}
        </button>
      `)
      .join('');

    tabs.querySelectorAll('.scene-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const sceneId = tab.getAttribute('data-scene');
        if (sceneId) {
          this.tabModeActiveScene = sceneId;
          this.selectScene(sceneId);
          this.updateTabVisibility();
        }
      });
    });
  }

  private updateGlobalStats(objects: number, triangles: number, drawCalls: number): void {
    const el = (id: string, value: string | number) => {
      const element = document.getElementById(id);
      if (element) element.textContent = String(value);
    };

    el('total-objects', objects);
    el('total-triangles', this.formatNumber(triangles));
    el('total-draw-calls', drawCalls);
    el('active-scenes', this.scenes.size);
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return String(num);
  }

  // --------------------------------------------------------------------------
  // Resize Handling
  // --------------------------------------------------------------------------

  private handleResize(): void {
    this.scenes.forEach(scene => this.resizeScene(scene));
  }

  private resizeScene(managedScene: ManagedScene): void {
    const { camera, renderer, container } = managedScene;

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width === 0 || height === 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  // --------------------------------------------------------------------------
  // Public API (for window binding)
  // --------------------------------------------------------------------------

  public togglePauseScene(sceneId: string): void {
    this.togglePause(sceneId);
  }

  public removeSceneById(sceneId: string): void {
    this.removeScene(sceneId);
  }
}

// ============================================================================
// Initialize
// ============================================================================

declare global {
  interface Window {
    sceneManager: MultiSceneManager;
  }
}

const manager = new MultiSceneManager();
window.sceneManager = manager;
