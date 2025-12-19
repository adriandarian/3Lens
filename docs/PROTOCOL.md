# 3Lens Debug Protocol

This document specifies the message protocol used for communication between the 3Lens Probe SDK and the DevTool UI.

## Table of Contents

1. [Overview](#overview)
2. [Transport Mechanisms](#transport-mechanisms)
3. [Message Format](#message-format)
4. [Message Types](#message-types)
5. [Connection Lifecycle](#connection-lifecycle)
6. [Error Handling](#error-handling)

---

## Overview

The 3Lens Debug Protocol is a bidirectional, JSON-based messaging protocol that enables:

- **Probe → UI**: Sending scene data, frame statistics, snapshots, and events
- **UI → Probe**: Sending commands to inspect, modify, or control the application

### Design Goals

1. **Simplicity**: JSON-based for easy debugging and tooling
2. **Efficiency**: Support for batching, throttling, and delta updates
3. **Extensibility**: Custom message types for plugins
4. **Transport-agnostic**: Works over postMessage, WebSocket, or direct calls

---

## Transport Mechanisms

### 1. postMessage (Browser Extension)

Used when the DevTool UI runs in a browser extension DevTools panel.

```
┌─────────────────────┐                    ┌─────────────────────┐
│    Web Page         │                    │   DevTools Panel    │
│    (Probe SDK)      │                    │   (UI Host)         │
│                     │                    │                     │
│   window.postMessage├───────────────────►│   window.onmessage  │
│                     │                    │                     │
│   window.onmessage  │◄───────────────────┤   window.postMessage│
└─────────────────────┘                    └─────────────────────┘
```

**Message Wrapper:**

```typescript
interface PostMessageWrapper {
  source: '3lens-probe' | '3lens-devtool';
  version: string;
  payload: DebugMessage;
}
```

### 2. WebSocket (Standalone App)

Used when connecting to a standalone desktop or web application.

```
┌─────────────────────┐                    ┌─────────────────────┐
│    Web Page         │     WebSocket      │   Standalone App    │
│    (Probe SDK)      │◄──────────────────►│   (Electron/Web)    │
│                     │    ws://...        │                     │
└─────────────────────┘                    └─────────────────────┘
```

**Connection URL:** `ws://localhost:3lens-port` or custom

### 3. Direct Call (In-App Overlay)

Used when the overlay runs in the same runtime as the application.

```typescript
// No serialization needed - direct function calls
probe.onMessage((msg) => overlay.handleMessage(msg));
overlay.onCommand((cmd) => probe.executeCommand(cmd));
```

---

## Message Format

### Base Message Structure

All messages conform to this base structure:

```typescript
interface DebugMessage {
  /**
   * Message type identifier
   */
  type: string;
  
  /**
   * Unique message ID (for request/response correlation)
   */
  id?: string;
  
  /**
   * Timestamp (milliseconds since epoch)
   */
  timestamp: number;
  
  /**
   * Message payload (type-specific)
   */
  [key: string]: unknown;
}
```

### Message Categories

| Category | Direction | Description |
|----------|-----------|-------------|
| Handshake | Bidirectional | Connection establishment |
| Data | Probe → UI | Scene data, stats, snapshots |
| Event | Probe → UI | Lifecycle and custom events |
| Command | UI → Probe | Control and inspection commands |
| Response | Bidirectional | Command/request responses |

---

## Message Types

### Handshake Messages

#### `handshake-request` (UI → Probe)

Sent by UI to initiate connection.

```typescript
interface HandshakeRequest {
  type: 'handshake-request';
  id: string;
  timestamp: number;
  uiVersion: string;
  capabilities: string[];
}
```

#### `handshake-response` (Probe → UI)

Probe responds with application info.

```typescript
interface HandshakeResponse {
  type: 'handshake-response';
  id: string;
  timestamp: number;
  requestId: string;
  
  appId: string;
  appName: string;
  threeVersion: string;
  probeVersion: string;
  
  backend: 'webgl' | 'webgpu';
  capabilities: string[];
  
  config: {
    sampling: SamplingConfig;
    rules: RulesConfig;
    tags: Record<string, string>;
  };
}
```

---

### Data Messages

#### `frame-stats` (Probe → UI)

Per-frame statistics. Sent every frame or at configured intervals.

```typescript
interface FrameStatsMessage {
  type: 'frame-stats';
  timestamp: number;
  
  frame: number;
  stats: FrameStats;
}
```

**Throttling:** Can be throttled to every N frames or aggregated.

#### `snapshot` (Probe → UI)

Full scene snapshot.

```typescript
interface SnapshotMessage {
  type: 'snapshot';
  id: string;
  timestamp: number;
  
  snapshotId: string;
  trigger: 'manual' | 'on-change' | 'scheduled';
  snapshot: SceneSnapshot;
}
```

#### `snapshot-delta` (Probe → UI)

Incremental update to a previous snapshot.

```typescript
interface SnapshotDeltaMessage {
  type: 'snapshot-delta';
  timestamp: number;
  
  baseSnapshotId: string;
  changes: SceneChange[];
}

interface SceneChange {
  changeType: 'added' | 'removed' | 'updated';
  path: string;
  data?: SceneNode;
  updates?: Partial<SceneNode>;
}
```

#### `materials-list` (Probe → UI)

List of all materials.

```typescript
interface MaterialsListMessage {
  type: 'materials-list';
  timestamp: number;
  
  materials: MaterialInfo[];
}
```

#### `textures-list` (Probe → UI)

List of all textures.

```typescript
interface TexturesListMessage {
  type: 'textures-list';
  timestamp: number;
  
  textures: TextureInfo[];
}
```

#### `render-targets-list` (Probe → UI)

List of render targets with optional thumbnail data.

```typescript
interface RenderTargetsListMessage {
  type: 'render-targets-list';
  timestamp: number;
  
  renderTargets: RenderTargetInfo[];
  thumbnails?: Record<string, string>; // ref -> base64 image
}
```

#### `geometries-list` (Probe → UI)

List of all geometries.

```typescript
interface GeometriesListMessage {
  type: 'geometries-list';
  timestamp: number;
  
  geometries: GeometryInfo[];
}
```

#### `programs-list` (Probe → UI, WebGL only)

List of shader programs.

```typescript
interface ProgramsListMessage {
  type: 'programs-list';
  timestamp: number;
  
  programs: ProgramInfo[];
}
```

#### `pipelines-list` (Probe → UI, WebGPU only)

List of render/compute pipelines.

```typescript
interface PipelinesListMessage {
  type: 'pipelines-list';
  timestamp: number;
  
  pipelines: PipelineInfo[];
}
```

---

### Event Messages

#### `resource-event` (Probe → UI)

Resource lifecycle event.

```typescript
interface ResourceEventMessage {
  type: 'resource-event';
  timestamp: number;
  
  event: ResourceEvent;
}
```

#### `selection-changed` (Probe → UI)

Object selection changed.

```typescript
interface SelectionChangedMessage {
  type: 'selection-changed';
  timestamp: number;
  
  selectedObject: ObjectMeta | null;
  previousObject: ObjectMeta | null;
}
```

#### `scene-changed` (Probe → UI)

Scene graph structure changed.

```typescript
interface SceneChangedMessage {
  type: 'scene-changed';
  timestamp: number;
  
  changeType: 'object-added' | 'object-removed' | 'hierarchy-changed';
  affectedObjects: TrackedObjectRef[];
}
```

#### `rule-violation` (Probe → UI)

Performance rule violated.

```typescript
interface RuleViolationMessage {
  type: 'rule-violation';
  timestamp: number;
  
  violation: RuleViolation;
}
```

#### `custom-metric` (Probe → UI)

Custom metric recorded.

```typescript
interface CustomMetricMessage {
  type: 'custom-metric';
  timestamp: number;
  
  name: string;
  value: number;
  tags?: Record<string, string>;
}
```

#### `custom-event` (Probe → UI)

Custom application event.

```typescript
interface CustomEventMessage {
  type: 'custom-event';
  timestamp: number;
  
  name: string;
  data?: Record<string, unknown>;
}
```

#### `logical-entity-registered` (Probe → UI)

New logical entity registered.

```typescript
interface LogicalEntityRegisteredMessage {
  type: 'logical-entity-registered';
  timestamp: number;
  
  entity: LogicalEntity;
}
```

#### `logical-entity-unregistered` (Probe → UI)

Logical entity removed.

```typescript
interface LogicalEntityUnregisteredMessage {
  type: 'logical-entity-unregistered';
  timestamp: number;
  
  entityId: string;
}
```

---

### Command Messages (UI → Probe)

#### `request-snapshot`

Request a scene snapshot.

```typescript
interface RequestSnapshotCommand {
  type: 'request-snapshot';
  id: string;
  timestamp: number;
  
  includeGeometryDetails?: boolean;
  includeMaterialDetails?: boolean;
}
```

#### `request-materials`

Request materials list.

```typescript
interface RequestMaterialsCommand {
  type: 'request-materials';
  id: string;
  timestamp: number;
}
```

#### `request-textures`

Request textures list.

```typescript
interface RequestTexturesCommand {
  type: 'request-textures';
  id: string;
  timestamp: number;
}
```

#### `request-render-targets`

Request render targets with optional thumbnails.

```typescript
interface RequestRenderTargetsCommand {
  type: 'request-render-targets';
  id: string;
  timestamp: number;
  
  includeThumbnails?: boolean;
  thumbnailSize?: number;
}
```

#### `select-object`

Select an object by debugId.

```typescript
interface SelectObjectCommand {
  type: 'select-object';
  id: string;
  timestamp: number;
  
  debugId: string | null;
}
```

#### `highlight-object`

Temporarily highlight an object.

```typescript
interface HighlightObjectCommand {
  type: 'highlight-object';
  id: string;
  timestamp: number;
  
  debugId: string;
  duration?: number; // ms, default 2000
}
```

#### `isolate-object`

Hide all objects except the specified one.

```typescript
interface IsolateObjectCommand {
  type: 'isolate-object';
  id: string;
  timestamp: number;
  
  debugId: string;
}
```

#### `show-all-objects`

Show all objects (undo isolation).

```typescript
interface ShowAllObjectsCommand {
  type: 'show-all-objects';
  id: string;
  timestamp: number;
}
```

#### `focus-camera`

Move camera to focus on an object.

```typescript
interface FocusCameraCommand {
  type: 'focus-camera';
  id: string;
  timestamp: number;
  
  debugId: string;
  padding?: number;
}
```

#### `set-object-visibility`

Set object visibility.

```typescript
interface SetObjectVisibilityCommand {
  type: 'set-object-visibility';
  id: string;
  timestamp: number;
  
  debugId: string;
  visible: boolean;
}
```

#### `set-object-transform`

Set object transform.

```typescript
interface SetObjectTransformCommand {
  type: 'set-object-transform';
  id: string;
  timestamp: number;
  
  debugId: string;
  position?: Vector3Data;
  rotation?: EulerData;
  scale?: Vector3Data;
}
```

#### `set-material-property`

Set a material property.

```typescript
interface SetMaterialPropertyCommand {
  type: 'set-material-property';
  id: string;
  timestamp: number;
  
  materialRef: string;
  property: string;
  value: unknown;
}
```

#### `toggle-wireframe`

Toggle wireframe mode for an object or material.

```typescript
interface ToggleWireframeCommand {
  type: 'toggle-wireframe';
  id: string;
  timestamp: number;
  
  target: 'object' | 'material' | 'global';
  debugId?: string;
  materialRef?: string;
  enabled?: boolean; // toggle if undefined
}
```

#### `toggle-bounding-box`

Toggle bounding box display.

```typescript
interface ToggleBoundingBoxCommand {
  type: 'toggle-bounding-box';
  id: string;
  timestamp: number;
  
  debugId: string;
  enabled?: boolean;
}
```

#### `start-recording`

Start recording session.

```typescript
interface StartRecordingCommand {
  type: 'start-recording';
  id: string;
  timestamp: number;
  
  options?: {
    captureFrameStats?: boolean;
    captureSnapshots?: boolean;
    captureEvents?: boolean;
    maxDuration?: number; // ms
  };
}
```

#### `stop-recording`

Stop recording session.

```typescript
interface StopRecordingCommand {
  type: 'stop-recording';
  id: string;
  timestamp: number;
}
```

#### `export-recording`

Export recorded session.

```typescript
interface ExportRecordingCommand {
  type: 'export-recording';
  id: string;
  timestamp: number;
  
  format: 'json' | 'binary';
}
```

#### `set-sampling-config`

Update sampling configuration.

```typescript
interface SetSamplingConfigCommand {
  type: 'set-sampling-config';
  id: string;
  timestamp: number;
  
  config: Partial<SamplingConfig>;
}
```

#### `ping`

Connection health check.

```typescript
interface PingCommand {
  type: 'ping';
  id: string;
  timestamp: number;
}
```

---

### Response Messages

#### `command-response`

Response to a command.

```typescript
interface CommandResponse {
  type: 'command-response';
  id: string;
  timestamp: number;
  
  requestId: string;
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
  };
}
```

#### `pong`

Response to ping.

```typescript
interface PongMessage {
  type: 'pong';
  id: string;
  timestamp: number;
  
  requestId: string;
}
```

---

## Connection Lifecycle

### Connection Establishment

```
UI                                  Probe
 │                                    │
 ├───── handshake-request ───────────►│
 │                                    │
 │◄──── handshake-response ───────────┤
 │                                    │
 │◄──── frame-stats ──────────────────┤
 │◄──── snapshot ─────────────────────┤
 │                                    │
 ├───── select-object ───────────────►│
 │◄──── selection-changed ────────────┤
 │                                    │
```

### Heartbeat

```typescript
// UI sends ping every 5 seconds
const HEARTBEAT_INTERVAL = 5000;

setInterval(() => {
  transport.send({
    type: 'ping',
    id: generateId(),
    timestamp: Date.now(),
  });
}, HEARTBEAT_INTERVAL);
```

### Reconnection

1. UI detects connection loss (no pong for 3 heartbeats)
2. UI attempts reconnection with exponential backoff
3. On reconnect, UI sends new handshake-request
4. Probe responds with current state

---

## Error Handling

### Error Codes

| Code | Description |
|------|-------------|
| `OBJECT_NOT_FOUND` | Referenced object doesn't exist |
| `MATERIAL_NOT_FOUND` | Referenced material doesn't exist |
| `INVALID_PROPERTY` | Property name is invalid |
| `READONLY_PROPERTY` | Property cannot be modified |
| `INVALID_VALUE` | Value type/range is invalid |
| `OPERATION_FAILED` | Generic operation failure |
| `NOT_SUPPORTED` | Operation not supported in current mode |
| `RATE_LIMITED` | Too many requests |

### Error Response Example

```typescript
{
  type: 'command-response',
  id: 'resp-456',
  timestamp: 1702912000000,
  requestId: 'cmd-123',
  success: false,
  error: {
    code: 'OBJECT_NOT_FOUND',
    message: 'Object with debugId "mesh-xyz" not found in scene'
  }
}
```

---

## Message Batching

For performance, multiple messages can be batched:

```typescript
interface BatchMessage {
  type: 'batch';
  timestamp: number;
  messages: DebugMessage[];
}
```

The receiver should process messages in order.

---

## Throttling & Rate Limiting

### Frame Stats Throttling

```typescript
// Probe configuration
{
  sampling: {
    frameStats: 10 // send every 10th frame
  }
}
```

### Request Rate Limiting

- Maximum 100 commands per second
- Probe may respond with `RATE_LIMITED` error

---

## Version Compatibility

### Protocol Version

The protocol version follows semver:
- **Major**: Breaking changes
- **Minor**: New message types (backward compatible)
- **Patch**: Bug fixes

### Version Negotiation

During handshake, both parties exchange versions. The connection uses the lowest common version.

```typescript
// UI supports versions 1.0.0 - 1.2.0
// Probe is version 1.1.0
// Connection uses 1.1.0 features
```

---

## Custom Messages

Plugins can define custom message types with a namespace prefix:

```typescript
interface CustomPluginMessage {
  type: 'plugin:lod-checker:analysis-result';
  timestamp: number;
  
  // Plugin-specific data
  issues: LodIssue[];
}
```

Convention: `plugin:<plugin-id>:<message-name>`

