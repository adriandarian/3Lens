import { describe, expect, it } from 'vitest';
import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  type WebGLRenderer,
} from 'three';
import { createLens } from '@3lens/runtime';
import { manualHost } from '@3lens/host-manual';
import { type PlatformSnapshot, type Node } from '@3lens/kernel';

function fixture(shaders = false, maxEvents?: number) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  const geometry = new BoxGeometry();
  const material = new MeshStandardMaterial();
  const mesh = new Mesh(geometry, material);
  mesh.name = 'MainCube';
  scene.add(mesh);
  const program = {
    id: 7,
    vertexShader: { stage: 'vertex' },
    fragmentShader: { stage: 'fragment' },
    cacheKey: 'observed-7',
  };
  const renderer = {
    render: () => {
      renderer.info.render.frame++;
    },
    info: { autoReset: true, render: { frame: 0, calls: 1, triangles: 12 } },
    capabilities: { isWebGL2: true },
    domElement: {
      width: 800,
      height: 800,
      getBoundingClientRect: () => ({ x: 20, y: 30, width: 800, height: 800 }),
    },
    getPixelRatio: () => 1,
    ...(shaders
      ? {
          properties: {
            get: () => ({
              currentProgram: program,
              programs: new Map([['observed', program]]),
            }),
          },
          getContext: () => ({
            getShaderSource: (shader: { stage: string }) =>
              shader.stage === 'vertex'
                ? `#define varying in\n#define texture2D texture\n#define USE_MAP\n#define STANDARD\n#define NUM_DIR_LIGHTS 2\n#define USE_OVERLONG ${'x'.repeat(200)}\nvoid main() { gl_Position=vec4(0.0); }`
                : 'void main() { gl_FragColor=vec4(1.0); }',
          }),
        }
      : {}),
  } as unknown as WebGLRenderer;
  let focused = false;
  const host = manualHost({
    renderer,
    scene,
    camera,
    onFocus: () => {
      focused = true;
    },
  });
  const lens = createLens({
    enabled: true,
    recording: maxEvents ? { maxEvents } : undefined,
  });
  lens.registerContext({ id: 'main', host });
  lens.attach();
  const snapshot = () =>
    lens.query<{ data: PlatformSnapshot }>('platform_snapshot', {
      context_id: 'main',
    })!.data;
  const dispose = () => {
    lens.dispose();
    geometry.dispose();
    material.dispose();
  };
  return {
    lens,
    host,
    scene,
    camera,
    geometry,
    material,
    mesh,
    renderer,
    snapshot,
    dispose,
    focused: () => focused,
  };
}

describe('Full platform shared capture primitives', () => {
  it('projects real renderer counters and CPU submit timing identically live and offline', async () => {
    const f = fixture(),
      offline = createLens({ enabled: true });
    try {
      f.renderer.render(f.scene, f.camera);
      f.renderer.render(f.scene, f.camera);
      const live = f.snapshot();
      expect(live.frames).toHaveLength(2);
      expect(live.frames[0]).toMatchObject({
        frame: 0,
        context_id: 'main',
        draw_calls: 1,
        triangles: 12,
        cpu_fidelity: 'EXACT',
        fidelity: 'ESTIMATED',
      });
      expect(live.frames[0].cpu_ms).toBeGreaterThanOrEqual(0);
      expect(live.passes).toHaveLength(0);
      expect(live.reasons.join(' ')).toContain(
        'Pass segmentation is unavailable'
      );
      await offline.loadTrace(await f.lens.exportTrace());
      const saved = offline.query<{ data: PlatformSnapshot }>(
        'platform_snapshot',
        { context_id: 'main' }
      )!.data;
      expect(saved.frames).toEqual(live.frames);
      expect(
        saved.resources.map((r) => ({
          id: r.entity_id,
          state: r.state,
          users: r.users,
        }))
      ).toEqual(
        live.resources.map((r) => ({
          id: r.entity_id,
          state: r.state,
          users: r.users,
        }))
      );
      expect(offline.pick(0.5, 0.5)).toBeNull();
      expect(offline.focus()).toBe(false);
    } finally {
      f.dispose();
      offline.dispose();
    }
  });

  it('selects recorded entity state at a frame and preserves the frame cursor in a saved trace', async () => {
    const f = fixture(),
      offline = createLens({ enabled: true });
    try {
      f.renderer.render(f.scene, f.camera);
      f.mesh.visible = false;
      f.renderer.render(f.scene, f.camera);
      const id = `main:object3d:${f.mesh.uuid}`;
      expect(f.lens.getNode(id)).toMatchObject({ visible: false });
      f.lens.select(id);
      expect(f.lens.setFrame(0, 'main')).toBe(true);
      expect(f.lens.getNode(id)).toMatchObject({ visible: true });
      expect(f.lens.focus(id)).toBe(false);
      await offline.loadTrace(await f.lens.exportTrace());
      expect(offline.getSelectedFrame()).toBe(0);
      expect(offline.getNode(id)).toMatchObject({ visible: true });
      f.lens.setFrame(null);
      expect(f.lens.getNode(id)).toMatchObject({ visible: false });
    } finally {
      f.dispose();
      offline.dispose();
    }
  });

  it('picks actual scene geometry with normalized coordinates and exposes bounds without adding scene objects', () => {
    const f = fixture();
    try {
      const count = f.scene.children.length;
      const id = f.lens.pick(0.5, 0.5);
      expect(id).toBe(`main:object3d:${f.mesh.uuid}`);
      expect(f.lens.getSelection().entity_ids).toEqual([id]);
      expect(f.lens.getViewportBounds()).toEqual({
        x: 20,
        y: 30,
        width: 800,
        height: 800,
      });
      const bounds = f.lens.getSelectionBounds()!;
      expect(bounds.width).toBeGreaterThan(0);
      expect(bounds.width).toBeLessThan(1);
      expect(f.lens.focus()).toBe(true);
      expect(f.focused()).toBe(true);
      expect(f.scene.children).toHaveLength(count);
      f.mesh.visible = false;
      expect(f.lens.pick(0.5, 0.5)).toBeNull();
    } finally {
      f.dispose();
    }
  });

  it('captures only actual compiled shader program source and labels compile timing unavailable', async () => {
    const f = fixture(true),
      offline = createLens({ enabled: true });
    try {
      const shaders = f.snapshot().shaders;
      expect(shaders.length).toBeGreaterThan(0);
      const variant = shaders.find((shader) =>
        shader.entity_id.includes('shader_variant')
      )!;
      expect(variant).toMatchObject({
        fidelity: 'EXACT',
        compile_ms: null,
        compile_fidelity: 'UNAVAILABLE',
      });
      expect(variant.vertex_source).toContain('USE_MAP');
      expect(variant.material_ids).toEqual([
        `main:material:${f.material.uuid}`,
      ]);
      expect(variant.defines).toEqual({
        USE_MAP: true,
        STANDARD: true,
        NUM_DIR_LIGHTS: '2',
      });
      expect(variant.reason).toContain('inspect full source');
      expect(variant.vertex_source).toContain('USE_OVERLONG');
      const shader = shaders.find((shader) =>
        shader.entity_id.includes(':shader:')
      )!;
      expect(shader.material_ids).toEqual([`main:material:${f.material.uuid}`]);
      expect(shader.defines).toEqual(variant.defines);
      await offline.loadTrace(await f.lens.exportTrace());
      expect(
        offline.query<{ data: PlatformSnapshot }>('platform_snapshot')!.data
          .shaders
      ).toEqual(shaders);
    } finally {
      f.dispose();
      offline.dispose();
    }
  });

  it('records explicit markers and mode changes, and preserves passed baseline diff semantics', () => {
    const f = fixture();
    try {
      const before = f.lens.getGraph().snapshot();
      f.lens.setCaptureMode('DEEP');
      expect(f.lens.getOverheadMetrics().currentMode).toBe('DEEP');
      expect(f.lens.addMarker('After resize')).toBe(true);
      const marker = f
        .snapshot()
        .events.find(
          (event) =>
            event.type === 'context_update' &&
            event.changes.metadata?.marker === 'After resize'
        );
      expect(marker).toBeTruthy();
      f.mesh.visible = false;
      f.renderer.render(f.scene, f.camera);
      const result = f.lens.query<{
        data: { entity_id: string; changes: string[] }[];
      }>('platform_diff', { baseline: before })!;
      expect(result.data).toContainEqual(
        expect.objectContaining({
          entity_id: `main:object3d:${f.mesh.uuid}`,
          changes: expect.arrayContaining(['visible']),
        })
      );
    } finally {
      f.dispose();
    }
  });

  it('retains explicit pipeline descriptors across scene scans and resource history without inventing disposal', async () => {
    const f = fixture(),
      offline = createLens({ enabled: true });
    try {
      f.lens.registerPipeline('main', {
        id: 'composer',
        displayName: 'Post stack',
        passes: [
          { id: 'main', name: 'Main pass', tags: ['main'] },
          { id: 'bloom', name: 'Bloom pass', tags: ['post'] },
        ],
        edges: [['main', 'bloom']],
      });
      f.renderer.render(f.scene, f.camera);
      f.material.roughness = 0.2;
      f.renderer.render(f.scene, f.camera);
      const passes = f.snapshot().passes;
      expect(passes.map((pass) => pass.name)).toEqual([
        'Main pass',
        'Bloom pass',
      ]);
      expect(
        passes.every(
          (pass) => pass.cpu_ms === null && pass.cpu_fidelity === 'UNAVAILABLE'
        )
      ).toBe(true);
      f.scene.remove(f.mesh);
      f.renderer.render(f.scene, f.camera);
      const resource = f
        .snapshot()
        .resources.find(
          (resource) =>
            resource.entity_id === `main:geometry:${f.geometry.uuid}`
        )!;
      expect(resource.state).toBe('unreferenced');
      expect(resource.disposed_at).toBeNull();
      await offline.loadTrace(await f.lens.exportTrace());
      expect(
        offline.query<{ data: PlatformSnapshot }>('platform_snapshot')!.data
          .passes
      ).toEqual(f.snapshot().passes);
    } finally {
      f.dispose();
      offline.dispose();
    }
  });

  it('keeps retained frame state reconstructible after old capture snapshots leave the bounded event window', async () => {
    const f = fixture(false, 12),
      offline = createLens({ enabled: true });
    try {
      f.renderer.render(f.scene, f.camera);
      f.mesh.visible = false;
      f.renderer.render(f.scene, f.camera);
      for (let i = 0; i < 12; i++) f.renderer.render(f.scene, f.camera);
      const events = f.snapshot().events;
      expect(events.every((event) => event.type !== 'context_update')).toBe(
        true
      );
      expect(f.snapshot().dropped_events).toBeGreaterThan(0);
      const retainedFrame = f.snapshot().frames.at(-2)!.frame;
      expect(f.lens.setFrame(retainedFrame, 'main')).toBe(true);
      const id = `main:object3d:${f.mesh.uuid}`;
      expect(f.lens.getNode(id)).toMatchObject({ visible: false });
      await offline.loadTrace(await f.lens.exportTrace());
      expect(offline.getSelectedFrame()).toBe(retainedFrame);
      expect(offline.getNode(id)).toMatchObject({ visible: false });
    } finally {
      f.dispose();
      offline.dispose();
    }
  });
});
