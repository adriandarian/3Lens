import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, interval, takeUntil } from 'rxjs';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe, DevtoolProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

/**
 * Three Scene Service
 * 
 * Manages the Three.js scene, renderer, and 3Lens integration.
 * Demonstrates:
 * - Creating and attaching a DevtoolProbe
 * - Scene setup with lights, objects, and controls
 * - Providing reactive metrics via RxJS
 */
@Injectable({
  providedIn: 'root'
})
export class ThreeSceneService implements OnDestroy {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private probe!: DevtoolProbe;
  private clock = new THREE.Clock();
  
  private destroy$ = new Subject<void>();
  
  // Animated objects
  private rotatingBox!: THREE.Mesh;
  private bouncingSphere!: THREE.Mesh;
  private torusGroup!: THREE.Group;
  
  // Reactive metrics
  private fpsSubject = new BehaviorSubject<number>(0);
  private drawCallsSubject = new BehaviorSubject<number>(0);
  private trianglesSubject = new BehaviorSubject<number>(0);
  
  fps$ = this.fpsSubject.asObservable();
  drawCalls$ = this.drawCallsSubject.asObservable();
  triangles$ = this.trianglesSubject.asObservable();

  constructor() {}

  /**
   * Initialize the Three.js scene with the given canvas
   */
  initialize(canvas: HTMLCanvasElement): void {
    this.createScene();
    this.createRenderer(canvas);
    this.createCamera();
    this.createControls();
    this.createLights();
    this.createObjects();
    this.setupProbe();
    this.startMetricsUpdate();
    
    // Handle window resize
    window.addEventListener('resize', this.onResize);
  }

  /**
   * Render the scene
   */
  render(): void {
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();
    
    this.updateAnimations(delta, elapsed);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    window.removeEventListener('resize', this.onResize);
    
    if (this.probe) {
      this.probe.dispose();
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    if (this.controls) {
      this.controls.dispose();
    }
  }

  ngOnDestroy(): void {
    this.dispose();
  }

  private createScene(): void {
    this.scene = new THREE.Scene();
    this.scene.name = 'MainScene';
    this.scene.background = new THREE.Color(0x0a0a0f);
    this.scene.fog = new THREE.Fog(0x0a0a0f, 10, 50);
  }

  private createRenderer(canvas: HTMLCanvasElement): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }

  private createCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(5, 5, 8);
    this.camera.name = 'MainCamera';
  }

  private createControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 20;
  }

  private createLights(): void {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    ambient.name = 'AmbientLight';
    this.scene.add(ambient);

    // Directional light with shadows
    const directional = new THREE.DirectionalLight(0xffffff, 1.5);
    directional.name = 'DirectionalLight';
    directional.position.set(5, 10, 5);
    directional.castShadow = true;
    directional.shadow.mapSize.width = 2048;
    directional.shadow.mapSize.height = 2048;
    directional.shadow.camera.near = 0.5;
    directional.shadow.camera.far = 50;
    directional.shadow.camera.left = -10;
    directional.shadow.camera.right = 10;
    directional.shadow.camera.top = 10;
    directional.shadow.camera.bottom = -10;
    this.scene.add(directional);

    // Point light
    const point = new THREE.PointLight(0xff7f50, 0.5, 20);
    point.name = 'AccentPointLight';
    point.position.set(-3, 3, 2);
    this.scene.add(point);
  }

  private createObjects(): void {
    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.name = 'Ground';
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Rotating box
    const boxGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: 0x4ecdc4,
      roughness: 0.3,
      metalness: 0.5
    });
    this.rotatingBox = new THREE.Mesh(boxGeometry, boxMaterial);
    this.rotatingBox.name = 'RotatingBox';
    this.rotatingBox.position.set(-2, 1, 0);
    this.rotatingBox.castShadow = true;
    this.scene.add(this.rotatingBox);

    // Bouncing sphere
    const sphereGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const sphereMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x9b59b6,
      roughness: 0.1,
      metalness: 0.8,
      clearcoat: 1,
      clearcoatRoughness: 0.1
    });
    this.bouncingSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.bouncingSphere.name = 'BouncingSphere';
    this.bouncingSphere.position.set(2, 1, 0);
    this.bouncingSphere.castShadow = true;
    this.scene.add(this.bouncingSphere);

    // Torus group
    this.torusGroup = new THREE.Group();
    this.torusGroup.name = 'TorusGroup';
    this.torusGroup.position.set(0, 2, -2);
    
    const torusGeometry = new THREE.TorusGeometry(0.5, 0.15, 16, 32);
    const colors = [0xe74c3c, 0x2ecc71, 0x3498db];
    const positions = [
      [1.5, 0, 0],
      [-0.75, 1.3, 0],
      [-0.75, -1.3, 0]
    ];
    
    colors.forEach((color, i) => {
      const material = new THREE.MeshStandardMaterial({ color, roughness: 0.4 });
      const torus = new THREE.Mesh(torusGeometry, material);
      torus.name = `Torus_${['Red', 'Green', 'Blue'][i]}`;
      torus.position.set(positions[i][0], positions[i][1], positions[i][2]);
      torus.castShadow = true;
      this.torusGroup.add(torus);
    });
    
    this.scene.add(this.torusGroup);
  }

  private setupProbe(): void {
    this.probe = createProbe({
      appName: 'Angular Three.js Example',
    });
    
    // Observe renderer and scene
    this.probe.observeRenderer(this.renderer);
    this.probe.observeScene(this.scene);
    
    // Create the overlay
    createOverlay(this.probe);
  }

  private startMetricsUpdate(): void {
    // Update metrics every 100ms
    interval(100)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const info = this.renderer.info;
        this.drawCallsSubject.next(info.render.calls);
        this.trianglesSubject.next(info.render.triangles);
      });

    // Update FPS every frame (smoothed)
    let lastTime = performance.now();
    let frameCount = 0;
    
    const updateFps = () => {
      frameCount++;
      const now = performance.now();
      const elapsed = now - lastTime;
      
      if (elapsed >= 1000) {
        this.fpsSubject.next(Math.round((frameCount * 1000) / elapsed));
        frameCount = 0;
        lastTime = now;
      }
      
      requestAnimationFrame(updateFps);
    };
    
    updateFps();
  }

  private updateAnimations(delta: number, elapsed: number): void {
    // Rotate box
    if (this.rotatingBox) {
      this.rotatingBox.rotation.x += delta * 0.5;
      this.rotatingBox.rotation.y += delta * 0.3;
    }

    // Bounce sphere
    if (this.bouncingSphere) {
      this.bouncingSphere.position.y = 1 + Math.abs(Math.sin(elapsed * 2)) * 0.5;
      this.bouncingSphere.rotation.z = Math.sin(elapsed) * 0.2;
    }

    // Rotate torus group and individual toruses
    if (this.torusGroup) {
      this.torusGroup.rotation.y = elapsed * 0.3;
      
      this.torusGroup.children.forEach((child, i) => {
        child.rotation.x = elapsed * 2 + (i * Math.PI * 0.66);
      });
    }
  }

  private onResize = (): void => {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  };
}

