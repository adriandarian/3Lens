# Contract: Transport

## Purpose

Transport enables 3Lens to operate as a distributed system:
- Runtime capture may occur in a worker or page
- UI may run in-page, separate window, or extension
Transport must be versioned, resilient, and performant under high event rates.

## Transport Model

```
┌─────────────────┐                    ┌─────────────────┐
│  Runtime Host   │  <=== Transport ===>  │  UI Surface   │
│  (Worker/Page)  │                    │  (Window/Ext)   │
└─────────────────┘                    └─────────────────┘
        │                                      │
        └──────────── Kernel ─────────────────┘
```

## Invariants (MUST ALWAYS HOLD)

1. **Messages are versioned:**
   - Every message MUST include `protocol_version`.
   - Incompatible versions must fail handshake gracefully.

2. **Handshake required:**
   - Connection MUST begin with a handshake that exchanges capabilities and session metadata.
   - No events sent before handshake completes.

3. **Batched delivery:**
   - Transport MUST support batching of events/messages to avoid per-event overhead.
   - Batch size/frequency is configurable.

4. **Backpressure:**
   - When receiver cannot keep up, sender MUST apply backpressure policy.
   - Options: degrade capture mode, drop low-priority events, slow down.

5. **Identity and routing:**
   - Every message MUST include `session_id`.
   - Messages MUST be routable by `context_id` when applicable.

6. **Deterministic ordering:**
   - Messages MUST preserve ordering within a context.
   - Include sequence numbers to restore ordering if needed.

## Allowed Transports

- `postMessage` (Window <-> Window, Worker <-> Window)
- `MessagePort` (Worker communication)
- `BroadcastChannel` (optional, multi-listener)

All implementations MUST conform to the same protocol contract.

## Message Types (MINIMUM SET)

### Handshake
- `hello` - Initial connection request with capabilities
- `hello_ack` - Connection accepted with session metadata

### Capability Negotiation
- `capabilities` - Declare what this endpoint supports/needs

### Data Transfer
- `snapshot_chunk` - Entity graph snapshot for late join
- `event_chunk` - Batched event stream
- `state_update` - Incremental state change

### Commands
- `command_request` - UI -> Runtime command (select, toggle, record)
- `command_response` - Runtime -> UI command result

### Control
- `warning` - Non-fatal issue
- `error` - Fatal issue
- `disconnect` - Graceful disconnect

## Message Shape

```typescript
interface TransportMessage {
  protocol_version: string;
  session_id: string;
  message_id: string;
  type: MessageType;
  context_id?: string;
  seq?: number;
  timestamp: number;
  payload: unknown;
}
```

## Degradation Rules (ALLOWED BUT MUST BE EXPLICIT)

- If reliable delivery cannot be guaranteed:
  - Transport MUST mark message fidelity as DEGRADED and emit warnings.
- If compression is unavailable:
  - Transport MUST fall back to structural compression (string tables/deltas).
- If receiver is slow:
  - Sender degrades capture mode or drops low-priority events.

## Late Join Support

- Viewer connecting mid-session MUST receive:
  1. Latest snapshot chunk (entity graph state)
  2. Subsequent event chunks (from snapshot onwards)
- Snapshot must be sufficient to render meaningful UI immediately.

## Acceptance Tests

- **Late join:**
  - Client connecting mid-session receives snapshot then event chunks, renders consistent UI.
- **Backpressure:**
  - Artificial receiver slowdown triggers sender degrade/drop policy and emits warnings.
- **Multi-context ordering:**
  - Interleaved contexts remain ordered per context via `seq`.
- **Version mismatch:**
  - Incompatible protocol versions fail handshake with clear error.

## Anti-goals

- Per-event unbatched postMessage calls
- Unversioned protocols
- UI-only state that cannot be reconstructed from snapshot+events
- Assuming same-thread communication
- Blocking main thread with transport operations
