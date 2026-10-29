import { describe, it, expect, vi } from 'vitest';
import { createLens, type LensUIAdapter } from '../../packages/core/runtime/src/lens';
import { createEntityGraph, createTraceManager, createTraceReplayer, type CaptureContext,
  type GraphSnapshot, type Node, type Trace } from '../../packages/core/kernel/src';
import type { Host } from '../../packages/core/runtime/src/host';

function fixture(id = 'main') {
  let capture: CaptureContext | null = null;
  const node = (suffix: string, type: string, extra = {}) => ({
    id: `${id}:${type}:${suffix}`, type, context_id: id, name: suffix,
    created_at: 0, modified_at: 0, active: true, origin: 'preexisting', ...extra,
  }) as Node;
  let nodes = [node('Renderer', 'renderer', {backend:'webgl2'}), node('Scene','scene'),
    node('Camera','camera'), node('MainCube','object3d', {object_type:'Mesh',visible:true}),
    node('CubeGeometry','geometry', {memory_bytes:256,memory_fidelity:'ESTIMATED'}),
    node('CubeMaterial','material', {opacity:1})];
  const snapshot = () => ({version:'1.0.0',timestamp:0,context_ids:[id],nodes,
    edges: [{from:`${id}:object3d:MainCube`,to:`${id}:geometry:CubeGeometry`,type:'uses',usage:'geometry',created_at:0,active:true},
      {from:`${id}:object3d:MainCube`,to:`${id}:material:CubeMaterial`,type:'uses',usage:'material',created_at:0,active:true}],
  }) as GraphSnapshot;
  function publish() {
    capture?.emit({type:'context_update',timestamp:performance.now(),changes:{metadata:{graph_snapshot:snapshot()}}});
  }
  const host: Host = {
    id, name:'Fixture',
    attach(context) {
      capture=context;
      capture.emit({type:'context_register',timestamp:performance.now(),display_name:id,
        renderer_id:`${id}:renderer:Renderer`,scene_id:`${id}:scene:Scene`,camera_id:`${id}:camera:Camera`,
        backend:'webgl2',discovery:'manual',discovery_fidelity:'EXACT'});
      publish();
    },
    detach() {
      capture?.emit({type:'context_unregister',timestamp:performance.now(),reason:'detach'});
      capture=null;
    },
    getRenderer:()=>null,getScene:()=>null,getCamera:()=>null,isAttached:()=>capture!==null,
  };
  return {host, publish, change() {nodes=nodes.map(n => n.name==='MainCube' ? {...n,visible:false} as Node:n);publish();}};
}

describe('Devtools runtime investigation contracts', () => {
  it('captures namespaced entities, relationships and selection identically offline', async () => {
    const first=fixture();
    const second=fixture('minimap');
    const live=createLens({enabled:true});
    live.registerContext({id:'main',host:first.host});
    live.registerContext({id:'minimap',host:second.host});
    live.attach();
    const cube='main:object3d:MainCube';
    expect(live.getGraph().nodeCount()).toBe(12);
    expect(live.query<any>('resources_used_by',{entity_id:cube}).data.map((n:Node)=>n.type)).toEqual(['geometry','material']);
    live.select(cube);
    live.captureBaseline();
    first.change();
    const changes=live.query<any>('entity_changes',{entity_id:cube});
    expect(changes.fidelity).toBe('EXACT');
    expect(changes.data[0].changes).toContain('visible');
    const blob=await live.exportTrace();
    const expected=structuredClone(live.getGraph().snapshot());
    const offline=createLens({enabled:true});
    await offline.loadTrace(blob);
    expect(offline.getMode()).toBe('offline');
    expect(offline.isAttached()).toBe(false);
    expect(offline.getGraph().snapshot().nodes).toEqual(expected.nodes);
    expect(offline.getGraph().snapshot().edges).toEqual(expected.edges);
    expect(offline.getSelection().entity_ids).toEqual([cube]);
    expect(offline.query<any>('entity_changes',{entity_id:cube}).data).toEqual(changes.data);
    expect(offline.getNode('main:geometry:CubeGeometry')).toMatchObject({memory_fidelity:'ESTIMATED'});
    expect(offline.getCapabilityStatus('timing.gpu')).toMatchObject({available:false,fidelity:'UNAVAILABLE'});
    // Serialized data never retains a reference to the live scene's mutable nodes.
    first.change();
    expect(offline.getGraph().snapshot().nodes).toEqual(expected.nodes);
    live.dispose();offline.dispose();
  });

  it('starts replay at the initial graph and applies events after an imported checkpoint', async () => {
    const item=fixture();const live=createLens({enabled:true});
    live.registerContext({id:'main',host:item.host});live.attach();
    live.captureBaseline();
    const baselineBlob=await live.exportTrace();
    const trace=JSON.parse(await baselineBlob.text()) as Trace;
    expect(trace.snapshots[0].is_initial).toBe(true);
    expect(trace.snapshots[0].graph.nodes).toHaveLength(0);
    expect(trace.snapshots.at(-1)?.is_initial).toBe(false);
    const replayer=createTraceReplayer(trace);
    expect(replayer.getState().graph.nodeCount()).toBe(0);
    while(replayer.stepForward()) { /* replay the recorded capture */ }
    expect(replayer.getState().graph.getNode('main:object3d:MainCube')).toMatchObject({visible:true});
    replayer.seekToEvent(0);
    expect(replayer.getState().graph.nodeCount()).toBe(0);
    // External recordings can end after their last checkpoint. Those tail events
    // must be projected rather than silently ignored by loadTrace.
    item.change();
    const changed=JSON.parse(await (await live.exportTrace()).text()) as Trace;
    changed.snapshots=trace.snapshots;
    const offline=createLens({enabled:true});
    await offline.loadTrace(new Blob([JSON.stringify(changed)]));
    expect(offline.getNode('main:object3d:MainCube')).toMatchObject({visible:false});
    live.dispose();offline.dispose();
  });

  it('detaches hosts before switching to offline data, validates before mutating live state', async () => {
    const item=fixture();
    const lens=createLens({enabled:true});
    lens.registerContext({id:'main',host:item.host});lens.attach();
    await expect(lens.loadTrace(new Blob(['{"header":{"version":"99.0.0"},"events":[],"snapshots":[]}']))).rejects.toThrow();
    expect(lens.isAttached()).toBe(true);expect(item.host.isAttached()).toBe(true);
    const blob=await lens.exportTrace();
    await lens.loadTrace(blob);
    expect(item.host.isAttached()).toBe(false);
    lens.attach();expect(lens.isAttached()).toBe(false);
    expect(()=>lens.registerContext({id:'another',host:fixture().host})).toThrow(/offline/);
    lens.dispose();
  });

  it('keeps capture sequences increasing across detach and reattach without duplicate listeners', () => {
    const item=fixture();const lens=createLens({enabled:true});
    const seqs:number[]=[];lens.onEvent(e=>seqs.push(e.seq));
    lens.registerContext({id:'main',host:item.host});
    lens.attach();lens.attach();lens.detach();lens.detach();lens.attach();
    expect(seqs).toEqual([...new Set(seqs)].sort((a,b)=>a-b));
    expect(seqs).toHaveLength(5);
    lens.dispose();
  });

  it('delegates UI mounting without runtime importing UI, toggles idempotently and cleans up', () => {
    const adapter:LensUIAdapter={show:vi.fn(),hide:vi.fn(),dispose:vi.fn()};
    const lens=createLens({enabled:true,ui:'overlay',uiAdapter:adapter});
    lens.showUI();lens.toggleUI();lens.toggleUI();lens.dispose();lens.dispose();lens.showUI();
    expect(adapter.show).toHaveBeenCalledTimes(2);
    expect(adapter.hide).toHaveBeenCalledTimes(1);
    expect(adapter.dispose).toHaveBeenCalledTimes(1);
  });

  it('attributes shared resource storage through actual weighted usage edges in live and offline queries', async () => {
    const item=fixture();const lens=createLens({enabled:true});
    lens.registerContext({id:'main',host:item.host});lens.attach();
    const cost=lens.query<any>('resource_cost',{entity_id:'main:geometry:CubeGeometry'});
    expect(cost.fidelity).toBe('ESTIMATED');
    expect(cost.data.bytes).toBe(256);
    expect(cost.data.primary_entities).toEqual([{entity_id:'main:object3d:MainCube',weight:1,contribution:256}]);
    expect(cost.data.chain[0]).toMatchObject({from_entity:'main:object3d:MainCube',to_entity:'main:geometry:CubeGeometry',weight:1});
    const offline=createLens({enabled:true});await offline.loadTrace(await lens.exportTrace());
    expect(offline.query<any>('resource_cost',{entity_id:'main:geometry:CubeGeometry'}).data).toEqual(cost.data);
    const malformed=JSON.parse(await (await lens.exportTrace()).text()) as Trace;
    malformed.snapshots.at(-1)!.graph.nodes[0].id='unscoped';
    await expect(lens.loadTrace(new Blob([JSON.stringify(malformed)]))).rejects.toThrow(/entity/);
    expect(lens.isAttached()).toBe(true);
    lens.dispose();offline.dispose();
  });

  it('bounds a prolonged recording and declares lost history in its trace', () => {
    const manager=createTraceManager({sessionId:'bounded',captureMode:'STANDARD',chunkSize:2,snapshotInterval:1,
      maxEvents:3,maxBytes:100000,environment:{three_version:'test',three_tier:'UNKNOWN',backend:'webgl2',
        is_worker:false,csp_restrictions:[],capabilities:{}}});
    manager.startRecording();
    for(let seq=0;seq<20;seq++) manager.addEvent({type:'render_event',context_id:'main',seq,timestamp:seq,frame:seq,
      scene_id:'main:scene:s',camera_id:'main:camera:c'});
    const trace=manager.export();
    expect(trace.events.flatMap(c=>c.events).length).toBeLessThanOrEqual(3);
    expect(trace.header.dropped_events).toBeGreaterThan(0);
    expect(manager.getStats().droppedEvents).toBeGreaterThan(0);
  });
});
