# Contract: Overhead & Capture Modes

## Purpose

3Lens must not become the performance problem.
Overhead must be controllable, observable, and bounded via capture modes.

## Capture Modes

```typescript
type CaptureMode = 'MINIMAL' | 'STANDARD' | 'DEEP';

interface CaptureModeConfig {
  mode: CaptureMode;
  autoDegrade: boolean;      // Auto-switch to lower mode under pressure
  overheadBudgetMs: number;  // Max ms per frame for capture
  bufferSizeMB: number;      // Max memory for trace buffer
}
```

### MINIMAL
- Low overhead counters/signals only
- Frame count, basic timing, resource counts
- No per-draw events
- No detailed resource tracking
- Suitable for production monitoring

### STANDARD
- Event stream + core relationships
- Resource lifecycle events
- Render events with basic attribution
- Suitable for development debugging

### DEEP
- Full instrumentation (passes, detailed resource updates)
- Shader compilation tracking
- Detailed timing breakdowns
- Requires explicit enable
- Suitable for performance investigation

## Invariants (MUST ALWAYS HOLD)

1. **Capture modes exist and are enforced:**
   - System MUST respect the configured mode.
   - Mode affects what events are emitted.

2. **UI update throttling:**
   - UI MUST coalesce updates (e.g., 10-30hz) even if capture is per-frame.
   - Never render UI faster than necessary.

3. **Trace memory control:**
   - Ring buffer or bounded storage MUST exist for live sessions.
   - Buffer size is configurable with hard limits.

4. **Deep capture gating:**
   - DEEP mode MUST require explicit enable (user action or explicit config).
   - DEEP mode MUST be visible in UI (indicator showing active mode).

## Observability (MUST PROVIDE)

```typescript
interface OverheadMetrics {
  captureTimeMs: number;      // Time spent in capture per frame
  eventRate: number;          // Events per second
  bufferUsedBytes: number;    // Current buffer usage
  bufferCapacityBytes: number;// Total buffer capacity
  dropCount: number;          // Events dropped due to pressure
  currentMode: CaptureMode;   // Active capture mode
}
```

- Internal overhead metrics exposed via `lens.getOverheadMetrics()`
- Doctor reports overhead health
- UI shows capture mode indicator

## Degradation Rules

- If overhead exceeds configured budget:
  - System MUST auto-degrade (DEEP->STANDARD->MINIMAL) if autoDegrade enabled.
  - System MUST emit a warning event describing degradation.
- If trace buffer fills:
  - System MUST apply bounded policy (drop oldest, compress, or stop).
  - System MUST report the policy applied.

## Auto-Degrade Triggers

```typescript
interface DegradeTriggers {
  frameOverheadMs: number;    // Degrade if capture exceeds this per frame
  eventRatePerSec: number;    // Degrade if event rate exceeds this
  bufferUsagePercent: number; // Degrade if buffer exceeds this percentage
}
```

## Acceptance Tests

- **Mode enforcement:**
  - In MINIMAL mode, detailed resource events are not emitted.
  - In STANDARD mode, per-draw events are limited.
  - In DEEP mode, all events are captured.
- **UI throttling:**
  - With high event rate, UI update rate remains capped.
- **Budget trigger:**
  - Simulated overhead spike triggers auto-degrade and warning emission.
- **Trace bounds:**
  - Ring buffer never grows unbounded in long-running sessions.

## Anti-goals

- Always-on deep capture by default
- UI rendering on every event
- Unbounded in-memory traces in live mode
- Hidden capture mode (user should always know)
- Capture that makes the app noticeably slower
