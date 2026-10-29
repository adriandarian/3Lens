// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLens, type Lens } from '@3lens/runtime';
import type { Node } from '@3lens/kernel';
import { renderAnalysisView } from '../../packages/ui/core/src/platform/analysis-views';
import type { PlatformViewContext } from '../../packages/ui/core/src/platform/types';

const lenses: Lens[] = [];
afterEach(() => {
  for (const lens of lenses.splice(0)) lens.dispose();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

function fixture() {
  const lens = createLens({ enabled: true });
  lenses.push(lens);
  const base = {
    context_id: 'main',
    origin: 'preexisting',
    created_at: 1,
    modified_at: 1,
    active: true,
  };
  const cube = {
    ...base,
    id: 'main:object3d:cube',
    type: 'object3d',
    name: 'MainCube',
    object_type: 'Mesh',
    visible: true,
  } as Node;
  const geometry = {
    ...base,
    id: 'main:geometry:box',
    type: 'geometry',
    name: 'BoxGeometry',
    memory_bytes: 840,
    memory_fidelity: 'ESTIMATED',
  } as Node;
  const texture = {
    ...base,
    id: 'main:texture:map',
    type: 'texture',
    name: 'albedo.png',
    memory_bytes: 0,
    memory_fidelity: 'UNAVAILABLE',
  } as Node;
  const shader = {
    ...base,
    id: 'main:shader:program',
    type: 'shader',
    name: 'StandardMaterial',
  } as Node;
  [cube, geometry, texture, shader].forEach((node) =>
    lens.getGraph().addNode(node)
  );
  lens
    .getGraph()
    .addEdge({
      from: cube.id,
      to: geometry.id,
      type: 'uses',
      created_at: 1,
      active: true,
    });
  const snapshot = {
    frames: [
      {
        frame: 10,
        context_id: 'main',
        timestamp: 100,
        cpu_ms: 0.25,
        cpu_fidelity: 'EXACT',
        draw_calls: 2,
        triangles: 24,
        metrics_fidelity: 'EXACT',
        entity_ids: [cube.id],
        pass_ids: [],
        fidelity: 'ESTIMATED',
      },
      {
        frame: 11,
        context_id: 'main',
        timestamp: 116,
        cpu_ms: 0.5,
        cpu_fidelity: 'EXACT',
        draw_calls: 2,
        triangles: 24,
        metrics_fidelity: 'EXACT',
        entity_ids: [cube.id],
        pass_ids: [],
        fidelity: 'ESTIMATED',
      },
    ],
    events: [],
    resources: [
      {
        entity_id: geometry.id,
        name: 'BoxGeometry',
        kind: 'geometry',
        node: geometry,
        memory_bytes: 840,
        memory_fidelity: 'ESTIMATED',
        users: [cube.id],
        state: 'referenced',
        created_at: 100,
        disposed_at: null,
        lifecycle: [],
        reason: 'CPU buffer byte-length proxy.',
      },
      {
        entity_id: texture.id,
        name: 'albedo.png',
        kind: 'texture',
        node: texture,
        memory_bytes: null,
        memory_fidelity: 'UNAVAILABLE',
        users: [],
        state: 'unreferenced',
        created_at: null,
        disposed_at: null,
        lifecycle: [],
        reason: 'GPU texture storage not observed.',
      },
    ],
    assets: [],
    shaders: [],
    passes: [],
    pipeline_edges: [],
    dropped_events: 0,
    reasons: [],
  };
  const query = lens.query.bind(lens);
  vi.spyOn(lens, 'query').mockImplementation((name, params) =>
    name === 'platform_snapshot'
      ? ({ data: snapshot, fidelity: 'EXACT' } as any)
      : query(name, params)
  );
  const select = vi.fn((id: string) => lens.select(id));
  const refresh = vi.fn();
  const notify = vi.fn();
  const setFrame = vi.fn();
  const context: PlatformViewContext = {
    lens,
    document,
    select,
    refresh,
    notify,
    setFrame,
    selectedId: cube.id,
  };
  return { lens, context, snapshot, cube, geometry, texture, shader };
}

describe('Platform analysis screens', () => {
  it('renders captured performance values, routes frame/culprit navigation, and saves a real timing baseline', () => {
    const { context, lens, cube } = fixture();
    const screen = renderAnalysisView('performance', context);
    document.body.append(screen);
    expect(screen.textContent).toContain('Frame time timeline');
    expect(screen.textContent).toContain('Rendering work');
    expect(screen.textContent).toContain('Causal path');
    expect(screen.textContent).toContain('CPU timing is not GPU timing');
    expect(screen.querySelectorAll('.tlpa-frame-bar')).toHaveLength(2);
    (screen.querySelector('[data-frame="10"]') as HTMLButtonElement).click();
    expect(context.setFrame).toHaveBeenCalledWith(10);
    expect(lens.getSelection().entity_ids).toEqual([cube.id]);
    const baseline = [...screen.querySelectorAll('button')].find(
      (button) => button.textContent === 'Set timing baseline'
    )!;
    baseline.click();
    expect(context.notify).toHaveBeenCalledWith(
      'Timing baseline saved at frame 11.'
    );
    expect(renderAnalysisView('performance', context).textContent).toContain(
      'Baseline · Frame 11'
    );
  });

  it('renders resource estimates without substituting zero for unavailable storage and filters captured resources', () => {
    const { context, lens, geometry } = fixture();
    const screen = renderAnalysisView('memory', context);
    document.body.append(screen);
    expect(screen.textContent).toContain('Resource lifecycle');
    expect(screen.textContent).toContain('Dependency / ownership graph');
    expect(screen.textContent).toContain('Asset loading activity');
    const textureRow = screen.querySelector(
      'tr[data-entity-id="main:texture:map"]'
    )!;
    expect(textureRow.textContent).toContain('UNAVAILABLE');
    expect(textureRow.textContent).not.toContain('0 B');
    const geometryRow = screen.querySelector(
      'tr[data-entity-id="main:geometry:box"]'
    )!;
    (geometryRow.querySelector('button') as HTMLButtonElement).click();
    expect(lens.getSelection().entity_ids).toEqual([geometry.id]);
    const search = screen.querySelector<HTMLInputElement>(
      '[aria-label="Search resources…"]'
    )!;
    search.value = 'albedo';
    search.dispatchEvent(new Event('input'));
    expect(
      screen.querySelector('tr[data-entity-id="main:geometry:box"]')
    ).toBeNull();
    expect(
      screen.querySelector('tr[data-entity-id="main:texture:map"]')
    ).not.toBeNull();
    expect(
      renderAnalysisView('memory', context).querySelector<HTMLInputElement>(
        '[aria-label="Search resources…"]'
      )!.value
    ).toBe('albedo');
  });

  it('shows structured unavailable shader/pipeline states rather than fake passes or authored source', () => {
    const { context } = fixture();
    const screen = renderAnalysisView('shaders', context);
    document.body.append(screen);
    expect(screen.textContent).toContain('Render pipeline');
    expect(screen.textContent).toContain('Compiled shader variants');
    expect(screen.textContent).toContain('Shader source unavailable');
    expect(screen.textContent).toContain('Pipeline state');
    expect(screen.textContent).toContain('Compilation events');
    expect(screen.textContent).not.toContain('0.18 ms');
    const copy = [...screen.querySelectorAll('button')].find(
      (button) => button.textContent === 'Copy source'
    )!;
    expect(copy.disabled).toBe(true);
    expect(screen.querySelector('textarea')).toBeNull();
  });

  it('renders captured shader text safely and switches between observed fragment and vertex stages', () => {
    const { context, snapshot, shader } = fixture();
    snapshot.shaders.push({
      entity_id: shader.id,
      name: 'Program 07',
      context_id: 'main',
      material_ids: [],
      defines: { USE_MAP: true },
      vertex_source: 'void main() { gl_Position = vec4(0.0); }',
      fragment_source: '<img src=x onerror=alert(1)>\nvoid main() {}',
      compile_ms: null,
      fidelity: 'EXACT',
      reason: 'Captured shader source.',
    } as never);
    context.refresh = () => {
      document.body.replaceChildren(renderAnalysisView('shaders', context));
    };
    document.body.append(renderAnalysisView('shaders', context));
    expect(document.querySelector('img')).toBeNull();
    expect(document.querySelector('.tlpa-source-body')!.textContent).toContain(
      '<img src=x onerror=alert(1)>'
    );
    [...document.querySelectorAll('button')]
      .find((button) => button.textContent === 'Vertex shader')!
      .click();
    expect(document.querySelector('.tlpa-source-body')!.textContent).toContain(
      'gl_Position'
    );
    expect(
      document.querySelector('.tlpa-source-body')!.textContent
    ).not.toContain('onerror');
  });
});
