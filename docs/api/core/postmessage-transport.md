# PostMessage Transport

The PostMessage Transport enables communication between the 3Lens probe and devtool UI across different execution contexts using the browser's `postMessage` API.

## Overview

```typescript
import { createPostMessageTransport } from '@3lens/core';

const transport = createPostMessageTransport();

// Transport is now listening for devtool connections
transport.onConnectionChange((connected) => {
  if (connected) {
    console.log('Browser extension connected');
  }
});
```

## Use Cases

- **Browser Extension** - Connect to 3Lens browser devtools extension
- **Iframe Communication** - Probe in iframe, UI in parent (or vice versa)
- **Cross-Origin Workers** - With appropriate origin validation

## API

### createPostMessageTransport()

Creates a transport that communicates via `window.postMessage`.

```typescript
function createPostMessageTransport(): Transport
```

**Returns:** A `Transport` instance configured for postMessage communication

## How It Works

### Message Flow

```
┌─────────────────┐                      ┌─────────────────┐
│  3Lens Probe    │  window.postMessage  │  Devtool UI     │
│  (Page)         │ ◄──────────────────► │  (Extension)    │
└─────────────────┘                      └─────────────────┘
```

### Message Wrapper

All messages are wrapped with metadata for identification:

```typescript
interface PostMessageWrapper {
  source: '3lens-probe' | '3lens-devtool';
  version: string;
  payload: DebugMessage;
}
```

- **source** - Identifies sender (`3lens-probe` or `3lens-devtool`)
- **version** - Protocol version for compatibility
- **payload** - The actual `DebugMessage`

### Security

The transport validates messages:

1. **Same Origin Only** - Messages from different origins are ignored
2. **Source Validation** - Only processes messages with `source: '3lens-devtool'`
3. **Structure Validation** - Malformed messages are discarded

```typescript
const handleMessage = (event: MessageEvent) => {
  // Only accept messages from same origin
  if (event.origin !== window.location.origin) return;

  // Validate message structure
  if (!event.data || event.data.source !== '3lens-devtool') return;

  // Process valid message
  const { payload } = event.data;
  // ...
};
```

## Connection Lifecycle

### 1. Probe Initialization

```typescript
// Probe creates transport and starts listening
const transport = createPostMessageTransport();

transport.onConnectionChange((connected) => {
  if (connected) {
    // Send initial state to devtool
    sendHandshakeResponse();
    sendCurrentSnapshot();
  }
});
```

### 2. Devtool Connection

When the devtool UI sends a `handshake-request`:

```typescript
// Devtool sends handshake
window.postMessage({
  source: '3lens-devtool',
  version: '1.0.0',
  payload: {
    type: 'handshake-request',
    timestamp: Date.now(),
    uiVersion: '1.0.0',
    capabilities: ['snapshot', 'live-edit'],
  },
}, origin);
```

### 3. Connection Established

The probe receives the handshake and marks the connection as established:

```typescript
// Inside transport implementation
if (payload.type === 'handshake-request') {
  if (!connected) {
    connected = true;
    for (const cb of connectionCallbacks) {
      cb(true);
    }
  }
}
```

## Usage Examples

### Basic Setup

```typescript
import { createProbe, createPostMessageTransport } from '@3lens/core';

const probe = createProbe({ name: 'My App' });
const transport = createPostMessageTransport();

// Connect probe to transport
probe.connect(transport);

// Probe will now communicate with browser extension
```

### Manual Message Handling

```typescript
const transport = createPostMessageTransport();

// Send frame stats
transport.send({
  type: 'frame-stats',
  timestamp: Date.now(),
  stats: {
    fps: 60,
    frameTime: 16.67,
    drawCalls: 150,
    triangles: 500000,
    // ...
  },
});

// Handle incoming commands
transport.onReceive((message) => {
  switch (message.type) {
    case 'select-object':
      console.log('Select:', message.debugId);
      break;
    case 'request-snapshot':
      console.log('Snapshot requested');
      break;
  }
});
```

### Cleanup

```typescript
// When done (e.g., page unload)
transport.close();
```

This will:
1. Remove the `message` event listener
2. Clear all callbacks
3. Notify connection change handlers

## Browser Extension Integration

The postMessage transport is designed for seamless integration with browser extensions:

### Content Script (Extension Side)

```typescript
// Content script injected into page
const pageOrigin = window.location.origin;

// Forward messages from page to extension
window.addEventListener('message', (event) => {
  if (event.origin !== pageOrigin) return;
  if (event.data?.source !== '3lens-probe') return;
  
  // Forward to background script
  chrome.runtime.sendMessage(event.data.payload);
});

// Forward messages from extension to page
chrome.runtime.onMessage.addListener((message) => {
  window.postMessage({
    source: '3lens-devtool',
    version: '1.0.0',
    payload: message,
  }, pageOrigin);
});
```

### Devtools Panel (Extension Side)

```typescript
// In devtools panel
chrome.runtime.onMessage.addListener((message) => {
  // Update UI with probe data
  updateStatsPanel(message);
});

// Send commands to probe
function selectObject(uuid: string) {
  chrome.runtime.sendMessage({
    type: 'select-object',
    timestamp: Date.now(),
    debugId: uuid,
  });
}
```

## Comparison with Direct Transport

| Feature | PostMessage | Direct |
|---------|-------------|--------|
| Serialization | JSON (via postMessage) | None (direct reference) |
| Cross-context | ✅ Yes | ❌ No |
| Performance | Good | Best |
| Use case | Extensions, iframes | In-app overlay |

## Troubleshooting

### Messages Not Received

1. **Check origin** - Ensure sender and receiver are same origin
2. **Check source** - Verify `source` field matches expected value
3. **Check listener** - Ensure event listener is attached before sending

### Connection Not Established

1. **Timing** - Probe must be listening before devtool sends handshake
2. **Handshake type** - First message must be `handshake-request`
3. **Console errors** - Check for errors in transport callbacks

## See Also

- [Transport Interface](./transport-interface.md) - Base transport interface
- [Direct Transport](./direct-transport.md) - In-app overlay communication
- [Message Serialization](./message-serialization.md) - Message format details
