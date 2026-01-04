# Common Types

Common type definitions shared across the 3Lens library.

## Overview

```typescript
import type { Unsubscribe } from '@3lens/core';
```

## Types

### Unsubscribe

Function type returned by event subscription methods. Call to stop receiving events.

```typescript
type Unsubscribe = () => void;
```

#### Usage

```typescript
import { Probe } from '@3lens/core';

const probe = new Probe();

// Subscribe returns an unsubscribe function
const unsubscribe: Unsubscribe = probe.onFrame((stats) => {
  console.log('Frame:', stats.frameNumber);
});

// Later: stop receiving events
unsubscribe();
```

#### Common Patterns

**Auto-cleanup in components:**

```typescript
class MyComponent {
  private subscriptions: Unsubscribe[] = [];
  
  init(probe: Probe) {
    // Collect all subscriptions
    this.subscriptions.push(
      probe.onFrame((stats) => this.handleFrame(stats))
    );
    this.subscriptions.push(
      probe.onSceneChange((snapshot) => this.handleScene(snapshot))
    );
  }
  
  destroy() {
    // Clean up all at once
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];
  }
}
```

**One-time subscription:**

```typescript
function waitForNextFrame(probe: Probe): Promise<FrameStats> {
  return new Promise((resolve) => {
    const unsubscribe = probe.onFrame((stats) => {
      unsubscribe(); // Immediately unsubscribe
      resolve(stats);
    });
  });
}
```

**Conditional unsubscribe:**

```typescript
const unsubscribe = probe.onFrame((stats) => {
  if (stats.warnings.length > 0) {
    console.log('Warnings detected:', stats.warnings);
    unsubscribe(); // Stop after first warning
  }
});
```

**Subscription manager:**

```typescript
class SubscriptionManager {
  private subscriptions = new Map<string, Unsubscribe>();
  
  add(key: string, unsubscribe: Unsubscribe) {
    // Auto-cleanup existing subscription with same key
    this.subscriptions.get(key)?.();
    this.subscriptions.set(key, unsubscribe);
  }
  
  remove(key: string) {
    this.subscriptions.get(key)?.();
    this.subscriptions.delete(key);
  }
  
  clear() {
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions.clear();
  }
}

// Usage
const subs = new SubscriptionManager();
subs.add('frame', probe.onFrame(handleFrame));
subs.add('scene', probe.onSceneChange(handleScene));

// Later
subs.remove('frame');  // Remove specific
subs.clear();          // Remove all
```

## See Also

- [Probe](./probe.md) - Main API returning Unsubscribe functions
- [EventEmitter](./event-emitter.md) - Event system
