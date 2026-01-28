# Contract: Asset Loading

## Purpose

Asset loading tracking enables introspection of loader lifecycles, asset dependency graphs, and loading performance for debugging and optimization.

## Invariants (MUST ALWAYS HOLD)

1. **Loaders are entities:**
   - Every loader instance MUST have a stable entity ID
   - Loaders are tracked in the entity graph
   - Loaders can be queried and inspected

2. **Assets have dependency graphs:**
   - Asset dependencies MUST be tracked as edges
   - Dependency graphs are queryable
   - Circular dependencies are detectable

3. **Loading performance is attributable:**
   - Loading time MUST be attributed to loaders/assets
   - Loading metrics include fidelity
   - Loading costs can be compared

4. **Loading state is queryable:**
   - Current loading state MUST be queryable
   - Loading progress is trackable
   - Loading errors are attributable

## Degradation Rules (ALLOWED BUT MUST BE EXPLICIT)

- If loader is not detected:
  - Mark loader entities as UNAVAILABLE
  - Return empty results with fidelity UNAVAILABLE
  - Emit warning_event explaining why

- If dependency tracking is incomplete:
  - Mark dependencies as ESTIMATED
  - Include available dependencies
  - Document missing dependencies

- If loading performance data is unavailable:
  - Mark performance metrics as UNAVAILABLE
  - Provide loading state only
  - Explain limitation to user

## Entity Types

### Loader

```typescript
interface LoaderEntity {
  id: string; // Format: "loader:namespace:loaderId"
  type: 'loader';
  loaderType: string; // e.g., "GLTFLoader", "TextureLoader"
  state: 'idle' | 'loading' | 'complete' | 'error';
  fidelity: Fidelity;
}
```

### Asset

```typescript
interface AssetEntity {
  id: string; // Format: "asset:namespace:assetId"
  type: 'asset';
  url: string;
  assetType: 'model' | 'texture' | 'audio' | 'data';
  loaderId: string; // Loader entity ID
  state: 'pending' | 'loading' | 'loaded' | 'error';
  size?: number; // Bytes
  dependencies: string[]; // Asset entity IDs
  dependents: string[]; // Asset entity IDs
  fidelity: Fidelity;
}
```

## Events

### Loader Events

```typescript
// Loader created
{
  type: 'loader_create',
  context_id: string,
  entity_id: string,
  loader_type: string,
  timestamp: number
}

// Loader started loading
{
  type: 'loader_start',
  context_id: string,
  loader_id: string,
  url: string,
  timestamp: number
}

// Loader progress
{
  type: 'loader_progress',
  context_id: string,
  loader_id: string,
  loaded: number,
  total: number,
  timestamp: number
}

// Loader complete
{
  type: 'loader_complete',
  context_id: string,
  loader_id: string,
  asset_id: string,
  timestamp: number
}

// Loader error
{
  type: 'loader_error',
  context_id: string,
  loader_id: string,
  error: string,
  timestamp: number
}
```

### Asset Events

```typescript
// Asset created
{
  type: 'asset_create',
  context_id: string,
  entity_id: string,
  url: string,
  asset_type: string,
  loader_id: string,
  timestamp: number
}

// Asset dependency added
{
  type: 'asset_dependency',
  context_id: string,
  asset_id: string,
  dependency_id: string,
  timestamp: number
}

// Asset loaded
{
  type: 'asset_loaded',
  context_id: string,
  entity_id: string,
  size: number,
  timestamp: number
}
```

## Queries

### Loading Performance

```typescript
query('loading_performance', {
  window?: number, // Frames to analyze
  loaderType?: string
}): {
  items: Array<{
    loaderId: string;
    totalTime: number;
    averageTime: number;
    loadCount: number;
    attribution: Attribution[];
    fidelity: Fidelity;
  }>;
  fidelity: Fidelity;
}
```

### Asset Dependencies

```typescript
query('asset_dependencies', {
  assetId: string,
  depth?: number // Max dependency depth
}): {
  asset: AssetEntity;
  dependencies: AssetEntity[];
  dependencyGraph: {
    nodes: AssetEntity[];
    edges: Array<{ from: string; to: string }>;
  };
  fidelity: Fidelity;
}
```

### Loading State

```typescript
query('loading_state', {}): {
  activeLoaders: LoaderEntity[];
  pendingAssets: AssetEntity[];
  loadingAssets: AssetEntity[];
  totalProgress: number; // 0-1
  fidelity: Fidelity;
}
```

## Acceptance Tests (Definition of Done)

- **Loader tracking:**
  - Create loader → entity appears in graph
  - Start loading → start event emitted
  - Complete loading → complete event emitted

- **Asset dependency tracking:**
  - Load asset with dependencies → dependencies tracked
  - Query dependencies → returns dependency graph
  - Circular dependencies → detected and reported

- **Loading performance:**
  - Load asset → performance attributed to loader
  - Query performance → returns loaders with attribution
  - Performance metrics include fidelity

- **Loading state:**
  - Query loading state → returns current state
  - Progress updates → progress events emitted
  - Works with offline traces

## Anti-goals (MUST NOT DO)

- Assuming single loader type
- Breaking traces when loader unavailable
- Silent degradation of loading data
- Not tracking dependencies
- Mixing loader systems without namespacing

## See Also

- Contract: agents/contracts/entity-graph.md
- Contract: agents/contracts/attribution.md
- Contract: agents/contracts/fidelity.md