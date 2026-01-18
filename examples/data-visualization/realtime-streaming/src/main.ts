/**
 * Real-time Data Streaming Example
 * 
 * Demonstrates streaming data visualization with 3Lens integration.
 * Use 3Lens overlay (~) to monitor streaming performance, buffer state, and scene updates.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface DataChannel {
  id: string;
  name: string;
  color: THREE.Color;
  data: number[];
  lastValue: number;
}

const CHANNEL_COLORS = [
  new THREE.Color(0x50c878), // Green
  new THREE.Color(0x4a9eff), // Blue
  new THREE.Color(0xff9f43), // Orange
  new THREE.Color(0xa855f7), // Purple
];

const CHANNEL_NAMES = ['Channel A', 'Channel B', 'Channel C', 'Channel D'];
const BUFFER_SIZE = 200;
const UPDATE_RATE = 60; // Hz

// ============================================================================
// GLOBAL STATE
// ============================================================================

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let probe: ReturnType<typeof createProbe>;

let channels: DataChannel[] = [];
let vizGroup: THREE.Group;
let lineMeshes: THREE.Line[] = [];
let lineGeometries: THREE.BufferGeometry[] = [];

let isStreaming = true;
let totalDataPoints = 0;
let streamInterval: number | null = null;

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
  const gridHelper = new THREE.GridHelper(20, 40, 0x333344, 0x222233);
  scene.add(gridHelper);

  // Visualization group
  vizGroup = new THREE.Group();
  scene.add(vizGroup);

  // Initialize channels
  initChannels();

  // Build visualization
  buildVisualization();

  // Initialize 3Lens
  initProbe();

  // Event listeners
  window.addEventListener('resize', onWindowResize);
  
  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      isStreaming = !isStreaming;
      updateStreamingState();
    }
    if (e.key === 'c' || e.key === 'C') {
      clearData();
    }
  });

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

function initChannels(): void {
  channels = [];
  
  for (let i = 0; i < 4; i++) {
    channels.push({
      id: `channel-${i}`,
      name: CHANNEL_NAMES[i],
      color: CHANNEL_COLORS[i],
      data: new Array(BUFFER_SIZE).fill(0),
      lastValue: 0.5,
    });
  }
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
      channelCount: channels.length,
      bufferSize: BUFFER_SIZE,
      updateRate: `${UPDATE_RATE} Hz`,
      status: isStreaming ? 'STREAMING' : 'PAUSED',
      controls: 'SPACE to pause/resume, C to clear'
    }
  });

  // Register each channel
  channels.forEach((channel, i) => {
    probe.registerLogicalEntity({
      id: channel.id,
      name: channel.name,
      type: 'data-channel',
      object3D: lineMeshes[i],
      metadata: {
        color: `#${channel.color.getHexString()}`,
        bufferSize: BUFFER_SIZE,
        lastValue: channel.lastValue.toFixed(3)
      }
    });
  });
}

// ============================================================================
// DATA STREAMING
// ============================================================================

function generateDataPoint(): void {
  channels.forEach(channel => {
    // Brownian motion with mean reversion
    const drift = (0.5 - channel.lastValue) * 0.02;
    const volatility = (Math.random() - 0.5) * 0.1;
    const noise = Math.sin(Date.now() * 0.001 + channels.indexOf(channel)) * 0.05;
    
    let value = channel.lastValue + drift + volatility + noise;
    value = Math.max(0, Math.min(1, value));
    
    channel.data.push(value);
    if (channel.data.length > BUFFER_SIZE) {
      channel.data.shift();
    }
    
    channel.lastValue = value;
  });

  totalDataPoints++;
  updateVisualization();
  updateProbeMetadata();
}

function startDataStream(): void {
  if (streamInterval) {
    clearInterval(streamInterval);
  }

  const interval = 1000 / UPDATE_RATE;
  streamInterval = setInterval(() => {
    if (isStreaming) {
      generateDataPoint();
    }
  }, interval) as unknown as number;
}

function updateStreamingState(): void {
  probe.updateLogicalEntity('streaming-scene', {
    metadata: { status: isStreaming ? 'STREAMING' : 'PAUSED' }
  });
}

function clearData(): void {
  channels.forEach(channel => {
    channel.data = new Array(BUFFER_SIZE).fill(0);
    channel.lastValue = 0.5;
  });
  totalDataPoints = 0;
  updateVisualization();
  probe.captureFrame();
}

function updateProbeMetadata(): void {
  channels.forEach(channel => {
    probe.updateLogicalEntity(channel.id, {
      metadata: { lastValue: channel.lastValue.toFixed(3) }
    });
  });
}

// ============================================================================
// VISUALIZATION
// ============================================================================

function buildVisualization(): void {
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
    const positions = new Float32Array(BUFFER_SIZE * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: channel.color,
      linewidth: 2,
    });

    const line = new THREE.Line(geometry, material);
    vizGroup.add(line);

    lineMeshes.push(line);
    lineGeometries.push(geometry);
  });
}

function updateVisualization(): void {
  const width = 16;
  const height = 6;

  channels.forEach((channel, channelIndex) => {
    if (!lineGeometries[channelIndex]) return;

    const positions = lineGeometries[channelIndex].attributes.position as THREE.BufferAttribute;
    const data = channel.data;

    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1) - 0.5) * width;
      const y = data[i] * height + 0.1;
      const z = (channelIndex - channels.length / 2 + 0.5) * 0.5;

      positions.setXYZ(i, x, y, z);
    }

    positions.needsUpdate = true;
    lineGeometries[channelIndex].computeBoundingSphere();
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

  controls.update();
  renderer.render(scene, camera);
}

// ============================================================================
// START
// ============================================================================

init();
