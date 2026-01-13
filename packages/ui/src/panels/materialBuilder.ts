/**
 * Material Builder Panel - Architecture scaffold
 */

      <div class="material-builder-library ${materialBuilder.isNodeLibraryOpen ? 'open' : 'collapsed'}">
        <div class="material-builder-library-header">
          <span>Node Library</span>
          <button class="material-builder-toggle" data-action="material-builder-toggle-library">
            ${materialBuilder.isNodeLibraryOpen ? 'Hide' : 'Show'}
          </button>
        </div>
        <div class="material-builder-library-body">
          <button class="material-builder-library-item" data-action="material-builder-add-node" data-node-type="texture">
            Texture2D
          </button>
          <button class="material-builder-library-item" data-action="material-builder-add-node" data-node-type="value">
            Float Value
          </button>
          <button class="material-builder-library-item" data-action="material-builder-add-node" data-node-type="math">
            Math Add
          </button>
        </div>
      </div>

export function renderMaterialBuilderPanel(
  _context: PanelContext,
  _state: UIState
): string {
  return `
    <div class="panel-split-view material-builder-panel">
      <div class="material-builder-canvas">
        <div class="material-builder-canvas-header">
          <div class="material-builder-title">
            <span class="material-builder-badge">Architecture</span>
            <span>Graph Canvas</span>
          </div>
          <div class="material-builder-actions">
            <button class="material-builder-action" disabled>Add Node</button>
            <button class="material-builder-action" disabled>Auto Layout</button>
          </div>
        </div>
        <div class="material-builder-canvas-body">
          <div class="material-builder-grid"></div>
          <div class="material-builder-node" style="left: 72px; top: 72px;">
            <div class="material-builder-node-header">Texture2D</div>
            <div class="material-builder-node-body">
              <div class="material-builder-port input">UV</div>
              <div class="material-builder-port output">RGBA</div>
            </div>
          </div>
          <div class="material-builder-node" style="left: 320px; top: 160px;">
            <div class="material-builder-node-header">PBR Output</div>
            <div class="material-builder-node-body">
              <div class="material-builder-port input">Base Color</div>
              <div class="material-builder-port input">Metalness</div>
              <div class="material-builder-port input">Roughness</div>
            </div>
          </div>
          <div class="material-builder-wire"></div>
        </div>
      </div>
      <div class="panel-inspector material-builder-inspector">
        <div class="material-builder-section">
          <div class="material-builder-section-title">MVP Checklist</div>
          <ul class="material-builder-checklist">
            <li><span class="dot planned"></span> Graph canvas + pan/zoom</li>
            <li><span class="dot planned"></span> Node library + typing rules</li>
            <li><span class="dot planned"></span> Output node → material properties</li>
            <li><span class="dot planned"></span> Live updates via material commands</li>
          </ul>
        </div>
        <div class="material-builder-section">
          <div class="material-builder-section-title">Selected Node</div>
          <div class="material-builder-placeholder">Select a node to edit settings.</div>
        </div>
        <div class="material-builder-section">
          <div class="material-builder-section-title">Material Output</div>
          <div class="material-builder-output">
            <div class="material-builder-output-row">
              <span>Target</span>
              <span>MeshStandardMaterial</span>
            </div>
            <div class="material-builder-output-row">
              <span>Updates</span>
              <span>Color, Roughness, Metalness</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
  const toggleButton = container.querySelector<HTMLButtonElement>(
    '[data-action="material-builder-toggle-library"]'
  toggleButton?.addEventListener('click', () => {
        isNodeLibraryOpen: !state.materialBuilder.isNodeLibraryOpen,
  container
    .querySelectorAll<HTMLButtonElement>(
      '[data-action="material-builder-add-node"]'
    )
    .forEach((button) => {
      button.addEventListener('click', () => {
        const nodeType = button.dataset.nodeType ?? 'math';
        const newNode = createNodeFromType(nodeType, state);
        updateState({
          materialBuilder: {
            ...state.materialBuilder,
            nodes: [...state.materialBuilder.nodes, newNode],
          },
        });
        rerender();
      });
    });


function createNodeFromType(
  nodeType: string,
  state: UIState
): MaterialBuilderNode {
  const nextIndex = state.materialBuilder.nodes.length + 1;
  const position = { x: 120 + nextIndex * 26, y: 220 + nextIndex * 28 };

  if (nodeType === 'texture') {
    return {
      id: `node-texture-${nextIndex}`,
      type: 'texture',
      title: `Texture2D ${nextIndex}`,
      position,
      ports: [
        { id: 'uv', name: 'UV', direction: 'input', dataType: 'vector2' },
        { id: 'rgba', name: 'RGBA', direction: 'output', dataType: 'color' },
      ],
    };
  }

  if (nodeType === 'value') {
    return {
      id: `node-value-${nextIndex}`,
      type: 'value',
      title: `Float ${nextIndex}`,
      position,
      ports: [
        { id: 'value', name: 'Value', direction: 'output', dataType: 'float' },
      ],
    };
  }

  return {
    id: `node-math-${nextIndex}`,
    type: 'math',
    title: `Add ${nextIndex}`,
    position,
    ports: [
      { id: 'a', name: 'A', direction: 'input', dataType: 'float' },
      { id: 'b', name: 'B', direction: 'input', dataType: 'float' },
      { id: 'out', name: 'Out', direction: 'output', dataType: 'float' },
    ],
  };
}
