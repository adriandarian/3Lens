# Contract: Compatibility

## Purpose

Make 3Lens predictable across:
- three.js version variance
- WebGL1/WebGL2/WebGPU backends
- CSP/enterprise restrictions
- Browser differences

Compatibility must be explicit, tiered, and reported via Doctor.

## Support Tiers

```typescript
type SupportTier = 'SUPPORTED' | 'COMPATIBLE' | 'UNKNOWN';

interface CompatibilityReport {
  three_version: string;
  three_tier: SupportTier;
  backend: 'webgl1' | 'webgl2' | 'webgpu';
  capabilities: CapabilityMatrix;
  warnings: string[];
  recommendations: string[];
}
```

### SUPPORTED
- Tested against defined version range
- Expected full operation where backend allows
- All hooks verified working
- Regression tests passing

### COMPATIBLE
- Runs best-effort
- Some capabilities may degrade
- Not fully tested but expected stable
- Doctor warns about potential issues

### UNKNOWN
- Not tested
- Default to minimal capture mode
- Require explicit opt-in for full features
- Doctor warns loudly

## Version Support Policy

### Rolling Window
- Support last N minor three.js releases (e.g., last 6 "r" versions)
- Define explicit `supported_range` in package metadata

### Compatibility Adapter
- Version-specific logic isolated in adapter layer
- Feature detection before version checks
- Graceful degradation on hook failure

## Capability Matrix

```typescript
interface CapabilityMatrix {
  // Capture capabilities
  render_events: CapabilityStatus;
  resource_lifecycle: CapabilityStatus;
  pass_boundaries: CapabilityStatus;
  
  // Timing capabilities
  cpu_timing: CapabilityStatus;
  gpu_timing: CapabilityStatus;
  
  // Introspection capabilities
  shader_source: CapabilityStatus;
  shader_module: CapabilityStatus;
  pipeline_state: CapabilityStatus;
  draw_visibility: CapabilityStatus;
  
  // UI capabilities
  style_injection: CapabilityStatus;
  popup_windows: CapabilityStatus;
}

interface CapabilityStatus {
  available: boolean;
  fidelity: Fidelity;
  reason?: string;
}
```

## Backend Differences

### WebGL1
- Limited timer queries (spotty support)
- Basic shader introspection
- Implicit pipeline state
- Draw calls visible

### WebGL2
- Better timer queries
- Better shader introspection
- Implicit pipeline state
- Draw calls visible

### WebGPU
- Explicit render passes (better observability)
- Timestamp queries (browser-gated)
- WGSL shaders (different introspection)
- Draw calls less visible (command buffers)
- Pipeline objects explicit

## WebGPU-Specific Considerations

```typescript
interface WebGPUCapabilities {
  timestamp_queries: boolean;      // Requires feature request
  pipeline_statistics: boolean;    // If available
  render_pass_boundaries: 'EXACT'; // Always explicit in WebGPU
  draw_attribution: 'ESTIMATED';   // Command buffers obscure
  shader_introspection: 'LIMITED'; // WGSL, not GLSL
}
```

## Invariants (MUST ALWAYS HOLD)

1. **No silent breakage:**
   - If a capability is degraded, it MUST be labeled via fidelity.
   - Doctor MUST report why.

2. **Capability-driven behavior:**
   - Features MUST be gated by detected capabilities, not assumptions.
   - Never assume WebGL2 features on WebGL1.

3. **Safe failure:**
   - Hook failures MUST NOT crash the session.
   - System must degrade gracefully.

4. **Doctor reporting:**
   - Doctor MUST report: detected three.js version(s), backend, CSP constraints, support tier, and per-capability status.

## Degradation Rules

- **WebGPU:**
  - Draw-level attribution may be ESTIMATED/UNAVAILABLE.
  - Pass/pipeline-centric attribution preferred.
- **CSP-safe mode:**
  - No inline scripts/styles, no eval.
  - Disable any addon requiring those.
- **Unknown three.js version:**
  - Default to minimal capture.
  - Warn loudly.
  - Allow override via config.

## Acceptance Tests

- **Unknown version:**
  - Running with unrecognized version triggers UNKNOWN tier + minimal mode + Doctor warning.
- **Backend switch:**
  - WebGPU path surfaces correct capability matrix and disables incompatible tooling.
- **CSP restriction:**
  - CSP-safe profile disables forbidden behaviors and reports impact.
- **Hook failure:**
  - Failed hook degrades gracefully without crash.

## Anti-goals

- Claiming "supports all three.js versions"
- Showing GPU timing without measurement or labeled estimation
- Different semantics for the same metric without backend label
- Crashing on version mismatch
- Silent degradation without reporting
