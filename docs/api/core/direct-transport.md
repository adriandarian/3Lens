# Direct Transport

The Direct Transport enables zero-overhead communication between the 3Lens probe and devtool UI when both run in the same JavaScript context, such as with an in-app overlay.

## Overview

```typescript
import { createDirectTransport } from '@3lens/core';

// Create paired transports
const { probeTransport, uiTransport } = createDirectTransport();

// Use probeTransport in your app
probe.connect(probeTransport);

// Use uiTransport in your overlay
overlay.connect(uiTransport);
```

## Use Cases

- **In-App Overlay** - 3Lens overlay rendered directly in the application
- **Development Mode** - Fast debugging without browser extension
- **Testing** - Unit tests that need probe-UI communication

## API

### createDirectTransport()

Creates a pair of connected transports for bidirectional communication.

```typescript
function createDirectTransport(): {
  probeTransport: Transport;
  uiTransport: Transport;
}
```

**Returns:** Object containing two linked `Transport` instances:
- `probeTransport` - For the probe to send/receive messages
- `uiTransport` - For the UI to send/receive messages

## How It Works

### Architecture

```
┌─────────────────┐                    ┌─────────────────┐
│  3Lens Probe    │                    │  Overlay UI     │
│                 │                    │                 │
│  probeTransport │◄──── Direct ────►│  uiTransport    │
│  .send()────────┼────────────────────►.onReceive()    │
│  .onReceive()◄──┼────────────────────.send()          │
└─────────────────┘                    └─────────────────┘
```

### Zero Serialization

Unlike postMessage transport, direct transport passes messages by reference:

```typescript
// Messages are NOT serialized
probeTransport.send(message);
// UI receives the exact same object reference
uiTransport.onReceive((msg) => {
  // msg === message (same object)
});
```

This provides maximum performance but requires both endpoints in the same context.

### Connection Establishment

Connection is established when the UI starts listening:

```typescript
const { probeTransport, uiTransport } = createDirectTransport();

// Not yet connected
console.log(probeTransport.isConnected()); // false

// UI subscribes to messages
uiTransport.onReceive((message) => {
  // Handle message
});

// Now connected
console.log(probeTransport.isConnected()); // true
```

## Usage Examples

### With createOverlay

The most common use case with the built-in overlay:

```typescript
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// createOverlay internally uses direct transport
const probe = createProbe({ name: 'My App' });
const overlay = createOverlay(probe);

// The overlay automatically:
// 1. Creates direct transport pair
// 2. Connects probe to probeTransport
// 3. Uses uiTransport for its panels
```

### Manual Setup

For custom UI implementations:

```typescript
import { createProbe, createDirectTransport } from '@3lens/core';

const probe = createProbe({ name: 'My App' });
const { probeTransport, uiTransport } = createDirectTransport();

// Connect probe
probe.connect(probeTransport);

// Custom UI handling
uiTransport.onReceive((message) => {
  switch (message.type) {
    case 'frame-stats':
      updateStatsDisplay(message.stats);
      break;
    case 'snapshot':
      updateSceneTree(message.snapshot);
      break;
    case 'selection-changed':
      highlightSelectedObject(message.selectedObject);
      break;
  }
});

// Send commands from UI
function onObjectClick(uuid: string) {
  uiTransport.send({
    type: 'select-object',
    timestamp: Date.now(),
    debugId: uuid,
  });
}
```

### Testing

Direct transport is ideal for unit tests:

```typescript
import { createProbe, createDirectTransport } from '@3lens/core';

describe('Probe communication', () => {
  it('sends frame stats', (done) => {
    const probe = createProbe({ name: 'Test' });
    const { probeTransport, uiTransport } = createDirectTransport();
    
    probe.connect(probeTransport);
    
    uiTransport.onReceive((message) => {
      if (message.type === 'frame-stats') {
        expect(message.stats.fps).toBeGreaterThan(0);
        done();
      }
    });
    
    // Trigger frame stats emission
    probe.observeRenderer(renderer);
    renderer.render(scene, camera);
  });
});
```

## Connection Lifecycle

### Initial State

```typescript
const { probeTransport, uiTransport } = createDirectTransport();

probeTransport.isConnected(); // false
uiTransport.isConnected();    // false
```

### After UI Connects

```typescript
// UI starts receiving
uiTransport.onReceive(() => {});

probeTransport.isConnected(); // true
uiTransport.isConnected();    // true
```

### Listening to Connection Changes

```typescript
probeTransport.onConnectionChange((connected) => {
  if (connected) {
    console.log('UI connected, starting data stream');
    startSendingStats();
  } else {
    console.log('UI disconnected');
    stopSendingStats();
  }
});
```

### Closing Connection

Either side can close the transport:

```typescript
// From probe side
probeTransport.close();

// Or from UI side
uiTransport.close();

// Both sides notified
probeTransport.isConnected(); // false
uiTransport.isConnected();    // false
```

## Performance Characteristics

| Aspect | Direct Transport | PostMessage Transport |
|--------|------------------|----------------------|
| Serialization | None | JSON via postMessage |
| Memory | Shared references | Copies |
| Latency | Synchronous | Async (microtask) |
| Large payloads | Instant | Serialization cost |
| Cross-context | ❌ No | ✅ Yes |

### When to Use Direct Transport

✅ **Use Direct Transport when:**
- Overlay runs in same page as your app
- Maximum performance is needed
- Testing probe-UI communication

❌ **Don't use Direct Transport when:**
- UI is in browser extension (use postMessage)
- UI is in different iframe/window
- Need cross-origin communication

## Implementation Details

### Message Callback Arrays

```typescript
// Internal structure
const probeToUi: Array<(message: DebugMessage) => void> = [];
const uiToProbe: Array<(message: DebugMessage) => void> = [];
```

### Send Implementation

```typescript
send(message: DebugMessage): void {
  // Direct iteration, no serialization
  for (const callback of targetCallbacks) {
    try {
      callback(message);
    } catch (e) {
      console.error('[3Lens] Error in direct transport:', e);
    }
  }
}
```

### Error Isolation

Errors in one callback don't prevent others from executing:

```typescript
uiTransport.onReceive((msg) => {
  throw new Error('Handler 1 error');
});

uiTransport.onReceive((msg) => {
  // This still executes despite error above
  console.log('Handler 2 received:', msg);
});
```

## See Also

- [Transport Interface](./transport-interface.md) - Base transport interface
- [PostMessage Transport](./postmessage-transport.md) - Cross-context communication
- [createOverlay](./create-overlay.md) - Overlay that uses direct transport
