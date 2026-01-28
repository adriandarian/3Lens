# Contract: Error Handling

## Purpose

Unified error handling enables consistent error tracking, attribution to entities, and recovery patterns across 3Lens.

## Invariants (MUST ALWAYS HOLD)

1. **Errors are events:**
   - All errors MUST be represented as events
   - Errors include context_id and timestamp
   - Errors are queryable and traceable

2. **Errors are attributable:**
   - Errors MUST be attributed to specific entities when possible
   - Error attribution includes entity IDs and weights
   - Error chains are traceable

3. **Error fidelity is explicit:**
   - Error data MUST include fidelity labeling
   - Error severity is categorized
   - Error recovery state is trackable

4. **Errors don't break traces:**
   - Errors MUST NOT break trace loading
   - Traces with errors MUST still be loadable
   - Error data is preserved in traces

## Degradation Rules (ALLOWED BUT MUST BE EXPLICIT)

- If error details are unavailable:
  - Mark error as ESTIMATED
  - Include available information
  - Document missing details

- If error attribution is incomplete:
  - Mark attribution as ESTIMATED
  - Include available attribution
  - Document missing attribution

- If error recovery is unavailable:
  - Mark recovery state as UNAVAILABLE
  - Provide error information only
  - Explain limitation to user

## Error Types

### Error Severity

```typescript
type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info';
```

### Error Event

```typescript
interface ErrorEvent {
  type: 'error_event';
  context_id: string;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  stack?: string;
  entity_id?: string; // Attributed entity
  attribution?: Attribution[]; // Blame chain
  timestamp: number;
  frame?: number;
  fidelity: Fidelity;
}
```

## Events

### Error Events

```typescript
// Fatal error
{
  type: 'error_event',
  context_id: string,
  severity: 'fatal',
  message: string,
  code: string,
  stack?: string,
  entity_id?: string,
  attribution?: Attribution[],
  timestamp: number,
  frame?: number,
  fidelity: Fidelity
}

// Warning
{
  type: 'warning_event',
  context_id: string,
  severity: 'warning',
  message: string,
  code?: string,
  entity_id?: string,
  attribution?: Attribution[],
  timestamp: number,
  frame?: number,
  fidelity: Fidelity
}
```

### Recovery Events

```typescript
// Error recovered
{
  type: 'error_recovery',
  context_id: string,
  error_id: string, // Original error event ID
  recovery_action: string,
  timestamp: number,
  fidelity: Fidelity
}
```

## Queries

### Error Summary

```typescript
query('error_summary', {
  window?: number, // Frames to analyze
  severity?: ErrorSeverity
}): {
  errors: ErrorEvent[];
  bySeverity: {
    fatal: number;
    error: number;
    warning: number;
    info: number;
  };
  byEntity: Array<{
    entityId: string;
    errorCount: number;
    errors: ErrorEvent[];
  }>;
  fidelity: Fidelity;
}
```

### Error Attribution

```typescript
query('error_attribution', {
  errorId: string
}): {
  error: ErrorEvent;
  attribution: Attribution[];
  blameChain: Array<{
    entityId: string;
    weight: number;
    reason: string;
  }>;
  fidelity: Fidelity;
}
```

## Error Handling Patterns

### Try-Catch with Attribution

```typescript
try {
  // Operation
} catch (error) {
  context.emit({
    type: 'error_event',
    context_id: context.id,
    severity: 'error',
    message: error.message,
    code: error.code,
    entity_id: entityId,
    attribution: [
      { entityId: entityId, weight: 1.0 }
    ],
    timestamp: performance.now(),
    fidelity: 'EXACT'
  });
  
  // Recovery or rethrow
}
```

### Graceful Degradation

```typescript
try {
  const result = await operation();
  return { ...result, fidelity: 'EXACT' };
} catch (error) {
  // Emit error
  emitError(error, { entityId });
  
  // Return degraded result
  return {
    value: null,
    fidelity: 'UNAVAILABLE',
    reason: error.message
  };
}
```

## Acceptance Tests (Definition of Done)

- **Error tracking:**
  - Emit error → error event recorded
  - Query errors → returns error summary
  - Errors preserved in traces

- **Error attribution:**
  - Error with entity → attributed correctly
  - Query attribution → returns blame chain
  - Attribution includes weights

- **Error recovery:**
  - Recover from error → recovery event emitted
  - Query recovery → returns recovery state
  - Recovery state is queryable

- **Trace compatibility:**
  - Trace with errors → loads successfully
  - Errors queryable from trace
  - Error data preserved

## Anti-goals (MUST NOT DO)

- Silently swallowing errors
- Breaking traces with errors
- Missing error attribution
- Not categorizing error severity
- Mixing error systems without namespacing

## See Also

- Contract: agents/contracts/entity-graph.md
- Contract: agents/contracts/attribution.md
- Contract: agents/contracts/fidelity.md
- Contract: agents/contracts/capture.md