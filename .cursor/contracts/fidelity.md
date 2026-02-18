# Contract: Data Fidelity

## Purpose

3Lens must never present uncertain data as certain.
Every metric, query, and diff must carry fidelity and explain degradation.

## Fidelity Levels

```typescript
type Fidelity = 'EXACT' | 'ESTIMATED' | 'UNAVAILABLE';

interface FidelityInfo {
  level: Fidelity;
  reason?: string;           // Why not EXACT
  source?: string;           // What data source was used
  proxies_used?: string[];   // For ESTIMATED: what proxies were used
}
```

### EXACT
- Measured from authoritative sources
- GPU timers returned valid data
- Direct API observation

### ESTIMATED
- Derived from heuristics/proxies
- Inferred from related data
- Based on historical patterns

### UNAVAILABLE
- Cannot be obtained in current environment
- API blocked by browser/CSP
- Feature not supported by backend

## Invariants (MUST ALWAYS HOLD)

1. **Every displayed metric MUST have fidelity.**
   - No number without a fidelity level.

2. **Every query result MUST propagate fidelity.**
   - If inputs are mixed fidelity, output is lowest common fidelity.

3. **UI MUST expose fidelity (badge/label) and allow filtering by fidelity.**
   - Users can choose to show/hide ESTIMATED data.

4. **Any non-EXACT value MUST include a reason string.**
   - Reason explains why not EXACT and what was used instead.

## Fidelity Propagation Rules

```
EXACT + EXACT = EXACT
EXACT + ESTIMATED = ESTIMATED
EXACT + UNAVAILABLE = UNAVAILABLE
ESTIMATED + ESTIMATED = ESTIMATED
ESTIMATED + UNAVAILABLE = UNAVAILABLE
UNAVAILABLE + UNAVAILABLE = UNAVAILABLE
```

## Degradation Rules

- If GPU timers are not available:
  - GPU-time metrics MUST be UNAVAILABLE or ESTIMATED via proxies (explicitly labeled).
- If internal hooks are disabled due to version/CSP:
  - Related metrics MUST degrade and emit a warning event.
- If backend is WebGPU and draw-level attribution unavailable:
  - Mark draw attribution as ESTIMATED, explain in reason.

## UI Requirements

- **Fidelity badges:** Visual indicator next to each metric (icon, color, tooltip)
- **Fidelity filter:** Option to hide ESTIMATED/UNAVAILABLE data
- **Hover details:** Show full FidelityInfo on hover
- **Comparison warnings:** Highlight when comparing different fidelity levels

## Acceptance Tests

- **Timer unavailable:**
  - GPU-time hotspots return UNAVAILABLE or ESTIMATED with proxy explanation.
- **Mixed comparisons:**
  - Diff reports MUST label when comparing EXACT to ESTIMATED values.
- **UI honesty:**
  - No UI surface may hide fidelity labels for core metrics.
- **Propagation:**
  - Query combining EXACT and ESTIMATED inputs produces ESTIMATED output.

## Anti-goals

- Silent fallback from EXACT to ESTIMATED
- Displaying "GPU time" without measurement or clearly labeled estimation
- Treating fidelity as an internal-only property
- Hiding fidelity to make UI "cleaner"
- Comparing EXACT and ESTIMATED without warning
