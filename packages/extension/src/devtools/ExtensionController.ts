/**
 * ExtensionController - Implements PanelController for the Chrome extension
 * 
 * This controller communicates with the probe via Chrome message passing.
 */

import type { SceneSnapshot, FrameStats, BenchmarkScore, DebugMessage } from '@3lens/core';
import { calculateBenchmarkScore } from '@3lens/core';
import type { PanelController, PanelData, PanelState } from '@3lens/ui';
import { createInitialPanelState } from '@3lens/ui';

/**
 * Controller that implements PanelController for the extension panel.
 * Communicates with the probe via message passing.
 */
export class ExtensionController implements PanelController {
  private state: PanelState;
  private snapshot: SceneSnapshot | null = null;
  private latestStats: FrameStats | null = null;
  private latestBenchmark: BenchmarkScore | null = null;
  private frameHistory: number[] = [];
  private fpsHistory: number[] = [];
  private maxHistoryLength = 120;

  private connected = false;
  private connectionInfo: PanelData['connectionInfo'] = null;

  private dataChangeCallbacks: Set<() => void> = new Set();
  private stateChangeCallbacks: Set<() => void> = new Set();
  private renderCallback: (() => void) | null = null;
  private port: chrome.runtime.Port | null = null;

  // Throttling
  private lastStatsUpdate = 0;
  private statsUpdateInterval = 500;

  constructor() {
    this.state = createInitialPanelState();
    this.connectToBackground();
  }

  private connectToBackground(): void {
    // Connect to the background script to communicate with content script
    this.port = chrome.runtime.connect({ name: 'panel' });

    this.port.onMessage.addListener((message: DebugMessage) => {
      this.handleMessage(message);
    });

    this.port.onDisconnect.addListener(() => {
      this.connected = false;
      this.connectionInfo = null;
      this.notifyDataChange();
    });

    // Request initial handshake
    this.sendToPage({ type: 'handshake-request', timestamp: performance.now() });
  }

  private handleMessage(message: DebugMessage): void {
    switch (message.type) {
      case 'handshake-response':
        this.connected = true;
        this.connectionInfo = {
          appName: (message as { appName?: string }).appName ?? 'Unknown',
          backend: (message as { backend?: string }).backend ?? 'webgl',
          threeVersion: (message as { threeVersion?: string }).threeVersion ?? 'unknown',
          probeVersion: (message as { probeVersion?: string }).probeVersion ?? '0.0.0',
        };
        this.notifyDataChange();
        break;

      case 'frame-stats':
        const stats = (message as { stats: FrameStats }).stats;
        this.latestStats = stats;
        this.frameHistory.push(stats.cpuTimeMs);
        if (this.frameHistory.length > this.maxHistoryLength) this.frameHistory.shift();

        const fps = stats.cpuTimeMs > 0 ? 1000 / stats.cpuTimeMs : 0;
        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > this.maxHistoryLength) this.fpsHistory.shift();

        this.latestBenchmark = calculateBenchmarkScore(stats);

        // Throttle UI updates
        const now = performance.now();
        if (now - this.lastStatsUpdate >= this.statsUpdateInterval) {
          this.lastStatsUpdate = now;
          this.notifyDataChange();
        }
        break;

      case 'snapshot':
        this.snapshot = (message as { snapshot: SceneSnapshot }).snapshot;
        this.notifyDataChange();
        break;

      case 'selection-changed':
        const selectedMeta = (message as { selectedObject?: { debugId?: string } }).selectedObject;
        this.state.selectedNodeId = selectedMeta?.debugId ?? null;
        this.notifyStateChange();
        break;
    }
  }

  private sendToPage(message: Partial<DebugMessage>): void {
    if (this.port) {
      this.port.postMessage(message);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PanelController Implementation
  // ═══════════════════════════════════════════════════════════════

  getData(): PanelData {
    return {
      connected: this.connected,
      connectionInfo: this.connectionInfo,
      snapshot: this.snapshot,
      latestStats: this.latestStats,
      latestBenchmark: this.latestBenchmark,
      frameHistory: [...this.frameHistory],
      fpsHistory: [...this.fpsHistory],
    };
  }

  getState(): PanelState {
    return this.state;
  }

  setState(partial: Partial<PanelState>): void {
    this.state = { ...this.state, ...partial };
    this.notifyStateChange();
  }

  // ═══════════════════════════════════════════════════════════════
  // Node Actions
  // ═══════════════════════════════════════════════════════════════

  selectNode(debugId: string | null): void {
    this.state.selectedNodeId = debugId;
    this.sendToPage({
      type: 'select-object',
      timestamp: performance.now(),
      debugId,
    } as DebugMessage);
    this.notifyStateChange();
  }

  hoverNode(debugId: string | null): void {
    this.sendToPage({
      type: 'hover-object',
      timestamp: performance.now(),
      debugId,
    } as DebugMessage);
  }

  toggleNodeExpanded(debugId: string): void {
    const newExpanded = new Set(this.state.expandedNodes);
    if (newExpanded.has(debugId)) {
      newExpanded.delete(debugId);
    } else {
      newExpanded.add(debugId);
    }
    this.state.expandedNodes = newExpanded;
    this.notifyStateChange();
  }

  toggleNodeVisibility(debugId: string): void {
    this.sendToPage({
      type: 'toggle-visibility',
      timestamp: performance.now(),
      debugId,
    } as DebugMessage);
    // Request snapshot update
    this.sendToPage({ type: 'request-snapshot', timestamp: performance.now() });
  }

  // ═══════════════════════════════════════════════════════════════
  // Material Actions
  // ═══════════════════════════════════════════════════════════════

  selectMaterial(uuid: string | null): void {
    this.state.selectedMaterialId = uuid;
    this.notifyStateChange();
  }

  updateMaterialProperty(uuid: string, property: string, value: unknown): void {
    this.sendToPage({
      type: 'update-material-property',
      timestamp: performance.now(),
      materialUuid: uuid,
      property,
      value,
    } as DebugMessage);
    // Request snapshot update after a short delay
    setTimeout(() => {
      this.sendToPage({ type: 'request-snapshot', timestamp: performance.now() });
    }, 50);
  }

  // ═══════════════════════════════════════════════════════════════
  // Geometry Actions
  // ═══════════════════════════════════════════════════════════════

  selectGeometry(uuid: string | null): void {
    this.state.selectedGeometryId = uuid;
    this.notifyStateChange();
  }

  toggleGeometryVisualization(uuid: string, type: 'wireframe' | 'boundingBox' | 'normals'): void {
    const set = new Set(this.state.geometryVisualization[type]);
    const enabled = !set.has(uuid);

    if (enabled) {
      set.add(uuid);
    } else {
      set.delete(uuid);
    }

    this.sendToPage({
      type: 'geometry-visualization',
      timestamp: performance.now(),
      geometryUuid: uuid,
      visualization: type,
      enabled,
    } as DebugMessage);

    this.state.geometryVisualization = {
      ...this.state.geometryVisualization,
      [type]: set,
    };
    this.notifyStateChange();
  }

  // ═══════════════════════════════════════════════════════════════
  // Texture Actions
  // ═══════════════════════════════════════════════════════════════

  selectTexture(uuid: string | null): void {
    this.state.selectedTextureId = uuid;
    this.notifyStateChange();
  }

  setTexturePreviewChannel(channel: 'rgb' | 'r' | 'g' | 'b' | 'a'): void {
    this.state.texturePreviewChannel = channel;
    this.notifyStateChange();
  }

  // ═══════════════════════════════════════════════════════════════
  // Event Subscriptions
  // ═══════════════════════════════════════════════════════════════

  onDataChange(callback: () => void): () => void {
    this.dataChangeCallbacks.add(callback);
    return () => this.dataChangeCallbacks.delete(callback);
  }

  onStateChange(callback: () => void): () => void {
    this.stateChangeCallbacks.add(callback);
    return () => this.stateChangeCallbacks.delete(callback);
  }

  requestRender(): void {
    if (this.renderCallback) {
      this.renderCallback();
    }
  }

  setRenderCallback(callback: () => void): void {
    this.renderCallback = callback;
  }

  // ═══════════════════════════════════════════════════════════════
  // Notification
  // ═══════════════════════════════════════════════════════════════

  private notifyDataChange(): void {
    this.dataChangeCallbacks.forEach((cb) => cb());
    this.requestRender();
  }

  private notifyStateChange(): void {
    this.stateChangeCallbacks.forEach((cb) => cb());
    this.requestRender();
  }

  // ═══════════════════════════════════════════════════════════════
  // Cleanup
  // ═══════════════════════════════════════════════════════════════

  destroy(): void {
    if (this.port) {
      this.port.disconnect();
      this.port = null;
    }
    this.dataChangeCallbacks.clear();
    this.stateChangeCallbacks.clear();
    this.renderCallback = null;
  }
}

