/**
 * Geographic Data Viewer Example
 * 
 * Demonstrates 3D geographic visualization with 3Lens integration:
 * - 3D Globe view
 * - Flat/Mercator map projections
 * - City markers with population data
 * - Flight routes visualization
 * - Earthquake data points
 * - Temperature heatmap overlay
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
  population: number;
}

interface FlightRoute {
  from: string;
  to: string;
  fromCoords: [number, number];
  toCoords: [number, number];
}

interface Earthquake {
  lat: number;
  lon: number;
  magnitude: number;
  depth: number;
}

type ViewMode = 'globe' | 'flat' | 'mercator' | 'orthographic';

interface LayerState {
  cities: boolean;
  population: boolean;
  flights: boolean;
  earthquakes: boolean;
  heatmap: boolean;
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const CITIES: City[] = [
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, population: 37400000 },
  { name: 'Delhi', country: 'India', lat: 28.7041, lon: 77.1025, population: 31181000 },
  { name: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737, population: 27796000 },
  { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333, population: 22043000 },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332, population: 21782000 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, population: 21323000 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, population: 20668000 },
  { name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074, population: 20463000 },
  { name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lon: 90.4125, population: 17598000 },
  { name: 'Osaka', country: 'Japan', lat: 34.6937, lon: 135.5023, population: 19165000 },
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060, population: 18804000 },
  { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lon: 67.0011, population: 16459000 },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816, population: 15257000 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784, population: 15190000 },
  { name: 'Kolkata', country: 'India', lat: 22.5726, lon: 88.3639, population: 14850000 },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lon: 3.3792, population: 14862000 },
  { name: 'Manila', country: 'Philippines', lat: 14.5995, lon: 120.9842, population: 14406000 },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729, population: 13544000 },
  { name: 'Guangzhou', country: 'China', lat: 23.1291, lon: 113.2644, population: 13501000 },
  { name: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437, population: 12447000 },
  { name: 'Moscow', country: 'Russia', lat: 55.7558, lon: 37.6173, population: 12506000 },
  { name: 'Kinshasa', country: 'DR Congo', lat: -4.4419, lon: 15.2663, population: 14970000 },
  { name: 'Tianjin', country: 'China', lat: 39.3434, lon: 117.3616, population: 13589000 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, population: 11020000 },
  { name: 'Shenzhen', country: 'China', lat: 22.5431, lon: 114.0579, population: 12528000 },
  { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, population: 9304000 },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lon: 106.8456, population: 10770000 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018, population: 10539000 },
  { name: 'Lima', country: 'Peru', lat: -12.0464, lon: -77.0428, population: 10719000 },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780, population: 9963000 },
  { name: 'Chicago', country: 'USA', lat: 41.8781, lon: -87.6298, population: 8864000 },
  { name: 'Bogotá', country: 'Colombia', lat: 4.7110, lon: -74.0721, population: 10978000 },
  { name: 'Nagoya', country: 'Japan', lat: 35.1815, lon: 136.9066, population: 9507000 },
  { name: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8231, lon: 106.6297, population: 8993000 },
  { name: 'Hong Kong', country: 'China', lat: 22.3193, lon: 114.1694, population: 7482000 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, population: 5686000 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, population: 5312000 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832, population: 6255000 },
  { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050, population: 3645000 },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038, population: 6642000 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, population: 3331000 },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241, population: 4618000 },
  { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219, population: 4922000 },
  { name: 'San Francisco', country: 'USA', lat: 37.7749, lon: -122.4194, population: 3318000 },
  { name: 'Seattle', country: 'USA', lat: 47.6062, lon: -122.3321, population: 3489000 },
  { name: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207, population: 2632000 },
  { name: 'Melbourne', country: 'Australia', lat: -37.8136, lon: 144.9631, population: 5078000 },
  { name: 'Auckland', country: 'New Zealand', lat: -36.8485, lon: 174.7633, population: 1657000 },
  { name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lon: 28.0473, population: 5783000 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, population: 20668000 },
];

const FLIGHT_ROUTES: FlightRoute[] = [
  { from: 'New York', to: 'London', fromCoords: [40.7128, -74.006], toCoords: [51.5074, -0.1278] },
  { from: 'Los Angeles', to: 'Tokyo', fromCoords: [34.0522, -118.2437], toCoords: [35.6762, 139.6503] },
  { from: 'Dubai', to: 'Singapore', fromCoords: [25.2048, 55.2708], toCoords: [1.3521, 103.8198] },
  { from: 'Paris', to: 'New York', fromCoords: [48.8566, 2.3522], toCoords: [40.7128, -74.006] },
  { from: 'Sydney', to: 'Los Angeles', fromCoords: [-33.8688, 151.2093], toCoords: [34.0522, -118.2437] },
  { from: 'London', to: 'Hong Kong', fromCoords: [51.5074, -0.1278], toCoords: [22.3193, 114.1694] },
  { from: 'Tokyo', to: 'Singapore', fromCoords: [35.6762, 139.6503], toCoords: [1.3521, 103.8198] },
  { from: 'Shanghai', to: 'Dubai', fromCoords: [31.2304, 121.4737], toCoords: [25.2048, 55.2708] },
  { from: 'São Paulo', to: 'Paris', fromCoords: [-23.5505, -46.6333], toCoords: [48.8566, 2.3522] },
  { from: 'Mumbai', to: 'London', fromCoords: [19.076, 72.8777], toCoords: [51.5074, -0.1278] },
];

// Generate random earthquakes
const EARTHQUAKES: Earthquake[] = Array.from({ length: 85 }, () => ({
  lat: (Math.random() - 0.5) * 140 + (Math.random() > 0.7 ? 35 : 0), // Ring of fire bias
  lon: (Math.random() - 0.5) * 300 + (Math.random() > 0.5 ? 140 : -100),
  magnitude: 3 + Math.random() * 5,
  depth: Math.random() * 100
}));

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
let flightLines: THREE.Group;
let earthquakePoints: THREE.Points;
let heatmapMesh: THREE.Mesh;
let gridHelper: THREE.LineSegments;

let currentView: ViewMode = 'globe';
let autoRotate = false;
let isDayMode = true;
let showGrid = false;

const layers: LayerState = {
  cities: true,
  population: true,
  flights: false,
  earthquakes: false,
  heatmap: false
};

let selectedCity: City | null = null;
let hoveredCity: City | null = null;

const GLOBE_RADIUS = 5;
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 60;

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
  createFlightRoutes();
  createEarthquakeMarkers();
  createHeatmap();
  createLatLonGrid();

  // Initialize 3Lens
  initProbe();

  // Setup UI
  setupUI();

  // Event listeners
  window.addEventListener('resize', onWindowResize);
  renderer.domElement.addEventListener('click', onGlobeClick);
  renderer.domElement.addEventListener('mousemove', onGlobeHover);

  // Stars background
  createStarfield();

  // Start animation
  animate();
}

function setupLighting(): void {
  // Ambient light
  const ambient = new THREE.AmbientLight(0x333355, 0.5);
  scene.add(ambient);

  // Sun light
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
  sunLight.position.set(10, 5, 10);
  scene.add(sunLight);

  // Fill light
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
  // Simplified continent shapes (very rough approximation)
  const continents = [
    // North America
    [[120, 80], [180, 100], [200, 150], [180, 200], [140, 180], [100, 140]],
    // South America
    [[180, 220], [220, 240], [240, 350], [200, 400], [160, 350], [160, 260]],
    // Europe
    [[450, 80], [520, 100], [530, 160], [480, 180], [440, 140]],
    // Africa
    [[450, 180], [540, 200], [560, 320], [480, 380], [420, 320], [440, 220]],
    // Asia
    [[540, 60], [700, 80], [780, 180], [700, 260], [600, 220], [540, 140]],
    // Australia
    [[720, 300], [800, 320], [820, 380], [760, 400], [700, 360]],
    // Antarctica
    [[200, 460], [400, 470], [600, 470], [800, 460], [600, 500], [400, 500]]
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

function createFlightRoutes(): void {
  flightLines = new THREE.Group();
  flightLines.visible = layers.flights;

  FLIGHT_ROUTES.forEach(route => {
    const start = latLonToVector3(route.fromCoords[0], route.fromCoords[1], GLOBE_RADIUS, 0.1);
    const end = latLonToVector3(route.toCoords[0], route.toCoords[1], GLOBE_RADIUS, 0.1);

    // Create arc
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const distance = start.distanceTo(end);
    midPoint.normalize().multiplyScalar(GLOBE_RADIUS + distance * 0.15);

    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
    const points = curve.getPoints(50);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0xffaa44,
      transparent: true,
      opacity: 0.6
    });

    const line = new THREE.Line(geometry, material);
    flightLines.add(line);
  });

  scene.add(flightLines);
}

function createEarthquakeMarkers(): void {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const colors: number[] = [];
  const sizes: number[] = [];

  EARTHQUAKES.forEach(eq => {
    const pos = latLonToVector3(eq.lat, eq.lon, GLOBE_RADIUS, 0.08);
    positions.push(pos.x, pos.y, pos.z);

    // Color based on magnitude
    const magNorm = (eq.magnitude - 3) / 5;
    const color = new THREE.Color();
    color.setHSL(0.05 - magNorm * 0.05, 1, 0.5);
    colors.push(color.r, color.g, color.b);

    // Size based on magnitude
    sizes.push(3 + magNorm * 12);
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
      uniform float time;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float pulse = 0.5 + 0.5 * sin(time * 3.0);
        float alpha = (1.0 - dist * 2.0) * (0.5 + pulse * 0.5);
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    uniforms: {
      time: { value: 0 }
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  earthquakePoints = new THREE.Points(geometry, material);
  earthquakePoints.visible = layers.earthquakes;
  scene.add(earthquakePoints);
}

function createHeatmap(): void {
  // Temperature heatmap overlay
  const geometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.01, 64, 64);
  
  // Create procedural heatmap texture
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  // Temperature gradient based on latitude
  for (let y = 0; y < canvas.height; y++) {
    const lat = 90 - (y / canvas.height) * 180;
    const temp = Math.cos(lat * Math.PI / 180); // Warmer at equator
    
    for (let x = 0; x < canvas.width; x++) {
      const noise = Math.random() * 0.1;
      const value = Math.max(0, Math.min(1, temp + noise));
      
      // Blue to red gradient
      const r = Math.floor(value * 255);
      const g = Math.floor((1 - Math.abs(value - 0.5) * 2) * 100);
      const b = Math.floor((1 - value) * 255);
      
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
  });

  heatmapMesh = new THREE.Mesh(geometry, material);
  heatmapMesh.visible = layers.heatmap;
  scene.add(heatmapMesh);
}

function createLatLonGrid(): void {
  const material = new THREE.LineBasicMaterial({
    color: 0x444466,
    transparent: true,
    opacity: 0.3
  });

  const points: THREE.Vector3[] = [];

  // Latitude lines
  for (let lat = -80; lat <= 80; lat += 20) {
    for (let lon = -180; lon <= 180; lon += 5) {
      points.push(latLonToVector3(lat, lon, GLOBE_RADIUS * 1.002));
    }
  }

  // Longitude lines
  for (let lon = -180; lon < 180; lon += 30) {
    for (let lat = -90; lat <= 90; lat += 5) {
      points.push(latLonToVector3(lat, lon, GLOBE_RADIUS * 1.002));
    }
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  gridHelper = new THREE.LineSegments(geometry, material);
  gridHelper.visible = showGrid;
  scene.add(gridHelper);
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
      segments: 64,
      viewMode: currentView
    }
  });

  // Register data layers
  probe.registerLogicalEntity({
    id: 'cities-layer',
    name: 'City Markers',
    type: 'data-layer',
    object3D: cityPoints,
    metadata: {
      pointCount: CITIES.length,
      visible: layers.cities
    }
  });

  probe.registerLogicalEntity({
    id: 'flights-layer',
    name: 'Flight Routes',
    type: 'data-layer',
    object3D: flightLines,
    metadata: {
      routeCount: FLIGHT_ROUTES.length,
      visible: layers.flights
    }
  });

  probe.registerLogicalEntity({
    id: 'earthquakes-layer',
    name: 'Earthquake Data',
    type: 'data-layer',
    object3D: earthquakePoints,
    metadata: {
      pointCount: EARTHQUAKES.length,
      visible: layers.earthquakes
    }
  });
}

// ============================================================================
// UI SETUP
// ============================================================================

function setupUI(): void {
  // View mode buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.getAttribute('data-view') as ViewMode;
      updateViewMode();
    });
  });

  // Layer checkboxes
  document.querySelectorAll('.layer-item').forEach(item => {
    const checkbox = item.querySelector('.layer-checkbox') as HTMLInputElement;
    const layerName = item.getAttribute('data-layer') as keyof LayerState;
    
    checkbox.addEventListener('change', () => {
      layers[layerName] = checkbox.checked;
      item.classList.toggle('active', checkbox.checked);
      updateLayerVisibility();
    });
  });

  // Sliders
  const rotationSlider = document.getElementById('rotation-slider') as HTMLInputElement;
  rotationSlider.addEventListener('input', () => {
    const value = parseInt(rotationSlider.value) / 100;
    document.getElementById('rotation-value')!.textContent = value.toFixed(2);
  });

  const sizeSlider = document.getElementById('size-slider') as HTMLInputElement;
  sizeSlider.addEventListener('input', () => {
    document.getElementById('size-value')!.textContent = sizeSlider.value;
    updatePointSizes(parseInt(sizeSlider.value));
  });

  const altitudeSlider = document.getElementById('altitude-slider') as HTMLInputElement;
  altitudeSlider.addEventListener('input', () => {
    document.getElementById('altitude-value')!.textContent = altitudeSlider.value + '%';
  });

  // Buttons
  document.getElementById('auto-rotate-btn')!.addEventListener('click', function() {
    autoRotate = !autoRotate;
    this.classList.toggle('active', autoRotate);
  });

  document.getElementById('reset-btn')!.addEventListener('click', () => {
    camera.position.set(0, 0, 15);
    controls.reset();
    globe.rotation.set(0, 0, 0);
  });

  document.getElementById('day-btn')!.addEventListener('click', function() {
    isDayMode = true;
    this.classList.add('active');
    document.getElementById('night-btn')!.classList.remove('active');
    updateDayNight();
  });

  document.getElementById('night-btn')!.addEventListener('click', function() {
    isDayMode = false;
    this.classList.add('active');
    document.getElementById('day-btn')!.classList.remove('active');
    updateDayNight();
  });

  document.getElementById('grid-btn')!.addEventListener('click', function() {
    showGrid = !showGrid;
    this.classList.toggle('active', showGrid);
    gridHelper.visible = showGrid;
  });

  // Search
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    if (query.length > 2) {
      const found = CITIES.find(c => 
        c.name.toLowerCase().includes(query) || 
        c.country.toLowerCase().includes(query)
      );
      if (found) {
        flyToCity(found);
      }
    }
  });

  // Initial button states
  document.getElementById('day-btn')!.classList.add('active');
}

function updateViewMode(): void {
  switch (currentView) {
    case 'globe':
      globe.scale.set(1, 1, 1);
      camera.position.set(0, 0, 15);
      break;
    case 'flat':
      // Flatten globe
      globe.scale.set(1.5, 1, 0.1);
      camera.position.set(0, 15, 0);
      camera.lookAt(0, 0, 0);
      break;
    case 'mercator':
      globe.scale.set(1, 0.8, 1);
      camera.position.set(0, 0, 15);
      break;
    case 'orthographic':
      camera.position.set(0, 0, 15);
      break;
  }
  
  controls.update();
}

function updateLayerVisibility(): void {
  cityPoints.visible = layers.cities;
  flightLines.visible = layers.flights;
  earthquakePoints.visible = layers.earthquakes;
  heatmapMesh.visible = layers.heatmap;

  // Update stats
  updateStats();
}

function updatePointSizes(size: number): void {
  // Update city point sizes
  const positions = cityPoints.geometry.attributes.position;
  const sizes = cityPoints.geometry.attributes.size;
  
  for (let i = 0; i < CITIES.length; i++) {
    const popNorm = Math.min(CITIES[i].population / 30000000, 1);
    (sizes as THREE.BufferAttribute).setX(i, size * (0.5 + popNorm));
  }
  
  sizes.needsUpdate = true;
}

function updateDayNight(): void {
  if (isDayMode) {
    scene.background = new THREE.Color(0x000011);
    (globe.material as THREE.MeshPhongMaterial).color.setHex(0xffffff);
  } else {
    scene.background = new THREE.Color(0x000005);
    (globe.material as THREE.MeshPhongMaterial).color.setHex(0x666688);
  }
}

function flyToCity(city: City): void {
  const pos = latLonToVector3(city.lat, city.lon, 12);
  
  // Animate camera
  const startPos = camera.position.clone();
  const startTime = performance.now();
  const duration = 1000;

  function animateFly(): void {
    const elapsed = performance.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);

    camera.position.lerpVectors(startPos, pos, eased);
    camera.lookAt(0, 0, 0);

    if (t < 1) {
      requestAnimationFrame(animateFly);
    } else {
      selectCity(city);
    }
  }

  animateFly();
}

function selectCity(city: City): void {
  selectedCity = city;
  
  document.getElementById('selected-name')!.textContent = city.name;
  document.getElementById('lat-value')!.textContent = city.lat.toFixed(4) + '°';
  document.getElementById('lon-value')!.textContent = city.lon.toFixed(4) + '°';
  document.getElementById('pop-value')!.textContent = (city.population / 1000000).toFixed(1) + 'M';
  document.getElementById('country-value')!.textContent = city.country;

  probe.captureFrame();
}

function updateStats(): void {
  let pointCount = 0;
  let lineCount = 0;

  if (layers.cities) pointCount += CITIES.length;
  if (layers.earthquakes) pointCount += EARTHQUAKES.length;
  if (layers.flights) lineCount += FLIGHT_ROUTES.length;

  document.getElementById('point-count')!.textContent = pointCount.toString();
  document.getElementById('line-count')!.textContent = lineCount.toString();
  document.getElementById('draw-calls')!.textContent = renderer.info.render.calls.toString();
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onGlobeClick(event: MouseEvent): void {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);

  // Check city points
  if (layers.cities) {
    const intersects = raycaster.intersectObject(cityPoints);
    if (intersects.length > 0) {
      const index = intersects[0].index!;
      if (index < CITIES.length) {
        selectCity(CITIES[index]);
        return;
      }
    }
  }

  // Check globe
  const globeIntersects = raycaster.intersectObject(globe);
  if (globeIntersects.length > 0) {
    const point = globeIntersects[0].point;
    const coords = vector3ToLatLon(point);
    
    document.getElementById('selected-name')!.textContent = 'Custom Point';
    document.getElementById('lat-value')!.textContent = coords.lat.toFixed(4) + '°';
    document.getElementById('lon-value')!.textContent = coords.lon.toFixed(4) + '°';
    document.getElementById('pop-value')!.textContent = '-';
    document.getElementById('country-value')!.textContent = '-';
  }
}

function onGlobeHover(event: MouseEvent): void {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);
  raycaster.params.Points = { threshold: 0.3 };

  const tooltip = document.getElementById('tooltip')!;

  // Check city points
  if (layers.cities) {
    const intersects = raycaster.intersectObject(cityPoints);
    if (intersects.length > 0) {
      const index = intersects[0].index!;
      if (index < CITIES.length) {
        const city = CITIES[index];
        hoveredCity = city;

        document.getElementById('tooltip-title')!.textContent = city.name;
        document.getElementById('tooltip-content')!.innerHTML = 
          `Country: ${city.country}<br>` +
          `Population: ${(city.population / 1000000).toFixed(1)}M<br>` +
          `Coords: ${city.lat.toFixed(2)}°, ${city.lon.toFixed(2)}°`;

        tooltip.style.left = `${event.clientX + 15}px`;
        tooltip.style.top = `${event.clientY + 15}px`;
        tooltip.classList.add('visible');
        return;
      }
    }
  }

  hoveredCity = null;
  tooltip.classList.remove('visible');

  // Update coordinates display
  const globeIntersects = raycaster.intersectObject(globe);
  if (globeIntersects.length > 0) {
    const coords = vector3ToLatLon(globeIntersects[0].point);
    document.getElementById('mouse-coords')!.textContent = 
      `Lat: ${coords.lat.toFixed(2)}°, Lon: ${coords.lon.toFixed(2)}°`;
  } else {
    document.getElementById('mouse-coords')!.textContent = 'Lat: ---, Lon: ---';
  }
}

function vector3ToLatLon(point: THREE.Vector3): { lat: number; lon: number } {
  const normalized = point.clone().normalize();
  const lat = Math.asin(normalized.y) * (180 / Math.PI);
  const lon = Math.atan2(-normalized.z, -normalized.x) * (180 / Math.PI);
  return { lat, lon };
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate(): void {
  requestAnimationFrame(animate);

  const time = performance.now() * 0.001;

  // Auto rotation
  if (autoRotate) {
    const rotationSlider = document.getElementById('rotation-slider') as HTMLInputElement;
    const speed = parseInt(rotationSlider.value) / 100;
    globe.rotation.y += speed * 0.01;
    cityPoints.rotation.y = globe.rotation.y;
    flightLines.rotation.y = globe.rotation.y;
    earthquakePoints.rotation.y = globe.rotation.y;
    heatmapMesh.rotation.y = globe.rotation.y;
    gridHelper.rotation.y = globe.rotation.y;
    atmosphere.rotation.y = globe.rotation.y;
  }

  // Update earthquake animation
  if (earthquakePoints.visible) {
    (earthquakePoints.material as THREE.ShaderMaterial).uniforms.time.value = time;
  }

  // Update FPS
  frameCount++;
  if (time - lastFrameTime >= 1) {
    fps = frameCount;
    frameCount = 0;
    lastFrameTime = time;
    document.getElementById('fps')!.textContent = fps.toString();
  }

  controls.update();
  renderer.render(scene, camera);

  // Update stats
  updateStats();
}

// ============================================================================
// START
// ============================================================================

init();
