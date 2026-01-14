var qe=Object.defineProperty;var Ye=(r,e,t)=>e in r?qe(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var h=(r,e,t)=>Ye(r,typeof e!="symbol"?e+"":e,t);import{S as Ze,P as xe,W as Ke,a as Xe,A as _e,D as Je,b as Qe,c as et,d as oe,M as j,e as R,f as ye,G as we,B as $e,T as tt,g as st,L as rt,C as nt,h as at,i as ge,j as ke,k as Se,l as it,m as J}from"./createProbe-AfBl9El3.js";const lt={targetFps:60,maxDrawCalls:1e3,maxTriangles:2e6,maxTextureMemory:256*1024*1024,maxGeometryMemory:128*1024*1024,weights:{timing:.35,drawCalls:.2,geometry:.2,memory:.15,stateChanges:.1}};function ot(r,e=lt){const t=[],s=[],n=1e3/e.targetFps,a=r.cpuTimeMs/n;let i;a<=1?i=100:a<=1.5?i=100-(a-1)*100:a<=2?i=50-(a-1.5)*60:i=Math.max(0,20-(a-2)*10),i<80&&(t.push(`Frame time ${r.cpuTimeMs.toFixed(1)}ms exceeds budget`),s.push("Reduce geometry complexity or draw calls"));const l=r.drawCalls/e.maxDrawCalls;let o;l<=.5?o=100:l<=1?o=100-(l-.5)*40:o=Math.max(0,80-(l-1)*40),o<80&&(t.push(`${r.drawCalls} draw calls is high`),s.push("Enable instancing or merge static geometries"));const d=r.triangles/e.maxTriangles;let c;d<=.5?c=100:d<=1?c=100-(d-.5)*40:c=Math.max(0,80-(d-1)*40),c<80&&(t.push(`${dt(r.triangles)} triangles is high`),s.push("Use LOD or reduce polygon count"));let p=100;if(r.memory){const v=r.memory.textureMemory/e.maxTextureMemory,b=r.memory.geometryMemory/e.maxGeometryMemory,k=Math.max(v,b);k<=.5?p=100:k<=1?p=100-(k-.5)*40:p=Math.max(0,80-(k-1)*40),p<80&&(t.push("High GPU memory usage"),s.push("Compress textures or reduce resolution"))}const g=r.drawCalls>0&&r.rendering?(r.rendering.programSwitches+r.rendering.textureBinds)/r.drawCalls:0;let u;g<=1?u=100:g<=2?u=100-(g-1)*30:u=Math.max(0,70-(g-2)*20),u<80&&(t.push("Excessive state changes"),s.push("Sort objects by material to reduce shader switches"));const m=i*e.weights.timing+o*e.weights.drawCalls+c*e.weights.geometry+p*e.weights.memory+u*e.weights.stateChanges;let f;return m>=90?f="A":m>=75?f="B":m>=60?f="C":m>=40?f="D":f="F",{overall:Math.round(m),breakdown:{timing:Math.round(i),drawCalls:Math.round(o),geometry:Math.round(c),memory:Math.round(p),stateChanges:Math.round(u)},grade:f,topIssues:t.slice(0,3),suggestions:s.slice(0,3)}}function dt(r){return r>=1e6?(r/1e6).toFixed(2)+"M":r>=1e3?(r/1e3).toFixed(1)+"K":r.toString()}function Q(r,e=500){const t=new Map;return s=>{if(t.has(s))return t.get(s);const n=r(s);if(t.size>=e){const a=t.keys().next().value;t.delete(a)}return t.set(s,n),n}}const M=Q(r=>r>=1e6?(r/1e6).toFixed(1)+"M":r>=1e3?(r/1e3).toFixed(1)+"K":r.toString()),y=Q(r=>r>=1073741824?(r/1073741824).toFixed(2)+" GB":r>=1048576?(r/1048576).toFixed(2)+" MB":r>=1024?(r/1024).toFixed(2)+" KB":r+" B"),ue=Q(r=>{const e=r.toLowerCase();return e.includes("scene")?"scene":e.includes("mesh")?"mesh":e.includes("group")?"group":e.includes("light")?"light":e.includes("camera")?"camera":e.includes("bone")?"bone":"object"},100),me=Q(r=>{const e=r.toLowerCase();return e.includes("scene")?"S":e.includes("mesh")?"M":e.includes("group")?"G":e.includes("light")?"L":e.includes("camera")?"C":e.includes("bone")?"B":"O"},100),ct=`
/* ═══════════════════════════════════════════════════════════════
   3LENS THEME SYSTEM
   ═══════════════════════════════════════════════════════════════ */

/* Base Typography & Constants (theme-independent) */
:root {
  --3lens-font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
  --3lens-font-sans: 'Geist', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;

  --3lens-radius-sm: 4px;
  --3lens-radius-md: 6px;
  --3lens-radius-lg: 8px;
  --3lens-radius-xl: 12px;

  /* Object type colors (consistent across themes) */
  --3lens-color-scene: #34d399;
  --3lens-color-mesh: #60a5fa;
  --3lens-color-group: #a78bfa;
  --3lens-color-light: #fbbf24;
  --3lens-color-camera: #f472b6;
  --3lens-color-object: #9ca3af;
}

/* ─────────────────────────────────────────────────────────────────
   DARK THEME (Default)
   ───────────────────────────────────────────────────────────────── */
.three-lens-root,
.three-lens-root[data-theme="dark"] {
  --3lens-bg-primary: #0a0e14;
  --3lens-bg-secondary: #0f1419;
  --3lens-bg-tertiary: #151b23;
  --3lens-bg-elevated: #1a222c;
  --3lens-bg-hover: #1f2937;
  --3lens-bg-active: #2d3a4d;

  --3lens-border: #2d3748;
  --3lens-border-subtle: #1e2738;
  --3lens-border-focus: #3b82f6;

  --3lens-text-primary: #e4e7eb;
  --3lens-text-secondary: #9ca3af;
  --3lens-text-tertiary: #6b7280;
  --3lens-text-disabled: #4b5563;
  --3lens-text-inverse: #0a0e14;

  --3lens-accent: #22d3ee;
  --3lens-accent-hover: #06b6d4;
  --3lens-accent-blue: #60a5fa;
  --3lens-accent-cyan: #22d3ee;
  --3lens-accent-emerald: #34d399;
  --3lens-accent-amber: #fbbf24;
  --3lens-accent-rose: #fb7185;
  --3lens-accent-violet: #a78bfa;

  --3lens-success: #10b981;
  --3lens-success-bg: rgba(16, 185, 129, 0.15);
  --3lens-warning: #f59e0b;
  --3lens-warning-bg: rgba(245, 158, 11, 0.15);
  --3lens-error: #ef4444;
  --3lens-error-bg: rgba(239, 68, 68, 0.15);
  --3lens-info: #3b82f6;
  --3lens-info-bg: rgba(59, 130, 246, 0.15);

  --3lens-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --3lens-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --3lens-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);

  --3lens-overlay-bg: rgba(0, 0, 0, 0.5);
  --3lens-backdrop-blur: blur(8px);

  color-scheme: dark;
}

/* ─────────────────────────────────────────────────────────────────
   LIGHT THEME
   ───────────────────────────────────────────────────────────────── */
.three-lens-root[data-theme="light"] {
  --3lens-bg-primary: #ffffff;
  --3lens-bg-secondary: #f8fafc;
  --3lens-bg-tertiary: #f1f5f9;
  --3lens-bg-elevated: #ffffff;
  --3lens-bg-hover: #e2e8f0;
  --3lens-bg-active: #cbd5e1;

  --3lens-border: #e2e8f0;
  --3lens-border-subtle: #f1f5f9;
  --3lens-border-focus: #3b82f6;

  --3lens-text-primary: #0f172a;
  --3lens-text-secondary: #475569;
  --3lens-text-tertiary: #94a3b8;
  --3lens-text-disabled: #cbd5e1;
  --3lens-text-inverse: #ffffff;

  --3lens-accent: #0891b2;
  --3lens-accent-hover: #0e7490;
  --3lens-accent-blue: #3b82f6;
  --3lens-accent-cyan: #0891b2;
  --3lens-accent-emerald: #059669;
  --3lens-accent-amber: #d97706;
  --3lens-accent-rose: #e11d48;
  --3lens-accent-violet: #7c3aed;

  --3lens-success: #059669;
  --3lens-success-bg: rgba(5, 150, 105, 0.1);
  --3lens-warning: #d97706;
  --3lens-warning-bg: rgba(217, 119, 6, 0.1);
  --3lens-error: #dc2626;
  --3lens-error-bg: rgba(220, 38, 38, 0.1);
  --3lens-info: #2563eb;
  --3lens-info-bg: rgba(37, 99, 235, 0.1);

  --3lens-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  --3lens-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  --3lens-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);

  --3lens-overlay-bg: rgba(255, 255, 255, 0.8);
  --3lens-backdrop-blur: blur(8px);

  color-scheme: light;
}

/* ─────────────────────────────────────────────────────────────────
   HIGH CONTRAST THEME (Accessibility)
   ───────────────────────────────────────────────────────────────── */
.three-lens-root[data-theme="high-contrast"] {
  --3lens-bg-primary: #000000;
  --3lens-bg-secondary: #0a0a0a;
  --3lens-bg-tertiary: #141414;
  --3lens-bg-elevated: #1a1a1a;
  --3lens-bg-hover: #262626;
  --3lens-bg-active: #333333;

  --3lens-border: #ffffff;
  --3lens-border-subtle: #808080;
  --3lens-border-focus: #ffff00;

  --3lens-text-primary: #ffffff;
  --3lens-text-secondary: #e0e0e0;
  --3lens-text-tertiary: #b0b0b0;
  --3lens-text-disabled: #666666;
  --3lens-text-inverse: #000000;

  --3lens-accent: #00ffff;
  --3lens-accent-hover: #00cccc;
  --3lens-accent-blue: #00bfff;
  --3lens-accent-cyan: #00ffff;
  --3lens-accent-emerald: #00ff00;
  --3lens-accent-amber: #ffff00;
  --3lens-accent-rose: #ff00ff;
  --3lens-accent-violet: #ff00ff;

  --3lens-success: #00ff00;
  --3lens-success-bg: rgba(0, 255, 0, 0.2);
  --3lens-warning: #ffff00;
  --3lens-warning-bg: rgba(255, 255, 0, 0.2);
  --3lens-error: #ff0000;
  --3lens-error-bg: rgba(255, 0, 0, 0.2);
  --3lens-info: #00bfff;
  --3lens-info-bg: rgba(0, 191, 255, 0.2);

  --3lens-shadow-sm: 0 0 0 1px #ffffff;
  --3lens-shadow-md: 0 0 0 2px #ffffff;
  --3lens-shadow-lg: 0 0 0 3px #ffffff;

  --3lens-overlay-bg: rgba(0, 0, 0, 0.9);
  --3lens-backdrop-blur: none;

  color-scheme: dark;
}

/* Reset */
.three-lens-root,
.three-lens-root * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ═══════════════════════════════════════════════════════════════
   FLOATING ACTION BUTTON (FAB)
   ═══════════════════════════════════════════════════════════════ */

.three-lens-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  background: var(--3lens-bg-primary);
  border: 2px solid var(--3lens-border);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--3lens-text-primary);
  box-shadow: var(--3lens-shadow-md), 0 0 20px rgba(34, 211, 238, 0.3);
  z-index: 999998;
  transition: all 150ms ease;
  user-select: none;
}

.three-lens-fab svg {
  width: 28px;
  height: 28px;
}

.three-lens-fab:hover {
  transform: scale(1.1);
  border-color: var(--3lens-accent-cyan);
  box-shadow: var(--3lens-shadow-lg), 0 0 30px rgba(34, 211, 238, 0.4);
}

.three-lens-fab:active {
  transform: scale(0.95);
}

.three-lens-fab.active {
  background: var(--3lens-bg-elevated);
  border-color: var(--3lens-accent-cyan);
}

/* ═══════════════════════════════════════════════════════════════
   PANEL MENU (appears when FAB is clicked)
   ═══════════════════════════════════════════════════════════════ */

.three-lens-menu {
  position: fixed;
  bottom: 80px;
  right: 20px;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-lg);
  padding: 8px;
  min-width: 180px;
  box-shadow: var(--3lens-shadow-lg);
  z-index: 999999;
  opacity: 0;
  transform: translateY(10px) scale(0.95);
  pointer-events: none;
  transition: all 150ms ease;
}

.three-lens-menu.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.three-lens-menu-header {
  padding: 8px 12px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--3lens-text-tertiary);
  border-bottom: 1px solid var(--3lens-border-subtle);
  margin-bottom: 4px;
}

.three-lens-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-primary);
  font-family: var(--3lens-font-sans);
  font-size: 13px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 100ms ease;
}

.three-lens-menu-item:hover {
  background: var(--3lens-bg-hover);
}

.three-lens-menu-item.active {
  background: rgba(34, 211, 238, 0.1);
  color: var(--3lens-accent-cyan);
}

.three-lens-menu-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
}

.three-lens-menu-icon.scene { background: var(--3lens-color-scene); color: #000; }
.three-lens-menu-icon.stats { background: var(--3lens-accent-cyan); color: #000; }
.three-lens-menu-icon.inspector { background: var(--3lens-accent-blue); color: #000; }
.three-lens-menu-icon.textures { background: var(--3lens-accent-amber); color: #000; }
.three-lens-menu-icon.materials { background: var(--3lens-accent-violet); color: #000; }

/* ═══════════════════════════════════════════════════════════════
   FLOATING PANELS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-panel {
  position: fixed;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-lg);
  box-shadow: var(--3lens-shadow-lg);
  z-index: 999997;
  min-width: 280px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  font-family: var(--3lens-font-sans);
  font-size: 13px;
  color: var(--3lens-text-primary);
  overflow: hidden;
  transition: box-shadow 150ms ease;
}

/* Disable transitions during resize */
.three-lens-panel.resizing {
  transition: none !important;
}

/* Smooth width animation only when not resizing */
.three-lens-panel:not(.resizing) {
  transition: box-shadow 150ms ease, width 150ms ease, min-width 150ms ease;
}

.three-lens-panel:hover {
  box-shadow: var(--3lens-shadow-lg), 0 0 0 1px var(--3lens-border-focus);
}

.three-lens-panel.focused {
  z-index: 999998;
  box-shadow: var(--3lens-shadow-lg), 0 0 0 2px var(--3lens-accent-cyan);
}

.three-lens-panel.minimized {
  min-height: auto;
  height: auto !important;
}

.three-lens-panel.minimized .three-lens-panel-content {
  display: none;
}

.three-lens-panel.minimized .three-lens-panel-resize {
  display: none;
}

/* Panel Header (Draggable) */
.three-lens-panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: linear-gradient(180deg, var(--3lens-bg-secondary), var(--3lens-bg-primary));
  border-bottom: 1px solid var(--3lens-border);
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
}

.three-lens-panel-header:active {
  cursor: grabbing;
}

.three-lens-panel-icon {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.three-lens-panel-title {
  font-weight: 600;
  font-size: 12px;
  color: var(--3lens-text-primary);
  white-space: nowrap;
}

/* When no search bar, title pushes controls right */
.three-lens-panel-header:not(:has(.three-lens-header-search)) .three-lens-panel-title {
  flex: 1;
}

.three-lens-header-search {
  flex: 1;
  margin: 0 12px;
  min-width: 120px;
}

.header-search-input {
  width: 100%;
  padding: 5px 10px;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-primary);
  font-size: 11px;
  font-family: var(--3lens-font-sans);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.header-search-input:focus {
  border-color: var(--3lens-accent-blue);
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.15);
}

.header-search-input::placeholder {
  color: var(--3lens-text-tertiary);
}

.three-lens-panel-controls {
  display: flex;
  gap: 4px;
}

.three-lens-panel-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: var(--3lens-radius-sm);
  background: transparent;
  color: var(--3lens-text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease;
}

.three-lens-panel-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.three-lens-panel-btn.close:hover {
  background: var(--3lens-error);
  color: white;
}

/* Panel Content */
.three-lens-panel-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.three-lens-panel-content::-webkit-scrollbar {
  width: 6px;
}

.three-lens-panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.three-lens-panel-content::-webkit-scrollbar-thumb {
  background: var(--3lens-border);
  border-radius: 3px;
}

/* Panel Resize Handle */
.three-lens-panel-resize {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
  opacity: 0.5;
  transition: opacity 100ms ease;
}

.three-lens-panel-resize:hover {
  opacity: 1;
}

.three-lens-panel-resize::after {
  content: '';
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  border-right: 2px solid var(--3lens-text-tertiary);
  border-bottom: 2px solid var(--3lens-text-tertiary);
}

/* ═══════════════════════════════════════════════════════════════
   STATS PANEL CONTENT
   ═══════════════════════════════════════════════════════════════ */

.three-lens-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.three-lens-stat-card {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  padding: 6px 8px;
}

.three-lens-stat-label {
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 2px;
}

.three-lens-stat-value {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
  line-height: 1;
}

.three-lens-stat-value.warning { color: var(--3lens-warning); }
.three-lens-stat-value.error { color: var(--3lens-error); }

.three-lens-stat-unit {
  font-size: 9px;
  color: var(--3lens-text-secondary);
}

/* Chart */
.three-lens-chart {
  margin-top: 8px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
}

.three-lens-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  gap: 6px;
}

.three-lens-chart-title {
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
}

.three-lens-chart-controls {
  display: flex;
  align-items: center;
  gap: 3px;
  flex: 1;
  justify-content: center;
}

.three-lens-chart-btn {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-tertiary);
  cursor: pointer;
  font-size: 10px;
  transition: all 100ms ease;
}

.three-lens-chart-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
  border-color: var(--3lens-accent-blue);
}

.three-lens-chart-btn:active {
  transform: scale(0.95);
}

.three-lens-chart-zoom-label {
  font-size: 9px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
  min-width: 24px;
  text-align: center;
}

.three-lens-chart-value {
  font-family: var(--3lens-font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--3lens-accent-emerald);
}

.three-lens-chart-container {
  position: relative;
  cursor: grab;
}

.three-lens-chart-container:active {
  cursor: grabbing;
}

.three-lens-chart-canvas {
  width: 100%;
  height: 60px;
  background: var(--3lens-bg-primary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-chart-tooltip {
  position: absolute;
  background: var(--3lens-bg-elevated);
  border: 1px solid var(--3lens-border-focus);
  border-radius: var(--3lens-radius-sm);
  padding: 6px 10px;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  pointer-events: none;
  z-index: 10;
  box-shadow: var(--3lens-shadow-md);
}

.three-lens-tooltip-time {
  color: var(--3lens-accent-cyan);
  font-weight: 600;
}

.three-lens-tooltip-fps {
  color: var(--3lens-text-secondary);
  font-size: 9px;
  margin-top: 2px;
}

.three-lens-chart-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-chart-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.three-lens-chart-stat-label {
  font-size: 7px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-disabled);
}

.three-lens-chart-stat-value {
  font-size: 9px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-chart-stat-value.warning {
  color: var(--3lens-warning);
}

/* ═══════════════════════════════════════════════════════════════
   SCENE SPLIT VIEW (Tree + Inspector integrated)
   ═══════════════════════════════════════════════════════════════ */

.three-lens-split-view {
  display: flex;
  gap: 0;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.three-lens-tree-pane {
  flex: 1;
  min-width: 180px;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid var(--3lens-border);
  padding: 8px;
}

.three-lens-tree-pane::-webkit-scrollbar {
  width: 6px;
}

.three-lens-tree-pane::-webkit-scrollbar-track {
  background: transparent;
}

.three-lens-tree-pane::-webkit-scrollbar-thumb {
  background: var(--3lens-border);
  border-radius: 3px;
}

.three-lens-inspector-pane {
  width: 240px;
  min-width: 200px;
  max-width: 300px;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--3lens-bg-secondary);
  padding: 12px;
}

.three-lens-inspector-pane::-webkit-scrollbar {
  width: 6px;
}

.three-lens-inspector-pane::-webkit-scrollbar-track {
  background: transparent;
}

.three-lens-inspector-pane::-webkit-scrollbar-thumb {
  background: var(--3lens-border);
  border-radius: 3px;
}

/* No Selection State */
.three-lens-no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 24px;
}

.three-lens-no-selection-icon {
  font-size: 28px;
  margin-bottom: 8px;
  opacity: 0.6;
}

.three-lens-no-selection-text {
  font-size: 11px;
  line-height: 1.4;
}

/* Remove padding from panel content for split view and full tree */
.three-lens-panel-content:has(.three-lens-split-view),
.three-lens-panel-content:has(.three-lens-tree-full),
.three-lens-panel-content:has(.panel-split-view),
.three-lens-panel-content:has(.panel-empty-state) {
  padding: 0;
}

/* Auto-height scene panel */
.three-lens-panel:has(.three-lens-tree-full),
.three-lens-panel:has(.three-lens-split-view) {
  height: auto;
  max-height: 80vh;
}

/* Ensure panel content constrains height for scrolling */
.three-lens-panel:has(.three-lens-split-view) .three-lens-panel-content {
  max-height: calc(80vh - 50px);
  overflow: hidden;
}

/* Full width tree (no selection) */
.three-lens-tree-full {
  overflow: auto;
  padding: 8px;
  height: 100%;
}

.three-lens-tree-full::-webkit-scrollbar {
  width: 6px;
}

.three-lens-tree-full::-webkit-scrollbar-track {
  background: transparent;
}

.three-lens-tree-full::-webkit-scrollbar-thumb {
  background: var(--3lens-border);
  border-radius: 3px;
}

/* ═══════════════════════════════════════════════════════════════
   SCENE TREE
   ═══════════════════════════════════════════════════════════════ */

.three-lens-scene-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.three-lens-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 11px;
  color: var(--3lens-text-secondary);
  user-select: none;
}

.three-lens-toggle input {
  display: none;
}

.three-lens-toggle-slider {
  position: relative;
  width: 32px;
  height: 18px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: 9px;
  transition: all 150ms ease;
}

.three-lens-toggle-slider::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  background: var(--3lens-text-tertiary);
  border-radius: 50%;
  transition: all 150ms ease;
}

.three-lens-toggle input:checked + .three-lens-toggle-slider {
  background: var(--3lens-accent-cyan);
  border-color: var(--3lens-accent-cyan);
}

.three-lens-toggle input:checked + .three-lens-toggle-slider::after {
  left: 16px;
  background: var(--3lens-bg-primary);
}

.three-lens-toggle-label {
  font-weight: 500;
}

.three-lens-toggle:hover .three-lens-toggle-slider {
  border-color: var(--3lens-accent-blue);
}

.three-lens-tree {
  font-size: 12px;
}

.three-lens-node {
  user-select: none;
}

.three-lens-node-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-radius: var(--3lens-radius-sm);
  cursor: pointer;
  transition: background 100ms ease;
}

.three-lens-node-header:hover {
  background: var(--3lens-bg-hover);
}

.three-lens-node-header.selected {
  background: rgba(96, 165, 250, 0.25);
  outline: 1px solid var(--3lens-accent-blue);
  box-shadow: inset 3px 0 0 var(--3lens-accent-cyan);
}

.three-lens-node-header.selected .three-lens-node-name {
  color: var(--3lens-accent-cyan);
  font-weight: 600;
}

.three-lens-node-header.selected .three-lens-node-type {
  color: var(--3lens-accent-blue);
}

.three-lens-node-toggle {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--3lens-text-tertiary);
  flex-shrink: 0;
}

.three-lens-node-toggle.expanded svg {
  transform: rotate(90deg);
}

.three-lens-node-toggle.hidden {
  visibility: hidden;
}

.three-lens-node-icon {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 600;
  flex-shrink: 0;
}

.three-lens-node-icon.mesh { background: var(--3lens-color-mesh); color: #000; }
.three-lens-node-icon.scene { background: var(--3lens-color-scene); color: #000; }
.three-lens-node-icon.group { background: var(--3lens-color-group); color: #000; }
.three-lens-node-icon.light { background: var(--3lens-color-light); color: #000; }
.three-lens-node-icon.camera { background: var(--3lens-color-camera); color: #000; }
.three-lens-node-icon.object { background: var(--3lens-text-tertiary); color: #000; }

.three-lens-node-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 1;
  min-width: 20px;
}

.three-lens-node-name.unnamed {
  font-style: italic;
  color: var(--3lens-text-tertiary);
}

.three-lens-visibility-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  margin-left: 4px;
  background: transparent;
  border: none;
  border-radius: 3px;
  color: var(--3lens-text-tertiary);
  cursor: pointer;
  opacity: 0;
  transition: all 100ms ease;
  flex-shrink: 0;
}

.three-lens-node-spacer {
  flex: 1;
  min-width: 8px;
}

.three-lens-node-type {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  font-family: var(--3lens-font-mono);
  flex-shrink: 0;
}

.three-lens-node-header:hover .three-lens-visibility-btn {
  opacity: 1;
}

.three-lens-visibility-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.three-lens-visibility-btn.visible {
  color: var(--3lens-accent-cyan);
}

.three-lens-visibility-btn.hidden {
  color: var(--3lens-text-disabled);
  opacity: 1;
}

.three-lens-node-header.hidden-object {
  opacity: 0.5;
}

.three-lens-node-header.hidden-object .three-lens-node-name {
  text-decoration: line-through;
  color: var(--3lens-text-disabled);
}

.three-lens-node-children {
  margin-left: 14px;
  border-left: 1px solid var(--3lens-border-subtle);
  padding-left: 4px;
}

/* ═══════════════════════════════════════════════════════════════
   COST HEATMAP COLORS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-node-header.cost-low {
  border-left: 2px solid var(--3lens-accent-green);
}

.three-lens-node-header.cost-medium {
  border-left: 2px solid var(--3lens-accent-yellow);
}

.three-lens-node-header.cost-high {
  border-left: 2px solid var(--3lens-accent-orange);
}

.three-lens-node-header.cost-critical {
  border-left: 2px solid var(--3lens-accent-red);
  background: rgba(239, 68, 68, 0.1);
}

.three-lens-cost-indicator {
  font-size: 8px;
  margin-left: 2px;
  flex-shrink: 0;
}

.three-lens-cost-indicator.cost-low { color: var(--3lens-accent-green); }
.three-lens-cost-indicator.cost-medium { color: var(--3lens-accent-yellow); }
.three-lens-cost-indicator.cost-high { color: var(--3lens-accent-orange); }
.three-lens-cost-indicator.cost-critical { color: var(--3lens-accent-red); }

/* ═══════════════════════════════════════════════════════════════
   COST ANALYSIS SECTION
   ═══════════════════════════════════════════════════════════════ */

.three-lens-cost-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  margin-bottom: 6px;
}

.three-lens-cost-level {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
}

.three-lens-cost-level.cost-low {
  background: rgba(34, 197, 94, 0.2);
  color: var(--3lens-accent-green);
}

.three-lens-cost-level.cost-medium {
  background: rgba(234, 179, 8, 0.2);
  color: var(--3lens-accent-yellow);
}

.three-lens-cost-level.cost-high {
  background: rgba(249, 115, 22, 0.2);
  color: var(--3lens-accent-orange);
}

.three-lens-cost-level.cost-critical {
  background: rgba(239, 68, 68, 0.2);
  color: var(--3lens-accent-red);
}

.three-lens-cost-score {
  font-size: 11px;
  font-weight: 600;
  color: var(--3lens-text-secondary);
}

.three-lens-cost-breakdown {
  margin-bottom: 8px;
}

.three-lens-cost-bar {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: var(--3lens-bg-tertiary);
  margin-bottom: 4px;
}

.three-lens-cost-bar-segment {
  height: 100%;
  min-width: 1px;
  transition: width 200ms ease;
}

.three-lens-cost-bar-segment.triangles { background: #60a5fa; }
.three-lens-cost-bar-segment.material { background: #a78bfa; }
.three-lens-cost-bar-segment.textures { background: #34d399; }
.three-lens-cost-bar-segment.shadows { background: #fbbf24; }

.three-lens-cost-legend {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.three-lens-cost-legend-item {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
}

.three-lens-cost-legend-item.triangles { color: #60a5fa; }
.three-lens-cost-legend-item.material { color: #a78bfa; }
.three-lens-cost-legend-item.textures { color: #34d399; }
.three-lens-cost-legend-item.shadows { color: #fbbf24; }

.three-lens-cost-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
}

.three-lens-cost-row {
  display: flex;
  align-items: center;
  font-size: 10px;
  padding: 2px 0;
}

.three-lens-cost-row-label {
  width: 60px;
  color: var(--3lens-text-secondary);
}

.three-lens-cost-row-value {
  width: 40px;
  color: var(--3lens-text-primary);
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-cost-row-detail {
  color: var(--3lens-text-tertiary);
  font-size: 9px;
}

/* Material Details */
.three-lens-material-details {
  border-top: 1px solid var(--3lens-border-subtle);
  padding-top: 6px;
  margin-top: 4px;
}

.three-lens-material-details-header {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.three-lens-material-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
  font-size: 10px;
}

.three-lens-material-type {
  color: var(--3lens-text-secondary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-material-score {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: var(--3lens-text-tertiary);
}

.three-lens-material-features {
  display: flex;
  gap: 3px;
}

.three-lens-mat-feature {
  font-size: 8px;
  padding: 1px 3px;
  background: var(--3lens-bg-tertiary);
  border-radius: 2px;
  color: var(--3lens-text-tertiary);
}

/* ═══════════════════════════════════════════════════════════════
   COST RANKING (Global Tools)
   ═══════════════════════════════════════════════════════════════ */

.three-lens-cost-summary {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.three-lens-cost-summary-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px;
  background: var(--3lens-bg-tertiary);
  border-radius: 4px;
}

.three-lens-cost-summary-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-cost-summary-label {
  font-size: 8px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
}

.three-lens-cost-warning {
  display: flex;
  gap: 8px;
  padding: 4px 6px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 10px;
}

.three-lens-cost-warning .cost-critical {
  color: var(--3lens-accent-red);
}

.three-lens-cost-warning .cost-high {
  color: var(--3lens-accent-orange);
}

.three-lens-cost-ranking-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.three-lens-cost-ranking-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: var(--3lens-bg-tertiary);
  border-radius: 4px;
  cursor: pointer;
  transition: background 100ms ease;
}

.three-lens-cost-ranking-item:hover {
  background: var(--3lens-bg-hover);
}

.three-lens-cost-rank {
  font-size: 9px;
  font-weight: 600;
  color: var(--3lens-text-tertiary);
  width: 18px;
}

.three-lens-cost-ranking-name {
  flex: 1;
  font-size: 10px;
  color: var(--3lens-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-cost-ranking-triangles {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-cost-ranking-score {
  font-size: 10px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  padding: 1px 4px;
  border-radius: 3px;
}

.three-lens-cost-ranking-score.cost-low {
  color: var(--3lens-accent-green);
  background: rgba(34, 197, 94, 0.15);
}

.three-lens-cost-ranking-score.cost-medium {
  color: var(--3lens-accent-yellow);
  background: rgba(234, 179, 8, 0.15);
}

.three-lens-cost-ranking-score.cost-high {
  color: var(--3lens-accent-orange);
  background: rgba(249, 115, 22, 0.15);
}

.three-lens-cost-ranking-score.cost-critical {
  color: var(--3lens-accent-red);
  background: rgba(239, 68, 68, 0.15);
}

.three-lens-cost-more {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 4px 0;
}

/* ═══════════════════════════════════════════════════════════════
   INSPECTOR PANEL
   ═══════════════════════════════════════════════════════════════ */

.three-lens-inspector-empty {
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 24px;
  font-size: 12px;
}

.three-lens-section {
  display: block;
  margin-bottom: 12px;
}

.three-lens-section-header {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
  padding-bottom: 6px;
  border-bottom: 1px solid var(--3lens-border-subtle);
  margin-bottom: 8px;
}

/* Visual Overlays Toggle Styles */
.three-lens-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 11px;
}

.three-lens-toggle-row.global {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-toggle-label {
  color: var(--3lens-text-secondary);
}

.three-lens-toggle-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: none;
}

.three-lens-toggle-track {
  display: flex;
  align-items: center;
  width: 32px;
  height: 18px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: 9px;
  padding: 2px;
  transition: all 0.2s ease;
}

.three-lens-toggle-thumb {
  width: 12px;
  height: 12px;
  background: var(--3lens-text-tertiary);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.three-lens-toggle-btn:hover .three-lens-toggle-track {
  border-color: var(--3lens-accent-cyan);
}

.three-lens-toggle-btn.active .three-lens-toggle-track {
  background: var(--3lens-accent-cyan);
  border-color: var(--3lens-accent-cyan);
}

.three-lens-toggle-btn.active .three-lens-toggle-thumb {
  background: var(--3lens-bg-primary);
  transform: translateX(14px);
}

.three-lens-overlay-note {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  font-style: italic;
  padding: 4px 0;
}

/* Global Tools Panel */
.three-lens-global-tools {
  padding: 0;
}

.three-lens-global-tools-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 10px;
  background: linear-gradient(135deg, var(--3lens-accent-cyan-dim) 0%, var(--3lens-bg-hover) 100%);
  border-bottom: 1px solid var(--3lens-border);
  font-size: 12px;
  font-weight: 600;
  color: var(--3lens-accent-cyan);
}

.three-lens-global-icon {
  font-size: 14px;
}

/* Sections inside global tools - cleaner look */
.three-lens-global-tools .three-lens-section {
  padding: 10px;
  margin-bottom: 0;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.three-lens-global-tools .three-lens-section:last-child {
  border-bottom: none;
}

.three-lens-global-tools .three-lens-section-header {
  border-bottom: none;
  padding-bottom: 8px;
  margin-bottom: 0;
}

.three-lens-global-hint {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  line-height: 1.4;
  padding: 4px 0;
}

.three-lens-camera-info {
  margin-bottom: 10px;
}

.three-lens-property-row.compact {
  padding: 3px 0;
}

.three-lens-property-row.compact .three-lens-property-name {
  width: 55px;
  min-width: 55px;
}

.three-lens-property-row.compact .three-lens-property-value {
  font-size: 10px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.three-lens-camera-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* Transform Gizmo Styles */
.three-lens-transform-modes {
  margin: 8px 0;
}

.three-lens-transform-modes.disabled,
.three-lens-transform-options.disabled,
.three-lens-undo-redo.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.three-lens-mode-label {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  margin-bottom: 6px;
}

.three-lens-mode-buttons {
  display: flex;
  gap: 4px;
}

.three-lens-mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 28px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.three-lens-mode-btn:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-text-primary);
}

.three-lens-mode-btn.active {
  background: var(--3lens-accent-cyan);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-bg-primary);
}

.three-lens-transform-options {
  margin: 8px 0;
}

.three-lens-option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 11px;
}

.three-lens-option-label {
  color: var(--3lens-text-secondary);
}

.three-lens-space-btn {
  padding: 4px 10px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-primary);
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 50px;
  text-align: center;
}

.three-lens-space-btn:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-accent-cyan);
}

.three-lens-undo-redo {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-undo-btn,
.three-lens-redo-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  padding: 6px 8px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  font-size: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  justify-content: center;
}

.three-lens-undo-btn:hover:not(.disabled),
.three-lens-redo-btn:hover:not(.disabled) {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-text-primary);
}

.three-lens-undo-btn.disabled,
.three-lens-redo-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Camera Controls Styles */
.three-lens-camera-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.three-lens-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  padding: 8px 12px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-md);
  color: var(--3lens-text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
  justify-content: center;
}

.three-lens-action-btn:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-text-primary);
}

.three-lens-action-btn.stop {
  background: var(--3lens-error);
  border-color: var(--3lens-error);
  color: white;
}

.three-lens-action-btn.stop:hover {
  background: #dc2626;
  border-color: #dc2626;
}

.three-lens-action-btn.home {
  background: var(--3lens-accent-emerald);
  border-color: var(--3lens-accent-emerald);
  color: var(--3lens-bg-primary);
}

.three-lens-action-btn.home:hover {
  background: #2dd4bf;
  border-color: #2dd4bf;
}

.three-lens-camera-info {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
  margin-bottom: 12px;
}

.three-lens-camera-info-title {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.three-lens-camera-info-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.three-lens-camera-info-row {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
}

.three-lens-camera-info-label {
  color: var(--3lens-text-tertiary);
}

.three-lens-camera-info-value {
  color: var(--3lens-text-primary);
  font-family: var(--3lens-font-mono);
}

.three-lens-camera-switcher {
  margin-top: 8px;
}

.three-lens-camera-switcher-title {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.three-lens-camera-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.three-lens-camera-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.three-lens-camera-item:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-border);
}

.three-lens-camera-item.active {
  background: var(--3lens-accent-cyan);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-bg-primary);
}

.three-lens-camera-item-icon {
  font-size: 12px;
}

.three-lens-camera-item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-property-row {
  display: flex;
  align-items: center;
  padding: 5px 0;
  font-size: 11px;
}

.three-lens-property-name {
  width: 95px;
  min-width: 95px;
  color: var(--3lens-text-tertiary);
  flex-shrink: 0;
}

.three-lens-property-value {
  flex: 1;
  color: var(--3lens-text-primary);
  font-family: var(--3lens-font-mono);
  font-size: 11px;
}

.three-lens-vector-inputs {
  display: flex;
  gap: 4px;
  flex: 1;
}

.three-lens-vector-input {
  flex: 1;
  min-width: 0;
}

.three-lens-vector-input input {
  width: 100%;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  padding: 4px 6px;
  color: var(--3lens-text-primary);
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  text-align: center;
  outline: none;
}

.three-lens-vector-input input:focus {
  border-color: var(--3lens-border-focus);
}

.three-lens-vector-label {
  font-size: 8px;
  color: var(--3lens-text-disabled);
  text-align: center;
  margin-top: 2px;
}

/* ═══════════════════════════════════════════════════════════════
   BENCHMARK SCORE
   ═══════════════════════════════════════════════════════════════ */

.three-lens-benchmark {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-benchmark-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.three-lens-benchmark-score {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.three-lens-benchmark-value {
  font-size: 28px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
}

.three-lens-benchmark-value.grade-A { color: var(--3lens-success); }
.three-lens-benchmark-value.grade-B { color: var(--3lens-accent-emerald); }
.three-lens-benchmark-value.grade-C { color: var(--3lens-warning); }
.three-lens-benchmark-value.grade-D { color: var(--3lens-accent-amber); }
.three-lens-benchmark-value.grade-F { color: var(--3lens-error); }

.three-lens-benchmark-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
}

.three-lens-benchmark-grade {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
}

.three-lens-benchmark-grade.A { background: var(--3lens-success); color: #000; }
.three-lens-benchmark-grade.B { background: var(--3lens-accent-emerald); color: #000; }
.three-lens-benchmark-grade.C { background: var(--3lens-warning); color: #000; }
.three-lens-benchmark-grade.D { background: var(--3lens-accent-amber); color: #000; }
.three-lens-benchmark-grade.F { background: var(--3lens-error); color: #fff; }

.three-lens-benchmark-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.three-lens-benchmark-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.three-lens-benchmark-bar-label {
  width: 80px;
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
}

.three-lens-benchmark-bar-track {
  flex: 1;
  height: 6px;
  background: var(--3lens-bg-primary);
  border-radius: 3px;
  overflow: hidden;
}

.three-lens-benchmark-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 300ms ease;
}

.three-lens-benchmark-bar-fill.good { background: var(--3lens-success); }
.three-lens-benchmark-bar-fill.ok { background: var(--3lens-warning); }
.three-lens-benchmark-bar-fill.bad { background: var(--3lens-error); }

.three-lens-benchmark-bar-value {
  width: 30px;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  text-align: right;
  color: var(--3lens-text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-tabs {
  display: flex;
  gap: 1px;
  margin-bottom: 8px;
  background: var(--3lens-bg-secondary);
  padding: 2px;
  border-radius: var(--3lens-radius-sm);
}

.three-lens-tab {
  flex: 1;
  padding: 4px 6px;
  background: transparent;
  border: none;
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-tertiary);
  font-size: 9px;
  font-family: var(--3lens-font-sans);
  cursor: pointer;
  transition: all 100ms ease;
}

.three-lens-tab:hover {
  color: var(--3lens-text-secondary);
  background: var(--3lens-bg-hover);
}

.three-lens-tab.active {
  background: var(--3lens-accent-cyan);
  color: var(--3lens-bg-primary);
  font-weight: 600;
}

/* ═══════════════════════════════════════════════════════════════
   MEMORY STATS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-memory-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.three-lens-memory-item {
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  padding: 10px;
}

.three-lens-memory-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 4px;
}

.three-lens-memory-value {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-violet);
}

/* ═══════════════════════════════════════════════════════════════
   DETAILED METRICS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-metrics-section {
  margin-bottom: 16px;
}

.three-lens-metrics-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.three-lens-metrics-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--3lens-border-subtle);
}

.three-lens-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.three-lens-metric {
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
  text-align: center;
}

.three-lens-metric-value {
  font-size: 16px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
  line-height: 1.2;
}

.three-lens-metric-label {
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-disabled);
  margin-top: 2px;
}

/* ═══════════════════════════════════════════════════════════════
   ISSUES LIST
   ═══════════════════════════════════════════════════════════════ */

.three-lens-issues {
  margin-top: 12px;
}

.three-lens-issue {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--3lens-radius-sm);
  margin-bottom: 6px;
  font-size: 11px;
}

.three-lens-issue.warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.2);
}

.three-lens-issue-icon {
  flex-shrink: 0;
  font-size: 12px;
}

.three-lens-issue-text {
  flex: 1;
  color: var(--3lens-text-secondary);
  line-height: 1.4;
}

.three-lens-suggestion {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: var(--3lens-radius-sm);
  margin-bottom: 6px;
  font-size: 11px;
}

.three-lens-suggestion-text {
  flex: 1;
  color: var(--3lens-accent-emerald);
  line-height: 1.4;
}

/* ═══════════════════════════════════════════════════════════════
   PERCENTILE STATS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-percentiles {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-percentile {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
}

.three-lens-percentile-label {
  color: var(--3lens-text-disabled);
}

.three-lens-percentile-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.three-lens-panel {
  animation: fadeIn 150ms ease;
}

.three-lens-stat-value.warning {
  animation: pulse 1s ease-in-out infinite;
}

/* ═══════════════════════════════════════════════════════════════
   MEMORY PROFILER
   ═══════════════════════════════════════════════════════════════ */

.three-lens-memory-profiler {
  padding: 12px;
}

/* Memory Header */
.three-lens-memory-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.three-lens-memory-total {
  text-align: left;
}

.three-lens-memory-total-value {
  font-size: 28px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
  line-height: 1;
}

.three-lens-memory-total-value.warning {
  color: var(--3lens-warning);
}

.three-lens-memory-total-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-top: 4px;
}

.three-lens-memory-trend {
  font-size: 11px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: var(--3lens-radius-sm);
}

.three-lens-memory-trend.stable {
  color: var(--3lens-text-secondary);
  background: var(--3lens-bg-tertiary);
}

.three-lens-memory-trend.rising {
  color: var(--3lens-warning);
  background: rgba(245, 158, 11, 0.15);
}

.three-lens-memory-trend.falling {
  color: var(--3lens-accent-emerald);
  background: rgba(52, 211, 153, 0.15);
}

/* Memory Breakdown */
.three-lens-memory-breakdown {
  margin-bottom: 16px;
}

.three-lens-memory-breakdown-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 8px;
}

.three-lens-memory-bar {
  height: 12px;
  background: var(--3lens-bg-tertiary);
  border-radius: 6px;
  display: flex;
  overflow: hidden;
  margin-bottom: 8px;
}

.three-lens-memory-bar-segment {
  height: 100%;
  min-width: 2px;
  transition: width 300ms ease;
}

.three-lens-memory-bar-segment.texture {
  background: linear-gradient(90deg, #60a5fa, #3b82f6);
}

.three-lens-memory-bar-segment.geometry {
  background: linear-gradient(90deg, #34d399, #10b981);
}

.three-lens-memory-bar-segment.render-target {
  background: linear-gradient(90deg, #a78bfa, #8b5cf6);
}

/* Memory Legend */
.three-lens-memory-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.three-lens-memory-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.three-lens-memory-legend-color {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

.three-lens-memory-legend-color.texture {
  background: #60a5fa;
}

.three-lens-memory-legend-color.geometry {
  background: #34d399;
}

.three-lens-memory-legend-color.render-target {
  background: #a78bfa;
}

.three-lens-memory-legend-label {
  flex: 1;
  color: var(--3lens-text-secondary);
}

.three-lens-memory-legend-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-primary);
  font-weight: 500;
}

.three-lens-memory-legend-value.warning {
  color: var(--3lens-warning);
}

/* Memory History Chart */
.three-lens-memory-chart {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 10px;
  margin-bottom: 16px;
}

.three-lens-memory-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.three-lens-memory-chart-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-memory-chart-max {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-memory-chart-empty {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--3lens-text-disabled);
}

.three-lens-memory-chart-svg {
  width: 100%;
  height: 48px;
}

.three-lens-memory-chart-area {
  opacity: 0.8;
}

.three-lens-memory-chart-line {
  stroke-linecap: round;
  stroke-linejoin: round;
}

.three-lens-memory-chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 9px;
  color: var(--3lens-text-disabled);
}

/* JS Heap Bar */
.three-lens-heap-container {
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  padding: 10px;
}

.three-lens-heap-bar {
  height: 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.three-lens-heap-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--3lens-accent-cyan), var(--3lens-accent-blue));
  border-radius: 4px;
  transition: width 300ms ease;
}

.three-lens-heap-bar-fill.warning {
  background: linear-gradient(90deg, var(--3lens-warning), var(--3lens-error));
}

.three-lens-heap-stats {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.three-lens-heap-used {
  font-family: var(--3lens-font-mono);
  font-weight: 600;
  color: var(--3lens-accent-cyan);
}

.three-lens-heap-used.warning {
  color: var(--3lens-warning);
}

.three-lens-heap-separator {
  color: var(--3lens-text-disabled);
}

.three-lens-heap-limit {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-heap-percent {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
  margin-left: 4px;
}

.three-lens-heap-percent.warning {
  color: var(--3lens-warning);
}

/* Memory Warnings */
.three-lens-memory-warnings {
  margin-top: 12px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--3lens-radius-md);
  padding: 10px;
}

.three-lens-memory-warnings-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-warning);
  margin-bottom: 8px;
  font-weight: 600;
}

.three-lens-memory-warning {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  line-height: 1.5;
  padding: 4px 0;
  border-bottom: 1px solid rgba(245, 158, 11, 0.1);
}

.three-lens-memory-warning:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

/* ═══════════════════════════════════════════════════════════════
   FPS HISTOGRAM
   ═══════════════════════════════════════════════════════════════ */

.three-lens-histogram {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-top: 12px;
}

.three-lens-histogram-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-histogram-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-histogram-total {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-histogram-empty {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--3lens-text-disabled);
}

.three-lens-histogram-chart {
  display: flex;
  align-items: flex-end;
  height: 60px;
  gap: 2px;
}

.three-lens-histogram-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  cursor: pointer;
}

.three-lens-histogram-bar {
  width: 100%;
  min-height: 2px;
  border-radius: 2px 2px 0 0;
  transition: height 300ms ease;
}

.three-lens-histogram-bar.good {
  background: linear-gradient(180deg, var(--3lens-accent-emerald), #059669);
}

.three-lens-histogram-bar.ok {
  background: linear-gradient(180deg, var(--3lens-accent-amber), #d97706);
}

.three-lens-histogram-bar.bad {
  background: linear-gradient(180deg, var(--3lens-error), #b91c1c);
}

.three-lens-histogram-label {
  font-size: 7px;
  color: var(--3lens-text-disabled);
  margin-top: 4px;
}

.three-lens-histogram-legend {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-histogram-legend-item {
  font-size: 9px;
}

.three-lens-histogram-legend-item.good { color: var(--3lens-accent-emerald); }
.three-lens-histogram-legend-item.ok { color: var(--3lens-accent-amber); }
.three-lens-histogram-legend-item.bad { color: var(--3lens-error); }

/* ═══════════════════════════════════════════════════════════════
   FRAME TIME PERCENTILES
   ═══════════════════════════════════════════════════════════════ */

.three-lens-percentiles-section {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-top: 12px;
}

.three-lens-percentiles-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 10px;
}

.three-lens-percentiles-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.three-lens-percentile-item {
  text-align: center;
  padding: 8px 4px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-percentile-label {
  font-size: 9px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
  margin-bottom: 2px;
}

.three-lens-percentile-value {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
}

.three-lens-percentile-value.warning {
  color: var(--3lens-warning);
}

.three-lens-percentile-value.error {
  color: var(--3lens-error);
}

.three-lens-percentiles-summary {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-percentile-summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
}

.three-lens-percentile-summary-label {
  color: var(--3lens-text-disabled);
}

.three-lens-percentile-summary-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
  font-weight: 500;
}

.three-lens-percentile-summary-value.warning {
  color: var(--3lens-warning);
}

/* ═══════════════════════════════════════════════════════════════
   BOTTLENECK ANALYSIS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-bottleneck-section {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-top: 12px;
}

.three-lens-bottleneck-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 10px;
}

.three-lens-bottleneck-ok {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: var(--3lens-radius-sm);
  font-size: 11px;
  color: var(--3lens-accent-emerald);
}

.three-lens-bottleneck-ok-icon {
  font-size: 14px;
}

.three-lens-bottleneck-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.three-lens-bottleneck-item {
  padding: 10px;
  border-radius: var(--3lens-radius-sm);
  border-left: 3px solid transparent;
}

.three-lens-bottleneck-item.low {
  background: rgba(59, 130, 246, 0.1);
  border-left-color: var(--3lens-accent-blue);
}

.three-lens-bottleneck-item.medium {
  background: rgba(245, 158, 11, 0.1);
  border-left-color: var(--3lens-warning);
}

.three-lens-bottleneck-item.high {
  background: rgba(239, 68, 68, 0.1);
  border-left-color: var(--3lens-error);
}

.three-lens-bottleneck-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.three-lens-bottleneck-type {
  font-size: 11px;
  font-weight: 600;
  color: var(--3lens-text-primary);
}

.three-lens-bottleneck-severity {
  font-size: 8px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.three-lens-bottleneck-severity.low { background: var(--3lens-accent-blue); color: white; }
.three-lens-bottleneck-severity.medium { background: var(--3lens-warning); color: white; }
.three-lens-bottleneck-severity.high { background: var(--3lens-error); color: white; }

.three-lens-bottleneck-message {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  margin-bottom: 4px;
}

.three-lens-bottleneck-suggestion {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
}

/* ═══════════════════════════════════════════════════════════════
   RENDER PIPELINE VISUALIZATION
   ═══════════════════════════════════════════════════════════════ */

.three-lens-rendering-profiler {
  padding: 12px;
}

.three-lens-pipeline {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-pipeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-pipeline-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-pipeline-time {
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
}

.three-lens-pipeline-bar {
  height: 20px;
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.three-lens-pipeline-segment {
  height: 100%;
  min-width: 4px;
  transition: width 300ms ease;
}

.three-lens-pipeline-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.three-lens-pipeline-legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
}

.three-lens-pipeline-legend-color {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.three-lens-pipeline-legend-label {
  color: var(--3lens-text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   DRAW CALL EFFICIENCY
   ═══════════════════════════════════════════════════════════════ */

.three-lens-efficiency {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-efficiency-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-efficiency-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-efficiency-grade {
  font-size: 20px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
}

.three-lens-efficiency-content {
  display: flex;
  gap: 12px;
  align-items: center;
}

.three-lens-efficiency-meter {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.three-lens-efficiency-bar {
  flex: 1;
  height: 8px;
  background: var(--3lens-bg-primary);
  border-radius: 4px;
  overflow: hidden;
}

.three-lens-efficiency-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 300ms ease;
}

.three-lens-efficiency-value {
  font-size: 12px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
  min-width: 36px;
  text-align: right;
}

.three-lens-efficiency-stats {
  display: flex;
  gap: 12px;
}

.three-lens-efficiency-stat {
  text-align: center;
}

.three-lens-efficiency-stat-value {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
  display: block;
}

.three-lens-efficiency-stat-label {
  font-size: 8px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
}

.three-lens-efficiency-history {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-efficiency-history-title {
  font-size: 9px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
  margin-bottom: 6px;
}

.three-lens-mini-chart {
  width: 100%;
  height: 32px;
}

/* ═══════════════════════════════════════════════════════════════
   OBJECT VISIBILITY BREAKDOWN
   ═══════════════════════════════════════════════════════════════ */

.three-lens-visibility-breakdown {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-visibility-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 10px;
}

.three-lens-visibility-bar {
  height: 12px;
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.three-lens-visibility-segment {
  height: 100%;
  min-width: 2px;
  transition: width 300ms ease;
}

.three-lens-visibility-segment.visible {
  background: linear-gradient(90deg, var(--3lens-accent-emerald), #059669);
}

.three-lens-visibility-segment.culled {
  background: linear-gradient(90deg, var(--3lens-text-disabled), #4b5563);
}

.three-lens-visibility-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.three-lens-visibility-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
}

.three-lens-visibility-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.three-lens-visibility-dot.visible { background: var(--3lens-accent-emerald); }
.three-lens-visibility-dot.culled { background: var(--3lens-text-disabled); }
.three-lens-visibility-dot.transparent { background: var(--3lens-accent-cyan); }
.three-lens-visibility-dot.opaque { background: var(--3lens-accent-blue); }

.three-lens-visibility-label {
  color: var(--3lens-text-tertiary);
  flex: 1;
}

.three-lens-visibility-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   LIGHTING ANALYSIS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-lighting {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-lighting-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 10px;
}

.three-lens-lighting-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.three-lens-lighting-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-lighting-item.warning {
  background: rgba(245, 158, 11, 0.15);
}

.three-lens-lighting-icon {
  font-size: 16px;
  margin-bottom: 4px;
}

.three-lens-lighting-info {
  text-align: center;
}

.three-lens-lighting-value {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-amber);
}

.three-lens-lighting-label {
  font-size: 8px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
}

.three-lens-lighting-warning {
  margin-top: 10px;
  padding: 8px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--3lens-radius-sm);
  font-size: 10px;
  color: var(--3lens-warning);
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATION & INSTANCING
   ═══════════════════════════════════════════════════════════════ */

.three-lens-animation {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-animation-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 10px;
}

.three-lens-animation-empty {
  font-size: 11px;
  color: var(--3lens-text-disabled);
  text-align: center;
  padding: 10px;
}

.three-lens-animation-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.three-lens-animation-section {
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
  padding: 10px;
}

.three-lens-animation-section-title {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 8px;
}

.three-lens-animation-stats {
  display: flex;
  gap: 12px;
}

.three-lens-animation-stat {
  text-align: center;
  flex: 1;
}

.three-lens-animation-stat-value {
  font-size: 16px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-violet);
  display: block;
}

.three-lens-animation-stat-label {
  font-size: 8px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
}

/* ═══════════════════════════════════════════════════════════════
   STATE CHANGES ANALYSIS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-state-changes {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-state-changes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-state-changes-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-state-changes-total {
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-state-changes-total.warning {
  color: var(--3lens-warning);
}

.three-lens-state-changes-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.three-lens-state-change-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.three-lens-state-change-bar {
  flex: 1;
  height: 6px;
  background: var(--3lens-bg-primary);
  border-radius: 3px;
  overflow: hidden;
}

.three-lens-state-change-fill {
  height: 100%;
  border-radius: 3px;
}

.three-lens-state-change-fill.program { background: var(--3lens-accent-violet); }
.three-lens-state-change-fill.texture { background: var(--3lens-accent-blue); }
.three-lens-state-change-fill.rt { background: var(--3lens-accent-cyan); }
.three-lens-state-change-fill.upload { background: var(--3lens-accent-emerald); }

.three-lens-state-change-info {
  display: flex;
  justify-content: space-between;
  min-width: 100px;
}

.three-lens-state-change-label {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
}

.three-lens-state-change-value {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-state-changes-upload {
  margin-top: 8px;
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  text-align: right;
}

/* ═══════════════════════════════════════════════════════════════
   XR MODE INFO
   ═══════════════════════════════════════════════════════════════ */

.three-lens-xr {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15));
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-xr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-xr-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--3lens-accent-violet);
}

.three-lens-xr-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--3lens-accent-violet);
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.three-lens-xr-stats {
  display: flex;
  gap: 20px;
}

.three-lens-xr-stat {
  text-align: center;
}

.three-lens-xr-stat-value {
  font-size: 18px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-violet);
  display: block;
}

.three-lens-xr-stat-label {
  font-size: 9px;
  text-transform: uppercase;
  color: var(--3lens-text-tertiary);
}

/* ═══════════════════════════════════════════════════════════════
   RENDERING WARNINGS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-rendering-warnings {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--3lens-radius-md);
  padding: 10px;
}

.three-lens-rendering-warnings-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-warning);
  margin-bottom: 8px;
  font-weight: 600;
}

.three-lens-rendering-warning {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  line-height: 1.5;
  padding: 4px 0;
  border-bottom: 1px solid rgba(245, 158, 11, 0.1);
}

.three-lens-rendering-warning:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

/* ═══════════════════════════════════════════════════════════════
   FRAME BUDGET GAUGE
   ═══════════════════════════════════════════════════════════════ */

.three-lens-budget-gauge {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-top: 12px;
}

.three-lens-budget-gauge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.three-lens-budget-gauge-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-budget-gauge-target {
  font-size: 9px;
  color: var(--3lens-text-disabled);
}

.three-lens-budget-gauge-visual {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.three-lens-gauge-svg {
  width: 160px;
  height: 90px;
}

.three-lens-budget-gauge-value {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.three-lens-budget-gauge-number {
  font-size: 24px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
}

.three-lens-budget-gauge-unit {
  font-size: 12px;
  color: var(--3lens-text-secondary);
}

.three-lens-budget-gauge-value.excellent .three-lens-budget-gauge-number { color: var(--3lens-accent-emerald); }
.three-lens-budget-gauge-value.good .three-lens-budget-gauge-number { color: var(--3lens-accent-cyan); }
.three-lens-budget-gauge-value.warning .three-lens-budget-gauge-number { color: var(--3lens-warning); }
.three-lens-budget-gauge-value.over .three-lens-budget-gauge-number { color: var(--3lens-accent-amber); }
.three-lens-budget-gauge-value.critical .three-lens-budget-gauge-number { color: var(--3lens-error); }

.three-lens-budget-gauge-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-budget-gauge-status {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
}

.three-lens-budget-gauge-status.excellent { background: rgba(52, 211, 153, 0.2); color: var(--3lens-accent-emerald); }
.three-lens-budget-gauge-status.good { background: rgba(34, 211, 238, 0.2); color: var(--3lens-accent-cyan); }
.three-lens-budget-gauge-status.warning { background: rgba(245, 158, 11, 0.2); color: var(--3lens-warning); }
.three-lens-budget-gauge-status.over { background: rgba(251, 191, 36, 0.2); color: var(--3lens-accent-amber); }
.three-lens-budget-gauge-status.critical { background: rgba(239, 68, 68, 0.2); color: var(--3lens-error); }

.three-lens-budget-gauge-remaining {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
}

.three-lens-budget-gauge-remaining .over { color: var(--3lens-error); }
.three-lens-budget-gauge-remaining .under { color: var(--3lens-accent-emerald); }

.three-lens-budget-gauge-breakdown {
  margin-top: 8px;
}

.three-lens-budget-bar {
  height: 8px;
  background: var(--3lens-bg-primary);
  border-radius: 4px;
  display: flex;
  overflow: visible;
  position: relative;
}

.three-lens-budget-bar-fill {
  height: 100%;
  border-radius: 4px 0 0 4px;
  transition: width 300ms ease;
}

.three-lens-budget-bar-fill.excellent { background: var(--3lens-accent-emerald); }
.three-lens-budget-bar-fill.good { background: var(--3lens-accent-cyan); }
.three-lens-budget-bar-fill.warning { background: var(--3lens-warning); }
.three-lens-budget-bar-fill.over { background: var(--3lens-accent-amber); }
.three-lens-budget-bar-fill.critical { background: var(--3lens-error); }

.three-lens-budget-bar-over {
  height: 100%;
  background: var(--3lens-error);
  border-radius: 0 4px 4px 0;
  animation: pulse 1s ease-in-out infinite;
}

.three-lens-budget-labels {
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  color: var(--3lens-text-disabled);
  margin-top: 4px;
}

/* ═══════════════════════════════════════════════════════════════
   SESSION STATISTICS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-session {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-top: 12px;
}

.three-lens-session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-session-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-session-duration {
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
  padding: 2px 6px;
  background: rgba(34, 211, 238, 0.15);
  border-radius: 4px;
}

.three-lens-session-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.three-lens-session-stat {
  text-align: center;
  padding: 8px 4px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-session-stat-value {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-primary);
}

.three-lens-session-stat-value.warning {
  color: var(--3lens-warning);
}

.three-lens-session-stat-label {
  font-size: 8px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
  margin-top: 2px;
}

.three-lens-session-peaks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-session-peak {
  flex: 1;
  min-width: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  padding: 4px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-session-peak-label {
  color: var(--3lens-text-tertiary);
}

.three-lens-session-peak-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
  font-weight: 500;
}

.three-lens-session-peak-value.warning {
  color: var(--3lens-warning);
}

/* ═══════════════════════════════════════════════════════════════
   MEMORY EFFICIENCY
   ═══════════════════════════════════════════════════════════════ */

.three-lens-memory-efficiency {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-memory-efficiency-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-memory-efficiency-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-memory-efficiency-grade {
  font-size: 20px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
}

.three-lens-memory-efficiency-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.three-lens-memory-efficiency-item {
  text-align: center;
  padding: 8px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-memory-efficiency-value {
  font-size: 12px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-primary);
}

.three-lens-memory-efficiency-label {
  font-size: 8px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
  margin-top: 2px;
}

.three-lens-memory-efficiency-bar {
  height: 6px;
  background: var(--3lens-bg-primary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.three-lens-memory-efficiency-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 300ms ease;
}

.three-lens-memory-efficiency-score {
  font-size: 10px;
  text-align: right;
  color: var(--3lens-text-secondary);
  font-family: var(--3lens-font-mono);
}

/* ═══════════════════════════════════════════════════════════════
   MEMORY CATEGORIES
   ═══════════════════════════════════════════════════════════════ */

.three-lens-memory-categories {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-memory-categories-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 10px;
}

.three-lens-memory-category {
  padding: 10px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
  margin-bottom: 8px;
}

.three-lens-memory-category:last-child {
  margin-bottom: 0;
}

.three-lens-memory-category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.three-lens-memory-category-icon {
  font-size: 14px;
}

.three-lens-memory-category-name {
  flex: 1;
  font-size: 11px;
  font-weight: 500;
  color: var(--3lens-text-primary);
}

.three-lens-memory-category-count {
  font-size: 12px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
}

.three-lens-memory-category-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.three-lens-memory-category-segment {
  min-width: 4px;
}

.three-lens-memory-category-segment.small { background: var(--3lens-accent-emerald); }
.three-lens-memory-category-segment.medium { background: var(--3lens-accent-amber); }
.three-lens-memory-category-segment.large { background: var(--3lens-error); }

.three-lens-memory-category-legend {
  display: flex;
  gap: 10px;
  font-size: 9px;
}

.three-lens-memory-category-legend .small { color: var(--3lens-accent-emerald); }
.three-lens-memory-category-legend .medium { color: var(--3lens-accent-amber); }
.three-lens-memory-category-legend .large { color: var(--3lens-error); }

.three-lens-memory-category-details {
  display: flex;
  gap: 12px;
}

.three-lens-memory-category-detail {
  display: flex;
  gap: 6px;
  font-size: 10px;
}

.three-lens-memory-category-detail .label {
  color: var(--3lens-text-tertiary);
}

.three-lens-memory-category-detail .value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-memory-category-note {
  font-size: 10px;
  color: var(--3lens-text-secondary);
}

.three-lens-memory-category-largest {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-memory-category-largest strong {
  color: var(--3lens-text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   MEMORY TIPS
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   PERFORMANCE TIMELINE
   ═══════════════════════════════════════════════════════════════ */

.three-lens-timeline-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 8px;
}

.three-lens-timeline-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-timeline-left-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.three-lens-timeline-right-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.three-lens-timeline-divider {
  width: 1px;
  height: 12px;
  background: var(--3lens-border);
  margin: 0 2px;
}

.three-lens-timeline-record-btn {
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  font-size: 9px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.three-lens-timeline-record-btn:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-border-hover);
}

.three-lens-timeline-record-btn.recording {
  background: rgba(239, 68, 68, 0.2);
  border-color: var(--3lens-error);
  color: var(--3lens-error);
  animation: pulse-recording 1s ease-in-out infinite;
}

@keyframes pulse-recording {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.three-lens-timeline-recording-info {
  font-size: 8px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
}

.three-lens-timeline-buffer-select {
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  font-size: 8px;
  font-family: var(--3lens-font-mono);
  padding: 2px 4px;
  cursor: pointer;
}

.three-lens-timeline-buffer-select:hover {
  border-color: var(--3lens-border-hover);
}

.three-lens-timeline-btn {
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  font-size: 11px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.three-lens-timeline-btn:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-border-hover);
  color: var(--3lens-text-primary);
}

.three-lens-timeline-zoom-label {
  font-size: 9px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
  min-width: 28px;
  text-align: center;
}

.three-lens-timeline-stats {
  display: flex;
  gap: 10px;
}

.three-lens-timeline-stat {
  display: flex;
  gap: 3px;
  font-size: 9px;
}

.three-lens-timeline-stat-label {
  color: var(--3lens-text-tertiary);
}

.three-lens-timeline-stat-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
  font-weight: 600;
}

.three-lens-timeline-stat-value.warning {
  color: var(--3lens-accent-amber);
}

.three-lens-timeline-paused {
  font-size: 8px;
  color: var(--3lens-accent-cyan);
  background: var(--3lens-accent-cyan-dim);
  padding: 1px 5px;
  border-radius: var(--3lens-radius-sm);
  margin-left: 4px;
}

.three-lens-timeline-chart-container {
  flex: 1;
  position: relative;
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  overflow: hidden;
  cursor: grab;
  min-height: 150px;
}

.three-lens-timeline-chart-container:active {
  cursor: grabbing;
}

.three-lens-timeline-chart {
  width: 100%;
  height: 100%;
  display: block;
}

.three-lens-timeline-tooltip {
  position: absolute;
  background: rgba(17, 24, 39, 0.95);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  padding: 6px 8px;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-primary);
  pointer-events: none;
  display: none;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.three-lens-timeline-tooltip div {
  padding: 2px 0;
}

.three-lens-timeline-legend {
  display: flex;
  gap: 10px;
  padding: 4px 6px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  flex-wrap: wrap;
}

.three-lens-timeline-legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 8px;
  color: var(--3lens-text-secondary);
}

.three-lens-timeline-legend-color {
  width: 8px;
  height: 8px;
  border-radius: 1px;
}

.three-lens-timeline-legend-color.cpu {
  background: rgba(96, 165, 250, 0.6);
}

.three-lens-timeline-legend-color.gpu {
  background: rgba(34, 197, 94, 0.6);
}

.three-lens-timeline-legend-color.spike {
  background: rgba(239, 68, 68, 0.8);
}

.three-lens-timeline-legend-color.selected {
  background: rgba(96, 165, 250, 1);
  border: 1px solid #fff;
}

.three-lens-timeline-frame-details {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  padding: 6px 8px;
}

.three-lens-timeline-frame-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-primary);
}

.three-lens-timeline-close-btn {
  background: transparent;
  border: none;
  color: var(--3lens-text-tertiary);
  font-size: 14px;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--3lens-radius-sm);
  transition: all 0.2s;
}

.three-lens-timeline-close-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.three-lens-timeline-frame-details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.three-lens-timeline-frame-detail {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.three-lens-timeline-frame-detail-label {
  font-size: 7px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.three-lens-timeline-frame-detail-value {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-primary);
  font-weight: 600;
}

.three-lens-timeline-frame-detail-value.warning {
  color: var(--3lens-accent-amber);
}

.three-lens-timeline-frame-detail-value.error {
  color: var(--3lens-error);
}

.three-lens-memory-tips {
  background: rgba(52, 211, 153, 0.08);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-memory-tips-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-accent-emerald);
  margin-bottom: 8px;
  font-weight: 600;
}

.three-lens-memory-tips-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.three-lens-memory-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  border-left: 3px solid transparent;
}

.three-lens-memory-tip.high {
  border-left-color: var(--3lens-error);
}

.three-lens-memory-tip.medium {
  border-left-color: var(--3lens-warning);
}

.three-lens-memory-tip.low {
  border-left-color: var(--3lens-accent-blue);
}

.three-lens-memory-tip-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.three-lens-memory-tip-text {
  font-size: 10px;
  color: var(--3lens-text-secondary);
  line-height: 1.4;
}

/* ═══════════════════════════════════════════════════════════════
   RESOURCE LIFECYCLE TAB
   ═══════════════════════════════════════════════════════════════ */

.three-lens-resources-profiler {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  overflow-y: auto;
}

/* Resource Summary */
.three-lens-resource-summary {
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
}

.three-lens-resource-summary-title {
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  margin-bottom: 8px;
  text-transform: uppercase;
}

.three-lens-resource-summary-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.three-lens-resource-summary-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-resource-summary-icon {
  font-size: 16px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.three-lens-resource-summary-icon.geometry { background: rgba(96, 165, 250, 0.2); }
.three-lens-resource-summary-icon.material { background: rgba(167, 139, 250, 0.2); }
.three-lens-resource-summary-icon.texture { background: rgba(52, 211, 153, 0.2); }

.three-lens-resource-summary-details {
  flex: 1;
}

.three-lens-resource-summary-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  margin-bottom: 2px;
}

.three-lens-resource-summary-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 9px;
}

.three-lens-resource-summary-stats span {
  padding: 1px 4px;
  border-radius: 2px;
  background: var(--3lens-bg-tertiary);
  color: var(--3lens-text-tertiary);
}

.three-lens-resource-summary-stats .created { color: var(--3lens-accent-green); }
.three-lens-resource-summary-stats .disposed { color: var(--3lens-text-disabled); }
.three-lens-resource-summary-stats .active.highlight { color: var(--3lens-accent-cyan); font-weight: 600; }
.three-lens-resource-summary-stats .leaked { color: var(--3lens-accent-red); background: rgba(239, 68, 68, 0.2); }

.three-lens-resource-total-events {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  margin-top: 6px;
}

/* Resource Controls */
.three-lens-resource-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
}

/* Potential Leaks */
.three-lens-potential-leaks {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
}

.three-lens-potential-leaks-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-accent-red);
  margin-bottom: 6px;
}

.three-lens-potential-leaks-icon {
  font-size: 12px;
}

.three-lens-potential-leaks-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.three-lens-leak-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
  font-size: 9px;
}

.three-lens-leak-type {
  font-size: 10px;
}

.three-lens-leak-type.geometry { color: #60a5fa; }
.three-lens-leak-type.material { color: #a78bfa; }
.three-lens-leak-type.texture { color: #34d399; }

.three-lens-leak-name {
  flex: 1;
  color: var(--3lens-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-leak-age {
  color: var(--3lens-accent-red);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-leak-more {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 4px 0;
}

/* Resource Timeline */
.three-lens-resource-timeline {
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
}

.three-lens-resource-timeline-empty {
  text-align: center;
  padding: 20px;
  color: var(--3lens-text-tertiary);
  font-size: 10px;
}

.three-lens-resource-timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 9px;
  color: var(--3lens-text-secondary);
}

.three-lens-resource-timeline-legend {
  display: flex;
  gap: 8px;
}

.three-lens-resource-timeline-legend span {
  font-size: 8px;
}

.three-lens-resource-timeline-legend .geometry { color: #60a5fa; }
.three-lens-resource-timeline-legend .material { color: #a78bfa; }
.three-lens-resource-timeline-legend .texture { color: #34d399; }
.three-lens-resource-timeline-legend .disposed { color: #ef4444; }

.three-lens-resource-timeline-chart {
  display: flex;
  height: 60px;
  gap: 1px;
  background: var(--3lens-bg-secondary);
  border-radius: 2px;
  padding: 2px;
}

.three-lens-resource-timeline-bar {
  flex: 1;
  display: flex;
  align-items: flex-end;
  min-width: 4px;
}

.three-lens-resource-bar-stack {
  width: 100%;
  display: flex;
  flex-direction: column-reverse;
  border-radius: 1px;
  overflow: hidden;
}

.three-lens-resource-bar-segment {
  min-height: 2px;
}

.three-lens-resource-bar-segment.geometry { background: #60a5fa; }
.three-lens-resource-bar-segment.material { background: #a78bfa; }
.three-lens-resource-bar-segment.texture { background: #34d399; }
.three-lens-resource-bar-segment.disposed { background: #ef4444; }

.three-lens-resource-timeline-labels {
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  color: var(--3lens-text-tertiary);
  margin-top: 4px;
}

/* Resource Event List */
.three-lens-resource-event-list {
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.three-lens-resource-event-list-header {
  font-size: 9px;
  font-weight: 600;
  color: var(--3lens-text-secondary);
  text-transform: uppercase;
  margin-bottom: 6px;
}

.three-lens-resource-event-list-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.three-lens-resource-event-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 4px;
  background: var(--3lens-bg-secondary);
  border-radius: 2px;
  font-size: 9px;
}

.three-lens-resource-event-item.disposed {
  opacity: 0.7;
}

.three-lens-resource-event-type {
  font-size: 10px;
}

.three-lens-resource-event-type.geometry { color: #60a5fa; }
.three-lens-resource-event-type.material { color: #a78bfa; }
.three-lens-resource-event-type.texture { color: #34d399; }

.three-lens-resource-event-action {
  font-weight: 600;
  width: 12px;
  text-align: center;
}

.three-lens-resource-event-action.created { color: var(--3lens-accent-green); }
.three-lens-resource-event-action.disposed { color: var(--3lens-accent-red); }
.three-lens-resource-event-action.attached { color: var(--3lens-accent-cyan); }
.three-lens-resource-event-action.detached { color: var(--3lens-accent-orange); }

.three-lens-resource-event-name {
  flex: 1;
  color: var(--3lens-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-resource-event-slot {
  font-size: 8px;
  color: var(--3lens-text-tertiary);
  background: var(--3lens-bg-tertiary);
  padding: 1px 3px;
  border-radius: 2px;
}

.three-lens-resource-event-time {
  font-size: 8px;
  color: var(--3lens-text-tertiary);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-resource-event-more {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 4px 0;
}

/* ═══════════════════════════════════════════════════════════════
   LEAK DETECTION UI
   ═══════════════════════════════════════════════════════════════ */

.three-lens-resource-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-leak-controls-left {
  display: flex;
  gap: 4px;
}

.three-lens-leak-controls-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.three-lens-action-btn.small {
  padding: 2px 6px;
  font-size: 10px;
  min-width: unset;
}

.three-lens-toggle-row.compact {
  gap: 4px;
}

.three-lens-toggle-row.compact .three-lens-toggle-label {
  font-size: 9px;
}

/* Memory Usage */
.three-lens-memory-usage {
  padding: 6px 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-memory-usage-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.three-lens-memory-usage-label {
  font-size: 9px;
  color: var(--3lens-text-secondary);
}

.three-lens-memory-usage-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-memory-trend {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 2px;
}

.three-lens-memory-trend.growing {
  color: var(--3lens-accent-red);
  background: rgba(239, 68, 68, 0.2);
}

.three-lens-memory-trend.shrinking {
  color: var(--3lens-accent-green);
  background: rgba(52, 211, 153, 0.2);
}

.three-lens-memory-trend.stable {
  color: var(--3lens-text-tertiary);
  background: var(--3lens-bg-secondary);
}

/* Leak Alerts */
.three-lens-leak-alerts {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
}

.three-lens-leak-alerts-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-accent-red);
  margin-bottom: 6px;
}

.three-lens-leak-alerts-icon {
  font-size: 12px;
}

.three-lens-alert-badge {
  font-size: 8px;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: 600;
}

.three-lens-alert-badge.critical {
  background: var(--3lens-accent-red);
  color: white;
}

.three-lens-alert-badge.warning {
  background: var(--3lens-accent-orange);
  color: white;
}

.three-lens-leak-alerts-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.three-lens-leak-alert-item {
  display: flex;
  gap: 6px;
  padding: 6px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
  border-left: 2px solid transparent;
}

.three-lens-leak-alert-item.critical {
  border-left-color: var(--3lens-accent-red);
}

.three-lens-leak-alert-item.warning {
  border-left-color: var(--3lens-accent-orange);
}

.three-lens-leak-alert-item.info {
  border-left-color: var(--3lens-accent-blue);
}

.three-lens-alert-severity {
  font-size: 10px;
  flex-shrink: 0;
}

.three-lens-alert-content {
  flex: 1;
  min-width: 0;
}

.three-lens-alert-message {
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  margin-bottom: 2px;
}

.three-lens-alert-details {
  font-size: 9px;
  color: var(--3lens-text-secondary);
  margin-bottom: 4px;
}

.three-lens-alert-suggestion {
  font-size: 8px;
  color: var(--3lens-accent-cyan);
  background: rgba(34, 211, 238, 0.1);
  padding: 2px 4px;
  border-radius: 2px;
}

/* Orphaned Resources */
.three-lens-orphaned-resources {
  background: rgba(167, 139, 250, 0.1);
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
}

.three-lens-orphaned-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: #a78bfa;
  margin-bottom: 4px;
}

.three-lens-orphaned-icon {
  font-size: 12px;
}

.three-lens-orphaned-hint {
  font-size: 8px;
  color: var(--3lens-text-tertiary);
  margin-bottom: 6px;
}

.three-lens-orphaned-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.three-lens-orphan-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 4px;
  background: var(--3lens-bg-secondary);
  border-radius: 2px;
  font-size: 9px;
}

.three-lens-orphan-type {
  font-size: 10px;
}

.three-lens-orphan-type.geometry { color: #60a5fa; }
.three-lens-orphan-type.material { color: #a78bfa; }
.three-lens-orphan-type.texture { color: #34d399; }

.three-lens-orphan-name {
  flex: 1;
  color: var(--3lens-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-orphan-age {
  color: var(--3lens-text-tertiary);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-orphan-more {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 4px 0;
}

.three-lens-leak-more {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 4px 0;
}

/* ═══════════════════════════════════════════════════════════════
   RULE VIOLATIONS UI
   ═══════════════════════════════════════════════════════════════ */

.three-lens-rule-violations {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
  margin-top: 8px;
}

.three-lens-rule-violations-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.three-lens-rule-violations-title {
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-accent-red);
}

.three-lens-rule-violations-badges {
  display: flex;
  gap: 4px;
  flex: 1;
}

.three-lens-violation-badge {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 8px;
  font-weight: 600;
}

.three-lens-violation-badge.error {
  background: var(--3lens-accent-red);
  color: white;
}

.three-lens-violation-badge.warning {
  background: var(--3lens-accent-orange);
  color: white;
}

.three-lens-rule-violations-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.three-lens-violation-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
  border-left: 2px solid transparent;
  font-size: 9px;
}

.three-lens-violation-item.error {
  border-left-color: var(--3lens-accent-red);
}

.three-lens-violation-item.warning {
  border-left-color: var(--3lens-accent-orange);
}

.three-lens-violation-item.info {
  border-left-color: var(--3lens-accent-blue);
}

.three-lens-violation-severity {
  font-size: 10px;
  flex-shrink: 0;
}

.three-lens-violation-message {
  flex: 1;
  color: var(--3lens-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-violation-time {
  font-size: 8px;
  color: var(--3lens-text-tertiary);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-violations-more {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 4px 0;
  margin-top: 4px;
}

/* ═══════════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-toast-container {
  position: fixed;
  bottom: 80px;
  right: 20px;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  z-index: 10000000;
  pointer-events: none;
}

.three-lens-toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--3lens-bg-elevated);
  border: 1px solid var(--3lens-border);
  border-radius: 6px;
  font-family: var(--3lens-font-sans);
  font-size: 12px;
  color: var(--3lens-text-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transform: translateX(100%);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  pointer-events: auto;
}

.three-lens-toast.visible {
  transform: translateX(0);
  opacity: 1;
}

.three-lens-toast-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 10px;
  font-weight: bold;
}

.three-lens-toast-info .three-lens-toast-icon {
  background: var(--3lens-accent-blue);
  color: white;
}

.three-lens-toast-success .three-lens-toast-icon {
  background: var(--3lens-success);
  color: white;
}

.three-lens-toast-warning .three-lens-toast-icon {
  background: var(--3lens-warning);
  color: black;
}

.three-lens-toast-error .three-lens-toast-icon {
  background: var(--3lens-error);
  color: white;
}

.three-lens-toast-message {
  flex: 1;
}

/* ═══════════════════════════════════════════════════════════════
   PLUGIN PANEL STYLES
   ═══════════════════════════════════════════════════════════════ */

.three-lens-menu-icon.plugin {
  background: linear-gradient(135deg, var(--3lens-accent-violet), var(--3lens-accent-rose));
  color: white;
}

.plugin-error {
  padding: 16px;
  text-align: center;
  color: var(--3lens-error);
  font-size: 11px;
  font-family: var(--3lens-font-sans);
}

.plugin-loading {
  padding: 16px;
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 11px;
  font-family: var(--3lens-font-sans);
}

/* Plugin toolbar button */
.three-lens-plugin-toolbar {
  display: flex;
  gap: 2px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--3lens-border);
}

.three-lens-plugin-toolbar-btn {
  background: transparent;
  border: none;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: var(--3lens-text-secondary);
  transition: background 0.15s, color 0.15s;
}

.three-lens-plugin-toolbar-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.three-lens-plugin-toolbar-btn.active {
  background: var(--3lens-accent-blue);
  color: white;
}

.three-lens-plugin-toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ═══════════════════════════════════════════════════════════════
   PLUGINS MANAGEMENT PANEL
   ═══════════════════════════════════════════════════════════════ */

.three-lens-plugins-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: var(--3lens-font-sans);
}

.three-lens-plugins-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--3lens-bg-secondary);
  border-bottom: 1px solid var(--3lens-border);
}

.three-lens-plugins-count {
  font-size: 11px;
  color: var(--3lens-text-secondary);
}

.three-lens-plugins-btn {
  background: var(--3lens-accent-blue);
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.three-lens-plugins-btn:hover {
  background: #3b82f6;
}

.three-lens-plugins-btn.primary {
  background: var(--3lens-accent-blue);
}

.three-lens-plugins-btn.danger {
  background: var(--3lens-error);
}

.three-lens-plugins-btn.danger:hover {
  background: #dc2626;
}

.three-lens-plugins-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.three-lens-plugins-empty {
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 11px;
  padding: 24px;
}

.three-lens-plugin-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.three-lens-plugin-item:hover {
  background: var(--3lens-bg-hover);
}

.three-lens-plugin-item.selected {
  border-color: var(--3lens-accent-blue);
  background: rgba(96, 165, 250, 0.1);
}

.three-lens-plugin-item.error {
  border-color: var(--3lens-error);
}

.three-lens-plugin-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.three-lens-plugin-info {
  flex: 1;
  min-width: 0;
}

.three-lens-plugin-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--3lens-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.three-lens-plugin-version {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  font-family: var(--3lens-font-mono);
}

.three-lens-plugin-status {
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border-radius: 50%;
}

.three-lens-plugin-status.active {
  color: var(--3lens-success);
}

.three-lens-plugin-status.inactive {
  color: var(--3lens-text-tertiary);
}

.three-lens-plugin-status.error {
  color: var(--3lens-error);
  font-weight: bold;
}

.three-lens-plugin-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.three-lens-plugin-item:hover .three-lens-plugin-actions {
  opacity: 1;
}

.three-lens-plugin-action-btn {
  background: transparent;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  color: var(--3lens-text-secondary);
  transition: background 0.15s, color 0.15s;
}

.three-lens-plugin-action-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

/* Plugin Load Form */
.three-lens-plugin-load-form {
  padding: 12px;
  border-top: 1px solid var(--3lens-border);
  background: var(--3lens-bg-secondary);
}

.three-lens-plugin-form-group {
  margin-bottom: 10px;
}

.three-lens-plugin-label {
  display: block;
  font-size: 10px;
  color: var(--3lens-text-secondary);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.three-lens-plugin-input {
  width: 100%;
  padding: 6px 8px;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: 4px;
  color: var(--3lens-text-primary);
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  box-sizing: border-box;
}

.three-lens-plugin-input:focus {
  outline: none;
  border-color: var(--3lens-accent-blue);
}

.three-lens-plugin-select {
  width: 100%;
  padding: 6px 8px;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: 4px;
  color: var(--3lens-text-primary);
  font-size: 11px;
  cursor: pointer;
}

.three-lens-plugin-submit-btn {
  width: 100%;
  padding: 8px;
  background: var(--3lens-accent-blue);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.three-lens-plugin-submit-btn:hover {
  background: #3b82f6;
}

.three-lens-plugin-load-status {
  margin-top: 8px;
  font-size: 10px;
  text-align: center;
}

.three-lens-plugin-load-status .loading {
  color: var(--3lens-text-secondary);
}

.three-lens-plugin-load-status .success {
  color: var(--3lens-success);
}

.three-lens-plugin-load-status .error {
  color: var(--3lens-error);
}

/* Plugin Settings */
.three-lens-plugin-settings {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.three-lens-plugin-settings-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--3lens-bg-secondary);
  border-bottom: 1px solid var(--3lens-border);
}

.three-lens-plugin-back-btn {
  background: transparent;
  border: none;
  color: var(--3lens-text-secondary);
  font-size: 11px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.15s, color 0.15s;
}

.three-lens-plugin-back-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.three-lens-plugin-settings-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--3lens-text-primary);
}

.three-lens-plugin-details {
  padding: 12px;
  border-bottom: 1px solid var(--3lens-border);
}

.three-lens-plugin-description {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.three-lens-plugin-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 10px;
  color: var(--3lens-text-tertiary);
}

.three-lens-plugin-settings-fields {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.three-lens-plugin-setting-field {
  margin-bottom: 12px;
}

.three-lens-plugin-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.three-lens-plugin-setting-label {
  font-size: 11px;
  color: var(--3lens-text-primary);
}

.three-lens-plugin-setting-desc {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  margin-top: 4px;
}

.three-lens-plugin-no-settings {
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 11px;
  padding: 24px;
}

.three-lens-plugin-settings-actions {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--3lens-border);
  background: var(--3lens-bg-secondary);
}

.three-lens-plugin-color {
  width: 40px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--3lens-border);
  border-radius: 4px;
  cursor: pointer;
}

/* ═══════════════════════════════════════════════════════════════
   LOD CHECKER PLUGIN STYLES
   ═══════════════════════════════════════════════════════════════ */

.lod-checker-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: var(--3lens-font-sans);
  font-size: 11px;
  color: var(--3lens-text-primary);
}

.lod-checker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--3lens-bg-secondary);
  border-bottom: 1px solid var(--3lens-border);
}

.lod-checker-title {
  font-weight: 600;
  font-size: 12px;
}

.lod-checker-btn {
  background: var(--3lens-bg-tertiary);
  color: var(--3lens-text-primary);
  border: 1px solid var(--3lens-border);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.lod-checker-btn:hover {
  background: var(--3lens-bg-hover);
}

.lod-checker-btn.primary {
  background: var(--3lens-accent-blue);
  border-color: var(--3lens-accent-blue);
  color: white;
}

.lod-checker-btn.primary:hover {
  background: #3b82f6;
}

.lod-checker-empty {
  padding: 24px;
  text-align: center;
  color: var(--3lens-text-secondary);
}

.lod-checker-hint {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  margin-top: 8px;
}

.lod-checker-summary {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  background: var(--3lens-bg-tertiary);
  border-bottom: 1px solid var(--3lens-border);
  flex-wrap: wrap;
}

.lod-checker-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
  padding: 4px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
}

.lod-checker-stat.warning {
  background: rgba(251, 191, 36, 0.15);
}

.lod-checker-stat.info {
  background: rgba(96, 165, 250, 0.15);
}

.lod-checker-stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--3lens-text-primary);
}

.lod-checker-stat.warning .lod-checker-stat-value {
  color: var(--3lens-warning);
}

.lod-checker-stat-label {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
}

.lod-checker-analysis-time {
  padding: 4px 12px;
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: right;
}

.lod-checker-section {
  padding: 10px 12px;
  border-bottom: 1px solid var(--3lens-border);
}

.lod-checker-section-header {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 11px;
}

.lod-checker-section-header.warning {
  color: var(--3lens-warning);
}

.lod-checker-section-header.info {
  color: var(--3lens-accent-blue);
}

.lod-checker-section-desc {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  margin-bottom: 8px;
}

.lod-checker-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lod-checker-list.scrollable {
  max-height: 200px;
  overflow-y: auto;
}

.lod-checker-item {
  padding: 8px 10px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.lod-checker-item:hover {
  background: var(--3lens-bg-hover);
}

.lod-checker-item.warning {
  border-color: var(--3lens-warning);
  border-left-width: 3px;
}

.lod-checker-item.info {
  border-color: var(--3lens-accent-blue);
  border-left-width: 3px;
}

.lod-checker-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.lod-checker-item-name {
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lod-checker-item-badges {
  display: flex;
  gap: 4px;
}

.lod-checker-badge {
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
}

.lod-checker-badge.lod {
  background: var(--3lens-accent-emerald);
  color: black;
}

.lod-checker-badge.over {
  background: var(--3lens-warning);
  color: black;
}

.lod-checker-badge.far {
  background: var(--3lens-accent-blue);
  color: white;
}

.lod-checker-item-stats {
  display: flex;
  gap: 10px;
  font-size: 10px;
  color: var(--3lens-text-secondary);
  font-family: var(--3lens-font-mono);
}

.lod-checker-item-stats .highlight {
  color: var(--3lens-warning);
  font-weight: 600;
}

.lod-checker-item-suggestion {
  margin-top: 4px;
  font-size: 9px;
  color: var(--3lens-accent-blue);
}

.lod-checker-success {
  padding: 16px;
  text-align: center;
  color: var(--3lens-success);
  font-size: 12px;
}

.lod-checker-more {
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  padding: 8px;
}

/* ═══════════════════════════════════════════════════════════════
   SHADOW DEBUGGER PLUGIN STYLES
   ═══════════════════════════════════════════════════════════════ */

.shadow-debugger-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: var(--3lens-font-sans);
  font-size: 11px;
  color: var(--3lens-text-primary);
}

.shadow-debugger-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--3lens-bg-secondary);
  border-bottom: 1px solid var(--3lens-border);
}

.shadow-debugger-title {
  font-weight: 600;
  font-size: 12px;
}

.shadow-debugger-btn {
  background: var(--3lens-bg-tertiary);
  color: var(--3lens-text-primary);
  border: 1px solid var(--3lens-border);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.shadow-debugger-btn:hover {
  background: var(--3lens-bg-hover);
}

.shadow-debugger-btn.primary {
  background: var(--3lens-accent-blue);
  border-color: var(--3lens-accent-blue);
  color: white;
}

.shadow-debugger-btn.primary:hover {
  background: #3b82f6;
}

.shadow-debugger-empty {
  padding: 24px;
  text-align: center;
  color: var(--3lens-text-secondary);
}

.shadow-debugger-hint {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  margin-top: 8px;
}

.shadow-debugger-summary {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  background: var(--3lens-bg-tertiary);
  border-bottom: 1px solid var(--3lens-border);
  flex-wrap: wrap;
}

.shadow-debugger-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
  padding: 4px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
}

.shadow-debugger-stat.warning {
  background: rgba(251, 191, 36, 0.15);
}

.shadow-debugger-stat.error {
  background: rgba(239, 68, 68, 0.15);
}

.shadow-debugger-stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--3lens-text-primary);
}

.shadow-debugger-stat.warning .shadow-debugger-stat-value {
  color: var(--3lens-warning);
}

.shadow-debugger-stat.error .shadow-debugger-stat-value {
  color: var(--3lens-error);
}

.shadow-debugger-stat-label {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
}

.shadow-debugger-section {
  padding: 10px 12px;
  border-bottom: 1px solid var(--3lens-border);
}

.shadow-debugger-section-header {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 11px;
}

.shadow-debugger-section-header.warning {
  color: var(--3lens-warning);
}

.shadow-debugger-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shadow-debugger-item {
  padding: 10px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.shadow-debugger-item:hover {
  background: var(--3lens-bg-hover);
}

.shadow-debugger-item.warning {
  border-color: var(--3lens-warning);
  border-left-width: 3px;
}

.shadow-debugger-item.error {
  border-color: var(--3lens-error);
  border-left-width: 3px;
}

.shadow-debugger-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.shadow-debugger-item-icon {
  font-size: 14px;
}

.shadow-debugger-item-name {
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shadow-debugger-item-type {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  padding: 2px 6px;
  background: var(--3lens-bg-secondary);
  border-radius: 3px;
}

.shadow-debugger-item-issues {
  font-size: 9px;
  color: var(--3lens-warning);
  padding: 2px 6px;
  background: rgba(251, 191, 36, 0.15);
  border-radius: 3px;
}

.shadow-debugger-item-stats {
  display: flex;
  gap: 10px;
  font-size: 10px;
  color: var(--3lens-text-secondary);
  font-family: var(--3lens-font-mono);
  flex-wrap: wrap;
}

.shadow-debugger-item-issues-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.shadow-debugger-issue {
  display: flex;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
  font-size: 10px;
}

.shadow-debugger-issue.warning {
  background: rgba(251, 191, 36, 0.1);
}

.shadow-debugger-issue.error {
  background: rgba(239, 68, 68, 0.1);
}

.shadow-debugger-issue.info {
  background: rgba(96, 165, 250, 0.1);
}

.shadow-debugger-issue-icon {
  flex-shrink: 0;
}

.shadow-debugger-issue-content {
  flex: 1;
}

.shadow-debugger-issue-message {
  color: var(--3lens-text-primary);
  margin-bottom: 2px;
}

.shadow-debugger-issue-suggestion {
  color: var(--3lens-text-tertiary);
  font-size: 9px;
}

.shadow-debugger-success {
  padding: 16px;
  text-align: center;
  color: var(--3lens-success);
  font-size: 12px;
}

.shadow-debugger-info {
  padding: 16px;
  text-align: center;
  color: var(--3lens-text-secondary);
  font-size: 12px;
}

/* ═══════════════════════════════════════════════════════════════
   WEBGPU PANEL STYLES
   ═══════════════════════════════════════════════════════════════ */

.webgpu-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.webgpu-tabs {
  display: flex;
  gap: 2px;
  padding: 8px 8px 0;
  background: var(--3lens-bg-secondary);
  border-bottom: 1px solid var(--3lens-border);
}

.webgpu-tab {
  padding: 6px 12px;
  background: transparent;
  border: none;
  color: var(--3lens-text-secondary);
  font-size: 10px;
  font-family: inherit;
  cursor: pointer;
  border-radius: 4px 4px 0 0;
  transition: all 0.15s ease;
}

.webgpu-tab:hover {
  color: var(--3lens-text-primary);
  background: var(--3lens-bg-tertiary);
}

.webgpu-tab.active {
  background: var(--3lens-bg-primary);
  color: var(--3lens-accent);
  font-weight: 500;
}

.webgpu-tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

/* Not Available State */
.webgpu-not-available {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.webgpu-not-available-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.webgpu-not-available-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  margin-bottom: 8px;
}

.webgpu-not-available-desc {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  max-width: 300px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.webgpu-not-available-hint {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  background: var(--3lens-bg-secondary);
  padding: 8px 12px;
  border-radius: 4px;
}

.webgpu-not-available-hint code {
  background: var(--3lens-bg-tertiary);
  padding: 1px 4px;
  border-radius: 2px;
  font-family: 'SF Mono', Monaco, monospace;
  color: var(--3lens-accent);
}

/* Section */
.webgpu-section {
  margin-bottom: 16px;
}

.webgpu-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--3lens-border);
}

.webgpu-badge {
  background: var(--3lens-accent);
  color: #000;
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 600;
}

/* Pipeline List */
.webgpu-pipeline-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.webgpu-pipeline-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.webgpu-pipeline-item:hover {
  background: var(--3lens-bg-tertiary);
}

.webgpu-pipeline-item.selected {
  background: var(--3lens-accent);
  color: #000;
}

.webgpu-pipeline-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.webgpu-pipeline-name {
  flex: 1;
  font-size: 10px;
  font-family: 'SF Mono', Monaco, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.webgpu-pipeline-type {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
}

.webgpu-pipeline-item.selected .webgpu-pipeline-type {
  color: rgba(0, 0, 0, 0.6);
}

.webgpu-pipeline-usage {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
}

.webgpu-pipeline-item.selected .webgpu-pipeline-usage {
  color: rgba(0, 0, 0, 0.6);
}

/* Pipeline Details */
.webgpu-pipeline-details {
  margin-top: 16px;
  background: var(--3lens-bg-secondary);
  border-radius: 6px;
  border: 1px solid var(--3lens-border);
  overflow: hidden;
}

.webgpu-details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--3lens-bg-tertiary);
  border-bottom: 1px solid var(--3lens-border);
}

.webgpu-details-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--3lens-text-primary);
}

.webgpu-close-btn {
  background: transparent;
  border: none;
  color: var(--3lens-text-tertiary);
  font-size: 16px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.webgpu-close-btn:hover {
  color: var(--3lens-text-primary);
}

.webgpu-details-content {
  padding: 12px;
}

.webgpu-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 10px;
}

.webgpu-detail-label {
  color: var(--3lens-text-secondary);
}

.webgpu-detail-value {
  color: var(--3lens-text-primary);
}

.webgpu-detail-value.mono {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 9px;
}

.webgpu-shader-stage {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--3lens-border);
}

.webgpu-shader-stage-header {
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-secondary);
  margin-bottom: 6px;
}

.webgpu-shader-stage-entry {
  font-size: 10px;
  font-family: 'SF Mono', Monaco, monospace;
  color: var(--3lens-accent);
  background: var(--3lens-bg-tertiary);
  padding: 4px 8px;
  border-radius: 4px;
}

/* Bind Groups */
.webgpu-bindgroups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.webgpu-info {
  text-align: center;
  padding: 20px;
}

.webgpu-info-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.7;
}

.webgpu-info-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  margin-bottom: 8px;
}

.webgpu-info-desc {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  line-height: 1.5;
  max-width: 320px;
  margin: 0 auto;
}

.webgpu-bindgroup-types {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.webgpu-bindgroup-type {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--3lens-bg-secondary);
  border-radius: 6px;
}

.webgpu-bindgroup-type-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.webgpu-bindgroup-type-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--3lens-text-primary);
  min-width: 120px;
}

.webgpu-bindgroup-type-desc {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
}

/* Shaders */
.webgpu-shaders {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.webgpu-shader-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.webgpu-shader-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.webgpu-shader-item:hover {
  background: var(--3lens-bg-tertiary);
}

.webgpu-shader-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.webgpu-shader-name {
  flex: 1;
  font-size: 10px;
  font-family: 'SF Mono', Monaco, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.webgpu-shader-stages {
  display: flex;
  gap: 4px;
}

.webgpu-stage-badge {
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
}

.webgpu-stage-badge.vs {
  background: rgba(96, 165, 250, 0.2);
  color: #60A5FA;
}

.webgpu-stage-badge.fs {
  background: rgba(251, 146, 60, 0.2);
  color: #FB923C;
}

.webgpu-stage-badge.cs {
  background: rgba(52, 211, 153, 0.2);
  color: #34D399;
}

.webgpu-info-box {
  background: var(--3lens-bg-secondary);
  padding: 12px;
  border-radius: 6px;
  font-size: 10px;
  color: var(--3lens-text-secondary);
  line-height: 1.5;
}

.webgpu-info-box p {
  margin: 0 0 8px;
}

.webgpu-info-box p:last-child {
  margin-bottom: 0;
}

.webgpu-info-box strong {
  color: var(--3lens-accent);
}

.webgpu-info-box ul {
  margin: 8px 0 0;
  padding-left: 16px;
}

.webgpu-info-box li {
  margin-bottom: 4px;
}

/* Capabilities */
.webgpu-capabilities {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.webgpu-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.webgpu-stat {
  text-align: center;
  padding: 12px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 6px;
}

.webgpu-stat-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--3lens-accent);
  font-family: 'SF Mono', Monaco, monospace;
}

.webgpu-stat-label {
  display: block;
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  margin-top: 4px;
}

.webgpu-limits-info {
  margin-bottom: 8px;
}

.webgpu-limits-info code {
  background: var(--3lens-bg-tertiary);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 9px;
  color: var(--3lens-accent);
}

.webgpu-limits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.webgpu-limit {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
  font-size: 10px;
}

.webgpu-limit-name {
  color: var(--3lens-text-secondary);
}

.webgpu-limit-value {
  color: var(--3lens-text-primary);
  font-family: 'SF Mono', Monaco, monospace;
  font-weight: 500;
}

/* Comparison Table */
.webgpu-comparison {
  background: var(--3lens-bg-secondary);
  border-radius: 6px;
  overflow: hidden;
}

.webgpu-compare-row {
  display: grid;
  grid-template-columns: 1fr 60px 60px;
  padding: 8px 12px;
  font-size: 10px;
  border-bottom: 1px solid var(--3lens-border);
}

.webgpu-compare-row:last-child {
  border-bottom: none;
}

.webgpu-compare-row.header {
  background: var(--3lens-bg-tertiary);
  font-weight: 600;
  color: var(--3lens-text-secondary);
  text-transform: uppercase;
  font-size: 9px;
}

.webgpu-compare-row span:nth-child(2),
.webgpu-compare-row span:nth-child(3) {
  text-align: center;
}

.webgpu-compare-row .yes {
  color: var(--3lens-success);
}

.webgpu-compare-row .no {
  color: var(--3lens-text-tertiary);
}

.webgpu-compare-row .partial {
  color: var(--3lens-warning);
}

/* Empty States */
.webgpu-empty {
  text-align: center;
  padding: 24px;
  color: var(--3lens-text-secondary);
}

.webgpu-empty p {
  margin: 0 0 8px;
  font-size: 11px;
}

.webgpu-empty-small {
  padding: 12px;
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  font-style: italic;
}

.webgpu-hint {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  font-style: italic;
}

/* GPU Timing Tab */
.webgpu-timing {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.webgpu-timing-badge {
  background: var(--3lens-accent);
  color: #000;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  font-family: 'SF Mono', Monaco, monospace;
}

.webgpu-timing-summary {
  text-align: center;
  padding: 16px;
}

.webgpu-timing-total {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.webgpu-timing-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--3lens-accent);
  font-family: 'SF Mono', Monaco, monospace;
}

.webgpu-timing-unit {
  font-size: 14px;
  color: var(--3lens-text-secondary);
}

/* Timing Bar */
.webgpu-timing-bar-container {
  padding: 8px 0;
}

.webgpu-timing-bar {
  display: flex;
  height: 20px;
  border-radius: 4px;
  overflow: hidden;
  background: var(--3lens-bg-tertiary);
}

.webgpu-timing-bar-segment {
  height: 100%;
  transition: width 0.3s ease;
}

.webgpu-timing-bar-segment:first-child {
  border-radius: 4px 0 0 4px;
}

.webgpu-timing-bar-segment:last-child {
  border-radius: 0 4px 4px 0;
}

/* Timing Legend */
.webgpu-timing-legend {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.webgpu-timing-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 10px;
}

.webgpu-timing-legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.webgpu-timing-legend-name {
  flex: 1;
  color: var(--3lens-text-primary);
}

.webgpu-timing-legend-value {
  color: var(--3lens-text-secondary);
  font-family: 'SF Mono', Monaco, monospace;
  min-width: 60px;
  text-align: right;
}

.webgpu-timing-legend-pct {
  color: var(--3lens-text-tertiary);
  font-family: 'SF Mono', Monaco, monospace;
  min-width: 40px;
  text-align: right;
}

/* Timing Passes */
.webgpu-timing-passes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.webgpu-timing-pass {
  background: var(--3lens-bg-secondary);
  border-radius: 6px;
  padding: 8px 10px;
}

.webgpu-timing-pass.hot {
  border-left: 3px solid var(--3lens-error);
}

.webgpu-timing-pass-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.webgpu-timing-pass-color {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.webgpu-timing-pass-name {
  flex: 1;
  font-size: 10px;
  font-weight: 500;
  color: var(--3lens-text-primary);
}

.webgpu-timing-pass-time {
  font-size: 10px;
  font-family: 'SF Mono', Monaco, monospace;
  color: var(--3lens-accent);
}

.webgpu-timing-pass-bar {
  height: 4px;
  background: var(--3lens-bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.webgpu-timing-pass-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* Timing Analysis */
.webgpu-timing-analysis {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.webgpu-analysis-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
  font-size: 10px;
}

.webgpu-analysis-label {
  color: var(--3lens-text-secondary);
}

.webgpu-analysis-value {
  color: var(--3lens-text-primary);
  font-family: 'SF Mono', Monaco, monospace;
  font-weight: 500;
}

.webgpu-analysis-value.over {
  color: var(--3lens-error);
}

.webgpu-analysis-value.ok {
  color: var(--3lens-success);
}

/* ═══════════════════════════════════════════════════════════════
   COMMAND PALETTE
   ═══════════════════════════════════════════════════════════════ */

.three-lens-command-palette {
  position: fixed;
  inset: 0;
  z-index: 1000000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

.command-palette-backdrop {
  position: absolute;
  inset: 0;
  background: var(--3lens-overlay-bg);
  backdrop-filter: var(--3lens-backdrop-blur);
}

.command-palette-dialog {
  position: relative;
  width: 100%;
  max-width: 560px;
  max-height: 480px;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-xl);
  box-shadow: var(--3lens-shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: command-palette-enter 0.15s ease-out;
}

@keyframes command-palette-enter {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.command-palette-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--3lens-border);
  gap: 12px;
}

.command-palette-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--3lens-font-sans);
  font-size: 15px;
  color: var(--3lens-text-primary);
}

.command-palette-input::placeholder {
  color: var(--3lens-text-tertiary);
}

.command-palette-close {
  background: transparent;
  border: none;
  color: var(--3lens-text-tertiary);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  border-radius: var(--3lens-radius-sm);
  transition: all 0.15s ease;
}

.command-palette-close:hover {
  color: var(--3lens-text-primary);
  background: var(--3lens-bg-hover);
}

.command-palette-results {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.command-palette-empty {
  text-align: center;
  padding: 32px;
  color: var(--3lens-text-tertiary);
  font-size: 13px;
}

.command-palette-group {
  margin-bottom: 8px;
}

.command-palette-group-title {
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 12px 4px;
}

.command-palette-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--3lens-radius-md);
  cursor: pointer;
  transition: all 0.1s ease;
}

.command-palette-item:hover,
.command-palette-item.selected {
  background: var(--3lens-bg-hover);
}

.command-palette-item.selected {
  background: var(--3lens-accent);
  color: var(--3lens-text-inverse);
}

.command-palette-icon {
  font-size: 16px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.command-palette-title {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
}

.command-palette-title mark {
  background: var(--3lens-warning);
  color: var(--3lens-text-inverse);
  border-radius: 2px;
  padding: 0 2px;
}

.command-palette-item.selected .command-palette-title mark {
  background: rgba(255, 255, 255, 0.3);
  color: inherit;
}

.command-palette-desc {
  font-size: 11px;
  color: var(--3lens-text-tertiary);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.command-palette-item.selected .command-palette-desc {
  color: rgba(255, 255, 255, 0.7);
}

.command-palette-shortcut {
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  padding: 2px 6px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
}

.command-palette-item.selected .command-palette-shortcut {
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
}

.command-palette-footer {
  padding: 8px 16px;
  border-top: 1px solid var(--3lens-border);
  background: var(--3lens-bg-secondary);
}

.command-palette-hint {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  display: flex;
  align-items: center;
  gap: 12px;
}

.command-palette-hint kbd {
  font-family: var(--3lens-font-mono);
  padding: 2px 5px;
  background: var(--3lens-bg-tertiary);
  border-radius: 3px;
  margin-right: 4px;
}

/* ═══════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS PANEL
   ═══════════════════════════════════════════════════════════════ */

.three-lens-shortcuts-panel {
  position: fixed;
  inset: 0;
  z-index: 1000000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcuts-panel-backdrop {
  position: absolute;
  inset: 0;
  background: var(--3lens-overlay-bg);
  backdrop-filter: var(--3lens-backdrop-blur);
}

.shortcuts-panel-dialog {
  position: relative;
  width: 100%;
  max-width: 640px;
  max-height: 80vh;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-xl);
  box-shadow: var(--3lens-shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.shortcuts-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--3lens-border);
}

.shortcuts-panel-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--3lens-text-primary);
}

.shortcuts-panel-close {
  background: transparent;
  border: none;
  color: var(--3lens-text-tertiary);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  border-radius: var(--3lens-radius-sm);
}

.shortcuts-panel-close:hover {
  color: var(--3lens-text-primary);
  background: var(--3lens-bg-hover);
}

.shortcuts-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.shortcuts-group {
  margin-bottom: 20px;
}

.shortcuts-group-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.shortcut-row:last-child {
  border-bottom: none;
}

.shortcut-desc {
  font-size: 12px;
  color: var(--3lens-text-primary);
}

.shortcut-keys {
  font-family: var(--3lens-font-mono);
  font-size: 11px;
  padding: 4px 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   ACCESSIBILITY IMPROVEMENTS
   ═══════════════════════════════════════════════════════════════ */

/* Focus visible outlines */
.three-lens-root *:focus-visible {
  outline: 2px solid var(--3lens-border-focus);
  outline-offset: 2px;
}

/* Skip to content link (for screen readers) */
.three-lens-skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 1000001;
  padding: 8px 16px;
  background: var(--3lens-accent);
  color: var(--3lens-text-inverse);
  font-weight: 600;
  text-decoration: none;
  border-radius: var(--3lens-radius-md);
}

.three-lens-skip-link:focus {
  left: 16px;
  top: 16px;
}

/* Screen reader only text */
.three-lens-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Improved button states */
.three-lens-root button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .three-lens-root,
  .three-lens-root * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode improvements */
@media (prefers-contrast: more) {
  .three-lens-root {
    --3lens-border: #ffffff;
    --3lens-text-secondary: #e0e0e0;
  }
}

/* Touch-friendly targets on mobile */
@media (pointer: coarse) {
  .three-lens-root button,
  .three-lens-root [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
  
  .command-palette-item {
    padding: 14px 12px;
  }
  
  .shortcut-row {
    padding: 12px 0;
  }
}

/* Theme toggle button */
.three-lens-theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-md);
  cursor: pointer;
  color: var(--3lens-text-secondary);
  font-size: 16px;
  transition: all 0.15s ease;
}

.three-lens-theme-toggle:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

/* Theme indicator in menu */
.theme-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--3lens-radius-md);
  background: var(--3lens-bg-secondary);
  margin-bottom: 8px;
}

.theme-indicator-icon {
  font-size: 18px;
}

.theme-indicator-text {
  flex: 1;
  font-size: 11px;
}

.theme-indicator-label {
  color: var(--3lens-text-tertiary);
}

.theme-indicator-value {
  color: var(--3lens-text-primary);
  font-weight: 500;
}
`;class pt{constructor(e){h(this,"rowHeight");h(this,"overscan");h(this,"container");h(this,"getId");h(this,"getChildren");h(this,"isExpanded");h(this,"renderRow");h(this,"onScrollCallback");h(this,"rootNodes",[]);h(this,"flattenedNodes",[]);h(this,"scrollTop",0);h(this,"containerHeight",0);h(this,"scrollContainer",null);h(this,"contentContainer",null);h(this,"rowsContainer",null);h(this,"animationFrameId",null);h(this,"resizeObserver",null);h(this,"lastRenderRange",null);h(this,"handleScroll",()=>{var e;this.scrollContainer&&(this.scrollTop=this.scrollContainer.scrollTop,this.scheduleRender(),(e=this.onScrollCallback)==null||e.call(this,this.scrollTop))});this.rowHeight=e.rowHeight,this.overscan=e.overscan??5,this.container=e.container,this.getId=e.getId,this.getChildren=e.getChildren,this.isExpanded=e.isExpanded,this.renderRow=e.renderRow,this.onScrollCallback=e.onScroll,this.setupDOM(),this.setupEventListeners()}setData(e){this.rootNodes=e,this.rebuildFlattenedList(),this.render()}rebuildFlattenedList(){this.flattenedNodes=[],this.flattenNodes(this.rootNodes,0,null)}flattenNodes(e,t,s){for(const n of e){const a=this.getId(n),i=this.getChildren(n),l=i.length>0,o=l&&this.isExpanded(a),d={data:n,id:a,depth:t,hasChildren:l,isExpanded:o,parentId:s,flatIndex:this.flattenedNodes.length};this.flattenedNodes.push(d),o&&this.flattenNodes(i,t+1,a)}}setupDOM(){this.container.innerHTML="",this.scrollContainer=document.createElement("div"),this.scrollContainer.className="virtual-scroll-container",this.scrollContainer.style.cssText=`
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
    `,this.contentContainer=document.createElement("div"),this.contentContainer.className="virtual-scroll-content",this.contentContainer.style.cssText=`
      position: relative;
      width: 100%;
    `,this.rowsContainer=document.createElement("div"),this.rowsContainer.className="virtual-scroll-rows",this.rowsContainer.style.cssText=`
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    `,this.contentContainer.appendChild(this.rowsContainer),this.scrollContainer.appendChild(this.contentContainer),this.container.appendChild(this.scrollContainer)}setupEventListeners(){this.scrollContainer&&(this.scrollContainer.addEventListener("scroll",this.handleScroll,{passive:!0}),this.resizeObserver=new ResizeObserver(e=>{for(const t of e)this.containerHeight=t.contentRect.height,this.scheduleRender()}),this.resizeObserver.observe(this.scrollContainer),this.containerHeight=this.scrollContainer.clientHeight)}scheduleRender(){this.animationFrameId===null&&(this.animationFrameId=requestAnimationFrame(()=>{this.animationFrameId=null,this.render()}))}getVisibleRange(){const e=this.flattenedNodes.length;if(e===0)return{start:0,end:0};const t=Math.ceil(this.containerHeight/this.rowHeight),s=Math.floor(this.scrollTop/this.rowHeight),n=Math.max(0,s-this.overscan),a=Math.min(e,s+t+this.overscan);return{start:n,end:a}}render(){if(!this.contentContainer||!this.rowsContainer)return;const t=this.flattenedNodes.length*this.rowHeight;this.contentContainer.style.height=`${t}px`;const{start:s,end:n}=this.getVisibleRange();if(this.lastRenderRange&&this.lastRenderRange.start===s&&this.lastRenderRange.end===n)return;this.lastRenderRange={start:s,end:n};const a=s*this.rowHeight;this.rowsContainer.style.transform=`translateY(${a}px)`;const l=this.flattenedNodes.slice(s,n).map((o,d)=>this.renderRow(o,s+d)).join("");this.rowsContainer.innerHTML=l}getState(){const{start:e,end:t}=this.getVisibleRange();return{scrollTop:this.scrollTop,containerHeight:this.containerHeight,totalHeight:this.flattenedNodes.length*this.rowHeight,startIndex:e,endIndex:t,totalRows:this.flattenedNodes.length}}scrollToIndex(e,t="start"){if(!this.scrollContainer)return;const s=Math.max(0,Math.min(e,this.flattenedNodes.length-1));let n;switch(t){case"start":n=s*this.rowHeight;break;case"center":n=s*this.rowHeight-this.containerHeight/2+this.rowHeight/2;break;case"end":n=(s+1)*this.rowHeight-this.containerHeight;break}this.scrollContainer.scrollTop=Math.max(0,n)}scrollToId(e,t="center"){const s=this.flattenedNodes.findIndex(n=>n.id===e);s!==-1&&this.scrollToIndex(s,t)}getNodeById(e){return this.flattenedNodes.find(t=>t.id===e)}getNodes(){return this.flattenedNodes}update(){this.rebuildFlattenedList(),this.render()}forceRender(){this.lastRenderRange=null,this.render()}dispose(){this.animationFrameId!==null&&cancelAnimationFrame(this.animationFrameId),this.scrollContainer&&this.scrollContainer.removeEventListener("scroll",this.handleScroll),this.resizeObserver&&this.resizeObserver.disconnect(),this.container.innerHTML=""}}const ht=`
/* Virtual scroll container */
.virtual-scroll-container {
  contain: strict;
}

/* Virtual scroll rows - use will-change for GPU acceleration */
.virtual-scroll-rows {
  will-change: transform;
}

/* Virtual tree node - fixed height for calculations */
.virtual-tree-node {
  height: var(--virtual-row-height, 28px);
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

/* Indentation based on depth */
.virtual-tree-node[data-depth="0"] { padding-left: 8px; }
.virtual-tree-node[data-depth="1"] { padding-left: 24px; }
.virtual-tree-node[data-depth="2"] { padding-left: 40px; }
.virtual-tree-node[data-depth="3"] { padding-left: 56px; }
.virtual-tree-node[data-depth="4"] { padding-left: 72px; }
.virtual-tree-node[data-depth="5"] { padding-left: 88px; }
.virtual-tree-node[data-depth="6"] { padding-left: 104px; }
.virtual-tree-node[data-depth="7"] { padding-left: 120px; }
.virtual-tree-node[data-depth="8"] { padding-left: 136px; }
.virtual-tree-node[data-depth="9"] { padding-left: 152px; }
.virtual-tree-node[data-depth="10"] { padding-left: 168px; }

/* Deep nesting fallback - calculate padding dynamically */
.virtual-tree-node {
  padding-left: calc(8px + var(--depth, 0) * 16px);
}
`;function Me(r){let e=1;for(const t of r.children)e+=Me(t);return e}function gt(){return{selectedNodeId:null,selectedMaterialId:null,selectedGeometryId:null,selectedTextureId:null,selectedRenderTargetId:null,expandedNodes:new Set,materialsSearch:"",geometrySearch:"",texturesSearch:"",renderTargetsSearch:"",geometryVisualization:{wireframe:new Set,boundingBox:new Set,normals:new Set},texturePreviewChannel:"rgb",renderTargetPreviewMode:"color",renderTargetZoom:1,frameHistory:[],fpsHistory:[]}}function U(r){return r>=1e6?(r/1e6).toFixed(1)+"M":r>=1e3?(r/1e3).toFixed(1)+"K":r.toString()}function A(r){return r<=0||Number.isNaN(r)?"0 B":r<1024?`${r.toFixed(0)} B`:r<1024*1024?`${(r/1024).toFixed(1)} KB`:r<1024*1024*1024?`${(r/(1024*1024)).toFixed(1)} MB`:`${(r/(1024*1024*1024)).toFixed(2)} GB`}function w(r){return r.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function ut(r,e=40){if(r.length<=e)return r;const t=r.split("/"),s=t[t.length-1];return s.length<e-3?"..."+s:r.substring(0,e-3)+"..."}function mt(r){return r.includes("Physical")?"◆":r.includes("Standard")?"◇":r.includes("Basic")?"○":r.includes("Lambert")?"◐":r.includes("Phong")?"◑":r.includes("Toon")?"◕":r.includes("Shader")||r.includes("Raw")?"⬡":r.includes("Sprite")?"◎":r.includes("Points")?"•":r.includes("Line")?"―":"●"}function Te(r){const e=r.toLowerCase();return e.includes("box")||e.includes("cube")?"📦":e.includes("sphere")?"🔮":e.includes("plane")?"⬛":e.includes("cylinder")?"🧴":e.includes("cone")?"🔺":e.includes("torus")?"🍩":e.includes("ring")?"💍":e.includes("circle")?"⭕":e.includes("tube")?"🧪":e.includes("extrude")?"📊":e.includes("lathe")?"🏺":e.includes("text")||e.includes("shape")?"✒️":e.includes("instanced")?"🔄":"📐"}function Ce(r){return r.isCubeTexture?"🎲":r.isVideoTexture?"🎬":r.isCanvasTexture?"🎨":r.isDataTexture?"📊":r.isRenderTarget?"🎯":r.isCompressed?"📦":"🖼️"}function vt(r){return{Float32Array:"f32",Float64Array:"f64",Int8Array:"i8",Int16Array:"i16",Int32Array:"i32",Uint8Array:"u8",Uint16Array:"u16",Uint32Array:"u32",Uint8ClampedArray:"u8c"}[r]||r}const bt=new Set(["const","uniform","attribute","varying","in","out","inout","centroid","flat","smooth","noperspective","layout","patch","sample","buffer","shared","coherent","volatile","restrict","readonly","writeonly","precision","highp","mediump","lowp","if","else","for","while","do","switch","case","default","break","continue","return","discard","void","bool","int","uint","float","double","vec2","vec3","vec4","dvec2","dvec3","dvec4","bvec2","bvec3","bvec4","ivec2","ivec3","ivec4","uvec2","uvec3","uvec4","mat2","mat3","mat4","mat2x2","mat2x3","mat2x4","mat3x2","mat3x3","mat3x4","mat4x2","mat4x3","mat4x4","sampler1D","sampler2D","sampler3D","samplerCube","sampler1DShadow","sampler2DShadow","samplerCubeShadow","sampler1DArray","sampler2DArray","sampler1DArrayShadow","sampler2DArrayShadow","isampler1D","isampler2D","isampler3D","isamplerCube","usampler1D","usampler2D","usampler3D","usamplerCube","struct","true","false"]),ft=new Set(["radians","degrees","sin","cos","tan","asin","acos","atan","sinh","cosh","tanh","asinh","acosh","atanh","pow","exp","log","exp2","log2","sqrt","inversesqrt","abs","sign","floor","trunc","round","roundEven","ceil","fract","mod","modf","min","max","clamp","mix","step","smoothstep","isnan","isinf","floatBitsToInt","floatBitsToUint","intBitsToFloat","uintBitsToFloat","length","distance","dot","cross","normalize","faceforward","reflect","refract","matrixCompMult","outerProduct","transpose","determinant","inverse","lessThan","lessThanEqual","greaterThan","greaterThanEqual","equal","notEqual","any","all","not","texture","textureProj","textureLod","textureOffset","texelFetch","textureGrad","textureGather","textureSize","textureProjLod","texture2D","texture2DProj","texture2DLod","textureCube","textureCubeLod","dFdx","dFdy","fwidth","noise1","noise2","noise3","noise4","main"]);function ve(r){let e="",t=0;const s=r.length;for(;t<s;){if(r[t]==="/"&&r[t+1]==="*"){const n=r.indexOf("*/",t+2),a=n===-1?s:n+2;e+=`<span class="glsl-comment">${w(r.slice(t,a))}</span>`,t=a;continue}if(r[t]==="/"&&r[t+1]==="/"){const n=r.indexOf(`
`,t),a=n===-1?s:n;e+=`<span class="glsl-comment">${w(r.slice(t,a))}</span>`,t=a;continue}if(r[t]==="#"){const n=r.indexOf(`
`,t),a=n===-1?s:n;e+=`<span class="glsl-preprocessor">${w(r.slice(t,a))}</span>`,t=a;continue}if(r[t]==='"'){let n=t+1;for(;n<s&&r[n]!=='"'&&r[n]!==`
`;)r[n]==="\\"&&n++,n++;r[n]==='"'&&n++,e+=`<span class="glsl-string">${w(r.slice(t,n))}</span>`,t=n;continue}if(/[0-9]/.test(r[t])||r[t]==="."&&/[0-9]/.test(r[t+1])){let n=t;if(r[n]==="0"&&(r[n+1]==="x"||r[n+1]==="X"))for(n+=2;n<s&&/[0-9a-fA-F]/.test(r[n]);)n++;else{for(;n<s&&/[0-9]/.test(r[n]);)n++;if(r[n]==="."&&/[0-9]/.test(r[n+1]))for(n++;n<s&&/[0-9]/.test(r[n]);)n++;if(r[n]==="e"||r[n]==="E")for(n++,(r[n]==="+"||r[n]==="-")&&n++;n<s&&/[0-9]/.test(r[n]);)n++}r[n]==="u"||r[n]==="U"||r[n]==="f"||r[n]==="F"?n++:(r[n]==="l"||r[n]==="L")&&(r[n+1]==="f"||r[n+1]==="F")&&(n+=2),e+=`<span class="glsl-number">${w(r.slice(t,n))}</span>`,t=n;continue}if(/[a-zA-Z_]/.test(r[t])){let n=t;for(;n<s&&/[a-zA-Z0-9_]/.test(r[n]);)n++;const a=r.slice(t,n);bt.has(a)?e+=`<span class="glsl-keyword">${a}</span>`:ft.has(a)?e+=`<span class="glsl-builtin">${a}</span>`:a.startsWith("gl_")?e+=`<span class="glsl-builtin-var">${a}</span>`:e+=`<span class="glsl-ident">${a}</span>`,t=n;continue}if("+-*/%=<>!&|^~?:;,.()[]{}#".includes(r[t])){e+=`<span class="glsl-punct">${w(r[t])}</span>`,t++;continue}e+=w(r[t]),t++}return e}function be(r,e=20){const t=r.split(`
`);return t.length<=e?r:t.slice(0,e).join(`
`)+`

// ... ${t.length-e} more lines`}function xt(r){const e=new Map;if(!(r!=null&&r.scenes))return e;function t(s){const n=s.ref.name||s.ref.type;if(e.set(s.ref.debugId,n),s.children)for(const a of s.children)t(a)}for(const s of r.scenes)t(s);return e}function yt(r,e){var o,d;const t=(o=r.snapshot)==null?void 0:o.materials,s=(d=r.snapshot)==null?void 0:d.materialsSummary;if(!(t!=null&&t.length))return`
      <div class="panel-empty-state">
        <div class="empty-icon">🎨</div>
        <h2>No Materials</h2>
        <p>No materials found in observed scenes.</p>
        <p class="hint">Make sure scenes are being observed and contain meshes with materials.</p>
      </div>
    `;const n=xt(r.snapshot),a=e.materialsSearch.toLowerCase().trim(),i=a?t.filter(c=>{const p=(c.name||c.type).toLowerCase(),g=c.usedByMeshes.map(u=>n.get(u)||"").join(" ").toLowerCase();return p.includes(a)||g.includes(a)}):t,l=e.selectedMaterialId?t.find(c=>c.uuid===e.selectedMaterialId):null;return`
    <div class="panel-split-view materials-split-view">
      <div class="panel-list materials-list-panel">
        ${wt(s)}
        <div class="materials-list">
          ${i.length>0?i.map(c=>$t(c,e,n)).join(""):`<div class="no-results">No materials match "${w(e.materialsSearch)}"</div>`}
        </div>
      </div>
      <div class="panel-inspector materials-inspector-panel">
        ${l?St(l,n):kt()}
      </div>
    </div>
  `}function wt(r){return r?`
    <div class="panel-summary materials-summary">
      <div class="summary-stat">
        <span class="summary-value">${r.totalCount}</span>
        <span class="summary-label">Materials</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${r.shaderMaterialCount}</span>
        <span class="summary-label">Shaders</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${r.transparentCount}</span>
        <span class="summary-label">Transparent</span>
      </div>
    </div>
  `:""}function $t(r,e,t){const s=e.selectedMaterialId===r.uuid,n=r.color!==void 0?r.color.toString(16).padStart(6,"0"):null,a=mt(r.type),i=r.usedByMeshes.map(c=>t.get(c)||c.substring(0,8)).slice(0,3),l=r.usedByMeshes.length-i.length,o=r.name||r.type,d=i.join(", ")+(l>0?` +${l}`:"");return`
    <div class="list-item material-item ${s?"selected":""}" data-uuid="${r.uuid}" data-action="select-material">
      <div class="material-item-color">
        ${n?`<span class="color-swatch" style="background: #${n};"></span>`:'<span class="color-swatch no-color">∅</span>'}
      </div>
      <div class="material-item-info">
        <div class="material-item-name">${w(o)}</div>
        <div class="material-item-type">
          <span class="type-icon">${a}</span>
          ${w(d)}
        </div>
      </div>
      <div class="material-item-badges">
        ${r.isShaderMaterial?'<span class="badge shader">GLSL</span>':""}
        ${r.transparent?'<span class="badge transparent">α</span>':""}
        ${r.textures.length>0?`<span class="badge textures">${r.textures.length} tex</span>`:""}
      </div>
      <div class="material-item-usage">${r.usageCount}×</div>
    </div>
  `}function kt(){return`
    <div class="no-selection">
      <div class="no-selection-icon">🎨</div>
      <div class="no-selection-text">Select a material to inspect</div>
    </div>
  `}function St(r,e){const t=r.color!==void 0?r.color.toString(16).padStart(6,"0"):null,s=r.emissive!==void 0?r.emissive.toString(16).padStart(6,"0"):null,n=r.usedByMeshes.map(i=>({debugId:i,name:e.get(i)||i.substring(0,8)})),a=r.name||r.type;return`
    <div class="inspector-header material-header">
      ${t?`<span class="color-swatch large" style="background: #${t};"></span>`:""}
      <div class="inspector-header-text">
        <span class="inspector-title">${w(a)}</span>
        <span class="inspector-subtitle">${r.type}</span>
      </div>
      <span class="inspector-uuid">${r.uuid.substring(0,8)}</span>
    </div>

    <div class="inspector-section used-by-section">
      <div class="section-title">Used By (${n.length})</div>
      <div class="used-by-list">
        ${n.map(i=>`
          <div class="used-by-item" data-debug-id="${i.debugId}">
            <span class="mesh-icon">M</span>
            <span class="mesh-name">${w(i.name)}</span>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="inspector-section">
      <div class="section-title">Properties</div>
      <div class="property-grid">
        ${t!==null?`
        <div class="property-row">
          <span class="property-label">Color</span>
          <span class="property-value editable">
            <input type="color" class="prop-color-input" data-property="color" data-material="${r.uuid}" value="#${t}" />
            <span class="color-hex">#${t.toUpperCase()}</span>
          </span>
        </div>
        `:""}
        ${s!==null?`
        <div class="property-row">
          <span class="property-label">Emissive</span>
          <span class="property-value editable">
            <input type="color" class="prop-color-input" data-property="emissive" data-material="${r.uuid}" value="#${s}" />
            <span class="color-hex">#${s.toUpperCase()}</span>
          </span>
        </div>
        `:""}
        <div class="property-row">
          <span class="property-label">Opacity</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="opacity" data-material="${r.uuid}"
                   min="0" max="1" step="0.01" value="${r.opacity}" />
            <span class="range-value">${r.opacity.toFixed(2)}</span>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Transparent</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="transparent" data-material="${r.uuid}" ${r.transparent?"checked":""} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Visible</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="visible" data-material="${r.uuid}" ${r.visible?"checked":""} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Side</span>
          <span class="property-value editable">
            <select class="prop-select-input" data-property="side" data-material="${r.uuid}">
              <option value="0" ${r.side===0?"selected":""}>Front</option>
              <option value="1" ${r.side===1?"selected":""}>Back</option>
              <option value="2" ${r.side===2?"selected":""}>Double</option>
            </select>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Wireframe</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="wireframe" data-material="${r.uuid}" ${r.wireframe?"checked":""} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Depth Test</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="depthTest" data-material="${r.uuid}" ${r.depthTest?"checked":""} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Depth Write</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="depthWrite" data-material="${r.uuid}" ${r.depthWrite?"checked":""} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
      </div>
    </div>

    ${r.pbr?Mt(r.pbr,r.uuid):""}
    ${r.textures.length>0?Tt(r.textures):""}
    ${r.shader?Ct(r.shader):""}

    <div class="inspector-section">
      <div class="section-title">Usage</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Used by</span>
          <span class="property-value">${r.usageCount} mesh${r.usageCount!==1?"es":""}</span>
        </div>
      </div>
    </div>
  `}function Mt(r,e){return`
    <div class="inspector-section">
      <div class="section-title">PBR Properties</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Roughness</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input pbr-slider" data-property="roughness" data-material="${e}"
                   min="0" max="1" step="0.01" value="${r.roughness}" />
            <span class="range-value">${r.roughness.toFixed(2)}</span>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Metalness</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input pbr-slider metalness" data-property="metalness" data-material="${e}"
                   min="0" max="1" step="0.01" value="${r.metalness}" />
            <span class="range-value">${r.metalness.toFixed(2)}</span>
          </span>
        </div>
        ${r.reflectivity!==void 0?`
        <div class="property-row">
          <span class="property-label">Reflectivity</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="reflectivity" data-material="${e}"
                   min="0" max="1" step="0.01" value="${r.reflectivity}" />
            <span class="range-value">${r.reflectivity.toFixed(2)}</span>
          </span>
        </div>
        `:""}
        ${r.clearcoat!==void 0?`
        <div class="property-row">
          <span class="property-label">Clearcoat</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="clearcoat" data-material="${e}"
                   min="0" max="1" step="0.01" value="${r.clearcoat}" />
            <span class="range-value">${r.clearcoat.toFixed(2)}</span>
          </span>
        </div>
        `:""}
        ${r.transmission!==void 0?`
        <div class="property-row">
          <span class="property-label">Transmission</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="transmission" data-material="${e}"
                   min="0" max="1" step="0.01" value="${r.transmission}" />
            <span class="range-value">${r.transmission.toFixed(2)}</span>
          </span>
        </div>
        `:""}
        ${r.ior!==void 0?`
        <div class="property-row">
          <span class="property-label">IOR</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="ior" data-material="${e}"
                   min="1" max="2.5" step="0.01" value="${r.ior}" />
            <span class="range-value">${r.ior.toFixed(2)}</span>
          </span>
        </div>
        `:""}
      </div>
    </div>
  `}function Tt(r){return`
    <div class="inspector-section">
      <div class="section-title">Textures (${r.length})</div>
      <div class="texture-list">
        ${r.map(e=>`
          <div class="texture-item">
            <span class="texture-slot">${e.slot}</span>
            <span class="texture-uuid">${e.uuid.substring(0,8)}...</span>
            ${e.name?`<span class="texture-name">${w(e.name)}</span>`:""}
          </div>
        `).join("")}
      </div>
    </div>
  `}function Ct(r){const e=Object.keys(r.defines).length>0;return`
    <div class="inspector-section shader-section">
      <div class="section-title">Shader</div>
      
      ${r.uniforms.length>0?`
      <div class="shader-subsection">
        <div class="subsection-title">Uniforms (${r.uniforms.length})</div>
        <div class="uniforms-list">
          ${r.uniforms.map(t=>`
            <div class="uniform-item">
              <span class="uniform-type">${t.type}</span>
              <span class="uniform-name">${t.name}</span>
              <span class="uniform-value">${zt(t)}</span>
            </div>
          `).join("")}
        </div>
      </div>
      `:""}

      ${e?`
      <div class="shader-subsection">
        <div class="subsection-title">Defines</div>
        <div class="defines-list">
          ${Object.entries(r.defines).map(([t,s])=>`
            <div class="define-item">
              <span class="define-name">${t}</span>
              <span class="define-value">${String(s)}</span>
            </div>
          `).join("")}
        </div>
      </div>
      `:""}

      <div class="shader-subsection">
        <div class="subsection-title">Vertex Shader</div>
        <pre class="shader-code"><code>${ve(be(r.vertexShader))}</code></pre>
      </div>

      <div class="shader-subsection">
        <div class="subsection-title">Fragment Shader</div>
        <pre class="shader-code"><code>${ve(be(r.fragmentShader))}</code></pre>
      </div>
    </div>
  `}function zt(r){const e=r.value;if(e==null)return"null";if(typeof e=="number")return e.toFixed(4);if(typeof e=="object"){if("x"in e&&"y"in e&&"z"in e&&"w"in e){const t=e;return`(${t.x.toFixed(2)}, ${t.y.toFixed(2)}, ${t.z.toFixed(2)}, ${t.w.toFixed(2)})`}if("x"in e&&"y"in e&&"z"in e){const t=e;return`(${t.x.toFixed(2)}, ${t.y.toFixed(2)}, ${t.z.toFixed(2)})`}if("r"in e&&"g"in e&&"b"in e){const t=e;return`rgb(${t.r.toFixed(2)}, ${t.g.toFixed(2)}, ${t.b.toFixed(2)})`}if("x"in e&&"y"in e){const t=e;return`(${t.x.toFixed(2)}, ${t.y.toFixed(2)})`}if("uuid"in e)return`texture:${e.uuid.substring(0,8)}`;if(Array.isArray(e))return`[${e.length}]`}return String(e)}function Pt(r,e,t,s,n){r.querySelectorAll('[data-action="select-material"]').forEach(a=>{const i=a,l=i.dataset.uuid;i.addEventListener("click",()=>{if(!l)return;const o=t.selectedMaterialId===l?null:l;s({selectedMaterialId:o}),n()})}),r.querySelectorAll(".prop-color-input").forEach(a=>{a.addEventListener("input",()=>{const i=a.dataset.property,l=a.dataset.material;if(!i||!l)return;const o=parseInt(a.value.replace("#",""),16);e.sendCommand({type:"update-material-property",materialUuid:l,property:i,value:o})})}),r.querySelectorAll(".prop-range-input").forEach(a=>{a.addEventListener("input",()=>{var c;const i=a.dataset.property,l=a.dataset.material;if(!i||!l)return;const o=parseFloat(a.value),d=(c=a.parentElement)==null?void 0:c.querySelector(".range-value");d&&(d.textContent=o.toFixed(2)),e.sendCommand({type:"update-material-property",materialUuid:l,property:i,value:o})})}),r.querySelectorAll(".prop-checkbox-input").forEach(a=>{a.addEventListener("change",()=>{const i=a.dataset.property,l=a.dataset.material;!i||!l||e.sendCommand({type:"update-material-property",materialUuid:l,property:i,value:a.checked})})}),r.querySelectorAll(".prop-select-input").forEach(a=>{a.addEventListener("change",()=>{const i=a.dataset.property,l=a.dataset.material;if(!i||!l)return;const o=parseInt(a.value,10);e.sendCommand({type:"update-material-property",materialUuid:l,property:i,value:o})})})}function Et(r){const e=new Map;if(!(r!=null&&r.scenes))return e;function t(s){const n=s.ref.name||s.ref.type;if(e.set(s.ref.debugId,n),s.children)for(const a of s.children)t(a)}for(const s of r.scenes)t(s);return e}function Lt(r,e){var o,d;const t=(o=r.snapshot)==null?void 0:o.geometries,s=(d=r.snapshot)==null?void 0:d.geometriesSummary;if(!(t!=null&&t.length))return`
      <div class="panel-empty-state">
        <div class="empty-icon">📐</div>
        <h2>No Geometries</h2>
        <p>No geometries found in observed scenes.</p>
        <p class="hint">Make sure scenes are being observed and contain meshes with geometries.</p>
      </div>
    `;const n=Et(r.snapshot),a=e.geometrySearch.toLowerCase().trim(),i=a?t.filter(c=>{const p=(c.name||c.type).toLowerCase(),g=c.usedByMeshes.map(u=>n.get(u)||"").join(" ").toLowerCase();return p.includes(a)||g.includes(a)}):t,l=e.selectedGeometryId?t.find(c=>c.uuid===e.selectedGeometryId):null;return`
    <div class="panel-split-view geometry-split-view">
      <div class="panel-list geometry-list-panel">
        ${It(s)}
        <div class="geometry-list">
          ${i.length>0?i.map(c=>Ft(c,e,n)).join(""):`<div class="no-results">No geometries match "${w(e.geometrySearch)}"</div>`}
        </div>
      </div>
      <div class="panel-inspector geometry-inspector-panel">
        ${l?Rt(l,e,n):Bt()}
      </div>
    </div>
  `}function It(r){return r?`
    <div class="panel-summary geometry-summary">
      <div class="summary-stat">
        <span class="summary-value">${r.totalCount}</span>
        <span class="summary-label">Geometries</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${U(r.totalVertices)}</span>
        <span class="summary-label">Vertices</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${U(r.totalTriangles)}</span>
        <span class="summary-label">Triangles</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${A(r.totalMemoryBytes)}</span>
        <span class="summary-label">GPU Memory</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${r.indexedCount}</span>
        <span class="summary-label">Indexed</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${r.morphedCount}</span>
        <span class="summary-label">Morphed</span>
      </div>
    </div>
  `:""}function Ft(r,e,t){const s=e.selectedGeometryId===r.uuid,n=Te(r.type),a=r.usedByMeshes.map(d=>t.get(d)||d.substring(0,8)).slice(0,3),i=r.usedByMeshes.length-a.length,l=r.name||r.type,o=a.join(", ")+(i>0?` +${i}`:"");return`
    <div class="list-item geometry-item ${s?"selected":""}" data-uuid="${r.uuid}" data-action="select-geometry">
      <div class="geometry-item-icon">${n}</div>
      <div class="geometry-item-info">
        <div class="geometry-item-name-row">
          <div class="geometry-item-name">${w(l)}</div>
          <div class="geometry-item-stats">
            <span class="geo-stat-pill vertices">${U(r.vertexCount)} v</span>
            <span class="geo-stat-pill triangles">${U(r.faceCount)} △</span>
            <span class="geo-stat-pill memory">${A(r.memoryBytes)}</span>
            <span class="geo-stat-pill usage">${r.usageCount}×</span>
          </div>
        </div>
        <div class="geometry-item-meta">
          <span class="geometry-used-by">${w(o)}</span>
        </div>
      </div>
    </div>
  `}function Bt(){return`
    <div class="no-selection">
      <div class="no-selection-icon">📐</div>
      <div class="no-selection-text">Select a geometry to inspect</div>
    </div>
  `}function Rt(r,e,t){const s=Te(r.type),n=r.usedByMeshes.map(i=>({debugId:i,name:t.get(i)||i.substring(0,8)})),a=r.name||r.type;return`
    <div class="inspector-header geometry-header">
      <div class="geometry-item-icon">${s}</div>
      <div class="inspector-header-text">
        <span class="inspector-title">${w(a)}</span>
        <span class="inspector-subtitle">${r.type}</span>
      </div>
      <span class="inspector-uuid">${r.uuid.substring(0,8)}</span>
    </div>

    <div class="inspector-section used-by-section">
      <div class="section-title">Used By (${n.length})</div>
      <div class="used-by-list">
        ${n.map(i=>`
          <div class="used-by-item" data-debug-id="${i.debugId}">
            <span class="mesh-icon">M</span>
            <span class="mesh-name">${w(i.name)}</span>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="inspector-section">
      <div class="section-title">Overview</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Vertices</span>
          <span class="property-value">${U(r.vertexCount)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Triangles</span>
          <span class="property-value">${U(r.faceCount)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Indices</span>
          <span class="property-value">${r.isIndexed?U(r.indexCount):"Non-indexed"}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Memory (est.)</span>
          <span class="property-value">${A(r.memoryBytes)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Used by</span>
          <span class="property-value">${r.usageCount} mesh${r.usageCount!==1?"es":""}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Draw Range</span>
          <span class="property-value">${r.drawRange.start} → ${r.drawRange.count===1/0?"∞":r.drawRange.count}</span>
        </div>
      </div>
    </div>

    ${At(r.attributes)}
    ${r.boundingBox?Gt(r.boundingBox):""}
    ${r.boundingSphere?Ht(r.boundingSphere):""}
    ${r.groups.length>0?Nt(r.groups):""}
    ${r.morphAttributes&&r.morphAttributes.length>0?Dt(r.morphAttributes):""}

    <div class="inspector-actions">
      <button class="action-btn ${e.geometryVisualization.boundingBox.has(r.uuid)?"active":""}" data-action="toggle-bbox" data-uuid="${r.uuid}">
        <span class="btn-icon">📦</span>
        Bounds
      </button>
      <button class="action-btn ${e.geometryVisualization.wireframe.has(r.uuid)?"active":""}" data-action="toggle-wireframe" data-uuid="${r.uuid}">
        <span class="btn-icon">🔲</span>
        Wireframe
      </button>
      <button class="action-btn ${e.geometryVisualization.normals.has(r.uuid)?"active":""}" data-action="toggle-normals" data-uuid="${r.uuid}">
        <span class="btn-icon">↗️</span>
        Normals
      </button>
    </div>
  `}function At(r){return r.length===0?"":`
    <div class="inspector-section">
      <div class="section-title">Attributes (${r.length})</div>
      <table class="attributes-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Type</th>
            <th>Memory</th>
          </tr>
        </thead>
        <tbody>
          ${r.map(e=>`
            <tr>
              <td>
                <span class="attr-name">${e.name}</span>
                ${e.isInstancedAttribute?'<span class="badge transparent">instanced</span>':""}
              </td>
              <td class="attr-count">${U(e.count)} × ${e.itemSize}</td>
              <td class="attr-type">${vt(e.arrayType)}${e.normalized?" (N)":""}</td>
              <td class="attr-size">${A(e.memoryBytes)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `}function Gt(r){const e=Math.abs(r.max.x-r.min.x),t=Math.abs(r.max.y-r.min.y),s=Math.abs(r.max.z-r.min.z);return`
    <div class="inspector-section">
      <div class="section-title">Bounding Box</div>
      <div class="bounding-box-viz">
        <div class="coord-row">
          <span class="coord-label">Min</span>
          <span class="coord-values">(${r.min.x.toFixed(2)}, ${r.min.y.toFixed(2)}, ${r.min.z.toFixed(2)})</span>
        </div>
        <div class="coord-row">
          <span class="coord-label">Max</span>
          <span class="coord-values">(${r.max.x.toFixed(2)}, ${r.max.y.toFixed(2)}, ${r.max.z.toFixed(2)})</span>
        </div>
        <div class="box-dimensions">
          Dimensions: <span class="dim-value">${e.toFixed(2)}</span> × <span class="dim-value">${t.toFixed(2)}</span> × <span class="dim-value">${s.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `}function Ht(r){return`
    <div class="inspector-section">
      <div class="section-title">Bounding Sphere</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Center</span>
          <span class="property-value vector">(${r.center.x.toFixed(2)}, ${r.center.y.toFixed(2)}, ${r.center.z.toFixed(2)})</span>
        </div>
        <div class="property-row">
          <span class="property-label">Radius</span>
          <span class="property-value">${r.radius.toFixed(3)}</span>
        </div>
      </div>
    </div>
  `}function Nt(r){return`
    <div class="inspector-section">
      <div class="section-title">Groups (${r.length})</div>
      <div class="groups-list">
        ${r.map((e,t)=>`
          <div class="group-item">
            <span class="group-index">#${t}</span>
            <span class="group-range">${e.start} → ${e.start+e.count}</span>
            <span class="group-material">Mat[${e.materialIndex}]</span>
          </div>
        `).join("")}
      </div>
    </div>
  `}function Dt(r){return`
    <div class="inspector-section">
      <div class="section-title">Morph Targets</div>
      <div class="morph-list">
        ${r.map(e=>`
          <div class="morph-item">
            <span class="morph-name">${e.name}</span>
            <span class="morph-count">×${e.count}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `}function jt(r,e,t,s,n){r.querySelectorAll('[data-action="select-geometry"]').forEach(a=>{const i=a,l=i.dataset.uuid;i.addEventListener("click",()=>{if(!l)return;const o=t.selectedGeometryId===l?null:l;s({selectedGeometryId:o}),n()})}),r.querySelectorAll(".action-btn").forEach(a=>{const i=a,l=i.dataset.action,o=i.dataset.uuid;!l||!o||i.addEventListener("click",d=>{d.stopPropagation(),Ot(l,o,e,t,s,n)})})}function Ot(r,e,t,s,n,a){const i=s.geometryVisualization;switch(r){case"toggle-bbox":{const l=new Set(i.boundingBox);l.has(e)?l.delete(e):l.add(e),n({geometryVisualization:{...i,boundingBox:l}}),t.sendCommand({type:"geometry-visualization",geometryUuid:e,visualization:"boundingBox",enabled:l.has(e)}),a();break}case"toggle-wireframe":{const l=new Set(i.wireframe);l.has(e)?l.delete(e):l.add(e),n({geometryVisualization:{...i,wireframe:l}}),t.sendCommand({type:"geometry-visualization",geometryUuid:e,visualization:"wireframe",enabled:l.has(e)}),a();break}case"toggle-normals":{const l=new Set(i.normals);l.has(e)?l.delete(e):l.add(e),n({geometryVisualization:{...i,normals:l}}),t.sendCommand({type:"geometry-visualization",geometryUuid:e,visualization:"normals",enabled:l.has(e)}),a();break}}}function Ut(r,e){var a,i;const t=(a=r.snapshot)==null?void 0:a.textures,s=(i=r.snapshot)==null?void 0:i.texturesSummary;if(!(t!=null&&t.length))return`
      <div class="panel-empty-state">
        <div class="empty-icon">🖼️</div>
        <h2>No Textures</h2>
        <p>No textures found in observed scenes.</p>
        <p class="hint">Make sure scenes are being observed and contain materials with textures.</p>
      </div>
    `;const n=e.selectedTextureId?t.find(l=>l.uuid===e.selectedTextureId):null;return`
    <div class="panel-split-view textures-split-view">
      <div class="panel-list textures-list-panel">
        ${Vt(s)}
        <div class="textures-list">
          ${t.map(l=>Wt(l,e)).join("")}
        </div>
      </div>
      <div class="panel-inspector textures-inspector-panel">
        ${n?Yt(n,e):qt()}
      </div>
    </div>
  `}function Vt(r){return r?`
    <div class="panel-summary textures-summary">
      <div class="summary-stat">
        <span class="summary-value">${r.totalCount}</span>
        <span class="summary-label">Textures</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${A(r.totalMemoryBytes)}</span>
        <span class="summary-label">GPU Memory</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${r.cubeTextureCount}</span>
        <span class="summary-label">Cube Maps</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${r.compressedCount}</span>
        <span class="summary-label">Compressed</span>
      </div>
    </div>
  `:""}function Wt(r,e){const t=e.selectedTextureId===r.uuid,s=r.name||`<${r.type}>`,n=Ce(r),a=r.dimensions.width>0?`${r.dimensions.width}×${r.dimensions.height}`:"Unknown";return`
    <div class="list-item texture-item ${t?"selected":""}" data-uuid="${r.uuid}" data-action="select-texture">
      <div class="texture-item-thumbnail">
        ${r.thumbnail?`<img src="${r.thumbnail}" alt="${w(s)}" class="texture-thumb-img" />`:`<div class="texture-thumb-placeholder">${n}</div>`}
      </div>
      <div class="texture-item-info">
        <div class="texture-item-name">${w(s)}</div>
        <div class="texture-item-meta">
          <span>${r.type}</span>
          <span>${a}</span>
        </div>
      </div>
      <div class="texture-item-badges">
        ${r.isCubeTexture?'<span class="badge cube">Cube</span>':""}
        ${r.isCompressed?'<span class="badge compressed">DXT</span>':""}
        ${r.isVideoTexture?'<span class="badge video">Video</span>':""}
        ${r.isRenderTarget?'<span class="badge rt">RT</span>':""}
        ${r.mipmaps.enabled?'<span class="badge mip">MIP</span>':""}
      </div>
      <div class="texture-item-stats">
        <span class="tex-stat-pill memory">${A(r.memoryBytes)}</span>
      </div>
      <div class="texture-item-usage">${r.usageCount}×</div>
    </div>
  `}function qt(){return`
    <div class="no-selection">
      <div class="no-selection-icon">🖼️</div>
      <div class="no-selection-text">Select a texture to inspect</div>
    </div>
  `}function Yt(r,e){const t=Ce(r),s=r.dimensions.width>0?`${r.dimensions.width} × ${r.dimensions.height}`:"Unknown";return`
    <div class="inspector-header texture-header">
      <div class="texture-header-thumb">
        ${r.thumbnail?`<img src="${r.thumbnail}" alt="Preview" class="texture-header-img" />`:`<div class="texture-header-placeholder">${t}</div>`}
      </div>
      <div class="inspector-header-text">
        <span class="inspector-title">${w(r.name||`<${r.type}>`)}</span>
        <span class="inspector-subtitle">${r.type}</span>
      </div>
      <span class="inspector-uuid">${r.uuid.substring(0,8)}</span>
    </div>

    ${r.thumbnail?Zt(r,e):""}

    <div class="inspector-section">
      <div class="section-title">Overview</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Dimensions</span>
          <span class="property-value">${s}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Format</span>
          <span class="property-value type-badge">${r.formatName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Data Type</span>
          <span class="property-value">${r.dataTypeName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Memory (est.)</span>
          <span class="property-value memory-value">${A(r.memoryBytes)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Color Space</span>
          <span class="property-value">${r.colorSpace}</span>
        </div>
      </div>
    </div>

    ${Kt(r)}
    ${Xt(r)}
    ${_t(r)}
    ${Jt(r)}
    ${Qt(r)}
    ${es(r)}
  `}function Zt(r,e){return r.thumbnail?`
    <div class="inspector-section texture-preview-section">
      <div class="section-title">Preview</div>
      <div class="texture-preview-container">
        <img src="${r.thumbnail}" alt="Texture Preview" class="texture-preview-img channel-${e.texturePreviewChannel}" />
        <div class="texture-channel-toggles">
          <button class="channel-btn ${e.texturePreviewChannel==="rgb"?"active":""}" data-channel="rgb" title="RGB">RGB</button>
          <button class="channel-btn ${e.texturePreviewChannel==="r"?"active":""}" data-channel="r" title="Red Channel">R</button>
          <button class="channel-btn ${e.texturePreviewChannel==="g"?"active":""}" data-channel="g" title="Green Channel">G</button>
          <button class="channel-btn ${e.texturePreviewChannel==="b"?"active":""}" data-channel="b" title="Blue Channel">B</button>
          <button class="channel-btn ${e.texturePreviewChannel==="a"?"active":""}" data-channel="a" title="Alpha Channel">A</button>
        </div>
      </div>
    </div>
  `:""}function Kt(r){const e=r.source;return`
    <div class="inspector-section">
      <div class="section-title">Source</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Type</span>
          <span class="property-value type-badge">${e.type}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Loaded</span>
          <span class="property-value ${e.isLoaded?"value-true":"value-false"}">${e.isLoaded?"Yes":"No"}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Ready</span>
          <span class="property-value ${e.isReady?"value-true":"value-false"}">${e.isReady?"Yes":"No"}</span>
        </div>
        ${e.url?`
        <div class="property-row url-row">
          <span class="property-label">URL</span>
          <span class="property-value texture-url" title="${w(e.url)}">${ut(e.url)}</span>
        </div>
        `:""}
      </div>
    </div>
  `}function Xt(r){const e=r.mipmaps;return`
    <div class="inspector-section">
      <div class="section-title">Mipmaps</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Enabled</span>
          <span class="property-value ${e.enabled?"value-true":"value-false"}">${e.enabled?"Yes":"No"}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Generate</span>
          <span class="property-value ${e.generateMipmaps?"value-true":"value-false"}">${e.generateMipmaps?"Auto":"Manual"}</span>
        </div>
        ${e.count>0?`
        <div class="property-row">
          <span class="property-label">Levels</span>
          <span class="property-value">${e.count}</span>
        </div>
        `:""}
      </div>
    </div>
  `}function _t(r){return`
    <div class="inspector-section">
      <div class="section-title">Filtering</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Mag Filter</span>
          <span class="property-value type-badge">${r.filtering.magName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Min Filter</span>
          <span class="property-value type-badge">${r.filtering.minName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Anisotropy</span>
          <span class="property-value">${r.anisotropy}×</span>
        </div>
      </div>
    </div>
  `}function Jt(r){return`
    <div class="inspector-section">
      <div class="section-title">Wrapping</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Wrap S</span>
          <span class="property-value type-badge">${r.wrap.sName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Wrap T</span>
          <span class="property-value type-badge">${r.wrap.tName}</span>
        </div>
      </div>
    </div>
  `}function Qt(r){return`
    <div class="inspector-section">
      <div class="section-title">Flags</div>
      <div class="texture-flags">
        <div class="flag-item ${r.flipY?"enabled":""}">
          <span class="flag-icon">↕️</span>
          <span class="flag-label">Flip Y</span>
        </div>
        <div class="flag-item ${r.premultiplyAlpha?"enabled":""}">
          <span class="flag-icon">α</span>
          <span class="flag-label">Premultiply Alpha</span>
        </div>
        <div class="flag-item ${r.isCompressed?"enabled":""}">
          <span class="flag-icon">📦</span>
          <span class="flag-label">Compressed</span>
        </div>
        <div class="flag-item ${r.isCubeTexture?"enabled":""}">
          <span class="flag-icon">🎲</span>
          <span class="flag-label">Cube Map</span>
        </div>
        <div class="flag-item ${r.isDataTexture?"enabled":""}">
          <span class="flag-icon">📊</span>
          <span class="flag-label">Data Texture</span>
        </div>
        <div class="flag-item ${r.isRenderTarget?"enabled":""}">
          <span class="flag-icon">🎯</span>
          <span class="flag-label">Render Target</span>
        </div>
      </div>
    </div>
  `}function es(r){return r.usedByMaterials.length===0?`
      <div class="inspector-section">
        <div class="section-title">Usage</div>
        <div class="no-usage">Not used by any materials</div>
      </div>
    `:`
    <div class="inspector-section">
      <div class="section-title">Usage (${r.usedByMaterials.length})</div>
      <div class="texture-usage-list">
        ${r.usedByMaterials.map(e=>`
          <div class="texture-usage-item">
            <span class="usage-slot">${e.slot}</span>
            <span class="usage-material">${w(e.materialName)}</span>
            <span class="usage-uuid">${e.materialUuid.substring(0,8)}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `}function ts(r,e,t,s,n){r.querySelectorAll('[data-action="select-texture"]').forEach(a=>{const i=a,l=i.dataset.uuid;i.addEventListener("click",()=>{if(!l)return;const o=t.selectedTextureId===l?null:l;s({selectedTextureId:o}),n()})}),r.querySelectorAll(".channel-btn").forEach(a=>{const i=a,l=i.dataset.channel;i.addEventListener("click",()=>{l&&(s({texturePreviewChannel:l}),n())})})}function ze(r){switch(r){case"shadow-map":return"Shadow Map";case"post-process":return"Post Process";case"reflection":return"Reflection";case"refraction":return"Refraction";case"environment":return"Environment";case"picker":return"Picker";case"custom":return"Custom";default:return"Unknown"}}function Pe(r){switch(r.usage){case"shadow-map":return"🌑";case"post-process":return"✨";case"reflection":return"🪞";case"refraction":return"💎";case"environment":return"🌍";case"picker":return"🎯";case"custom":return"🔧";default:return"📺"}}function ss(r){switch(r){case"shadow-map":return"shadow";case"post-process":return"postprocess";case"reflection":return"reflection";case"refraction":return"refraction";case"environment":return"environment";default:return""}}function rs(r,e){var a,i;const t=(a=r.snapshot)==null?void 0:a.renderTargets,s=(i=r.snapshot)==null?void 0:i.renderTargetsSummary;if(!(t!=null&&t.length))return`
      <div class="panel-empty-state">
        <div class="empty-icon">📺</div>
        <h2>No Render Targets</h2>
        <p>No render targets found in observed scenes.</p>
        <p class="hint">Render targets are created for effects like shadows, reflections, and post-processing.</p>
      </div>
    `;const n=e.selectedRenderTargetId?t.find(l=>l.uuid===e.selectedRenderTargetId):null;return`
    <div class="panel-split-view render-targets-split-view">
      <div class="panel-list render-targets-list-panel">
        ${ns(s)}
        <div class="render-targets-grid">
          ${t.map(l=>as(l,e)).join("")}
        </div>
      </div>
      <div class="panel-inspector render-targets-inspector-panel">
        ${n?ls(n,e):is()}
      </div>
    </div>
  `}function ns(r){return r?`
    <div class="panel-summary render-targets-summary">
      <div class="summary-stat">
        <span class="summary-value">${r.totalCount}</span>
        <span class="summary-label">Targets</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${A(r.totalMemoryBytes)}</span>
        <span class="summary-label">GPU Memory</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${r.shadowMapCount}</span>
        <span class="summary-label">Shadows</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${r.postProcessCount}</span>
        <span class="summary-label">Post FX</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${r.msaaCount}</span>
        <span class="summary-label">MSAA</span>
      </div>
    </div>
  `:""}function as(r,e){const t=e.selectedRenderTargetId===r.uuid,s=r.name||`<${r.type}>`,n=Pe(r),a=`${r.dimensions.width}×${r.dimensions.height}`;return`
    <div class="rt-grid-item ${t?"selected":""}" data-uuid="${r.uuid}" data-action="select-render-target">
      <div class="rt-grid-thumbnail">
        ${r.thumbnail?`<img src="${r.thumbnail}" alt="${w(s)}" class="rt-thumb-img" />`:`<div class="rt-thumb-placeholder">${n}</div>`}
        ${r.hasDepthTexture?'<div class="rt-depth-indicator" title="Has Depth Texture">D</div>':""}
        ${r.samples>0?`<div class="rt-msaa-indicator" title="${r.samples}x MSAA">${r.samples}x</div>`:""}
      </div>
      <div class="rt-grid-info">
        <div class="rt-grid-name" title="${w(s)}">${w(s)}</div>
        <div class="rt-grid-meta">
          <span class="rt-dimensions">${a}</span>
          <span class="rt-usage-badge ${ss(r.usage)}">${ze(r.usage)}</span>
        </div>
        <div class="rt-grid-stats">
          <span class="rt-memory">${A(r.memoryBytes)}</span>
          ${r.colorAttachmentCount>1?`<span class="rt-mrt-badge">MRT×${r.colorAttachmentCount}</span>`:""}
        </div>
      </div>
    </div>
  `}function is(){return`
    <div class="no-selection">
      <div class="no-selection-icon">📺</div>
      <div class="no-selection-text">Select a render target to inspect</div>
    </div>
  `}function ls(r,e){const t=Pe(r),s=`${r.dimensions.width} × ${r.dimensions.height}`;return`
    <div class="inspector-header rt-header">
      <div class="rt-header-thumb">
        ${r.thumbnail?`<img src="${r.thumbnail}" alt="Preview" class="rt-header-img" />`:`<div class="rt-header-placeholder">${t}</div>`}
      </div>
      <div class="inspector-header-text">
        <span class="inspector-title">${w(r.name||`<${r.type}>`)}</span>
        <span class="inspector-subtitle">${r.type}</span>
      </div>
      <span class="inspector-uuid">${r.uuid.substring(0,8)}</span>
    </div>

    ${os(r,e)}

    <div class="inspector-section">
      <div class="section-title">Overview</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Dimensions</span>
          <span class="property-value">${s}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Usage</span>
          <span class="property-value type-badge rt-usage-${r.usage}">${ze(r.usage)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Format</span>
          <span class="property-value type-badge">${r.textureFormatName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Data Type</span>
          <span class="property-value">${r.textureTypeName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Memory (est.)</span>
          <span class="property-value memory-value">${A(r.memoryBytes)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Color Space</span>
          <span class="property-value">${r.colorSpace}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Render Count</span>
          <span class="property-value">${r.renderCount.toLocaleString()}</span>
        </div>
      </div>
    </div>

    ${ds(r)}
    ${cs(r)}
    ${ps(r)}
    ${hs(r)}
    ${gs(r)}
  `}function os(r,e){if(!(r.thumbnail||r.depthThumbnail))return"";const s=e.renderTargetPreviewMode,a=(s==="depth"||s==="heatmap")&&r.depthThumbnail?r.depthThumbnail:r.thumbnail;return`
    <div class="inspector-section rt-preview-section">
      <div class="section-title">Preview</div>
      <div class="rt-preview-container">
        ${a?`<img src="${a}" alt="Render Target Preview" class="rt-preview-img channel-${s}" style="transform: scale(${e.renderTargetZoom})" />`:'<div class="rt-preview-placeholder">No preview available</div>'}
        <div class="rt-preview-controls">
          <div class="rt-channel-toggles">
            <button class="channel-btn ${s==="color"?"active":""}" data-mode="color" title="Color (RGB)">RGB</button>
            <button class="channel-btn ${s==="r"?"active":""}" data-mode="r" title="Red Channel">R</button>
            <button class="channel-btn ${s==="g"?"active":""}" data-mode="g" title="Green Channel">G</button>
            <button class="channel-btn ${s==="b"?"active":""}" data-mode="b" title="Blue Channel">B</button>
            <button class="channel-btn ${s==="a"?"active":""}" data-mode="a" title="Alpha Channel">A</button>
            ${r.hasDepthTexture?`
              <span class="channel-separator"></span>
              <button class="channel-btn depth ${s==="depth"?"active":""}" data-mode="depth" title="Depth">Depth</button>
              <button class="channel-btn heatmap ${s==="heatmap"?"active":""}" data-mode="heatmap" title="Depth Heatmap">🌡️</button>
            `:""}
          </div>
          <div class="rt-zoom-controls">
            <button class="zoom-btn" data-zoom="out" title="Zoom Out">−</button>
            <span class="zoom-level">${Math.round(e.renderTargetZoom*100)}%</span>
            <button class="zoom-btn" data-zoom="in" title="Zoom In">+</button>
            <button class="zoom-btn" data-zoom="fit" title="Fit to View">⊡</button>
          </div>
        </div>
        <div class="rt-pixel-info" id="rt-pixel-info">
          <span class="pixel-coords">—</span>
          <span class="pixel-value">Hover to inspect</span>
        </div>
      </div>
    </div>
  `}function ds(r){return`
    <div class="inspector-section">
      <div class="section-title">Buffers</div>
      <div class="rt-buffers">
        <div class="rt-buffer-item ${r.depthBuffer?"enabled":""}">
          <span class="buffer-icon">📐</span>
          <span class="buffer-label">Depth Buffer</span>
          <span class="buffer-status">${r.depthBuffer?"Enabled":"Disabled"}</span>
        </div>
        <div class="rt-buffer-item ${r.stencilBuffer?"enabled":""}">
          <span class="buffer-icon">✂️</span>
          <span class="buffer-label">Stencil Buffer</span>
          <span class="buffer-status">${r.stencilBuffer?"Enabled":"Disabled"}</span>
        </div>
        <div class="rt-buffer-item ${r.hasDepthTexture?"enabled":""}">
          <span class="buffer-icon">🗺️</span>
          <span class="buffer-label">Depth Texture</span>
          <span class="buffer-status">${r.hasDepthTexture?r.depthTextureFormatName||"Yes":"None"}</span>
        </div>
        ${r.samples>0?`
        <div class="rt-buffer-item enabled msaa">
          <span class="buffer-icon">🔲</span>
          <span class="buffer-label">MSAA</span>
          <span class="buffer-status">${r.samples}x samples</span>
        </div>
        `:""}
      </div>
    </div>
  `}function cs(r){return r.colorAttachmentCount<=1?"":`
    <div class="inspector-section">
      <div class="section-title">Multiple Render Targets</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Color Attachments</span>
          <span class="property-value mrt-value">${r.colorAttachmentCount}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Total Size</span>
          <span class="property-value">${r.dimensions.width} × ${r.dimensions.height} × ${r.colorAttachmentCount}</span>
        </div>
      </div>
      <div class="mrt-attachments">
        ${Array.from({length:r.colorAttachmentCount},(e,t)=>`
          <div class="mrt-attachment">
            <span class="attachment-index">${t}</span>
            <span class="attachment-format">${r.textureFormatName}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `}function ps(r){return`
    <div class="inspector-section">
      <div class="section-title">Filtering</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Mag Filter</span>
          <span class="property-value type-badge">${r.filtering.magName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Min Filter</span>
          <span class="property-value type-badge">${r.filtering.minName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Generate Mipmaps</span>
          <span class="property-value ${r.generateMipmaps?"value-true":"value-false"}">${r.generateMipmaps?"Yes":"No"}</span>
        </div>
      </div>
    </div>
  `}function hs(r){return`
    <div class="inspector-section">
      <div class="section-title">Wrapping</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Wrap S</span>
          <span class="property-value type-badge">${r.wrap.sName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Wrap T</span>
          <span class="property-value type-badge">${r.wrap.tName}</span>
        </div>
        ${r.scissorTest?`
        <div class="property-row">
          <span class="property-label">Scissor Test</span>
          <span class="property-value value-true">Enabled</span>
        </div>
        `:""}
      </div>
    </div>
  `}function gs(r){return`
    <div class="inspector-actions rt-actions">
      <button class="action-btn" data-action="save-color" data-uuid="${r.uuid}" title="Save color attachment as image">
        <span class="btn-icon">💾</span>
        Save Color
      </button>
      ${r.hasDepthTexture?`
      <button class="action-btn" data-action="save-depth" data-uuid="${r.uuid}" title="Save depth texture as image">
        <span class="btn-icon">🗺️</span>
        Save Depth
      </button>
      `:""}
      <button class="action-btn" data-action="refresh" data-uuid="${r.uuid}" title="Refresh preview">
        <span class="btn-icon">🔄</span>
        Refresh
      </button>
    </div>
  `}function us(r,e,t,s,n){r.querySelectorAll('[data-action="select-render-target"]').forEach(l=>{const o=l,d=o.dataset.uuid;o.addEventListener("click",c=>{if(c.stopPropagation(),!d)return;const p=t.selectedRenderTargetId===d?null:d;s({selectedRenderTargetId:p}),n()})}),r.querySelectorAll(".rt-channel-toggles .channel-btn").forEach(l=>{const o=l,d=o.dataset.mode;o.addEventListener("click",()=>{d&&(s({renderTargetPreviewMode:d}),n())})}),r.querySelectorAll(".zoom-btn").forEach(l=>{const o=l,d=o.dataset.zoom;o.addEventListener("click",()=>{if(!d)return;let c=t.renderTargetZoom;switch(d){case"in":c=Math.min(4,c*1.25);break;case"out":c=Math.max(.25,c/1.25);break;case"fit":c=1;break}s({renderTargetZoom:c}),n()})}),r.querySelectorAll('[data-action="save-color"], [data-action="save-depth"]').forEach(l=>{const o=l,d=o.dataset.action,c=o.dataset.uuid;o.addEventListener("click",()=>{var m,f;if(!c)return;const p=(f=(m=e.snapshot)==null?void 0:m.renderTargets)==null?void 0:f.find(v=>v.uuid===c);if(!p)return;const g=d==="save-depth"&&p.depthThumbnail?p.depthThumbnail:p.thumbnail;if(!g)return;const u=document.createElement("a");u.href=g,u.download=`${p.name||"render-target"}-${d==="save-depth"?"depth":"color"}.png`,document.body.appendChild(u),u.click(),document.body.removeChild(u)})});const a=r.querySelector(".rt-preview-img"),i=r.querySelector("#rt-pixel-info");a&&i&&(a.addEventListener("mousemove",l=>{const o=a.getBoundingClientRect(),d=Math.floor((l.clientX-o.left)/o.width*a.naturalWidth),c=Math.floor((l.clientY-o.top)/o.height*a.naturalHeight),p=i.querySelector(".pixel-coords"),g=i.querySelector(".pixel-value");p&&(p.textContent=`(${d}, ${c})`),g&&(g.textContent="Inspecting...")}),a.addEventListener("mouseleave",()=>{const l=i.querySelector(".pixel-coords"),o=i.querySelector(".pixel-value");l&&(l.textContent="—"),o&&(o.textContent="Hover to inspect")}))}const ms=`
/* 3Lens Theme Variables */
:root {
  --3lens-font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
  --3lens-font-sans: 'Geist', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;

  --3lens-bg-primary: #0a0e14;
  --3lens-bg-secondary: #0f1419;
  --3lens-bg-tertiary: #151b23;
  --3lens-bg-elevated: #1a222c;
  --3lens-bg-hover: #1f2937;

  --3lens-border: #2d3748;
  --3lens-border-subtle: #1e2738;
  --3lens-border-focus: #3b82f6;

  --3lens-text-primary: #e4e7eb;
  --3lens-text-secondary: #9ca3af;
  --3lens-text-tertiary: #6b7280;
  --3lens-text-disabled: #4b5563;

  --3lens-accent-blue: #60a5fa;
  --3lens-accent-cyan: #22d3ee;
  --3lens-accent-emerald: #34d399;
  --3lens-accent-amber: #fbbf24;
  --3lens-accent-rose: #fb7185;
  --3lens-accent-violet: #a78bfa;
  --3lens-accent-pink: #f472b6;

  --3lens-success: #10b981;
  --3lens-warning: #f59e0b;
  --3lens-error: #ef4444;

  --3lens-color-scene: #34d399;
  --3lens-color-mesh: #60a5fa;
  --3lens-color-group: #a78bfa;
  --3lens-color-light: #fbbf24;
  --3lens-color-camera: #f472b6;

  --3lens-radius-sm: 4px;
  --3lens-radius-md: 6px;
  --3lens-radius-lg: 8px;
  --3lens-radius-xl: 12px;

  --3lens-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --3lens-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --3lens-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
}
`,vs=`
/* ═══════════════════════════════════════════════════════════════
   SHARED PANEL STYLES
   ═══════════════════════════════════════════════════════════════ */

/* Empty State */
.panel-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  text-align: center;
  padding: 32px;
  color: var(--3lens-text-secondary);
}

.panel-empty-state .empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.panel-empty-state h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  margin-bottom: 8px;
}

.panel-empty-state p {
  color: var(--3lens-text-secondary);
  max-width: 300px;
  margin: 0;
}

.panel-empty-state .hint {
  margin-top: 12px;
  font-size: 11px;
  color: var(--3lens-text-tertiary);
}

/* Split View Layout */
.panel-split-view {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.panel-list {
  flex: 1;
  min-width: 280px;
  overflow: auto;
  border-right: 1px solid var(--3lens-border);
}

.panel-inspector {
  width: 320px;
  min-width: 260px;
  max-width: 440px;
  overflow: auto;
  background: var(--3lens-bg-secondary);
}

/* Summary Bar */
.panel-summary {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(180deg, var(--3lens-bg-tertiary), var(--3lens-bg-secondary));
  border-bottom: 1px solid var(--3lens-border);
}

.summary-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: var(--3lens-bg-primary);
  border-radius: var(--3lens-radius-md);
  border: 1px solid var(--3lens-border-subtle);
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
}

.summary-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
  margin-top: 2px;
}

/* Search Bar */
.panel-search {
  position: relative;
  padding: 8px 12px;
  background: var(--3lens-bg-secondary);
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.search-input {
  width: 100%;
  padding: 8px 32px 8px 12px;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-md);
  color: var(--3lens-text-primary);
  font-size: 12px;
  font-family: var(--3lens-font-sans);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-input:focus {
  border-color: var(--3lens-accent-blue);
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}

.search-input::placeholder {
  color: var(--3lens-text-tertiary);
}

.search-clear {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  padding: 0;
  background: var(--3lens-bg-tertiary);
  border: none;
  border-radius: 50%;
  color: var(--3lens-text-secondary);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, color 0.15s ease;
}

.search-clear:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.no-results {
  padding: 24px;
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 12px;
}

/* List Items */
.list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--3lens-radius-md);
  cursor: pointer;
  transition: all 120ms ease;
  margin: 4px 8px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid transparent;
}

.list-item:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-border);
}

.list-item.selected {
  background: rgba(96, 165, 250, 0.15);
  border-color: var(--3lens-accent-blue);
  box-shadow: inset 3px 0 0 var(--3lens-accent-cyan);
}

/* No Selection State */
.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 24px;
}

.no-selection-icon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.6;
}

.no-selection-text {
  font-size: 12px;
}

/* Inspector Header */
.inspector-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(180deg, var(--3lens-bg-tertiary), var(--3lens-bg-secondary));
  border-bottom: 1px solid var(--3lens-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.inspector-header-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.inspector-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inspector-subtitle {
  font-size: 11px;
  color: var(--3lens-text-tertiary);
  font-family: var(--3lens-font-mono);
}

.inspector-uuid {
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  background: var(--3lens-bg-tertiary);
  padding: 2px 6px;
  border-radius: 3px;
}

/* Inspector Sections */
.inspector-section {
  padding: 12px;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.section-title {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 8px;
}

/* Property Grid */
.property-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.property-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.property-label {
  color: var(--3lens-text-secondary);
}

.property-value {
  font-family: var(--3lens-font-mono);
  font-size: 11px;
  color: var(--3lens-text-primary);
  text-align: right;
}

.property-value.vector {
  color: var(--3lens-accent-cyan);
  font-size: 10px;
}

.property-value.type-badge {
  background: var(--3lens-bg-tertiary);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
}

.property-value.value-true {
  color: var(--3lens-accent-emerald);
}

.property-value.value-false {
  color: var(--3lens-text-tertiary);
}

.property-value.memory-value {
  color: var(--3lens-accent-pink);
  font-weight: 500;
}

/* Badges */
.badge {
  font-size: 9px;
  font-weight: 600;
  padding: 2px 5px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.badge.shader {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #fff;
}

.badge.transparent {
  background: rgba(34, 211, 238, 0.2);
  color: var(--3lens-accent-cyan);
  border: 1px solid rgba(34, 211, 238, 0.3);
}

.badge.textures {
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-secondary);
  border: 1px solid var(--3lens-border);
}

.badge.cube {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #fff;
}

.badge.compressed {
  background: rgba(251, 191, 36, 0.2);
  color: var(--3lens-accent-amber);
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.badge.video {
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: #fff;
}

/* Used By Section */
.used-by-section {
  padding: 12px;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.used-by-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.used-by-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-primary);
  border-radius: var(--3lens-radius-sm);
  cursor: pointer;
  transition: background 0.15s ease;
}

.used-by-item:hover {
  background: var(--3lens-bg-hover);
}

.used-by-item .mesh-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--3lens-color-mesh);
  color: #000;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 700;
}

.used-by-item .mesh-name {
  font-size: 12px;
  color: var(--3lens-text-primary);
}

.badge.rt {
  background: rgba(34, 211, 238, 0.2);
  color: var(--3lens-accent-cyan);
  border: 1px solid rgba(34, 211, 238, 0.3);
}

.badge.mip {
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-secondary);
  border: 1px solid var(--3lens-border);
}

/* Color Swatch */
.color-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 6px;
  vertical-align: middle;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.color-swatch.large {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  flex-shrink: 0;
}

.color-swatch.no-color {
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ═══════════════════════════════════════════════════════════════
   EDITABLE CONTROLS
   ═══════════════════════════════════════════════════════════════ */

.property-value.editable {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Color Picker */
.prop-color-input {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
}

.prop-color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.prop-color-input::-webkit-color-swatch {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.color-hex {
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  color: var(--3lens-text-secondary);
}

/* Range Slider */
.prop-range-input {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--3lens-bg-primary);
  border-radius: 2px;
  cursor: pointer;
}

.prop-range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--3lens-accent-cyan);
  cursor: pointer;
  border: 2px solid var(--3lens-bg-primary);
  box-shadow: 0 0 4px rgba(34, 211, 238, 0.4);
  transition: transform 100ms ease;
}

.prop-range-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.prop-range-input.pbr-slider::-webkit-slider-thumb {
  background: linear-gradient(135deg, var(--3lens-accent-blue), var(--3lens-accent-cyan));
}

.prop-range-input.metalness::-webkit-slider-thumb {
  background: linear-gradient(135deg, var(--3lens-accent-amber), #fcd34d);
}

.range-value {
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  color: var(--3lens-text-secondary);
  min-width: 32px;
  text-align: right;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 18px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: 18px;
  transition: all 150ms ease;
}

.toggle-slider::before {
  position: absolute;
  content: "";
  height: 12px;
  width: 12px;
  left: 2px;
  bottom: 2px;
  background: var(--3lens-text-tertiary);
  border-radius: 50%;
  transition: all 150ms ease;
}

.toggle-switch input:checked + .toggle-slider {
  background: rgba(34, 211, 238, 0.2);
  border-color: var(--3lens-accent-cyan);
}

.toggle-switch input:checked + .toggle-slider::before {
  background: var(--3lens-accent-cyan);
  transform: translateX(14px);
  box-shadow: 0 0 6px rgba(34, 211, 238, 0.5);
}

/* Select Dropdown */
.prop-select-input {
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: 4px;
  color: var(--3lens-text-primary);
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  padding: 4px 24px 4px 8px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath fill='%239ca3af' d='M1 2l3 3 3-3z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  transition: all 100ms ease;
}

.prop-select-input:hover {
  border-color: var(--3lens-accent-cyan);
}

.prop-select-input:focus {
  outline: none;
  border-color: var(--3lens-accent-cyan);
  box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.2);
}

/* ═══════════════════════════════════════════════════════════════
   MATERIALS PANEL SPECIFIC
   ═══════════════════════════════════════════════════════════════ */

.materials-split-view .panel-list {
  min-width: 280px;
}

.materials-split-view .panel-inspector {
  width: 320px;
}

.material-item.selected {
  background: rgba(251, 113, 133, 0.15);
  border-color: var(--3lens-accent-rose);
  box-shadow: inset 3px 0 0 var(--3lens-accent-rose);
}

.material-item-color .color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.material-item-info {
  flex: 1;
  min-width: 0;
}

.material-item-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--3lens-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-item-type {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  font-family: var(--3lens-font-mono);
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.type-icon {
  font-size: 8px;
  opacity: 0.7;
}

.material-item-badges {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.material-item-usage {
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
  flex-shrink: 0;
  padding: 2px 6px;
  background: var(--3lens-bg-primary);
  border-radius: 3px;
}

/* Shader Section */
.shader-section {
  background: var(--3lens-bg-primary);
}

.shader-subsection {
  margin-top: 12px;
}

.shader-subsection:first-child {
  margin-top: 0;
}

.subsection-title {
  font-size: 10px;
  font-weight: 500;
  color: var(--3lens-text-secondary);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.subsection-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--3lens-border-subtle);
}

/* Uniforms List */
.uniforms-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.uniform-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--3lens-font-mono);
}

.uniform-type {
  font-size: 9px;
  color: var(--3lens-accent-blue);
  background: rgba(96, 165, 250, 0.15);
  padding: 2px 4px;
  border-radius: 3px;
  min-width: 52px;
  text-align: center;
}

.uniform-name {
  color: var(--3lens-text-primary);
  flex: 1;
}

.uniform-value {
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Defines List */
.defines-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.define-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  background: var(--3lens-bg-tertiary);
  border-radius: 3px;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
}

.define-name {
  color: var(--3lens-accent-amber);
}

.define-value {
  color: var(--3lens-text-tertiary);
}

/* Shader Code */
.shader-code {
  background: #0d1117;
  border: 1px solid var(--3lens-border-subtle);
  border-radius: 6px;
  padding: 12px;
  margin: 0;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

.shader-code code {
  font-family: var(--3lens-font-mono);
  font-size: 11px;
  line-height: 1.6;
  color: #c9d1d9;
  white-space: pre;
}

/* GLSL Syntax Highlighting */
.glsl-keyword { color: #ff7b72; font-weight: 500; }
.glsl-builtin { color: #d2a8ff; }
.glsl-builtin-var { color: #79c0ff; font-style: italic; }
.glsl-number { color: #a5d6ff; }
.glsl-string { color: #a5d6ff; }
.glsl-comment { color: #8b949e; font-style: italic; }
.glsl-preprocessor { color: #7ee787; }
.glsl-ident { color: #c9d1d9; }
.glsl-punct { color: #8b949e; }

/* Textures in materials */
.texture-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.texture-list .texture-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-primary);
  border-radius: 4px;
  font-size: 11px;
}

.texture-slot {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-emerald);
  font-weight: 500;
  min-width: 100px;
}

.texture-uuid {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
  font-size: 10px;
}

.texture-name {
  color: var(--3lens-text-secondary);
  flex: 1;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ═══════════════════════════════════════════════════════════════
   GEOMETRY PANEL SPECIFIC
   ═══════════════════════════════════════════════════════════════ */

.geometry-split-view .panel-inspector {
  width: 340px;
  max-width: 480px;
}

.geometry-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.geometry-summary .summary-value {
  color: var(--3lens-accent-emerald);
}

.geometry-item.selected {
  background: rgba(52, 211, 153, 0.15);
  border-color: var(--3lens-accent-emerald);
  box-shadow: inset 3px 0 0 var(--3lens-accent-emerald);
}

.geometry-item-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--3lens-accent-emerald), #059669);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.geometry-item-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.geometry-item-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  row-gap: 4px;
}

.geometry-item-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--3lens-text-primary);
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.geometry-item-meta {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.geometry-used-by {
  color: var(--3lens-text-secondary);
}

.geometry-item-stats {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.geo-stat-pill {
  font-size: 9px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: var(--3lens-font-mono);
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-secondary);
  border: 1px solid var(--3lens-border-subtle);
}

.geo-stat-pill.vertices {
  color: var(--3lens-accent-cyan);
  border-color: rgba(34, 211, 238, 0.3);
}

.geo-stat-pill.triangles {
  color: var(--3lens-accent-blue);
  border-color: rgba(96, 165, 250, 0.3);
}

.geo-stat-pill.memory {
  color: var(--3lens-accent-amber);
  border-color: rgba(251, 191, 36, 0.3);
}

.geo-stat-pill.usage {
  color: var(--3lens-text-secondary);
  border-color: var(--3lens-border);
}

.geometry-item-usage {
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
  flex-shrink: 0;
  padding: 2px 6px;
  background: var(--3lens-bg-primary);
  border-radius: 3px;
}

/* Attributes Table */
.attributes-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}

.attributes-table th,
.attributes-table td {
  font-size: 11px;
  padding: 6px 8px;
  text-align: left;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.attributes-table th {
  font-weight: 500;
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: var(--3lens-bg-primary);
}

.attributes-table td {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-primary);
}

.attributes-table tr:hover {
  background: var(--3lens-bg-hover);
}

.attr-name {
  color: var(--3lens-accent-cyan);
  font-weight: 500;
}

.attr-type {
  color: var(--3lens-text-tertiary);
  font-size: 9px;
}

.attr-count {
  color: var(--3lens-text-secondary);
}

.attr-size {
  color: var(--3lens-accent-amber);
  text-align: right;
}

/* Bounding Box */
.bounding-box-viz {
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
}

.bounding-box-viz .coord-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.bounding-box-viz .coord-label {
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--3lens-text-tertiary);
  width: 40px;
}

.bounding-box-viz .coord-values {
  font-family: var(--3lens-font-mono);
  font-size: 11px;
  color: var(--3lens-accent-cyan);
}

.bounding-box-viz .box-dimensions {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--3lens-border-subtle);
  font-size: 11px;
  color: var(--3lens-text-secondary);
}

.bounding-box-viz .dim-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-emerald);
}

/* Groups */
.groups-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: var(--3lens-bg-primary);
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--3lens-font-mono);
}

.group-item .group-range {
  color: var(--3lens-text-secondary);
}

.group-item .group-material {
  color: var(--3lens-accent-rose);
}

/* Morph Targets */
.morph-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.morph-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 4px;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
}

.morph-item .morph-name {
  color: #a78bfa;
}

.morph-item .morph-count {
  color: var(--3lens-text-tertiary);
}

/* Action Buttons */
.inspector-actions {
  display: flex;
  gap: 6px;
  padding: 12px;
  border-top: 1px solid var(--3lens-border);
  background: var(--3lens-bg-primary);
  position: sticky;
  bottom: 0;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: 6px;
  color: var(--3lens-text-secondary);
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 120ms ease;
}

.action-btn:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-text-primary);
}

.action-btn.active {
  background: rgba(34, 211, 238, 0.15);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-accent-cyan);
}

.action-btn .btn-icon {
  font-size: 14px;
}

/* ═══════════════════════════════════════════════════════════════
   TEXTURES PANEL SPECIFIC
   ═══════════════════════════════════════════════════════════════ */

.textures-split-view .panel-list {
  min-width: 300px;
}

.textures-split-view .panel-inspector {
  width: 360px;
  max-width: 500px;
}

.textures-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.textures-summary .summary-value {
  color: var(--3lens-accent-pink);
}

.texture-item.selected {
  background: rgba(244, 114, 182, 0.15);
  border-color: var(--3lens-accent-pink);
  box-shadow: inset 3px 0 0 var(--3lens-accent-pink);
}

.texture-item-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
}

.texture-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
}

.texture-thumb-placeholder {
  font-size: 18px;
  opacity: 0.7;
}

.texture-item-info {
  flex: 1;
  min-width: 0;
}

.texture-item-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--3lens-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.texture-item-meta {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  font-family: var(--3lens-font-mono);
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.texture-item-badges {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}

.texture-item-stats {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.tex-stat-pill {
  font-size: 9px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: var(--3lens-font-mono);
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-secondary);
  border: 1px solid var(--3lens-border-subtle);
}

.tex-stat-pill.memory {
  color: var(--3lens-accent-pink);
  border-color: rgba(244, 114, 182, 0.3);
}

.texture-item-usage {
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
  flex-shrink: 0;
  padding: 2px 6px;
  background: var(--3lens-bg-primary);
  border-radius: 3px;
}

/* Texture Header */
.texture-header-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
}

.texture-header-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
}

.texture-header-placeholder {
  font-size: 24px;
  opacity: 0.7;
}

/* Texture Preview */
.texture-preview-section {
  background: var(--3lens-bg-primary);
}

.texture-preview-container {
  position: relative;
  border: 1px solid var(--3lens-border-subtle);
  border-radius: 8px;
  overflow: hidden;
  background: repeating-conic-gradient(#1f2937 0% 25%, #0f1419 0% 50%) 50% / 16px 16px;
}

.texture-preview-img {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  display: block;
  image-rendering: pixelated;
}

/* Channel filters */
.texture-preview-img.channel-rgb { /* No filter */ }
.texture-preview-img.channel-r { filter: grayscale(100%) sepia(100%) hue-rotate(-30deg) saturate(300%); }
.texture-preview-img.channel-g { filter: grayscale(100%) sepia(100%) hue-rotate(70deg) saturate(300%); }
.texture-preview-img.channel-b { filter: grayscale(100%) sepia(100%) hue-rotate(190deg) saturate(300%); }
.texture-preview-img.channel-a { filter: grayscale(100%); mix-blend-mode: luminosity; }

.texture-channel-toggles {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 2px;
  background: rgba(10, 14, 20, 0.9);
  border-radius: 4px;
  padding: 2px;
}

.channel-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  cursor: pointer;
  border-radius: 3px;
  transition: all 100ms ease;
}

.channel-btn:hover {
  color: var(--3lens-text-secondary);
  background: var(--3lens-bg-hover);
}

.channel-btn.active {
  background: var(--3lens-accent-pink);
  color: #000;
}

/* Texture URL */
.texture-url {
  font-size: 9px;
  color: var(--3lens-accent-cyan);
  word-break: break-all;
  cursor: help;
}

/* Texture Flags */
.texture-flags {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.flag-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--3lens-bg-primary);
  border-radius: 6px;
  border: 1px solid var(--3lens-border-subtle);
  opacity: 0.4;
}

.flag-item.enabled {
  opacity: 1;
  border-color: rgba(244, 114, 182, 0.3);
  background: rgba(244, 114, 182, 0.08);
}

.flag-icon {
  font-size: 14px;
}

.flag-label {
  font-size: 11px;
  color: var(--3lens-text-secondary);
}

.flag-item.enabled .flag-label {
  color: var(--3lens-text-primary);
}

/* Texture Usage */
.texture-usage-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.texture-usage-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--3lens-bg-primary);
  border-radius: 4px;
  font-size: 11px;
}

.usage-slot {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-emerald);
  font-weight: 500;
  min-width: 100px;
}

.usage-material {
  color: var(--3lens-text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.usage-uuid {
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  color: var(--3lens-text-tertiary);
}

.no-usage {
  font-size: 12px;
  color: var(--3lens-text-tertiary);
  font-style: italic;
  padding: 12px;
  text-align: center;
}

/* ═══════════════════════════════════════════════════════════════
   RENDER TARGETS PANEL SPECIFIC
   ═══════════════════════════════════════════════════════════════ */

.render-targets-split-view .panel-list {
  min-width: 320px;
}

.render-targets-split-view .panel-inspector {
  width: 400px;
  max-width: 520px;
}

.render-targets-summary {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
}

.render-targets-summary .summary-value {
  color: var(--3lens-accent-cyan);
}

/* Render Target Grid Layout */
.render-targets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
  padding: 12px;
}

.rt-grid-item {
  background: var(--3lens-bg-tertiary);
  border: 1px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 120ms ease;
}

.rt-grid-item:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-border);
  transform: translateY(-2px);
}

.rt-grid-item.selected {
  background: rgba(34, 211, 238, 0.12);
  border-color: var(--3lens-accent-cyan);
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.2);
}

.rt-grid-thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: repeating-conic-gradient(#1f2937 0% 25%, #0f1419 0% 50%) 50% / 12px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rt-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.rt-thumb-placeholder {
  font-size: 28px;
  opacity: 0.6;
}

.rt-depth-indicator,
.rt-msaa-indicator {
  position: absolute;
  bottom: 4px;
  font-size: 9px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
  padding: 2px 5px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.7);
}

.rt-depth-indicator {
  left: 4px;
  color: var(--3lens-accent-emerald);
  border: 1px solid rgba(52, 211, 153, 0.4);
}

.rt-msaa-indicator {
  right: 4px;
  color: var(--3lens-accent-blue);
  border: 1px solid rgba(96, 165, 250, 0.4);
}

.rt-grid-info {
  padding: 10px;
}

.rt-grid-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--3lens-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.rt-grid-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.rt-dimensions {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
}

.rt-usage-badge {
  font-size: 9px;
  font-weight: 600;
  padding: 2px 5px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-secondary);
  border: 1px solid var(--3lens-border-subtle);
}

.rt-usage-badge.shadow {
  background: rgba(30, 30, 30, 0.8);
  color: #9ca3af;
  border-color: rgba(156, 163, 175, 0.3);
}

.rt-usage-badge.postprocess {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
  border-color: rgba(139, 92, 246, 0.3);
}

.rt-usage-badge.reflection {
  background: rgba(96, 165, 250, 0.2);
  color: var(--3lens-accent-blue);
  border-color: rgba(96, 165, 250, 0.3);
}

.rt-usage-badge.refraction {
  background: rgba(34, 211, 238, 0.2);
  color: var(--3lens-accent-cyan);
  border-color: rgba(34, 211, 238, 0.3);
}

.rt-usage-badge.environment {
  background: rgba(52, 211, 153, 0.2);
  color: var(--3lens-accent-emerald);
  border-color: rgba(52, 211, 153, 0.3);
}

.rt-grid-stats {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rt-memory {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-amber);
}

.rt-mrt-badge {
  font-size: 9px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(244, 114, 182, 0.2);
  color: var(--3lens-accent-pink);
  border: 1px solid rgba(244, 114, 182, 0.3);
}

/* Render Target Header */
.rt-header-thumb {
  width: 56px;
  height: 42px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: repeating-conic-gradient(#1f2937 0% 25%, #0f1419 0% 50%) 50% / 10px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rt-header-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.rt-header-placeholder {
  font-size: 22px;
  opacity: 0.7;
}

/* Render Target Preview */
.rt-preview-section {
  background: var(--3lens-bg-primary);
}

.rt-preview-container {
  position: relative;
  border: 1px solid var(--3lens-border-subtle);
  border-radius: 8px;
  overflow: hidden;
  background: repeating-conic-gradient(#1f2937 0% 25%, #0f1419 0% 50%) 50% / 16px 16px;
}

.rt-preview-img {
  width: 100%;
  max-height: 240px;
  object-fit: contain;
  display: block;
  image-rendering: pixelated;
  transform-origin: center;
  transition: transform 150ms ease;
}

/* Channel filters for render target preview */
.rt-preview-img.channel-color { /* No filter */ }
.rt-preview-img.channel-r { filter: grayscale(100%) sepia(100%) hue-rotate(-30deg) saturate(300%); }
.rt-preview-img.channel-g { filter: grayscale(100%) sepia(100%) hue-rotate(70deg) saturate(300%); }
.rt-preview-img.channel-b { filter: grayscale(100%) sepia(100%) hue-rotate(190deg) saturate(300%); }
.rt-preview-img.channel-a { filter: grayscale(100%); mix-blend-mode: luminosity; }
.rt-preview-img.channel-depth { filter: grayscale(100%); }
.rt-preview-img.channel-heatmap { 
  filter: sepia(100%) saturate(500%) hue-rotate(-50deg);
}

.rt-preview-placeholder {
  padding: 40px;
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 12px;
}

.rt-preview-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: linear-gradient(transparent, rgba(10, 14, 20, 0.95));
}

.rt-channel-toggles {
  display: flex;
  gap: 2px;
  background: rgba(10, 14, 20, 0.9);
  border-radius: 4px;
  padding: 2px;
}

.rt-channel-toggles .channel-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  cursor: pointer;
  border-radius: 3px;
  transition: all 100ms ease;
}

.rt-channel-toggles .channel-btn:hover {
  color: var(--3lens-text-secondary);
  background: var(--3lens-bg-hover);
}

.rt-channel-toggles .channel-btn.active {
  background: var(--3lens-accent-cyan);
  color: #000;
}

.rt-channel-toggles .channel-btn.depth.active {
  background: var(--3lens-accent-emerald);
}

.rt-channel-toggles .channel-btn.heatmap.active {
  background: linear-gradient(135deg, #ef4444, #f97316, #facc15);
  color: #000;
}

.channel-separator {
  width: 1px;
  height: 16px;
  background: var(--3lens-border);
  margin: 0 4px;
  align-self: center;
}

.rt-zoom-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(10, 14, 20, 0.9);
  border-radius: 4px;
  padding: 2px;
}

.zoom-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--3lens-text-secondary);
  font-size: 14px;
  cursor: pointer;
  border-radius: 3px;
  transition: all 100ms ease;
}

.zoom-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.zoom-level {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
  min-width: 40px;
  text-align: center;
}

.rt-pixel-info {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 12px;
  background: rgba(10, 14, 20, 0.9);
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
}

.pixel-coords {
  color: var(--3lens-accent-cyan);
}

.pixel-value {
  color: var(--3lens-text-secondary);
}

/* Render Target Buffers */
.rt-buffers {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.rt-buffer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--3lens-bg-primary);
  border-radius: 6px;
  border: 1px solid var(--3lens-border-subtle);
  opacity: 0.4;
}

.rt-buffer-item.enabled {
  opacity: 1;
  border-color: rgba(34, 211, 238, 0.3);
  background: rgba(34, 211, 238, 0.06);
}

.rt-buffer-item.msaa {
  border-color: rgba(96, 165, 250, 0.3);
  background: rgba(96, 165, 250, 0.08);
}

.buffer-icon {
  font-size: 14px;
}

.buffer-label {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  flex: 1;
}

.rt-buffer-item.enabled .buffer-label {
  color: var(--3lens-text-primary);
}

.buffer-status {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
}

.rt-buffer-item.enabled .buffer-status {
  color: var(--3lens-accent-cyan);
}

/* MRT Section */
.mrt-value {
  color: var(--3lens-accent-pink);
  font-weight: 600;
}

.mrt-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.mrt-attachment {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(244, 114, 182, 0.1);
  border: 1px solid rgba(244, 114, 182, 0.2);
  border-radius: 4px;
}

.attachment-index {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--3lens-accent-pink);
  color: #000;
  font-size: 10px;
  font-weight: 700;
  border-radius: 3px;
}

.attachment-format {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

/* Render Target Actions */
.rt-actions {
  flex-wrap: wrap;
}

.rt-actions .action-btn {
  min-width: 100px;
}

/* ═══════════════════════════════════════════════════════════════
   SCROLLBAR
   ═══════════════════════════════════════════════════════════════ */

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--3lens-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--3lens-text-tertiary);
}
`;function bs(){return ms+`
`+vs}const Y=560,fs=450,xs=[{id:"scene",title:"Scene",icon:"S",iconClass:"scene",defaultWidth:Y,defaultHeight:0},{id:"stats",title:"Performance",icon:"⚡",iconClass:"stats",defaultWidth:320,defaultHeight:400},{id:"materials",title:"Materials",icon:"🎨",iconClass:"materials",defaultWidth:700,defaultHeight:500},{id:"geometry",title:"Geometry",icon:"📐",iconClass:"inspector",defaultWidth:750,defaultHeight:500},{id:"textures",title:"Textures",icon:"🖼️",iconClass:"textures",defaultWidth:800,defaultHeight:520},{id:"render-targets",title:"Render Targets",icon:"🎯",iconClass:"render-targets",defaultWidth:850,defaultHeight:550},{id:"webgpu",title:"WebGPU",icon:"🔷",iconClass:"webgpu",defaultWidth:700,defaultHeight:500},{id:"plugins",title:"Plugins",icon:"🔌",iconClass:"plugin",defaultWidth:420,defaultHeight:480}];class ys{constructor(e){h(this,"root");h(this,"probe");h(this,"menuVisible",!1);h(this,"openPanels",new Map);h(this,"selectedNodeId",null);h(this,"expandedNodes",new Set);h(this,"latestStats",null);h(this,"latestBenchmark",null);h(this,"latestSnapshot",null);h(this,"frameHistory",[]);h(this,"gpuHistory",[]);h(this,"fpsHistory",[]);h(this,"topZIndex",999997);h(this,"dragState",null);h(this,"resizeState",null);h(this,"lastStatsUpdate",0);h(this,"statsUpdateInterval",500);h(this,"statsTab","overview");h(this,"timelineZoom",1);h(this,"timelineOffset",0);h(this,"timelineSelectedFrame",null);h(this,"timelineDragging",!1);h(this,"timelineDragStartX",0);h(this,"timelineDragStartOffset",0);h(this,"timelineHoverIndex",null);h(this,"timelinePaused",!1);h(this,"isRecording",!1);h(this,"recordedFrames",[]);h(this,"maxRecordedFrames",1800);h(this,"frameBufferSize",300);h(this,"panelDefinitions",new Map);h(this,"panelContexts",new Map);h(this,"pluginPanelUnsubscribers",new Map);h(this,"pluginToolbarActions",[]);h(this,"uiState",gt());h(this,"chartZoom",1);h(this,"chartOffset",0);h(this,"chartHoverIndex",null);h(this,"chartDragging",!1);h(this,"chartDragStartX",0);h(this,"chartDragStartOffset",0);h(this,"maxHistoryLength",300);h(this,"memoryHistory",[]);h(this,"memoryHistoryMaxLength",60);h(this,"lastMemoryUpdate",0);h(this,"memoryUpdateInterval",1e3);h(this,"fpsHistogram",new Array(12).fill(0));h(this,"drawCallHistory",[]);h(this,"triangleHistory",[]);h(this,"frameTimePercentiles",{p50:0,p90:0,p95:0,p99:0});h(this,"performanceHistory",[]);h(this,"performanceHistoryMaxLength",120);h(this,"sessionStartTime",performance.now());h(this,"totalFramesRendered",0);h(this,"droppedFrameCount",0);h(this,"smoothFrameCount",0);h(this,"peakFps",0);h(this,"lowestFps",1/0);h(this,"peakDrawCalls",0);h(this,"peakTriangles",0);h(this,"peakMemory",0);h(this,"gpuCapabilities",null);h(this,"virtualScrollThreshold",100);h(this,"virtualScroller",null);h(this,"virtualScrollContainer",null);h(this,"selectedPluginId",null);h(this,"webgpuTab","pipelines");h(this,"selectedPipelineId",null);h(this,"selectedBindGroupId",null);this.probe=e.probe,this.injectStyles(),this.root=document.createElement("div"),this.root.className="three-lens-root",document.body.appendChild(this.root),this.initializePanelDefinitions(e.panels),this.probe.onFrameStats(t=>{this.latestStats=t,this.frameHistory.push(t.cpuTimeMs),this.frameHistory.length>this.frameBufferSize&&this.frameHistory.shift(),t.gpuTimeMs!==void 0&&(this.gpuHistory.push(t.gpuTimeMs),this.gpuHistory.length>this.frameBufferSize&&this.gpuHistory.shift()),this.isRecording&&this.recordedFrames.length<this.maxRecordedFrames&&this.recordedFrames.push({cpu:t.cpuTimeMs,gpu:t.gpuTimeMs,timestamp:t.timestamp,drawCalls:t.drawCalls,triangles:t.triangles});const s=t.cpuTimeMs>0?1e3/t.cpuTimeMs:0;this.fpsHistory.push(s),this.fpsHistory.length>this.frameBufferSize&&this.fpsHistory.shift();const n=Math.min(11,Math.floor(s/5));if(this.fpsHistogram[n]++,this.drawCallHistory.push(t.drawCalls),this.drawCallHistory.length>this.frameBufferSize&&this.drawCallHistory.shift(),this.triangleHistory.push(t.triangles),this.triangleHistory.length>this.frameBufferSize&&this.triangleHistory.shift(),this.totalFramesRendered++,s>this.peakFps&&(this.peakFps=s),s<this.lowestFps&&s>0&&(this.lowestFps=s),t.drawCalls>this.peakDrawCalls&&(this.peakDrawCalls=t.drawCalls),t.triangles>this.peakTriangles&&(this.peakTriangles=t.triangles),t.memory&&t.memory.totalGpuMemory>this.peakMemory&&(this.peakMemory=t.memory.totalGpuMemory),t.cpuTimeMs>16.67?this.droppedFrameCount++:this.smoothFrameCount++,this.frameHistory.length>=10){const i=[...this.frameHistory].sort((o,d)=>o-d),l=i.length;this.frameTimePercentiles={p50:i[Math.floor(l*.5)],p90:i[Math.floor(l*.9)],p95:i[Math.floor(l*.95)],p99:i[Math.floor(l*.99)]}}this.latestBenchmark=ot(t);const a=performance.now();a-this.lastMemoryUpdate>=this.memoryUpdateInterval&&(this.lastMemoryUpdate=a,t.memory&&(this.memoryHistory.push({timestamp:t.timestamp,totalGpu:t.memory.totalGpuMemory,textures:t.memory.textureMemory,geometry:t.memory.geometryMemory,renderTargets:t.memory.renderTargetMemory,jsHeap:t.memory.jsHeapSize??0}),this.memoryHistory.length>this.memoryHistoryMaxLength&&this.memoryHistory.shift()),this.performanceHistory.push({timestamp:t.timestamp,fps:s,frameTime:t.cpuTimeMs,drawCalls:t.drawCalls,triangles:t.triangles}),this.performanceHistory.length>this.performanceHistoryMaxLength&&this.performanceHistory.shift()),a-this.lastStatsUpdate>=this.statsUpdateInterval&&(this.lastStatsUpdate=a,this.updateStatsPanel())}),this.probe.onSelectionChanged((t,s)=>{this.selectedNodeId=(s==null?void 0:s.debugId)??null,this.updateScenePanel(),this.updateInspectorPanel()}),this.probe.onTransformChanged(()=>{this.updateScenePanel()}),this.render(),document.addEventListener("mousemove",this.handleMouseMove.bind(this)),document.addEventListener("mouseup",this.handleMouseUp.bind(this)),document.addEventListener("keydown",this.handleKeyDown.bind(this)),this.initializePluginIntegration()}initializePluginIntegration(){const e=this.probe.getPluginManager();e.setToastCallback((t,s)=>{this.showToast(t,s)}),e.setRenderRequestCallback(t=>{this.refreshPluginPanel(t)})}registerAndActivatePlugin(e){const t=this.probe.getPluginManager();if(t.registerPlugin(e),e.panels)for(const s of e.panels)this.registerPluginPanel(e.metadata.id,s);return this.syncPluginToolbarActions(),t.activatePlugin(e.metadata.id)}async unregisterAndDeactivatePlugin(e){const t=this.probe.getPluginManager();await t.deactivatePlugin(e);for(const[s,n]of this.pluginPanelUnsubscribers)s.startsWith(`${e}:`)&&(n(),this.pluginPanelUnsubscribers.delete(s));this.syncPluginToolbarActions(),await t.unregisterPlugin(e)}registerPluginPanel(e,t){const s=`${e}:${t.id}`,n=this.probe.getPluginManager(),a={id:s,title:t.name,icon:t.icon??"🔌",iconClass:"plugin",defaultWidth:400,defaultHeight:300,render:l=>n.renderPanel(s),onMount:l=>{n.mountPanel(s,l.container)},onDestroy:l=>{n.unmountPanel(s)}},i=this.registerPanel(a);this.pluginPanelUnsubscribers.set(s,i)}syncPluginToolbarActions(){const e=this.probe.getPluginManager();this.pluginToolbarActions=e.getToolbarActions(),this.menuVisible&&this.updateMenu()}refreshPluginPanel(e){for(const[t]of this.pluginPanelUnsubscribers)t.startsWith(`${e}:`)&&this.updatePanelContent(t)}showToast(e,t="info"){const s=document.createElement("div");s.className=`three-lens-toast three-lens-toast-${t}`,s.innerHTML=`
      <span class="three-lens-toast-icon">${t==="success"?"✓":t==="warning"?"⚠":t==="error"?"✕":"ℹ"}</span>
      <span class="three-lens-toast-message">${e}</span>
    `;let n=this.root.querySelector(".three-lens-toast-container");n||(n=document.createElement("div"),n.className="three-lens-toast-container",this.root.appendChild(n)),n.appendChild(s),requestAnimationFrame(()=>{s.classList.add("visible")}),setTimeout(()=>{s.classList.remove("visible"),setTimeout(()=>s.remove(),300)},3e3)}getPluginManager(){return this.probe.getPluginManager()}injectStyles(){if(document.getElementById("three-lens-styles"))return;const e=document.createElement("style");e.id="three-lens-styles",e.textContent=ct+`
`+bs()+`
`+ht,document.head.appendChild(e)}render(){this.root.innerHTML=`
      ${this.renderFAB()}
      ${this.renderMenu()}
    `,this.attachFABEvents()}renderFAB(){return`
      <button class="three-lens-fab ${this.menuVisible?"active":""}" id="three-lens-fab" title="3Lens DevTools">
        <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Penrose Triangle - 3Lens Logo -->
          <path d="M50 10L85 70H70L50 35L30 70H15L50 10Z" fill="#EF6B6B"/>
          <path d="M15 70L50 10L35 10L10 55L25 55L15 70Z" fill="#60A5FA"/>
          <path d="M85 70L50 10L65 10L90 55L75 55L85 70Z" fill="#34D399"/>
          <path d="M15 70H35L50 45L65 70H85L50 10L15 70Z" fill="none" stroke="currentColor" stroke-width="2" stroke-opacity="0.2"/>
        </svg>
      </button>
    `}renderMenu(){return`
      <div class="three-lens-menu ${this.menuVisible?"visible":""}" id="three-lens-menu">
        <div class="three-lens-menu-header">Panels</div>
        ${this.renderMenuItems()}
      </div>
    `}renderMenuItems(){return this.getPanelDefinitions().map(e=>`
          <button class="three-lens-menu-item ${this.openPanels.has(e.id)?"active":""}" data-panel="${e.id}">
            <span class="three-lens-menu-icon ${e.iconClass}">${e.icon}</span>
            <span>${e.title}</span>
          </button>
        `).join("")}attachFABEvents(){const e=document.getElementById("three-lens-fab");e==null||e.addEventListener("click",t=>{t.stopPropagation(),this.menuVisible=!this.menuVisible,this.updateMenu()}),this.attachMenuItemEvents(),document.addEventListener("click",t=>{this.menuVisible&&!t.target.closest(".three-lens-menu, .three-lens-fab")&&(this.menuVisible=!1,this.updateMenu())})}attachMenuItemEvents(e=document){e.querySelectorAll(".three-lens-menu-item").forEach(t=>{t.addEventListener("click",s=>{const n=s.currentTarget.dataset.panel;n&&(this.togglePanel(n),this.menuVisible=!1,this.updateMenu())})})}updateMenu(){const e=document.getElementById("three-lens-fab"),t=document.getElementById("three-lens-menu");e&&(e.className=`three-lens-fab ${this.menuVisible?"active":""}`),t&&(t.className=`three-lens-menu ${this.menuVisible?"visible":""}`),document.querySelectorAll(".three-lens-menu-item").forEach(s=>{const n=s.dataset.panel;n&&s.classList.toggle("active",this.openPanels.has(n))})}initializePanelDefinitions(e){[...xs,...e??[]].forEach(t=>this.registerPanelDefinition(t))}registerPanelDefinition(e){this.panelDefinitions.has(e.id)||this.panelDefinitions.set(e.id,e)}registerPanel(e){return this.registerPanelDefinition(e),this.refreshMenuItems(),()=>this.unregisterPanel(e.id)}unregisterPanel(e){this.openPanels.has(e)?this.closePanel(e):this.updateMenu(),this.panelDefinitions.delete(e),this.refreshMenuItems()}getPanelDefinitions(){return Array.from(this.panelDefinitions.values())}refreshMenuItems(){const e=document.getElementById("three-lens-menu");e&&(e.innerHTML=`
        <div class="three-lens-menu-header">Panels</div>
        ${this.renderMenuItems()}
      `,this.attachMenuItemEvents(e),this.updateMenu())}togglePanel(e){this.openPanels.has(e)?this.closePanel(e):this.openPanel(e)}openPanel(e){const t=this.panelDefinitions.get(e);if(!t)return;const s=this.openPanels.size*30,n=t.defaultWidth,a={id:e,x:100+s,y:100+s,width:n,height:t.defaultHeight,minimized:!1,zIndex:++this.topZIndex};this.openPanels.set(e,a),this.createPanelElement(t,a),e==="scene"&&requestAnimationFrame(()=>{this.updateScenePanelSize()}),this.updateMenu()}closePanel(e){this.destroyPanel(e),this.updateMenu()}createPanelElement(e,t){const s=document.createElement("div");s.id=`three-lens-panel-${e.id}`,s.className="three-lens-panel";const a=e.id==="scene"?`max-height: ${fs}px`:`height: ${t.height}px`;s.style.cssText=`
      left: ${t.x}px;
      top: ${t.y}px;
      width: ${t.width}px;
      ${a};
      z-index: ${t.zIndex};
    `;const i=["materials","geometry","textures"].includes(e.id),l=e.id==="materials"?"Search materials...":e.id==="geometry"?"Search geometry...":"Search textures...";s.innerHTML=`
      <div class="three-lens-panel-header" data-panel="${e.id}">
        <span class="three-lens-panel-icon ${e.iconClass}">${e.icon}</span>
        <span class="three-lens-panel-title">${e.title}</span>
        ${i?`
          <div class="three-lens-header-search">
            <input 
              type="text" 
              class="header-search-input" 
              data-panel="${e.id}"
              placeholder="${l}" 
            />
          </div>
        `:""}
        <div class="three-lens-panel-controls">
          <button class="three-lens-panel-btn minimize" data-action="minimize" title="Minimize">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="2" y1="6" x2="10" y2="6"/>
            </svg>
          </button>
          <button class="three-lens-panel-btn close" data-action="close" title="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="2" y1="2" x2="10" y2="10"/>
              <line x1="10" y1="2" x2="2" y2="10"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="three-lens-panel-content" id="three-lens-content-${e.id}">
        ${this.getInitialPanelMarkup(e.id)}
      </div>
      <div class="three-lens-panel-resize" data-panel="${e.id}"></div>
    `,this.root.appendChild(s),this.mountPanel(e.id,s),this.attachPanelEvents(s,e.id)}getInitialPanelMarkup(e){switch(e){case"scene":return this.renderSceneContent();case"stats":return this.renderStatsContent();case"materials":return this.renderMaterialsContent();case"geometry":return this.renderGeometryContent();case"textures":return this.renderTexturesContent();case"render-targets":return this.renderRenderTargetsContent();case"webgpu":return this.renderWebGPUContent();case"plugins":return this.renderPluginsContent();default:return'<div class="three-lens-inspector-empty">Panel content</div>'}}buildSharedPanelContext(){return{probe:this.probe,snapshot:this.latestSnapshot,stats:this.latestStats,benchmark:this.latestBenchmark,sendCommand:e=>this.handlePanelCommand(e),requestSnapshot:()=>this.refreshSnapshot()}}handlePanelCommand(e){switch(e.type){case"select-object":e.debugId?this.probe.selectByDebugId(e.debugId):this.probe.selectObject(null);break;case"update-material-property":this.probe.updateMaterialProperty(e.materialUuid,e.property,e.value),this.refreshSnapshot();break}}refreshSnapshot(){this.latestSnapshot=this.probe.takeSnapshot()}updateUIState(e){this.uiState={...this.uiState,...e}}renderMaterialsContent(){return this.refreshSnapshot(),yt(this.buildSharedPanelContext(),this.uiState)}renderGeometryContent(){return this.refreshSnapshot(),Lt(this.buildSharedPanelContext(),this.uiState)}renderTexturesContent(){return this.refreshSnapshot(),Ut(this.buildSharedPanelContext(),this.uiState)}renderRenderTargetsContent(){return this.refreshSnapshot(),rs(this.buildSharedPanelContext(),this.uiState)}renderPluginsContent(){const t=this.probe.getPluginManager().getPlugins();return`
      <div class="three-lens-plugins-panel">
        <div class="three-lens-plugins-header">
          <span class="three-lens-plugins-count">${t.length} plugin${t.length!==1?"s":""}</span>
          <button class="three-lens-plugins-btn" data-action="load-plugin" title="Load Plugin">
            <span>+ Load Plugin</span>
          </button>
        </div>
        
        <div class="three-lens-plugins-list">
          ${t.length===0?'<div class="three-lens-plugins-empty">No plugins installed</div>':t.map(s=>this.renderPluginListItem(s)).join("")}
        </div>
        
        ${this.selectedPluginId?this.renderPluginSettings(this.selectedPluginId):this.renderPluginLoadForm()}
      </div>
    `}renderPluginListItem(e){const t=this.selectedPluginId===e.id,s=e.state==="activated",n=e.state==="error";return`
      <div class="three-lens-plugin-item ${t?"selected":""} ${n?"error":""}" data-plugin-id="${e.id}">
        <div class="three-lens-plugin-icon">${e.metadata.icon??"🔌"}</div>
        <div class="three-lens-plugin-info">
          <div class="three-lens-plugin-name">${e.metadata.name}</div>
          <div class="three-lens-plugin-version">v${e.metadata.version}</div>
        </div>
        <div class="three-lens-plugin-status ${s?"active":n?"error":"inactive"}">
          ${s?"●":n?"!":"○"}
        </div>
        <div class="three-lens-plugin-actions">
          ${s?`<button class="three-lens-plugin-action-btn" data-action="deactivate" data-plugin-id="${e.id}" title="Deactivate">⏸</button>`:`<button class="three-lens-plugin-action-btn" data-action="activate" data-plugin-id="${e.id}" title="Activate">▶</button>`}
          <button class="three-lens-plugin-action-btn" data-action="unregister" data-plugin-id="${e.id}" title="Unregister">✕</button>
        </div>
      </div>
    `}renderPluginLoadForm(){return`
      <div class="three-lens-plugin-load-form">
        <div class="three-lens-section-header">Load Plugin</div>
        <div class="three-lens-plugin-form-group">
          <label class="three-lens-plugin-label">Source</label>
          <select class="three-lens-plugin-select" id="plugin-load-source">
            <option value="npm">npm Package</option>
            <option value="url">URL</option>
          </select>
        </div>
        <div class="three-lens-plugin-form-group">
          <label class="three-lens-plugin-label">Package / URL</label>
          <input type="text" class="three-lens-plugin-input" id="plugin-load-input" placeholder="@3lens/plugin-example" />
        </div>
        <div class="three-lens-plugin-form-group npm-only">
          <label class="three-lens-plugin-label">Version</label>
          <input type="text" class="three-lens-plugin-input" id="plugin-load-version" placeholder="latest" value="latest" />
        </div>
        <button class="three-lens-plugin-submit-btn" data-action="submit-load">Load Plugin</button>
        <div class="three-lens-plugin-load-status" id="plugin-load-status"></div>
      </div>
    `}renderPluginSettings(e){const s=this.probe.getPluginManager().getPlugin(e);if(!s)return'<div class="three-lens-plugin-settings">Plugin not found</div>';const{plugin:n,state:a,settings:i}=s,l=n.settings;return`
      <div class="three-lens-plugin-settings">
        <div class="three-lens-plugin-settings-header">
          <button class="three-lens-plugin-back-btn" data-action="back-to-list">← Back</button>
          <span class="three-lens-plugin-settings-title">${n.metadata.name}</span>
        </div>
        
        <div class="three-lens-plugin-details">
          ${n.metadata.description?`<div class="three-lens-plugin-description">${n.metadata.description}</div>`:""}
          <div class="three-lens-plugin-meta">
            <span>Version: ${n.metadata.version}</span>
            ${n.metadata.author?`<span>Author: ${n.metadata.author}</span>`:""}
            <span>Status: ${a}</span>
          </div>
        </div>
        
        ${l&&l.fields.length>0?`
          <div class="three-lens-section-header">Settings</div>
          <div class="three-lens-plugin-settings-fields">
            ${l.fields.map(o=>this.renderPluginSettingField(e,o,i[o.key])).join("")}
          </div>
        `:'<div class="three-lens-plugin-no-settings">This plugin has no configurable settings.</div>'}
        
        <div class="three-lens-plugin-settings-actions">
          ${a==="activated"?`<button class="three-lens-plugin-btn danger" data-action="deactivate" data-plugin-id="${e}">Deactivate</button>`:`<button class="three-lens-plugin-btn primary" data-action="activate" data-plugin-id="${e}">Activate</button>`}
          <button class="three-lens-plugin-btn danger" data-action="unregister" data-plugin-id="${e}">Unregister</button>
        </div>
      </div>
    `}renderPluginSettingField(e,t,s){const n=`plugin-setting-${e}-${t.key}`;let a="";switch(t.type){case"boolean":a=`
          <label class="three-lens-toggle">
            <input type="checkbox" id="${n}" data-plugin-id="${e}" data-setting-key="${t.key}" ${s?"checked":""} />
            <span class="three-lens-toggle-slider"></span>
          </label>
        `;break;case"number":a=`
          <input type="number" class="three-lens-plugin-input" id="${n}" 
            data-plugin-id="${e}" data-setting-key="${t.key}"
            value="${s??""}" 
            ${t.min!==void 0?`min="${t.min}"`:""}
            ${t.max!==void 0?`max="${t.max}"`:""}
            ${t.step!==void 0?`step="${t.step}"`:""}
          />
        `;break;case"select":a=`
          <select class="three-lens-plugin-select" id="${n}" data-plugin-id="${e}" data-setting-key="${t.key}">
            ${(t.options??[]).map(i=>`
              <option value="${i.value}" ${i.value===s?"selected":""}>${i.label}</option>
            `).join("")}
          </select>
        `;break;case"color":a=`
          <input type="color" class="three-lens-plugin-color" id="${n}" 
            data-plugin-id="${e}" data-setting-key="${t.key}"
            value="${s??"#000000"}" 
          />
        `;break;case"string":default:a=`
          <input type="text" class="three-lens-plugin-input" id="${n}" 
            data-plugin-id="${e}" data-setting-key="${t.key}"
            value="${s??""}" 
          />
        `;break}return`
      <div class="three-lens-plugin-setting-field">
        <div class="three-lens-plugin-setting-row">
          <label class="three-lens-plugin-setting-label" for="${n}">${t.label}</label>
          ${a}
        </div>
        ${t.description?`<div class="three-lens-plugin-setting-desc">${t.description}</div>`:""}
      </div>
    `}attachPluginsPanelEvents(e){var s,n,a;e.querySelectorAll(".three-lens-plugin-item").forEach(i=>{i.addEventListener("click",l=>{if(l.target.closest(".three-lens-plugin-action-btn"))return;const o=i.dataset.pluginId;o&&(this.selectedPluginId=o,this.updatePluginsPanel())})}),e.querySelectorAll(".three-lens-plugin-action-btn").forEach(i=>{i.addEventListener("click",async l=>{l.stopPropagation();const o=i.dataset.action,d=i.dataset.pluginId;d&&await this.handlePluginAction(o,d)})}),(s=e.querySelector('[data-action="load-plugin"]'))==null||s.addEventListener("click",()=>{this.selectedPluginId=null,this.updatePluginsPanel()}),(n=e.querySelector('[data-action="back-to-list"]'))==null||n.addEventListener("click",()=>{this.selectedPluginId=null,this.updatePluginsPanel()}),e.querySelectorAll(".three-lens-plugin-btn[data-action]").forEach(i=>{i.addEventListener("click",async()=>{const l=i.dataset.action,o=i.dataset.pluginId;o&&await this.handlePluginAction(l,o)})}),e.querySelectorAll("[data-setting-key]").forEach(i=>{i.addEventListener("change",()=>{const l=i.dataset.pluginId,o=i.dataset.settingKey;let d;i.type==="checkbox"?d=i.checked:i.type==="number"?d=parseFloat(i.value):d=i.value,this.probe.getPluginManager().updatePluginSettings(l,{[o]:d})})});const t=e.querySelector("#plugin-load-source");t==null||t.addEventListener("change",()=>{const i=e.querySelectorAll(".npm-only"),l=e.querySelector("#plugin-load-input");t.value==="npm"?(i.forEach(o=>o.style.display=""),l&&(l.placeholder="@3lens/plugin-example")):(i.forEach(o=>o.style.display="none"),l&&(l.placeholder="https://example.com/plugin.js"))}),(a=e.querySelector('[data-action="submit-load"]'))==null||a.addEventListener("click",async()=>{var c,p,g,u,m,f,v;const i=((c=e.querySelector("#plugin-load-source"))==null?void 0:c.value)??"npm",l=(g=(p=e.querySelector("#plugin-load-input"))==null?void 0:p.value)==null?void 0:g.trim(),o=((m=(u=e.querySelector("#plugin-load-version"))==null?void 0:u.value)==null?void 0:m.trim())||"latest",d=e.querySelector("#plugin-load-status");if(!l){d&&(d.innerHTML='<span class="error">Please enter a package name or URL</span>');return}d&&(d.innerHTML='<span class="loading">Loading plugin...</span>');try{let b;i==="npm"?b=await this.probe.loadPlugin(l,o):b=await this.probe.loadPluginFromUrl(l),b.success?(d&&(d.innerHTML=`<span class="success">✓ Loaded ${(f=b.plugin)==null?void 0:f.metadata.name}</span>`),setTimeout(()=>this.updatePluginsPanel(),1e3)):d&&(d.innerHTML=`<span class="error">✕ ${((v=b.error)==null?void 0:v.message)??"Failed to load"}</span>`)}catch(b){d&&(d.innerHTML=`<span class="error">✕ ${b instanceof Error?b.message:"Unknown error"}</span>`)}})}async handlePluginAction(e,t){const s=this.probe.getPluginManager();switch(e){case"activate":await s.activatePlugin(t);break;case"deactivate":await s.deactivatePlugin(t);break;case"unregister":this.selectedPluginId===t&&(this.selectedPluginId=null),await s.unregisterPlugin(t);break}this.updatePluginsPanel()}updatePluginsPanel(){const e=document.getElementById("three-lens-content-plugins");e&&(e.innerHTML=this.renderPluginsContent(),this.attachPluginsPanelEvents(e))}renderWebGPUContent(){return this.probe.isWebGPU()?`
      <div class="webgpu-panel">
        <div class="webgpu-tabs">
          <button class="webgpu-tab ${this.webgpuTab==="pipelines"?"active":""}" data-tab="pipelines">Pipelines</button>
          <button class="webgpu-tab ${this.webgpuTab==="bindgroups"?"active":""}" data-tab="bindgroups">Bind Groups</button>
          <button class="webgpu-tab ${this.webgpuTab==="shaders"?"active":""}" data-tab="shaders">Shaders</button>
          <button class="webgpu-tab ${this.webgpuTab==="timing"?"active":""}" data-tab="timing">GPU Timing</button>
          <button class="webgpu-tab ${this.webgpuTab==="capabilities"?"active":""}" data-tab="capabilities">Capabilities</button>
        </div>
        <div class="webgpu-tab-content">
          ${this.renderWebGPUTabContent()}
        </div>
      </div>
    `:`
        <div class="webgpu-panel">
          <div class="webgpu-not-available">
            <div class="webgpu-not-available-icon">🔷</div>
            <div class="webgpu-not-available-title">WebGPU Not Active</div>
            <div class="webgpu-not-available-desc">
              The current renderer is using WebGL. This panel provides debugging tools 
              specifically for Three.js WebGPURenderer.
            </div>
            <div class="webgpu-not-available-hint">
              To use WebGPU, initialize your app with <code>WebGPURenderer</code> from 
              <code>three/webgpu</code>.
            </div>
          </div>
        </div>
      `}renderWebGPUTabContent(){switch(this.webgpuTab){case"pipelines":return this.renderWebGPUPipelinesTab();case"bindgroups":return this.renderWebGPUBindGroupsTab();case"shaders":return this.renderWebGPUShadersTab();case"timing":return this.renderWebGPUTimingTab();case"capabilities":return this.renderWebGPUCapabilitiesTab();default:return""}}renderWebGPUPipelinesTab(){var a;const e=this.probe.getRendererAdapter(),t=((a=e==null?void 0:e.getPipelines)==null?void 0:a.call(e))??[];if(t.length===0)return`
        <div class="webgpu-empty">
          <p>No pipelines detected yet.</p>
          <p class="webgpu-hint">Pipelines are created when materials are compiled for rendering.</p>
        </div>
      `;const s=t.filter(i=>i.type==="render"),n=t.filter(i=>i.type==="compute");return`
      <div class="webgpu-pipelines">
        <div class="webgpu-section">
          <div class="webgpu-section-header">
            <span>Render Pipelines</span>
            <span class="webgpu-badge">${s.length}</span>
          </div>
          <div class="webgpu-pipeline-list">
            ${s.length===0?'<div class="webgpu-empty-small">No render pipelines</div>':s.map(i=>this.renderPipelineItem(i)).join("")}
          </div>
        </div>
        
        ${n.length>0?`
          <div class="webgpu-section">
            <div class="webgpu-section-header">
              <span>Compute Pipelines</span>
              <span class="webgpu-badge">${n.length}</span>
            </div>
            <div class="webgpu-pipeline-list">
              ${n.map(i=>this.renderPipelineItem(i)).join("")}
            </div>
          </div>
        `:""}
        
        ${this.selectedPipelineId?this.renderPipelineDetails(this.selectedPipelineId,t):""}
      </div>
    `}renderPipelineItem(e){const t=this.selectedPipelineId===e.id,s=e.type==="render"?"🎨":"⚡",n=e.label??e.id;return`
      <div class="webgpu-pipeline-item ${t?"selected":""}" data-pipeline-id="${e.id}">
        <span class="webgpu-pipeline-icon">${s}</span>
        <span class="webgpu-pipeline-name">${this.escapeHtml(n)}</span>
        <span class="webgpu-pipeline-type">${e.type}</span>
        ${e.usageCount?`<span class="webgpu-pipeline-usage">${e.usageCount} uses</span>`:""}
      </div>
    `}renderPipelineDetails(e,t){const s=t.find(n=>n.id===e);return s?`
      <div class="webgpu-pipeline-details">
        <div class="webgpu-details-header">
          <span class="webgpu-details-title">${s.type==="render"?"🎨":"⚡"} ${this.escapeHtml(s.label??s.id)}</span>
          <button class="webgpu-close-btn" data-action="close-pipeline-details">×</button>
        </div>
        
        <div class="webgpu-details-content">
          <div class="webgpu-detail-row">
            <span class="webgpu-detail-label">Type</span>
            <span class="webgpu-detail-value">${s.type}</span>
          </div>
          <div class="webgpu-detail-row">
            <span class="webgpu-detail-label">ID</span>
            <span class="webgpu-detail-value mono">${s.id}</span>
          </div>
          ${s.usedByMaterials.length>0?`
            <div class="webgpu-detail-row">
              <span class="webgpu-detail-label">Materials</span>
              <span class="webgpu-detail-value">${s.usedByMaterials.length} material(s)</span>
            </div>
          `:""}
          
          ${s.vertexStage?`
            <div class="webgpu-shader-stage">
              <div class="webgpu-shader-stage-header">Vertex Stage</div>
              <div class="webgpu-shader-stage-entry">${s.vertexStage}</div>
            </div>
          `:""}
          
          ${s.fragmentStage?`
            <div class="webgpu-shader-stage">
              <div class="webgpu-shader-stage-header">Fragment Stage</div>
              <div class="webgpu-shader-stage-entry">${s.fragmentStage}</div>
            </div>
          `:""}
          
          ${s.computeStage?`
            <div class="webgpu-shader-stage">
              <div class="webgpu-shader-stage-header">Compute Stage</div>
              <div class="webgpu-shader-stage-entry">${s.computeStage}</div>
            </div>
          `:""}
        </div>
      </div>
    `:""}renderWebGPUBindGroupsTab(){return`
      <div class="webgpu-bindgroups">
        <div class="webgpu-info">
          <div class="webgpu-info-icon">📦</div>
          <div class="webgpu-info-title">Bind Groups</div>
          <div class="webgpu-info-desc">
            Bind groups contain resources (buffers, textures, samplers) that are bound to shaders.
            Deep bind group tracking requires additional instrumentation.
          </div>
        </div>
        
        <div class="webgpu-section">
          <div class="webgpu-section-header">Common Bind Group Types</div>
          <div class="webgpu-bindgroup-types">
            <div class="webgpu-bindgroup-type">
              <span class="webgpu-bindgroup-type-icon">📐</span>
              <span class="webgpu-bindgroup-type-name">Camera Uniforms</span>
              <span class="webgpu-bindgroup-type-desc">View, projection, camera position</span>
            </div>
            <div class="webgpu-bindgroup-type">
              <span class="webgpu-bindgroup-type-icon">🎨</span>
              <span class="webgpu-bindgroup-type-name">Material Properties</span>
              <span class="webgpu-bindgroup-type-desc">Color, roughness, metalness, textures</span>
            </div>
            <div class="webgpu-bindgroup-type">
              <span class="webgpu-bindgroup-type-icon">💡</span>
              <span class="webgpu-bindgroup-type-name">Lighting Data</span>
              <span class="webgpu-bindgroup-type-desc">Light positions, colors, shadow maps</span>
            </div>
            <div class="webgpu-bindgroup-type">
              <span class="webgpu-bindgroup-type-icon">🦴</span>
              <span class="webgpu-bindgroup-type-name">Skeleton/Morph</span>
              <span class="webgpu-bindgroup-type-desc">Bone matrices, morph targets</span>
            </div>
          </div>
        </div>
      </div>
    `}renderWebGPUShadersTab(){var n;const e=this.probe.getRendererAdapter(),s=(((n=e==null?void 0:e.getPipelines)==null?void 0:n.call(e))??[]).filter(a=>a.vertexStage||a.fragmentStage||a.computeStage);return`
      <div class="webgpu-shaders">
        <div class="webgpu-section">
          <div class="webgpu-section-header">
            <span>WGSL Shaders</span>
            <span class="webgpu-badge">${s.length}</span>
          </div>
          
          ${s.length===0?`
            <div class="webgpu-empty">
              <p>No shader sources available.</p>
              <p class="webgpu-hint">Shader source inspection requires additional instrumentation of the WebGPU backend.</p>
            </div>
          `:`
            <div class="webgpu-shader-list">
              ${s.map(a=>`
                <div class="webgpu-shader-item" data-pipeline-id="${a.id}">
                  <span class="webgpu-shader-icon">${a.type==="compute"?"⚡":"🎨"}</span>
                  <span class="webgpu-shader-name">${this.escapeHtml(a.label??a.id)}</span>
                  <span class="webgpu-shader-stages">
                    ${a.vertexStage?'<span class="webgpu-stage-badge vs">VS</span>':""}
                    ${a.fragmentStage?'<span class="webgpu-stage-badge fs">FS</span>':""}
                    ${a.computeStage?'<span class="webgpu-stage-badge cs">CS</span>':""}
                  </span>
                </div>
              `).join("")}
            </div>
          `}
        </div>
        
        <div class="webgpu-section">
          <div class="webgpu-section-header">About WGSL</div>
          <div class="webgpu-info-box">
            <p><strong>WGSL</strong> (WebGPU Shading Language) is the shader language for WebGPU.</p>
            <p>Unlike GLSL, WGSL is designed specifically for the web with:</p>
            <ul>
              <li>Rust-like syntax</li>
              <li>Explicit types</li>
              <li>Memory safety features</li>
              <li>Consistent behavior across browsers</li>
            </ul>
          </div>
        </div>
      </div>
    `}renderWebGPUTimingTab(){var c;const e=this.latestStats,t=(c=e==null?void 0:e.webgpuExtras)==null?void 0:c.gpuTiming,s=e==null?void 0:e.gpuTimeMs;if(!(t&&t.passes.length>0))return`
        <div class="webgpu-timing">
          <div class="webgpu-info">
            <div class="webgpu-info-icon">⏱️</div>
            <div class="webgpu-info-title">GPU Timing</div>
            <div class="webgpu-info-desc">
              GPU timing via timestamp queries provides accurate per-pass breakdown of GPU execution time.
            </div>
          </div>
          
          ${s!==void 0?`
            <div class="webgpu-section">
              <div class="webgpu-section-header">Estimated GPU Time</div>
              <div class="webgpu-timing-summary">
                <div class="webgpu-timing-total">
                  <span class="webgpu-timing-value">${s.toFixed(2)}</span>
                  <span class="webgpu-timing-unit">ms</span>
                </div>
                <p class="webgpu-hint">This is an estimate. Enable timestamp queries for accurate per-pass breakdown.</p>
              </div>
            </div>
          `:""}
          
          <div class="webgpu-section">
            <div class="webgpu-section-header">Timestamp Query Requirements</div>
            <div class="webgpu-info-box">
              <p><strong>Requirements:</strong></p>
              <ul>
                <li>WebGPU device with <code>timestamp-query</code> feature</li>
                <li>Browser support (Chrome 113+, Edge 113+)</li>
                <li>Renderer must be initialized with timestamp queries enabled</li>
              </ul>
              <p><strong>Note:</strong> Some browsers may require a flag to enable timestamp queries for privacy reasons.</p>
            </div>
          </div>
        </div>
      `;const a=t.totalMs,i=t.passes;t.breakdown;const l=[...i].sort((p,g)=>g.durationMs-p.durationMs),o={shadow:"#9333EA",opaque:"#3B82F6",transparent:"#10B981","post-process":"#F59E0B",compute:"#EF4444",copy:"#6B7280"},d=p=>{const g=p.toLowerCase();for(const[u,m]of Object.entries(o))if(g.includes(u))return m;return"#8B5CF6"};return`
      <div class="webgpu-timing">
        <div class="webgpu-section">
          <div class="webgpu-section-header">
            <span>GPU Frame Time</span>
            <span class="webgpu-timing-badge">${a.toFixed(2)} ms</span>
          </div>
          
          <div class="webgpu-timing-bar-container">
            <div class="webgpu-timing-bar">
              ${l.map((p,g)=>{const u=a>0?p.durationMs/a*100:0,m=d(p.name);return`<div class="webgpu-timing-bar-segment" style="width: ${u}%; background: ${m};" title="${p.name}: ${p.durationMs.toFixed(2)}ms"></div>`}).join("")}
            </div>
          </div>
          
          <div class="webgpu-timing-legend">
            ${l.map(p=>{const g=a>0?p.durationMs/a*100:0;return`
                <div class="webgpu-timing-legend-item">
                  <span class="webgpu-timing-legend-color" style="background: ${d(p.name)};"></span>
                  <span class="webgpu-timing-legend-name">${this.escapeHtml(p.name)}</span>
                  <span class="webgpu-timing-legend-value">${p.durationMs.toFixed(2)} ms</span>
                  <span class="webgpu-timing-legend-pct">${g.toFixed(1)}%</span>
                </div>
              `}).join("")}
          </div>
        </div>
        
        <div class="webgpu-section">
          <div class="webgpu-section-header">Pass Breakdown</div>
          <div class="webgpu-timing-passes">
            ${l.map(p=>{const g=a>0?p.durationMs/a*100:0,u=d(p.name);return`
                <div class="webgpu-timing-pass ${p.durationMs>a*.3?"hot":""}">
                  <div class="webgpu-timing-pass-header">
                    <span class="webgpu-timing-pass-color" style="background: ${u};"></span>
                    <span class="webgpu-timing-pass-name">${this.escapeHtml(p.name)}</span>
                    <span class="webgpu-timing-pass-time">${p.durationMs.toFixed(2)} ms</span>
                  </div>
                  <div class="webgpu-timing-pass-bar">
                    <div class="webgpu-timing-pass-fill" style="width: ${g}%; background: ${u};"></div>
                  </div>
                </div>
              `}).join("")}
          </div>
        </div>
        
        <div class="webgpu-section">
          <div class="webgpu-section-header">Timing Analysis</div>
          <div class="webgpu-timing-analysis">
            <div class="webgpu-analysis-row">
              <span class="webgpu-analysis-label">Total GPU Time</span>
              <span class="webgpu-analysis-value">${a.toFixed(2)} ms</span>
            </div>
            <div class="webgpu-analysis-row">
              <span class="webgpu-analysis-label">Target (60 FPS)</span>
              <span class="webgpu-analysis-value ${a>16.67?"over":"ok"}">16.67 ms</span>
            </div>
            <div class="webgpu-analysis-row">
              <span class="webgpu-analysis-label">Budget Used</span>
              <span class="webgpu-analysis-value ${a>16.67?"over":"ok"}">${(a/16.67*100).toFixed(0)}%</span>
            </div>
            <div class="webgpu-analysis-row">
              <span class="webgpu-analysis-label">Number of Passes</span>
              <span class="webgpu-analysis-value">${i.length}</span>
            </div>
            ${l.length>0?`
              <div class="webgpu-analysis-row">
                <span class="webgpu-analysis-label">Slowest Pass</span>
                <span class="webgpu-analysis-value">${this.escapeHtml(l[0].name)}</span>
              </div>
            `:""}
          </div>
        </div>
      </div>
    `}renderWebGPUCapabilitiesTab(){const e=this.latestStats,t=e==null?void 0:e.webgpuExtras;return`
      <div class="webgpu-capabilities">
        <div class="webgpu-section">
          <div class="webgpu-section-header">Current Frame Stats</div>
          <div class="webgpu-stats-grid">
            <div class="webgpu-stat">
              <span class="webgpu-stat-value">${(t==null?void 0:t.pipelinesUsed)??"—"}</span>
              <span class="webgpu-stat-label">Pipelines</span>
            </div>
            <div class="webgpu-stat">
              <span class="webgpu-stat-value">${(t==null?void 0:t.renderPasses)??"—"}</span>
              <span class="webgpu-stat-label">Render Passes</span>
            </div>
            <div class="webgpu-stat">
              <span class="webgpu-stat-value">${(t==null?void 0:t.computePasses)??"—"}</span>
              <span class="webgpu-stat-label">Compute Passes</span>
            </div>
            <div class="webgpu-stat">
              <span class="webgpu-stat-value">${(t==null?void 0:t.bindGroupsUsed)??"—"}</span>
              <span class="webgpu-stat-label">Bind Groups</span>
            </div>
          </div>
        </div>
        
        <div class="webgpu-section">
          <div class="webgpu-section-header">Device Limits</div>
          <div class="webgpu-limits-info">
            <p class="webgpu-hint">
              Device limits are available via <code>getWebGPUCapabilities(renderer)</code>.
            </p>
          </div>
          <div class="webgpu-limits-grid">
            ${this.renderWebGPULimitsGrid()}
          </div>
        </div>
        
        <div class="webgpu-section">
          <div class="webgpu-section-header">WebGPU vs WebGL</div>
          <div class="webgpu-comparison">
            <div class="webgpu-compare-row header">
              <span>Feature</span>
              <span>WebGL</span>
              <span>WebGPU</span>
            </div>
            <div class="webgpu-compare-row">
              <span>Compute Shaders</span>
              <span class="no">❌</span>
              <span class="yes">✅</span>
            </div>
            <div class="webgpu-compare-row">
              <span>Explicit Binding</span>
              <span class="no">❌</span>
              <span class="yes">✅</span>
            </div>
            <div class="webgpu-compare-row">
              <span>Pipeline State Objects</span>
              <span class="no">❌</span>
              <span class="yes">✅</span>
            </div>
            <div class="webgpu-compare-row">
              <span>Multi-threaded Commands</span>
              <span class="no">❌</span>
              <span class="yes">✅</span>
            </div>
            <div class="webgpu-compare-row">
              <span>Timestamp Queries</span>
              <span class="partial">⚠️</span>
              <span class="yes">✅</span>
            </div>
          </div>
        </div>
      </div>
    `}renderWebGPULimitsGrid(){return[{name:"Max Texture Size 2D",value:"16384"},{name:"Max Bind Groups",value:"4"},{name:"Max Bindings/Group",value:"1000"},{name:"Max Uniform Buffer",value:"64KB"},{name:"Max Storage Buffer",value:"128MB"},{name:"Max Vertex Buffers",value:"8"},{name:"Max Vertex Attributes",value:"16"},{name:"Max Compute Workgroup",value:"256"}].map(t=>`
      <div class="webgpu-limit">
        <span class="webgpu-limit-name">${t.name}</span>
        <span class="webgpu-limit-value">${t.value}</span>
      </div>
    `).join("")}attachWebGPUPanelEvents(e){var t;e.querySelectorAll(".webgpu-tab").forEach(s=>{s.addEventListener("click",()=>{this.webgpuTab=s.dataset.tab,this.updateWebGPUPanel()})}),e.querySelectorAll(".webgpu-pipeline-item").forEach(s=>{s.addEventListener("click",()=>{const n=s.dataset.pipelineId;this.selectedPipelineId=this.selectedPipelineId===n?null:n??null,this.updateWebGPUPanel()})}),(t=e.querySelector('[data-action="close-pipeline-details"]'))==null||t.addEventListener("click",()=>{this.selectedPipelineId=null,this.updateWebGPUPanel()}),e.querySelectorAll(".webgpu-shader-item").forEach(s=>{s.addEventListener("click",()=>{const n=s.dataset.pipelineId;n&&(this.webgpuTab="pipelines",this.selectedPipelineId=n,this.updateWebGPUPanel())})})}updateWebGPUPanel(){const e=document.getElementById("three-lens-content-webgpu");e&&(e.innerHTML=this.renderWebGPUContent(),this.attachWebGPUPanelEvents(e))}escapeHtml(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??t)}mountPanel(e,t){var o;const s=this.panelDefinitions.get(e),n=t.querySelector(`#three-lens-content-${e}`);if(!s||!n)return;const a=this.openPanels.get(e),i=this.buildPanelContext(e,n,t,a);this.panelContexts.set(e,i);const l=this.renderPanelContent(e,i);this.applyPanelContent(n,l),(o=s.onMount)==null||o.call(s,i),e==="plugins"?this.attachPluginsPanelEvents(n):e==="webgpu"&&this.attachWebGPUPanelEvents(n)}applyPanelContent(e,t){if(typeof t=="string"){e.innerHTML=t;return}if(t instanceof HTMLElement){e.innerHTML="",e.appendChild(t);return}e.innerHTML=""}buildPanelContext(e,t,s,n){return{panelId:e,container:t,panelElement:s,probe:this.probe,overlay:this,state:n??this.openPanels.get(e)}}updatePanelContent(e){const t=this.panelDefinitions.get(e),s=this.panelContexts.get(e);if(!(!t||!s)&&t.render){const n=t.render(s);typeof n=="string"?s.container.innerHTML=n:n instanceof HTMLElement&&(s.container.innerHTML="",s.container.appendChild(n))}}destroyPanel(e){const t=this.panelDefinitions.get(e),s=this.panelContexts.get(e);t!=null&&t.onDestroy&&s&&t.onDestroy(s),this.panelContexts.delete(e),e==="scene"&&this.virtualScroller&&(this.virtualScroller.dispose(),this.virtualScroller=null,this.virtualScrollContainer=null);const n=document.getElementById(`three-lens-panel-${e}`);n&&n.remove(),this.openPanels.delete(e)}attachPanelEvents(e,t){const s=e.querySelector(".three-lens-panel-header");s==null||s.addEventListener("mousedown",i=>{i.target.closest(".three-lens-panel-btn")||i.target.closest(".three-lens-header-search")||this.startDrag(t,i)});const n=e.querySelector(".header-search-input");n&&n.addEventListener("input",()=>{const i=t==="materials"?"materialsSearch":t==="geometry"?"geometrySearch":"texturesSearch";this.updateUIState({[i]:n.value}),this.updatePanelById(t)}),e.addEventListener("mousedown",()=>{this.focusPanel(t)}),e.querySelectorAll(".three-lens-panel-btn").forEach(i=>{i.addEventListener("click",l=>{const o=l.currentTarget.dataset.action;o==="close"&&this.closePanel(t),o==="minimize"&&this.toggleMinimize(t)})});const a=e.querySelector(".three-lens-panel-resize");a==null||a.addEventListener("mousedown",i=>{i.stopPropagation(),this.startResize(t,i)}),t==="scene"&&this.attachTreeEvents(e),t==="stats"&&this.attachStatsTabEvents(e),t==="materials"&&this.attachMaterialsPanelEvents(e),t==="geometry"&&this.attachGeometryPanelEvents(e),t==="textures"&&this.attachTexturesPanelEvents(e),t==="render-targets"&&this.attachRenderTargetsPanelEvents(e)}attachMaterialsPanelEvents(e){const t=e.querySelector("#three-lens-content-materials");t&&Pt(t,this.buildSharedPanelContext(),this.uiState,s=>this.updateUIState(s),()=>this.updateMaterialsPanel())}attachGeometryPanelEvents(e){const t=e.querySelector("#three-lens-content-geometry");t&&jt(t,this.buildSharedPanelContext(),this.uiState,s=>this.updateUIState(s),()=>this.updateGeometryPanel())}attachTexturesPanelEvents(e){const t=e.querySelector("#three-lens-content-textures");t&&ts(t,this.buildSharedPanelContext(),this.uiState,s=>this.updateUIState(s),()=>this.updateTexturesPanel())}attachRenderTargetsPanelEvents(e){const t=e.querySelector("#three-lens-content-render-targets");t&&us(t,this.buildSharedPanelContext(),this.uiState,s=>this.updateUIState(s),()=>this.updateRenderTargetsPanel())}updateMaterialsPanel(){const e=document.getElementById("three-lens-content-materials");if(!e)return;e.innerHTML=this.renderMaterialsContent();const t=document.getElementById("three-lens-panel-materials");t&&this.attachMaterialsPanelEvents(t)}updateGeometryPanel(){const e=document.getElementById("three-lens-content-geometry");if(!e)return;e.innerHTML=this.renderGeometryContent();const t=document.getElementById("three-lens-panel-geometry");t&&this.attachGeometryPanelEvents(t)}updateTexturesPanel(){const e=document.getElementById("three-lens-content-textures");if(!e)return;e.innerHTML=this.renderTexturesContent();const t=document.getElementById("three-lens-panel-textures");t&&this.attachTexturesPanelEvents(t)}updateRenderTargetsPanel(){const e=document.getElementById("three-lens-content-render-targets");if(!e)return;e.innerHTML=this.renderRenderTargetsContent();const t=document.getElementById("three-lens-panel-render-targets");t&&this.attachRenderTargetsPanelEvents(t)}updatePanelById(e){switch(e){case"materials":this.updateMaterialsPanel();break;case"geometry":this.updateGeometryPanel();break;case"textures":this.updateTexturesPanel();break;case"render-targets":this.updateRenderTargetsPanel();break}}focusPanel(e){const t=this.openPanels.get(e);if(!t)return;t.zIndex=++this.topZIndex;const s=document.getElementById(`three-lens-panel-${e}`);s&&(s.style.zIndex=String(t.zIndex),document.querySelectorAll(".three-lens-panel").forEach(n=>n.classList.remove("focused")),s.classList.add("focused"))}toggleMinimize(e){const t=this.openPanels.get(e);if(!t)return;t.minimized=!t.minimized;const s=document.getElementById(`three-lens-panel-${e}`);s&&s.classList.toggle("minimized",t.minimized)}startDrag(e,t){const s=this.openPanels.get(e);s&&(this.dragState={panelId:e,startX:t.clientX,startY:t.clientY,startPanelX:s.x,startPanelY:s.y},this.focusPanel(e))}startResize(e,t){const s=this.openPanels.get(e);if(!s)return;const n=document.getElementById(`three-lens-panel-${e}`);if(!n)return;const a=n.getBoundingClientRect();n.classList.add("resizing"),n.style.height=`${a.height}px`,n.style.maxHeight="none",s.height=a.height,this.resizeState={panelId:e,startX:t.clientX,startY:t.clientY,startWidth:a.width,startHeight:a.height},this.focusPanel(e)}handleMouseMove(e){if(this.dragState){const t=this.openPanels.get(this.dragState.panelId);if(!t)return;const s=e.clientX-this.dragState.startX,n=e.clientY-this.dragState.startY;t.x=Math.max(0,this.dragState.startPanelX+s),t.y=Math.max(0,this.dragState.startPanelY+n);const a=document.getElementById(`three-lens-panel-${this.dragState.panelId}`);a&&(a.style.left=`${t.x}px`,a.style.top=`${t.y}px`)}if(this.resizeState){const t=this.openPanels.get(this.resizeState.panelId);if(!t)return;const s=e.clientX-this.resizeState.startX,n=e.clientY-this.resizeState.startY;t.width=Math.max(280,this.resizeState.startWidth+s),t.height=Math.max(100,this.resizeState.startHeight+n);const a=document.getElementById(`three-lens-panel-${this.resizeState.panelId}`);a&&(a.style.width=`${t.width}px`,a.style.height=`${t.height}px`)}}handleMouseUp(){if(this.resizeState){const e=document.getElementById(`three-lens-panel-${this.resizeState.panelId}`);e&&e.classList.remove("resizing")}this.dragState=null,this.resizeState=null}handleKeyDown(e){e.ctrlKey&&e.shiftKey&&e.key==="D"&&(this.menuVisible=!this.menuVisible,this.updateMenu(),e.preventDefault())}renderPanelContent(e,t){switch(e){case"scene":return this.renderSceneContent();case"stats":return this.renderStatsContent();case"materials":return this.renderMaterialsContent();case"geometry":return this.renderGeometryContent();case"textures":return this.renderTexturesContent();case"render-targets":return this.renderRenderTargetsContent();case"webgpu":return this.renderWebGPUContent();case"plugins":return this.renderPluginsContent();default:{const s=this.panelDefinitions.get(e);return s!=null&&s.render&&t?s.render(t):'<div class="three-lens-inspector-empty">Panel content</div>'}}}renderSceneContent(){if(this.probe.getObservedScenes().length===0)return'<div class="three-lens-inspector-empty">No scenes observed</div>';const t=this.probe.takeSnapshot();for(const i of t.scenes){this.expandedNodes.add(i.ref.debugId);for(const l of i.children.slice(0,3))l.children.length>0&&this.expandedNodes.add(l.ref.debugId)}const s=this.selectedNodeId?this.findNodeById(t.scenes,this.selectedNodeId):null;return t.scenes.reduce((i,l)=>i+Me(l),0)>this.virtualScrollThreshold?`
        <div class="three-lens-split-view">
          <div class="three-lens-tree-pane">
            <div class="three-lens-virtual-scroll-container" id="three-lens-virtual-tree">
              <div class="three-lens-virtual-scroll-content"></div>
            </div>
          </div>
          <div class="three-lens-inspector-pane">
          ${s?this.renderNodeInspector(s):this.renderGlobalTools()}
          </div>
        </div>
      `:`
        <div class="three-lens-split-view">
          <div class="three-lens-tree-pane">
            <div class="three-lens-tree">${t.scenes.map(i=>this.renderNode(i)).join("")}</div>
          </div>
          <div class="three-lens-inspector-pane">
          ${s?this.renderNodeInspector(s):this.renderGlobalTools()}
          </div>
      </div>
    `}initVirtualScroller(){const e=document.getElementById("three-lens-virtual-tree");if(!e)return;const t=this.probe.takeSnapshot();t.scenes.length!==0&&(this.virtualScroller?this.virtualScroller.setData(t.scenes):(this.virtualScroller=new pt({container:e,getChildren:s=>s.children,getId:s=>s.ref.debugId,isExpanded:s=>this.expandedNodes.has(s),renderRow:s=>this.renderVirtualTreeNode(s),rowHeight:28,overscan:5}),this.virtualScroller.setData(t.scenes)),this.virtualScrollContainer=e)}renderVirtualTreeNode(e){var c,p;const t=e.data,s=t.children.length>0,n=this.expandedNodes.has(t.ref.debugId),a=this.selectedNodeId===t.ref.debugId,i=t.visible,l=((p=(c=t.meshData)==null?void 0:c.costData)==null?void 0:p.costLevel)||"",o=l?`cost-${l}`:"",d=e.depth*16;return`
      <div class="three-lens-virtual-row" data-id="${t.ref.debugId}" data-depth="${e.depth}" style="padding-left: ${d}px;">
        <div class="three-lens-node-header ${a?"selected":""} ${i?"":"hidden-object"} ${o}">
          <span class="three-lens-node-toggle ${s?n?"expanded":"":"hidden"}">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M2 1L6 4L2 7z"/></svg>
          </span>
          <span class="three-lens-node-icon ${ue(t.ref.type)}">${me(t.ref.type)}</span>
          <span class="three-lens-node-name ${t.ref.name?"":"unnamed"}">${t.ref.name||"unnamed"}</span>
          ${l?`<span class="three-lens-cost-indicator ${o}" title="Cost: ${l}">${this.getCostIcon(l)}</span>`:""}
          <button class="three-lens-visibility-btn ${i?"visible":"hidden"}" data-id="${t.ref.debugId}" title="${i?"Hide object":"Show object"}">
            ${i?this.getEyeOpenIcon():this.getEyeClosedIcon()}
          </button>
          <span class="three-lens-node-spacer"></span>
          <span class="three-lens-node-type">${t.ref.type}</span>
        </div>
      </div>
    `}renderNode(e){var o,d;const t=e.children.length>0,s=this.expandedNodes.has(e.ref.debugId),n=this.selectedNodeId===e.ref.debugId,a=e.visible,i=((d=(o=e.meshData)==null?void 0:o.costData)==null?void 0:d.costLevel)||"",l=i?`cost-${i}`:"";return`
      <div class="three-lens-node" data-id="${e.ref.debugId}">
        <div class="three-lens-node-header ${n?"selected":""} ${a?"":"hidden-object"} ${l}">
          <span class="three-lens-node-toggle ${t?s?"expanded":"":"hidden"}">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M2 1L6 4L2 7z"/></svg>
          </span>
          <span class="three-lens-node-icon ${ue(e.ref.type)}">${me(e.ref.type)}</span>
          <span class="three-lens-node-name ${e.ref.name?"":"unnamed"}">${e.ref.name||"unnamed"}</span>
          ${i?`<span class="three-lens-cost-indicator ${l}" title="Cost: ${i}">${this.getCostIcon(i)}</span>`:""}
          <button class="three-lens-visibility-btn ${a?"visible":"hidden"}" data-id="${e.ref.debugId}" title="${a?"Hide object":"Show object"}">
            ${a?this.getEyeOpenIcon():this.getEyeClosedIcon()}
          </button>
          <span class="three-lens-node-spacer"></span>
          <span class="three-lens-node-type">${e.ref.type}</span>
        </div>
        ${t&&s?`<div class="three-lens-node-children">${e.children.map(c=>this.renderNode(c)).join("")}</div>`:""}
      </div>
    `}getCostIcon(e){switch(e){case"low":return"●";case"medium":return"●";case"high":return"●";case"critical":return"🔥";default:return""}}getEyeOpenIcon(){return`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>`}getEyeClosedIcon(){return`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>`}renderStatsContent(){var i,l,o;const e=this.latestStats;if(!e)return'<div class="three-lens-inspector-empty">Waiting for frame data...</div>';const t=this.latestBenchmark,s=((i=e.performance)==null?void 0:i.fps)??(e.cpuTimeMs>0?Math.round(1e3/e.cpuTimeMs):0),n=((l=e.performance)==null?void 0:l.fpsSmoothed)??s,a=((o=e.performance)==null?void 0:o.fps1PercentLow)??0;return`
      <div class="three-lens-tabs" id="three-lens-stats-tabs">
        <button class="three-lens-tab ${this.statsTab==="overview"?"active":""}" data-tab="overview">Overview</button>
        <button class="three-lens-tab ${this.statsTab==="memory"?"active":""}" data-tab="memory">Memory</button>
        <button class="three-lens-tab ${this.statsTab==="rendering"?"active":""}" data-tab="rendering">Rendering</button>
        <button class="three-lens-tab ${this.statsTab==="timeline"?"active":""}" data-tab="timeline">Frames</button>
        <button class="three-lens-tab ${this.statsTab==="resources"?"active":""}" data-tab="resources">Resources</button>
      </div>
      <div class="three-lens-stats-tab-content" id="three-lens-stats-tab-content">
        ${this.statsTab==="overview"?this.renderOverviewTab(e,t,s,n,a):""}
        ${this.statsTab==="memory"?this.renderMemoryTab(e):""}
        ${this.statsTab==="rendering"?this.renderRenderingTab(e):""}
        ${this.statsTab==="timeline"?this.renderTimelineTab(e):""}
        ${this.statsTab==="resources"?this.renderResourcesTab():""}
      </div>
    `}renderOverviewTab(e,t,s,n,a){var l,o;const i=((l=e.performance)==null?void 0:l.frameBudgetUsed)??e.cpuTimeMs/16.67*100;return((o=e.performance)==null?void 0:o.isSmooth)??e.cpuTimeMs<=18,`
      ${t?this.renderBenchmarkScore(t):""}
      <div class="three-lens-stats-grid">
        <div class="three-lens-stat-card">
          <div class="three-lens-stat-label">FPS</div>
          <div class="three-lens-stat-value ${s<30?"error":s<55?"warning":""}">${s}</div>
        </div>
        <div class="three-lens-stat-card">
          <div class="three-lens-stat-label">CPU Time</div>
          <div class="three-lens-stat-value ${e.cpuTimeMs>16.67?"warning":""}">${e.cpuTimeMs.toFixed(1)}<span class="three-lens-stat-unit">ms</span></div>
        </div>
        ${e.gpuTimeMs!==void 0?`
          <div class="three-lens-stat-card gpu">
            <div class="three-lens-stat-label">GPU Time</div>
            <div class="three-lens-stat-value ${e.gpuTimeMs>16.67?"warning":""}">${e.gpuTimeMs.toFixed(1)}<span class="three-lens-stat-unit">ms</span></div>
          </div>
        `:""}
        <div class="three-lens-stat-card">
          <div class="three-lens-stat-label">Draw Calls</div>
          <div class="three-lens-stat-value ${e.drawCalls>1e3?"warning":""}">${M(e.drawCalls)}</div>
        </div>
        <div class="three-lens-stat-card">
          <div class="three-lens-stat-label">Triangles</div>
          <div class="three-lens-stat-value ${e.triangles>5e5?"warning":""}">${M(e.triangles)}</div>
        </div>
      </div>
      
      <!-- Frame Time Chart -->
      <div class="three-lens-chart">
        <div class="three-lens-chart-header">
          <span class="three-lens-chart-title">Frame Time</span>
          <div class="three-lens-chart-controls">
            <button class="three-lens-chart-btn" id="three-lens-chart-zoom-out" title="Zoom Out">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="2" y1="6" x2="10" y2="6"/>
              </svg>
            </button>
            <span class="three-lens-chart-zoom-label" id="three-lens-chart-zoom-label">${this.getVisibleFrameCount()}f</span>
            <button class="three-lens-chart-btn" id="three-lens-chart-zoom-in" title="Zoom In">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="2" y1="6" x2="10" y2="6"/>
                <line x1="6" y1="2" x2="6" y2="10"/>
              </svg>
            </button>
            <button class="three-lens-chart-btn" id="three-lens-chart-reset" title="Reset View">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M1 4.5a5 5 0 1 1 0 3"/>
                <path d="M1 1v4h4"/>
              </svg>
            </button>
          </div>
          <span class="three-lens-chart-value">${e.cpuTimeMs.toFixed(2)}ms</span>
        </div>
        <div class="three-lens-chart-container" id="three-lens-chart-container">
          <canvas class="three-lens-chart-canvas" id="three-lens-stats-chart"></canvas>
          <div class="three-lens-chart-tooltip" id="three-lens-chart-tooltip" style="display: none;">
            <div class="three-lens-tooltip-time"></div>
            <div class="three-lens-tooltip-fps"></div>
          </div>
        </div>
        <div class="three-lens-chart-stats">
          <div class="three-lens-chart-stat">
            <span class="three-lens-chart-stat-label">Min</span>
            <span class="three-lens-chart-stat-value" id="three-lens-chart-min">${this.getFrameTimeMin().toFixed(1)}ms</span>
          </div>
          <div class="three-lens-chart-stat">
            <span class="three-lens-chart-stat-label">Avg</span>
            <span class="three-lens-chart-stat-value" id="three-lens-chart-avg">${this.getFrameTimeAvg().toFixed(1)}ms</span>
          </div>
          <div class="three-lens-chart-stat">
            <span class="three-lens-chart-stat-label">Max</span>
            <span class="three-lens-chart-stat-value warning" id="three-lens-chart-max">${this.getFrameTimeMax().toFixed(1)}ms</span>
          </div>
          <div class="three-lens-chart-stat">
            <span class="three-lens-chart-stat-label">Jitter</span>
            <span class="three-lens-chart-stat-value" id="three-lens-chart-jitter">${this.getFrameTimeJitter().toFixed(1)}ms</span>
          </div>
        </div>
          </div>
      
      <!-- FPS Histogram -->
      ${this.renderFpsHistogram()}
      
      <!-- Frame Time Percentiles -->
      ${this.renderFrameTimePercentiles(n,a,i)}
      
      <!-- Frame Budget Gauge -->
      ${this.renderFrameBudgetGauge(e,i)}
      
      <!-- Bottleneck Analysis -->
      ${this.renderBottleneckAnalysis(e)}
      
      <!-- Session Statistics -->
      ${this.renderSessionStatistics()}
      
      <!-- Rule Violations -->
      ${this.renderRuleViolations()}
      
      ${t&&t.topIssues.length>0?this.renderIssues(t):""}
    `}renderRuleViolations(){const e=this.probe.getRecentViolations(),t=this.probe.getViolationSummary();if(e.length===0)return"";const s=e.slice(-10).reverse();return`
      <div class="three-lens-rule-violations">
        <div class="three-lens-rule-violations-header">
          <span class="three-lens-rule-violations-title">⚠ Rule Violations</span>
          <div class="three-lens-rule-violations-badges">
            ${t.errors>0?`<span class="three-lens-violation-badge error">${t.errors}</span>`:""}
            ${t.warnings>0?`<span class="three-lens-violation-badge warning">${t.warnings}</span>`:""}
          </div>
          <button class="three-lens-action-btn small" data-action="clear-violations" title="Clear violations">✕</button>
          </div>
        <div class="three-lens-rule-violations-list">
          ${s.map(n=>`
            <div class="three-lens-violation-item ${n.severity}">
              <span class="three-lens-violation-severity">${this.getViolationIcon(n.severity)}</span>
              <span class="three-lens-violation-message">${n.message}</span>
              <span class="three-lens-violation-time">${this.formatViolationTime(n.timestamp)}</span>
        </div>
          `).join("")}
      </div>
        ${e.length>10?`<div class="three-lens-violations-more">+ ${e.length-10} more violations...</div>`:""}
      </div>
    `}getViolationIcon(e){switch(e){case"error":return"🔴";case"warning":return"🟡";case"info":return"🔵";default:return"⚪"}}formatViolationTime(e){const t=performance.now()-e;return t<1e3?"now":t<6e4?`${Math.round(t/1e3)}s`:`${Math.round(t/6e4)}m`}renderFpsHistogram(){const e=Math.max(...this.fpsHistogram,1),t=this.fpsHistogram.reduce((n,a)=>n+a,0);if(t<10)return`
        <div class="three-lens-histogram">
          <div class="three-lens-histogram-title">FPS Distribution</div>
          <div class="three-lens-histogram-empty">Collecting data...</div>
          </div>
      `;const s=["0-5","5-10","10-15","15-20","20-25","25-30","30-35","35-40","40-45","45-50","50-55","55+"];return`
      <div class="three-lens-histogram">
        <div class="three-lens-histogram-header">
          <div class="three-lens-histogram-title">FPS Distribution</div>
          <div class="three-lens-histogram-total">${t} frames</div>
          </div>
        <div class="three-lens-histogram-chart">
          ${this.fpsHistogram.map((n,a)=>{const i=n/e*100,l=t>0?(n/t*100).toFixed(1):0,o=a>=10,d=a>=6&&a<10,c=o?"good":d?"ok":"bad";return`
              <div class="three-lens-histogram-bar-wrapper" title="${s[a]} FPS: ${n} frames (${l}%)">
                <div class="three-lens-histogram-bar ${c}" style="height: ${i}%"></div>
                <div class="three-lens-histogram-label">${a===11?"55+":a*5}</div>
        </div>
            `}).join("")}
      </div>
        <div class="three-lens-histogram-legend">
          <span class="three-lens-histogram-legend-item bad">●&nbsp;Slow</span>
          <span class="three-lens-histogram-legend-item ok">●&nbsp;Okay</span>
          <span class="three-lens-histogram-legend-item good">●&nbsp;Smooth</span>
        </div>
      </div>
    `}renderFrameTimePercentiles(e,t,s){return`
      <div class="three-lens-percentiles-section">
        <div class="three-lens-percentiles-title">Frame Time Percentiles</div>
        <div class="three-lens-percentiles-grid">
          <div class="three-lens-percentile-item">
            <div class="three-lens-percentile-label">P50</div>
            <div class="three-lens-percentile-value">${this.frameTimePercentiles.p50.toFixed(1)}ms</div>
          </div>
          <div class="three-lens-percentile-item">
            <div class="three-lens-percentile-label">P90</div>
            <div class="three-lens-percentile-value ${this.frameTimePercentiles.p90>16.67?"warning":""}">${this.frameTimePercentiles.p90.toFixed(1)}ms</div>
          </div>
          <div class="three-lens-percentile-item">
            <div class="three-lens-percentile-label">P95</div>
            <div class="three-lens-percentile-value ${this.frameTimePercentiles.p95>16.67?"warning":""}">${this.frameTimePercentiles.p95.toFixed(1)}ms</div>
          </div>
          <div class="three-lens-percentile-item">
            <div class="three-lens-percentile-label">P99</div>
            <div class="three-lens-percentile-value ${this.frameTimePercentiles.p99>33.33?"error":this.frameTimePercentiles.p99>16.67?"warning":""}">${this.frameTimePercentiles.p99.toFixed(1)}ms</div>
          </div>
        </div>
        <div class="three-lens-percentiles-summary">
          <div class="three-lens-percentile-summary-item">
            <span class="three-lens-percentile-summary-label">Avg FPS:</span>
            <span class="three-lens-percentile-summary-value">${e}</span>
          </div>
          <div class="three-lens-percentile-summary-item">
            <span class="three-lens-percentile-summary-label">1% Low:</span>
            <span class="three-lens-percentile-summary-value">${Math.round(t)}</span>
          </div>
          <div class="three-lens-percentile-summary-item">
            <span class="three-lens-percentile-summary-label">Budget:</span>
            <span class="three-lens-percentile-summary-value ${s>100?"warning":""}">${s.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    `}renderBottleneckAnalysis(e){const t=[];if(e.drawCalls>500){const n=e.drawCalls>1e3?"high":e.drawCalls>750?"medium":"low";t.push({type:"Draw Calls",severity:n,message:`${e.drawCalls} draw calls per frame`,suggestion:"Consider using instancing, merging geometries, or LOD"})}if(e.triangles>1e6){const n=e.triangles>2e6?"high":e.triangles>15e5?"medium":"low";t.push({type:"Geometry",severity:n,message:`${M(e.triangles)} triangles`,suggestion:"Use LOD, occlusion culling, or reduce mesh complexity"})}const s=e.rendering;return s&&(s.shadowCastingLights>2&&t.push({type:"Shadows",severity:s.shadowCastingLights>4?"high":"medium",message:`${s.shadowCastingLights} shadow-casting lights`,suggestion:"Reduce shadow-casting lights or use baked shadows"}),s.skinnedMeshes>10&&t.push({type:"Animation",severity:s.skinnedMeshes>20?"high":"medium",message:`${s.skinnedMeshes} skinned meshes with ${s.totalBones} bones`,suggestion:"Use LOD for animated characters or reduce bone counts"}),s.transparentObjects>50&&t.push({type:"Transparency",severity:s.transparentObjects>100?"high":"medium",message:`${s.transparentObjects} transparent objects`,suggestion:"Reduce transparent objects or use alpha cutout"})),e.memory&&e.memory.textureMemory>256*1048576&&t.push({type:"Texture Memory",severity:e.memory.textureMemory>512*1048576?"high":"medium",message:`${y(e.memory.textureMemory)} texture memory`,suggestion:"Use compressed textures (KTX2/Basis) or reduce texture sizes"}),t.length===0?`
        <div class="three-lens-bottleneck-section">
          <div class="three-lens-bottleneck-title">Bottleneck Analysis</div>
          <div class="three-lens-bottleneck-ok">
            <span class="three-lens-bottleneck-ok-icon">✓</span>
            <span>No significant bottlenecks detected</span>
          </div>
        </div>
      `:`
      <div class="three-lens-bottleneck-section">
        <div class="three-lens-bottleneck-title">Bottleneck Analysis</div>
        <div class="three-lens-bottleneck-list">
          ${t.map(n=>`
            <div class="three-lens-bottleneck-item ${n.severity}">
              <div class="three-lens-bottleneck-header">
                <span class="three-lens-bottleneck-type">${n.type}</span>
                <span class="three-lens-bottleneck-severity ${n.severity}">${n.severity.toUpperCase()}</span>
              </div>
              <div class="three-lens-bottleneck-message">${n.message}</div>
              <div class="three-lens-bottleneck-suggestion">💡 ${n.suggestion}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `}renderFrameBudgetGauge(e,t){const n=e.cpuTimeMs,a=Math.max(0,16.67-n),i=n>16.67,l=Math.min(180,n/(16.67*2)*180);let o="excellent",d="Excellent";return t>120?(o="critical",d="Critical"):t>100?(o="over",d="Over Budget"):t>80?(o="warning",d="Warning"):t>60&&(o="good",d="Good"),`
      <div class="three-lens-budget-gauge">
        <div class="three-lens-budget-gauge-header">
          <div class="three-lens-budget-gauge-title">Frame Budget</div>
          <div class="three-lens-budget-gauge-target">Target: ${16.67.toFixed(2)}ms (60 FPS)</div>
        </div>
        <div class="three-lens-budget-gauge-visual">
          <svg viewBox="0 0 200 110" class="three-lens-gauge-svg">
            <!-- Background arc -->
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--3lens-bg-primary)" stroke-width="12" stroke-linecap="round"/>
            <!-- Colored segments -->
            <path d="M 20 100 A 80 80 0 0 1 65 32" fill="none" stroke="var(--3lens-accent-emerald)" stroke-width="12" stroke-linecap="round" opacity="0.3"/>
            <path d="M 65 32 A 80 80 0 0 1 100 20" fill="none" stroke="var(--3lens-accent-cyan)" stroke-width="12" stroke-linecap="round" opacity="0.3"/>
            <path d="M 100 20 A 80 80 0 0 1 135 32" fill="none" stroke="var(--3lens-warning)" stroke-width="12" stroke-linecap="round" opacity="0.3"/>
            <path d="M 135 32 A 80 80 0 0 1 180 100" fill="none" stroke="var(--3lens-error)" stroke-width="12" stroke-linecap="round" opacity="0.3"/>
            <!-- Needle -->
            <line x1="100" y1="100" x2="${100+60*Math.cos((l-180)*Math.PI/180)}" y2="${100+60*Math.sin((l-180)*Math.PI/180)}" 
                  stroke="var(--3lens-text-primary)" stroke-width="3" stroke-linecap="round"/>
            <circle cx="100" cy="100" r="6" fill="var(--3lens-text-primary)"/>
          </svg>
          <div class="three-lens-budget-gauge-value ${o}">
            <span class="three-lens-budget-gauge-number">${n.toFixed(2)}</span>
            <span class="three-lens-budget-gauge-unit">ms</span>
          </div>
        </div>
        <div class="three-lens-budget-gauge-footer">
          <div class="three-lens-budget-gauge-status ${o}">${d}</div>
          <div class="three-lens-budget-gauge-remaining">
            ${i?`<span class="over">+${(n-16.67).toFixed(2)}ms over</span>`:`<span class="under">${a.toFixed(2)}ms remaining</span>`}
          </div>
        </div>
        <div class="three-lens-budget-gauge-breakdown">
          <div class="three-lens-budget-bar">
            <div class="three-lens-budget-bar-fill ${o}" style="width: ${Math.min(100,t)}%"></div>
            ${t>100?`<div class="three-lens-budget-bar-over" style="width: ${Math.min(50,t-100)}%"></div>`:""}
          </div>
          <div class="three-lens-budget-labels">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
            <span>150%</span>
          </div>
        </div>
      </div>
    `}renderSessionStatistics(){const e=(performance.now()-this.sessionStartTime)/1e3,t=this.totalFramesRendered/e,s=this.totalFramesRendered>0?this.smoothFrameCount/this.totalFramesRendered*100:100;return`
      <div class="three-lens-session">
        <div class="three-lens-session-header">
          <div class="three-lens-session-title">Session Statistics</div>
          <div class="three-lens-session-duration">${(a=>{const i=Math.floor(a/60),l=Math.floor(a%60);return i>0?`${i}m ${l}s`:`${l}s`})(e)}</div>
        </div>
        <div class="three-lens-session-grid">
          <div class="three-lens-session-stat">
            <div class="three-lens-session-stat-value">${M(this.totalFramesRendered)}</div>
            <div class="three-lens-session-stat-label">Total Frames</div>
          </div>
          <div class="three-lens-session-stat">
            <div class="three-lens-session-stat-value">${t.toFixed(1)}</div>
            <div class="three-lens-session-stat-label">Avg FPS</div>
          </div>
          <div class="three-lens-session-stat">
            <div class="three-lens-session-stat-value ${s<90?"warning":""}">${s.toFixed(1)}%</div>
            <div class="three-lens-session-stat-label">Smooth Frames</div>
          </div>
          <div class="three-lens-session-stat">
            <div class="three-lens-session-stat-value">${this.droppedFrameCount}</div>
            <div class="three-lens-session-stat-label">Dropped</div>
          </div>
        </div>
        <div class="three-lens-session-peaks">
          <div class="three-lens-session-peak">
            <span class="three-lens-session-peak-label">Peak FPS</span>
            <span class="three-lens-session-peak-value">${this.peakFps.toFixed(0)}</span>
          </div>
          <div class="three-lens-session-peak">
            <span class="three-lens-session-peak-label">Lowest FPS</span>
            <span class="three-lens-session-peak-value ${this.lowestFps<30?"warning":""}">${this.lowestFps===1/0?"--":this.lowestFps.toFixed(0)}</span>
          </div>
          <div class="three-lens-session-peak">
            <span class="three-lens-session-peak-label">Peak Draw Calls</span>
            <span class="three-lens-session-peak-value">${this.peakDrawCalls}</span>
          </div>
          <div class="three-lens-session-peak">
            <span class="three-lens-session-peak-label">Peak Triangles</span>
            <span class="three-lens-session-peak-value">${M(this.peakTriangles)}</span>
          </div>
          <div class="three-lens-session-peak">
            <span class="three-lens-session-peak-label">Peak Memory</span>
            <span class="three-lens-session-peak-value">${y(this.peakMemory)}</span>
          </div>
        </div>
      </div>
    `}renderBenchmarkScore(e){const t=s=>s>=80?"good":s>=50?"ok":"bad";return`
      <div class="three-lens-benchmark">
        <div class="three-lens-benchmark-header">
          <div class="three-lens-benchmark-score">
            <span class="three-lens-benchmark-value grade-${e.grade}">${e.overall}</span>
            <span class="three-lens-benchmark-label">/ 100</span>
          </div>
          <div class="three-lens-benchmark-grade ${e.grade}">${e.grade}</div>
        </div>
        <div class="three-lens-benchmark-bars">
          <div class="three-lens-benchmark-bar">
            <span class="three-lens-benchmark-bar-label">Timing</span>
            <div class="three-lens-benchmark-bar-track">
              <div class="three-lens-benchmark-bar-fill ${t(e.breakdown.timing)}" style="width: ${e.breakdown.timing}%"></div>
            </div>
            <span class="three-lens-benchmark-bar-value">${e.breakdown.timing}</span>
          </div>
          <div class="three-lens-benchmark-bar">
            <span class="three-lens-benchmark-bar-label">Draw Calls</span>
            <div class="three-lens-benchmark-bar-track">
              <div class="three-lens-benchmark-bar-fill ${t(e.breakdown.drawCalls)}" style="width: ${e.breakdown.drawCalls}%"></div>
            </div>
            <span class="three-lens-benchmark-bar-value">${e.breakdown.drawCalls}</span>
          </div>
          <div class="three-lens-benchmark-bar">
            <span class="three-lens-benchmark-bar-label">Geometry</span>
            <div class="three-lens-benchmark-bar-track">
              <div class="three-lens-benchmark-bar-fill ${t(e.breakdown.geometry)}" style="width: ${e.breakdown.geometry}%"></div>
            </div>
            <span class="three-lens-benchmark-bar-value">${e.breakdown.geometry}</span>
          </div>
          <div class="three-lens-benchmark-bar">
            <span class="three-lens-benchmark-bar-label">Memory</span>
            <div class="three-lens-benchmark-bar-track">
              <div class="three-lens-benchmark-bar-fill ${t(e.breakdown.memory)}" style="width: ${e.breakdown.memory}%"></div>
            </div>
            <span class="three-lens-benchmark-bar-value">${e.breakdown.memory}</span>
          </div>
          <div class="three-lens-benchmark-bar">
            <span class="three-lens-benchmark-bar-label">State Chg</span>
            <div class="three-lens-benchmark-bar-track">
              <div class="three-lens-benchmark-bar-fill ${t(e.breakdown.stateChanges)}" style="width: ${e.breakdown.stateChanges}%"></div>
            </div>
            <span class="three-lens-benchmark-bar-value">${e.breakdown.stateChanges}</span>
          </div>
        </div>
      </div>
    `}renderIssues(e){return e.topIssues.length===0&&e.suggestions.length===0?"":`
      <div class="three-lens-issues">
        ${e.topIssues.map(t=>`
          <div class="three-lens-issue warning">
            <span class="three-lens-issue-icon">⚠️</span>
            <span class="three-lens-issue-text">${t}</span>
          </div>
        `).join("")}
        ${e.suggestions.slice(0,2).map(t=>`
          <div class="three-lens-suggestion">
            <span class="three-lens-issue-icon">💡</span>
            <span class="three-lens-suggestion-text">${t}</span>
          </div>
        `).join("")}
      </div>
    `}renderMemoryTab(e){const t=e.memory;if(!t)return'<div class="three-lens-inspector-empty">Memory stats not available</div>';const s=t.totalGpuMemory||1,n=Math.round(t.textureMemory/s*100),a=Math.round(t.geometryMemory/s*100),i=Math.round(t.renderTargetMemory/s*100),l=1024*1024,o=t.textureMemory>256*l,d=t.geometryMemory>128*l,c=t.totalGpuMemory>512*l,p=this.memoryHistory.length>0?this.memoryHistory.reduce((u,m)=>u+m.totalGpu,0)/this.memoryHistory.length:t.totalGpuMemory,g=t.totalGpuMemory>p*1.1?"rising":t.totalGpuMemory<p*.9?"falling":"stable";return`
      <div class="three-lens-memory-profiler">
        <!-- Total GPU Memory Header -->
        <div class="three-lens-memory-header">
            <div class="three-lens-memory-total">
              <div class="three-lens-memory-total-value ${c?"warning":""}">${y(t.totalGpuMemory)}</div>
              <div class="three-lens-memory-total-label">Total GPU Memory</div>
          </div>
            <div class="three-lens-memory-trend ${g}">
              ${g==="rising"?"↗ Rising":g==="falling"?"↘ Falling":"→ Stable"}
          </div>
          </div>

          <!-- Memory Breakdown Bar -->
          <div class="three-lens-memory-breakdown">
            <div class="three-lens-memory-breakdown-title">Memory Breakdown</div>
            <div class="three-lens-memory-bar">
              <div class="three-lens-memory-bar-segment texture" style="width: ${n}%" title="Textures: ${y(t.textureMemory)}"></div>
              <div class="three-lens-memory-bar-segment geometry" style="width: ${a}%" title="Geometry: ${y(t.geometryMemory)}"></div>
              <div class="three-lens-memory-bar-segment render-target" style="width: ${i}%" title="Render Targets: ${y(t.renderTargetMemory)}"></div>
          </div>
            <div class="three-lens-memory-legend">
              <div class="three-lens-memory-legend-item">
                <span class="three-lens-memory-legend-color texture"></span>
                <span class="three-lens-memory-legend-label">Textures</span>
                <span class="three-lens-memory-legend-value ${o?"warning":""}">${y(t.textureMemory)}</span>
        </div>
              <div class="three-lens-memory-legend-item">
                <span class="three-lens-memory-legend-color geometry"></span>
                <span class="three-lens-memory-legend-label">Geometry</span>
                <span class="three-lens-memory-legend-value ${d?"warning":""}">${y(t.geometryMemory)}</span>
      </div>
              <div class="three-lens-memory-legend-item">
                <span class="three-lens-memory-legend-color render-target"></span>
                <span class="three-lens-memory-legend-label">Render Targets</span>
                <span class="three-lens-memory-legend-value">${y(t.renderTargetMemory)}</span>
              </div>
            </div>
          </div>

          <!-- Memory History Chart -->
          ${this.renderMemoryHistoryChart()}

          <!-- Resource Counts -->
      <div class="three-lens-metrics-section">
        <div class="three-lens-metrics-title">Resource Counts</div>
        <div class="three-lens-metrics-grid">
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${t.geometries}</div>
            <div class="three-lens-metric-label">Geometries</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${t.textures}</div>
            <div class="three-lens-metric-label">Textures</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${t.programs}</div>
                <div class="three-lens-metric-label">Shaders</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${t.renderTargets}</div>
            <div class="three-lens-metric-label">RT</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${e.objectsTotal}</div>
            <div class="three-lens-metric-label">Objects</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${e.materialsUsed}</div>
            <div class="three-lens-metric-label">Materials</div>
          </div>
        </div>
      </div>

          <!-- Memory Efficiency Analysis -->
          ${this.renderMemoryEfficiency(t,e)}
          
          <!-- Memory Per Category Breakdown -->
          ${this.renderMemoryCategoryDetails(t)}

          <!-- JS Heap (if available) -->
          ${t.jsHeapSize?this.renderJsHeapSection(t.jsHeapSize,t.jsHeapLimit??0):""}
          
          <!-- Memory Tips -->
          ${this.renderMemoryTips(t,e)}

        <!-- Memory Warnings -->
        ${this.renderMemoryWarnings(t,e)}
            </div>
    `}renderMemoryEfficiency(e,t){const s=t.objectsTotal>0?e.totalGpuMemory/t.objectsTotal:0,n=e.textures>0?e.textureMemory/e.textures:0,a=e.geometries>0?e.geometryMemory/e.geometries:0,i=1024*1024;let l=100;e.totalGpuMemory>512*i?l-=30:e.totalGpuMemory>256*i&&(l-=15),n>4*i?l-=20:n>2*i&&(l-=10),e.geometries>100&&(l-=15),e.textures>50&&(l-=10),l=Math.max(0,l);const o=l>=80?"A":l>=60?"B":l>=40?"C":l>=20?"D":"F",d=o==="A"?"var(--3lens-accent-emerald)":o==="B"?"var(--3lens-accent-cyan)":o==="C"?"var(--3lens-accent-amber)":"var(--3lens-error)";return`
      <div class="three-lens-memory-efficiency">
        <div class="three-lens-memory-efficiency-header">
          <div class="three-lens-memory-efficiency-title">Memory Efficiency</div>
          <div class="three-lens-memory-efficiency-grade" style="color: ${d};">${o}</div>
            </div>
        <div class="three-lens-memory-efficiency-grid">
          <div class="three-lens-memory-efficiency-item">
            <div class="three-lens-memory-efficiency-value">${y(s)}</div>
            <div class="three-lens-memory-efficiency-label">Avg per Object</div>
          </div>
          <div class="three-lens-memory-efficiency-item">
            <div class="three-lens-memory-efficiency-value">${y(n)}</div>
            <div class="three-lens-memory-efficiency-label">Avg Texture Size</div>
          </div>
          <div class="three-lens-memory-efficiency-item">
            <div class="three-lens-memory-efficiency-value">${y(a)}</div>
            <div class="three-lens-memory-efficiency-label">Avg Geometry Size</div>
          </div>
        </div>
        <div class="three-lens-memory-efficiency-bar">
          <div class="three-lens-memory-efficiency-fill" style="width: ${l}%; background: ${d};"></div>
        </div>
        <div class="three-lens-memory-efficiency-score">${l}/100</div>
      </div>
    `}renderMemoryCategoryDetails(e){const n=this.probe.getTextures(),a=this.probe.getGeometries();let i=0,l=0,o=0,d={name:"",size:0,dimensions:""};for(const v of n)v.estimatedMemoryBytes<512*1024?i++:v.estimatedMemoryBytes<2*1048576?l++:o++,v.estimatedMemoryBytes>d.size&&(d={name:v.name||"unnamed",size:v.estimatedMemoryBytes,dimensions:`${v.width}×${v.height}`});n.length===0&&e.textures>0&&(i=Math.floor(e.textures*.6),l=Math.floor(e.textures*.3),o=e.textures-i-l);let c=0,p=0,g=0,u={name:"",vertices:0,faces:0};for(const v of a)v.vertexCount<1e3?c++:v.vertexCount<1e4?p++:g++,v.vertexCount>u.vertices&&(u={name:v.name||v.type,vertices:v.vertexCount,faces:v.faceCount});const m=n.length||e.textures,f=a.length||e.geometries;return`
      <div class="three-lens-memory-categories">
        <div class="three-lens-memory-categories-title">Memory Distribution</div>
        
        <!-- Texture Size Distribution -->
        <div class="three-lens-memory-category">
          <div class="three-lens-memory-category-header">
            <span class="three-lens-memory-category-icon">🖼️</span>
            <span class="three-lens-memory-category-name">Textures</span>
            <span class="three-lens-memory-category-count">${m}</span>
          </div>
          <div class="three-lens-memory-category-bar">
            <div class="three-lens-memory-category-segment small" style="flex: ${i||1}" title="Small (<512KB): ${i}"></div>
            <div class="three-lens-memory-category-segment medium" style="flex: ${l||0}" title="Medium (512KB-2MB): ${l}"></div>
            <div class="three-lens-memory-category-segment large" style="flex: ${o||0}" title="Large (>2MB): ${o}"></div>
          </div>
          <div class="three-lens-memory-category-legend">
            <span class="small">● Small (${i})</span>
            <span class="medium">● Medium (${l})</span>
            <span class="large">● Large (${o})</span>
          </div>
          ${d.size>0?`
            <div class="three-lens-memory-category-largest">
              Largest: <strong>${d.name}</strong> (${d.dimensions}, ${y(d.size)})
        </div>
      `:""}
        </div>
        
        <!-- Geometry Complexity Distribution -->
        <div class="three-lens-memory-category">
          <div class="three-lens-memory-category-header">
            <span class="three-lens-memory-category-icon">📐</span>
            <span class="three-lens-memory-category-name">Geometries</span>
            <span class="three-lens-memory-category-count">${f}</span>
          </div>
          ${a.length>0?`
            <div class="three-lens-memory-category-bar">
              <div class="three-lens-memory-category-segment small" style="flex: ${c||1}" title="Simple (<1K verts): ${c}"></div>
              <div class="three-lens-memory-category-segment medium" style="flex: ${p||0}" title="Medium (1K-10K verts): ${p}"></div>
              <div class="three-lens-memory-category-segment large" style="flex: ${g||0}" title="Complex (>10K verts): ${g}"></div>
            </div>
            <div class="three-lens-memory-category-legend">
              <span class="small">● Simple (${c})</span>
              <span class="medium">● Medium (${p})</span>
              <span class="large">● Complex (${g})</span>
            </div>
            ${u.vertices>0?`
              <div class="three-lens-memory-category-largest">
                Largest: <strong>${u.name}</strong> (${M(u.vertices)} verts, ${M(u.faces)} faces)
              </div>
            `:""}
          `:`
            <div class="three-lens-memory-category-details">
              <div class="three-lens-memory-category-detail">
                <span class="label">Total Memory</span>
                <span class="value">${y(e.geometryMemory)}</span>
              </div>
              <div class="three-lens-memory-category-detail">
                <span class="label">Avg Size</span>
                <span class="value">${y(e.geometries>0?e.geometryMemory/e.geometries:0)}</span>
              </div>
            </div>
          `}
        </div>
        
        <!-- Programs/Shaders -->
        <div class="three-lens-memory-category">
          <div class="three-lens-memory-category-header">
            <span class="three-lens-memory-category-icon">⚡</span>
            <span class="three-lens-memory-category-name">Shader Programs</span>
            <span class="three-lens-memory-category-count">${e.programs}</span>
          </div>
          <div class="three-lens-memory-category-note">
            ${e.programs>20?"⚠️ Many unique shaders may impact performance":"✓ Reasonable number of shader variants"}
          </div>
        </div>
        
        <!-- Render Targets -->
        ${e.renderTargets>0?`
          <div class="three-lens-memory-category">
            <div class="three-lens-memory-category-header">
              <span class="three-lens-memory-category-icon">🎯</span>
              <span class="three-lens-memory-category-name">Render Targets</span>
              <span class="three-lens-memory-category-count">${e.renderTargets}</span>
            </div>
            <div class="three-lens-memory-category-details">
              <div class="three-lens-memory-category-detail">
                <span class="label">Memory</span>
                <span class="value">${y(e.renderTargetMemory)}</span>
              </div>
              <div class="three-lens-memory-category-detail">
                <span class="label">Avg Size</span>
                <span class="value">${y(e.renderTargets>0?e.renderTargetMemory/e.renderTargets:0)}</span>
              </div>
            </div>
          </div>
        `:""}
      </div>
    `}renderMemoryTips(e,t){const s=[];if(e.textureMemory>128*1048576&&e.textures>10&&s.push({icon:"🗜️",tip:"Use KTX2/Basis texture compression to reduce texture memory by 75%+",priority:"high"}),e.geometries>50&&s.push({icon:"🔗",tip:"Consider merging static geometries with BufferGeometryUtils.mergeBufferGeometries()",priority:"medium"}),e.textures>30&&s.push({icon:"🎨",tip:"Use texture atlases to reduce texture count and draw calls",priority:"medium"}),t.objectsTotal>1e3&&e.geometryMemory>64*1048576&&s.push({icon:"📏",tip:"Implement LOD (Level of Detail) for distant objects",priority:"high"}),e.programs>15&&s.push({icon:"⚙️",tip:"Reduce shader variants by sharing materials when possible",priority:"low"}),e.renderTargets>5&&s.push({icon:"🎯",tip:"Consolidate post-processing passes to reduce render target memory",priority:"medium"}),this.memoryHistory.length>=10){const a=this.memoryHistory[0].totalGpu;this.memoryHistory[this.memoryHistory.length-1].totalGpu>a*1.5&&s.push({icon:"🔍",tip:"Memory is growing - check for texture/geometry leaks. Dispose unused resources.",priority:"high"})}return s.length===0?"":(s.sort((a,i)=>{const l={high:0,medium:1,low:2};return l[a.priority]-l[i.priority]}),`
      <div class="three-lens-memory-tips">
        <div class="three-lens-memory-tips-title">💡 Optimization Tips</div>
        <div class="three-lens-memory-tips-list">
          ${s.slice(0,4).map(a=>`
            <div class="three-lens-memory-tip ${a.priority}">
              <span class="three-lens-memory-tip-icon">${a.icon}</span>
              <span class="three-lens-memory-tip-text">${a.tip}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `)}renderMemoryHistoryChart(){if(this.memoryHistory.length<2)return`
        <div class="three-lens-memory-chart">
          <div class="three-lens-memory-chart-title">Memory Over Time</div>
          <div class="three-lens-memory-chart-empty">Collecting data...</div>
        </div>
      `;const e=Math.max(...this.memoryHistory.map(o=>o.totalGpu),1),t=48,s=300,n=s/Math.max(this.memoryHistory.length-1,1),a=this.memoryHistory.map((o,d)=>{const c=d*n,p=t-o.totalGpu/e*t;return`${c},${p}`}),i=`M${a.join(" L")}`,l=`M0,${t} L${a.join(" L")} L${s},${t} Z`;return`
      <div class="three-lens-memory-chart">
        <div class="three-lens-memory-chart-header">
          <div class="three-lens-memory-chart-title">Memory Over Time</div>
          <div class="three-lens-memory-chart-max">${y(e)}</div>
        </div>
        <svg class="three-lens-memory-chart-svg" viewBox="0 0 ${s} ${t}" preserveAspectRatio="none">
          <defs>
            <linearGradient id="memoryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color: var(--3lens-accent-cyan); stop-opacity: 0.4"/>
              <stop offset="100%" style="stop-color: var(--3lens-accent-cyan); stop-opacity: 0.05"/>
            </linearGradient>
          </defs>
          <path class="three-lens-memory-chart-area" d="${l}" fill="url(#memoryGradient)"/>
          <path class="three-lens-memory-chart-line" d="${i}" fill="none" stroke="var(--3lens-accent-cyan)" stroke-width="1.5"/>
        </svg>
        <div class="three-lens-memory-chart-labels">
          <span>60s ago</span>
          <span>Now</span>
        </div>
      </div>
    `}renderJsHeapSection(e,t){const s=t>0?Math.round(e/t*100):0,n=s>80;return`
      <div class="three-lens-metrics-section">
        <div class="three-lens-metrics-title">JavaScript Heap</div>
        <div class="three-lens-heap-container">
          <div class="three-lens-heap-bar">
            <div class="three-lens-heap-bar-fill ${n?"warning":""}" style="width: ${s}%"></div>
          </div>
          <div class="three-lens-heap-stats">
            <span class="three-lens-heap-used ${n?"warning":""}">${y(e)}</span>
            <span class="three-lens-heap-separator">/</span>
            <span class="three-lens-heap-limit">${y(t)}</span>
            <span class="three-lens-heap-percent ${n?"warning":""}">(${s}%)</span>
          </div>
        </div>
      </div>
    `}renderMemoryWarnings(e,t){const s=[];if(e.textureMemory>256*1048576&&s.push(`High texture memory: ${y(e.textureMemory)}. Consider using compressed textures or reducing texture sizes.`),e.geometryMemory>128*1048576&&s.push(`High geometry memory: ${y(e.geometryMemory)}. Consider using LOD or geometry instancing.`),e.totalGpuMemory>512*1048576&&s.push(`Total GPU memory is high: ${y(e.totalGpuMemory)}. May cause performance issues on lower-end devices.`),e.textures>50&&s.push(`Many textures loaded (${e.textures}). Consider using texture atlases.`),e.geometries>100&&s.push(`Many geometries (${e.geometries}). Consider merging static meshes.`),this.memoryHistory.length>=10){const a=this.memoryHistory.slice(-10);a.every((l,o)=>o===0||l.totalGpu>=a[o-1].totalGpu)&&a[a.length-1].totalGpu>a[0].totalGpu*1.2&&s.push("⚠️ Memory appears to be continuously increasing. Possible memory leak detected.")}return s.length===0?"":`
      <div class="three-lens-memory-warnings">
        <div class="three-lens-memory-warnings-title">⚠ Memory Warnings</div>
        ${s.map(a=>`<div class="three-lens-memory-warning">${a}</div>`).join("")}
      </div>
    `}renderRenderingTab(e){const t=e.rendering,s=e.performance;return t?`
      <div class="three-lens-rendering-profiler">
        <!-- Render Pipeline Visualization -->
        ${this.renderPipelineVisualization(e,t)}
        
        <!-- Draw Call Efficiency -->
        ${this.renderDrawCallEfficiency(e,s)}
        
        <!-- Geometry Statistics -->
      <div class="three-lens-metrics-section">
          <div class="three-lens-metrics-title">Geometry Statistics</div>
        <div class="three-lens-metrics-grid">
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${M(e.triangles)}</div>
            <div class="three-lens-metric-label">Triangles</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${M(e.vertices)}</div>
            <div class="three-lens-metric-label">Vertices</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${e.drawCalls}</div>
            <div class="three-lens-metric-label">Draw Calls</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${(s==null?void 0:s.trianglesPerDrawCall)??0}</div>
            <div class="three-lens-metric-label">Tri/Call</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${e.points}</div>
            <div class="three-lens-metric-label">Points</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${e.lines}</div>
            <div class="three-lens-metric-label">Lines</div>
          </div>
        </div>
      </div>
        
        <!-- Object Visibility Breakdown -->
        ${this.renderObjectVisibilityBreakdown(e,t)}
        
        <!-- Lighting Analysis -->
        ${this.renderLightingAnalysis(t)}
        
        <!-- Animation & Instancing -->
        ${this.renderAnimationInstancing(t)}
        
        <!-- State Changes Analysis -->
        ${this.renderStateChangesAnalysis(t)}
        
        ${t.xrActive?this.renderXRInfo(t):""}
        
        <!-- Rendering Warnings -->
        ${this.renderRenderingWarnings(e,t)}
          </div>
    `:'<div class="three-lens-inspector-empty">Rendering stats not available</div>'}renderPipelineVisualization(e,t){const s=e.cpuTimeMs,n=t.shadowCastingLights*.5,a=s*.6,i=t.transparentObjects>0?s*.2:0,l=t.postProcessingPasses*.3,o=[{name:"Shadow Pass",time:n,color:"#8b5cf6",active:t.shadowCastingLights>0},{name:"Opaque",time:a,color:"#3b82f6",active:!0},{name:"Transparent",time:i,color:"#22d3ee",active:t.transparentObjects>0},{name:"Post-Process",time:l,color:"#f59e0b",active:t.postProcessingPasses>0}].filter(c=>c.active),d=o.reduce((c,p)=>c+p.time,0);return`
      <div class="three-lens-pipeline">
        <div class="three-lens-pipeline-header">
          <div class="three-lens-pipeline-title">Render Pipeline</div>
          <div class="three-lens-pipeline-time">${s.toFixed(2)}ms total</div>
          </div>
        <div class="three-lens-pipeline-bar">
          ${o.map(c=>`<div class="three-lens-pipeline-segment" style="width: ${d>0?c.time/d*100:0}%; background: ${c.color};" title="${c.name}: ~${c.time.toFixed(1)}ms"></div>`).join("")}
          </div>
        <div class="three-lens-pipeline-legend">
          ${o.map(c=>`
            <div class="three-lens-pipeline-legend-item">
              <span class="three-lens-pipeline-legend-color" style="background: ${c.color};"></span>
              <span class="three-lens-pipeline-legend-label">${c.name}</span>
        </div>
          `).join("")}
      </div>
          </div>
    `}renderDrawCallEfficiency(e,t){const s=(t==null?void 0:t.trianglesPerDrawCall)??(e.drawCalls>0?e.triangles/e.drawCalls:0),n=(t==null?void 0:t.drawCallEfficiency)??Math.min(100,s/100);let a="A",i="var(--3lens-accent-emerald)";n<25?(a="F",i="var(--3lens-error)"):n<50?(a="D",i="var(--3lens-warning)"):n<65?(a="C",i="var(--3lens-accent-amber)"):n<80&&(a="B",i="var(--3lens-accent-cyan)");const l=this.drawCallHistory.length>5?this.renderMiniChart(this.drawCallHistory,"var(--3lens-accent-blue)"):"";return`
      <div class="three-lens-efficiency">
        <div class="three-lens-efficiency-header">
          <div class="three-lens-efficiency-title">Draw Call Efficiency</div>
          <div class="three-lens-efficiency-grade" style="color: ${i};">${a}</div>
          </div>
        <div class="three-lens-efficiency-content">
          <div class="three-lens-efficiency-meter">
            <div class="three-lens-efficiency-bar">
              <div class="three-lens-efficiency-fill" style="width: ${Math.min(100,n)}%; background: ${i};"></div>
          </div>
            <div class="three-lens-efficiency-value">${n.toFixed(0)}%</div>
        </div>
          <div class="three-lens-efficiency-stats">
            <div class="three-lens-efficiency-stat">
              <span class="three-lens-efficiency-stat-value">${M(Math.round(s))}</span>
              <span class="three-lens-efficiency-stat-label">Triangles/Call</span>
      </div>
            <div class="three-lens-efficiency-stat">
              <span class="three-lens-efficiency-stat-value">${e.drawCalls}</span>
              <span class="three-lens-efficiency-stat-label">Total Calls</span>
          </div>
          </div>
          </div>
        ${l?`
          <div class="three-lens-efficiency-history">
            <div class="three-lens-efficiency-history-title">Draw Calls Over Time</div>
            ${l}
        </div>
        `:""}
      </div>
    `}renderMiniChart(e,t){const s=Math.max(...e,1),n=Math.min(...e,0),a=s-n||1,i=32,l=200,o=l/Math.max(e.length-1,1),d=e.map((g,u)=>{const m=u*o,f=i-(g-n)/a*i;return`${m},${f}`}),c=`M${d.join(" L")}`,p=`M0,${i} L${d.join(" L")} L${l},${i} Z`;return`
      <svg class="three-lens-mini-chart" viewBox="0 0 ${l} ${i}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="miniChartGradient-${t.replace("#","")}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color: ${t}; stop-opacity: 0.3"/>
            <stop offset="100%" style="stop-color: ${t}; stop-opacity: 0.05"/>
          </linearGradient>
        </defs>
        <path d="${p}" fill="url(#miniChartGradient-${t.replace("#","")})"/>
        <path d="${c}" fill="none" stroke="${t}" stroke-width="1.5"/>
      </svg>
    `}renderObjectVisibilityBreakdown(e,t){const s=e.objectsTotal||1,n=e.objectsVisible,a=e.objectsCulled,i=t.transparentObjects,l=n-i,o=n/s*100,d=a/s*100;return`
      <div class="three-lens-visibility-breakdown">
        <div class="three-lens-visibility-title">Object Visibility</div>
        <div class="three-lens-visibility-bar">
          <div class="three-lens-visibility-segment visible" style="width: ${o}%;" title="Visible: ${n}"></div>
          <div class="three-lens-visibility-segment culled" style="width: ${d}%;" title="Culled: ${a}"></div>
          </div>
        <div class="three-lens-visibility-stats">
          <div class="three-lens-visibility-stat">
            <span class="three-lens-visibility-dot visible"></span>
            <span class="three-lens-visibility-label">Visible</span>
            <span class="three-lens-visibility-value">${n}</span>
          </div>
          <div class="three-lens-visibility-stat">
            <span class="three-lens-visibility-dot culled"></span>
            <span class="three-lens-visibility-label">Culled</span>
            <span class="three-lens-visibility-value">${a}</span>
          </div>
          <div class="three-lens-visibility-stat">
            <span class="three-lens-visibility-dot transparent"></span>
            <span class="three-lens-visibility-label">Transparent</span>
            <span class="three-lens-visibility-value">${i}</span>
        </div>
          <div class="three-lens-visibility-stat">
            <span class="three-lens-visibility-dot opaque"></span>
            <span class="three-lens-visibility-label">Opaque</span>
            <span class="three-lens-visibility-value">${l}</span>
      </div>
            </div>
            </div>
    `}renderLightingAnalysis(e){e.totalLights>0,e.shadowCastingLights>0;const t=e.shadowCastingLights*2,s=t>4;return`
      <div class="three-lens-lighting">
        <div class="three-lens-lighting-title">Lighting & Shadows</div>
        <div class="three-lens-lighting-grid">
          <div class="three-lens-lighting-item">
            <div class="three-lens-lighting-icon">💡</div>
            <div class="three-lens-lighting-info">
              <div class="three-lens-lighting-value">${e.totalLights}</div>
              <div class="three-lens-lighting-label">Total Lights</div>
          </div>
        </div>
          <div class="three-lens-lighting-item ${s?"warning":""}">
            <div class="three-lens-lighting-icon">🌓</div>
            <div class="three-lens-lighting-info">
              <div class="three-lens-lighting-value">${e.shadowCastingLights}</div>
              <div class="three-lens-lighting-label">Shadow Casters</div>
            </div>
          </div>
          <div class="three-lens-lighting-item">
            <div class="three-lens-lighting-icon">🔄</div>
            <div class="three-lens-lighting-info">
              <div class="three-lens-lighting-value">${e.shadowMapUpdates}</div>
              <div class="three-lens-lighting-label">Shadow Updates</div>
            </div>
          </div>
          <div class="three-lens-lighting-item">
            <div class="three-lens-lighting-icon">👁️</div>
            <div class="three-lens-lighting-info">
              <div class="three-lens-lighting-value">${e.activeLights}</div>
              <div class="three-lens-lighting-label">Active Lights</div>
            </div>
          </div>
        </div>
        ${s?`
          <div class="three-lens-lighting-warning">
            ⚠️ High shadow cost (~${t.toFixed(0)}ms). Consider reducing shadow-casting lights.
        </div>
      `:""}
      </div>
    `}renderAnimationInstancing(e){const t=e.skinnedMeshes>0||e.totalBones>0,s=e.instancedDrawCalls>0||e.totalInstances>0;return!t&&!s?`
        <div class="three-lens-animation">
          <div class="three-lens-animation-title">Animation & Instancing</div>
          <div class="three-lens-animation-empty">No skinned meshes or instances detected</div>
        </div>
      `:`
      <div class="three-lens-animation">
        <div class="three-lens-animation-title">Animation & Instancing</div>
        <div class="three-lens-animation-grid">
          ${t?`
            <div class="three-lens-animation-section">
              <div class="three-lens-animation-section-title">Skinned Meshes</div>
              <div class="three-lens-animation-stats">
                <div class="three-lens-animation-stat">
                  <span class="three-lens-animation-stat-value">${e.skinnedMeshes}</span>
                  <span class="three-lens-animation-stat-label">Meshes</span>
                </div>
                <div class="three-lens-animation-stat">
                  <span class="three-lens-animation-stat-value">${e.totalBones}</span>
                  <span class="three-lens-animation-stat-label">Bones</span>
                </div>
                <div class="three-lens-animation-stat">
                  <span class="three-lens-animation-stat-value">${e.skinnedMeshes>0?Math.round(e.totalBones/e.skinnedMeshes):0}</span>
                  <span class="three-lens-animation-stat-label">Avg/Mesh</span>
                </div>
              </div>
            </div>
          `:""}
          ${s?`
            <div class="three-lens-animation-section">
              <div class="three-lens-animation-section-title">Instancing</div>
              <div class="three-lens-animation-stats">
                <div class="three-lens-animation-stat">
                  <span class="three-lens-animation-stat-value">${e.instancedDrawCalls}</span>
                  <span class="three-lens-animation-stat-label">Draw Calls</span>
                </div>
                <div class="three-lens-animation-stat">
                  <span class="three-lens-animation-stat-value">${M(e.totalInstances)}</span>
                  <span class="three-lens-animation-stat-label">Instances</span>
                </div>
                <div class="three-lens-animation-stat">
                  <span class="three-lens-animation-stat-value">${e.instancedDrawCalls>0?Math.round(e.totalInstances/e.instancedDrawCalls):0}</span>
                  <span class="three-lens-animation-stat-label">Avg/Call</span>
                </div>
              </div>
            </div>
          `:""}
        </div>
      </div>
    `}renderStateChangesAnalysis(e){const t=e.programSwitches+e.textureBinds+e.renderTargetSwitches;return`
      <div class="three-lens-state-changes">
        <div class="three-lens-state-changes-header">
          <div class="three-lens-state-changes-title">State Changes</div>
          <div class="three-lens-state-changes-total ${t>200?"warning":""}">${t} total</div>
        </div>
        <div class="three-lens-state-changes-grid">
          <div class="three-lens-state-change-item">
            <div class="three-lens-state-change-bar">
              <div class="three-lens-state-change-fill program" style="width: ${Math.min(100,e.programSwitches/2)}%;"></div>
            </div>
            <div class="three-lens-state-change-info">
              <span class="three-lens-state-change-label">Shader Switches</span>
              <span class="three-lens-state-change-value">${e.programSwitches}</span>
            </div>
          </div>
          <div class="three-lens-state-change-item">
            <div class="three-lens-state-change-bar">
              <div class="three-lens-state-change-fill texture" style="width: ${Math.min(100,e.textureBinds/5)}%;"></div>
            </div>
            <div class="three-lens-state-change-info">
              <span class="three-lens-state-change-label">Texture Binds</span>
              <span class="three-lens-state-change-value">${e.textureBinds}</span>
            </div>
          </div>
          <div class="three-lens-state-change-item">
            <div class="three-lens-state-change-bar">
              <div class="three-lens-state-change-fill rt" style="width: ${Math.min(100,e.renderTargetSwitches*10)}%;"></div>
            </div>
            <div class="three-lens-state-change-info">
              <span class="three-lens-state-change-label">RT Switches</span>
              <span class="three-lens-state-change-value">${e.renderTargetSwitches}</span>
            </div>
          </div>
          <div class="three-lens-state-change-item">
            <div class="three-lens-state-change-bar">
              <div class="three-lens-state-change-fill upload" style="width: ${Math.min(100,e.bufferUploads*5)}%;"></div>
            </div>
            <div class="three-lens-state-change-info">
              <span class="three-lens-state-change-label">Buffer Uploads</span>
              <span class="three-lens-state-change-value">${e.bufferUploads}</span>
            </div>
          </div>
        </div>
        ${e.bytesUploaded>0?`
          <div class="three-lens-state-changes-upload">
            Data uploaded: ${y(e.bytesUploaded)}/frame
          </div>
        `:""}
      </div>
    `}renderXRInfo(e){return`
      <div class="three-lens-xr">
        <div class="three-lens-xr-header">
          <div class="three-lens-xr-title">🥽 XR Mode Active</div>
          <div class="three-lens-xr-badge">VR</div>
        </div>
        <div class="three-lens-xr-stats">
          <div class="three-lens-xr-stat">
            <span class="three-lens-xr-stat-value">${e.viewports}</span>
            <span class="three-lens-xr-stat-label">Viewports</span>
          </div>
          <div class="three-lens-xr-stat">
            <span class="three-lens-xr-stat-value">×${e.viewports}</span>
            <span class="three-lens-xr-stat-label">Draw Cost</span>
          </div>
        </div>
      </div>
    `}renderRenderingWarnings(e,t){var n;const s=[];return e.drawCalls>500&&((n=e.performance)!=null&&n.trianglesPerDrawCall)&&e.performance.trianglesPerDrawCall<500&&s.push("Low triangles per draw call. Consider batching or using instancing."),t.transparentObjects>50&&s.push(`${t.transparentObjects} transparent objects may cause overdraw issues.`),t.shadowCastingLights>4&&s.push("Many shadow-casting lights. Consider using fewer or baked shadows."),t.renderTargetSwitches>10&&s.push("High render target switches. Consider consolidating post-processing passes."),s.length===0?"":`
      <div class="three-lens-rendering-warnings">
        <div class="three-lens-rendering-warnings-title">⚠ Rendering Warnings</div>
        ${s.map(a=>`<div class="three-lens-rendering-warning">${a}</div>`).join("")}
      </div>
    `}renderTimelineTab(e){const t=this.gpuHistory.length>0,s=this.getTimelineVisibleFrameCount(),n=33.33,a=this.recordedFrames.length>0,i=a?((this.recordedFrames[this.recordedFrames.length-1].timestamp-this.recordedFrames[0].timestamp)/1e3).toFixed(1):"0",l=this.detectSpikes(n);return`
      <div class="three-lens-timeline-container">
        <div class="three-lens-timeline-controls">
          <div class="three-lens-timeline-left-controls">
            <button class="three-lens-timeline-record-btn ${this.isRecording?"recording":""}" id="three-lens-timeline-record" title="${this.isRecording?"Stop Recording":"Start Recording"}">
              ${this.isRecording?"⏹":"⏺"}
            </button>
            ${a?`
              <button class="three-lens-timeline-btn" id="three-lens-timeline-clear" title="Clear Recording">🗑</button>
              <span class="three-lens-timeline-recording-info">${this.recordedFrames.length}f / ${i}s</span>
            `:""}
            <div class="three-lens-timeline-divider"></div>
            <button class="three-lens-timeline-btn" id="three-lens-timeline-zoom-out" title="Zoom Out">−</button>
            <span class="three-lens-timeline-zoom-label" id="three-lens-timeline-zoom-label">${s}f</span>
            <button class="three-lens-timeline-btn" id="three-lens-timeline-zoom-in" title="Zoom In">+</button>
            <button class="three-lens-timeline-btn" id="three-lens-timeline-reset" title="Reset View">↺</button>
          </div>
          <div class="three-lens-timeline-right-controls">
            <span class="three-lens-timeline-stat">
              <span class="three-lens-timeline-stat-label">Spikes:</span>
              <span class="three-lens-timeline-stat-value ${l.length>0?"warning":""}">${l.length}</span>
            </span>
            <select class="three-lens-timeline-buffer-select" id="three-lens-timeline-buffer-size" title="Buffer size">
              <option value="120" ${this.frameBufferSize===120?"selected":""}>2s</option>
              <option value="300" ${this.frameBufferSize===300?"selected":""}>5s</option>
              <option value="600" ${this.frameBufferSize===600?"selected":""}>10s</option>
            </select>
          </div>
        </div>
        
        <div class="three-lens-timeline-chart-container" id="three-lens-timeline-chart-container">
          <canvas id="three-lens-timeline-chart" class="three-lens-timeline-chart"></canvas>
          <div class="three-lens-timeline-tooltip" id="three-lens-timeline-tooltip"></div>
        </div>
        
        <div class="three-lens-timeline-legend">
          <div class="three-lens-timeline-legend-item">
            <span class="three-lens-timeline-legend-color cpu"></span>
            <span>CPU</span>
          </div>
          ${t?`
            <div class="three-lens-timeline-legend-item">
              <span class="three-lens-timeline-legend-color gpu"></span>
              <span>GPU</span>
            </div>
          `:""}
          <div class="three-lens-timeline-legend-item">
            <span class="three-lens-timeline-legend-color spike"></span>
            <span>Spike</span>
          </div>
        </div>
        
        ${this.timelineSelectedFrame!==null?this.renderTimelineFrameDetails(this.timelineSelectedFrame):""}
      </div>
    `}renderTimelineFrameDetails(e){const t=this.frameHistory[e]??0,s=this.gpuHistory[e],n=t>0?1e3/t:0,a=this.performanceHistory[e];return`
      <div class="three-lens-timeline-frame-details">
        <div class="three-lens-timeline-frame-details-header">
          <span>Frame #${e+1}</span>
          <button class="three-lens-timeline-close-btn" id="three-lens-timeline-close-details">×</button>
        </div>
        <div class="three-lens-timeline-frame-details-grid">
          <div class="three-lens-timeline-frame-detail">
            <span class="three-lens-timeline-frame-detail-label">CPU Time</span>
            <span class="three-lens-timeline-frame-detail-value ${t>16.67?"warning":""}">${t.toFixed(2)}ms</span>
          </div>
          ${s!==void 0?`
            <div class="three-lens-timeline-frame-detail">
              <span class="three-lens-timeline-frame-detail-label">GPU Time</span>
              <span class="three-lens-timeline-frame-detail-value ${s>16.67?"warning":""}">${s.toFixed(2)}ms</span>
            </div>
          `:""}
          <div class="three-lens-timeline-frame-detail">
            <span class="three-lens-timeline-frame-detail-label">FPS</span>
            <span class="three-lens-timeline-frame-detail-value ${n<30?"error":n<55?"warning":""}">${n.toFixed(1)}</span>
          </div>
          ${a?`
            <div class="three-lens-timeline-frame-detail">
              <span class="three-lens-timeline-frame-detail-label">Draw Calls</span>
              <span class="three-lens-timeline-frame-detail-value">${a.drawCalls}</span>
            </div>
            <div class="three-lens-timeline-frame-detail">
              <span class="three-lens-timeline-frame-detail-label">Triangles</span>
              <span class="three-lens-timeline-frame-detail-value">${M(a.triangles)}</span>
            </div>
          `:""}
        </div>
      </div>
    `}getTimelineVisibleFrameCount(){return Math.max(10,Math.min(this.maxHistoryLength,Math.floor(this.maxHistoryLength/this.timelineZoom)))}detectSpikes(e){const t=[];for(let s=0;s<this.frameHistory.length;s++){const n=this.frameHistory[s],a=this.gpuHistory[s];n+(a??0)>e&&t.push(s)}return t}renderResourcesTab(){const e=this.probe.getResourceLifecycleSummary(),t=this.probe.getResourceEvents(),s=this.probe.getPotentialResourceLeaks(),n=this.probe.getOrphanedResources(),a=this.probe.getLeakAlerts(),i=this.probe.isResourceStackTraceCaptureEnabled(),l=this.probe.getEstimatedResourceMemory(),o=t.slice(-50).reverse();return`
      <div class="three-lens-resources-profiler">
        ${this.renderResourceSummary(e)}
        ${this.renderLeakDetectionControls(i)}
        ${this.renderMemoryUsage(l)}
        ${a.length>0?this.renderLeakAlerts(a):""}
        ${n.length>0?this.renderOrphanedResources(n):""}
        ${s.length>0?this.renderPotentialLeaks(s):""}
        ${this.renderResourceTimeline(o)}
        ${this.renderResourceEventList(o)}
      </div>
    `}renderResourceSummary(e){return`
      <div class="three-lens-resource-summary">
        <div class="three-lens-resource-summary-title">Resource Lifecycle Summary</div>
        <div class="three-lens-resource-summary-grid">
          <div class="three-lens-resource-summary-item">
            <div class="three-lens-resource-summary-icon geometry">📐</div>
            <div class="three-lens-resource-summary-details">
              <div class="three-lens-resource-summary-label">Geometries</div>
              <div class="three-lens-resource-summary-stats">
                <span class="created">${e.geometries.created} created</span>
                <span class="disposed">${e.geometries.disposed} disposed</span>
                <span class="active ${e.geometries.active>0?"highlight":""}">${e.geometries.active} active</span>
                ${e.geometries.leaked>0?`<span class="leaked">⚠ ${e.geometries.leaked} leaked?</span>`:""}
              </div>
            </div>
          </div>
          <div class="three-lens-resource-summary-item">
            <div class="three-lens-resource-summary-icon material">🎨</div>
            <div class="three-lens-resource-summary-details">
              <div class="three-lens-resource-summary-label">Materials</div>
              <div class="three-lens-resource-summary-stats">
                <span class="created">${e.materials.created} created</span>
                <span class="disposed">${e.materials.disposed} disposed</span>
                <span class="active ${e.materials.active>0?"highlight":""}">${e.materials.active} active</span>
                ${e.materials.leaked>0?`<span class="leaked">⚠ ${e.materials.leaked} leaked?</span>`:""}
              </div>
            </div>
          </div>
          <div class="three-lens-resource-summary-item">
            <div class="three-lens-resource-summary-icon texture">🖼</div>
            <div class="three-lens-resource-summary-details">
              <div class="three-lens-resource-summary-label">Textures</div>
              <div class="three-lens-resource-summary-stats">
                <span class="created">${e.textures.created} created</span>
                <span class="disposed">${e.textures.disposed} disposed</span>
                <span class="active ${e.textures.active>0?"highlight":""}">${e.textures.active} active</span>
                ${e.textures.leaked>0?`<span class="leaked">⚠ ${e.textures.leaked} leaked?</span>`:""}
              </div>
            </div>
          </div>
        </div>
        <div class="three-lens-resource-total-events">${e.totalEvents} total events tracked</div>
      </div>
    `}renderLeakDetectionControls(e){return`
      <div class="three-lens-resource-controls">
        <div class="three-lens-leak-controls-left">
          <button class="three-lens-action-btn" data-action="run-leak-detection" title="Run leak detection checks">
            🔍 Detect Leaks
          </button>
          <button class="three-lens-action-btn" data-action="generate-leak-report" title="Generate detailed leak report">
            📋 Report
          </button>
        </div>
        <div class="three-lens-leak-controls-right">
          <div class="three-lens-toggle-row compact" data-action="toggle-stack-traces">
            <span class="three-lens-toggle-label">Stacks</span>
            <button class="three-lens-toggle-btn ${e?"active":""}" title="Capture stack traces (performance impact)">
              <span class="three-lens-toggle-track">
                <span class="three-lens-toggle-thumb"></span>
              </span>
            </button>
          </div>
          <button class="three-lens-action-btn small" data-action="clear-resource-events" title="Clear">
            🗑
          </button>
        </div>
      </div>
    `}renderMemoryUsage(e){const t=this.probe.getResourceMemoryHistory(),s=t.length>1;let n="",a="";if(s){const i=t[0].estimatedBytes,o=t[t.length-1].estimatedBytes-i;o>1024*1024?(n=`↑ +${y(o)}`,a="growing"):o<-1024*1024?(n=`↓ ${y(Math.abs(o))}`,a="shrinking"):(n="→ stable",a="stable")}return`
      <div class="three-lens-memory-usage">
        <div class="three-lens-memory-usage-header">
          <span class="three-lens-memory-usage-label">Resource Memory</span>
          <span class="three-lens-memory-usage-value">${y(e)}</span>
          ${n?`<span class="three-lens-memory-trend ${a}">${n}</span>`:""}
        </div>
      </div>
    `}renderLeakAlerts(e){const t=e.filter(n=>n.severity==="critical"),s=e.filter(n=>n.severity==="warning");return`
      <div class="three-lens-leak-alerts">
        <div class="three-lens-leak-alerts-header">
          <span class="three-lens-leak-alerts-icon">🚨</span>
          <span>Leak Alerts (${e.length})</span>
          ${t.length>0?`<span class="three-lens-alert-badge critical">${t.length} critical</span>`:""}
          ${s.length>0?`<span class="three-lens-alert-badge warning">${s.length} warning</span>`:""}
          <button class="three-lens-action-btn small" data-action="clear-leak-alerts" title="Clear alerts">✕</button>
        </div>
        <div class="three-lens-leak-alerts-list">
          ${e.slice(0,5).map(n=>`
            <div class="three-lens-leak-alert-item ${n.severity}">
              <span class="three-lens-alert-severity ${n.severity}">${this.getSeverityIcon(n.severity)}</span>
              <div class="three-lens-alert-content">
                <div class="three-lens-alert-message">${n.message}</div>
                <div class="three-lens-alert-details">${n.details}</div>
                <div class="three-lens-alert-suggestion">💡 ${n.suggestion}</div>
              </div>
            </div>
          `).join("")}
          ${e.length>5?`<div class="three-lens-leak-more">+ ${e.length-5} more alerts...</div>`:""}
        </div>
      </div>
    `}renderOrphanedResources(e){return`
      <div class="three-lens-orphaned-resources">
        <div class="three-lens-orphaned-header">
          <span class="three-lens-orphaned-icon">👻</span>
          <span>Orphaned Resources (${e.length})</span>
        </div>
        <div class="three-lens-orphaned-hint">Not attached to any mesh - consider disposing</div>
        <div class="three-lens-orphaned-list">
          ${e.slice(0,5).map(t=>`
            <div class="three-lens-orphan-item">
              <span class="three-lens-orphan-type ${t.type}">${this.getResourceIcon(t.type)}</span>
              <span class="three-lens-orphan-name">${t.name||t.subtype||t.uuid.substring(0,8)}</span>
              <span class="three-lens-orphan-age">${this.formatAge(t.ageMs)}</span>
            </div>
          `).join("")}
          ${e.length>5?`<div class="three-lens-orphan-more">+ ${e.length-5} more...</div>`:""}
        </div>
      </div>
    `}getSeverityIcon(e){switch(e){case"critical":return"🔴";case"warning":return"🟡";case"info":return"🔵";default:return"⚪"}}renderPotentialLeaks(e){return`
      <div class="three-lens-potential-leaks">
        <div class="three-lens-potential-leaks-header">
          <span class="three-lens-potential-leaks-icon">⚠</span>
          <span>Potential Memory Leaks (${e.length})</span>
        </div>
        <div class="three-lens-potential-leaks-list">
          ${e.slice(0,5).map(t=>`
            <div class="three-lens-leak-item">
              <span class="three-lens-leak-type ${t.type}">${this.getResourceIcon(t.type)}</span>
              <span class="three-lens-leak-name">${t.name||t.subtype||t.uuid.substring(0,8)}</span>
              <span class="three-lens-leak-age">${this.formatAge(t.ageMs)}</span>
            </div>
          `).join("")}
          ${e.length>5?`<div class="three-lens-leak-more">+ ${e.length-5} more...</div>`:""}
        </div>
      </div>
    `}renderResourceTimeline(e){if(e.length===0)return'<div class="three-lens-resource-timeline-empty">No resource events recorded yet</div>';const t=performance.now(),s=6e4,n=30,a=s/n,i=[];for(let o=0;o<n;o++)i.push({geometry:0,material:0,texture:0,disposed:0});for(const o of e){const d=t-o.timestamp;if(d>s)continue;const c=Math.floor((s-d)/a);if(c>=0&&c<n){if(o.eventType==="disposed")i[c].disposed++;else if(o.eventType==="created"){const p=o.resourceType;p in i[c]&&i[c][p]++}}}const l=Math.max(1,...i.map(o=>o.geometry+o.material+o.texture+o.disposed));return`
      <div class="three-lens-resource-timeline">
        <div class="three-lens-resource-timeline-header">
          <span>Event Timeline (last 60s)</span>
          <div class="three-lens-resource-timeline-legend">
            <span class="geometry">📐 Geo</span>
            <span class="material">🎨 Mat</span>
            <span class="texture">🖼 Tex</span>
            <span class="disposed">✕ Disposed</span>
          </div>
        </div>
        <div class="three-lens-resource-timeline-chart">
          ${i.map((o,d)=>{const c=(o.geometry+o.material+o.texture+o.disposed)/l*100,p=o.geometry/l*100,g=o.material/l*100,u=o.texture/l*100,m=o.disposed/l*100;return`
              <div class="three-lens-resource-timeline-bar" title="${o.geometry+o.material+o.texture} created, ${o.disposed} disposed">
                <div class="three-lens-resource-bar-stack" style="height: ${c}%">
                  ${p>0?`<div class="three-lens-resource-bar-segment geometry" style="height: ${p/c*100}%"></div>`:""}
                  ${g>0?`<div class="three-lens-resource-bar-segment material" style="height: ${g/c*100}%"></div>`:""}
                  ${u>0?`<div class="three-lens-resource-bar-segment texture" style="height: ${u/c*100}%"></div>`:""}
                  ${m>0?`<div class="three-lens-resource-bar-segment disposed" style="height: ${m/c*100}%"></div>`:""}
                </div>
              </div>
            `}).join("")}
        </div>
        <div class="three-lens-resource-timeline-labels">
          <span>60s ago</span>
          <span>now</span>
        </div>
      </div>
    `}renderResourceEventList(e){return e.length===0?"":`
      <div class="three-lens-resource-event-list">
        <div class="three-lens-resource-event-list-header">Recent Events</div>
        <div class="three-lens-resource-event-list-items">
          ${e.slice(0,20).map(t=>{var s;return`
            <div class="three-lens-resource-event-item ${t.eventType}">
              <span class="three-lens-resource-event-type ${t.resourceType}">${this.getResourceIcon(t.resourceType)}</span>
              <span class="three-lens-resource-event-action ${t.eventType}">${this.getEventTypeLabel(t.eventType)}</span>
              <span class="three-lens-resource-event-name">${t.resourceName||t.resourceSubtype||t.resourceUuid.substring(0,8)}</span>
              ${(s=t.metadata)!=null&&s.textureSlot?`<span class="three-lens-resource-event-slot">[${t.metadata.textureSlot}]</span>`:""}
              <span class="three-lens-resource-event-time">${this.formatEventTime(t.timestamp)}</span>
            </div>
          `}).join("")}
        </div>
        ${e.length>20?`<div class="three-lens-resource-event-more">${e.length-20} more events...</div>`:""}
      </div>
    `}getResourceIcon(e){switch(e){case"geometry":return"📐";case"material":return"🎨";case"texture":return"🖼";default:return"📦"}}getEventTypeLabel(e){switch(e){case"created":return"+";case"disposed":return"✕";case"attached":return"→";case"detached":return"←";default:return"?"}}formatAge(e){return e<1e3?`${Math.round(e)}ms`:e<6e4?`${(e/1e3).toFixed(1)}s`:e<36e5?`${(e/6e4).toFixed(1)}m`:`${(e/36e5).toFixed(1)}h`}formatEventTime(e){const t=performance.now()-e;return t<1e3?"now":t<6e4?`${Math.round(t/1e3)}s ago`:t<36e5?`${Math.round(t/6e4)}m ago`:`${Math.round(t/36e5)}h ago`}findNodeById(e,t){for(const s of e){if(s.ref.debugId===t)return s;const n=this.findNodeById(s.children,t);if(n)return n}return null}renderNodeInspector(e){const t=e.transform,s=n=>(n*180/Math.PI).toFixed(2);return`
      <div class="three-lens-section">
        <div class="three-lens-section-header">Transform</div>
        <div class="three-lens-property-row">
          <span class="three-lens-property-name">Position</span>
          <div class="three-lens-vector-inputs">
            <div class="three-lens-vector-input"><input type="number" value="${t.position.x.toFixed(2)}" step="0.1" readonly><div class="three-lens-vector-label">X</div></div>
            <div class="three-lens-vector-input"><input type="number" value="${t.position.y.toFixed(2)}" step="0.1" readonly><div class="three-lens-vector-label">Y</div></div>
            <div class="three-lens-vector-input"><input type="number" value="${t.position.z.toFixed(2)}" step="0.1" readonly><div class="three-lens-vector-label">Z</div></div>
          </div>
        </div>
        <div class="three-lens-property-row">
          <span class="three-lens-property-name">Rotation</span>
          <div class="three-lens-vector-inputs">
            <div class="three-lens-vector-input"><input type="number" value="${s(t.rotation.x)}" step="0.1" readonly><div class="three-lens-vector-label">X</div></div>
            <div class="three-lens-vector-input"><input type="number" value="${s(t.rotation.y)}" step="0.1" readonly><div class="three-lens-vector-label">Y</div></div>
            <div class="three-lens-vector-input"><input type="number" value="${s(t.rotation.z)}" step="0.1" readonly><div class="three-lens-vector-label">Z</div></div>
          </div>
        </div>
        <div class="three-lens-property-row">
          <span class="three-lens-property-name">Scale</span>
          <div class="three-lens-vector-inputs">
            <div class="three-lens-vector-input"><input type="number" value="${t.scale.x.toFixed(2)}" step="0.1" readonly><div class="three-lens-vector-label">X</div></div>
            <div class="three-lens-vector-input"><input type="number" value="${t.scale.y.toFixed(2)}" step="0.1" readonly><div class="three-lens-vector-label">Y</div></div>
            <div class="three-lens-vector-input"><input type="number" value="${t.scale.z.toFixed(2)}" step="0.1" readonly><div class="three-lens-vector-label">Z</div></div>
          </div>
        </div>
      </div>
      ${e.meshData?this.renderMeshInfo(e.meshData):""}
      ${e.lightData?this.renderLightInfo(e.lightData):""}
      ${e.cameraData?this.renderCameraInfo(e.cameraData):""}
      ${this.renderVisualOverlaysSection(e)}
      ${this.renderCameraControlsSection(e)}
      <div class="three-lens-section">
        <div class="three-lens-section-header">Rendering</div>
        ${this.renderProp("Layers",this.formatLayers(e.layers))}
        ${this.renderProp("Render Order",e.renderOrder)}
        ${this.renderProp("Frustum Culled",e.frustumCulled)}
        ${this.renderProp("Children",e.children.length)}
      </div>
    `}renderGlobalTools(){const e=this.probe.isGlobalWireframeEnabled(),t=this.probe.getCameraInfo(),s=this.probe.hasHomePosition(),n=this.probe.getAvailableCameras(),a=this.collectCostRanking();return`
      <div class="three-lens-global-tools">
        <div class="three-lens-global-tools-header">
          <span class="three-lens-global-icon">🌐</span>
          <span>Global Tools</span>
        </div>
        <div class="three-lens-section">
          <div class="three-lens-section-header">Visual Settings</div>
          <div class="three-lens-toggle-row global" data-action="toggle-global-wireframe">
            <span class="three-lens-toggle-label">Global Wireframe</span>
            <button class="three-lens-toggle-btn ${e?"active":""}" title="Toggle wireframe for all meshes">
              <span class="three-lens-toggle-track">
                <span class="three-lens-toggle-thumb"></span>
              </span>
            </button>
          </div>
        </div>
        <div class="three-lens-section">
          <div class="three-lens-section-header">Camera</div>
          ${t?`
            <div class="three-lens-camera-info">
              <div class="three-lens-property-row compact">
                <span class="three-lens-property-name">Type</span>
                <span class="three-lens-property-value">${t.type}</span>
              </div>
              <div class="three-lens-property-row compact">
                <span class="three-lens-property-name">Position</span>
                <span class="three-lens-property-value">(${t.position.x.toFixed(1)}, ${t.position.y.toFixed(1)}, ${t.position.z.toFixed(1)})</span>
              </div>
            </div>
          `:""}
          <div class="three-lens-camera-actions">
            <button class="three-lens-action-btn three-lens-home-btn" data-action="go-home" ${s?"":"disabled"} title="Return to home position">
              <span class="three-lens-btn-icon">🏠</span>
              <span>Home</span>
            </button>
            <button class="three-lens-action-btn" data-action="save-home" title="Save current camera position as home">
              <span class="three-lens-btn-icon">💾</span>
              <span>Save Home</span>
            </button>
          </div>
          ${n.length>1?`
            <div class="three-lens-camera-switcher">
              <div class="three-lens-camera-switcher-title">Switch Camera</div>
              <div class="three-lens-camera-list">
                ${n.map((i,l)=>`
                  <button class="three-lens-camera-item ${l===this.probe.getActiveCameraIndex()?"active":""}" 
                          data-camera-index="${l}" 
                          data-camera-uuid="${i.uuid}"
                          title="${i.type}">
                    <span class="three-lens-camera-item-icon">📷</span>
                    <span class="three-lens-camera-item-name">${i.name}</span>
                  </button>
                `).join("")}
              </div>
            </div>
          `:""}
        </div>
        ${this.renderCostRankingSection(a)}
      </div>
    `}collectCostRanking(){const e=this.probe.takeSnapshot(),t=[],s=n=>{var a;(a=n.meshData)!=null&&a.costData&&t.push({debugId:n.ref.debugId,name:n.ref.name||"unnamed",type:n.ref.type,cost:n.meshData.costData.totalCost,costLevel:n.meshData.costData.costLevel,triangles:n.meshData.faceCount});for(const i of n.children)s(i)};for(const n of e.scenes)s(n);return t.sort((n,a)=>a.cost-n.cost),t}renderCostRankingSection(e){if(e.length===0)return"";const t=e.reduce((l,o)=>l+o.cost,0),s=e.reduce((l,o)=>l+o.triangles,0),n=e.filter(l=>l.costLevel==="critical").length,a=e.filter(l=>l.costLevel==="high").length,i=e.slice(0,5);return`
      <div class="three-lens-section">
        <div class="three-lens-section-header">Cost Ranking</div>
        <div class="three-lens-cost-summary">
          <div class="three-lens-cost-summary-stat">
            <span class="three-lens-cost-summary-value">${t.toFixed(1)}</span>
            <span class="three-lens-cost-summary-label">Total Cost</span>
          </div>
          <div class="three-lens-cost-summary-stat">
            <span class="three-lens-cost-summary-value">${M(s)}</span>
            <span class="three-lens-cost-summary-label">Triangles</span>
          </div>
          <div class="three-lens-cost-summary-stat">
            <span class="three-lens-cost-summary-value">${e.length}</span>
            <span class="three-lens-cost-summary-label">Meshes</span>
          </div>
        </div>
        ${n>0||a>0?`
          <div class="three-lens-cost-warning">
            ${n>0?`<span class="cost-critical">🔥 ${n} critical</span>`:""}
            ${a>0?`<span class="cost-high">⚠ ${a} high cost</span>`:""}
          </div>
        `:""}
        <div class="three-lens-cost-ranking-list">
          ${i.map((l,o)=>`
            <div class="three-lens-cost-ranking-item" data-id="${l.debugId}" data-action="select-object">
              <span class="three-lens-cost-rank">#${o+1}</span>
              <span class="three-lens-cost-ranking-name">${l.name}</span>
              <span class="three-lens-cost-ranking-triangles">${M(l.triangles)}</span>
              <span class="three-lens-cost-ranking-score cost-${l.costLevel}">${l.cost.toFixed(1)}</span>
            </div>
          `).join("")}
        </div>
        ${e.length>5?`<div class="three-lens-cost-more">+ ${e.length-5} more objects</div>`:""}
      </div>
    `}renderMeshInfo(e){return`
      <div class="three-lens-section">
        <div class="three-lens-section-header">Mesh</div>
        ${this.renderProp("Vertices",M(e.vertexCount))}
        ${this.renderProp("Triangles",M(e.faceCount))}
        ${this.renderProp("Geometry",e.geometryRef?e.geometryRef.substring(0,8)+"...":"(none)")}
        ${this.renderProp("Material",this.formatMaterialRefs(e.materialRefs))}
        ${this.renderProp("Cast Shadow",e.castShadow)}
        ${this.renderProp("Receive Shadow",e.receiveShadow)}
      </div>
      ${e.costData?this.renderCostAnalysis(e.costData):""}
    `}renderCostAnalysis(e){const t=`cost-${e.costLevel}`,s=e.costLevel.charAt(0).toUpperCase()+e.costLevel.slice(1),n=e.triangleCost+e.materialComplexity+e.textureCost+e.shadowCost,a=n>0?(e.triangleCost/n*100).toFixed(0):"0",i=n>0?(e.materialComplexity/n*100).toFixed(0):"0",l=n>0?(e.textureCost/n*100).toFixed(0):"0",o=n>0?(e.shadowCost/n*100).toFixed(0):"0";return`
      <div class="three-lens-section">
        <div class="three-lens-section-header">Cost Analysis</div>
        <div class="three-lens-cost-header">
          <span class="three-lens-cost-level ${t}">${s}</span>
          <span class="three-lens-cost-score">${e.totalCost.toFixed(1)} pts</span>
        </div>
        <div class="three-lens-cost-breakdown">
          <div class="three-lens-cost-bar">
            <div class="three-lens-cost-bar-segment triangles" style="width: ${a}%" title="Triangles: ${a}%"></div>
            <div class="three-lens-cost-bar-segment material" style="width: ${i}%" title="Material: ${i}%"></div>
            <div class="three-lens-cost-bar-segment textures" style="width: ${l}%" title="Textures: ${l}%"></div>
            <div class="three-lens-cost-bar-segment shadows" style="width: ${o}%" title="Shadows: ${o}%"></div>
          </div>
          <div class="three-lens-cost-legend">
            <span class="three-lens-cost-legend-item triangles">▪ Tris ${a}%</span>
            <span class="three-lens-cost-legend-item material">▪ Mat ${i}%</span>
            <span class="three-lens-cost-legend-item textures">▪ Tex ${l}%</span>
            <span class="three-lens-cost-legend-item shadows">▪ Shd ${o}%</span>
          </div>
        </div>
        <div class="three-lens-cost-details">
          ${this.renderCostRow("Triangles",e.triangleCost.toFixed(2),M(Math.round(e.triangleCost*1e3))+" tris")}
          ${this.renderCostRow("Material",e.materialComplexity.toFixed(1)+"/10",this.getMaterialComplexityLabel(e.materialComplexity))}
          ${this.renderCostRow("Textures",e.textureCost.toFixed(1),e.materials.reduce((d,c)=>d+c.textureCount,0)+" maps")}
          ${this.renderCostRow("Shadows",e.shadowCost.toFixed(1),this.getShadowLabel(e.shadowCost))}
        </div>
        ${this.renderMaterialDetails(e.materials)}
      </div>
    `}renderCostRow(e,t,s){return`
      <div class="three-lens-cost-row">
        <span class="three-lens-cost-row-label">${e}</span>
        <span class="three-lens-cost-row-value">${t}</span>
        <span class="three-lens-cost-row-detail">${s}</span>
      </div>
    `}getMaterialComplexityLabel(e){return e<=2?"Simple":e<=4?"Standard":e<=6?"Complex":e<=8?"Heavy":"Very Heavy"}getShadowLabel(e){return e===0?"None":e===1?"Receive only":e===2?"Cast only":"Cast + Receive"}renderMaterialDetails(e){return e.length===0?"":`
      <div class="three-lens-material-details">
        <div class="three-lens-material-details-header">Materials (${e.length})</div>
        ${e.map((t,s)=>`
          <div class="three-lens-material-item">
            <span class="three-lens-material-type">${t.type}</span>
            <span class="three-lens-material-score">${t.complexityScore.toFixed(1)}/10</span>
            <div class="three-lens-material-features">
              ${t.textureCount>0?`<span class="three-lens-mat-feature" title="Textures">🖼 ${t.textureCount}</span>`:""}
              ${t.hasNormalMap?'<span class="three-lens-mat-feature" title="Normal Map">N</span>':""}
              ${t.hasEnvMap?'<span class="three-lens-mat-feature" title="Environment Map">E</span>':""}
              ${t.transparent?'<span class="three-lens-mat-feature" title="Transparent">α</span>':""}
              ${t.doubleSided?'<span class="three-lens-mat-feature" title="Double Sided">⇄</span>':""}
            </div>
          </div>
        `).join("")}
      </div>
    `}renderLightInfo(e){return`
      <div class="three-lens-section">
        <div class="three-lens-section-header">Light</div>
        ${this.renderProp("Light Type",e.lightType)}
        ${this.renderProp("Color","#"+e.color.toString(16).padStart(6,"0").toUpperCase())}
        ${this.renderProp("Intensity",e.intensity.toFixed(2))}
        ${this.renderProp("Cast Shadow",e.castShadow)}
        ${e.distance!==void 0?this.renderProp("Distance",e.distance):""}
        ${e.angle!==void 0?this.renderProp("Angle",(e.angle*180/Math.PI).toFixed(1)+"°"):""}
      </div>
    `}renderCameraInfo(e){return`
      <div class="three-lens-section">
        <div class="three-lens-section-header">Camera</div>
        ${this.renderProp("Camera Type",e.cameraType)}
        ${this.renderProp("Near",e.near)}
        ${this.renderProp("Far",e.far)}
        ${e.fov!==void 0?this.renderProp("FOV",e.fov+"°"):""}
        ${e.aspect!==void 0?this.renderProp("Aspect",e.aspect.toFixed(2)):""}
      </div>
    `}renderVisualOverlaysSection(e){if(!(e.ref.type==="Mesh"||e.ref.type==="SkinnedMesh"||e.ref.type==="InstancedMesh"))return this.renderTransformGizmoSection();const s=this.probe.getSelectedObject(),n=s?this.probe.isWireframeEnabled(s):!1,a=s?this.probe.isBoundingBoxEnabled(s):!1;return`
      <div class="three-lens-section">
        <div class="three-lens-section-header">Visual Overlays</div>
        <div class="three-lens-toggle-row" data-action="toggle-wireframe">
          <span class="three-lens-toggle-label">Wireframe</span>
          <button class="three-lens-toggle-btn ${n?"active":""}" title="Toggle wireframe for this object">
            <span class="three-lens-toggle-track">
              <span class="three-lens-toggle-thumb"></span>
            </span>
          </button>
        </div>
        <div class="three-lens-toggle-row" data-action="toggle-boundingbox">
          <span class="three-lens-toggle-label">Bounding Box</span>
          <button class="three-lens-toggle-btn ${a?"active":""}" title="Toggle bounding box for this object">
            <span class="three-lens-toggle-track">
              <span class="three-lens-toggle-thumb"></span>
            </span>
          </button>
        </div>
      </div>
      ${this.renderTransformGizmoSection()}
    `}renderCameraControlsSection(e){const t=this.probe.isCameraAnimating();return`
      <div class="three-lens-section">
        <div class="three-lens-section-header">Camera</div>
        
        <div class="three-lens-camera-actions">
          <button class="three-lens-action-btn" data-action="focus-selected" title="Focus camera on selected object (F)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
            </svg>
            Focus
          </button>
          <button class="three-lens-action-btn" data-action="fly-to-selected" title="Fly camera to selected object">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13"/>
              <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
            Fly To
          </button>
          <button class="three-lens-action-btn home" data-action="go-home" ${this.probe.hasHomePosition()?"":"disabled"} title="Return to home view (H)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Home
          </button>
        </div>
        
        ${t?`
          <button class="three-lens-action-btn stop" data-action="stop-animation" title="Stop camera animation">
            Stop Animation
          </button>
        `:""}
      </div>
    `}renderTransformGizmoSection(){const e=this.probe.isTransformGizmoEnabled(),t=this.probe.getTransformMode(),s=this.probe.getTransformSpace(),n=this.probe.isTransformSnapEnabled(),a=this.probe.canUndoTransform(),i=this.probe.canRedoTransform();return`
      <div class="three-lens-section">
        <div class="three-lens-section-header">Transform Gizmo</div>
        
        <div class="three-lens-toggle-row" data-action="toggle-transform-gizmo">
          <span class="three-lens-toggle-label">Enable Gizmo</span>
          <button class="three-lens-toggle-btn ${e?"active":""}" title="Enable transform gizmo">
            <span class="three-lens-toggle-track">
              <span class="three-lens-toggle-thumb"></span>
            </span>
          </button>
        </div>

        <div class="three-lens-transform-modes ${e?"":"disabled"}">
          <div class="three-lens-mode-label">Mode</div>
          <div class="three-lens-mode-buttons">
            <button class="three-lens-mode-btn ${t==="translate"?"active":""}" data-mode="translate" title="Translate (W)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>
              </svg>
            </button>
            <button class="three-lens-mode-btn ${t==="rotate"?"active":""}" data-mode="rotate" title="Rotate (E)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
                <path d="M21 3v5h-5"/>
              </svg>
            </button>
            <button class="three-lens-mode-btn ${t==="scale"?"active":""}" data-mode="scale" title="Scale (R)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 21l-6-6m6 6v-4.8m0 4.8h-4.8"/>
                <path d="M3 16.2V21h4.8"/>
                <path d="M21 7.8V3h-4.8"/>
                <path d="M3 7.8V3h4.8"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="three-lens-transform-options ${e?"":"disabled"}">
          <div class="three-lens-option-row" data-action="toggle-space">
            <span class="three-lens-option-label">Space</span>
            <button class="three-lens-space-btn" title="Toggle between world and local space">
              ${s==="world"?"World":"Local"}
            </button>
          </div>
          
          <div class="three-lens-toggle-row" data-action="toggle-snap">
            <span class="three-lens-toggle-label">Snap to Grid</span>
            <button class="three-lens-toggle-btn ${n?"active":""}" title="Enable grid snapping">
              <span class="three-lens-toggle-track">
                <span class="three-lens-toggle-thumb"></span>
              </span>
            </button>
          </div>
        </div>

        <div class="three-lens-undo-redo ${e?"":"disabled"}">
          <button class="three-lens-undo-btn ${a?"":"disabled"}" data-action="undo-transform" title="Undo (Ctrl+Z)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 7v6h6"/>
              <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
            </svg>
            Undo
          </button>
          <button class="three-lens-redo-btn ${i?"":"disabled"}" data-action="redo-transform" title="Redo (Ctrl+Shift+Z)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 7v6h-6"/>
              <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/>
            </svg>
            Redo
          </button>
        </div>
      </div>
    `}formatLayers(e){if(e===0)return"None";if(e===1)return"0 (default)";const t=[];for(let s=0;s<32;s++)e&1<<s&&t.push(s);return t.length===1?t[0]===0?"0 (default)":String(t[0]):t.join(", ")}formatMaterialRefs(e){return e.length===0?"(none)":e.length===1?e[0]?e[0].substring(0,8)+"...":"(none)":`${e[0]?e[0].substring(0,8):"???"}... +${e.length-1}`}renderProp(e,t){return`<div class="three-lens-property-row"><span class="three-lens-property-name">${e}</span><span class="three-lens-property-value">${String(t)}</span></div>`}renderVectorProp(e,t,s=!1){const n=s?180/Math.PI:1;return`
      <div class="three-lens-property-row">
        <span class="three-lens-property-name">${e}</span>
        <div class="three-lens-vector-inputs">
          <div class="three-lens-vector-input"><input type="number" value="${(t.x*n).toFixed(2)}" step="0.1"><div class="three-lens-vector-label">X</div></div>
          <div class="three-lens-vector-input"><input type="number" value="${(t.y*n).toFixed(2)}" step="0.1"><div class="three-lens-vector-label">Y</div></div>
          <div class="three-lens-vector-input"><input type="number" value="${(t.z*n).toFixed(2)}" step="0.1"><div class="three-lens-vector-label">Z</div></div>
        </div>
      </div>
    `}updateStatsPanel(){const e=document.getElementById("three-lens-content-stats");if(!e)return;const t=document.getElementById("three-lens-stats-tabs"),s=document.getElementById("three-lens-stats-tab-content");t&&s?this.statsTab==="timeline"?!this.timelinePaused&&!this.timelineDragging&&this.renderTimelineChart():(s.innerHTML=this.renderCurrentTabContent(),this.statsTab==="overview"&&(this.attachChartEvents(),this.renderChart())):(e.innerHTML=this.renderStatsContent(),document.getElementById("three-lens-stats-tabs")&&this.attachStatsTabEvents(e),this.statsTab==="overview"?(this.attachChartEvents(),this.renderChart()):this.statsTab==="timeline"?(this.attachTimelineEvents(),this.renderTimelineChart()):this.statsTab==="resources"&&this.attachResourceEvents())}renderCurrentTabContent(){var i,l,o;const e=this.latestStats;if(!e)return'<div class="three-lens-inspector-empty">Waiting for frame data...</div>';const t=this.latestBenchmark,s=((i=e.performance)==null?void 0:i.fps)??(e.cpuTimeMs>0?Math.round(1e3/e.cpuTimeMs):0),n=((l=e.performance)==null?void 0:l.fpsSmoothed)??s,a=((o=e.performance)==null?void 0:o.fps1PercentLow)??0;switch(this.statsTab){case"overview":return this.renderOverviewTab(e,t,s,n,a);case"memory":return this.renderMemoryTab(e);case"rendering":return this.renderRenderingTab(e);case"timeline":return this.renderTimelineTab(e);case"resources":return this.renderResourcesTab();default:return""}}attachStatsTabEvents(e){e.querySelectorAll(".three-lens-tab").forEach(t=>{t.addEventListener("click",s=>{const n=s.currentTarget.dataset.tab;if(n&&n!==this.statsTab){this.statsTab=n,e.querySelectorAll(".three-lens-tab").forEach(i=>{i.classList.toggle("active",i.dataset.tab===n)});const a=document.getElementById("three-lens-stats-tab-content");a&&(a.innerHTML=this.renderCurrentTabContent(),this.statsTab==="overview"?(this.attachChartEvents(),this.renderChart()):this.statsTab==="timeline"?(this.attachTimelineEvents(),this.renderTimelineChart()):this.statsTab==="resources"&&this.attachResourceEvents())}})})}attachResourceEvents(){var s,n,a,i;const e=document.querySelector('[data-action="toggle-stack-traces"]'),t=e==null?void 0:e.querySelector(".three-lens-toggle-btn");e==null||e.addEventListener("click",()=>{const l=this.probe.isResourceStackTraceCaptureEnabled();this.probe.setResourceStackTraceCapture(!l),t==null||t.classList.toggle("active",!l)}),(s=document.querySelector('[data-action="clear-resource-events"]'))==null||s.addEventListener("click",()=>{this.probe.clearResourceEvents(),this.updateResourcesView()}),(n=document.querySelector('[data-action="run-leak-detection"]'))==null||n.addEventListener("click",()=>{this.probe.runLeakDetection(),this.updateResourcesView()}),(a=document.querySelector('[data-action="generate-leak-report"]'))==null||a.addEventListener("click",()=>{const l=this.probe.generateLeakReport();this.showLeakReport(l)}),(i=document.querySelector('[data-action="clear-leak-alerts"]'))==null||i.addEventListener("click",()=>{this.probe.clearLeakAlerts(),this.updateResourcesView()})}showLeakReport(e){const t=n=>n<1024?`${n}B`:n<1048576?`${(n/1024).toFixed(1)}KB`:`${(n/1048576).toFixed(1)}MB`,s=`
═══════════════════════════════════════════════════════════════
                    3LENS LEAK DETECTION REPORT
═══════════════════════════════════════════════════════════════

Session Duration: ${(e.sessionDurationMs/1e3/60).toFixed(1)} minutes
Generated At: ${new Date().toISOString()}

SUMMARY
───────────────────────────────────────────────────────────────
Total Alerts: ${e.summary.totalAlerts}
  • Critical: ${e.summary.criticalAlerts}
  • Warning: ${e.summary.warningAlerts}
  • Info: ${e.summary.infoAlerts}

Estimated Leaked Memory: ${t(e.summary.estimatedLeakedMemoryBytes)}

RESOURCE STATISTICS
───────────────────────────────────────────────────────────────
Geometries: ${e.resourceStats.geometries.created} created, ${e.resourceStats.geometries.disposed} disposed, ${e.resourceStats.geometries.orphaned} orphaned, ${e.resourceStats.geometries.leaked} leaked
Materials:  ${e.resourceStats.materials.created} created, ${e.resourceStats.materials.disposed} disposed, ${e.resourceStats.materials.orphaned} orphaned, ${e.resourceStats.materials.leaked} leaked
Textures:   ${e.resourceStats.textures.created} created, ${e.resourceStats.textures.disposed} disposed, ${e.resourceStats.textures.orphaned} orphaned, ${e.resourceStats.textures.leaked} leaked

${e.alerts.length>0?`
ALERTS
───────────────────────────────────────────────────────────────
${e.alerts.map(n=>`[${n.severity.toUpperCase()}] ${n.message}
   ${n.details}
   💡 ${n.suggestion}
`).join(`
`)}
`:""}

${e.recommendations.length>0?`
RECOMMENDATIONS
───────────────────────────────────────────────────────────────
${e.recommendations.map((n,a)=>`${a+1}. ${n}`).join(`
`)}
`:""}

═══════════════════════════════════════════════════════════════
`;console.log("%c3Lens Leak Report","font-size: 16px; font-weight: bold; color: #60a5fa;"),console.log(s),alert(`Leak Report Generated!

Check the browser console for the full report.

Summary:
• ${e.summary.totalAlerts} alerts
• ${t(e.summary.estimatedLeakedMemoryBytes)} estimated leaked memory
• ${e.recommendations.length} recommendations`)}updateResourcesView(){const e=document.getElementById("three-lens-stats-tab-content");e&&this.statsTab==="resources"&&(e.innerHTML=this.renderCurrentTabContent(),this.attachResourceEvents())}updateScenePanel(){const e=document.getElementById("three-lens-content-scene");if(e){const t=e.querySelector(".three-lens-inspector-pane"),s=(t==null?void 0:t.scrollTop)??0;e.innerHTML=this.renderSceneContent();const n=document.getElementById("three-lens-panel-scene");if(n&&this.attachTreeEvents(n),requestAnimationFrame(()=>{this.initVirtualScroller(),this.attachVirtualTreeEvents()}),s>0){const a=e.querySelector(".three-lens-inspector-pane");a&&(a.scrollTop=s)}}}updateInspectorPanel(){const e=document.getElementById("three-lens-panel-scene"),t=document.getElementById("three-lens-content-scene");if(!e||!t)return;const s=e.offsetWidth;e.style.minWidth=`${s}px`,this.updateScenePanel(),requestAnimationFrame(()=>{this.updateScenePanelSize()})}updateScenePanelSize(){const e=document.getElementById("three-lens-panel-scene"),t=this.openPanels.get("scene");!e||!t||(e.style.minWidth=`${Y}px`,t.width!==Y&&(t.width=Y,e.style.width=`${Y}px`))}attachTreeEvents(e){e.querySelectorAll(".three-lens-visibility-btn").forEach(t=>{t.addEventListener("click",s=>{s.stopPropagation();const n=t.dataset.id;n&&this.toggleObjectVisibility(n)})}),e.querySelectorAll(".three-lens-toggle-row").forEach(t=>{const s=t.dataset.action,n=t.querySelector(".three-lens-toggle-btn");!n||!s||n.addEventListener("click",a=>{a.stopPropagation();const i=n.classList.contains("active");switch(s){case"toggle-wireframe":this.probe.toggleSelectedWireframe(!i),n.classList.toggle("active",!i);break;case"toggle-boundingbox":this.probe.toggleSelectedBoundingBox(!i),n.classList.toggle("active",!i);break;case"toggle-global-wireframe":this.probe.toggleGlobalWireframe(!i),n.classList.toggle("active",!i);break;case"toggle-transform-gizmo":i?(this.probe.disableTransformGizmo(),n.classList.toggle("active",!1),this.updateScenePanel()):this.probe.enableTransformGizmo().then(()=>{n.classList.toggle("active",!0),this.updateScenePanel()});break;case"toggle-snap":this.probe.setTransformSnapEnabled(!i),n.classList.toggle("active",!i);break}})}),e.querySelectorAll(".three-lens-mode-btn").forEach(t=>{t.addEventListener("click",s=>{s.stopPropagation();const n=t.dataset.mode;n&&this.probe.isTransformGizmoEnabled()&&(this.probe.setTransformMode(n),e.querySelectorAll(".three-lens-mode-btn").forEach(a=>{a.classList.toggle("active",a.dataset.mode===n)}))})}),e.querySelectorAll('.three-lens-option-row[data-action="toggle-space"]').forEach(t=>{const s=t.querySelector(".three-lens-space-btn");s&&s.addEventListener("click",n=>{if(n.stopPropagation(),this.probe.isTransformGizmoEnabled()){const a=this.probe.toggleTransformSpace();s.textContent=a==="world"?"World":"Local"}})}),e.querySelectorAll(".three-lens-undo-btn").forEach(t=>{t.addEventListener("click",s=>{s.stopPropagation(),this.probe.canUndoTransform()&&(this.probe.undoTransform(),this.updateScenePanel())})}),e.querySelectorAll(".three-lens-redo-btn").forEach(t=>{t.addEventListener("click",s=>{s.stopPropagation(),this.probe.canRedoTransform()&&(this.probe.redoTransform(),this.updateScenePanel())})}),e.querySelectorAll(".three-lens-action-btn").forEach(t=>{const s=t.dataset.action;s&&t.addEventListener("click",n=>{switch(n.stopPropagation(),s){case"focus-selected":this.probe.focusOnSelected();break;case"fly-to-selected":this.probe.flyToSelected({duration:800,easing:"easeInOut",onComplete:()=>this.updateScenePanel()}),this.updateScenePanel();break;case"stop-animation":this.probe.stopCameraAnimation(),this.updateScenePanel();break;case"go-home":this.probe.flyHome({duration:600,easing:"easeOut",onComplete:()=>this.updateScenePanel()});break;case"save-home":this.probe.saveCurrentCameraAsHome();break}})}),e.querySelectorAll(".three-lens-camera-item").forEach(t=>{t.addEventListener("click",s=>{s.stopPropagation();const n=parseInt(t.dataset.cameraIndex||"0",10);this.probe.switchToCamera(n)&&this.updateScenePanel()})}),e.querySelectorAll(".three-lens-cost-ranking-item").forEach(t=>{t.addEventListener("click",s=>{s.stopPropagation();const n=t.dataset.id;n&&this.probe.selectByDebugId(n)})}),e.querySelectorAll(".three-lens-node-header").forEach(t=>{t.addEventListener("click",s=>{if(s.target.closest(".three-lens-visibility-btn"))return;const n=t.parentElement,a=n==null?void 0:n.dataset.id;if(!a)return;const i=s.target.closest(".three-lens-node-toggle");if(i&&!i.classList.contains("hidden")){this.expandedNodes.has(a)?this.expandedNodes.delete(a):this.expandedNodes.add(a),this.updateScenePanel();return}this.selectedNodeId===a?this.probe.selectObject(null):this.probe.selectByDebugId(a)})})}toggleObjectVisibility(e){const t=this.selectedNodeId;if(this.probe.selectByDebugId(e)){const s=this.probe.getSelectedObject();s&&(s.visible=!s.visible)}t?this.probe.selectByDebugId(t):this.probe.selectObject(null),this.selectedNodeId=t,this.updateScenePanel(),this.updateInspectorPanel()}attachVirtualTreeEvents(){const e=document.getElementById("three-lens-virtual-tree");e&&e.addEventListener("click",t=>{const s=t.target,n=s.closest(".three-lens-visibility-btn");if(n){const o=n.dataset.id;o&&this.toggleObjectVisibility(o);return}const a=s.closest(".three-lens-virtual-row");if(!a)return;const i=a.dataset.id;if(!i)return;const l=s.closest(".three-lens-node-toggle");if(l&&!l.classList.contains("hidden")){this.expandedNodes.has(i)?this.expandedNodes.delete(i):this.expandedNodes.add(i),this.virtualScroller&&(this.virtualScroller.rebuildFlattenedList(),this.virtualScroller.forceRender()),this.updateInspectorPane();return}this.selectedNodeId===i?this.probe.selectObject(null):this.probe.selectByDebugId(i)})}updateInspectorPane(){const e=document.getElementById("three-lens-content-scene");if(!e)return;const t=e.querySelector(".three-lens-inspector-pane");if(!t)return;const s=this.probe.takeSnapshot(),n=this.selectedNodeId?this.findNodeById(s.scenes,this.selectedNodeId):null;t.innerHTML=n?this.renderNodeInspector(n):this.renderGlobalTools();const a=document.getElementById("three-lens-panel-scene");a&&this.attachTreeEvents(a)}getVisibleFrameCount(){return Math.max(10,Math.floor(60/this.chartZoom))}getVisibleFrameData(){const e=this.getVisibleFrameCount(),t=this.frameHistory.length-this.chartOffset,s=Math.max(0,t-e);return this.frameHistory.slice(s,t)}getFrameTimeMin(){const e=this.getVisibleFrameData();return e.length>0?Math.min(...e):0}getFrameTimeMax(){const e=this.getVisibleFrameData();return e.length>0?Math.max(...e):0}getFrameTimeAvg(){const e=this.getVisibleFrameData();return e.length===0?0:e.reduce((t,s)=>t+s,0)/e.length}getFrameTimeJitter(){const e=this.getVisibleFrameData();if(e.length<2)return 0;const t=this.getFrameTimeAvg(),s=e.reduce((n,a)=>n+Math.pow(a-t,2),0)/e.length;return Math.sqrt(s)}handleChartZoomIn(){this.chartZoom<4&&(this.chartZoom*=1.5,this.updateChartView())}handleChartZoomOut(){this.chartZoom>.5&&(this.chartZoom/=1.5,this.chartOffset=Math.max(0,Math.min(this.chartOffset,this.frameHistory.length-this.getVisibleFrameCount())),this.updateChartView())}handleChartReset(){this.chartZoom=1,this.chartOffset=0,this.updateChartView()}updateChartView(){this.renderChart();const e=document.getElementById("three-lens-chart-zoom-label");e&&(e.textContent=`${this.getVisibleFrameCount()}f`);const t=document.getElementById("three-lens-chart-min"),s=document.getElementById("three-lens-chart-avg"),n=document.getElementById("three-lens-chart-max"),a=document.getElementById("three-lens-chart-jitter");t&&(t.textContent=`${this.getFrameTimeMin().toFixed(1)}ms`),s&&(s.textContent=`${this.getFrameTimeAvg().toFixed(1)}ms`),n&&(n.textContent=`${this.getFrameTimeMax().toFixed(1)}ms`),a&&(a.textContent=`${this.getFrameTimeJitter().toFixed(1)}ms`)}attachChartEvents(){var n,a,i,l;const e=document.getElementById("three-lens-chart-container"),t=document.getElementById("three-lens-stats-chart"),s=document.getElementById("three-lens-chart-tooltip");!e||!t||((n=document.getElementById("three-lens-chart-zoom-in"))==null||n.addEventListener("click",()=>this.handleChartZoomIn()),(a=document.getElementById("three-lens-chart-zoom-out"))==null||a.addEventListener("click",()=>this.handleChartZoomOut()),(i=document.getElementById("three-lens-chart-reset"))==null||i.addEventListener("click",()=>this.handleChartReset()),(l=document.querySelector('[data-action="clear-violations"]'))==null||l.addEventListener("click",()=>{this.probe.clearViolations();const o=document.getElementById("three-lens-stats-tab-content");o&&(o.innerHTML=this.renderCurrentTabContent(),this.attachChartEvents(),this.renderChart())}),e.addEventListener("wheel",o=>{o.preventDefault(),o.deltaY<0?this.handleChartZoomIn():this.handleChartZoomOut()}),e.addEventListener("mousedown",o=>{this.chartDragging=!0,this.chartDragStartX=o.clientX,this.chartDragStartOffset=this.chartOffset,e.style.cursor="grabbing"}),document.addEventListener("mousemove",o=>{if(this.chartDragging){const d=o.clientX-this.chartDragStartX,c=this.getVisibleFrameCount(),p=c/t.getBoundingClientRect().width,g=Math.round(d*p),u=Math.max(0,this.frameHistory.length-c);this.chartOffset=Math.max(0,Math.min(u,this.chartDragStartOffset-g)),this.updateChartView()}}),document.addEventListener("mouseup",()=>{this.chartDragging&&(this.chartDragging=!1,e&&(e.style.cursor="grab"))}),t.addEventListener("mousemove",o=>{if(this.chartDragging||!s)return;const d=t.getBoundingClientRect(),c=o.clientX-d.left,p=this.getVisibleFrameData(),g=d.width/p.length,u=Math.floor(c/g);if(u>=0&&u<p.length){this.chartHoverIndex=u;const m=p[u],f=m>0?Math.round(1e3/m):0;s.style.display="block",s.style.left=`${Math.min(c,d.width-80)}px`,s.style.top="-40px";const v=s.querySelector(".three-lens-tooltip-time"),b=s.querySelector(".three-lens-tooltip-fps");v&&(v.textContent=`${m.toFixed(2)}ms`),b&&(b.textContent=`${f} FPS`),this.renderChart()}}),t.addEventListener("mouseleave",()=>{s&&(s.style.display="none"),this.chartHoverIndex=null,this.renderChart()}))}renderChart(){const e=document.getElementById("three-lens-stats-chart"),t=this.getVisibleFrameData();if(!e||t.length<2)return;const s=e.getContext("2d");if(!s)return;const n=e.getBoundingClientRect();e.width=n.width*window.devicePixelRatio,e.height=n.height*window.devicePixelRatio,s.scale(window.devicePixelRatio,window.devicePixelRatio);const{width:a,height:i}=n,l={top:4,bottom:4,left:0,right:0},o=a-l.left-l.right,d=i-l.top-l.bottom;s.clearRect(0,0,a,i);const c=Math.max(...t,16.67),p=Math.ceil(c/8.33)*8.33,g=o/t.length,u=Math.max(1,g*.15);s.strokeStyle="rgba(45, 55, 72, 0.5)",s.lineWidth=1,s.setLineDash([]),[16.67,33.33].forEach(C=>{if(C<=p){const E=l.top+d-C/p*d;s.beginPath(),s.moveTo(l.left,E),s.lineTo(a-l.right,E),s.stroke()}}),s.strokeStyle="rgba(52, 211, 153, 0.6)",s.setLineDash([4,4]),s.lineWidth=1.5;const f=l.top+d-16.67/p*d;s.beginPath(),s.moveTo(l.left,f),s.lineTo(a-l.right,f),s.stroke(),s.setLineDash([]);const v=this.getFrameTimeAvg();if(v>0){s.strokeStyle="rgba(251, 191, 36, 0.5)",s.setLineDash([2,4]),s.lineWidth=1;const C=l.top+d-v/p*d;s.beginPath(),s.moveTo(l.left,C),s.lineTo(a-l.right,C),s.stroke(),s.setLineDash([])}const b=s.createLinearGradient(0,i,0,0);b.addColorStop(0,"rgba(52, 211, 153, 0.9)"),b.addColorStop(1,"rgba(34, 211, 238, 0.9)");const k=s.createLinearGradient(0,i,0,0);k.addColorStop(0,"rgba(251, 191, 36, 0.9)"),k.addColorStop(1,"rgba(245, 158, 11, 0.9)");const V=s.createLinearGradient(0,i,0,0);V.addColorStop(0,"rgba(239, 68, 68, 0.9)"),V.addColorStop(1,"rgba(248, 113, 113, 0.9)"),t.forEach((C,E)=>{const z=l.left+E*g+u/2,x=C/p*d,$=l.top+d-x,F=g-u;C<=16.67?s.fillStyle=b:C<=33.33?s.fillStyle=k:s.fillStyle=V,this.chartHoverIndex===E&&(s.fillStyle="rgba(96, 165, 250, 1)",s.shadowColor="rgba(96, 165, 250, 0.5)",s.shadowBlur=8);const I=Math.min(3,F/2);s.beginPath(),s.moveTo(z+I,$),s.lineTo(z+F-I,$),s.quadraticCurveTo(z+F,$,z+F,$+I),s.lineTo(z+F,$+x),s.lineTo(z,$+x),s.lineTo(z,$+I),s.quadraticCurveTo(z,$,z+I,$),s.closePath(),s.fill(),s.shadowBlur=0}),s.strokeStyle="rgba(96, 165, 250, 0.8)",s.lineWidth=2,s.lineJoin="round",s.lineCap="round",s.beginPath(),t.forEach((C,E)=>{const z=l.left+E*g+g/2,x=l.top+d-C/p*d;E===0?s.moveTo(z,x):s.lineTo(z,x)}),s.stroke(),t.forEach((C,E)=>{const z=l.left+E*g+g/2,x=l.top+d-C/p*d;this.chartHoverIndex===E&&(s.beginPath(),s.arc(z,x,4,0,Math.PI*2),s.fillStyle="#60a5fa",s.fill(),s.strokeStyle="#fff",s.lineWidth=2,s.stroke())})}attachTimelineEvents(){var a,i,l,o,d,c;const e=document.getElementById("three-lens-timeline-chart-container"),t=document.getElementById("three-lens-timeline-chart"),s=document.getElementById("three-lens-timeline-tooltip");if(!e||!t)return;(a=document.getElementById("three-lens-timeline-record"))==null||a.addEventListener("click",()=>{this.isRecording=!this.isRecording,this.isRecording&&(this.recordedFrames=[]),this.updateTimelineView()}),(i=document.getElementById("three-lens-timeline-clear"))==null||i.addEventListener("click",()=>{this.recordedFrames=[],this.updateTimelineView()});const n=document.getElementById("three-lens-timeline-buffer-size");n==null||n.addEventListener("change",()=>{for(this.frameBufferSize=parseInt(n.value,10),this.maxHistoryLength=this.frameBufferSize;this.frameHistory.length>this.frameBufferSize;)this.frameHistory.shift();for(;this.gpuHistory.length>this.frameBufferSize;)this.gpuHistory.shift();for(;this.fpsHistory.length>this.frameBufferSize;)this.fpsHistory.shift();for(;this.drawCallHistory.length>this.frameBufferSize;)this.drawCallHistory.shift();for(;this.triangleHistory.length>this.frameBufferSize;)this.triangleHistory.shift();this.updateTimelineView()}),(l=document.getElementById("three-lens-timeline-zoom-in"))==null||l.addEventListener("click",()=>{this.timelineZoom=Math.min(10,this.timelineZoom*1.5),this.updateTimelineView()}),(o=document.getElementById("three-lens-timeline-zoom-out"))==null||o.addEventListener("click",()=>{this.timelineZoom=Math.max(.1,this.timelineZoom/1.5),this.updateTimelineView()}),(d=document.getElementById("three-lens-timeline-reset"))==null||d.addEventListener("click",()=>{this.timelineZoom=1,this.timelineOffset=0,this.timelineSelectedFrame=null,this.updateTimelineView()}),(c=document.getElementById("three-lens-timeline-close-details"))==null||c.addEventListener("click",()=>{this.timelineSelectedFrame=null,this.updateTimelineView()}),e.addEventListener("wheel",p=>{p.preventDefault(),p.deltaY<0?this.timelineZoom=Math.min(10,this.timelineZoom*1.2):this.timelineZoom=Math.max(.1,this.timelineZoom/1.2),this.updateTimelineView()}),e.addEventListener("mousedown",p=>{this.timelineDragging=!0,this.timelineDragStartX=p.clientX,this.timelineDragStartOffset=this.timelineOffset,e.style.cursor="grabbing"}),document.addEventListener("mousemove",p=>{if(this.timelineDragging){const g=p.clientX-this.timelineDragStartX,u=this.getTimelineVisibleFrameCount(),m=t.getBoundingClientRect(),f=u/m.width,v=Math.round(g*f),b=Math.max(0,this.frameHistory.length-u);this.timelineOffset=Math.max(0,Math.min(b,this.timelineDragStartOffset-v)),this.updateTimelineView()}}),document.addEventListener("mouseup",()=>{this.timelineDragging&&(this.timelineDragging=!1,e&&(e.style.cursor="default"))}),t.addEventListener("click",p=>{const g=t.getBoundingClientRect(),u=p.clientX-g.left,m=this.getTimelineVisibleFrameCount(),f=g.width/m,v=Math.floor(u/f)+this.timelineOffset;v>=0&&v<this.frameHistory.length&&(this.timelineSelectedFrame=v,this.updateTimelineView())}),t.addEventListener("mouseenter",()=>{this.timelinePaused=!0}),t.addEventListener("mousemove",p=>{const g=t.getBoundingClientRect(),u=p.clientX-g.left,m=this.getTimelineVisibleFrameCount(),f=g.width/m,v=Math.floor(u/f)+this.timelineOffset;if(this.timelineHoverIndex=v,v>=0&&v<this.frameHistory.length&&s){const b=this.frameHistory[v],k=this.gpuHistory[v],V=b>0?1e3/b:0;s.style.display="block",s.style.left=`${p.clientX-g.left+10}px`,s.style.top=`${p.clientY-g.top-10}px`,s.innerHTML=`
          <div>Frame #${v+1}</div>
          <div>CPU: ${b.toFixed(2)}ms</div>
          ${k!==void 0?`<div>GPU: ${k.toFixed(2)}ms</div>`:""}
          <div>FPS: ${V.toFixed(1)}</div>
        `}}),t.addEventListener("mouseleave",()=>{s&&(s.style.display="none"),this.timelineHoverIndex=null,this.timelinePaused=!1})}updateTimelineView(){const e=document.getElementById("three-lens-stats-tab-content");e&&this.statsTab==="timeline"&&(e.innerHTML=this.renderCurrentTabContent(),this.attachTimelineEvents(),this.renderTimelineChart())}renderTimelineChart(){const e=document.getElementById("three-lens-timeline-chart");if(!e)return;const t=this.getTimelineVisibleFrameCount(),s=Math.max(0,this.frameHistory.length-t-this.timelineOffset),n=Math.min(this.frameHistory.length,s+t),a=this.frameHistory.slice(s,n),i=this.gpuHistory.slice(s,n),l=this.detectSpikes(33.33).filter(x=>x>=s&&x<n).map(x=>x-s);if(a.length===0)return;const o=e.getContext("2d");if(!o)return;const d=e.getBoundingClientRect();e.width=d.width*window.devicePixelRatio,e.height=d.height*window.devicePixelRatio,o.scale(window.devicePixelRatio,window.devicePixelRatio);const{width:c,height:p}=d,g={top:20,bottom:20,left:40,right:10},u=c-g.left-g.right,m=p-g.top-g.bottom;o.clearRect(0,0,c,p);const f=Math.max(...a,16.67),v=i.length>0?Math.max(...i,16.67):0,b=Math.ceil(Math.max(f,v,33.33)/8.33)*8.33,k=u/a.length;o.strokeStyle="rgba(45, 55, 72, 0.3)",o.lineWidth=1,o.setLineDash([]),[16.67,33.33,50,66.67].forEach(x=>{if(x<=b){const $=g.top+m-x/b*m;o.beginPath(),o.moveTo(g.left,$),o.lineTo(c-g.right,$),o.stroke(),o.fillStyle="rgba(156, 163, 175, 0.8)",o.font="10px monospace",o.textAlign="right",o.fillText(`${x.toFixed(0)}ms`,g.left-5,$+3)}}),o.strokeStyle="rgba(52, 211, 153, 0.5)",o.setLineDash([4,4]),o.lineWidth=1;const C=g.top+m-16.67/b*m;o.beginPath(),o.moveTo(g.left,C),o.lineTo(c-g.right,C),o.stroke(),o.strokeStyle="rgba(245, 158, 11, 0.5)";const E=g.top+m-33.33/b*m;o.beginPath(),o.moveTo(g.left,E),o.lineTo(c-g.right,E),o.stroke(),o.setLineDash([]),a.forEach((x,$)=>{const F=g.left+$*k,I=x/b*m,K=g.top+m-I,Ue=l.includes($),Ve=this.timelineSelectedFrame===s+$,We=this.timelineHoverIndex===s+$;o.fillStyle=Ue?"rgba(239, 68, 68, 0.8)":"rgba(96, 165, 250, 0.6)",We&&(o.fillStyle="rgba(147, 197, 253, 1)"),Ve&&(o.fillStyle="rgba(96, 165, 250, 1)",o.strokeStyle="#fff",o.lineWidth=2,o.strokeRect(F,K,k-1,I)),o.fillRect(F,K,k-1,I)}),i.length>0&&i.forEach((x,$)=>{if(x>0){const F=g.left+$*k,I=x/b*m,K=g.top+m-I;o.fillStyle="rgba(34, 197, 94, 0.6)",o.fillRect(F,K,k-1,I)}}),o.fillStyle="rgba(156, 163, 175, 0.8)",o.font="9px monospace",o.textAlign="center";const z=Math.max(1,Math.floor(a.length/10));for(let x=0;x<a.length;x+=z){const $=g.left+x*k+k/2;o.fillText(`${s+x+1}`,$,p-g.bottom+12)}}destroy(){var e;this.virtualScroller&&(this.virtualScroller.dispose(),this.virtualScroller=null),this.root.remove(),(e=document.getElementById("three-lens-styles"))==null||e.remove()}showPanel(e){this.openPanels.has(e)||this.openPanel(e)}hidePanel(e){this.closePanel(e)}toggle(){this.menuVisible=!this.menuVisible,this.updateMenu()}}function ws(r,e={}){return new ys({probe:r,...e})}const $s=document.getElementById("canvas-container"),S=new Ze;S.name="MainScene";const D=new xe(60,window.innerWidth/window.innerHeight,.1,1e3);D.name="MainCamera";D.position.set(5,5,8);D.lookAt(0,0,0);const P=new Ke({antialias:!0});P.setSize(window.innerWidth,window.innerHeight);P.setPixelRatio(window.devicePixelRatio);P.setClearColor(658964);P.shadowMap.enabled=!0;P.shadowMap.type=Xe;$s.appendChild(P.domElement);const Ee=new _e(16777215,.4);Ee.name="AmbientLight";S.add(Ee);const L=new Je(16777215,1);L.name="DirectionalLight";L.position.set(5,10,5);L.castShadow=!0;L.shadow.mapSize.width=2048;L.shadow.mapSize.height=2048;L.shadow.camera.near=.5;L.shadow.camera.far=50;L.shadow.camera.left=-10;L.shadow.camera.right=10;L.shadow.camera.top=10;L.shadow.camera.bottom=-10;L.shadow.bias=-1e-4;S.add(L);const B=new Qe(2282478,2,20);B.name="PointLight_Cyan";B.position.set(-3,3,3);B.castShadow=!0;B.shadow.mapSize.width=512;B.shadow.mapSize.height=512;B.shadow.camera.near=.5;B.shadow.camera.far=20;S.add(B);const T=new et(16020150,3);T.name="SpotLight_Pink";T.position.set(4,6,-3);T.angle=Math.PI/6;T.penumbra=.3;T.decay=2;T.distance=30;T.castShadow=!0;T.shadow.mapSize.width=1024;T.shadow.mapSize.height=1024;T.shadow.camera.near=1;T.shadow.camera.far=30;T.target.position.set(0,0,0);T.target.name="SpotLight_Target";S.add(T);S.add(T.target);const Le=new oe(20,20);Le.name="GroundPlane";const ks=new j({name:"GroundMaterial",color:1712684,roughness:.8,metalness:.2}),Z=new R(Le,ks);Z.name="Ground";Z.rotation.x=-Math.PI/2;Z.position.y=-1;Z.receiveShadow=!0;S.add(Z);const Ie=new ye(1,32,32);Ie.name="CentralSphereGeometry";const Ss=new j({name:"BlueSphere",color:6333946,roughness:.2,metalness:.8}),ee=new R(Ie,Ss);ee.name="CentralSphere";ee.castShadow=!0;S.add(ee);const te=new we;te.name="CubeGroup";S.add(te);const ie=new j({name:"GoldMaterial",color:16498468,roughness:.3,metalness:.8}),fe=new j({name:"EmeraldMaterial",color:3462041,roughness:.2,metalness:.6}),Fe=new $e(.5,.5,.5);Fe.name="SharedCubeGeometry";const Ms=[{color:16498468,material:ie},{color:3462041,material:fe},{color:16478597,material:null},{color:16498468,material:ie},{color:10980346,material:null},{color:3462041,material:fe},{color:16020150,material:null},{color:16498468,material:ie}];for(let r=0;r<8;r++){const e=Ms[r],t=e.material||new j({color:e.color,roughness:.3,metalness:.6}),s=new R(Fe,t);s.name=`Cube_${r+1}`,s.position.set(Math.cos(r/8*Math.PI*2)*3,0,Math.sin(r/8*Math.PI*2)*3),s.castShadow=!0,te.add(s)}const Be=new tt(.6,.2,100,16);Be.name="TorusKnotGeometry";const Ts=new j({name:"CyanMetal",color:2282478,roughness:.1,metalness:.9}),W=new R(Be,Ts);W.name="TorusKnot";W.position.set(0,2,0);W.castShadow=!0;S.add(W);const se=new st(256,{generateMipmaps:!0,minFilter:rt});se.texture.name="ReflectionCubeMap";const X=new nt(.1,100,se);X.name="ReflectionCubeCamera";S.add(X);const Re=new ye(.7,32,32);Re.name="MirrorSphereGeometry";const Cs=new j({name:"ChromeMirrorMaterial",color:16777215,roughness:0,metalness:1,envMap:se.texture,envMapIntensity:1}),O=new R(Re,Cs);O.name="MirrorBall";O.position.set(-3,.7,-2);O.castShadow=!0;S.add(O);const re=new at(512,512,{minFilter:ge,magFilter:ge});re.texture.name="MonitorFeed";const ne=new xe(70,1,.1,100);ne.name="OverheadCamera";ne.position.set(0,12,0);ne.lookAt(0,0,0);const G=new we;G.name="FloatingMonitor";G.position.set(6,2.5,0);G.rotation.y=-Math.PI/3;S.add(G);const Ae=new oe(2,1.5);Ae.name="ScreenPlane";const zs=new ke({name:"MonitorScreenMaterial",map:re.texture}),_=new R(Ae,zs);_.name="MonitorScreen";G.add(_);const Ge=new $e(2.2,1.7,.1);Ge.name="FrameBox";const Ps=new j({name:"MonitorFrameMaterial",color:2282478,roughness:.3,metalness:.9,emissive:2282478,emissiveIntensity:.3}),de=new R(Ge,Ps);de.name="MonitorFrame";de.position.z=-.06;G.add(de);const He=new Se(.05,.05,2,16);He.name="StandPole";const Ne=new j({name:"StandMetal",color:3621201,roughness:.5,metalness:.8}),ce=new R(He,Ne);ce.name="MonitorStand";ce.position.set(0,-1.6,-.1);G.add(ce);const De=new Se(.3,.4,.1,16);De.name="StandBase";const pe=new R(De,Ne);pe.name="MonitorBase";pe.position.set(0,-2.6,-.1);G.add(pe);const je=new oe(1.5,.2);je.name="LabelPlane";const Es=new ke({name:"LabelGlow",color:2282478,transparent:!0,opacity:.8}),he=new R(je,Es);he.name="MonitorLabel";he.position.set(0,-.95,.01);G.add(he);const H=it({appName:"Basic Example",debug:!0,rules:{maxDrawCalls:100,maxTriangles:1e5,maxFrameTimeMs:16.67}});H.setThreeReference(J);H.observeRenderer(P);H.observeScene(S);H.initializeInspectMode(P.domElement,D,J);H.initializeTransformGizmo(S,D,P.domElement,J);H.initializeCameraController(D,J,{x:0,y:0,z:0});H.observeRenderTarget(se,"reflection");H.observeRenderTarget(re,"custom");const Ls=ws(H);let N=0,le=0;function Oe(){requestAnimationFrame(Oe),N+=.016,le++,te.children.forEach((e,t)=>{e.rotation.x+=.01,e.rotation.y+=.02,e.position.y=Math.sin(N*2+t)*.3}),W.rotation.x+=.005,W.rotation.y+=.01;const r=1+Math.sin(N*3)*.1;ee.scale.set(r,r,r),B.position.x=Math.sin(N)*5,B.position.z=Math.cos(N)*5,T.position.x=Math.cos(N*.5)*6,T.position.z=Math.sin(N*.5)*6,O.position.y=.7+Math.sin(N*1.2)*.2,G.rotation.y=-Math.PI/3+Math.sin(N*.3)*.1,le%10===0&&(O.visible=!1,X.position.copy(O.position),X.update(P,S),O.visible=!0),le%5===0&&(_.visible=!1,P.setRenderTarget(re),P.clear(),P.render(S,ne),P.setRenderTarget(null),_.visible=!0),P.render(S,D)}Oe();window.addEventListener("resize",()=>{D.aspect=window.innerWidth/window.innerHeight,D.updateProjectionMatrix(),P.setSize(window.innerWidth,window.innerHeight)});let q=!1;window.addEventListener("keydown",r=>{if(r.key==="d"&&r.ctrlKey&&r.shiftKey&&(Ls.toggle(),r.preventDefault()),r.key==="i"||r.key==="I"){q=!q,H.setInspectModeEnabled(q);const e=document.getElementById("inspect-indicator");if(e)e.style.display=q?"block":"none";else if(q){const t=document.createElement("div");t.id="inspect-indicator",t.style.cssText=`
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(34, 211, 238, 0.9);
        color: #000;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 14px;
        font-weight: bold;
        z-index: 1000000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        pointer-events: none;
      `,t.textContent="🔍 INSPECT MODE: Click objects to select them | Press I to disable",document.body.appendChild(t)}r.preventDefault()}});const ae=document.createElement("div");ae.id="inspect-indicator";ae.style.cssText=`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(34, 211, 238, 0.9);
  color: #000;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  font-weight: bold;
  z-index: 1000000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  display: none;
`;ae.textContent="🔍 INSPECT MODE: Click objects to select them | Press I to disable";document.body.appendChild(ae);console.log("🔍 3Lens initialized.");console.log("");console.log("⌨️  Keyboard Shortcuts:");console.log("   • Ctrl+Shift+D - Toggle devtool overlay");console.log("   • I - Toggle inspect mode (click objects to select)");console.log("");console.log("📺 Render Targets in this demo:");console.log("   • 3x Shadow Maps (DirectionalLight, PointLight, SpotLight)");console.log("   • 1x Cube Render Target (Mirror Ball reflections)");console.log("   • 1x 2D Render Target (Floating Monitor feed)");
