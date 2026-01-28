# Contract: Animation

## Purpose

Animation tracking enables introspection of animation clips, keyframes, and timeline scrubbing for debugging and analysis.

## Invariants (MUST ALWAYS HOLD)

1. **Animation clips are entities:**
   - Every animation clip MUST have a stable entity ID
   - Animation clips are tracked in the entity graph
   - Clips can be queried and inspected like other entities

2. **Keyframe data is attributed:**
   - Keyframe changes MUST be attributed to specific clips
   - Keyframe updates include timestamp and value
   - Keyframe data includes fidelity labeling

3. **Timeline scrubbing is non-destructive:**
   - Scrubbing MUST NOT modify original animation data
   - Scrubbing MUST work with offline traces
   - Scrubbing state is queryable

4. **Animation performance is measurable:**
   - Animation update costs MUST be attributable
   - Animation performance metrics include fidelity
   - Animation costs can be compared across clips

## Degradation Rules (ALLOWED BUT MUST BE EXPLICIT)

- If animation system is not detected:
  - Mark animation entities as UNAVAILABLE
  - Return empty results with fidelity UNAVAILABLE
  - Emit warning_event explaining why

- If keyframe data is incomplete:
  - Mark keyframe data as ESTIMATED
  - Include available keyframes
  - Document missing data

- If timeline scrubbing is unavailable:
  - Mark scrubbing capability as UNAVAILABLE
  - Provide read-only timeline view
  - Explain limitation to user

## Entity Types

### AnimationClip

```typescript
interface AnimationClipEntity {
  id: string; // Format: "animation:namespace:clipId"
  type: 'animation_clip';
  name: string;
  duration: number;
  tracks: AnimationTrackEntity[];
  fidelity: Fidelity;
}
```

### AnimationTrack

```typescript
interface AnimationTrackEntity {
  id: string; // Format: "animation_track:namespace:trackId"
  type: 'animation_track';
  target: string; // Entity ID of target object
  property: string; // Property path (e.g., "position.x")
  keyframes: Keyframe[];
  fidelity: Fidelity;
}
```

### Keyframe

```typescript
interface Keyframe {
  time: number;
  value: number | [number, number, number]; // Scalar or vector
  interpolation: 'linear' | 'step' | 'cubic';
  fidelity: Fidelity;
}
```

## Events

### Animation Clip Events

```typescript
// Animation clip created
{
  type: 'animation_clip_create',
  context_id: string,
  entity_id: string,
  clip_name: string,
  duration: number,
  timestamp: number
}

// Animation clip updated
{
  type: 'animation_clip_update',
  context_id: string,
  entity_id: string,
  changes: {
    duration?: number,
    tracks?: string[] // Track entity IDs
  },
  timestamp: number
}

// Animation clip disposed
{
  type: 'animation_clip_dispose',
  context_id: string,
  entity_id: string,
  timestamp: number
}
```

### Animation Playback Events

```typescript
// Animation started
{
  type: 'animation_start',
  context_id: string,
  clip_id: string,
  timestamp: number,
  frame: number
}

// Animation paused
{
  type: 'animation_pause',
  context_id: string,
  clip_id: string,
  timestamp: number
}

// Animation stopped
{
  type: 'animation_stop',
  context_id: string,
  clip_id: string,
  timestamp: number
}

// Timeline scrubbed
{
  type: 'animation_scrub',
  context_id: string,
  clip_id: string,
  time: number,
  timestamp: number
}
```

## Queries

### Top Animation Costs

```typescript
query('top_animation_costs', {
  window: number, // Frames to analyze
  metric: 'cpu_time' | 'update_count'
}): {
  items: Array<{
    clipId: string;
    cost: number;
    attribution: Attribution[];
    fidelity: Fidelity;
  }>;
  fidelity: Fidelity;
}
```

### Animation Timeline

```typescript
query('animation_timeline', {
  clipId: string,
  startTime?: number,
  endTime?: number
}): {
  clip: AnimationClipEntity;
  currentTime: number;
  keyframes: Keyframe[];
  fidelity: Fidelity;
}
```

## Acceptance Tests (Definition of Done)

- **Animation clip tracking:**
  - Create animation clip → entity appears in graph
  - Play animation → playback events emitted
  - Dispose clip → disposal event emitted

- **Keyframe attribution:**
  - Update keyframe → attributed to clip
  - Query keyframes → returns with fidelity

- **Timeline scrubbing:**
  - Scrub timeline → scrub event emitted
  - Query timeline → returns current time
  - Works with offline traces

- **Performance attribution:**
  - Animation update → cost attributed to clip
  - Query top costs → returns clips with attribution

## Anti-goals (MUST NOT DO)

- Modifying original animation data during scrubbing
- Assuming single animation system
- Breaking traces when animation system unavailable
- Silent degradation of animation data
- Mixing animation systems (e.g., THREE.AnimationMixer with custom)

## See Also

- Contract: agents/contracts/entity-graph.md
- Contract: agents/contracts/attribution.md
- Contract: agents/contracts/fidelity.md