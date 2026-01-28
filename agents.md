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
- [capture.md](agents/contracts/capture.md) - Event schema, render events as source of truth
- [entity-graph.md](agents/contracts/entity-graph.md) - Stable namespaced IDs, typed nodes/edges
- [attribution.md](agents/contracts/attribution.md) - Weighted blame chains
- [fidelity.md](agents/contracts/fidelity.md) - EXACT/ESTIMATED/UNAVAILABLE
- [runtime-boundaries.md](agents/contracts/runtime-boundaries.md) - Layer separation
- [overhead.md](agents/contracts/overhead.md) - Capture modes, performance budget

### Feature Contracts
- [inspector.md](agents/contracts/inspector.md) - The 5 questions
- [shader-graph.md](agents/contracts/shader-graph.md) - Runtime introspection

### Infrastructure Contracts
- [transport.md](agents/contracts/transport.md) - Worker/remote UI protocol
- [ui-surfaces.md](agents/contracts/ui-surfaces.md) - Overlay/dock/window/extension
- [discovery.md](agents/contracts/discovery.md) - Auto-detect with fidelity
- [pipelines.md](agents/contracts/pipelines.md) - Pass boundaries, MRT
- [loading.md](agents/contracts/loading.md) - 5 loading modes

### Production Contracts
- [compatibility.md](agents/contracts/compatibility.md) - three.js versions, WebGL/WebGPU
- [storage.md](agents/contracts/storage.md) - Ring buffer, compression, export
- [addons.md](agents/contracts/addons.md) - Versioning, capabilities
- [security-csp.md](agents/contracts/security-csp.md) - CSP-safe mode

---

## Project Workflow

### When Adding a Feature/Panel/Tool

You MUST declare:
1. **Entities consumed/produced** - What entity types does this touch?
2. **Queries used/added** - What queries does this use or create?
3. **Actions exposed** - What commands/mutations does this enable?
4. **Verification method** - How do you validate it works? (diff/baseline)

Then follow the relevant playbook:
- [agents/playbooks/add-a-panel.md](agents/playbooks/add-a-panel.md) - Adding UI
- [agents/playbooks/add-a-probe.md](agents/playbooks/add-a-probe.md) - Adding instrumentation
- [agents/playbooks/add-a-plugin.md](agents/playbooks/add-a-plugin.md) - Creating an addon
- [agents/playbooks/add-a-host.md](agents/playbooks/add-a-host.md) - Creating a host

### Definition of Done (DoD)

A change is "done" only if:
- [ ] It does not violate any applicable contract
- [ ] It includes an attribution path (metrics -> culprit)
- [ ] It works in both live mode and offline trace mode
- [ ] It updates or adds acceptance tests for touched contracts
- [ ] Fidelity is explicit for any new metrics

Use checklist: [agents/checklists/pr.md](agents/checklists/pr.md)

---

## Commands

See [skills.md](skills.md) for the full command reference.

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
| `agents/contracts/` | Contract definitions |
| `tests/contracts/` | Contract validation tests |

---

## Mental Model

> **3Lens is not a collection of tools — it is a shared introspection substrate that happens to surface many tools.**

Every feature is a query + visualization over the same underlying system.
This is what makes the "superset" vision work.
