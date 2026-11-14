# Light benchmark calibration (v3)

Reference: `../../imagegen/3lens-light-v2/01-light-workspace.png` (1774x887). Captured from the
running vanilla example with live frames via `capture.mjs` (headless Chrome over the DevTools
protocol; run `pnpm dev`, then `node capture.mjs`; `W`/`H` env vars change the viewport).

Presentation only: no entities, queries, metrics or mutations were added. Fidelity labels,
captured values and the application viewport remain application-owned.

## Matched to the benchmark

- **Header:** wordmark, session chevron, mint `LIVE` pill, outlined renderer select, gray mode pill,
  red-dot Record, kebab/minimize/close as icon buttons. Colors and sizes sampled from the reference.
- **Tabs:** underline tabs with teal indicator on **every** tool, including Surfaces.
- **Scene graph:** pale slate sidebar, iconed search, 38px rows, working expand/collapse caret on
  the scene root, benchmark indentation, teal selected row with accent bar.
- **Inspector:** banded Identity / Relationships / Cost / Changes / Actions sections, kind pill,
  ID chip with copy action, relationship chips, rectangular fidelity badges.
- **Frame timeline:** bold header, joined frame stepper, `Frame N` label, ms ruler spanning the
  observed CPU submit time, right-hand duration column, teal lanes.
- **Shared controls:** one outlined select style, command palette with highlighted row, compact
  change-path chips, normalized table cell sizes, status bar select/button sizes.

## Deliberate differences from the mockup

| Mockup | Implementation | Why |
| --- | --- | --- |
| `Main renderer`, ID `main:object3d:82a`, `48 KB`, `1240`, `60 FPS` | Real context name, UUID entity IDs, measured values | Mockup data is illustrative; the tools must not invent numbers or FPS |
| Header ends with a kebab | Kebab opens the command palette; Minimize and Close stay as labelled icon buttons | Existing contract tests and F2 flow depend on them |
| Pick entity only | Pick, Focus, Highlight and Clear | Existing functionality |
| Camera lane duration | `—` | No per-lane timer exists; only the scene submission is observed |
| Left rail with Scene/Performance/... | Rail reduced to entity-class jumps (Materials, Textures, Geometries, Lights, Cameras); tabs own tool switching | Matches the single-nav benchmark without losing the jumps |
| Component specimen strip, empty viewport | Not implemented | Mockup devices, not product UI |
| `What does it cost?` style headings | Short titles; the contract question is the section's `aria-label` and tooltip | Matches the benchmark labels while keeping the inspector contract discoverable |

## Responsive behavior

- 1151-1449px: Record/Export/Open collapse to labelled icons so the header never clips.
- Up to 1150px: the compact layout keeps its original lane grid (ruler/duration column hidden) and
  underline tabs; see `inspect-1000x700.png`.

## Not covered

- Memory, Changes, Shaders and Performance only have dark `platform-v1` references; their light
  look inherits the shell and is judged against the light-v2 chrome, not a dedicated mockup.
- Screenshots are evaluation artifacts, not pixel-identical reproductions: real captured data
  determines rows, values and viewport content.

## Verification

- `capture.mjs`: six tools at 1774x887, all `color-scheme: light`, header 58px and tabs 52px on
  every tool, no horizontal overflow, no JavaScript exceptions (`results.json`); also 1280x800
  and 1000x700 runs without exceptions.
- 65 tests pass, including five new structure tests in
  `tests/contracts/platform-workspace-ui.test.ts` (header/tabs on every tool, rail scope, icon
  control accessibility, inspector contract questions, tree collapse). The collapse test caught a
  real bug: a collapsed scene's children were re-listed under resources; fixed.
- `pnpm typecheck:investigation` and `pnpm lint` pass.
