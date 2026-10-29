# Light devtools evaluation

Reference: `../../imagegen/3lens-light-v2/01-light-workspace.png`.

The built-in image generator produced a light shadcn-inspired concept from the original inspection workspace. The implementation adopts white cards, zinc surfaces, dark text, outlined controls, rounded tabs, pill fidelity badges, and a light command menu. Real scene content and captured values remain application-owned.

This is a framework-independent interpretation of shadcn's component styling and semantic tokens, not a migration to React shadcn components. Tokens are scoped to the tools and do not modify the host page's theme.

## Coverage

- Inspect: light tree, inspector, controls, timeline, and toolbar over the unchanged application canvas.
- Performance: light charts, tables, causal cards, fidelity indicators, and comparison controls.
- Memory: light resource tables and lifecycle views.
- Changes: light trace selectors, comparison table, entity paths, and bookmarks.
- Shaders: light source viewer with contrasting syntax colors, variant table, and pipeline cards.
- Surfaces: light presentation of every surface illustration and action.
- Command menu: white popover, subdued backdrop, focus ring, keyboard hints, and flat command rows.
- Overlay and dock: captured in `overlay.png` and `dock.png`.

## Verification

The browser script checks all six screens for `color-scheme: light`, a `rgb(250, 250, 250)` shell, and dark foreground text. It captures each screen and the command menu and checks for JavaScript exceptions. All six checks passed with no exceptions. Visual review confirmed the scene stayed unchanged and prompted corrections to flat command rows and amber caution styling.

The investigation source typecheck, 16 UI contract tests across workspace/analysis/trace views, and ui-core production build passed. `git diff --check` passed. Saved trace behavior is covered by the existing trace UI contract tests; this styling change adds no queries, metrics, entities, or mutations.

Screenshots are evaluation artifacts, not pixel-identical reproductions of the generated concept. Real captured data determines rows, values, and viewport content.
