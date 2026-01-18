/**
 * 3D Chart Visualization Example
 * 
 * Demonstrates various 3D chart types with 3Lens integration.
 * Use 3Lens overlay (~) to inspect chart data, materials, and scene hierarchy.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface DataPoint {
  label: string;
  value: number;
  color: string;
}

type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'surface';

const COLORS = [
  '#4444ff', '#44aaff', '#44ffaa', '#aaff44', '#ffaa44',
  '#ff4444', '#ff44aa', '#aa44ff', '#44ffff', '#ffff44',
  '#ff8844', '#44ff88'
];

const CATEGORY_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// ============================================================================
// GLOBAL STATE
// ============================================================================

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let probe: ReturnType<typeof createProbe>;

let chartGroup: THREE.Group;
let gridHelper: THREE.GridHelper;
let axesHelper: THREE.AxesHelper;

let currentChartType: ChartType = 'bar';
let currentData: DataPoint[] = [];

// ============================================================================
// INITIALIZATION
// ============================================================================

function init(): void {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a);
  scene.fog = new THREE.Fog(0x0a0a1a, 20, 50);

  // Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(10, 8, 10);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('app')!.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 30;
  controls.maxPolarAngle = Math.PI / 2.1;

  // Lighting
  setupLighting();

  // Grid and Axes
  gridHelper = new THREE.GridHelper(20, 20, 0x333366, 0x222244);
  scene.add(gridHelper);

  axesHelper = new THREE.AxesHelper(10);
  scene.add(axesHelper);

  // Chart container
  chartGroup = new THREE.Group();
  scene.add(chartGroup);

  // Initialize 3Lens
  initProbe();

  // Generate initial data
  generateRandomData();

  // Build initial chart
  buildChart();

  // Event listeners
  window.addEventListener('resize', onWindowResize);

  // Keyboard controls for chart switching
  window.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '5') {
      const types: ChartType[] = ['bar', 'line', 'pie', 'scatter', 'surface'];
      currentChartType = types[parseInt(e.key) - 1];
      buildChart();
    }
    if (e.key === 'r' || e.key === 'R') {
      generateRandomData();
      buildChart();
    }
  });

  // Start render loop
  animate();
}

function setupLighting(): void {
  const ambient = new THREE.AmbientLight(0x404080, 0.5);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 1);
  directional.position.set(10, 20, 10);
  directional.castShadow = true;
  directional.shadow.mapSize.width = 2048;
  directional.shadow.mapSize.height = 2048;
  scene.add(directional);

  const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
  fillLight.position.set(-5, 10, -5);
  scene.add(fillLight);

  // Ground plane for shadows
  const groundGeom = new THREE.PlaneGeometry(30, 30);
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.3 });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  scene.add(ground);
}

function initProbe(): void {
  probe = createProbe({ appName: '3D-Charts' });
  createOverlay({ probe, theme: 'dark' });

  // Register scene
  probe.registerLogicalEntity({
    id: 'chart-scene',
    name: 'Chart Scene',
    type: 'scene',
    object3D: scene,
    metadata: {
      chartType: currentChartType,
      dataPoints: currentData.length,
      controls: 'Press 1-5 to switch chart types, R to randomize data'
    }
  });
}

// ============================================================================
// DATA GENERATION
// ============================================================================

function generateRandomData(): void {
  currentData = [];
  for (let i = 0; i < 12; i++) {
    currentData.push({
      label: CATEGORY_LABELS[i % CATEGORY_LABELS.length],
      value: Math.random() * 80 + 20,
      color: COLORS[i % COLORS.length]
    });
  }
}

// ============================================================================
// CHART BUILDERS
// ============================================================================

function buildChart(): void {
  clearChart();

  switch (currentChartType) {
    case 'bar':
      buildBarChart();
      break;
    case 'line':
      buildLineChart();
      break;
    case 'pie':
      buildPieChart();
      break;
    case 'scatter':
      buildScatterPlot();
      break;
    case 'surface':
      buildSurfacePlot();
      break;
  }

  // Register chart entity
  probe.registerLogicalEntity({
    id: `chart-${currentChartType}`,
    name: `${currentChartType.charAt(0).toUpperCase() + currentChartType.slice(1)} Chart`,
    type: 'chart',
    object3D: chartGroup,
    metadata: {
      chartType: currentChartType,
      dataPointCount: currentData.length,
      totalValue: currentData.reduce((a, b) => a + b.value, 0).toFixed(1)
    }
  });

  // Update scene entity metadata
  probe.updateLogicalEntity('chart-scene', {
    metadata: { chartType: currentChartType, dataPoints: currentData.length }
  });
}

function clearChart(): void {
  while (chartGroup.children.length > 0) {
    const child = chartGroup.children[0];
    chartGroup.remove(child);
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  }
}

function buildBarChart(): void {
  const spacing = 0.5;
  const totalWidth = currentData.length * (1 + spacing);
  const startX = -totalWidth / 2 + 0.5;

  currentData.forEach((dataPoint, i) => {
    const height = (dataPoint.value / 100) * 5;
    
    const geometry = new THREE.BoxGeometry(0.8, height, 0.8);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(dataPoint.color),
      metalness: 0.3,
      roughness: 0.4,
      emissive: new THREE.Color(dataPoint.color),
      emissiveIntensity: 0.1
    });

    const bar = new THREE.Mesh(geometry, material);
    bar.position.set(startX + i * (1 + spacing), height / 2, 0);
    bar.castShadow = true;
    bar.receiveShadow = true;
    bar.userData = { dataIndex: i, type: 'bar', dataPoint };
    chartGroup.add(bar);

    // Register each bar as entity
    probe.registerLogicalEntity({
      id: `bar-${i}`,
      name: `Bar: ${dataPoint.label}`,
      type: 'data-bar',
      object3D: bar,
      metadata: {
        label: dataPoint.label,
        value: dataPoint.value.toFixed(1),
        percentage: ((dataPoint.value / currentData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1) + '%',
        color: dataPoint.color
      }
    });
  });

  camera.position.set(10, 8, 10);
}

function buildLineChart(): void {
  const spacing = 0.5;
  const totalWidth = currentData.length * (1 + spacing);
  const startX = -totalWidth / 2 + 0.5;

  const points: THREE.Vector3[] = [];
  
  currentData.forEach((dataPoint, i) => {
    const height = (dataPoint.value / 100) * 5;
    const x = startX + i * (1 + spacing);
    points.push(new THREE.Vector3(x, height, 0));

    // Point sphere
    const sphereGeom = new THREE.SphereGeometry(0.15);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(dataPoint.color),
      emissive: new THREE.Color(dataPoint.color),
      emissiveIntensity: 0.3
    });
    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    sphere.position.set(x, height, 0);
    sphere.castShadow = true;
    sphere.userData = { dataIndex: i, type: 'point', dataPoint };
    chartGroup.add(sphere);
  });

  // Main line
  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeom = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0x44aaff,
    emissive: 0x44aaff,
    emissiveIntensity: 0.2
  });
  const tube = new THREE.Mesh(tubeGeom, tubeMat);
  tube.castShadow = true;
  chartGroup.add(tube);
}

function buildPieChart(): void {
  const total = currentData.reduce((a, b) => a + b.value, 0);
  let startAngle = 0;

  currentData.forEach((dataPoint, i) => {
    const angle = (dataPoint.value / total) * Math.PI * 2;
    const height = 0.5 + (dataPoint.value / 100);

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.arc(0, 0, 3, startAngle, startAngle + angle, false);
    shape.lineTo(0, 0);

    const extrudeSettings = {
      depth: height,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(dataPoint.color),
      metalness: 0.4,
      roughness: 0.3,
      emissive: new THREE.Color(dataPoint.color),
      emissiveIntensity: 0.1
    });

    const slice = new THREE.Mesh(geometry, material);
    slice.position.y = 0;
    
    // Slight explosion effect
    const midAngle = startAngle + angle / 2;
    slice.position.x = Math.cos(midAngle) * 0.1;
    slice.position.z = Math.sin(midAngle) * 0.1;
    
    slice.castShadow = true;
    slice.receiveShadow = true;
    slice.userData = { dataIndex: i, type: 'slice', dataPoint };
    chartGroup.add(slice);

    startAngle += angle;
  });

  camera.position.set(0, 12, 8);
  controls.update();
}

function buildScatterPlot(): void {
  const scatterData: { x: number; y: number; z: number; size: number; color: string }[] = [];
  
  for (let i = 0; i < 60; i++) {
    scatterData.push({
      x: (Math.random() - 0.5) * 10,
      y: Math.random() * 5,
      z: (Math.random() - 0.5) * 10,
      size: 0.1 + Math.random() * 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    });
  }

  scatterData.forEach((point, i) => {
    const geometry = new THREE.SphereGeometry(point.size, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(point.color),
      metalness: 0.5,
      roughness: 0.2,
      emissive: new THREE.Color(point.color),
      emissiveIntensity: 0.15
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(point.x, point.y, point.z);
    sphere.castShadow = true;
    sphere.userData = { 
      dataIndex: i, 
      type: 'scatter-point',
      dataPoint: { x: point.x, y: point.y, z: point.z }
    };
    chartGroup.add(sphere);
  });

  // Register scatter plot
  probe.registerLogicalEntity({
    id: 'scatter-cloud',
    name: 'Scatter Point Cloud',
    type: 'point-cloud',
    object3D: chartGroup,
    metadata: {
      pointCount: scatterData.length,
      xRange: '[-5, 5]',
      yRange: '[0, 5]',
      zRange: '[-5, 5]'
    }
  });
}

function buildSurfacePlot(): void {
  const resolution = 32;
  const size = 10;
  
  const geometry = new THREE.PlaneGeometry(size, size, resolution, resolution);
  const positionAttribute = geometry.attributes.position;

  // Generate height data
  const colors: number[] = [];
  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const index = i * (resolution + 1) + j;
      const x = (i / resolution - 0.5) * 4;
      const z = (j / resolution - 0.5) * 4;
      
      // Create interesting surface (sine waves)
      const height = (Math.sin(x * 2) * Math.cos(z * 2) + Math.sin(x + z) * 0.5) + 2;
      positionAttribute.setZ(index, height);

      // Color gradient from blue to red
      const normalizedHeight = (height - 0.5) / 3.5;
      const color = new THREE.Color();
      color.setHSL(0.7 - normalizedHeight * 0.7, 0.8, 0.5);
      colors.push(color.r, color.g, color.b);
    }
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    metalness: 0.3,
    roughness: 0.5,
    side: THREE.DoubleSide
  });

  const surface = new THREE.Mesh(geometry, material);
  surface.castShadow = true;
  surface.receiveShadow = true;
  chartGroup.add(surface);

  // Wireframe overlay
  const wireframeMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true,
    transparent: true,
    opacity: 0.1
  });
  const wireframe = new THREE.Mesh(geometry.clone(), wireframeMat);
  chartGroup.add(wireframe);

  // Register surface
  probe.registerLogicalEntity({
    id: 'surface-plot',
    name: 'Surface Plot',
    type: 'surface',
    object3D: surface,
    metadata: {
      resolution: `${resolution}x${resolution}`,
      vertices: positionAttribute.count,
      function: 'sin(x*2)*cos(z*2) + sin(x+z)*0.5'
    }
  });

  camera.position.set(10, 10, 10);
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
  controls.update();
  renderer.render(scene, camera);
}

// ============================================================================
// START
// ============================================================================

init();
