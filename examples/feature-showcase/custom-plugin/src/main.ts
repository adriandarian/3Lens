import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe, type DevtoolPlugin, type DevtoolContext, type PanelRenderContext } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

/**
 * Custom Plugin Example
 * 
 * Demonstrates how to create custom 3Lens plugins with:
 * - Custom panels with live data
 * - Plugin settings schema
 * - Toolbar actions
 * - Context menu items
 * - Inter-plugin messaging
 * - Plugin state storage
 * - Toast notifications
 * 
 * Open the 3Lens overlay (Ctrl+Shift+D) to see the plugins in action!
 */

// =============================================================================
// CUSTOM PLUGIN DEFINITION
// =============================================================================

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return String(num);
}

/**
 * Example: Stats Monitor Plugin
 * 
 * A comprehensive plugin demonstrating all major plugin features:
 * - Custom panel showing real-time stats
 * - Configurable settings
 * - Toolbar actions for quick toggles
 * - Context menu integration
 * - State persistence
 * - Message handling
 */
const StatsMonitorPlugin: DevtoolPlugin = {
  metadata: {
    id: 'custom.stats-monitor',
    name: 'Stats Monitor',
    version: '1.0.0',
    description: 'Displays real-time scene statistics with customizable tracking',
    author: 'Custom Plugin Example',
    icon: '📊',
    tags: ['stats', 'performance', 'monitoring'],
  },

  // Settings schema for the plugin settings UI
  settings: {
    fields: [
      {
        key: 'refreshRate',
        label: 'Refresh Rate (ms)',
        type: 'number',
        defaultValue: 100,
        description: 'How often to update stats display',
        min: 16,
        max: 1000,
        step: 10,
      },
      {
        key: 'showTriangles',
        label: 'Show Triangle Count',
        type: 'boolean',
        defaultValue: true,
        description: 'Display triangle count in stats',
      },
      {
        key: 'showDrawCalls',
        label: 'Show Draw Calls',
        type: 'boolean',
        defaultValue: true,
        description: 'Display draw call count in stats',
      },
      {
        key: 'highlightColor',
        label: 'Highlight Color',
        type: 'color',
        defaultValue: '#61dafb',
        description: 'Color for highlighted stats',
      },
      {
        key: 'warningThreshold',
        label: 'Warning Threshold',
        type: 'select',
        defaultValue: 'medium',
        description: 'When to show performance warnings',
        options: [
          { value: 'low', label: 'Low (100K tris)' },
          { value: 'medium', label: 'Medium (500K tris)' },
          { value: 'high', label: 'High (1M tris)' },
        ],
      },
    ],
  },

  // Lifecycle: called when plugin is activated
  activate(context: DevtoolContext) {
    context.log('Stats Monitor plugin activated!');
    
    // Initialize plugin state
    context.setState('activatedAt', Date.now());
    context.setState('updateCount', 0);
    context.setState('isPaused', false);
    
    // Show activation toast
    context.showToast('Stats Monitor activated!', 'success');
    
    // Subscribe to messages from other plugins
    context.onMessage((message) => {
      if (message.type === 'REQUEST_STATS') {
        const stats = context.getFrameStats();
        context.sendMessage(message.source, 'STATS_RESPONSE', {
          triangles: stats?.triangleCount ?? 0,
          drawCalls: stats?.drawCallCount ?? 0,
          fps: stats?.fps ?? 0,
        });
      }
    });
  },

  // Lifecycle: called when plugin is deactivated
  deactivate(context: DevtoolContext) {
    context.log('Stats Monitor plugin deactivated');
    context.showToast('Stats Monitor deactivated', 'info');
  },

  // Settings change handler
  onSettingsChange(settings: Record<string, unknown>, context: DevtoolContext) {
    context.log('Settings changed', settings);
    context.requestRender(); // Re-render panel with new settings
  },

  // Panel definitions
  panels: [
    {
      id: 'stats-panel',
      name: 'Live Stats',
      icon: '📈',
      order: 10,
      
      // Render function returns HTML string
      render(ctx: PanelRenderContext): string {
        const stats = ctx.frameStats;
        const state = ctx.state;
        const isPaused = state.isPaused as boolean ?? false;
        const updateCount = state.updateCount as number ?? 0;
        
        if (!stats) {
          return `
            <div class="stats-plugin-container">
              <div class="stats-loading">Waiting for frame data...</div>
            </div>
          `;
        }
        
        return `
          <div class="stats-plugin-container">
            <div class="stats-header">
              <span class="stats-title">📊 Live Statistics</span>
              <span class="stats-status ${isPaused ? 'paused' : 'active'}">
                ${isPaused ? '⏸ Paused' : '● Live'}
              </span>
            </div>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">🎬</div>
                <div class="stat-content">
                  <div class="stat-value">${stats.fps.toFixed(1)}</div>
                  <div class="stat-label">FPS</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">🔺</div>
                <div class="stat-content">
                  <div class="stat-value">${formatNumber(stats.triangleCount)}</div>
                  <div class="stat-label">Triangles</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">🖌️</div>
                <div class="stat-content">
                  <div class="stat-value">${stats.drawCallCount}</div>
                  <div class="stat-label">Draw Calls</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">⏱️</div>
                <div class="stat-content">
                  <div class="stat-value">${stats.cpuTime.toFixed(2)}ms</div>
                  <div class="stat-label">CPU Time</div>
                </div>
              </div>
            </div>
            
            <div class="stats-footer">
              <span>Updates: ${updateCount}</span>
              <button class="stats-btn" data-action="toggle-pause">
                ${isPaused ? '▶ Resume' : '⏸ Pause'}
              </button>
              <button class="stats-btn" data-action="export">
                📥 Export
              </button>
            </div>
          </div>
        `;
      },
      
      // Called after panel is mounted to DOM
      onMount(container: HTMLElement, context: DevtoolContext) {
        // Inject CSS styles
        const styleId = 'stats-plugin-styles';
        if (!document.getElementById(styleId)) {
          const style = document.createElement('style');
          style.id = styleId;
          style.textContent = `
            .stats-plugin-container {
              padding: 12px;
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            }
            .stats-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
            }
            .stats-title {
              font-size: 14px;
              font-weight: 600;
            }
            .stats-status {
              font-size: 11px;
              padding: 3px 8px;
              border-radius: 10px;
            }
            .stats-status.active {
              background: #1a4a2a;
              color: #90EE90;
            }
            .stats-status.paused {
              background: #4a3a1a;
              color: #FFD700;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
              margin-bottom: 12px;
            }
            .stat-card {
              background: var(--panel-bg, #1a1a2a);
              border-radius: 6px;
              padding: 10px;
              display: flex;
              gap: 10px;
              align-items: center;
            }
            .stat-icon {
              font-size: 20px;
            }
            .stat-content {
              flex: 1;
            }
            .stat-value {
              font-size: 16px;
              font-weight: bold;
              color: var(--accent, #61dafb);
            }
            .stat-label {
              font-size: 10px;
              color: #888;
              text-transform: uppercase;
            }
            .stats-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              color: #666;
            }
            .stats-btn {
              background: var(--btn-bg, #2a2a3a);
              border: 1px solid #444;
              color: #e0e0e0;
              padding: 4px 10px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 11px;
            }
            .stats-btn:hover {
              background: var(--btn-hover, #3a3a4a);
            }
            .stats-loading {
              text-align: center;
              color: #666;
              padding: 20px;
            }
          `;
          document.head.appendChild(style);
        }
        
        // Add event listeners
        container.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          const action = target.dataset.action;
          
          if (action === 'toggle-pause') {
            const isPaused = context.getState<boolean>('isPaused') ?? false;
            context.setState('isPaused', !isPaused);
            context.requestRender();
          } else if (action === 'export') {
            const stats = context.getFrameStats();
            if (stats) {
              const data = JSON.stringify(stats, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'stats-export.json';
              a.click();
              URL.revokeObjectURL(url);
              context.showToast('Stats exported!', 'success');
            }
          }
        });
        
        context.log('Stats panel mounted');
      },
      
      // Called when panel is about to be unmounted
      onUnmount(_container: HTMLElement) {
        // Cleanup if needed
      },
    },
  ],

  // Toolbar action definitions
  toolbarActions: [
    {
      id: 'toggle-monitor',
      name: 'Toggle Stats Monitor',
      icon: '📊',
      order: 50,
      isToggle: true,
      isActive: () => true, // Always show as active when plugin is active
      onClick(context: DevtoolContext) {
        const isPaused = context.getState<boolean>('isPaused') ?? false;
        context.setState('isPaused', !isPaused);
        context.showToast(isPaused ? 'Monitoring resumed' : 'Monitoring paused', 'info');
        context.requestRender();
      },
    },
    {
      id: 'clear-stats',
      name: 'Reset Stats',
      icon: '🔄',
      order: 51,
      onClick(context: DevtoolContext) {
        context.setState('updateCount', 0);
        context.showToast('Stats reset', 'info');
        context.requestRender();
      },
    },
  ],

  // Context menu items
  contextMenuItems: [
    {
      id: 'log-object-stats',
      label: 'Log Object Stats',
      icon: '📋',
      target: 'scene-tree',
      order: 100,
      onClick(context) {
        const node = context.targetNode;
        if (node) {
          context.log(`Object Stats: ${node.name}`, {
            type: node.type,
            children: node.children?.length ?? 0,
            visible: node.visible,
          });
          context.showToast(`Logged stats for ${node.name}`, 'info');
        }
      },
      isVisible(context) {
        return context.targetNode !== null;
      },
    },
    {
      id: 'highlight-expensive',
      label: 'Find Similar Objects',
      icon: 'Search',
      target: 'scene-tree',
      order: 101,
      onClick(context) {
        const node = context.targetNode;
        if (node) {
          context.showToast(`Finding objects similar to ${node.name}...`, 'info');
        }
      },
    },
  ],
};

// =============================================================================
// HELPER PLUGIN: Message Receiver
// =============================================================================

/**
 * A simple plugin that demonstrates inter-plugin messaging
 */
const MessageReceiverPlugin: DevtoolPlugin = {
  metadata: {
    id: 'custom.message-receiver',
    name: 'Message Receiver',
    version: '1.0.0',
    description: 'Demonstrates plugin-to-plugin communication',
    icon: '📬',
    tags: ['utility', 'messaging'],
  },

  activate(context: DevtoolContext) {
    context.log('Message Receiver activated');
    
    // Listen for messages
    context.onMessage((message) => {
      context.log(`Received message: ${message.type}`, { 
        from: message.source,
        payload: message.payload 
      });
    });
  },

  panels: [
    {
      id: 'messages',
      name: 'Messages',
      icon: '📬',
      render(_ctx) {
        return `
          <div style="padding: 12px;">
            <h3 style="margin: 0 0 8px;">📬 Message Log</h3>
            <p style="color: #888; font-size: 12px;">
              This plugin listens for inter-plugin messages.
              Open the 3Lens console to see received messages.
            </p>
          </div>
        `;
      },
    },
  ],
};

// =============================================================================
// SCENE SETUP
// =============================================================================

const scene = new THREE.Scene();
scene.name = 'CustomPluginScene';
scene.background = new THREE.Color(0x0a0a0f);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 4, 7);
camera.name = 'MainCamera';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.getElementById('app')!.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

// =============================================================================
// SCENE CONTENT
// =============================================================================

function createDemoScene() {
  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15),
    new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.8 })
  );
  ground.name = 'Ground';
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid
  const grid = new THREE.GridHelper(15, 15, 0x333355, 0x222244);
  grid.name = 'Grid';
  scene.add(grid);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  ambient.name = 'AmbientLight';
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 1);
  directional.name = 'DirectionalLight';
  directional.position.set(5, 10, 5);
  directional.castShadow = true;
  scene.add(directional);

  // Create various objects for stats
  const geometries = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.CylinderGeometry(0.3, 0.5, 1, 16),
    new THREE.TorusGeometry(0.4, 0.15, 16, 32),
    new THREE.ConeGeometry(0.4, 1, 16),
    new THREE.IcosahedronGeometry(0.5, 1),
  ];

  const colors = [0xe74c3c, 0x2ecc71, 0x3498db, 0xf39c12, 0x9b59b6, 0x1abc9c];

  // Create a grid of objects
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      const index = Math.abs(x + z) % geometries.length;
      const mesh = new THREE.Mesh(
        geometries[index],
        new THREE.MeshStandardMaterial({ 
          color: colors[index],
          roughness: 0.3,
          metalness: 0.2,
        })
      );
      mesh.name = `Object_${x + 3}_${z + 3}`;
      mesh.position.set(x * 2, 0.5 + Math.abs(x + z) * 0.1, z * 2);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }
  }
}

createDemoScene();

// =============================================================================
// 3LENS SETUP
// =============================================================================

const probe = createProbe({
  name: 'CustomPluginProbe',
  sampling: {
    frameStatsInterval: 1,
    sceneSnapshotInterval: 30,
  },
});

probe.observeRenderer(renderer);
probe.observeScene(scene);

const overlay = bootstrapOverlay({
  probe,
  position: 'right',
  defaultWidth: 380,
  defaultOpen: true,
});

// Register and activate the plugins
overlay.registerAndActivatePlugin(StatsMonitorPlugin);
overlay.registerAndActivatePlugin(MessageReceiverPlugin);

// =============================================================================
// ANIMATION LOOP
// =============================================================================

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  
  // Animate some objects
  const time = Date.now() * 0.001;
  scene.children.forEach((child, i) => {
    if (child.name.startsWith('Object_')) {
      child.rotation.y = time + i * 0.1;
    }
  });
  
  renderer.render(scene, camera);
}

animate();

// =============================================================================
// RESIZE HANDLING
// =============================================================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log(`
🔌 Custom Plugin Example
========================
This example demonstrates how to create custom 3Lens plugins.

Plugin Features Demonstrated:
- Custom panels with live data rendering
- Plugin settings with various field types
- Toolbar actions
- Context menu items
- Inter-plugin messaging
- Plugin state storage
- Toast notifications

Press Ctrl+Shift+D to open the 3Lens overlay.
The Stats Monitor and Message Receiver plugins are already registered!
`);
