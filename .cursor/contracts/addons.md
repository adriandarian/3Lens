# Contract: Addons

## Purpose

Define how third-party and first-party addons integrate with 3Lens.
Addons must declare compatibility, capabilities, and avoid conflicts.

## Addon Model

```typescript
interface Addon {
  // Identity
  id: string;                     // Unique identifier (reverse-DNS style)
  version: string;                // Semver
  displayName: string;
  description: string;
  
  // Compatibility
  requires: AddonRequirements;
  
  // Capabilities
  capabilities: AddonCapabilities;
  
  // Registration
  register(lens: Lens): void | Promise<void>;
  unregister?(lens: Lens): void;
}

interface AddonRequirements {
  kernel: string;                 // Semver range (e.g., "^1.0.0")
  trace?: string;                 // Trace schema version range
  contracts?: string;             // Contracts version range (optional)
}

interface AddonCapabilities {
  required: CapabilityName[];     // Must have to function
  optional: CapabilityName[];     // Nice to have, degrades without
}

type CapabilityName = 
  | 'capture.renderEvents'
  | 'capture.passBoundaries'
  | 'timing.cpu'
  | 'timing.gpu'
  | 'introspection.shaderSource'
  | 'introspection.pipeline'
  | 'transport.remote'
  | 'worker.support';
```

## Version Compatibility

### Three Version Axes
1. **Kernel API version** - Public runtime API surface
2. **Trace schema version** - Format + required event types
3. **Contracts version** - Entity graph/capture invariants (optional)

### Compatibility Check

```typescript
function checkAddonCompatibility(addon: Addon, environment: Environment): CompatibilityResult {
  // Check kernel version
  if (!semver.satisfies(environment.kernelVersion, addon.requires.kernel)) {
    return { compatible: false, reason: 'Kernel version mismatch' };
  }
  
  // Check trace version if specified
  if (addon.requires.trace && 
      !semver.satisfies(environment.traceVersion, addon.requires.trace)) {
    return { compatible: false, reason: 'Trace schema mismatch' };
  }
  
  // Check required capabilities
  for (const cap of addon.capabilities.required) {
    if (!environment.hasCapability(cap)) {
      return { compatible: false, reason: `Missing required capability: ${cap}` };
    }
  }
  
  return { compatible: true };
}
```

## Capabilities Handshake

### At Addon Load Time
1. Evaluate environment capabilities
2. Check required capabilities
3. If any required missing:
   - Addon is disabled
   - Doctor reports why
4. If only optional missing:
   - Addon runs in degraded mode
   - UI shows degraded state

### Capability Declaration Benefits
- Avoid loading heavy addons when impossible
- Prevent "empty" panels that frustrate users
- Clear error messages when things don't work

## Conflict Resolution

### Namespace Rules
- Every addon has stable `id` (reverse-DNS style)
- All registered items have:
  - Local name (nice for UI)
  - Fully qualified name: `{addon_id}:{type}/{name}`

### Collision Policy
- Same fully qualified name: **hard error** (reject second)
- Same local name: **allowed with disambiguation**
  - UI shows "Perf (3Lens)" vs "Perf (Company)"

### Override Policy
- Overrides must be explicit, never implicit
- User config: "prefer addon X for command Y"
- Addon can declare `extends`/`replaces` with compatibility

## Addon Registration

```typescript
interface AddonRegistry {
  // Registration
  register(addon: Addon): Promise<RegistrationResult>;
  unregister(addonId: string): void;
  
  // Queries
  getAddon(id: string): Addon | undefined;
  listAddons(): Addon[];
  getConflicts(): Conflict[];
  
  // Lifecycle
  enableAddon(id: string): void;
  disableAddon(id: string): void;
}

interface RegistrationResult {
  success: boolean;
  addonId: string;
  degradedCapabilities: CapabilityName[];
  warnings: string[];
}
```

## Trust & Security

### Permission Levels
- `read` - Read-only queries and views
- `mutate` - Can modify scene/settings
- `dangerous` - Can export data, open windows

### Config Options
```typescript
interface SecurityConfig {
  allowMutations: boolean;        // Global mutation toggle
  allowedAddons: string[];        // Whitelist
  blockedAddons: string[];        // Blacklist
  maxAddons: number;              // Limit concurrent addons
}
```

## Trace Replay Without Addon

- Traces include addon-specific events/entities
- Replay works without addon (core UI only)
- Addon enhances replay if installed
- Addons must not make traces unreplayable

## Invariants (MUST ALWAYS HOLD)

1. **Compatibility check at registration:**
   - Incompatible addon disabled with clear warning.
   - No silent partial failure.

2. **Capability handshake:**
   - Required capabilities must be available.
   - Optional capabilities degrade gracefully.

3. **No implicit overrides:**
   - Conflicts are explicit errors or user-configured.

4. **Trace portability:**
   - Traces remain valid without addon installed.

5. **Duplicate detection:**
   - Same addon loaded twice detected and handled.

## Acceptance Tests

- **Version mismatch:**
  - Incompatible kernel version rejects addon with clear message.
- **Missing capability:**
  - Required capability missing disables addon with Doctor report.
- **Conflict:**
  - Two addons with same fully qualified name produces error.
- **Degraded mode:**
  - Missing optional capability runs addon with degraded features.
- **Duplicate:**
  - Same addon loaded twice handled gracefully.

## Anti-goals

- Silent addon failures
- Addons that break traces
- Import-order-dependent behavior
- Unversioned addon APIs
- Addons that require specific three.js features without declaring
