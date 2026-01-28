# Contract: Storage & Traces

## Purpose

Ensure capture data remains bounded, portable, and usable under:
- Multi-context sessions
- Deep capture modes
- Long runtimes

Storage must provide explicit policies for buffering, chunking, compression, and export profiles.

## Storage Model

```typescript
interface StorageConfig {
  bufferSizeMB: number;           // Max memory for trace buffer
  dropPolicy: DropPolicy;         // What to drop when full
  compressionEnabled: boolean;    // Enable structural compression
  chunkSizeEvents: number;        // Events per chunk
  chunkDurationMs: number;        // Max time per chunk
}

type DropPolicy = 'oldest' | 'lowest_priority' | 'sample';
```

## Ring Buffer

### Two-Buffer Model

1. **Event Buffer** (bounded, droppable)
   - High-rate data: render events, pass events, resource updates
   - Ring buffer with configurable size
   - Drops oldest when full

2. **Snapshot/State Store** (bounded, preserved)
   - Entity graph snapshots
   - Latest known properties
   - Checkpoints for replay
   - Preserved during drops

### Fairness Rules
- Per-context quota to prevent one context starving others
- Global budget with per-context minimum
- Recording windows: freeze pre/post around user-triggered recording

## Compression

### Structural Compression (Always)
- String table interning (entity IDs, property keys, pass names)
- Delta encoding for numeric time-series
- Dedupe repeated payloads (shader sources, material definitions)
- Reference previous values instead of repeating

### Binary Compression (Optional)
- Chunk-level compression (gzip/deflate-like)
- Must not block render loop
- Done in worker or idle callback

## Trace Chunks

```typescript
interface TraceChunk {
  type: ChunkType;
  version: string;
  timestamp: number;
  compressed: boolean;
  data: unknown;
}

type ChunkType = 
  | 'header'      // Version, environment, feature flags
  | 'dictionary'  // String table, schema table
  | 'snapshot'    // Entity graph checkpoint
  | 'events'      // Time-windowed event batch
  | 'index';      // Chunk offsets for random access
```

### Chunk Requirements
- Each chunk independently decodable (with dictionary)
- Snapshot chunk enables late join
- Event chunks have time range metadata
- Index chunk optional but improves random access

## Export Profiles

```typescript
type ExportProfile = 'MINIMAL' | 'STANDARD' | 'FULL' | 'FULL_REDACTED';

interface ExportOptions {
  profile: ExportProfile;
  timeRange?: [number, number];   // Export subset
  contexts?: string[];            // Export specific contexts
  redaction?: RedactionOptions;
}

interface RedactionOptions {
  hashUrls: boolean;
  hashAssetNames: boolean;
  removeShaderSource: boolean;
  removeCustomProperties: boolean;
}
```

### MINIMAL
- Environment, capability matrix, aggregated metrics
- Summaries and top offenders
- No sensitive payloads
- Safe to share in bug reports

### STANDARD
- Snapshots + event chunks sufficient for replay
- Entity graph with relationships
- Enough for offline debugging

### FULL
- All chunks
- Verbose payloads (shader sources, resource metadata)
- Complete reconstruction possible

### FULL_REDACTED
- Same as FULL but with redaction applied
- URLs/paths hashed
- Asset names anonymized
- Shader source optional

## Drop Priority

When buffer pressure occurs, drop in this order:
1. High-frequency per-draw details
2. Repeated resource updates
3. Verbose payloads (shader text, large strings)
4. **Keep:** context lifecycle, snapshots, warnings, recording windows

## Invariants (MUST ALWAYS HOLD)

1. **Bounded memory:**
   - Live sessions MUST enforce bounded storage.
   - Never grow unbounded.

2. **Referential integrity:**
   - Dropped history MUST NOT break replay.
   - Missing history represented explicitly ("history truncated").

3. **Chunked trace format:**
   - Traces MUST be chunked for streaming, random access, partial export.

4. **Export profiles:**
   - System MUST support defined export profiles with documented contents.

5. **Observability:**
   - Doctor MUST report storage health.

## Storage Metrics

```typescript
interface StorageMetrics {
  bufferUsedBytes: number;
  bufferCapacityBytes: number;
  eventCount: number;
  eventRate: number;           // Events per second
  dropCount: number;
  snapshotCount: number;
  oldestEventTime: number;
  newestEventTime: number;
}
```

## Acceptance Tests

- **Long run:**
  - 30+ minute simulated session does not exceed memory bounds.
  - Drops are reported in metrics.
- **Replay:**
  - Exported STANDARD trace replays with stable context/entity IDs.
- **Streaming:**
  - Viewer can begin rendering UI from snapshot then consume event chunks incrementally.
- **Redaction:**
  - FULL_REDACTED export contains no raw URLs or asset names.

## Anti-goals

- Unbounded in-memory traces
- Single monolithic trace blob
- Dropping data without reporting
- Export that breaks replay
- Complex format that requires full load
