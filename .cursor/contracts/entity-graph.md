# Contract: Entity Graph

## Purpose

The Entity Graph is the unified typed graph that powers Inspector, queries, diffs, and attribution.
All tools must operate on stable entity IDs and explicit relationships.

## Invariants (MUST ALWAYS HOLD)

1. **Stable, namespaced IDs:**
   - Every entity ID MUST be namespaced by context: `{context_id}:{type}:{local_id}`
   - IDs MUST NOT be raw JS object references.
   - IDs MUST be stable across frames for the same logical entity.

2. **Typed nodes and edges:**
   - Every node MUST have a `type` field.
   - Every edge MUST have a `type` and direction.
   - Unknown types are not allowed; use `unknown` type explicitly if needed.

3. **Graph is reconstructible from capture:**
   - A trace replay MUST reproduce the same entity IDs and core relationships.
   - Entity graph state at any point can be derived from events.

4. **Ownership is explicit for resources:**
   - Every resource MUST have `ownership`: `context_owned | shared | external`.
   - Shared resources are represented once with references from multiple contexts.

5. **Selection uses entity IDs only:**
   - Any UI selection and query output MUST reference entity IDs, not object references.

## Minimum Node Types (EXTENSIBLE)

### Core Types
- `renderer` - WebGL/WebGPU renderer instance
- `scene` - Three.js scene
- `camera` - Any camera type
- `object3d` - Base for all scene objects (mesh, light, group, etc.)

### Resource Types
- `geometry` - Buffer geometry
- `material` - Any material type
- `texture` - Texture resources
- `render_target` - Framebuffer/render target

### Shader/Pipeline Types
- `shader` - Shader program/module
- `shader_variant` - Compiled shader variant
- `pipeline` - Render pipeline (WebGPU) or program (WebGL)

### Rendering Types
- `draw_call` - Individual draw submission
- `pass` - Render pass boundary
- `frame` - Frame grouping

## Minimum Edge Types (EXTENSIBLE)

### Structural Edges
- `contains` - Parent-child in scene graph (scene->object, object->object)
- `child_of` - Reverse of contains

### Usage Edges
- `uses` - Resource usage (mesh->material, material->texture, pass->render_target)
- `used_by` - Reverse of uses

### Rendering Edges
- `renders_with` - Draw call associations (draw_call->material, draw_call->shader_variant)
- `rendered_in` - Context of rendering (draw_call->pass, pass->pipeline)

### Ownership/Reference Edges
- `owns` - Ownership relationship (context->resource)
- `references` - Non-owning reference (entity->resource)

## Degradation Rules (ALLOWED BUT MUST BE EXPLICIT)

- If some relationships cannot be observed:
  - The graph MUST omit them and mark the related fields as UNAVAILABLE rather than guessing.
- If an entity cannot be uniquely identified:
  - The graph MUST fall back to a synthetic ID with a fidelity label (ESTIMATED).

## Acceptance Tests

- **Namespacing:**
  - Two contexts with identical local IDs MUST NOT collide.
- **Reconstructibility:**
  - Replay trace -> same node/edge counts for minimum required types.
- **Ownership:**
  - Shared resources must be representable without duplication or ambiguous ownership.
- **Selection:**
  - Selecting an entity and reopening trace must resolve to same entity.
- **Type safety:**
  - Attempt to create node without type -> MUST fail validation.

## Anti-goals

- "Inspector works by poking live objects" as primary model
- Graph nodes without types
- IDs that change every render frame for stable entities
- Assuming single-context when building graph
- Storing JS object references in entity data
