import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe, DevtoolProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// ============================================================================
// Noise Functions
// ============================================================================

class SimplexNoise {
  private perm: number[] = [];
  private grad3: number[][] = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
  ];

  constructor(seed: number = 0) {
    this.setSeed(seed);
  }

  setSeed(seed: number): void {
    const p: number[] = [];
    for (let i = 0; i < 256; i++) p[i] = i;

    // Seeded shuffle
    let n = seed;
    for (let i = 255; i > 0; i--) {
      n = (n * 16807) % 2147483647;
      const j = n % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }

    this.perm = [];
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
    }
  }

  private dot(g: number[], x: number, y: number): number {
    return g[0] * x + g[1] * y;
  }

  noise2D(x: number, y: number): number {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;

    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);

    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = x - X0;
    const y0 = y - Y0;

    let i1: number, j1: number;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;

    const ii = i & 255;
    const jj = j & 255;

    const gi0 = this.perm[ii + this.perm[jj]] % 12;
    const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
    const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;

    let n0 = 0, n1 = 0, n2 = 0;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
    }

    return 70 * (n0 + n1 + n2);
  }

  fbm(x: number, y: number, octaves: number, persistence: number, lacunarity: number): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += amplitude * this.noise2D(x * frequency, y * frequency);
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return value / maxValue;
  }
}

// ============================================================================
// Types
// ============================================================================

type GeneratorType = 'terrain' | 'caves' | 'city' | 'dungeon';
type GenerationMode = 'realtime' | 'chunked' | 'lod';
type ColorScheme = 'natural' | 'desert' | 'alien' | 'volcanic' | 'arctic' | 'grayscale';

interface GenerationParams {
  seed: number;
  heightScale: number;
  octaves: number;
  frequency: number;
  persistence: number;
  lacunarity: number;
}

interface ChunkData {
  x: number;
  z: number;
  mesh: THREE.Mesh;
  lod: number;
  vertices: number;
  triangles: number;
}

interface GenerationResult {
  vertices: number;
  triangles: number;
  chunks: number;
  generationTime: number;
}

interface HistoryEntry {
  seed: number;
  generator: GeneratorType;
  timestamp: Date;
  result: GenerationResult;
}

// ============================================================================
// Color Schemes
// ============================================================================

const COLOR_SCHEMES: Record<ColorScheme, { stops: [number, THREE.Color][] }> = {
  natural: {
    stops: [
      [0.0, new THREE.Color(0x1e3a5f)],   // Deep water
      [0.3, new THREE.Color(0x3b82f6)],   // Shallow water
      [0.35, new THREE.Color(0xd4a574)],  // Sand
      [0.4, new THREE.Color(0x228b22)],   // Grass
      [0.6, new THREE.Color(0x355e3b)],   // Forest
      [0.75, new THREE.Color(0x6b7280)],  // Rock
      [0.9, new THREE.Color(0xffffff)],   // Snow
    ],
  },
  desert: {
    stops: [
      [0.0, new THREE.Color(0x8b7355)],
      [0.3, new THREE.Color(0xd4a574)],
      [0.5, new THREE.Color(0xf5deb3)],
      [0.7, new THREE.Color(0xdaa520)],
      [0.9, new THREE.Color(0x8b4513)],
    ],
  },
  alien: {
    stops: [
      [0.0, new THREE.Color(0x1a0a2e)],
      [0.25, new THREE.Color(0x8b5cf6)],
      [0.5, new THREE.Color(0x06b6d4)],
      [0.75, new THREE.Color(0xf43f5e)],
      [1.0, new THREE.Color(0xfbbf24)],
    ],
  },
  volcanic: {
    stops: [
      [0.0, new THREE.Color(0x1a1a1a)],
      [0.3, new THREE.Color(0x374151)],
      [0.5, new THREE.Color(0xef4444)],
      [0.7, new THREE.Color(0xf59e0b)],
      [0.9, new THREE.Color(0xfbbf24)],
    ],
  },
  arctic: {
    stops: [
      [0.0, new THREE.Color(0x1e3a8a)],
      [0.3, new THREE.Color(0x3b82f6)],
      [0.5, new THREE.Color(0x93c5fd)],
      [0.7, new THREE.Color(0xe0f2fe)],
      [1.0, new THREE.Color(0xffffff)],
    ],
  },
  grayscale: {
    stops: [
      [0.0, new THREE.Color(0x111111)],
      [0.5, new THREE.Color(0x666666)],
      [1.0, new THREE.Color(0xffffff)],
    ],
  },
};

// ============================================================================
// Procedural Generator
// ============================================================================

class ProceduralGenerator {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private probe!: DevtoolProbe;
  private overlay!: ReturnType<typeof createOverlay>;
  private noise!: SimplexNoise;

  private generatorType: GeneratorType = 'terrain';
  private generationMode: GenerationMode = 'realtime';
  private colorScheme: ColorScheme = 'natural';
  private params: GenerationParams = {
    seed: 42,
    heightScale: 15,
    octaves: 6,
    frequency: 0.02,
    persistence: 0.5,
    lacunarity: 2.0,
  };

  private chunks: Map<string, ChunkData> = new Map();
  private history: HistoryEntry[] = [];
  private terrainGroup: THREE.Group;
  private debugHelpers: THREE.Group;

  private debugOptions = {
    normals: false,
    wireframe: false,
    chunks: false,
    heightmap: false,
    noise: false,
    lodColors: false,
  };

  private chunkSize = 32;
  private viewDistance = 2;

  constructor() {
    this.noise = new SimplexNoise(this.params.seed);
    this.terrainGroup = new THREE.Group();
    this.terrainGroup.name = 'TerrainGroup';
    this.debugHelpers = new THREE.Group();
    this.debugHelpers.name = 'DebugHelpers';

    this.initScene();
    this.initDevtools();
    this.setupEventListeners();
    this.generate();
    this.animate();
  }

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------

  private initScene(): void {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0f);
    this.scene.fog = new THREE.Fog(0x0a0a0f, 50, 150);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(40, 30, 40);

    // Renderer
    const container = document.getElementById('canvas-container')!;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.1;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.5);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    this.scene.add(sunLight);

    // Add groups to scene
    this.scene.add(this.terrainGroup);
    this.scene.add(this.debugHelpers);

    // Resize handler
    window.addEventListener('resize', () => this.handleResize());
  }

  private initDevtools(): void {
    this.probe = createProbe({
      appName: 'Procedural Generation Debugger',
      debug: false,
    });

    this.probe.observeScene(this.scene);
    this.probe.observeRenderer(this.renderer);

    this.overlay = createOverlay(this.probe);
  }

  private setupEventListeners(): void {
    // Generator tabs
    document.querySelectorAll('.generator-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.generator-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.generatorType = tab.getAttribute('data-generator') as GeneratorType;
        this.generate();
      });
    });

    // Seed controls
    document.getElementById('seed-input')?.addEventListener('change', (e) => {
      this.params.seed = parseInt((e.target as HTMLInputElement).value) || 0;
    });

    document.getElementById('random-seed')?.addEventListener('click', () => {
      this.params.seed = Math.floor(Math.random() * 1000000);
      (document.getElementById('seed-input') as HTMLInputElement).value = String(this.params.seed);
      this.generate();
    });

    document.getElementById('copy-seed')?.addEventListener('click', () => {
      navigator.clipboard.writeText(String(this.params.seed));
    });

    // Sliders
    this.setupSlider('height-scale', 'height-value', v => {
      this.params.heightScale = v;
      return v.toString();
    });

    this.setupSlider('octaves', 'octaves-value', v => {
      this.params.octaves = v;
      return v.toString();
    });

    this.setupSlider('frequency', 'frequency-value', v => {
      this.params.frequency = v / 1000;
      return (v / 1000).toFixed(3);
    });

    this.setupSlider('persistence', 'persistence-value', v => {
      this.params.persistence = v / 100;
      return (v / 100).toFixed(2);
    });

    this.setupSlider('lacunarity', 'lacunarity-value', v => {
      this.params.lacunarity = v / 10;
      return (v / 10).toFixed(1);
    });

    // Color schemes
    document.querySelectorAll('.color-scheme').forEach(scheme => {
      scheme.addEventListener('click', () => {
        document.querySelectorAll('.color-scheme').forEach(s => s.classList.remove('active'));
        scheme.classList.add('active');
        this.colorScheme = scheme.getAttribute('data-scheme') as ColorScheme;
        this.updateColors();
      });
    });

    // Generation mode
    document.querySelectorAll('.mode-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.mode-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        this.generationMode = option.getAttribute('data-mode') as GenerationMode;
        this.generate();
      });
    });

    // Debug toggles
    this.setupDebugToggle('debug-normals', 'normals');
    this.setupDebugToggle('debug-wireframe', 'wireframe');
    this.setupDebugToggle('debug-chunks', 'chunks');
    this.setupDebugToggle('debug-heightmap', 'heightmap');
    this.setupDebugToggle('debug-noise', 'noise');
    this.setupDebugToggle('debug-lod', 'lodColors');

    // Buttons
    document.getElementById('generate-btn')?.addEventListener('click', () => this.generate());
    document.getElementById('export-btn')?.addEventListener('click', () => this.exportMesh());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Initialize chunk grid
    this.initChunkGrid();
  }

  private setupSlider(sliderId: string, valueId: string, transformer: (v: number) => string): void {
    const slider = document.getElementById(sliderId) as HTMLInputElement;
    const valueEl = document.getElementById(valueId);

    if (slider && valueEl) {
      slider.addEventListener('input', () => {
        valueEl.textContent = transformer(parseInt(slider.value));
      });

      slider.addEventListener('change', () => {
        this.generate();
      });
    }
  }

  private setupDebugToggle(inputId: string, option: keyof typeof this.debugOptions): void {
    const label = document.querySelector(`label:has(#${inputId})`);
    label?.addEventListener('click', () => {
      label.classList.toggle('active');
      this.debugOptions[option] = label.classList.contains('active');
      this.updateDebugVisualization();
    });
  }

  private initChunkGrid(): void {
    const grid = document.getElementById('chunk-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const gridSize = 5;

    for (let z = 0; z < gridSize; z++) {
      for (let x = 0; x < gridSize; x++) {
        const cell = document.createElement('div');
        cell.className = 'chunk-cell';
        cell.dataset.x = String(x - Math.floor(gridSize / 2));
        cell.dataset.z = String(z - Math.floor(gridSize / 2));
        cell.textContent = `${x},${z}`;
        cell.addEventListener('click', () => {
          cell.classList.toggle('active');
        });
        grid.appendChild(cell);
      }
    }
  }

  private handleKeyboard(e: KeyboardEvent): void {
    if (e.target instanceof HTMLInputElement) return;

    switch (e.key) {
      case ' ':
        e.preventDefault();
        this.generate();
        break;
      case 'r':
      case 'R':
        this.params.seed = Math.floor(Math.random() * 1000000);
        (document.getElementById('seed-input') as HTMLInputElement).value = String(this.params.seed);
        this.generate();
        break;
      case 'w':
      case 'W':
        this.toggleDebug('wireframe');
        break;
      case 'n':
      case 'N':
        this.toggleDebug('normals');
        break;
      case 'c':
      case 'C':
        this.toggleDebug('chunks');
        break;
      case '1':
        this.setGenerator('terrain');
        break;
      case '2':
        this.setGenerator('caves');
        break;
      case '3':
        this.setGenerator('city');
        break;
      case '4':
        this.setGenerator('dungeon');
        break;
      case 'd':
      case 'D':
        this.overlay?.toggle();
        break;
    }
  }

  private toggleDebug(option: keyof typeof this.debugOptions): void {
    const label = document.querySelector(`label:has(#debug-${option})`) as HTMLElement | null;
    label?.click();
  }

  private setGenerator(type: GeneratorType): void {
    document.querySelectorAll('.generator-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-generator') === type);
    });
    this.generatorType = type;
    this.generate();
  }

  // --------------------------------------------------------------------------
  // Generation
  // --------------------------------------------------------------------------

  public generate(): void {
    const startTime = performance.now();

    // Update noise seed
    this.noise.setSeed(this.params.seed);

    // Clear existing terrain
    this.clearTerrain();

    // Generate based on type
    let result: GenerationResult;

    switch (this.generatorType) {
      case 'terrain':
        result = this.generateTerrain();
        break;
      case 'caves':
        result = this.generateCaves();
        break;
      case 'city':
        result = this.generateCity();
        break;
      case 'dungeon':
        result = this.generateDungeon();
        break;
      default:
        result = this.generateTerrain();
    }

    result.generationTime = performance.now() - startTime;

    // Add to history
    this.addToHistory(result);

    // Update stats
    this.updateStats(result);

    // Update debug visualization
    this.updateDebugVisualization();
  }

  private clearTerrain(): void {
    while (this.terrainGroup.children.length > 0) {
      const child = this.terrainGroup.children[0];
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
      this.terrainGroup.remove(child);
    }
    this.chunks.clear();

    // Clear debug helpers
    while (this.debugHelpers.children.length > 0) {
      const child = this.debugHelpers.children[0];
      if (child instanceof THREE.LineSegments || child instanceof THREE.Line) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
      this.debugHelpers.remove(child);
    }
  }

  private generateTerrain(): GenerationResult {
    const { heightScale, octaves, frequency, persistence, lacunarity } = this.params;
    const size = this.generationMode === 'chunked' ? this.chunkSize : 100;
    const resolution = this.generationMode === 'lod' ? 50 : 100;

    let totalVertices = 0;
    let totalTriangles = 0;
    let chunkCount = 0;

    if (this.generationMode === 'chunked') {
      // Generate multiple chunks
      for (let cz = -this.viewDistance; cz <= this.viewDistance; cz++) {
        for (let cx = -this.viewDistance; cx <= this.viewDistance; cx++) {
          const chunk = this.generateTerrainChunk(cx, cz, size, resolution / 2);
          totalVertices += chunk.vertices;
          totalTriangles += chunk.triangles;
          chunkCount++;
        }
      }
    } else {
      // Single terrain
      const geometry = new THREE.PlaneGeometry(size, size, resolution, resolution);
      geometry.rotateX(-Math.PI / 2);

      const positions = geometry.attributes.position;
      const colors: number[] = [];

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);

        const height = this.noise.fbm(
          x * frequency,
          z * frequency,
          octaves,
          persistence,
          lacunarity
        );

        const normalizedHeight = (height + 1) / 2;
        positions.setY(i, normalizedHeight * heightScale);

        // Apply color based on height
        const color = this.getColorForHeight(normalizedHeight);
        colors.push(color.r, color.g, color.b);
      }

      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.computeVertexNormals();

      const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: false,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = 'Terrain';
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.generator = 'terrain';
      mesh.userData.seed = this.params.seed;

      this.terrainGroup.add(mesh);

      totalVertices = positions.count;
      totalTriangles = (geometry.index?.count || 0) / 3;
      chunkCount = 1;
    }

    // Update chunk grid UI
    this.updateChunkGridUI();

    return { vertices: totalVertices, triangles: totalTriangles, chunks: chunkCount, generationTime: 0 };
  }

  private generateTerrainChunk(cx: number, cz: number, size: number, resolution: number): ChunkData {
    const { heightScale, octaves, frequency, persistence, lacunarity } = this.params;

    // Calculate LOD based on distance from center
    const distFromCenter = Math.sqrt(cx * cx + cz * cz);
    const lod = Math.min(3, Math.floor(distFromCenter));
    const lodResolution = Math.max(8, resolution / (lod + 1));

    const geometry = new THREE.PlaneGeometry(size, size, lodResolution, lodResolution);
    geometry.rotateX(-Math.PI / 2);

    const positions = geometry.attributes.position;
    const colors: number[] = [];
    const offsetX = cx * size;
    const offsetZ = cz * size;

    for (let i = 0; i < positions.count; i++) {
      const localX = positions.getX(i);
      const localZ = positions.getZ(i);
      const worldX = localX + offsetX;
      const worldZ = localZ + offsetZ;

      const height = this.noise.fbm(
        worldX * frequency,
        worldZ * frequency,
        octaves,
        persistence,
        lacunarity
      );

      const normalizedHeight = (height + 1) / 2;
      positions.setY(i, normalizedHeight * heightScale);

      // Color based on LOD if debug enabled, otherwise height
      if (this.debugOptions.lodColors) {
        const lodColors = [
          new THREE.Color(0x10b981),
          new THREE.Color(0x3b82f6),
          new THREE.Color(0xf59e0b),
          new THREE.Color(0xef4444),
        ];
        const color = lodColors[lod];
        colors.push(color.r, color.g, color.b);
      } else {
        const color = this.getColorForHeight(normalizedHeight);
        colors.push(color.r, color.g, color.b);
      }
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: this.debugOptions.lodColors,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(offsetX, 0, offsetZ);
    mesh.name = `Chunk_${cx}_${cz}`;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.chunk = { x: cx, z: cz, lod };

    this.terrainGroup.add(mesh);

    const chunkData: ChunkData = {
      x: cx,
      z: cz,
      mesh,
      lod,
      vertices: positions.count,
      triangles: (geometry.index?.count || 0) / 3,
    };

    this.chunks.set(`${cx},${cz}`, chunkData);

    return chunkData;
  }

  private generateCaves(): GenerationResult {
    const size = 60;
    const resolution = 30;
    const { octaves, frequency, persistence, lacunarity } = this.params;

    // Create isosurface-like cave structure using marching cubes approximation
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const colors: number[] = [];
    const threshold = 0.3;

    for (let x = 0; x < resolution; x++) {
      for (let y = 0; y < resolution / 2; y++) {
        for (let z = 0; z < resolution; z++) {
          const worldX = (x / resolution - 0.5) * size;
          const worldY = (y / (resolution / 2)) * size / 2;
          const worldZ = (z / resolution - 0.5) * size;

          const noise3D = this.noise.fbm(worldX * frequency, worldZ * frequency, octaves, persistence, lacunarity);
          const noise3D2 = this.noise.fbm(worldY * frequency + 100, worldX * frequency, octaves, persistence, lacunarity);
          const combined = (noise3D + noise3D2) / 2;

          if (Math.abs(combined) < threshold) {
            // Add cube at this position
            const cubeSize = size / resolution;
            this.addCube(vertices, worldX, worldY, worldZ, cubeSize * 0.9);

            // Color based on depth
            const depth = worldY / (size / 2);
            const color = new THREE.Color().setHSL(0.1 + depth * 0.2, 0.6, 0.4 + depth * 0.3);
            for (let i = 0; i < 36; i++) {
              colors.push(color.r, color.g, color.b);
            }
          }
        }
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'CaveSystem';
    mesh.userData.generator = 'caves';

    this.terrainGroup.add(mesh);

    return {
      vertices: vertices.length / 3,
      triangles: vertices.length / 9,
      chunks: 1,
      generationTime: 0,
    };
  }

  private generateCity(): GenerationResult {
    const gridSize = 10;
    const blockSize = 8;
    const { heightScale, frequency } = this.params;
    let totalVertices = 0;
    let totalTriangles = 0;

    // Create ground plane
    const groundGeometry = new THREE.PlaneGeometry(gridSize * blockSize, gridSize * blockSize);
    groundGeometry.rotateX(-Math.PI / 2);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.receiveShadow = true;
    ground.name = 'CityGround';
    this.terrainGroup.add(ground);

    // Generate buildings
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        // Use noise to determine if there's a building and its height
        const noiseValue = this.noise.noise2D(x * frequency * 10, z * frequency * 10);

        if (noiseValue > -0.3) {
          const height = (noiseValue + 1) * heightScale * 0.5 + 2;
          const width = 2 + Math.random() * 3;
          const depth = 2 + Math.random() * 3;

          const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
          const buildingMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.6, 0.1, 0.3 + Math.random() * 0.3),
          });

          const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
          building.position.set(
            (x - gridSize / 2) * blockSize + blockSize / 2,
            height / 2,
            (z - gridSize / 2) * blockSize + blockSize / 2
          );
          building.castShadow = true;
          building.receiveShadow = true;
          building.name = `Building_${x}_${z}`;
          building.userData.buildingData = { x, z, height, width, depth };

          this.terrainGroup.add(building);

          totalVertices += buildingGeometry.attributes.position.count;
          totalTriangles += (buildingGeometry.index?.count || 0) / 3;
        }
      }
    }

    // Add roads
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });

    for (let i = 0; i <= gridSize; i++) {
      // Horizontal roads
      const hRoad = new THREE.Mesh(
        new THREE.PlaneGeometry(gridSize * blockSize, 1.5),
        roadMaterial
      );
      hRoad.rotation.x = -Math.PI / 2;
      hRoad.position.set(0, 0.01, (i - gridSize / 2) * blockSize);
      hRoad.name = `Road_H_${i}`;
      this.terrainGroup.add(hRoad);

      // Vertical roads
      const vRoad = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, gridSize * blockSize),
        roadMaterial
      );
      vRoad.rotation.x = -Math.PI / 2;
      vRoad.position.set((i - gridSize / 2) * blockSize, 0.01, 0);
      vRoad.name = `Road_V_${i}`;
      this.terrainGroup.add(vRoad);
    }

    return {
      vertices: totalVertices,
      triangles: totalTriangles,
      chunks: gridSize * gridSize,
      generationTime: 0,
    };
  }

  private generateDungeon(): GenerationResult {
    const gridSize = 20;
    const cellSize = 4;
    const wallHeight = 3;
    let totalVertices = 0;
    let totalTriangles = 0;

    // Generate dungeon layout using cellular automata
    const grid: boolean[][] = [];

    // Initialize with noise
    for (let x = 0; x < gridSize; x++) {
      grid[x] = [];
      for (let z = 0; z < gridSize; z++) {
        const noise = this.noise.noise2D(x * 0.2, z * 0.2);
        grid[x][z] = noise > 0;
      }
    }

    // Apply cellular automata rules
    for (let iteration = 0; iteration < 4; iteration++) {
      const newGrid: boolean[][] = [];
      for (let x = 0; x < gridSize; x++) {
        newGrid[x] = [];
        for (let z = 0; z < gridSize; z++) {
          const neighbors = this.countNeighbors(grid, x, z, gridSize);
          newGrid[x][z] = neighbors >= 5 || (grid[x][z] && neighbors >= 4);
        }
      }
      for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
          grid[x][z] = newGrid[x][z];
        }
      }
    }

    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(gridSize * cellSize, gridSize * cellSize);
    floorGeometry.rotateX(-Math.PI / 2);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      roughness: 0.9,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    floor.name = 'DungeonFloor';
    this.terrainGroup.add(floor);

    // Create walls
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x6b6b6b,
      roughness: 0.8,
    });

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        if (grid[x][z]) {
          const wallGeometry = new THREE.BoxGeometry(cellSize, wallHeight, cellSize);
          const wall = new THREE.Mesh(wallGeometry, wallMaterial);
          wall.position.set(
            (x - gridSize / 2) * cellSize + cellSize / 2,
            wallHeight / 2,
            (z - gridSize / 2) * cellSize + cellSize / 2
          );
          wall.castShadow = true;
          wall.receiveShadow = true;
          wall.name = `Wall_${x}_${z}`;
          this.terrainGroup.add(wall);

          totalVertices += wallGeometry.attributes.position.count;
          totalTriangles += (wallGeometry.index?.count || 0) / 3;
        }
      }
    }

    return {
      vertices: totalVertices,
      triangles: totalTriangles,
      chunks: 1,
      generationTime: 0,
    };
  }

  private countNeighbors(grid: boolean[][], x: number, z: number, size: number): number {
    let count = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (dx === 0 && dz === 0) continue;
        const nx = x + dx;
        const nz = z + dz;
        if (nx < 0 || nx >= size || nz < 0 || nz >= size || grid[nx][nz]) {
          count++;
        }
      }
    }
    return count;
  }

  private addCube(vertices: number[], x: number, y: number, z: number, size: number): void {
    const h = size / 2;
    // Front
    vertices.push(x - h, y - h, z + h, x + h, y - h, z + h, x + h, y + h, z + h);
    vertices.push(x - h, y - h, z + h, x + h, y + h, z + h, x - h, y + h, z + h);
    // Back
    vertices.push(x + h, y - h, z - h, x - h, y - h, z - h, x - h, y + h, z - h);
    vertices.push(x + h, y - h, z - h, x - h, y + h, z - h, x + h, y + h, z - h);
    // Top
    vertices.push(x - h, y + h, z + h, x + h, y + h, z + h, x + h, y + h, z - h);
    vertices.push(x - h, y + h, z + h, x + h, y + h, z - h, x - h, y + h, z - h);
    // Bottom
    vertices.push(x - h, y - h, z - h, x + h, y - h, z - h, x + h, y - h, z + h);
    vertices.push(x - h, y - h, z - h, x + h, y - h, z + h, x - h, y - h, z + h);
    // Right
    vertices.push(x + h, y - h, z + h, x + h, y - h, z - h, x + h, y + h, z - h);
    vertices.push(x + h, y - h, z + h, x + h, y + h, z - h, x + h, y + h, z + h);
    // Left
    vertices.push(x - h, y - h, z - h, x - h, y - h, z + h, x - h, y + h, z + h);
    vertices.push(x - h, y - h, z - h, x - h, y + h, z + h, x - h, y + h, z - h);
  }

  // --------------------------------------------------------------------------
  // Color & Visual Helpers
  // --------------------------------------------------------------------------

  private getColorForHeight(normalizedHeight: number): THREE.Color {
    const scheme = COLOR_SCHEMES[this.colorScheme];
    const stops = scheme.stops;

    // Find the two stops to interpolate between
    for (let i = 0; i < stops.length - 1; i++) {
      const [h1, c1] = stops[i];
      const [h2, c2] = stops[i + 1];

      if (normalizedHeight >= h1 && normalizedHeight <= h2) {
        const t = (normalizedHeight - h1) / (h2 - h1);
        return new THREE.Color().lerpColors(c1, c2, t);
      }
    }

    return stops[stops.length - 1][1].clone();
  }

  private updateColors(): void {
    this.terrainGroup.traverse(obj => {
      if (obj instanceof THREE.Mesh && obj.geometry.attributes.position) {
        const positions = obj.geometry.attributes.position;
        const colors: number[] = [];

        // Get max height for normalization
        let maxY = 0;
        for (let i = 0; i < positions.count; i++) {
          maxY = Math.max(maxY, positions.getY(i));
        }

        for (let i = 0; i < positions.count; i++) {
          const y = positions.getY(i);
          const normalizedHeight = maxY > 0 ? y / maxY : 0;
          const color = this.getColorForHeight(normalizedHeight);
          colors.push(color.r, color.g, color.b);
        }

        obj.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        (obj.material as THREE.MeshStandardMaterial).vertexColors = true;
        (obj.material as THREE.MeshStandardMaterial).needsUpdate = true;
      }
    });
  }

  private updateDebugVisualization(): void {
    // Clear existing debug helpers
    while (this.debugHelpers.children.length > 0) {
      const child = this.debugHelpers.children[0];
      if (child instanceof THREE.LineSegments || child instanceof THREE.Line) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
      this.debugHelpers.remove(child);
    }

    // Wireframe
    this.terrainGroup.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        (obj.material as THREE.MeshStandardMaterial).wireframe = this.debugOptions.wireframe;
      }
    });

    // Normals visualization
    if (this.debugOptions.normals) {
      this.terrainGroup.traverse(obj => {
        if (obj instanceof THREE.Mesh && obj.geometry.attributes.normal) {
          const positions = obj.geometry.attributes.position;
          const normals = obj.geometry.attributes.normal;
          const vertices: number[] = [];

          const step = Math.max(1, Math.floor(positions.count / 500));

          for (let i = 0; i < positions.count; i += step) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            const nx = normals.getX(i);
            const ny = normals.getY(i);
            const nz = normals.getZ(i);

            vertices.push(x, y, z);
            vertices.push(x + nx * 0.5, y + ny * 0.5, z + nz * 0.5);
          }

          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

          const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
          const lines = new THREE.LineSegments(geometry, material);
          lines.position.copy(obj.position);
          this.debugHelpers.add(lines);
        }
      });
    }

    // Chunk bounds
    if (this.debugOptions.chunks && this.generationMode === 'chunked') {
      this.chunks.forEach(chunk => {
        const box = new THREE.Box3().setFromObject(chunk.mesh);
        const helper = new THREE.Box3Helper(box, new THREE.Color(0x3b82f6));
        this.debugHelpers.add(helper);
      });
    }
  }

  private updateChunkGridUI(): void {
    const cells = document.querySelectorAll('.chunk-cell');
    cells.forEach(cell => {
      const x = parseInt(cell.getAttribute('data-x') || '0');
      const z = parseInt(cell.getAttribute('data-z') || '0');
      const key = `${x},${z}`;

      cell.classList.remove('loaded', 'active');
      if (this.chunks.has(key)) {
        cell.classList.add('loaded');
      }
    });

    // Update progress bar
    const totalChunks = (this.viewDistance * 2 + 1) ** 2;
    const loadedChunks = this.chunks.size;
    const progress = (loadedChunks / totalChunks) * 100;
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }
  }

  // --------------------------------------------------------------------------
  // History & Stats
  // --------------------------------------------------------------------------

  private addToHistory(result: GenerationResult): void {
    const entry: HistoryEntry = {
      seed: this.params.seed,
      generator: this.generatorType,
      timestamp: new Date(),
      result,
    };

    this.history.unshift(entry);
    if (this.history.length > 20) this.history.pop();

    this.updateHistoryUI();
  }

  private updateHistoryUI(): void {
    const list = document.getElementById('history-list');
    if (!list) return;

    list.innerHTML = this.history
      .slice(0, 10)
      .map((entry, index) => {
        const time = entry.timestamp.toLocaleTimeString();
        return `
          <div class="history-item ${index === 0 ? 'active' : ''}" data-seed="${entry.seed}">
            <div>
              <span class="history-seed">#${entry.seed}</span>
              <span style="margin-left: 8px; color: #64748b">${entry.generator}</span>
            </div>
            <span class="history-time">${time}</span>
          </div>
        `;
      })
      .join('');

    // Add click handlers
    list.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const seed = parseInt(item.getAttribute('data-seed') || '0');
        this.params.seed = seed;
        (document.getElementById('seed-input') as HTMLInputElement).value = String(seed);
        this.generate();
      });
    });
  }

  private updateStats(result: GenerationResult): void {
    document.getElementById('stat-vertices')!.textContent = this.formatNumber(result.vertices);
    document.getElementById('stat-triangles')!.textContent = this.formatNumber(result.triangles);
    document.getElementById('stat-chunks')!.textContent = String(result.chunks);
    document.getElementById('stat-gen-time')!.textContent = `${result.generationTime.toFixed(1)}ms`;
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return String(num);
  }

  // --------------------------------------------------------------------------
  // Export
  // --------------------------------------------------------------------------

  private exportMesh(): void {
    // Simple OBJ export
    let obj = '# Procedural Generation Export\n';
    obj += `# Seed: ${this.params.seed}\n`;
    obj += `# Generator: ${this.generatorType}\n\n`;

    let vertexOffset = 1;

    this.terrainGroup.traverse(child => {
      if (child instanceof THREE.Mesh) {
        const positions = child.geometry.attributes.position;
        obj += `o ${child.name}\n`;

        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i) + child.position.x;
          const y = positions.getY(i) + child.position.y;
          const z = positions.getZ(i) + child.position.z;
          obj += `v ${x.toFixed(4)} ${y.toFixed(4)} ${z.toFixed(4)}\n`;
        }

        const indices = child.geometry.index;
        if (indices) {
          for (let i = 0; i < indices.count; i += 3) {
            const a = indices.getX(i) + vertexOffset;
            const b = indices.getX(i + 1) + vertexOffset;
            const c = indices.getX(i + 2) + vertexOffset;
            obj += `f ${a} ${b} ${c}\n`;
          }
        }

        vertexOffset += positions.count;
      }
    });

    // Download
    const blob = new Blob([obj], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `procedural_${this.generatorType}_${this.params.seed}.obj`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --------------------------------------------------------------------------
  // Animation Loop
  // --------------------------------------------------------------------------

  private animate = (): void => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private handleResize(): void {
    const container = document.getElementById('canvas-container')!;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}

// ============================================================================
// Initialize
// ============================================================================

new ProceduralGenerator();
