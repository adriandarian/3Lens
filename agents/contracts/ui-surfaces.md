# Contract: UI Surfaces (Modes)

## Purpose

Define supported UI surfaces and ensure consistent behavior across:
- In-app overlay
- Docked panel
- Separate window/tab (trace viewer)
- Extension DevTools panel (optional)

## Supported Modes

```typescript
type UISurface = 'overlay' | 'dock' | 'window' | 'extension';

interface UISurfaceConfig {
  mode: UISurface;
  target?: HTMLElement;     // For dock mode
  transport?: LensTransport; // For remote modes
  readonly?: boolean;        // Disable mutations
}
```

### 1. Overlay
Floating UI above app canvas.
- Draggable and resizable
- Click-through mode (hold modifier key to pass events to canvas)
- Minimal HUD sub-mode (tiny FPS/context display only)
- Mounts to `document.body` by default

### 2. Dock
UI rendered inside host-provided container.
- Left, right, or bottom positioning
- Host app owns the container element
- 3Lens renders as DOM island inside container
- Respects host layout constraints

### 3. Window
Separate browser window/tab.
- Live streaming mode (connected to runtime via transport)
- Offline mode (load trace files for analysis)
- Popup must be user-initiated (browser security)
- Can run independently of host app

### 4. Extension
Browser DevTools panel (Chromium-based).
- "Connected" vs "Limited" mode clearly indicated
- Full power when runtime client present
- Limited mode when no runtime (basic inspection only)
- DevTools lifecycle (panel only exists when devtools open)

## Invariants (MUST ALWAYS HOLD)

1. **Same UI Core:**
   - All modes MUST render the same UI core; only mounting/transport differs.
   - No mode-specific feature implementations.

2. **Context awareness:**
   - Mode MUST expose context selector and show active context clearly.
   - Context switch works identically across modes.

3. **Fidelity visibility:**
   - Mode MUST display fidelity (EXACT/ESTIMATED/UNAVAILABLE) for core metrics.
   - No mode hides fidelity information.

4. **Doctor availability:**
   - Mode MUST include an accessible Doctor view/report for troubleshooting.

5. **Read-only option:**
   - Mode MUST support read-only operation (commands disabled) via config.

## Mode-Specific Requirements

### Overlay
- MUST support click-through to avoid breaking canvas controls
- MUST support keyboard shortcut to toggle visibility
- MUST support minimize/collapse to HUD mode
- MUST NOT steal focus unexpectedly

### Dock
- Host app owns layout; 3Lens MUST NOT mutate page layout outside target container
- MUST provide resize handle within container
- MUST handle container resize gracefully

### Window
- MUST support both live streaming and offline trace viewing
- Popup MUST be user-initiated (button click, not automatic)
- MUST handle transport disconnect gracefully
- MUST show connection status clearly

### Extension
- MUST clearly indicate connection status (Connected/Limited)
- MUST provide "copy snippet" to install runtime hooks
- MUST work without runtime (trace viewing only)
- MUST handle DevTools open/close lifecycle

## Degradation Rules

- If CSS injection is blocked (CSP):
  - UI MUST switch to CSP-safe styling mode (external CSS) or warn and degrade visuals.
- If transport unavailable (window/extension):
  - UI MUST operate in offline trace mode if possible, or show actionable error.
- If popup blocked:
  - UI MUST show instructions to allow popups.

## Acceptance Tests

- **Mode parity:**
  - Same trace loaded in overlay/dock/window produces identical panels and query results.
- **Input policy:**
  - Overlay mode does not prevent normal camera controls when unfocused.
- **Connection status:**
  - Extension mode shows "Connected" status correctly and disables unsupported actions.
- **CSP fallback:**
  - UI renders acceptably with CSP-safe styling mode.

## Anti-goals

- Separate UIs per mode (must share UI core)
- Mode-specific feature sets without explicit documentation
- Assuming overlay is always possible
- Blocking user interaction unexpectedly
