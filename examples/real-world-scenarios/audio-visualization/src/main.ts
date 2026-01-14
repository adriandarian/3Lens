import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ============================================================================
// Audio Visualization Scene - 3Lens Example
// ============================================================================

// Color schemes
const COLOR_SCHEMES: Record<string, { primary: THREE.Color; secondary: THREE.Color; accent: THREE.Color }> = {
  neon: {
    primary: new THREE.Color(0x8b5cf6),
    secondary: new THREE.Color(0x06b6d4),
    accent: new THREE.Color(0xec4899),
  },
  fire: {
    primary: new THREE.Color(0xef4444),
    secondary: new THREE.Color(0xf59e0b),
    accent: new THREE.Color(0xfbbf24),
  },
  ocean: {
    primary: new THREE.Color(0x0ea5e9),
    secondary: new THREE.Color(0x22d3d1),
    accent: new THREE.Color(0x67e8f9),
  },
  forest: {
    primary: new THREE.Color(0x22c55e),
    secondary: new THREE.Color(0x84cc16),
    accent: new THREE.Color(0xa3e635),
  },
  sunset: {
    primary: new THREE.Color(0xf43f5e),
    secondary: new THREE.Color(0xfb923c),
    accent: new THREE.Color(0xfcd34d),
  },
  mono: {
    primary: new THREE.Color(0xffffff),
    secondary: new THREE.Color(0x94a3b8),
    accent: new THREE.Color(0x64748b),
  },
};

// ============================================================================
// Audio Analyzer Class
// ============================================================================

class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null = null;
  private audio: HTMLAudioElement | null = null;
  private frequencyData: Uint8Array<ArrayBuffer> = new Uint8Array(0);
  private timeDomainData: Uint8Array<ArrayBuffer> = new Uint8Array(0);
  
  // Beat detection
  private beatHistory: number[] = [];
  private lastBeatTime = 0;
  private beatThreshold = 1.3;
  private beatHoldTime = 60;
  
  // State
  public isPlaying = false;
  public isUsingMicrophone = false;
  public fftSize = 2048;
  public smoothingTimeConstant = 0.8;
  
  constructor() {
    // Initialize with default FFT size
    this.frequencyData = new Uint8Array(this.fftSize / 2);
    this.timeDomainData = new Uint8Array(this.fftSize);
  }
  
  async initAudioContext(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.fftSize;
      this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;
      this.analyser.connect(this.audioContext.destination);
      this.updateBuffers();
    }
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
  
  private updateBuffers(): void {
    if (this.analyser) {
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeDomainData = new Uint8Array(this.analyser.fftSize);
    }
  }
  
  setFFTSize(size: number): void {
    this.fftSize = size;
    if (this.analyser) {
      this.analyser.fftSize = size;
      this.updateBuffers();
    }
  }
  
  setSmoothing(value: number): void {
    this.smoothingTimeConstant = value;
    if (this.analyser) {
      this.analyser.smoothingTimeConstant = value;
    }
  }
  
  async loadAudioFile(file: File): Promise<void> {
    await this.initAudioContext();
    this.stopMicrophone();
    
    if (this.audio) {
      this.audio.pause();
      this.audio.remove();
    }
    
    const url = URL.createObjectURL(file);
    this.audio = new Audio(url);
    this.audio.crossOrigin = 'anonymous';
    
    if (this.source) {
      this.source.disconnect();
    }
    
    this.source = this.audioContext!.createMediaElementSource(this.audio);
    this.source.connect(this.analyser!);
    
    this.isUsingMicrophone = false;
    
    return new Promise((resolve) => {
      this.audio!.addEventListener('canplaythrough', () => resolve(), { once: true });
    });
  }
  
  async loadDemoTrack(): Promise<void> {
    // Generate a synthetic demo audio using oscillators
    await this.initAudioContext();
    this.stopMicrophone();
    
    if (this.audio) {
      this.audio.pause();
      this.audio.remove();
    }
    
    // Create a demo using OfflineAudioContext
    const duration = 60;
    const offlineCtx = new OfflineAudioContext(2, 44100 * duration, 44100);
    
    // Bass drum pattern
    const bassTimes = [];
    for (let i = 0; i < duration * 2; i++) {
      bassTimes.push(i * 0.5);
    }
    
    bassTimes.forEach(time => {
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
      gain.gain.setValueAtTime(0.8, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
      osc.connect(gain);
      gain.connect(offlineCtx.destination);
      osc.start(time);
      osc.stop(time + 0.15);
    });
    
    // Hi-hat pattern
    for (let i = 0; i < duration * 4; i++) {
      const time = i * 0.25;
      const noise = offlineCtx.createBufferSource();
      const noiseBuffer = offlineCtx.createBuffer(1, 4410, 44100);
      const output = noiseBuffer.getChannelData(0);
      for (let j = 0; j < 4410; j++) {
        output[j] = Math.random() * 2 - 1;
      }
      noise.buffer = noiseBuffer;
      
      const hihatFilter = offlineCtx.createBiquadFilter();
      hihatFilter.type = 'highpass';
      hihatFilter.frequency.value = 7000;
      
      const hihatGain = offlineCtx.createGain();
      hihatGain.gain.setValueAtTime(0.15, time);
      hihatGain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
      
      noise.connect(hihatFilter);
      hihatFilter.connect(hihatGain);
      hihatGain.connect(offlineCtx.destination);
      noise.start(time);
      noise.stop(time + 0.05);
    }
    
    // Melody synth
    const melodyNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66];
    for (let bar = 0; bar < duration / 4; bar++) {
      const barTime = bar * 4;
      melodyNotes.forEach((freq, i) => {
        const time = barTime + i * 0.5;
        if (time < duration) {
          const osc = offlineCtx.createOscillator();
          const gain = offlineCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(0.15, time + 0.05);
          gain.gain.linearRampToValueAtTime(0.1, time + 0.3);
          gain.gain.linearRampToValueAtTime(0, time + 0.45);
          osc.connect(gain);
          gain.connect(offlineCtx.destination);
          osc.start(time);
          osc.stop(time + 0.5);
        }
      });
    }
    
    const renderedBuffer = await offlineCtx.startRendering();
    
    // Convert to blob
    const wavBlob = this.bufferToWave(renderedBuffer);
    const url = URL.createObjectURL(wavBlob);
    
    this.audio = new Audio(url);
    this.audio.loop = true;
    
    if (this.source) {
      this.source.disconnect();
    }
    
    this.source = this.audioContext!.createMediaElementSource(this.audio);
    this.source.connect(this.analyser!);
    
    this.isUsingMicrophone = false;
  }
  
  private bufferToWave(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const length = buffer.length * numChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];
    
    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }
    
    let offset = 0;
    
    // RIFF header
    const writeString = (str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset++, str.charCodeAt(i));
      }
    };
    
    writeString('RIFF');
    view.setUint32(offset, length - 8, true); offset += 4;
    writeString('WAVE');
    writeString('fmt ');
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, numChannels, true); offset += 2;
    view.setUint32(offset, buffer.sampleRate, true); offset += 4;
    view.setUint32(offset, buffer.sampleRate * numChannels * 2, true); offset += 4;
    view.setUint16(offset, numChannels * 2, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2;
    writeString('data');
    view.setUint32(offset, length - offset - 4, true); offset += 4;
    
    // Interleave samples
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }
  
  async startMicrophone(): Promise<void> {
    await this.initAudioContext();
    
    if (this.audio) {
      this.audio.pause();
    }
    
    if (this.source) {
      this.source.disconnect();
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.source = this.audioContext!.createMediaStreamSource(stream);
      this.source.connect(this.analyser!);
      this.isUsingMicrophone = true;
      this.isPlaying = true;
    } catch (err) {
      console.error('Microphone access denied:', err);
      throw err;
    }
  }
  
  stopMicrophone(): void {
    if (this.isUsingMicrophone && this.source) {
      const mediaSource = this.source as MediaStreamAudioSourceNode;
      mediaSource.mediaStream?.getTracks().forEach(track => track.stop());
      this.source.disconnect();
      this.source = null;
      this.isUsingMicrophone = false;
      this.isPlaying = false;
    }
  }
  
  play(): void {
    if (this.audio) {
      this.audio.play();
      this.isPlaying = true;
    }
  }
  
  pause(): void {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
    }
  }
  
  togglePlayPause(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }
  
  setVolume(value: number): void {
    if (this.audio) {
      this.audio.volume = value;
    }
  }
  
  seek(percent: number): void {
    if (this.audio && this.audio.duration) {
      this.audio.currentTime = this.audio.duration * percent;
    }
  }
  
  getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }
  
  getDuration(): number {
    return this.audio?.duration || 0;
  }
  
  getFrequencyData(): Uint8Array {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(this.frequencyData);
    }
    return this.frequencyData;
  }
  
  getTimeDomainData(): Uint8Array {
    if (this.analyser) {
      this.analyser.getByteTimeDomainData(this.timeDomainData);
    }
    return this.timeDomainData;
  }
  
  getFrequencyBands(): { bass: number; mid: number; high: number; overall: number } {
    const data = this.getFrequencyData();
    const len = data.length;
    
    // Bass: 0-250Hz (first ~10% of bins)
    const bassEnd = Math.floor(len * 0.1);
    let bassSum = 0;
    for (let i = 0; i < bassEnd; i++) {
      bassSum += data[i];
    }
    const bass = bassSum / bassEnd / 255;
    
    // Mid: 250-4000Hz (~10-50% of bins)
    const midStart = bassEnd;
    const midEnd = Math.floor(len * 0.5);
    let midSum = 0;
    for (let i = midStart; i < midEnd; i++) {
      midSum += data[i];
    }
    const mid = midSum / (midEnd - midStart) / 255;
    
    // High: 4000-20000Hz (~50-100% of bins)
    let highSum = 0;
    for (let i = midEnd; i < len; i++) {
      highSum += data[i];
    }
    const high = highSum / (len - midEnd) / 255;
    
    // Overall
    let totalSum = 0;
    for (let i = 0; i < len; i++) {
      totalSum += data[i];
    }
    const overall = totalSum / len / 255;
    
    return { bass, mid, high, overall };
  }
  
  detectBeat(sensitivity: number = 1.5): boolean {
    const bands = this.getFrequencyBands();
    const energy = bands.bass * 0.6 + bands.mid * 0.3 + bands.high * 0.1;
    
    this.beatHistory.push(energy);
    if (this.beatHistory.length > 60) {
      this.beatHistory.shift();
    }
    
    const avgEnergy = this.beatHistory.reduce((a, b) => a + b, 0) / this.beatHistory.length;
    const now = performance.now();
    
    const isBeat = energy > avgEnergy * this.beatThreshold * sensitivity &&
                   now - this.lastBeatTime > this.beatHoldTime;
    
    if (isBeat) {
      this.lastBeatTime = now;
    }
    
    return isBeat;
  }
  
  estimateBPM(): number {
    // Simple BPM estimation based on beat intervals
    if (this.beatHistory.length < 10) return 0;
    
    // Look for peaks in the bass energy
    const peaks: number[] = [];
    for (let i = 1; i < this.beatHistory.length - 1; i++) {
      if (this.beatHistory[i] > this.beatHistory[i - 1] &&
          this.beatHistory[i] > this.beatHistory[i + 1] &&
          this.beatHistory[i] > 0.5) {
        peaks.push(i);
      }
    }
    
    if (peaks.length < 2) return 0;
    
    // Average interval between peaks (assuming ~60fps analysis)
    let totalInterval = 0;
    for (let i = 1; i < peaks.length; i++) {
      totalInterval += peaks[i] - peaks[i - 1];
    }
    const avgInterval = totalInterval / (peaks.length - 1);
    
    // Convert to BPM (60 frames per second assumption)
    const bpm = 60 / (avgInterval / 60);
    return Math.round(Math.min(Math.max(bpm, 60), 200));
  }
  
  getAudioElement(): HTMLAudioElement | null {
    return this.audio;
  }
}

// ============================================================================
// Visualizers
// ============================================================================

type VisualizerType = 'bars' | 'wave' | 'circle' | 'particles' | 'terrain' | 'sphere';

interface Visualizer {
  init(scene: THREE.Scene): void;
  update(frequencyData: Uint8Array, timeDomainData: Uint8Array, bands: { bass: number; mid: number; high: number; overall: number }, beat: boolean, colors: { primary: THREE.Color; secondary: THREE.Color; accent: THREE.Color }): void;
  dispose(): void;
}

// Bars Visualizer
class BarsVisualizer implements Visualizer {
  private bars: THREE.Mesh[] = [];
  private group = new THREE.Group();
  private barCount = 64;
  
  init(scene: THREE.Scene): void {
    const geometry = new THREE.BoxGeometry(0.15, 1, 0.15);
    const material = new THREE.MeshStandardMaterial({
      emissive: new THREE.Color(0x3b82f6),
      emissiveIntensity: 0.5,
    });
    
    for (let i = 0; i < this.barCount; i++) {
      const bar = new THREE.Mesh(geometry, material.clone());
      const angle = (i / this.barCount) * Math.PI * 2;
      const radius = 3;
      bar.position.x = Math.cos(angle) * radius;
      bar.position.z = Math.sin(angle) * radius;
      bar.lookAt(0, 0, 0);
      bar.rotateX(Math.PI / 2);
      this.bars.push(bar);
      this.group.add(bar);
    }
    
    this.group.name = 'BarsVisualizer';
    scene.add(this.group);
  }
  
  update(frequencyData: Uint8Array, _timeDomainData: Uint8Array, _bands: any, beat: boolean, colors: { primary: THREE.Color; secondary: THREE.Color; accent: THREE.Color }): void {
    const dataStep = Math.floor(frequencyData.length / this.barCount);
    
    this.bars.forEach((bar, i) => {
      const dataIndex = i * dataStep;
      const value = frequencyData[dataIndex] / 255;
      const targetScale = 0.1 + value * 4;
      
      bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, targetScale, 0.3);
      
      const material = bar.material as THREE.MeshStandardMaterial;
      const colorT = value;
      material.emissive.copy(colors.primary).lerp(colors.secondary, colorT);
      material.emissiveIntensity = beat ? 1.5 : 0.3 + value * 0.7;
    });
    
    this.group.rotation.y += 0.002;
  }
  
  dispose(): void {
    this.bars.forEach(bar => {
      bar.geometry.dispose();
      (bar.material as THREE.Material).dispose();
    });
    this.group.parent?.remove(this.group);
  }
}

// Wave Visualizer
class WaveVisualizer implements Visualizer {
  private line!: THREE.Line;
  private group = new THREE.Group();
  private points: THREE.Vector3[] = [];
  private pointCount = 256;
  
  init(scene: THREE.Scene): void {
    for (let i = 0; i < this.pointCount; i++) {
      const x = (i / this.pointCount - 0.5) * 10;
      this.points.push(new THREE.Vector3(x, 0, 0));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(this.points);
    const material = new THREE.LineBasicMaterial({ color: 0x8b5cf6, linewidth: 2 });
    
    this.line = new THREE.Line(geometry, material);
    this.group.add(this.line);
    
    // Add multiple waves at different depths
    for (let z = -2; z <= 2; z += 0.5) {
      if (z !== 0) {
        const waveCopy = this.line.clone();
        waveCopy.position.z = z;
        waveCopy.material = new THREE.LineBasicMaterial({
          color: 0x8b5cf6,
          transparent: true,
          opacity: 1 - Math.abs(z) / 3,
        });
        this.group.add(waveCopy);
      }
    }
    
    this.group.name = 'WaveVisualizer';
    scene.add(this.group);
  }
  
  update(_frequencyData: Uint8Array, timeDomainData: Uint8Array, _bands: any, beat: boolean, colors: { primary: THREE.Color; secondary: THREE.Color; accent: THREE.Color }): void {
    const positions = this.line.geometry.attributes.position as THREE.BufferAttribute;
    const step = Math.floor(timeDomainData.length / this.pointCount);
    
    for (let i = 0; i < this.pointCount; i++) {
      const dataIndex = i * step;
      const value = (timeDomainData[dataIndex] - 128) / 128;
      positions.setY(i, value * 2);
    }
    positions.needsUpdate = true;
    
    // Update all wave copies
    this.group.children.forEach((child, index) => {
      if (child instanceof THREE.Line) {
        const mat = child.material as THREE.LineBasicMaterial;
        mat.color.copy(colors.primary).lerp(colors.secondary, index * 0.1);
        
        if (index > 0) {
          // Copy positions with phase offset
          const childPositions = child.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < this.pointCount; i++) {
            const offset = (i + index * 10) % this.pointCount;
            childPositions.setY(i, positions.getY(offset) * (1 - index * 0.15));
          }
          childPositions.needsUpdate = true;
        }
      }
    });
    
    // Beat pulse
    if (beat) {
      this.group.scale.setScalar(1.1);
    } else {
      this.group.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  }
  
  dispose(): void {
    this.group.children.forEach(child => {
      if (child instanceof THREE.Line) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });
    this.group.parent?.remove(this.group);
  }
}

// Circle Visualizer
class CircleVisualizer implements Visualizer {
  private rings: THREE.Line[] = [];
  private group = new THREE.Group();
  private ringCount = 5;
  private segmentCount = 128;
  
  init(scene: THREE.Scene): void {
    for (let r = 0; r < this.ringCount; r++) {
      const points: THREE.Vector3[] = [];
      const radius = 1 + r * 0.6;
      
      for (let i = 0; i <= this.segmentCount; i++) {
        const angle = (i / this.segmentCount) * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        ));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 1 - r * 0.15,
      });
      
      const ring = new THREE.Line(geometry, material);
      this.rings.push(ring);
      this.group.add(ring);
    }
    
    this.group.name = 'CircleVisualizer';
    scene.add(this.group);
  }
  
  update(frequencyData: Uint8Array, _timeDomainData: Uint8Array, bands: { bass: number; mid: number; high: number; overall: number }, beat: boolean, colors: { primary: THREE.Color; secondary: THREE.Color; accent: THREE.Color }): void {
    this.rings.forEach((ring, ringIndex) => {
      const positions = ring.geometry.attributes.position as THREE.BufferAttribute;
      const baseRadius = 1 + ringIndex * 0.6;
      
      for (let i = 0; i <= this.segmentCount; i++) {
        const angle = (i / this.segmentCount) * Math.PI * 2;
        const freqIndex = Math.floor((i / this.segmentCount) * (frequencyData.length / 2));
        const value = frequencyData[freqIndex] / 255;
        const radius = baseRadius + value * (0.5 + ringIndex * 0.2);
        
        positions.setXY(i, Math.cos(angle) * radius, Math.sin(angle) * radius);
      }
      positions.needsUpdate = true;
      
      const material = ring.material as THREE.LineBasicMaterial;
      const colorT = ringIndex / this.ringCount;
      material.color.copy(colors.primary).lerp(colors.secondary, colorT);
      material.opacity = beat ? 1 : 0.5 + bands.overall * 0.5 - ringIndex * 0.1;
      
      ring.rotation.z += 0.005 * (ringIndex % 2 === 0 ? 1 : -1);
    });
    
    this.group.rotation.z += 0.002;
    
    if (beat) {
      this.group.scale.setScalar(1.15);
    } else {
      this.group.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  }
  
  dispose(): void {
    this.rings.forEach(ring => {
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
    });
    this.group.parent?.remove(this.group);
  }
}

// Particles Visualizer
class ParticlesVisualizer implements Visualizer {
  private particles!: THREE.Points;
  private particleCount = 2000;
  private velocities: THREE.Vector3[] = [];
  private originalPositions: THREE.Vector3[] = [];
  private group = new THREE.Group();
  
  init(scene: THREE.Scene): void {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);
    
    for (let i = 0; i < this.particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2 + Math.random() * 2;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      this.originalPositions.push(new THREE.Vector3(x, y, z));
      this.velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ));
      
      colors[i * 3] = 0.5 + Math.random() * 0.5;
      colors[i * 3 + 1] = 0.2 + Math.random() * 0.3;
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
      
      sizes[i] = 0.05 + Math.random() * 0.1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.particles.name = 'ParticleSystem';
    this.group.add(this.particles);
    this.group.name = 'ParticlesVisualizer';
    scene.add(this.group);
  }
  
  update(frequencyData: Uint8Array, _timeDomainData: Uint8Array, bands: { bass: number; mid: number; high: number; overall: number }, beat: boolean, colors: { primary: THREE.Color; secondary: THREE.Color; accent: THREE.Color }): void {
    const positions = this.particles.geometry.attributes.position as THREE.BufferAttribute;
    const colorAttr = this.particles.geometry.attributes.color as THREE.BufferAttribute;
    const sizes = this.particles.geometry.attributes.size as THREE.BufferAttribute;
    
    const bassExpansion = 1 + bands.bass * 1.5;
    const midExpansion = 1 + bands.mid * 0.5;
    
    for (let i = 0; i < this.particleCount; i++) {
      const freqIndex = Math.floor((i / this.particleCount) * frequencyData.length);
      const freqValue = frequencyData[freqIndex] / 255;
      
      // Expand from center based on audio
      const original = this.originalPositions[i];
      const expansion = bassExpansion * (0.8 + freqValue * 0.4);
      
      positions.setXYZ(
        i,
        original.x * expansion + this.velocities[i].x * bands.high * 10,
        original.y * expansion + this.velocities[i].y * bands.mid * 10,
        original.z * expansion + this.velocities[i].z * bands.bass * 10
      );
      
      // Update colors
      const colorT = freqValue;
      const c = new THREE.Color().copy(colors.primary).lerp(colors.secondary, colorT);
      colorAttr.setXYZ(i, c.r, c.g, c.b);
      
      // Pulse sizes on beat
      sizes.setX(i, (0.05 + freqValue * 0.15) * (beat ? 1.5 : 1));
    }
    
    positions.needsUpdate = true;
    colorAttr.needsUpdate = true;
    sizes.needsUpdate = true;
    
    this.group.rotation.y += 0.003 * midExpansion;
    this.group.rotation.x += 0.001;
  }
  
  dispose(): void {
    this.particles.geometry.dispose();
    (this.particles.material as THREE.Material).dispose();
    this.group.parent?.remove(this.group);
  }
}

// Terrain Visualizer
class TerrainVisualizer implements Visualizer {
  private terrain!: THREE.Mesh;
  private group = new THREE.Group();
  private gridSize = 64;
  private history: number[][] = [];
  private historyLength = 64;
  
  init(scene: THREE.Scene): void {
    const geometry = new THREE.PlaneGeometry(10, 10, this.gridSize - 1, this.historyLength - 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      wireframe: true,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.3,
    });
    
    this.terrain = new THREE.Mesh(geometry, material);
    this.terrain.rotation.x = -Math.PI / 2.5;
    this.terrain.position.y = -1;
    this.terrain.name = 'AudioTerrain';
    
    // Initialize history
    for (let i = 0; i < this.historyLength; i++) {
      this.history.push(new Array(this.gridSize).fill(0));
    }
    
    this.group.add(this.terrain);
    this.group.name = 'TerrainVisualizer';
    scene.add(this.group);
  }
  
  update(frequencyData: Uint8Array, _timeDomainData: Uint8Array, bands: { bass: number; mid: number; high: number; overall: number }, beat: boolean, colors: { primary: THREE.Color; secondary: THREE.Color; accent: THREE.Color }): void {
    // Add new row of frequency data
    const newRow: number[] = [];
    const step = Math.floor(frequencyData.length / this.gridSize);
    for (let i = 0; i < this.gridSize; i++) {
      newRow.push(frequencyData[i * step] / 255);
    }
    
    this.history.unshift(newRow);
    if (this.history.length > this.historyLength) {
      this.history.pop();
    }
    
    // Update geometry
    const positions = this.terrain.geometry.attributes.position as THREE.BufferAttribute;
    
    for (let z = 0; z < this.historyLength; z++) {
      for (let x = 0; x < this.gridSize; x++) {
        const index = z * this.gridSize + x;
        const height = this.history[z]?.[x] || 0;
        positions.setZ(index, height * 2);
      }
    }
    positions.needsUpdate = true;
    this.terrain.geometry.computeVertexNormals();
    
    // Update material
    const material = this.terrain.material as THREE.MeshStandardMaterial;
    material.color.copy(colors.primary).lerp(colors.secondary, bands.overall);
    material.emissive.copy(colors.primary);
    material.emissiveIntensity = beat ? 0.8 : 0.2 + bands.bass * 0.4;
  }
  
  dispose(): void {
    this.terrain.geometry.dispose();
    (this.terrain.material as THREE.Material).dispose();
    this.group.parent?.remove(this.group);
  }
}

// Sphere Visualizer
class SphereVisualizer implements Visualizer {
  private sphere!: THREE.Mesh;
  private originalPositions: Float32Array = new Float32Array(0);
  private group = new THREE.Group();
  
  init(scene: THREE.Scene): void {
    const geometry = new THREE.IcosahedronGeometry(2, 4);
    const material = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.5,
    });
    
    this.sphere = new THREE.Mesh(geometry, material);
    this.sphere.name = 'AudioSphere';
    
    // Store original positions
    this.originalPositions = new Float32Array(geometry.attributes.position.array);
    
    this.group.add(this.sphere);
    this.group.name = 'SphereVisualizer';
    scene.add(this.group);
  }
  
  update(frequencyData: Uint8Array, _timeDomainData: Uint8Array, bands: { bass: number; mid: number; high: number; overall: number }, beat: boolean, colors: { primary: THREE.Color; secondary: THREE.Color; accent: THREE.Color }): void {
    const positions = this.sphere.geometry.attributes.position as THREE.BufferAttribute;
    const vertexCount = positions.count;
    
    for (let i = 0; i < vertexCount; i++) {
      const freqIndex = Math.floor((i / vertexCount) * frequencyData.length);
      const value = frequencyData[freqIndex] / 255;
      
      const ox = this.originalPositions[i * 3];
      const oy = this.originalPositions[i * 3 + 1];
      const oz = this.originalPositions[i * 3 + 2];
      
      const displacement = 1 + value * 0.5 + bands.bass * 0.3;
      
      positions.setXYZ(i, ox * displacement, oy * displacement, oz * displacement);
    }
    positions.needsUpdate = true;
    this.sphere.geometry.computeVertexNormals();
    
    // Update material
    const material = this.sphere.material as THREE.MeshStandardMaterial;
    material.color.copy(colors.primary).lerp(colors.secondary, bands.overall);
    material.emissive.copy(colors.secondary);
    material.emissiveIntensity = beat ? 1.2 : 0.3 + bands.overall * 0.5;
    
    // Rotation
    this.group.rotation.y += 0.005 + bands.mid * 0.02;
    this.group.rotation.x += 0.002;
    
    // Beat pulse
    if (beat) {
      this.group.scale.setScalar(1.1);
    } else {
      this.group.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  }
  
  dispose(): void {
    this.sphere.geometry.dispose();
    (this.sphere.material as THREE.Material).dispose();
    this.group.parent?.remove(this.group);
  }
}

// ============================================================================
// Main Application
// ============================================================================

class AudioVisualizationApp {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private analyzer: AudioAnalyzer;
  private currentVisualizer: Visualizer | null = null;
  private visualizerType: VisualizerType = 'bars';
  private colorScheme: keyof typeof COLOR_SCHEMES = 'neon';
  
  // Settings
  private sensitivity = 1.0;
  private autoRotate = true;
  private beatDetection = true;
  private bloomEnabled = true;
  
  // UI Elements
  private frequencyBarsEl!: HTMLElement;
  private beatFillEl!: HTMLElement;
  
  // 3Lens
  private probe: ReturnType<typeof createProbe> | null = null;
  private overlay: ReturnType<typeof createOverlay> | null = null;
  
  constructor() {
    this.analyzer = new AudioAnalyzer();
    this.init();
    this.setupEventListeners();
    this.animate();
  }
  
  private init(): void {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0f);
    this.scene.fog = new THREE.FogExp2(0x0a0a0f, 0.05);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 8);
    this.camera.lookAt(0, 0, 0);
    
    // Renderer
    const container = document.getElementById('canvas-container')!;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.5;
    container.insertBefore(this.renderer.domElement, container.firstChild);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x8b5cf6, 2, 20);
    pointLight1.position.set(5, 5, 5);
    this.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x06b6d4, 2, 20);
    pointLight2.position.set(-5, 3, -5);
    this.scene.add(pointLight2);
    
    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 40, 0x1e3a5f, 0x0f172a);
    gridHelper.position.y = -3;
    this.scene.add(gridHelper);
    
    // Initialize visualizer
    this.setVisualizer('bars');
    
    // Initialize frequency bars display
    this.frequencyBarsEl = document.getElementById('frequency-bars')!;
    this.beatFillEl = document.getElementById('beat-fill')!;
    for (let i = 0; i < 32; i++) {
      const bar = document.createElement('div');
      bar.className = 'freq-bar';
      this.frequencyBarsEl.appendChild(bar);
    }
    
    // Initialize 3Lens
    this.probe = createProbe({ appName: 'Audio Visualization' });
    this.probe.observeRenderer(this.renderer);
    this.probe.observeScene(this.scene);
    
    this.overlay = createOverlay(this.probe);
    
    // Handle resize
    window.addEventListener('resize', () => this.onResize());
  }
  
  private setupEventListeners(): void {
    // Audio prompt buttons
    document.getElementById('mic-btn')?.addEventListener('click', () => this.startMicrophone());
    document.getElementById('demo-btn')?.addEventListener('click', () => this.loadDemo());
    
    // Audio source tabs
    document.querySelectorAll('.audio-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const source = (e.target as HTMLElement).dataset.source;
        document.querySelectorAll('.audio-tab').forEach(t => t.classList.remove('active'));
        (e.target as HTMLElement).classList.add('active');
        
        if (source === 'mic') this.startMicrophone();
        else if (source === 'demo') this.loadDemo();
      });
    });
    
    // File drop zone
    const dropZone = document.getElementById('file-drop')!;
    const fileInput = document.getElementById('audio-file') as HTMLInputElement;
    
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const file = e.dataTransfer?.files[0];
      if (file) this.loadAudioFile(file);
    });
    
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file) this.loadAudioFile(file);
    });
    
    // Playback controls
    document.getElementById('play-btn')?.addEventListener('click', () => {
      this.analyzer.togglePlayPause();
      this.updatePlayButton();
    });
    
    document.getElementById('progress-bar')?.addEventListener('click', (e) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this.analyzer.seek(percent);
    });
    
    // Volume
    const volumeSlider = document.getElementById('volume') as HTMLInputElement;
    volumeSlider?.addEventListener('input', () => {
      const value = parseInt(volumeSlider.value) / 100;
      this.analyzer.setVolume(value);
      document.getElementById('volume-value')!.textContent = `${volumeSlider.value}%`;
    });
    
    // Visualizer selection
    document.querySelectorAll('.visualizer-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.visualizer-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        const viz = (option as HTMLElement).dataset.viz as VisualizerType;
        this.setVisualizer(viz);
      });
    });
    
    // Color presets
    document.querySelectorAll('.color-preset').forEach(preset => {
      preset.addEventListener('click', () => {
        document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
        preset.classList.add('active');
        this.colorScheme = (preset as HTMLElement).dataset.colors as keyof typeof COLOR_SCHEMES;
      });
    });
    
    // Settings sliders
    const sensitivitySlider = document.getElementById('sensitivity') as HTMLInputElement;
    sensitivitySlider?.addEventListener('input', () => {
      this.sensitivity = parseInt(sensitivitySlider.value) / 10;
      document.getElementById('sensitivity-value')!.textContent = this.sensitivity.toFixed(1);
    });
    
    const smoothingSlider = document.getElementById('smoothing') as HTMLInputElement;
    smoothingSlider?.addEventListener('input', () => {
      const value = parseInt(smoothingSlider.value) / 100;
      this.analyzer.setSmoothing(value);
      document.getElementById('smoothing-value')!.textContent = value.toFixed(2);
    });
    
    const fftSlider = document.getElementById('fft-size') as HTMLInputElement;
    fftSlider?.addEventListener('input', () => {
      const size = Math.pow(2, parseInt(fftSlider.value));
      this.analyzer.setFFTSize(size);
      document.getElementById('fft-value')!.textContent = size.toString();
    });
    
    // Toggles
    document.getElementById('auto-rotate')?.addEventListener('click', (e) => {
      const toggle = e.target as HTMLElement;
      toggle.classList.toggle('active');
      this.autoRotate = toggle.classList.contains('active');
    });
    
    document.getElementById('beat-detection')?.addEventListener('click', (e) => {
      const toggle = e.target as HTMLElement;
      toggle.classList.toggle('active');
      this.beatDetection = toggle.classList.contains('active');
    });
    
    document.getElementById('bloom-toggle')?.addEventListener('click', (e) => {
      const toggle = e.target as HTMLElement;
      toggle.classList.toggle('active');
      this.bloomEnabled = toggle.classList.contains('active');
      this.renderer.toneMappingExposure = this.bloomEnabled ? 1.5 : 1.0;
    });
    
    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          this.analyzer.togglePlayPause();
          this.updatePlayButton();
          break;
        case 'm':
          const volumeEl = document.getElementById('volume') as HTMLInputElement;
          if (volumeEl) {
            const wasMuted = volumeEl.value === '0';
            volumeEl.value = wasMuted ? '80' : '0';
            this.analyzer.setVolume(wasMuted ? 0.8 : 0);
            document.getElementById('volume-value')!.textContent = wasMuted ? '80%' : '0%';
          }
          break;
        case '1': this.setVisualizer('bars'); this.updateVisualizerUI('bars'); break;
        case '2': this.setVisualizer('wave'); this.updateVisualizerUI('wave'); break;
        case '3': this.setVisualizer('circle'); this.updateVisualizerUI('circle'); break;
        case '4': this.setVisualizer('particles'); this.updateVisualizerUI('particles'); break;
        case '5': this.setVisualizer('terrain'); this.updateVisualizerUI('terrain'); break;
        case '6': this.setVisualizer('sphere'); this.updateVisualizerUI('sphere'); break;
        case 'r':
          const rotateToggle = document.getElementById('auto-rotate');
          rotateToggle?.click();
          break;
        case 'b':
          const bloomToggle = document.getElementById('bloom-toggle');
          bloomToggle?.click();
          break;
        case 'd':
          this.overlay?.toggle();
          break;
      }
    });
  }
  
  private updateVisualizerUI(type: VisualizerType): void {
    document.querySelectorAll('.visualizer-option').forEach(o => {
      o.classList.toggle('active', (o as HTMLElement).dataset.viz === type);
    });
  }
  
  private async startMicrophone(): Promise<void> {
    try {
      await this.analyzer.startMicrophone();
      this.hidePrompt();
      document.querySelectorAll('.audio-tab').forEach(t => t.classList.remove('active'));
      document.querySelector('.audio-tab[data-source="mic"]')?.classList.add('active');
      this.updatePlayButton();
    } catch (err) {
      console.error('Failed to start microphone:', err);
      alert('Microphone access denied. Please allow microphone access to use this feature.');
    }
  }
  
  private async loadDemo(): Promise<void> {
    this.hidePrompt();
    await this.analyzer.loadDemoTrack();
    document.querySelectorAll('.audio-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.audio-tab[data-source="demo"]')?.classList.add('active');
    
    const playBtn = document.getElementById('play-btn') as HTMLButtonElement;
    playBtn.disabled = false;
    
    document.getElementById('file-name')!.textContent = 'Demo Track (Generated)';
    
    this.analyzer.play();
    this.updatePlayButton();
    this.setupAudioEvents();
  }
  
  private async loadAudioFile(file: File): Promise<void> {
    this.hidePrompt();
    await this.analyzer.loadAudioFile(file);
    
    document.querySelectorAll('.audio-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.audio-tab[data-source="file"]')?.classList.add('active');
    
    const playBtn = document.getElementById('play-btn') as HTMLButtonElement;
    playBtn.disabled = false;
    
    document.getElementById('file-name')!.textContent = file.name;
    
    this.analyzer.play();
    this.updatePlayButton();
    this.setupAudioEvents();
  }
  
  private setupAudioEvents(): void {
    const audio = this.analyzer.getAudioElement();
    if (!audio) return;
    
    audio.addEventListener('timeupdate', () => this.updateTimeDisplay());
    audio.addEventListener('ended', () => {
      this.analyzer.pause();
      this.updatePlayButton();
    });
  }
  
  private hidePrompt(): void {
    document.getElementById('audio-prompt')?.classList.add('hidden');
  }
  
  private updatePlayButton(): void {
    const btn = document.getElementById('play-btn')!;
    btn.textContent = this.analyzer.isPlaying ? '⏸' : '▶';
  }
  
  private updateTimeDisplay(): void {
    const current = this.analyzer.getCurrentTime();
    const duration = this.analyzer.getDuration();
    
    document.getElementById('current-time')!.textContent = this.formatTime(current);
    document.getElementById('total-time')!.textContent = this.formatTime(duration);
    
    const percent = duration > 0 ? (current / duration) * 100 : 0;
    document.getElementById('progress-fill')!.style.width = `${percent}%`;
  }
  
  private formatTime(seconds: number): string {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  private setVisualizer(type: VisualizerType): void {
    if (this.currentVisualizer) {
      this.currentVisualizer.dispose();
    }
    
    this.visualizerType = type;
    
    switch (type) {
      case 'bars':
        this.currentVisualizer = new BarsVisualizer();
        break;
      case 'wave':
        this.currentVisualizer = new WaveVisualizer();
        break;
      case 'circle':
        this.currentVisualizer = new CircleVisualizer();
        break;
      case 'particles':
        this.currentVisualizer = new ParticlesVisualizer();
        break;
      case 'terrain':
        this.currentVisualizer = new TerrainVisualizer();
        break;
      case 'sphere':
        this.currentVisualizer = new SphereVisualizer();
        break;
    }
    
    this.currentVisualizer.init(this.scene);
  }
  
  private updateFrequencyDisplay(frequencyData: Uint8Array): void {
    const bars = this.frequencyBarsEl.children;
    const step = Math.floor(frequencyData.length / bars.length);
    
    for (let i = 0; i < bars.length; i++) {
      const value = frequencyData[i * step] / 255;
      (bars[i] as HTMLElement).style.height = `${value * 100}%`;
    }
  }
  
  private updateStats(bands: { bass: number; mid: number; high: number; overall: number }): void {
    document.getElementById('stat-bass')!.textContent = Math.round(bands.bass * 100).toString();
    document.getElementById('stat-mid')!.textContent = Math.round(bands.mid * 100).toString();
    document.getElementById('stat-high')!.textContent = Math.round(bands.high * 100).toString();
    
    const bpm = this.analyzer.estimateBPM();
    document.getElementById('stat-bpm')!.textContent = bpm > 0 ? bpm.toString() : '--';
  }
  
  private onResize(): void {
    const container = document.getElementById('canvas-container')!;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  private animate = (): void => {
    requestAnimationFrame(this.animate);
    
    // Get audio data
    const frequencyData = this.analyzer.getFrequencyData();
    const timeDomainData = this.analyzer.getTimeDomainData();
    const bands = this.analyzer.getFrequencyBands();
    const beat = this.beatDetection && this.analyzer.detectBeat(this.sensitivity);
    
    // Update visualizer
    if (this.currentVisualizer) {
      this.currentVisualizer.update(
        frequencyData,
        timeDomainData,
        bands,
        beat,
        COLOR_SCHEMES[this.colorScheme]
      );
    }
    
    // Update UI
    this.updateFrequencyDisplay(frequencyData);
    this.updateStats(bands);
    
    // Beat indicator
    this.beatFillEl.style.width = beat ? '100%' : '0%';
    this.beatFillEl.style.opacity = beat ? '1' : '0.3';
    
    // Auto rotate camera
    if (this.autoRotate) {
      const time = performance.now() * 0.0002;
      const radius = 8 + bands.bass * 2;
      this.camera.position.x = Math.sin(time) * radius;
      this.camera.position.z = Math.cos(time) * radius;
      this.camera.position.y = 2 + bands.overall * 2;
      this.camera.lookAt(0, 0, 0);
    }
    
    // Render
    this.renderer.render(this.scene, this.camera);
  };
}

// Start the application
new AudioVisualizationApp();
