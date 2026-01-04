# Message Serialization

The 3Lens transport layer uses JSON-based message serialization with a standardized wrapper format for probe-UI communication.

## Overview

All debug messages follow a consistent structure with type discrimination, timestamps, and optional request correlation.

```typescript
// Base structure for all messages
interface BaseMessage {
  type: string;      // Message type discriminator
  id?: string;       // Optional unique identifier
  timestamp: number; // Unix timestamp (ms)
}
```

## Message Wrapper Format

### PostMessage Wrapper

When using the postMessage transport, messages are wrapped with metadata:

```typescript
interface PostMessageWrapper {
  source: '3lens-probe' | '3lens-devtool';
  version: string;
  payload: DebugMessage;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `source` | `string` | Identifies sender: `'3lens-probe'` or `'3lens-devtool'` |
| `version` | `string` | Protocol version (e.g., `'1.0.0'`) |
| `payload` | `DebugMessage` | The actual message |

### Example Wrapped Message

```typescript
// Probe sending frame stats
window.postMessage({
  source: '3lens-probe',
  version: '1.0.0',
  payload: {
    type: 'frame-stats',
    timestamp: 1704307200000,
    stats: {
      fps: 60,
      frameTime: 16.67,
      drawCalls: 150,
      triangles: 500000,
    },
  },
}, window.location.origin);
```

## Message Categories

### 1. Handshake Messages

Used for initial connection establishment and capability negotiation.

#### HandshakeRequest

```typescript
interface HandshakeRequest {
  type: 'handshake-request';
  timestamp: number;
  uiVersion: string;
  capabilities: string[];
}
```

**Example:**
```json
{
  "type": "handshake-request",
  "timestamp": 1704307200000,
  "uiVersion": "1.0.0",
  "capabilities": ["snapshot", "live-edit", "timeline"]
}
```

#### HandshakeResponse

```typescript
interface HandshakeResponse {
  type: 'handshake-response';
  timestamp: number;
  requestId: string;
  appId: string;
  appName: string;
  threeVersion: string;
  probeVersion: string;
  backend: 'webgl' | 'webgpu';
  capabilities: string[];
}
```

**Example:**
```json
{
  "type": "handshake-response",
  "timestamp": 1704307200100,
  "requestId": "req_abc123",
  "appId": "app_xyz789",
  "appName": "My Three.js App",
  "threeVersion": "0.160.0",
  "probeVersion": "1.0.0",
  "backend": "webgl",
  "capabilities": ["snapshot", "live-edit"]
}
```

### 2. Data Messages

Carry information from probe to UI.

#### FrameStatsMessage

```typescript
interface FrameStatsMessage {
  type: 'frame-stats';
  timestamp: number;
  stats: FrameStats;
}
```

**Example:**
```json
{
  "type": "frame-stats",
  "timestamp": 1704307200000,
  "stats": {
    "fps": 60,
    "frameTime": 16.67,
    "cpuTime": 8.5,
    "gpuTime": 6.2,
    "drawCalls": 150,
    "triangles": 500000,
    "geometries": 45,
    "textures": 23,
    "programs": 12,
    "memory": {
      "geometries": 52428800,
      "textures": 134217728,
      "total": 186646528
    }
  }
}
```

#### SnapshotMessage

```typescript
interface SnapshotMessage {
  type: 'snapshot';
  timestamp: number;
  snapshotId: string;
  trigger: 'manual' | 'on-change' | 'scheduled';
  snapshot: SceneSnapshot;
}
```

**Example (abbreviated):**
```json
{
  "type": "snapshot",
  "timestamp": 1704307200000,
  "snapshotId": "snap_001",
  "trigger": "manual",
  "snapshot": {
    "scenes": [{
      "uuid": "scene-uuid",
      "name": "MainScene",
      "children": [...]
    }],
    "materials": [...],
    "geometries": [...],
    "textures": [...]
  }
}
```

#### SelectionChangedMessage

```typescript
interface SelectionChangedMessage {
  type: 'selection-changed';
  timestamp: number;
  selectedObject: ObjectMeta | null;
  previousObject: ObjectMeta | null;
}
```

**Example:**
```json
{
  "type": "selection-changed",
  "timestamp": 1704307200000,
  "selectedObject": {
    "uuid": "mesh-uuid-123",
    "name": "Player",
    "type": "Mesh",
    "path": "/Scene/World/Player"
  },
  "previousObject": null
}
```

### 3. Command Messages

Commands from UI to probe.

#### SelectObjectCommand

```typescript
interface SelectObjectCommand {
  type: 'select-object';
  timestamp: number;
  debugId: string | null;
}
```

**Example:**
```json
{
  "type": "select-object",
  "timestamp": 1704307200000,
  "debugId": "mesh-uuid-123"
}
```

#### HoverObjectCommand

```typescript
interface HoverObjectCommand {
  type: 'hover-object';
  timestamp: number;
  debugId: string | null;
}
```

#### RequestSnapshotCommand

```typescript
interface RequestSnapshotCommand {
  type: 'request-snapshot';
  timestamp: number;
}
```

#### UpdateMaterialPropertyCommand

```typescript
interface UpdateMaterialPropertyCommand {
  type: 'update-material-property';
  timestamp: number;
  materialUuid: string;
  property: string;
  value: unknown;
}
```

**Example:**
```json
{
  "type": "update-material-property",
  "timestamp": 1704307200000,
  "materialUuid": "mat-uuid-456",
  "property": "color",
  "value": "#ff0000"
}
```

### 4. Health Check Messages

#### PingCommand

```typescript
interface PingCommand {
  type: 'ping';
  timestamp: number;
}
```

#### PongMessage

```typescript
interface PongMessage {
  type: 'pong';
  timestamp: number;
  requestId: string;
}
```

## Serialization Behavior

### Direct Transport

No serialization occurs - messages are passed by reference:

```typescript
const message = { type: 'frame-stats', stats: { fps: 60 } };
probeTransport.send(message);

uiTransport.onReceive((received) => {
  received === message; // true - same object
  received.stats.fps = 30; // Mutates original!
});
```

**Best Practice:** Treat received messages as immutable to avoid side effects.

### PostMessage Transport

Messages are automatically serialized via `JSON.stringify`:

```typescript
const message = { type: 'frame-stats', stats: { fps: 60 } };
probeTransport.send(message);

// Internally: window.postMessage(JSON.stringify(wrapper))

uiTransport.onReceive((received) => {
  received === message; // false - different object
  received.stats.fps = 30; // Safe - only affects copy
});
```

## Handling Non-Serializable Data

Some Three.js objects contain non-serializable data:

### Circular References

Scene graphs contain circular parent-child references. The snapshot system handles this:

```typescript
// Before serialization (simplified)
const snapshot = {
  uuid: 'scene-uuid',
  children: [{
    uuid: 'mesh-uuid',
    parent: '...' // Reference converted to UUID string
  }]
};
```

### Typed Arrays

Geometry data uses TypedArrays which serialize to regular arrays:

```typescript
// Original
geometry.attributes.position.array instanceof Float32Array; // true

// After serialization
serialized.attributes.position.array instanceof Array; // true
```

### Functions and Symbols

These are automatically stripped during JSON serialization:

```typescript
const message = {
  type: 'custom',
  callback: () => {}, // Stripped
  symbol: Symbol('x'), // Stripped
  data: 'valid',       // Preserved
};
```

## Type Discrimination

Use the `type` field to handle different messages:

```typescript
transport.onReceive((message: DebugMessage) => {
  switch (message.type) {
    case 'frame-stats':
      // TypeScript knows: message is FrameStatsMessage
      updateStats(message.stats);
      break;
      
    case 'snapshot':
      // TypeScript knows: message is SnapshotMessage
      updateTree(message.snapshot);
      break;
      
    case 'selection-changed':
      // TypeScript knows: message is SelectionChangedMessage
      highlightObject(message.selectedObject);
      break;
  }
});
```

## Versioning

The `version` field in the wrapper enables protocol evolution:

```typescript
// Future-proof message handling
if (wrapper.version.startsWith('1.')) {
  handleV1Message(wrapper.payload);
} else if (wrapper.version.startsWith('2.')) {
  handleV2Message(wrapper.payload);
}
```

## See Also

- [Transport Interface](./transport-interface.md) - Base transport interface
- [PostMessage Transport](./postmessage-transport.md) - Uses JSON serialization
- [Direct Transport](./direct-transport.md) - No serialization
- [FrameStats](./frame-stats.md) - Stats data structure
- [SceneSnapshot](./scene-snapshot.md) - Snapshot data structure
