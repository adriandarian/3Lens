import { describe, expect, it } from 'vitest';
import { BoxGeometry, Mesh, MeshStandardMaterial, PerspectiveCamera, Scene, type WebGLRenderer } from 'three';
import { createLens } from '@3lens/runtime';
import { manualHost } from '@3lens/host-manual';
import { createEntityGraph, applyCaptureEvent, type Trace, type Node } from '@3lens/kernel';

describe('Complete devtools investigation', () => {
  it('preserves real host relationships, selection, and baseline changes in a detached offline trace', async () => {
    const scene = new Scene();
    const camera = new PerspectiveCamera();
    const geometry = new BoxGeometry();
    const material = new MeshStandardMaterial();
    const cube = new Mesh(geometry, material);
    cube.name = 'MainCube';
    const shared = new Mesh(geometry, material);
    scene.add(cube, shared);
    const originalRender = () => { renderer.info.render.frame++; };
    const renderer = {
      render: originalRender,
      info: { autoReset: true, render: { frame: 0, calls: 2, triangles: 24 } },
      domElement: { width: 800, height: 600 }, capabilities: { isWebGL2: true },
      getPixelRatio: () => 1,
    } as unknown as WebGLRenderer;
    const lens = createLens({ enabled: true });
    const offline = createLens({ enabled: true });
    try {
      lens.registerContext({ id: 'main', host: manualHost({ renderer, scene, camera }) });
      lens.attach();
      renderer.render(scene, camera);
      const id = `main:object3d:${cube.uuid}`;
      lens.select(id);
      lens.captureBaseline();
      cube.visible = false;
      material.roughness = 0.25;
      renderer.render(scene, camera);
      const resources = lens.query<{ data: Node[] }>('resources_used_by', { entity_id: id })!.data;
      expect(resources.map(node => node.type)).toEqual(expect.arrayContaining(['geometry', 'material']));
      const geometryId = `main:geometry:${geometry.uuid}`;
      const cost = lens.query<{ data: { primary_entities: { entity_id: string; weight: number }[] }; fidelity: string }>('resource_cost', { entity_id: geometryId })!;
      expect(cost.fidelity).toBe('ESTIMATED');
      expect(cost.data.primary_entities).toHaveLength(2);
      expect(cost.data.primary_entities.map(entity => entity.weight)).toEqual([0.5, 0.5]);
      const changes = lens.query<{ data: { entity_id: string; changes: string[] }[] }>('entity_changes')!.data;
      expect(changes).toContainEqual(expect.objectContaining({ entity_id: id, changes: expect.arrayContaining(['visible']) }));
      const saved = await lens.exportTrace();
      const trace = JSON.parse(await saved.text()) as Trace;
      // Events themselves must reconstruct the model, independently of exported checkpoints.
      const projected = createEntityGraph();
      for (const chunk of trace.events) for (const event of chunk.events) applyCaptureEvent(projected, event);
      expect(projected.getNode(id)).toMatchObject({ visible: false });
      expect(projected.getOutgoingEdges(id)).toEqual(lens.getGraph().getOutgoingEdges(id));
      const liveSnapshot = lens.getGraph().snapshot();
      lens.detach();
      expect(renderer.render).toBe(originalRender);
      await offline.loadTrace(saved);
      expect(offline.getMode()).toBe('offline');
      expect(offline.isAttached()).toBe(false);
      expect(offline.getActiveContext()?.host.getRenderer()).toBeNull();
      expect(offline.getSelection().entity_ids).toEqual([id]);
      expect(offline.getGraph().snapshot().nodes).toEqual(liveSnapshot.nodes);
      expect(offline.getGraph().snapshot().edges).toEqual(liveSnapshot.edges);
      expect(offline.query<{ data: unknown[] }>('entity_changes')!.data).toEqual(changes);
      const offlineResources = offline.query<{ data: Node[] }>('resources_used_by', { entity_id: id })!.data;
      expect(offlineResources).toEqual(resources);
      expect(offline.query<{ data: unknown }>('resource_cost', { entity_id: geometryId })!.data).toEqual(cost.data);
      cube.visible = true;
      renderer.render(scene, camera);
      expect(offline.getNode(id)).toMatchObject({ visible: false });
    } finally {
      lens.dispose();
      offline.dispose();
      geometry.dispose();
      material.dispose();
    }
  });
});
