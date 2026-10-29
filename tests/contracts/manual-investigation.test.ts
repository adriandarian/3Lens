import { describe, expect, it, vi } from 'vitest';
import { BoxGeometry, Mesh, MeshStandardMaterial, PerspectiveCamera, Scene, Texture, type WebGLRenderer } from 'three';
import { createCaptureContext, type Event, type Node, type Edge } from '@3lens/kernel';
import { manualHost } from '@3lens/host-manual';

type ObservedSnapshot = { nodes: (Node & Record<string, unknown>)[]; edges: Edge[] };

function fixture(mode: 'STANDARD' | 'DEEP' | 'MINIMAL' = 'STANDARD') {
  const scene = new Scene();
  const camera = new PerspectiveCamera(60, 1, 0.1, 100);
  const geometry = new BoxGeometry();
  const material = new MeshStandardMaterial({ roughness: 0.5 });
  const mesh = new Mesh(geometry, material);
  mesh.name = 'MainCube';
  const other = new Mesh(geometry, material);
  other.name = 'SharedCube';
  scene.add(mesh, other);
  const originalRender = vi.fn(function () { renderer.info.render.frame++; });
  const renderer = {
    render: originalRender,
    info: { autoReset: true, render: { frame: 1, calls: 2, triangles: 24 }, memory: { geometries: 1, textures: 0 } },
    domElement: { width: 800, height: 600 }, capabilities: { isWebGL2: true },
    getPixelRatio: () => 1, getContextAttributes: () => ({ antialias: true }),
  } as unknown as WebGLRenderer;
  const context = createCaptureContext({ id: 'main', mode, bufferSizeBytes: 1024 * 1024, autoDegrade: false, overheadBudgetMs: 10 });
  const events: Event[] = [];
  context.subscribe((event) => events.push(event));
  context.start();
  const host = manualHost({ renderer, scene, camera });
  const snapshots = () => events.filter((event) => event.type === 'context_update').map((event) => (event.changes.metadata?.graph_snapshot as ObservedSnapshot));
  return { scene, camera, mesh, other, geometry, material, renderer, context, events, host, originalRender, snapshots };
}

describe('Manual host investigation contract', () => {
  it('captures authoritative renders and stable serializable relationships for shared resources', () => {
    const f = fixture();
    f.host.attach(f.context);
    expect(f.events[0].type).toBe('context_register');
    expect(f.events.some((event) => event.type === 'attach_point')).toBe(true);
    f.renderer.render(f.scene, f.camera);
    f.renderer.render(f.scene, f.camera);
    expect(f.originalRender).toHaveBeenCalledTimes(2);
    expect(f.events.filter((event) => event.type === 'render_event')).toHaveLength(2);
    const begin = f.events.find((event) => event.type === 'frame_begin');
    expect(begin).toMatchObject({ fidelity: 'ESTIMATED' });
    expect(f.snapshots()).toHaveLength(1);
    const snapshot = f.snapshots()[0];
    const cube = snapshot.nodes.find((node) => node.name === 'MainCube')!;
    expect(cube.id).toBe(`main:object3d:${f.mesh.uuid}`);
    const geometries = snapshot.nodes.filter((node) => node.type === 'geometry');
    expect(geometries).toHaveLength(1);
    expect(geometries[0]).toMatchObject({ ownership: 'external', memory_fidelity: 'ESTIMATED' });
    expect(snapshot.edges.filter((edge) => edge.type === 'uses' && edge.to === geometries[0].id)).toHaveLength(2);
    expect(snapshot.edges).toContainEqual(expect.objectContaining({ from: cube.id, to: `main:material:${f.material.uuid}`, type: 'uses' }));
    expect(snapshot.edges).toContainEqual(expect.objectContaining({ from: `main:scene:${f.scene.uuid}`, to: cube.id, type: 'contains' }));
    expect(JSON.parse(JSON.stringify(snapshot))).toEqual(snapshot);
    expect(f.events.every((event, index) => event.seq === index && event.context_id === 'main')).toBe(true);
    f.host.detach();
  });

  it('records observable changes while preserving creation identity, and observes explicit disposal', () => {
    const f = fixture();
    f.host.attach(f.context);
    const initial = f.snapshots()[0].nodes.find((node) => node.name === 'MainCube')!;
    f.mesh.visible = false;
    f.material.roughness = 0.9;
    f.renderer.render(f.scene, f.camera);
    const changed = f.snapshots().at(-1)!;
    expect(changed.nodes.find((node) => node.id === initial.id)).toMatchObject({ visible: false, created_at: initial.created_at });
    expect(changed.nodes.find((node) => node.type === 'material')).toMatchObject({ roughness: 0.9 });
    expect(changed.nodes.find((node) => node.id === initial.id)!.modified_at).toBeGreaterThan(initial.modified_at);
    f.geometry.dispose();
    expect(f.events).toContainEqual(expect.objectContaining({ type: 'resource_dispose', entity_id: `main:geometry:${f.geometry.uuid}`, reason: 'explicit' }));
    expect(f.snapshots().at(-1)!.nodes.find((node) => node.type === 'geometry')).toMatchObject({ active: false });
    f.host.detach();
    const eventCount = f.events.length;
    f.geometry.dispose();
    expect(f.events).toHaveLength(eventCount);
  });

  it('restores the exact render function and avoids duplicate wrappers across detach and reattach', () => {
    const f = fixture();
    f.host.attach(f.context);
    const wrapper = f.renderer.render;
    f.host.attach(f.context);
    expect(f.renderer.render).toBe(wrapper);
    f.host.detach();
    expect(f.renderer.render).toBe(f.originalRender);
    expect(f.host.isAttached()).toBe(false);
    f.host.attach(f.context);
    f.renderer.render(f.scene, f.camera);
    expect(f.originalRender).toHaveBeenCalledTimes(1);
    expect(f.events.filter((event) => event.type === 'render_event')).toHaveLength(1);
    f.host.detach();
  });

  it('preserves later application wrappers and leaves their retained capture wrapper inert', () => {
    const f = fixture();
    f.host.attach(f.context);
    const captureWrapper = f.renderer.render;
    const applicationWrapper = vi.fn(function (this: WebGLRenderer, scene: Scene, camera: PerspectiveCamera) {
      captureWrapper.call(this, scene, camera);
    });
    f.renderer.render = applicationWrapper;
    f.host.detach();
    expect(f.renderer.render).toBe(applicationWrapper);
    const count = f.events.length;
    f.renderer.render(f.scene, f.camera);
    expect(f.events).toHaveLength(count);
    f.host.attach(f.context);
    f.renderer.render(f.scene, f.camera);
    expect(f.events.filter((event) => event.type === 'render_event')).toHaveLength(1);
    f.host.detach();
  });

  it('captures texture use without claiming unavailable GPU allocation sizes', () => {
    const f = fixture();
    const texture = new Texture();
    f.material.map = texture;
    f.host.attach(f.context);
    const snapshot = f.snapshots()[0];
    expect(snapshot.nodes.find((node) => node.type === 'texture')).toMatchObject({ memory_fidelity: 'UNAVAILABLE' });
    expect(snapshot.edges).toContainEqual(expect.objectContaining({ from: `main:material:${f.material.uuid}`, to: `main:texture:${texture.uuid}`, type: 'uses', slot: 'map' }));
    f.host.detach();
  });
});
