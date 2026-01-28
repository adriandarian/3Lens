# Contract: Discovery

## Purpose

Context discovery enables 3Lens to find renderers, scenes, and cameras automatically.
Discovery must be honest about its fidelity and never pretend to know more than it does.

## Discovery Modes

```typescript
type DiscoveryMode = 'off' | 'observe' | 'hook';

interface DiscoveryConfig {
  mode: DiscoveryMode;
  attachLate: boolean;                    // Allow discovery after app starts
  naming: ContextNamingConfig;
  autoRegister: boolean;                  // Auto-register discovered contexts
}

interface ContextNamingConfig {
  strategy: 'canvasId' | 'containerSelector' | 'frameworkRoot' | 'manual';
  fallbackPrefix: string;                 // e.g., "context_"
}
```

### Mode: off
- Manual `registerContext()` only
- No automatic detection
- Highest reliability, requires user integration

### Mode: observe
- Detect canvases and render activity
- No intrusive hooking
- May miss some details
- Good for exploration

### Mode: hook
- Hook renderer constructors and render calls
- Higher fidelity
- More risk of interference
- Best for development

## Invariants (MUST ALWAYS HOLD)

1. **Discovery fidelity is explicit:**
   - Every discovered context has a fidelity level (EXACT/ESTIMATED/UNAVAILABLE).
   - Manual registration is always EXACT.
   - Auto-discovery is ESTIMATED unless proven otherwise.

2. **Manual registration always overrides auto-discovery:**
   - If user calls `registerContext()`, it replaces any auto-discovered context with same ID.

3. **Context IDs are stable:**
   - ID format: `{context_id}:{type}:{local_id}`
   - IDs don't change between frames for same logical context.

4. **Late attach is supported:**
   - Discovery can happen after app is already running.
   - Pre-existing entities marked as `origin: "preexisting"`.

5. **Discovery events are emitted:**
   - `context_discovered` - Auto-detected context
   - `context_promoted` - Estimated upgraded to exact (manual registration filled gaps)
   - `context_lost` - Canvas removed or renderer disposed

## Discovery Strategies

### Canvas Detection
- Scan DOM for `<canvas>` elements
- Identify WebGL/WebGPU contexts
- Cannot determine three.js association from canvas alone

### WebGL Context Hooking
- Hook `getContext("webgl")` / `getContext("webgl2")`
- Identifies 3D canvases
- Still cannot map to three.js objects

### Renderer Constructor Hooking
- Hook `THREE.WebGLRenderer` constructor
- Gets actual renderer instance
- Requires timing (before app creates renderer)

### Render Call Hooking
- Hook `renderer.render(scene, camera)` calls
- Infers contexts from actual render activity
- May miss early renders

## Context Naming

### Sources (ranked by reliability)
1. **User-provided ID** (best) - from `registerContext()`
2. **Framework integration name** - R3F root, Tres component
3. **DOM hints** - `canvas.id`, `data-*` attributes
4. **Heuristics** - "most active canvas", "largest resolution"

### Rules
- Stable internal `context_id` separate from display name
- Mutable `displayName` with persistence
- User can rename context inline in UI

## Degradation Rules

- If renderer/scene/camera cannot be identified:
  - Context is registered with fidelity ESTIMATED.
  - Doctor reports "manual registration recommended".
- If multiple three.js copies detected:
  - Each gets separate discovery with warning.
- If discovery hooks fail:
  - Emit warning event, continue with reduced fidelity.

## Doctor Output for Discovery

```typescript
interface DiscoveryDoctorReport {
  canvases_found: number;
  contexts_discovered: number;
  contexts_manual: number;
  fidelity_breakdown: {
    exact: number;
    estimated: number;
    unavailable: number;
  };
  warnings: string[];
  recommendations: string[];
}
```

## Acceptance Tests

- **Manual override:**
  - Auto-discovered context replaced by manual registration with same ID.
- **Late attach:**
  - Starting discovery after app runs produces valid contexts with `preexisting` marker.
- **Fidelity honesty:**
  - Auto-discovered context shows ESTIMATED, not EXACT.
- **Multi-context:**
  - Multiple canvases produce multiple contexts with unique IDs.
- **Naming stability:**
  - Renamed context persists across page reload.

## Anti-goals

- Claiming EXACT fidelity for auto-discovery
- Assuming single canvas/renderer
- Discovery that breaks app functionality
- Silent failure when hooks don't work
- Unstable context IDs that change every frame
