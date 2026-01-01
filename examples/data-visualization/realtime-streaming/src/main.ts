/**
 * Real-time Data Streaming Example
 * 
 * Demonstrates streaming data visualization with 3Lens integration:
 * - Multiple simulated data sources (stock, sensor, network, audio)
 * - Various visualization modes (line, bar, scatter, surface, particles)
 * - Buffer management and performance monitoring
 * - Live throughput and latency tracking
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// ============================================================================
// TYPES
// ============================================================================

type DataSource = 'stock' | 'sensor' | 'network' | 'audio';
type VizMode = 'line' | 'bar' | 'scatter' | 'surface' | 'particles';

interface DataPoint {
  timestamp: number;
  values: number[];
  channel: number;
}

interface DataChannel {
  id: string;
  name: string;
  color: THREE.Color;
  data: number[];
  min: number;
  max: number;
  lastValue: number;
}

interface StreamStats {
  messagesPerSecond: number;
  latency: number;
  totalPoints: number;
  droppedFrames: number;
  processedFrames: number;
  totalBytes: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CHANNEL_COLORS = [
  new THREE.Color(0x50c878), // Green
  new THREE.Color(0x4a9eff), // Blue
  new THREE.Color(0xff9f43), // Orange
  new THREE.Color(0xa855f7), // Purple
  new THREE.Color(0xff6b6b), // Red
  new THREE.Color(0x00d4aa), // Teal
  new THREE.Color(0xffd93d), // Yellow
  new THREE.Color(0xff85a1), // Pink
];

const SOURCE_NAMES: Record<DataSource, string[]> = {
  stock: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD'],
  sensor: ['Temp-A', 'Temp-B', 'Humidity', 'Pressure', 'CO2', 'Light', 'Motion', 'Sound'],
  network: ['HTTP', 'WebSocket', 'TCP', 'UDP', 'DNS', 'ICMP', 'SSH', 'FTP'],
  audio: ['Bass', 'Mid-Low', 'Mid', 'Mid-High', 'Treble', 'Sub', 'Presence', 'Air'],
};

// ============================================================================
// GLOBAL STATE
// ============================================================================

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let probe: ReturnType<typeof createProbe>;

let currentSource: DataSource = 'stock';
let currentVizMode: VizMode = 'line';
let isStreaming = true;
let updateRate = 60;
let bufferSize = 500;
let numChannels = 4;

let channels: DataChannel[] = [];
let vizGroup: THREE.Group;
let gridHelper: THREE.GridHelper;

let stats: StreamStats = {
  messagesPerSecond: 0,
  latency: 0,
  totalPoints: 0,
  droppedFrames: 0,
  processedFrames: 0,
  totalBytes: 0,
};

let messageCount = 0;
let lastStatsTime = performance.now();
let sessionStartTime = Date.now();
let latencyHistory: number[] = [];

let frameCount = 0;
let lastFpsTime = performance.now();
let currentFps = 60;

// Line visualization
let lineMeshes: THREE.Line[] = [];
let lineGeometries: THREE.BufferGeometry[] = [];

// Bar visualization
let barMeshes: THREE.Mesh[][] = [];

// Scatter visualization
let scatterPoints: THREE.Points | null = null;

// Surface visualization
let surfaceMesh: THREE.Mesh | null = null;

// Particle visualization
let particleSystem: THREE.Points | null = null;
let particleVelocities: Float32Array | null = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

function init(): void {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a12);
  scene.fog = new THREE.Fog(0x0a0a12, 20, 50);

  // Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 8, 15);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.getElementById('app')!.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 40;
  controls.maxPolarAngle = Math.PI / 2;

  // Lighting
  setupLighting();

  // Grid
  gridHelper = new THREE.GridHelper(20, 40, 0x333344, 0x222233);
  scene.add(gridHelper);

  // Visualization group
  vizGroup = new THREE.Group();
  scene.add(vizGroup);

  // Initialize channels
  initChannels();

  // Initialize 3Lens
  initProbe();

  // Build initial visualization
  buildVisualization();

  // Setup UI
  setupUI();

  // Update feed list
  updateFeedList();

  // Event listeners
  window.addEventListener('resize', onWindowResize);

  // Start data streaming
  startDataStream();

  // Start animation
  animate();
}

function setupLighting(): void {
  const ambient = new THREE.AmbientLight(0x404060, 0.8);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 0.6);
  directional.position.set(10, 20, 10);
  scene.add(directional);

  const pointLight = new THREE.PointLight(0x50c878, 0.5, 30);
  pointLight.position.set(0, 10, 0);
  scene.add(pointLight);
}

function initProbe(): void {
  probe = createProbe({ appName: 'Realtime-Streaming' });
  createOverlay({ probe, theme: 'dark' });

  probe.registerLogicalEntity({
    id: 'streaming-scene',
    name: 'Real-time Data Stream',
    type: 'scene',
    object3D: scene,
    metadata: {
      source: currentSource,
      vizMode: currentVizMode,
      bufferSize,
      updateRate
    }
  });
}

function initChannels(): void {
  channels = [];
  const names = SOURCE_NAMES[currentSource];
  
  for (let i = 0; i < numChannels; i++) {
    channels.push({
      id: `channel-${i}`,
      name: names[i % names.length],
      color: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
      data: new Array(bufferSize).fill(0),
      min: 0,
      max: 1,
      lastValue: 0.5,
    });
  }
}

// ============================================================================
// DATA GENERATION
// ============================================================================

function generateDataPoint(source: DataSource): DataPoint {
  const timestamp = performance.now();
  const values: number[] = [];

  for (let i = 0; i < numChannels; i++) {
    let value: number;
    const channel = channels[i];
    const prevValue = channel?.lastValue ?? 0.5;

    switch (source) {
      case 'stock':
        // Brownian motion with drift
        const drift = (Math.random() - 0.5) * 0.02;
        const volatility = (Math.random() - 0.5) * 0.1;
        value = Math.max(0, Math.min(1, prevValue + drift + volatility));
        break;

      case 'sensor':
        // Smooth sine waves with noise
        const freq = 0.001 + i * 0.0005;
        const base = 0.5 + Math.sin(timestamp * freq) * 0.3;
        const noise = (Math.random() - 0.5) * 0.1;
        value = Math.max(0, Math.min(1, base + noise));
        break;

      case 'network':
        // Bursty traffic pattern
        const burst = Math.random() > 0.95 ? Math.random() * 0.5 : 0;
        const baseline = 0.2 + Math.sin(timestamp * 0.0002) * 0.1;
        value = Math.min(1, baseline + burst + Math.random() * 0.1);
        break;

      case 'audio':
        // Frequency bands with decay
        const freq2 = 0.01 * (i + 1);
        const amplitude = Math.abs(Math.sin(timestamp * freq2));
        const decay = Math.exp(-((timestamp % 1000) / 500));
        value = amplitude * decay * (0.5 + Math.random() * 0.5);
        break;

      default:
        value = Math.random();
    }

    values.push(value);
    if (channel) {
      channel.lastValue = value;
    }
  }

  return { timestamp, values, channel: 0 };
}

function processDataPoint(point: DataPoint): void {
  const latency = performance.now() - point.timestamp;
  latencyHistory.push(latency);
  if (latencyHistory.length > 100) latencyHistory.shift();

  stats.latency = latency;
  stats.totalPoints++;
  stats.totalBytes += point.values.length * 8; // 8 bytes per float64
  messageCount++;

  // Update channel data
  for (let i = 0; i < point.values.length && i < channels.length; i++) {
    channels[i].data.push(point.values[i]);
    if (channels[i].data.length > bufferSize) {
      channels[i].data.shift();
    }

    // Update min/max
    const value = point.values[i];
    channels[i].min = Math.min(channels[i].min, value);
    channels[i].max = Math.max(channels[i].max, value);
  }

  stats.processedFrames++;
}

let streamInterval: number | null = null;

function startDataStream(): void {
  if (streamInterval) {
    clearInterval(streamInterval);
  }

  const interval = 1000 / updateRate;
  streamInterval = setInterval(() => {
    if (!isStreaming) return;

    const point = generateDataPoint(currentSource);
    processDataPoint(point);
    updateVisualization();
  }, interval) as unknown as number;
}

function stopDataStream(): void {
  if (streamInterval) {
    clearInterval(streamInterval);
    streamInterval = null;
  }
}

// ============================================================================
// VISUALIZATION BUILDERS
// ============================================================================

function buildVisualization(): void {
  clearVisualization();

  switch (currentVizMode) {
    case 'line':
      buildLineChart();
      break;
    case 'bar':
      buildBarChart();
      break;
    case 'scatter':
      buildScatterPlot();
      break;
    case 'surface':
      build3DSurface();
      break;
    case 'particles':
      buildParticleViz();
      break;
  }

  // Register visualization entity
  probe.registerLogicalEntity({
    id: 'visualization',
    name: `${currentVizMode.charAt(0).toUpperCase() + currentVizMode.slice(1)} Visualization`,
    type: 'visualization',
    object3D: vizGroup,
    metadata: {
      mode: currentVizMode,
      channels: numChannels,
      bufferSize
    }
  });
}

function clearVisualization(): void {
  while (vizGroup.children.length > 0) {
    const child = vizGroup.children[0];
    vizGroup.remove(child);
    if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Points) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  }

  lineMeshes = [];
  lineGeometries = [];
  barMeshes = [];
  scatterPoints = null;
  surfaceMesh = null;
  particleSystem = null;
  particleVelocities = null;
}

function buildLineChart(): void {
  const width = 16;
  const height = 6;

  // Background plane
  const bgGeom = new THREE.PlaneGeometry(width + 2, height + 2);
  const bgMat = new THREE.MeshBasicMaterial({
    color: 0x111122,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });
  const bgMesh = new THREE.Mesh(bgGeom, bgMat);
  bgMesh.rotation.x = -Math.PI / 2;
  bgMesh.position.y = 0.01;
  vizGroup.add(bgMesh);

  // Create lines for each channel
  channels.forEach((channel, i) => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(bufferSize * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: channel.color,
      linewidth: 2,
    });

    const line = new THREE.Line(geometry, material);
    vizGroup.add(line);

    lineMeshes.push(line);
    lineGeometries.push(geometry);

    // Register channel
    probe.registerLogicalEntity({
      id: `line-channel-${i}`,
      name: `Line: ${channel.name}`,
      type: 'data-channel',
      object3D: line,
      metadata: {
        channel: channel.name,
        color: `#${channel.color.getHexString()}`
      }
    });
  });
}

function buildBarChart(): void {
  const barWidth = 0.15;
  const spacing = 0.2;
  const groupSpacing = 1;

  const numBars = Math.min(50, bufferSize);
  
  channels.forEach((channel, channelIndex) => {
    const channelBars: THREE.Mesh[] = [];

    for (let i = 0; i < numBars; i++) {
      const geometry = new THREE.BoxGeometry(barWidth, 1, barWidth);
      geometry.translate(0, 0.5, 0);

      const material = new THREE.MeshPhongMaterial({
        color: channel.color,
        transparent: true,
        opacity: 0.8,
      });

      const mesh = new THREE.Mesh(geometry, material);
      const x = (i - numBars / 2) * spacing;
      const z = (channelIndex - numChannels / 2 + 0.5) * groupSpacing;
      mesh.position.set(x, 0, z);

      vizGroup.add(mesh);
      channelBars.push(mesh);
    }

    barMeshes.push(channelBars);
  });
}

function buildScatterPlot(): void {
  const numPoints = bufferSize * numChannels;
  const positions = new Float32Array(numPoints * 3);
  const colors = new Float32Array(numPoints * 3);
  const sizes = new Float32Array(numPoints);

  for (let i = 0; i < numPoints; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = Math.random() * 6;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

    const channelIndex = Math.floor(i / bufferSize);
    const color = channels[channelIndex % channels.length].color;
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = 0.1 + Math.random() * 0.1;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * 200.0 / -mvPosition.z;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
        gl_FragColor = vec4(vColor, alpha * 0.8);
      }
    `,
    transparent: true,
    depthWrite: false,
  });

  scatterPoints = new THREE.Points(geometry, material);
  vizGroup.add(scatterPoints);
}

function build3DSurface(): void {
  const width = 50;
  const depth = numChannels * 10;

  const geometry = new THREE.PlaneGeometry(16, 8, width - 1, depth - 1);
  geometry.rotateX(-Math.PI / 2);

  const colors: number[] = [];
  const positions = geometry.attributes.position;

  for (let i = 0; i < positions.count; i++) {
    const x = i % width;
    const z = Math.floor(i / width);
    const channelIndex = Math.floor(z / (depth / numChannels));
    const color = channels[channelIndex % channels.length].color;
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.MeshPhongMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    flatShading: true,
    shininess: 50,
  });

  surfaceMesh = new THREE.Mesh(geometry, material);
  vizGroup.add(surfaceMesh);
}

function buildParticleViz(): void {
  const numParticles = 5000;
  const positions = new Float32Array(numParticles * 3);
  const colors = new Float32Array(numParticles * 3);
  particleVelocities = new Float32Array(numParticles * 3);

  for (let i = 0; i < numParticles; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = Math.random() * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

    const channelIndex = i % numChannels;
    const color = channels[channelIndex].color;
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    particleVelocities[i * 3] = (Math.random() - 0.5) * 0.02;
    particleVelocities[i * 3 + 1] = Math.random() * 0.05;
    particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  particleSystem = new THREE.Points(geometry, material);
  vizGroup.add(particleSystem);
}

// ============================================================================
// VISUALIZATION UPDATES
// ============================================================================

function updateVisualization(): void {
  switch (currentVizMode) {
    case 'line':
      updateLineChart();
      break;
    case 'bar':
      updateBarChart();
      break;
    case 'scatter':
      updateScatterPlot();
      break;
    case 'surface':
      updateSurface();
      break;
    case 'particles':
      updateParticles();
      break;
  }
}

function updateLineChart(): void {
  const width = 16;
  const height = 6;

  channels.forEach((channel, channelIndex) => {
    if (!lineGeometries[channelIndex]) return;

    const positions = lineGeometries[channelIndex].attributes.position as THREE.BufferAttribute;
    const data = channel.data;

    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1) - 0.5) * width;
      const y = data[i] * height + 0.1;
      const z = (channelIndex - numChannels / 2 + 0.5) * 0.5;

      positions.setXYZ(i, x, y, z);
    }

    positions.needsUpdate = true;
    lineGeometries[channelIndex].computeBoundingSphere();
  });
}

function updateBarChart(): void {
  const numBars = Math.min(50, bufferSize);
  const maxHeight = 6;

  channels.forEach((channel, channelIndex) => {
    if (!barMeshes[channelIndex]) return;

    const data = channel.data;
    const step = Math.floor(data.length / numBars);

    for (let i = 0; i < numBars; i++) {
      const dataIndex = Math.min(i * step, data.length - 1);
      const value = data[dataIndex];
      const height = Math.max(0.05, value * maxHeight);

      const bar = barMeshes[channelIndex][i];
      if (bar) {
        bar.scale.y = height;
        
        // Color intensity based on value
        const material = bar.material as THREE.MeshPhongMaterial;
        const intensity = 0.5 + value * 0.5;
        material.emissive.copy(channel.color).multiplyScalar(intensity * 0.3);
      }
    }
  });
}

function updateScatterPlot(): void {
  if (!scatterPoints) return;

  const positions = scatterPoints.geometry.attributes.position as THREE.BufferAttribute;
  const width = 16;
  const height = 6;

  let pointIndex = 0;
  channels.forEach((channel, channelIndex) => {
    const data = channel.data;
    for (let i = 0; i < data.length && pointIndex < positions.count; i++) {
      const x = (i / (data.length - 1) - 0.5) * width;
      const y = data[i] * height + 0.1;
      const z = (channelIndex - numChannels / 2 + 0.5) * 2;

      // Add some jitter
      const jitterX = (Math.random() - 0.5) * 0.1;
      const jitterZ = (Math.random() - 0.5) * 0.1;

      positions.setXYZ(pointIndex, x + jitterX, y, z + jitterZ);
      pointIndex++;
    }
  });

  positions.needsUpdate = true;
}

function updateSurface(): void {
  if (!surfaceMesh) return;

  const positions = surfaceMesh.geometry.attributes.position as THREE.BufferAttribute;
  const width = 50;
  const depth = numChannels * 10;

  for (let z = 0; z < depth; z++) {
    const channelIndex = Math.floor(z / (depth / numChannels));
    const channel = channels[channelIndex];
    if (!channel) continue;

    const data = channel.data;
    const localZ = z % (depth / numChannels);
    const zOffset = localZ / (depth / numChannels);

    for (let x = 0; x < width; x++) {
      const dataIndex = Math.floor((x / width) * data.length);
      const value = data[dataIndex] || 0;

      const i = z * width + x;
      const currentY = positions.getY(i);
      const targetY = value * 4 * (1 - zOffset * 0.5);
      
      // Smooth interpolation
      positions.setY(i, currentY + (targetY - currentY) * 0.3);
    }
  }

  positions.needsUpdate = true;
  surfaceMesh.geometry.computeVertexNormals();
}

function updateParticles(): void {
  if (!particleSystem || !particleVelocities) return;

  const positions = particleSystem.geometry.attributes.position as THREE.BufferAttribute;
  const time = performance.now() * 0.001;

  for (let i = 0; i < positions.count; i++) {
    const channelIndex = i % numChannels;
    const channel = channels[channelIndex];
    const dataValue = channel?.data[channel.data.length - 1] ?? 0.5;

    let x = positions.getX(i);
    let y = positions.getY(i);
    let z = positions.getZ(i);

    // Apply velocity
    x += particleVelocities[i * 3] * dataValue * 2;
    y += particleVelocities[i * 3 + 1] * dataValue;
    z += particleVelocities[i * 3 + 2] * dataValue * 2;

    // Add swirl
    const angle = time * 0.5 + i * 0.01;
    x += Math.sin(angle) * 0.01 * dataValue;
    z += Math.cos(angle) * 0.01 * dataValue;

    // Boundary wrap
    if (y > 8) {
      y = 0;
      x = (Math.random() - 0.5) * 16;
      z = (Math.random() - 0.5) * 8;
    }
    if (x > 8) x = -8;
    if (x < -8) x = 8;
    if (z > 4) z = -4;
    if (z < -4) z = 4;

    positions.setXYZ(i, x, y, z);
  }

  positions.needsUpdate = true;
}

// ============================================================================
// UI UPDATES
// ============================================================================

function updateFeedList(): void {
  const feedList = document.getElementById('feed-list')!;
  feedList.innerHTML = '';

  channels.forEach((channel, i) => {
    const feed = document.createElement('div');
    feed.className = 'feed-item';
    feed.innerHTML = `
      <div class="feed-header">
        <span class="feed-name">
          <span class="feed-indicator"></span>
          ${channel.name}
        </span>
        <span class="feed-rate">${updateRate} Hz</span>
      </div>
      <div class="feed-stats">
        <div class="feed-stat">
          <span class="feed-stat-label">Last:</span>
          <span class="feed-stat-value" id="feed-last-${i}">${channel.lastValue.toFixed(3)}</span>
        </div>
        <div class="feed-stat">
          <span class="feed-stat-label">Min:</span>
          <span class="feed-stat-value">${channel.min.toFixed(3)}</span>
        </div>
        <div class="feed-stat">
          <span class="feed-stat-label">Max:</span>
          <span class="feed-stat-value">${channel.max.toFixed(3)}</span>
        </div>
      </div>
    `;
    feedList.appendChild(feed);
  });
}

function updateStatsDisplay(): void {
  // Update throughput
  const now = performance.now();
  if (now - lastStatsTime >= 1000) {
    stats.messagesPerSecond = messageCount;
    messageCount = 0;
    lastStatsTime = now;
  }

  document.getElementById('throughput')!.textContent = `${stats.messagesPerSecond} msg/s`;
  document.getElementById('latency')!.textContent = `${stats.latency.toFixed(1)} ms`;
  document.getElementById('data-points')!.textContent = stats.totalPoints.toLocaleString();
  document.getElementById('fps')!.textContent = currentFps.toString();

  // Buffer
  const bufferPercent = (channels[0]?.data.length || 0) / bufferSize * 100;
  document.getElementById('buffer-fill')!.style.width = `${bufferPercent}%`;
  document.getElementById('buffer-max')!.textContent = `${bufferSize} points`;

  // Performance metrics
  const memoryMB = (stats.totalBytes / (1024 * 1024)).toFixed(1);
  document.getElementById('metric-cpu')!.textContent = `${Math.min(99, Math.round(stats.messagesPerSecond / updateRate * 100))}%`;
  document.getElementById('metric-memory')!.textContent = `${memoryMB} MB`;
  document.getElementById('metric-dropped')!.textContent = stats.droppedFrames.toString();
  document.getElementById('metric-processed')!.textContent = stats.processedFrames.toLocaleString();

  // Session time
  const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
  const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');
  document.getElementById('session-time')!.textContent = `${hours}:${minutes}:${seconds}`;

  // Total received
  document.getElementById('total-received')!.textContent = formatBytes(stats.totalBytes);

  // Average latency
  const avgLatency = latencyHistory.length > 0
    ? latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length
    : 0;
  document.getElementById('avg-latency')!.textContent = `${avgLatency.toFixed(1)} ms`;

  // Draw calls
  document.getElementById('draw-calls')!.textContent = renderer.info.render.calls.toString();

  // Update feed values
  channels.forEach((channel, i) => {
    const el = document.getElementById(`feed-last-${i}`);
    if (el) el.textContent = channel.lastValue.toFixed(3);
  });

  // Stream status
  const statusBadge = document.getElementById('stream-status')!;
  if (isStreaming) {
    statusBadge.textContent = '● LIVE';
    statusBadge.className = 'status-badge live';
  } else {
    statusBadge.textContent = '⏸ PAUSED';
    statusBadge.className = 'status-badge paused';
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// ============================================================================
// UI SETUP
// ============================================================================

function setupUI(): void {
  // Data source buttons
  document.querySelectorAll('.source-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.source-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSource = btn.getAttribute('data-source') as DataSource;
      
      // Reset channels with new source names
      initChannels();
      buildVisualization();
      updateFeedList();
      
      // Update probe metadata
      probe.updateLogicalEntity('streaming-scene', {
        metadata: { source: currentSource }
      });
    });
  });

  // Visualization mode buttons
  document.querySelectorAll('.viz-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.viz-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentVizMode = btn.getAttribute('data-mode') as VizMode;
      buildVisualization();
      
      probe.updateLogicalEntity('streaming-scene', {
        metadata: { vizMode: currentVizMode }
      });
    });
  });

  // Rate slider
  const rateSlider = document.getElementById('rate-slider') as HTMLInputElement;
  rateSlider.addEventListener('input', () => {
    updateRate = parseInt(rateSlider.value);
    document.getElementById('rate-value')!.textContent = `${updateRate} Hz`;
    startDataStream(); // Restart with new rate
  });

  // Buffer slider
  const bufferSlider = document.getElementById('buffer-slider') as HTMLInputElement;
  bufferSlider.addEventListener('input', () => {
    bufferSize = parseInt(bufferSlider.value);
    document.getElementById('buffer-value')!.textContent = bufferSize.toString();
    
    // Resize channel buffers
    channels.forEach(channel => {
      while (channel.data.length > bufferSize) channel.data.shift();
    });
    
    buildVisualization();
  });

  // Channels slider
  const channelsSlider = document.getElementById('channels-slider') as HTMLInputElement;
  channelsSlider.addEventListener('input', () => {
    numChannels = parseInt(channelsSlider.value);
    document.getElementById('channels-value')!.textContent = numChannels.toString();
    initChannels();
    buildVisualization();
    updateFeedList();
  });

  // Pause button
  document.getElementById('pause-btn')!.addEventListener('click', () => {
    isStreaming = !isStreaming;
    const btn = document.getElementById('pause-btn')!;
    btn.innerHTML = isStreaming ? '⏸️ Pause' : '▶️ Resume';
    
    if (isStreaming) {
      startDataStream();
    } else {
      stopDataStream();
    }
  });

  // Clear button
  document.getElementById('clear-btn')!.addEventListener('click', () => {
    channels.forEach(channel => {
      channel.data = new Array(bufferSize).fill(0);
      channel.min = 0;
      channel.max = 1;
      channel.lastValue = 0.5;
    });
    stats.totalPoints = 0;
    stats.totalBytes = 0;
    stats.processedFrames = 0;
    stats.droppedFrames = 0;
    latencyHistory = [];
    
    buildVisualization();
    probe.captureFrame();
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

  // FPS counter
  frameCount++;
  const now = performance.now();
  if (now - lastFpsTime >= 1000) {
    currentFps = frameCount;
    frameCount = 0;
    lastFpsTime = now;
  }

  // Update controls
  controls.update();

  // Rotate visualization slightly
  vizGroup.rotation.y += 0.001;

  // Update stats display
  updateStatsDisplay();

  // Render
  renderer.render(scene, camera);
}

// ============================================================================
// START
// ============================================================================

init();
