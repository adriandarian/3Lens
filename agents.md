# 3Lens - Agent Guide

This document explains how to work on 3Lens in an agentic workflow.
It prioritizes architecture invariants, contracts, and repeatable commands over ad-hoc features.

**If any instruction conflicts with a contract, the contract wins unless explicitly revised.**

---

## What is 3Lens?

3Lens is a full-spectrum developer tooling platform for three.js rendering systems.
It is a superset of tools (inspection, performance, memory, diffs, shader/pipeline analysis),
built on shared primitives so features compose instead of becoming isolated panels.

### What 3Lens IS
- A render introspection OS for three.js
- Capture -> Model -> Query -> Visualize -> Act -> Verify
- Deep trace + causal analysis
- Regression detection and diff tooling
- Multi-context aware (multiple renderers, scenes, cameras)

### What 3Lens is NOT
- A "stats dashboard" with metrics panels
- A property editor (that's Needle Inspector's strength)
- A shader authoring tool (that's TSL Graph's domain)

---

## Non-negotiable Design Principles

### 1. Shared Primitives Before New UI
- Capture schema
- Entity graph
- Query engine
- Time + diff are first-class

### 2. Inspector is the Spine
- Global selection uses stable entity IDs
- Tools route through selection and queries
- No isolated object views

### 3. Metrics Must Attribute
- No metric without a clickable path to culprit entities
- Blame chains with weights
- Auditable causality

### 4. Live and Offline Parity
- Every core capability must work on saved traces
- Same UI, same queries, same answers

### 5. Kernel is Privileged; Plugins are Constrained
- Internal tools may use private hooks
- Plugins consume stable events/queries only
- No framework code in kernel

### 6. Data Fidelity is Explicit
- EXACT / ESTIMATED / UNAVAILABLE for all metrics
- Never silent degradation
- UI shows fidelity badges

---

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│ Mount Kits (Angular / React / Vue / Svelte) │
├─────────────────────────────────────────────┤
│ UI Core (DOM island / Web Component)        │
├─────────────────────────────────────────────┤
│ Runtime Client API (Lens, queries, commands)│
├─────────────────────────────────────────────┤
│ Hosts (manual / r3f / tres / worker)        │
├─────────────────────────────────────────────┤
│ Kernel (capture / graph / query / trace)    │
└─────────────────────────────────────────────┘
```

### Dependency Rules
- Kernel has ZERO imports from UI/Mount packages
- UI Core has ZERO imports from framework-specific packages
- Hosts have ZERO imports from UI Core/Mount packages
- Mount Kits use only public client APIs

---

## Contracts (MUST READ)

Contracts define non-negotiable behaviors. Agents MUST implement and validate these contracts before shipping features.

### Core Contracts
- [capture.md](.cursor/contracts/capture.md) - Event schema, render events as source of truth
- [entity-graph.md](.cursor/contracts/entity-graph.md) - Stable namespaced IDs, typed nodes/edges
- [attribution.md](.cursor/contracts/attribution.md) - Weighted blame chains
- [fidelity.md](.cursor/contracts/fidelity.md) - EXACT/ESTIMATED/UNAVAILABLE
- [runtime-boundaries.md](.cursor/contracts/runtime-boundaries.md) - Layer separation
- [overhead.md](.cursor/contracts/overhead.md) - Capture modes, performance budget

### Feature Contracts
- [inspector.md](.cursor/contracts/inspector.md) - The 5 questions
- [shader-graph.md](.cursor/contracts/shader-graph.md) - Runtime introspection
- [animation.md](.cursor/contracts/animation.md) - Animation clip tracking and timeline scrubbing
- [asset-loading.md](.cursor/contracts/asset-loading.md) - Loader lifecycle and asset dependency graphs

### Infrastructure Contracts
- [transport.md](.cursor/contracts/transport.md) - Worker/remote UI protocol
- [ui-surfaces.md](.cursor/contracts/ui-surfaces.md) - Overlay/dock/window/extension
- [discovery.md](.cursor/contracts/discovery.md) - Auto-detect with fidelity
- [pipelines.md](.cursor/contracts/pipelines.md) - Pass boundaries, MRT
- [loading.md](.cursor/contracts/loading.md) - 5 loading modes

### Production Contracts
- [compatibility.md](.cursor/contracts/compatibility.md) - three.js versions, WebGL/WebGPU
- [storage.md](.cursor/contracts/storage.md) - Ring buffer, compression, export
- [addons.md](.cursor/contracts/addons.md) - Versioning, capabilities
- [security-csp.md](.cursor/contracts/security-csp.md) - CSP-safe mode

---

## Project Workflow

### When Adding a Feature/Panel/Tool

You MUST declare:
1. **Entities consumed/produced** - What entity types does this touch?
2. **Queries used/added** - What queries does this use or create?
3. **Actions exposed** - What commands/mutations does this enable?
4. **Verification method** - How do you validate it works? (diff/baseline)

Then follow the relevant playbook:
- [.cursor/playbooks/add-a-panel.md](.cursor/playbooks/add-a-panel.md) - Adding UI
- [.cursor/playbooks/add-a-probe.md](.cursor/playbooks/add-a-probe.md) - Adding instrumentation
- [.cursor/playbooks/add-a-plugin.md](.cursor/playbooks/add-a-plugin.md) - Creating an addon
- [.cursor/playbooks/add-a-host.md](.cursor/playbooks/add-a-host.md) - Creating a host

For complex tasks, use [.cursor/playbooks/plan-then-execute.md](.cursor/playbooks/plan-then-execute.md) before coding.

### Definition of Done (DoD)

A change is "done" only if:
- [ ] It does not violate any applicable contract
- [ ] It includes an attribution path (metrics -> culprit)
- [ ] It works in both live mode and offline trace mode
- [ ] It updates or adds acceptance tests for touched contracts
- [ ] Fidelity is explicit for any new metrics

---

## Commands

See [.cursor/commands/](.cursor/commands/) for the full command reference and [.cursor/skills/](.cursor/skills/) for operation-specific guidance.

### Quick Reference

```bash
# Trace operations
3lens trace:record --duration 10s --out traces/runA.json
3lens trace:open traces/runA.json
3lens diff traces/runA.json traces/runB.json

# Queries
3lens query top_hotspots --window 120f --metric gpu_time
3lens query leaks --threshold 300f

# Validation
3lens validate inspector
3lens validate capture

# Diagnostics
3lens doctor
```

---

## What To Do If You're Unsure

Default to:
1. Improve capture/model/query primitives
2. Add minimal view to validate the primitive
3. Only then expand UI/panels

If a panel feels like "just numbers", it's missing:
- Timeline integration
- Blame path to entities
- Diff capability
- Or actionable suggestions

---

## Key Files

| File | Purpose |
|------|---------|
| `packages/kernel/` | Capture, entity graph, query engine, trace format |
| `packages/runtime/` | Public API (createLens, registerContext) |
| `packages/host-*/` | Runtime attachment for different environments |
| `packages/addon-*/` | Feature addons (inspector, perf, memory, etc.) |
| `packages/ui-core/` | Framework-agnostic UI shell |
| `packages/mount-*/` | Framework-specific mounting |
| `.cursor/contracts/` | Contract definitions |
| `.cursor/playbooks/` | Development playbooks |
| `tests/contracts/` | Contract validation tests |
| `MEMORY.md` | Persistent AI corrections and learned patterns |

---

## Mental Model

> **3Lens is not a collection of tools — it is a shared introspection substrate that happens to surface many tools.**

Every feature is a query + visualization over the same underlying system.
This is what makes the "superset" vision work.
