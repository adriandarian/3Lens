import * as THREE from 'three';
import { measureProbeOverhead, type OverheadBenchmarkResult } from '@3lens/core';

// ───────────────────────────────────────────────────────────────
// Configuration
// ───────────────────────────────────────────────────────────────

const BENCHMARK_CONFIG = {
  frames: 300,       // Number of frames to sample
  warmupFrames: 60,  // Warmup frames before sampling
  targetOverhead: 5, // Maximum acceptable overhead percentage
};

// ───────────────────────────────────────────────────────────────
// DOM Elements
// ───────────────────────────────────────────────────────────────

const statusCard = document.getElementById('status-card')!;
const resultsCard = document.getElementById('results')!;
const statusText = statusCard.querySelector('.status-text')!;
const spinner = statusCard.querySelector('.spinner')!;

const resultBadge = document.getElementById('result-badge')!;
const overheadValue = document.getElementById('overhead-value')!;
const baselineValue = document.getElementById('baseline-value')!;
const instrumentedValue = document.getElementById('instrumented-value')!;
const framesValue = document.getElementById('frames-value')!;
const warmupValue = document.getElementById('warmup-value')!;
const detailsEl = document.getElementById('details')!;
const rerunBtn = document.getElementById('rerun-btn')!;

// ───────────────────────────────────────────────────────────────
// Three.js Setup (creates a non-trivial scene for realistic benchmarking)
// ───────────────────────────────────────────────────────────────

function createBenchmarkScene() {
  const container = document.getElementById('canvas-container')!;
  const scene = new THREE.Scene();
  scene.name = 'BenchmarkScene';

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(15, 15, 15);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0f1419);
  container.appendChild(renderer.domElement);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 1);
  directional.position.set(10, 20, 10);
  scene.add(directional);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x1a1f2e, roughness: 0.8 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2;
  scene.add(ground);

  // Create a moderately complex scene with many objects
  const geometries = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.SphereGeometry(0.5, 24, 24),
    new THREE.TorusGeometry(0.5, 0.2, 16, 32),
    new THREE.ConeGeometry(0.5, 1, 16),
    new THREE.CylinderGeometry(0.3, 0.3, 1, 16),
  ];

  const colors = [0x22d3ee, 0x34d399, 0xfbbf24, 0xfb7185, 0xa78bfa];
  
  // Add 100 objects in a grid pattern
  for (let i = 0; i < 100; i++) {
    const geo = geometries[i % geometries.length];
    const mat = new THREE.MeshStandardMaterial({
      color: colors[i % colors.length],
      roughness: 0.3,
      metalness: 0.6,
    });
    const mesh = new THREE.Mesh(geo, mat);
    
    const row = Math.floor(i / 10);
    const col = i % 10;
    mesh.position.set(
      (col - 4.5) * 2,
      Math.sin(i * 0.3) * 0.5,
      (row - 4.5) * 2
    );
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    mesh.name = `Object_${i}`;
    scene.add(mesh);
  }

  // Add some nested groups for hierarchy complexity
  // Shared geometry and material for all group children - best practice!
  const sharedIcosahedronGeo = new THREE.IcosahedronGeometry(0.3, 1);
  const sharedGroupMaterial = new THREE.MeshStandardMaterial({ color: 0x60a5fa });
  
  for (let g = 0; g < 5; g++) {
    const group = new THREE.Group();
    group.name = `Group_${g}`;
    group.position.set(
      Math.cos(g * 1.2) * 8,
      0,
      Math.sin(g * 1.2) * 8
    );
    
    for (let c = 0; c < 5; c++) {
      const child = new THREE.Mesh(sharedIcosahedronGeo, sharedGroupMaterial);
      child.name = `Child_${g}_${c}`;
      child.position.set(Math.cos(c * 1.2), 0, Math.sin(c * 1.2));
      group.add(child);
    }
    scene.add(group);
  }

  return { scene, camera, renderer };
}

// ───────────────────────────────────────────────────────────────
// Benchmark Runner
// ───────────────────────────────────────────────────────────────

function updateStatus(text: string, showSpinner = true) {
  statusText.textContent = text;
  spinner.style.display = showSpinner ? 'block' : 'none';
}

function showResults(result: OverheadBenchmarkResult) {
  const passed = result.overheadPct < BENCHMARK_CONFIG.targetOverhead;
  
  // Update badge
  resultBadge.textContent = passed ? '✓ PASS' : '✗ FAIL';
  resultBadge.className = `badge ${passed ? 'pass' : 'fail'}`;
  
  // Update overhead display
  overheadValue.textContent = `${result.overheadPct >= 0 ? '+' : ''}${result.overheadPct.toFixed(2)}%`;
  overheadValue.className = `overhead-value ${passed ? 'pass' : 'fail'}`;
  
  // Update metrics
  baselineValue.textContent = result.baselineAvgMs.toFixed(3);
  instrumentedValue.textContent = result.instrumentedAvgMs.toFixed(3);
  framesValue.textContent = result.frames.toString();
  warmupValue.textContent = BENCHMARK_CONFIG.warmupFrames.toString();
  
  // Update details
  const diffMs = result.instrumentedAvgMs - result.baselineAvgMs;
  const timestamp = new Date().toISOString();
  
  detailsEl.textContent = `Benchmark completed at ${timestamp}

Test Configuration:
  - Sample frames: ${BENCHMARK_CONFIG.frames}
  - Warmup frames: ${BENCHMARK_CONFIG.warmupFrames}
  - Target overhead: < ${BENCHMARK_CONFIG.targetOverhead}%

Results:
  - Baseline render time: ${result.baselineAvgMs.toFixed(4)} ms/frame
  - Instrumented render time: ${result.instrumentedAvgMs.toFixed(4)} ms/frame
  - Absolute difference: ${diffMs >= 0 ? '+' : ''}${diffMs.toFixed(4)} ms/frame
  - Relative overhead: ${result.overheadPct >= 0 ? '+' : ''}${result.overheadPct.toFixed(2)}%

Verdict: ${passed ? 'PASS ✓ - Overhead is within acceptable limits' : 'FAIL ✗ - Overhead exceeds target threshold'}`;

  // Show results, hide status
  statusCard.style.display = 'none';
  resultsCard.classList.add('show');
  
  // Log to console for CI/automated testing
  console.log('\n========================================');
  console.log('  3Lens Performance Benchmark Results');
  console.log('========================================\n');
  console.log(`  Baseline:      ${result.baselineAvgMs.toFixed(4)} ms/frame`);
  console.log(`  Instrumented:  ${result.instrumentedAvgMs.toFixed(4)} ms/frame`);
  console.log(`  Overhead:      ${result.overheadPct.toFixed(2)}%`);
  console.log(`  Target:        < ${BENCHMARK_CONFIG.targetOverhead}%`);
  console.log(`  Status:        ${passed ? '✓ PASS' : '✗ FAIL'}`);
  console.log('\n========================================\n');
  
  // Set global for potential automated testing
  (window as unknown as { __BENCHMARK_RESULT__: unknown }).__BENCHMARK_RESULT__ = {
    ...result,
    passed,
    target: BENCHMARK_CONFIG.targetOverhead,
  };
}

async function runBenchmark() {
  // Reset UI
  statusCard.style.display = 'flex';
  resultsCard.classList.remove('show');
  rerunBtn.disabled = true;
  
  updateStatus('Setting up benchmark scene...');
  await sleep(100); // Let UI update
  
  const { scene, camera, renderer } = createBenchmarkScene();
  
  updateStatus('Warming up renderer...');
  await sleep(100);
  
  // Do an initial render pass to ensure everything is compiled
  for (let i = 0; i < 30; i++) {
    renderer.render(scene, camera);
  }
  
  updateStatus(`Running benchmark (${BENCHMARK_CONFIG.frames} frames × 2 runs)...`);
  await sleep(100);
  
  const result = measureProbeOverhead(renderer, scene, camera, {
    frames: BENCHMARK_CONFIG.frames,
    warmupFrames: BENCHMARK_CONFIG.warmupFrames,
    appName: 'Benchmark Test',
  });
  
  updateStatus('Processing results...');
  await sleep(100);
  
  showResults(result);
  
  // Cleanup
  renderer.dispose();
  rerunBtn.disabled = false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ───────────────────────────────────────────────────────────────
// Event Handlers
// ───────────────────────────────────────────────────────────────

rerunBtn.addEventListener('click', () => {
  // Clear the canvas container for a fresh run
  const container = document.getElementById('canvas-container')!;
  container.innerHTML = '';
  runBenchmark();
});

// ───────────────────────────────────────────────────────────────
// Start
// ───────────────────────────────────────────────────────────────

runBenchmark();

