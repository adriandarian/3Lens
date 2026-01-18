/**
 * Geographic Data Viewer Example
 * 
 * Demonstrates 3D geographic visualization with 3Lens integration.
 * Use 3Lens overlay (~) to inspect globe layers, data points, and textures.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ============================================================================
// TYPES & DATA
// ============================================================================

interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
  population: number;
}

const CITIES: City[] = [
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, population: 37400000 },
  { name: 'Delhi', country: 'India', lat: 28.7041, lon: 77.1025, population: 31181000 },
  { name: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737, population: 27796000 },
  { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333, population: 22043000 },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332, population: 21782000 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, population: 21323000 },
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060, population: 18804000 },
  { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, population: 9304000 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, population: 11020000 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, population: 5312000 },
  { name: 'Moscow', country: 'Russia', lat: 55.7558, lon: 37.6173, population: 12506000 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, population: 5686000 },
];

const GLOBE_RADIUS = 5;

// ============================================================================
// GLOBAL STATE
// ============================================================================

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let probe: ReturnType<typeof createProbe>;

let globe: THREE.Mesh;
let atmosphere: THREE.Mesh;
let cityPoints: THREE.Points;

// ============================================================================
// INITIALIZATION
// ============================================================================

function init(): void {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000011);

  // Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 15);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.getElementById('app')!.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 7;
  controls.maxDistance = 30;

  // Lighting
  setupLighting();

  // Create globe
  createGlobe();

  // Create data layers
  createCityMarkers();

  // Create starfield
  createStarfield();

  // Initialize 3Lens
  initProbe();

  // Event listeners
  window.addEventListener('resize', onWindowResize);

  // Start animation
  animate();
}

function setupLighting(): void {
  const ambient = new THREE.AmbientLight(0x333355, 0.5);
  scene.add(ambient);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
  sunLight.position.set(10, 5, 10);
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
  fillLight.position.set(-5, -5, -5);
  scene.add(fillLight);
}

function createStarfield(): void {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 2000;
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount * 3; i += 3) {
    const radius = 100 + Math.random() * 100;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i + 2] = radius * Math.cos(phi);
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
    sizeAttenuation: true
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

function createGlobe(): void {
  // Earth sphere
  const geometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
  
  // Create procedural earth texture
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  // Ocean
  ctx.fillStyle = '#1a4a7a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw simplified continents
  ctx.fillStyle = '#2d5a3d';
  drawContinents(ctx);
  
  const texture = new THREE.CanvasTexture(canvas);
  
  const material = new THREE.MeshPhongMaterial({
    map: texture,
    bumpScale: 0.05,
    specular: new THREE.Color(0x333333),
    shininess: 5
  });

  globe = new THREE.Mesh(geometry, material);
  scene.add(globe);

  // Atmosphere glow
  const atmosphereGeom = new THREE.SphereGeometry(GLOBE_RADIUS * 1.1, 32, 32);
  const atmosphereMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true
  });

  atmosphere = new THREE.Mesh(atmosphereGeom, atmosphereMat);
  scene.add(atmosphere);
}

function drawContinents(ctx: CanvasRenderingContext2D): void {
  const continents = [
    [[120, 80], [180, 100], [200, 150], [180, 200], [140, 180], [100, 140]],
    [[180, 220], [220, 240], [240, 350], [200, 400], [160, 350], [160, 260]],
    [[450, 80], [520, 100], [530, 160], [480, 180], [440, 140]],
    [[450, 180], [540, 200], [560, 320], [480, 380], [420, 320], [440, 220]],
    [[540, 60], [700, 80], [780, 180], [700, 260], [600, 220], [540, 140]],
    [[720, 300], [800, 320], [820, 380], [760, 400], [700, 360]],
  ];

  continents.forEach(continent => {
    ctx.beginPath();
    ctx.moveTo(continent[0][0], continent[0][1]);
    continent.forEach(point => ctx.lineTo(point[0], point[1]));
    ctx.closePath();
    ctx.fill();
  });
}

function latLonToVector3(lat: number, lon: number, radius: number = GLOBE_RADIUS, altitude: number = 0): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const r = radius + altitude;

  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function createCityMarkers(): void {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const colors: number[] = [];
  const sizes: number[] = [];

  CITIES.forEach(city => {
    const pos = latLonToVector3(city.lat, city.lon, GLOBE_RADIUS, 0.05);
    positions.push(pos.x, pos.y, pos.z);

    // Color based on population
    const popNorm = Math.min(city.population / 30000000, 1);
    const color = new THREE.Color();
    color.setHSL(0.1 - popNorm * 0.1, 0.9, 0.5 + popNorm * 0.2);
    colors.push(color.r, color.g, color.b);

    // Size based on population
    sizes.push(5 + popNorm * 15);
  });

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  cityPoints = new THREE.Points(geometry, material);
  scene.add(cityPoints);
}

function initProbe(): void {
  probe = createProbe({ appName: 'Geographic-Data' });
  createOverlay({ probe, theme: 'dark' });

  // Register globe entity
  probe.registerLogicalEntity({
    id: 'earth-globe',
    name: 'Earth Globe',
    type: 'globe',
    object3D: globe,
    metadata: {
      radius: GLOBE_RADIUS,
      segments: 64
    }
  });

  // Register city markers
  probe.registerLogicalEntity({
    id: 'cities-layer',
    name: 'City Markers',
    type: 'data-layer',
    object3D: cityPoints,
    metadata: {
      pointCount: CITIES.length,
      largestCity: 'Tokyo (37.4M)',
      smallestCity: 'Sydney (5.3M)'
    }
  });

  // Register individual cities
  CITIES.forEach((city, i) => {
    probe.registerLogicalEntity({
      id: `city-${i}`,
      name: city.name,
      type: 'city-marker',
      metadata: {
        country: city.country,
        population: (city.population / 1000000).toFixed(1) + 'M',
        coordinates: `${city.lat.toFixed(2)}°, ${city.lon.toFixed(2)}°`
      }
    });
  });
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate(): void {
  requestAnimationFrame(animate);

  // Slow rotation
  globe.rotation.y += 0.001;
  cityPoints.rotation.y = globe.rotation.y;
  atmosphere.rotation.y = globe.rotation.y;

  controls.update();
  renderer.render(scene, camera);
}

// ============================================================================
// START
// ============================================================================

init();
