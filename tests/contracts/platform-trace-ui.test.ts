// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Blob as NodeBlob } from 'node:buffer';
import { createLens, type Lens } from '@3lens/runtime';
import type { Event, Node, Trace } from '@3lens/kernel';
import { createTraceViewController } from '../../packages/ui/core/src/platform/trace-view';
import type { PlatformViewContext } from '../../packages/ui/core/src/platform/types';

const owned: Lens[] = [];
const controllers: ReturnType<typeof createTraceViewController>[] = [];
beforeEach(() => vi.stubGlobal('Blob', NodeBlob));
afterEach(() => {
  controllers.splice(0).forEach((controller) => controller.dispose());
  owned.splice(0).forEach((lens) => lens.dispose());
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

function node(name = 'MainCube', visible = true): Node {
  return {
    id: 'main:object3d:cube',
    name,
    type: 'object3d',
    context_id: 'main',
    active: true,
    origin: 'preexisting',
    created_at: 1,
    modified_at: 1,
    object_type: 'Mesh',
    visible,
    frustum_culled: true,
    render_order: 0,
    layer_mask: 1,
    child_count: 0,
  } as Node;
}
function fixture() {
  const lens = createLens({ enabled: true });
  owned.push(lens);
  lens.getGraph().addNode(node());
  lens.captureBaseline();
  let selectedId: string | undefined;
  let frame: number | undefined;
  const notifications: string[] = [];
  const inspect = vi.fn();
  let controller: ReturnType<typeof createTraceViewController>;
  const context: PlatformViewContext = {
    lens,
    document,
    get selectedId() {
      return selectedId;
    },
    get frame() {
      return frame;
    },
    select(id) {
      selectedId = id;
      lens.select(id);
    },
    notify(message) {
      notifications.push(message);
    },
    setFrame(value) {
      frame = value;
    },
    onInspect: inspect,
    refresh() {
      document.body.replaceChildren(controller.render());
    },
  };
  controller = createTraceViewController(context);
  controllers.push(controller);
  context.refresh();
  return {
    lens,
    controller,
    context,
    notifications,
    inspect,
    get frame() {
      return frame;
    },
  };
}
async function traceBlob(
  lens: Lens,
  options: {
    visible?: boolean;
    name?: string;
    dropped?: number;
    markerTime?: number;
    duration?: number;
    memory?: number;
    memoryFidelity?: string;
  } = {}
) {
  const trace = JSON.parse(await (await lens.exportTrace()).text()) as Trace;
  const latest = trace.snapshots.at(-1)!;
  const target = latest.graph.nodes.find(
    (item) => item.id === 'main:object3d:cube'
  )!;
  if (options.visible !== undefined)
    Object.assign(target, { visible: options.visible });
  if (options.name !== undefined) target.name = options.name;
  if (options.memory !== undefined) {
    latest.graph.nodes.push({
      id: 'main:geometry:box',
      type: 'geometry',
      context_id: 'main',
      name: 'BoxGeometry',
      active: true,
      origin: 'preexisting',
      created_at: 1,
      modified_at: 1,
      is_indexed: true,
      vertex_count: 24,
      attributes: [],
      memory_bytes: options.memory,
      memory_fidelity: options.memoryFidelity ?? 'ESTIMATED',
    } as Node);
  }
  const events: Event[] = [
    {
      type: 'context_update',
      context_id: 'main',
      seq: 1,
      timestamp: options.markerTime ?? 100,
      changes: { metadata: { marker: 'After resize' } },
    },
    {
      type: 'frame_begin',
      context_id: 'main',
      seq: 2,
      timestamp: 110,
      frame: 10,
      fidelity: 'ESTIMATED',
    },
    {
      type: 'frame_end',
      context_id: 'main',
      seq: 3,
      timestamp: 120,
      frame: 10,
      duration_ms: options.duration ?? 2,
      duration_fidelity: 'EXACT',
    },
  ];
  trace.events = [
    {
      index: 0,
      time_range: { start: 100, end: 120 },
      seq_range: { start: 1, end: 3 },
      events,
      compressed: false,
    },
  ];
  latest.event_index = events.length;
  trace.header.dropped_events = options.dropped ?? 0;
  trace.header.frame_range = { start: 10, end: 10 };
  return new Blob([JSON.stringify(trace)], { type: 'application/json' });
}
function click(text: string) {
  const element = [...document.querySelectorAll('button')].find(
    (item) => item.textContent === text
  );
  expect(element, `Expected button ${text}`).toBeTruthy();
  element!.click();
}

describe('Trace comparison workspace', () => {
  it('compares validated baseline/candidate files and routes changed entities into shared selection', async () => {
    const f = fixture();
    await f.controller.loadTrace(
      'baseline',
      await traceBlob(f.lens, { visible: true }),
      'baseline.json'
    );
    await f.controller.loadTrace(
      'candidate',
      await traceBlob(f.lens, { visible: false }),
      'candidate.json'
    );
    const row = document.querySelector<HTMLTableRowElement>(
      'tr[data-entity-id="main:object3d:cube"]'
    )!;
    expect(row.textContent).toContain('visible');
    expect(row.textContent).toContain('true');
    expect(row.textContent).toContain('false');
    row.click();
    expect(f.lens.getSelection().entity_ids).toEqual(['main:object3d:cube']);
    expect(f.inspect).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: 'main:object3d:cube',
        changes: ['visible'],
      })
    );
    expect(f.controller.getSelectedComparison()?.after).toMatchObject({
      visible: false,
    });
    expect(document.body.textContent).toContain('baseline.json');
    expect(document.body.textContent).toContain('candidate.json');
  });

  it('keeps malformed imports from replacing the existing side and renders captured names safely', async () => {
    const f = fixture();
    await f.controller.loadTrace(
      'baseline',
      await traceBlob(f.lens),
      'baseline.json'
    );
    await f.controller.loadTrace(
      'candidate',
      await traceBlob(f.lens, { name: '<img src=x onerror=alert(1)>' }),
      'candidate.json'
    );
    await expect(
      f.controller.loadTrace('candidate', new Blob(['{}']), 'bad.json')
    ).rejects.toThrow();
    f.context.refresh();
    expect(document.querySelector('img')).toBeNull();
    expect(document.body.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(document.body.textContent).toContain('candidate.json');
    expect(document.body.textContent).not.toContain('bad.json');
    expect(f.lens.getMode()).toBe('live');
  });

  it('propagates unavailable memory and reports dropped history instead of invented measurements', async () => {
    const f = fixture();
    await f.controller.loadTrace(
      'baseline',
      await traceBlob(f.lens, {
        memory: 1024,
        memoryFidelity: 'ESTIMATED',
        dropped: 3,
      })
    );
    await f.controller.loadTrace(
      'candidate',
      await traceBlob(f.lens, {
        memory: 4096,
        memoryFidelity: 'UNAVAILABLE',
        dropped: 4,
      })
    );
    const rows = [...document.querySelectorAll('tr')];
    const memory = rows.find((row) =>
      row.textContent?.includes('memory bytes')
    )!;
    expect(memory.querySelector('[data-fidelity=UNAVAILABLE]')).toBeTruthy();
    expect(memory.textContent).not.toContain('4 KB');
    expect(document.body.textContent).toContain('7 earlier events dropped');
  });

  it('aligns real marker timelines, selects frames, and keeps session bookmarks after rerender', async () => {
    const f = fixture();
    await f.controller.loadTrace(
      'baseline',
      await traceBlob(f.lens, { markerTime: 100 })
    );
    await f.controller.loadTrace(
      'candidate',
      await traceBlob(f.lens, { markerTime: 90 })
    );
    const alignment = document.querySelector<HTMLSelectElement>(
      '[aria-label="Trace alignment"]'
    )!;
    expect(alignment.options[1].disabled).toBe(false);
    alignment.value = 'marker';
    alignment.dispatchEvent(new Event('change'));
    const beforeBar = document.querySelector<HTMLButtonElement>(
      '[aria-label="baseline frame 10"]'
    )!;
    const afterBar = document.querySelector<HTMLButtonElement>(
      '[aria-label="candidate frame 10"]'
    )!;
    expect(beforeBar.style.left).not.toBe(afterBar.style.left);
    beforeBar.click();
    expect(f.frame).toBe(10);
    f.context.select('main:object3d:cube');
    f.context.refresh();
    click('+ Save selection');
    expect(
      document.querySelector('.tlp-trace-bookmark')!.textContent
    ).toContain('MainCube');
    f.context.refresh();
    expect(document.querySelectorAll('.tlp-trace-bookmark')).toHaveLength(1);
  });

  it('explicitly opens a chosen trace for offline inspection, without keeping a live renderer attached', async () => {
    const f = fixture();
    await f.controller.loadTrace(
      'candidate',
      await traceBlob(f.lens, { visible: false }),
      'candidate.json'
    );
    click('Inspect candidate');
    await vi.waitFor(() => expect(f.lens.getMode()).toBe('offline'));
    expect(f.lens.isAttached()).toBe(false);
    expect(f.lens.getNode('main:object3d:cube')).toMatchObject({
      visible: false,
    });
  });

  it('summarizes an added entity once so identity bookkeeping cannot hide the investigation sections', async () => {
    const f = fixture();
    await f.controller.loadTrace('baseline', await traceBlob(f.lens));
    await f.controller.loadTrace(
      'candidate',
      await traceBlob(f.lens, { memory: 1024 })
    );
    const added = document.querySelectorAll(
      'tr[data-entity-id="main:geometry:box"]'
    );
    expect(added).toHaveLength(1);
    expect(added[0].textContent).toContain('Added in candidate');
    expect(document.querySelector('.tlp-trace-table-scroll')).toBeTruthy();
    expect(document.querySelector('.tlp-trace-path')).toBeTruthy();
    expect(document.querySelector('.tlp-trace-bookmarks')).toBeTruthy();
  });
});
