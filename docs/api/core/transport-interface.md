# Transport Interface

The Transport interface defines the communication layer between the 3Lens probe and devtool UI, enabling message passing across different execution contexts.

## Overview

```typescript
import type { Transport, DebugMessage } from '@3lens/core';

// Create or receive a transport
const transport: Transport = createPostMessageTransport();

// Send messages to UI
transport.send({
  type: 'frame-stats',
  timestamp: Date.now(),
  stats: frameStats,
});

// Receive messages from UI
const unsubscribe = transport.onReceive((message) => {
  if (message.type === 'select-object') {
    handleSelection(message.debugId);
  }
});
```

## Transport Interface

```typescript
interface Transport {
  /**
   * Send a message to the devtool UI
   */
  send(message: DebugMessage): void;

  /**
   * Receive messages from the devtool UI
   */
  onReceive(handler: (message: DebugMessage) => void): Unsubscribe;

  /**
   * Connection status
   */
  isConnected(): boolean;

  /**
   * Subscribe to connection changes
   */
  onConnectionChange(handler: (connected: boolean) => void): Unsubscribe;

  /**
   * Close the transport
   */
  close(): void;
}
```

## Methods

### send()

Send a debug message to the connected devtool UI.

```typescript
send(message: DebugMessage): void
```

**Parameters:**
- `message` - The message to send (see [DebugMessage types](#debugmessage-types))

**Example:**
```typescript
transport.send({
  type: 'frame-stats',
  timestamp: Date.now(),
  stats: currentStats,
});
```

### onReceive()

Subscribe to incoming messages from the UI.

```typescript
onReceive(handler: (message: DebugMessage) => void): Unsubscribe
```

**Parameters:**
- `handler` - Callback function invoked for each received message

**Returns:** `Unsubscribe` - Function to remove the handler

**Example:**
```typescript
const unsubscribe = transport.onReceive((message) => {
  switch (message.type) {
    case 'select-object':
      selectObject(message.debugId);
      break;
    case 'request-snapshot':
      sendSnapshot();
      break;
  }
});

// Later: stop receiving
unsubscribe();
```

### isConnected()

Check if the transport has an active connection.

```typescript
isConnected(): boolean
```

**Returns:** `true` if connected, `false` otherwise

**Example:**
```typescript
if (transport.isConnected()) {
  transport.send(message);
} else {
  console.log('Waiting for devtool connection...');
}
```

### onConnectionChange()

Subscribe to connection state changes.

```typescript
onConnectionChange(handler: (connected: boolean) => void): Unsubscribe
```

**Parameters:**
- `handler` - Callback invoked when connection state changes

**Returns:** `Unsubscribe` - Function to remove the handler

**Example:**
```typescript
transport.onConnectionChange((connected) => {
  if (connected) {
    console.log('Devtool connected');
    sendInitialState();
  } else {
    console.log('Devtool disconnected');
  }
});
```

### close()

Close the transport and clean up resources.

```typescript
close(): void
```

**Example:**
```typescript
// On application shutdown
transport.close();
```

## DebugMessage Types

All messages extend a base interface with type, optional id, and timestamp:

```typescript
interface BaseMessage {
  type: string;
  id?: string;
  timestamp: number;
}
```

### Handshake Messages

| Type | Direction | Description |
|------|-----------|-------------|
| `handshake-request` | UI → Probe | Initial connection request |
| `handshake-response` | Probe → UI | Connection acknowledgment |

```typescript
interface HandshakeRequest {
  type: 'handshake-request';
  uiVersion: string;
  capabilities: string[];
}

interface HandshakeResponse {
  type: 'handshake-response';
  requestId: string;
  appId: string;
  appName: string;
  threeVersion: string;
  probeVersion: string;
  backend: 'webgl' | 'webgpu';
  capabilities: string[];
}
```

### Data Messages

| Type | Direction | Description |
|------|-----------|-------------|
| `frame-stats` | Probe → UI | Per-frame performance stats |
| `snapshot` | Probe → UI | Scene tree snapshot |
| `selection-changed` | Probe → UI | Selection state update |

```typescript
interface FrameStatsMessage {
  type: 'frame-stats';
  stats: FrameStats;
}

interface SnapshotMessage {
  type: 'snapshot';
  snapshotId: string;
  trigger: 'manual' | 'on-change' | 'scheduled';
  snapshot: SceneSnapshot;
}

interface SelectionChangedMessage {
  type: 'selection-changed';
  selectedObject: ObjectMeta | null;
  previousObject: ObjectMeta | null;
}
```

### Command Messages

| Type | Direction | Description |
|------|-----------|-------------|
| `select-object` | UI → Probe | Select an object |
| `hover-object` | UI → Probe | Highlight on hover |
| `request-snapshot` | UI → Probe | Request scene snapshot |
| `update-material-property` | UI → Probe | Edit material property |
| `ping` | UI → Probe | Health check |
| `pong` | Probe → UI | Ping response |

```typescript
interface SelectObjectCommand {
  type: 'select-object';
  debugId: string | null;
}

interface HoverObjectCommand {
  type: 'hover-object';
  debugId: string | null;
}

interface RequestSnapshotCommand {
  type: 'request-snapshot';
}

interface UpdateMaterialPropertyCommand {
  type: 'update-material-property';
  materialUuid: string;
  property: string;
  value: unknown;
}

interface PingCommand {
  type: 'ping';
}

interface PongMessage {
  type: 'pong';
  requestId: string;
}
```

## Built-in Transports

3Lens provides two transport implementations:

| Transport | Use Case | Module |
|-----------|----------|--------|
| [PostMessage Transport](./postmessage-transport.md) | Browser extension, iframes | `createPostMessageTransport()` |
| [Direct Transport](./direct-transport.md) | In-app overlay | `createDirectTransport()` |

## Custom Transport Implementation

You can implement custom transports for other communication channels:

```typescript
import type { Transport, DebugMessage, Unsubscribe } from '@3lens/core';

function createWebSocketTransport(url: string): Transport {
  const ws = new WebSocket(url);
  const receiveCallbacks: Array<(message: DebugMessage) => void> = [];
  const connectionCallbacks: Array<(connected: boolean) => void> = [];
  let connected = false;

  ws.onopen = () => {
    connected = true;
    connectionCallbacks.forEach(cb => cb(true));
  };

  ws.onclose = () => {
    connected = false;
    connectionCallbacks.forEach(cb => cb(false));
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data) as DebugMessage;
    receiveCallbacks.forEach(cb => cb(message));
  };

  return {
    send(message: DebugMessage): void {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    },

    onReceive(handler: (message: DebugMessage) => void): Unsubscribe {
      receiveCallbacks.push(handler);
      return () => {
        const index = receiveCallbacks.indexOf(handler);
        if (index > -1) receiveCallbacks.splice(index, 1);
      };
    },

    isConnected(): boolean {
      return connected;
    },

    onConnectionChange(handler: (connected: boolean) => void): Unsubscribe {
      connectionCallbacks.push(handler);
      return () => {
        const index = connectionCallbacks.indexOf(handler);
        if (index > -1) connectionCallbacks.splice(index, 1);
      };
    },

    close(): void {
      ws.close();
      receiveCallbacks.length = 0;
      connectionCallbacks.length = 0;
    },
  };
}
```

## See Also

- [PostMessage Transport](./postmessage-transport.md) - Cross-context communication
- [Direct Transport](./direct-transport.md) - In-app overlay mode
- [Message Serialization](./message-serialization.md) - Message format details
- [DevtoolProbe](./devtool-probe.md) - Probe class that uses transports
