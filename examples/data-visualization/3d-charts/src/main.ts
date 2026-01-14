/**
 * 3D Chart Visualization Example
 * 
 * Demonstrates various 3D chart types with 3Lens integration:
 * - 3D Bar Chart
 * - 3D Line Graph
 * - 3D Pie Chart
 * - 3D Scatter Plot
 * - 3D Area Chart
 * - 3D Surface Plot
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DataPoint {
  label: string;
  value: number;
  color: string;
}

interface ChartConfig {
  spacing: number;
  heightScale: number;
  dataPoints: number;
  showGrid: boolean;
  showAxes: boolean;
  showLabels: boolean;
  animate: boolean;
}

type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'surface';

// ============================================================================
// CONSTANTS
// ============================================================================

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
let labelSprites: THREE.Sprite[] = [];

let currentChartType: ChartType = 'bar';
let currentData: DataPoint[] = [];
let animationTime = 0;
let selectedBar: THREE.Mesh | null = null;

const config: ChartConfig = {
  spacing: 0.5,
  heightScale: 1,
  dataPoints: 12,
  showGrid: true,
  showAxes: true,
  showLabels: true,
  animate: false
};

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

  // Setup UI
  setupUI();

  // Event listeners
  window.addEventListener('resize', onWindowResize);
  renderer.domElement.addEventListener('click', onChartClick);
  renderer.domElement.addEventListener('mousemove', onChartHover);

  // Start render loop
  animate();
}

function setupLighting(): void {
  // Ambient light
  const ambient = new THREE.AmbientLight(0x404080, 0.5);
  scene.add(ambient);

  // Main directional light
  const directional = new THREE.DirectionalLight(0xffffff, 1);
  directional.position.set(10, 20, 10);
  directional.castShadow = true;
  directional.shadow.mapSize.width = 2048;
  directional.shadow.mapSize.height = 2048;
  directional.shadow.camera.near = 1;
  directional.shadow.camera.far = 50;
  directional.shadow.camera.left = -15;
  directional.shadow.camera.right = 15;
  directional.shadow.camera.top = 15;
  directional.shadow.camera.bottom = -15;
  scene.add(directional);

  // Fill light
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
      dataPoints: config.dataPoints
    }
  });
}

// ============================================================================
// DATA GENERATION
// ============================================================================

function generateRandomData(): void {
  currentData = [];
  for (let i = 0; i < config.dataPoints; i++) {
    currentData.push({
      label: CATEGORY_LABELS[i % CATEGORY_LABELS.length],
      value: Math.random() * 80 + 20,
      color: COLORS[i % COLORS.length]
    });
  }
  updateDataPanel();
}

function updateDataPanel(): void {
  const values = currentData.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(values.map(v => (v - avg) ** 2).reduce((a, b) => a + b, 0) / values.length);

  document.getElementById('total-points')!.textContent = currentData.length.toString();
  document.getElementById('min-value')!.textContent = min.toFixed(1);
  document.getElementById('max-value')!.textContent = max.toFixed(1);
  document.getElementById('avg-value')!.textContent = avg.toFixed(1);
  document.getElementById('std-value')!.textContent = stdDev.toFixed(1);

  // Update legend
  updateLegend();
}

function updateLegend(): void {
  const legendItems = document.getElementById('legend-items')!;
  legendItems.innerHTML = currentData.slice(0, 8).map(d => `
    <div class="legend-item">
      <div class="legend-color" style="background: ${d.color}"></div>
      <span>${d.label}: ${d.value.toFixed(1)}</span>
    </div>
  `).join('');
}

// ============================================================================
// CHART BUILDERS
// ============================================================================

function buildChart(): void {
  // Clear existing chart
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
    case 'area':
      buildAreaChart();
      break;
    case 'surface':
      buildSurfacePlot();
      break;
  }

  // Update visibility
  gridHelper.visible = config.showGrid;
  axesHelper.visible = config.showAxes;

  // Update stats
  updateSceneStats();

  // Register chart entity
  probe.registerLogicalEntity({
    id: `chart-${currentChartType}`,
    name: `${currentChartType.charAt(0).toUpperCase() + currentChartType.slice(1)} Chart`,
    type: 'chart',
    object3D: chartGroup,
    metadata: {
      chartType: currentChartType,
      dataPointCount: currentData.length,
      totalValue: currentData.reduce((a, b) => a + b.value, 0).toFixed(1),
      spacing: config.spacing,
      heightScale: config.heightScale
    }
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

  // Clear labels
  labelSprites.forEach(sprite => {
    scene.remove(sprite);
    sprite.material.dispose();
  });
  labelSprites = [];
}

function buildBarChart(): void {
  const totalWidth = currentData.length * (1 + config.spacing);
  const startX = -totalWidth / 2 + 0.5;

  currentData.forEach((dataPoint, i) => {
    const height = (dataPoint.value / 100) * 5 * config.heightScale;
    
    // Bar geometry
    const geometry = new THREE.BoxGeometry(0.8, height, 0.8);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(dataPoint.color),
      metalness: 0.3,
      roughness: 0.4,
      emissive: new THREE.Color(dataPoint.color),
      emissiveIntensity: 0.1
    });

    const bar = new THREE.Mesh(geometry, material);
    bar.position.set(startX + i * (1 + config.spacing), height / 2, 0);
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

    // Label
    if (config.showLabels) {
      const label = createTextSprite(dataPoint.label, 0.3);
      label.position.set(startX + i * (1 + config.spacing), -0.5, 0);
      scene.add(label);
      labelSprites.push(label);

      const valueLabel = createTextSprite(dataPoint.value.toFixed(0), 0.25);
      valueLabel.position.set(startX + i * (1 + config.spacing), height + 0.3, 0);
      scene.add(valueLabel);
      labelSprites.push(valueLabel);
    }
  });
}

function buildLineChart(): void {
  const totalWidth = currentData.length * (1 + config.spacing);
  const startX = -totalWidth / 2 + 0.5;

  // Line points
  const points: THREE.Vector3[] = [];
  
  currentData.forEach((dataPoint, i) => {
    const height = (dataPoint.value / 100) * 5 * config.heightScale;
    const x = startX + i * (1 + config.spacing);
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

    // Vertical line to base
    const lineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, 0, 0),
      new THREE.Vector3(x, height, 0)
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x444466, transparent: true, opacity: 0.5 });
    const vertLine = new THREE.Line(lineGeom, lineMat);
    chartGroup.add(vertLine);

    // Label
    if (config.showLabels) {
      const label = createTextSprite(dataPoint.label, 0.3);
      label.position.set(x, -0.5, 0);
      scene.add(label);
      labelSprites.push(label);
    }
  });

  // Main line
  const curve = new THREE.CatmullRomCurve3(points);
  const curvePoints = curve.getPoints(100);
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x44aaff,
    linewidth: 2
  });
  const line = new THREE.Line(lineGeometry, lineMaterial);
  chartGroup.add(line);

  // Tube for thicker line
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
    const height = 0.5 + (dataPoint.value / 100) * config.heightScale;

    // Pie slice
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

    // Label
    if (config.showLabels) {
      const labelRadius = 4;
      const label = createTextSprite(`${dataPoint.label}\n${((dataPoint.value / total) * 100).toFixed(1)}%`, 0.35);
      label.position.set(
        Math.cos(midAngle) * labelRadius,
        height + 0.5,
        Math.sin(midAngle) * labelRadius
      );
      scene.add(label);
      labelSprites.push(label);
    }

    startAngle += angle;
  });

  // Move camera for pie view
  camera.position.set(0, 12, 8);
  controls.update();
}

function buildScatterPlot(): void {
  // Create 3D scatter data
  const scatterData: { x: number; y: number; z: number; size: number; color: string }[] = [];
  
  for (let i = 0; i < config.dataPoints * 5; i++) {
    scatterData.push({
      x: (Math.random() - 0.5) * 10,
      y: Math.random() * 5 * config.heightScale,
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

  // Axis labels
  if (config.showLabels) {
    ['X', 'Y', 'Z'].forEach((axis, i) => {
      const label = createTextSprite(axis, 0.5);
      const positions = [
        [6, 0, 0],
        [0, 6, 0],
        [0, 0, 6]
      ];
      label.position.set(positions[i][0], positions[i][1], positions[i][2]);
      scene.add(label);
      labelSprites.push(label);
    });
  }

  // Register scatter plot
  probe.registerLogicalEntity({
    id: 'scatter-cloud',
    name: 'Scatter Point Cloud',
    type: 'point-cloud',
    object3D: chartGroup,
    metadata: {
      pointCount: scatterData.length,
      xRange: '[-5, 5]',
      yRange: `[0, ${(5 * config.heightScale).toFixed(1)}]`,
      zRange: '[-5, 5]'
    }
  });
}

function buildAreaChart(): void {
  const totalWidth = currentData.length * (1 + config.spacing);
  const startX = -totalWidth / 2 + 0.5;

  // Create area shape
  const shape = new THREE.Shape();
  
  currentData.forEach((dataPoint, i) => {
    const height = (dataPoint.value / 100) * 5 * config.heightScale;
    const x = startX + i * (1 + config.spacing);
    
    if (i === 0) {
      shape.moveTo(x, 0);
      shape.lineTo(x, height);
    } else {
      shape.lineTo(x, height);
    }
  });

  // Close the shape
  const lastX = startX + (currentData.length - 1) * (1 + config.spacing);
  shape.lineTo(lastX, 0);
  shape.lineTo(startX, 0);

  const extrudeSettings = {
    depth: 1,
    bevelEnabled: false
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.rotateX(-Math.PI / 2);
  geometry.rotateY(Math.PI / 2);

  const material = new THREE.MeshStandardMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.7,
    metalness: 0.2,
    roughness: 0.6,
    side: THREE.DoubleSide
  });

  const areaMesh = new THREE.Mesh(geometry, material);
  areaMesh.position.z = -0.5;
  areaMesh.castShadow = true;
  chartGroup.add(areaMesh);

  // Add line on top
  const points: THREE.Vector3[] = currentData.map((dataPoint, i) => {
    const height = (dataPoint.value / 100) * 5 * config.heightScale;
    const x = startX + i * (1 + config.spacing);
    return new THREE.Vector3(x, height, 0);
  });

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeom = new THREE.TubeGeometry(curve, 64, 0.08, 8, false);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0x44aaff,
    emissive: 0x44aaff,
    emissiveIntensity: 0.3
  });
  const tube = new THREE.Mesh(tubeGeom, tubeMat);
  chartGroup.add(tube);

  // Labels
  if (config.showLabels) {
    currentData.forEach((dataPoint, i) => {
      const x = startX + i * (1 + config.spacing);
      const label = createTextSprite(dataPoint.label, 0.3);
      label.position.set(x, -0.5, 0);
      scene.add(label);
      labelSprites.push(label);
    });
  }
}

function buildSurfacePlot(): void {
  const resolution = Math.max(8, Math.floor(config.dataPoints / 2));
  const size = 10;
  
  // Generate height data
  const heightData: number[][] = [];
  for (let i = 0; i <= resolution; i++) {
    heightData[i] = [];
    for (let j = 0; j <= resolution; j++) {
      const x = (i / resolution - 0.5) * 4;
      const z = (j / resolution - 0.5) * 4;
      // Create interesting surface (sine waves)
      heightData[i][j] = (
        Math.sin(x * 2) * Math.cos(z * 2) + 
        Math.sin(x + z) * 0.5
      ) * config.heightScale + 2;
    }
  }

  // Create geometry
  const geometry = new THREE.PlaneGeometry(size, size, resolution, resolution);
  const positionAttribute = geometry.attributes.position;

  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const index = i * (resolution + 1) + j;
      positionAttribute.setZ(index, heightData[i][j]);
    }
  }

  geometry.computeVertexNormals();
  geometry.rotateX(-Math.PI / 2);

  // Color gradient material
  const colors: number[] = [];
  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const height = heightData[i][j];
      const normalizedHeight = (height - 0.5) / (config.heightScale * 2 + 1.5);
      
      // Color gradient from blue to red
      const color = new THREE.Color();
      color.setHSL(0.7 - normalizedHeight * 0.7, 0.8, 0.5);
      colors.push(color.r, color.g, color.b);
    }
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

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
      function: 'sin(x*2)*cos(z*2) + sin(x+z)*0.5',
      heightScale: config.heightScale
    }
  });
}

// ============================================================================
// UTILITIES
// ============================================================================

function createTextSprite(text: string, size: number): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = 256;
  canvas.height = 128;

  context.fillStyle = 'rgba(0, 0, 0, 0)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.font = 'bold 48px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#ffffff';
  
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    context.fillText(line, canvas.width / 2, canvas.height / 2 + (i - (lines.length - 1) / 2) * 50);
  });

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ 
    map: texture, 
    transparent: true,
    depthTest: false
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(size * 2, size, 1);
  
  return sprite;
}

function updateSceneStats(): void {
  let meshCount = 0;
  let triangleCount = 0;

  chartGroup.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      meshCount++;
      const geom = obj.geometry;
      if (geom.index) {
        triangleCount += geom.index.count / 3;
      } else if (geom.attributes.position) {
        triangleCount += geom.attributes.position.count / 3;
      }
    }
  });

  document.getElementById('mesh-count')!.textContent = meshCount.toString();
  document.getElementById('tri-count')!.textContent = triangleCount.toFixed(0);
  document.getElementById('draw-calls')!.textContent = renderer.info.render.calls.toString();
  
  const memory = renderer.info.memory;
  const memoryMB = ((memory.geometries * 0.1 + memory.textures * 0.5)).toFixed(1);
  document.getElementById('gpu-memory')!.textContent = `${memoryMB} MB`;
}

// ============================================================================
// UI SETUP
// ============================================================================

function setupUI(): void {
  // Chart type buttons
  document.querySelectorAll('.chart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentChartType = btn.getAttribute('data-chart') as ChartType;
      document.getElementById('chart-title')!.textContent = `3D ${btn.textContent}`;
      
      // Reset camera for different chart types
      if (currentChartType === 'pie') {
        camera.position.set(0, 12, 8);
      } else if (currentChartType === 'scatter' || currentChartType === 'surface') {
        camera.position.set(10, 10, 10);
      } else {
        camera.position.set(10, 8, 10);
      }
      
      buildChart();
    });
  });

  // Sliders
  const spacingSlider = document.getElementById('spacing-slider') as HTMLInputElement;
  spacingSlider.addEventListener('input', () => {
    config.spacing = parseFloat(spacingSlider.value);
    document.getElementById('spacing-value')!.textContent = config.spacing.toFixed(1);
    buildChart();
  });

  const scaleSlider = document.getElementById('scale-slider') as HTMLInputElement;
  scaleSlider.addEventListener('input', () => {
    config.heightScale = parseFloat(scaleSlider.value);
    document.getElementById('scale-value')!.textContent = config.heightScale.toFixed(1);
    buildChart();
  });

  const pointsSlider = document.getElementById('points-slider') as HTMLInputElement;
  pointsSlider.addEventListener('input', () => {
    config.dataPoints = parseInt(pointsSlider.value);
    document.getElementById('points-value')!.textContent = config.dataPoints.toString();
    generateRandomData();
    buildChart();
  });

  // Buttons
  document.getElementById('animate-btn')!.addEventListener('click', () => {
    config.animate = !config.animate;
    const btn = document.getElementById('animate-btn')!;
    btn.textContent = config.animate ? '⏸ Pause' : '▶ Animate';
    btn.classList.toggle('active', config.animate);
    
    const dot = document.getElementById('anim-dot')!;
    dot.classList.toggle('paused', !config.animate);
    document.getElementById('anim-text')!.textContent = config.animate ? 'Animating' : 'Paused';
  });

  document.getElementById('randomize-btn')!.addEventListener('click', () => {
    generateRandomData();
    buildChart();
  });

  document.getElementById('grid-btn')!.addEventListener('click', function() {
    config.showGrid = !config.showGrid;
    gridHelper.visible = config.showGrid;
    this.classList.toggle('active', config.showGrid);
  });

  document.getElementById('axes-btn')!.addEventListener('click', function() {
    config.showAxes = !config.showAxes;
    axesHelper.visible = config.showAxes;
    this.classList.toggle('active', config.showAxes);
  });

  document.getElementById('labels-btn')!.addEventListener('click', function() {
    config.showLabels = !config.showLabels;
    this.classList.toggle('active', config.showLabels);
    buildChart();
  });

  // Initialize button states
  document.getElementById('grid-btn')!.classList.add('active');
  document.getElementById('axes-btn')!.classList.add('active');
  document.getElementById('labels-btn')!.classList.add('active');
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onChartClick(event: MouseEvent): void {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(chartGroup.children, true);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object as THREE.Mesh;
    
    if (clickedObject.userData.dataPoint) {
      // Deselect previous
      if (selectedBar && selectedBar !== clickedObject) {
        (selectedBar.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;
      }

      // Select new
      selectedBar = clickedObject;
      (selectedBar.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;

      // Log to console
      console.log('Selected:', clickedObject.userData.dataPoint);
      
      // Capture frame
      probe.captureFrame();
    }
  }
}

function onChartHover(event: MouseEvent): void {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(chartGroup.children, true);

  const tooltip = document.getElementById('tooltip')!;

  if (intersects.length > 0) {
    const hoveredObject = intersects[0].object as THREE.Mesh;
    
    if (hoveredObject.userData.dataPoint) {
      const dp = hoveredObject.userData.dataPoint;
      
      if (hoveredObject.userData.type === 'scatter-point') {
        document.getElementById('tooltip-label')!.textContent = 'Position';
        document.getElementById('tooltip-value')!.textContent = 
          `(${dp.x.toFixed(1)}, ${dp.y.toFixed(1)}, ${dp.z.toFixed(1)})`;
      } else {
        document.getElementById('tooltip-label')!.textContent = dp.label || 'Value';
        document.getElementById('tooltip-value')!.textContent = 
          typeof dp.value === 'number' ? dp.value.toFixed(1) : dp.value;
      }

      tooltip.style.left = `${event.clientX + 15}px`;
      tooltip.style.top = `${event.clientY + 15}px`;
      tooltip.classList.add('visible');

      // Highlight on hover
      if (hoveredObject !== selectedBar) {
        (hoveredObject.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3;
      }
    }
  } else {
    tooltip.classList.remove('visible');
    
    // Reset hover highlights
    chartGroup.children.forEach(child => {
      if (child instanceof THREE.Mesh && child !== selectedBar && child.userData.dataPoint) {
        (child.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;
      }
    });
  }
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate(): void {
  requestAnimationFrame(animate);

  controls.update();

  // Animate data if enabled
  if (config.animate) {
    animationTime += 0.02;
    
    if (currentChartType === 'bar') {
      chartGroup.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && child.userData.type === 'bar') {
          const baseHeight = (currentData[child.userData.dataIndex].value / 100) * 5 * config.heightScale;
          const animatedHeight = baseHeight * (0.8 + Math.sin(animationTime + i * 0.3) * 0.2);
          child.scale.y = animatedHeight / baseHeight;
          child.position.y = (animatedHeight / 2) * child.scale.y;
        }
      });
    } else if (currentChartType === 'pie') {
      chartGroup.rotation.y = animationTime * 0.2;
    } else if (currentChartType === 'scatter') {
      chartGroup.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.position.y += Math.sin(animationTime + i * 0.1) * 0.005;
        }
      });
    } else if (currentChartType === 'surface') {
      chartGroup.rotation.y = animationTime * 0.1;
    }
  }

  // Rotate labels to face camera
  labelSprites.forEach(sprite => {
    sprite.lookAt(camera.position);
  });

  // Update stats periodically
  if (Math.floor(animationTime * 10) % 5 === 0) {
    updateSceneStats();
  }

  renderer.render(scene, camera);
}

// ============================================================================
// START
// ============================================================================

init();
