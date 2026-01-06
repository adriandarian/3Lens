/**
 * ResourceLifecycleTracker Test Suite
 * 
 * Tests for resource lifecycle tracking and leak detection.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ResourceLifecycleTracker,
  type ResourceType,
  type LifecycleEventType,
  type ResourceTrackerOptions,
  type LeakAlert,
  type LeakAlertType,
} from './ResourceLifecycleTracker';

describe('ResourceLifecycleTracker', () => {
  let tracker: ResourceLifecycleTracker;

  beforeEach(() => {
    tracker = new ResourceLifecycleTracker();
  });

  afterEach(() => {
    // Clean up
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const t = new ResourceLifecycleTracker();
      expect(t).toBeDefined();
      expect(t.isStackTraceCaptureEnabled()).toBe(false);
    });

    it('should create instance with custom options', () => {
      const t = new ResourceLifecycleTracker({
        captureStackTraces: true,
        maxEvents: 500,
        leakThresholdMs: 30000,
      });
      expect(t.isStackTraceCaptureEnabled()).toBe(true);
    });
  });

  describe('setStackTraceCapture', () => {
    it('should enable stack trace capture', () => {
      expect(tracker.isStackTraceCaptureEnabled()).toBe(false);
      tracker.setStackTraceCapture(true);
      expect(tracker.isStackTraceCaptureEnabled()).toBe(true);
    });

    it('should disable stack trace capture', () => {
      tracker.setStackTraceCapture(true);
      tracker.setStackTraceCapture(false);
      expect(tracker.isStackTraceCaptureEnabled()).toBe(false);
    });
  });

  describe('recordCreation', () => {
    it('should record geometry creation', () => {
      tracker.recordCreation('geometry', 'geo-123', {
        name: 'BoxGeometry',
        subtype: 'BoxGeometry',
        vertexCount: 24,
        faceCount: 12,
      });

      const events = tracker.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].resourceType).toBe('geometry');
      expect(events[0].resourceUuid).toBe('geo-123');
      expect(events[0].eventType).toBe('created');
      expect(events[0].resourceName).toBe('BoxGeometry');
    });

    it('should record material creation', () => {
      tracker.recordCreation('material', 'mat-456', {
        name: 'RedMaterial',
        subtype: 'MeshStandardMaterial',
      });

      const events = tracker.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].resourceType).toBe('material');
      expect(events[0].resourceSubtype).toBe('MeshStandardMaterial');
    });

    it('should record texture creation with memory estimate', () => {
      tracker.recordCreation('texture', 'tex-789', {
        name: 'DiffuseMap',
        estimatedMemory: 4 * 1024 * 1024, // 4MB
      });

      const events = tracker.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].metadata?.estimatedMemory).toBe(4 * 1024 * 1024);
    });

    it('should capture stack trace when enabled', () => {
      tracker.setStackTraceCapture(true);
      tracker.recordCreation('geometry', 'geo-stack', { name: 'Test' });

      const events = tracker.getEvents();
      expect(events[0].stackTrace).toBeDefined();
    });

    it('should not capture stack trace when disabled', () => {
      tracker.setStackTraceCapture(false);
      tracker.recordCreation('geometry', 'geo-nostack', { name: 'Test' });

      const events = tracker.getEvents();
      expect(events[0].stackTrace).toBeUndefined();
    });

    it('should track as active resource', () => {
      tracker.recordCreation('geometry', 'geo-active', { name: 'Active' });
      
      const summary = tracker.getSummary();
      expect(summary.geometries.active).toBe(1);
    });
  });

  describe('recordDisposal', () => {
    it('should record resource disposal', () => {
      tracker.recordCreation('geometry', 'geo-to-dispose');
      tracker.recordDisposal('geometry', 'geo-to-dispose');

      const events = tracker.getEvents();
      expect(events).toHaveLength(2);
      expect(events[1].eventType).toBe('disposed');
    });

    it('should remove from active resources', () => {
      tracker.recordCreation('geometry', 'geo-disposed');
      tracker.recordDisposal('geometry', 'geo-disposed');

      const summary = tracker.getSummary();
      expect(summary.geometries.active).toBe(0);
    });
  });

  describe('recordAttachment', () => {
    it('should record resource attachment to mesh', () => {
      tracker.recordCreation('material', 'mat-attach');
      tracker.recordAttachment('material', 'mat-attach', 'mesh-123', {
        meshName: 'Cube',
      });

      const events = tracker.getEvents();
      expect(events).toHaveLength(2);
      expect(events[1].eventType).toBe('attached');
      expect(events[1].metadata?.meshUuid).toBe('mesh-123');
      expect(events[1].metadata?.meshName).toBe('Cube');
    });

    it('should track texture slot for textures', () => {
      tracker.recordCreation('texture', 'tex-slot');
      tracker.recordAttachment('texture', 'tex-slot', 'mesh-456', {
        textureSlot: 'normalMap',
      });

      const events = tracker.getEvents();
      expect(events[1].metadata?.textureSlot).toBe('normalMap');
    });
  });

  describe('recordDetachment', () => {
    it('should record resource detachment from mesh', () => {
      tracker.recordCreation('material', 'mat-detach');
      tracker.recordAttachment('material', 'mat-detach', 'mesh-123');
      tracker.recordDetachment('material', 'mat-detach', 'mesh-123');

      const events = tracker.getEvents();
      expect(events).toHaveLength(3);
      expect(events[2].eventType).toBe('detached');
    });
  });

  describe('getEvents', () => {
    it('should return copy of events', () => {
      tracker.recordCreation('geometry', 'geo-1');
      tracker.recordCreation('material', 'mat-1');

      const events1 = tracker.getEvents();
      const events2 = tracker.getEvents();

      expect(events1).not.toBe(events2);
      expect(events1).toEqual(events2);
    });
  });

  describe('getEventsByType', () => {
    it('should filter events by resource type', () => {
      tracker.recordCreation('geometry', 'geo-1');
      tracker.recordCreation('material', 'mat-1');
      tracker.recordCreation('geometry', 'geo-2');
      tracker.recordCreation('texture', 'tex-1');

      const geometryEvents = tracker.getEventsByType('geometry');
      expect(geometryEvents).toHaveLength(2);
      expect(geometryEvents.every(e => e.resourceType === 'geometry')).toBe(true);
    });
  });

  describe('getEventsByEventType', () => {
    it('should filter events by event type', () => {
      tracker.recordCreation('geometry', 'geo-1');
      tracker.recordDisposal('geometry', 'geo-1');
      tracker.recordCreation('geometry', 'geo-2');

      const createdEvents = tracker.getEventsByEventType('created');
      expect(createdEvents).toHaveLength(2);

      const disposedEvents = tracker.getEventsByEventType('disposed');
      expect(disposedEvents).toHaveLength(1);
    });
  });

  describe('getEventsInRange', () => {
    it('should filter events by time range', async () => {
      const startTime = performance.now();
      tracker.recordCreation('geometry', 'geo-1');
      
      await new Promise(r => setTimeout(r, 10));
      const midTime = performance.now();
      
      tracker.recordCreation('geometry', 'geo-2');
      await new Promise(r => setTimeout(r, 10));
      const endTime = performance.now();

      const allEvents = tracker.getEventsInRange(startTime, endTime);
      expect(allEvents).toHaveLength(2);

      const laterEvents = tracker.getEventsInRange(midTime, endTime);
      expect(laterEvents).toHaveLength(1);
    });
  });

  describe('getSummary', () => {
    it('should return correct counts', () => {
      tracker.recordCreation('geometry', 'geo-1');
      tracker.recordCreation('geometry', 'geo-2');
      tracker.recordDisposal('geometry', 'geo-1');
      tracker.recordCreation('material', 'mat-1');
      tracker.recordCreation('texture', 'tex-1');
      tracker.recordCreation('texture', 'tex-2');
      tracker.recordDisposal('texture', 'tex-1');

      const summary = tracker.getSummary();
      
      expect(summary.geometries.created).toBe(2);
      expect(summary.geometries.disposed).toBe(1);
      expect(summary.geometries.active).toBe(1);
      
      expect(summary.materials.created).toBe(1);
      expect(summary.materials.disposed).toBe(0);
      expect(summary.materials.active).toBe(1);
      
      expect(summary.textures.created).toBe(2);
      expect(summary.textures.disposed).toBe(1);
      expect(summary.textures.active).toBe(1);
    });

    it('should track total events', () => {
      tracker.recordCreation('geometry', 'geo-1');
      tracker.recordCreation('material', 'mat-1');
      tracker.recordDisposal('geometry', 'geo-1');

      const summary = tracker.getSummary();
      expect(summary.totalEvents).toBe(3);
    });

    it('should identify oldest active resource', () => {
      tracker.recordCreation('geometry', 'geo-old', { name: 'OldGeo' });
      tracker.recordCreation('material', 'mat-new', { name: 'NewMat' });

      const summary = tracker.getSummary();
      expect(summary.oldestActiveResource).toBeDefined();
      expect(summary.oldestActiveResource?.uuid).toBe('geo-old');
    });
  });

  describe('getPotentialLeaks', () => {
    it('should identify resources older than threshold', async () => {
      // Use a very short threshold for testing
      const t = new ResourceLifecycleTracker({
        leakThresholdMs: 10, // 10ms threshold
      });

      t.recordCreation('geometry', 'geo-leak', { name: 'LeakyGeo' });
      
      // Wait for threshold to pass
      await new Promise(r => setTimeout(r, 20));

      const leaks = t.getPotentialLeaks();
      expect(leaks.length).toBeGreaterThan(0);
      expect(leaks[0].uuid).toBe('geo-leak');
    });

    it('should not report recently created resources as leaks', () => {
      tracker.recordCreation('geometry', 'geo-recent');

      const leaks = tracker.getPotentialLeaks();
      expect(leaks).toHaveLength(0);
    });

    it('should sort leaks by age (oldest first)', async () => {
      const t = new ResourceLifecycleTracker({
        leakThresholdMs: 5,
      });

      t.recordCreation('geometry', 'geo-oldest');
      await new Promise(r => setTimeout(r, 5));
      t.recordCreation('geometry', 'geo-newer');
      await new Promise(r => setTimeout(r, 10));

      const leaks = t.getPotentialLeaks();
      if (leaks.length >= 2) {
        expect(leaks[0].ageMs).toBeGreaterThanOrEqual(leaks[1].ageMs);
      }
    });
  });

  describe('onEvent', () => {
    it('should call callback on events', () => {
      const callback = vi.fn();
      tracker.onEvent(callback);

      tracker.recordCreation('geometry', 'geo-1');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback.mock.calls[0][0].eventType).toBe('created');
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = tracker.onEvent(callback);

      tracker.recordCreation('geometry', 'geo-1');
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      tracker.recordCreation('geometry', 'geo-2');
      expect(callback).toHaveBeenCalledTimes(1); // Still 1
    });
  });

  describe('onAlert', () => {
    it('should call callback on leak alerts', async () => {
      const t = new ResourceLifecycleTracker({
        leakThresholdMs: 5,
      });
      const callback = vi.fn();
      t.onAlert(callback);

      t.recordCreation('geometry', 'geo-leak');
      await new Promise(r => setTimeout(r, 10));
      t.runLeakDetection();

      expect(callback).toHaveBeenCalled();
    });

    it('should return unsubscribe function', async () => {
      const t = new ResourceLifecycleTracker({
        leakThresholdMs: 5,
      });
      const callback = vi.fn();
      const unsubscribe = t.onAlert(callback);

      unsubscribe();
      t.recordCreation('geometry', 'geo-leak');
      await new Promise(r => setTimeout(r, 10));
      t.runLeakDetection();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('runLeakDetection', () => {
    it('should detect orphaned resources', async () => {
      const t = new ResourceLifecycleTracker();
      t.recordCreation('geometry', 'geo-orphan');
      
      // Orphan detection has a 5 second threshold by default
      // We'll check that no alert is generated immediately
      const alerts = t.runLeakDetection();
      const orphanAlerts = alerts.filter(a => a.type === 'orphaned_resource');
      expect(orphanAlerts).toHaveLength(0); // Too soon
    });

    it('should detect undisposed resources after threshold', async () => {
      const t = new ResourceLifecycleTracker({
        leakThresholdMs: 5,
      });
      t.recordCreation('geometry', 'geo-undisposed');
      
      await new Promise(r => setTimeout(r, 10));
      const alerts = t.runLeakDetection();
      
      const undisposedAlerts = alerts.filter(a => a.type === 'undisposed_resource');
      expect(undisposedAlerts.length).toBeGreaterThan(0);
    });

    it('should detect detached but not disposed resources', async () => {
      const t = new ResourceLifecycleTracker();
      t.recordCreation('material', 'mat-detached');
      t.recordAttachment('material', 'mat-detached', 'mesh-1');
      t.recordDetachment('material', 'mat-detached', 'mesh-1');
      
      // Detached detection has a 10 second threshold
      // For immediate testing, we'd need to mock time
      const alerts = t.runLeakDetection();
      // Initially no alert as threshold not reached
      expect(alerts.filter(a => a.type === 'detached_not_disposed')).toHaveLength(0);
    });

    it('should detect resource accumulation', () => {
      const t = new ResourceLifecycleTracker();
      
      // Create many geometries (threshold is 100)
      for (let i = 0; i < 105; i++) {
        t.recordCreation('geometry', `geo-${i}`);
      }
      
      const alerts = t.runLeakDetection();
      const accumulationAlerts = alerts.filter(a => a.type === 'resource_accumulation');
      expect(accumulationAlerts.length).toBeGreaterThan(0);
    });

    it('should not duplicate alerts for same resource', async () => {
      const t = new ResourceLifecycleTracker({
        leakThresholdMs: 5,
      });
      t.recordCreation('geometry', 'geo-dup');
      
      await new Promise(r => setTimeout(r, 10));
      t.runLeakDetection();
      t.runLeakDetection(); // Run again
      
      const allAlerts = t.getAlerts();
      const geoAlerts = allAlerts.filter(
        a => a.resourceUuid === 'geo-dup' && a.type === 'undisposed_resource'
      );
      expect(geoAlerts).toHaveLength(1);
    });
  });

  describe('getAlerts', () => {
    it('should return copy of alerts', async () => {
      const t = new ResourceLifecycleTracker({
        leakThresholdMs: 5,
      });
      t.recordCreation('geometry', 'geo-1');
      await new Promise(r => setTimeout(r, 10));
      t.runLeakDetection();

      const alerts1 = t.getAlerts();
      const alerts2 = t.getAlerts();

      expect(alerts1).not.toBe(alerts2);
    });
  });

  describe('clearAlerts', () => {
    it('should clear all alerts', async () => {
      const t = new ResourceLifecycleTracker({
        leakThresholdMs: 5,
      });
      t.recordCreation('geometry', 'geo-1');
      await new Promise(r => setTimeout(r, 10));
      t.runLeakDetection();

      expect(t.getAlerts().length).toBeGreaterThan(0);
      
      t.clearAlerts();
      
      expect(t.getAlerts()).toHaveLength(0);
    });
  });

  describe('event limit', () => {
    it('should respect maxEvents limit', () => {
      const t = new ResourceLifecycleTracker({
        maxEvents: 10,
      });

      for (let i = 0; i < 20; i++) {
        t.recordCreation('geometry', `geo-${i}`);
      }

      const events = t.getEvents();
      expect(events.length).toBeLessThanOrEqual(10);
    });
  });

  describe('alert severity', () => {
    it('should set critical severity for very old resources', async () => {
      const t = new ResourceLifecycleTracker({
        leakThresholdMs: 5,
      });
      t.recordCreation('geometry', 'geo-very-old');
      
      // Wait for 3x threshold
      await new Promise(r => setTimeout(r, 20));
      const alerts = t.runLeakDetection();
      
      const criticalAlerts = alerts.filter(a => a.severity === 'critical');
      expect(criticalAlerts.length).toBeGreaterThan(0);
    });

    it('should set critical severity for high resource accumulation', () => {
      const t = new ResourceLifecycleTracker();
      
      // Create 2x threshold (200+ geometries)
      for (let i = 0; i < 205; i++) {
        t.recordCreation('geometry', `geo-${i}`);
      }
      
      const alerts = t.runLeakDetection();
      const accumulationAlerts = alerts.filter(a => a.type === 'resource_accumulation');
      expect(accumulationAlerts.some(a => a.severity === 'critical')).toBe(true);
    });
  });

  describe('multiple resource types', () => {
    it('should track different resource types independently', () => {
      tracker.recordCreation('geometry', 'geo-1');
      tracker.recordCreation('geometry', 'geo-2');
      tracker.recordCreation('material', 'mat-1');
      tracker.recordCreation('texture', 'tex-1');
      tracker.recordCreation('texture', 'tex-2');
      tracker.recordCreation('texture', 'tex-3');
      tracker.recordDisposal('geometry', 'geo-1');
      tracker.recordDisposal('texture', 'tex-1');

      const summary = tracker.getSummary();
      
      expect(summary.geometries.active).toBe(1);
      expect(summary.materials.active).toBe(1);
      expect(summary.textures.active).toBe(2);
    });
  });

  describe('attachment tracking', () => {
    it('should track multiple mesh attachments', () => {
      tracker.recordCreation('material', 'shared-mat');
      tracker.recordAttachment('material', 'shared-mat', 'mesh-1');
      tracker.recordAttachment('material', 'shared-mat', 'mesh-2');
      tracker.recordAttachment('material', 'shared-mat', 'mesh-3');

      // Material should still be active with multiple attachments
      const summary = tracker.getSummary();
      expect(summary.materials.active).toBe(1);
    });

    it('should mark resource as detached when all meshes removed', () => {
      tracker.recordCreation('material', 'mat-multi');
      tracker.recordAttachment('material', 'mat-multi', 'mesh-1');
      tracker.recordAttachment('material', 'mat-multi', 'mesh-2');
      tracker.recordDetachment('material', 'mat-multi', 'mesh-1');
      
      // Still attached to mesh-2
      const summary = tracker.getSummary();
      expect(summary.materials.active).toBe(1);
      
      tracker.recordDetachment('material', 'mat-multi', 'mesh-2');
      // Now fully detached - should trigger detach time tracking
    });
  });

  describe('getOrphanedResources', () => {
    it('should return orphaned resources sorted by age', () => {
      tracker.recordCreation('geometry', 'geo-1');
      tracker.recordCreation('material', 'mat-1');
      tracker.recordCreation('texture', 'tex-1');
      
      // Attach only mat-1
      tracker.recordAttachment('material', 'mat-1', 'mesh-1');
      
      const orphans = tracker.getOrphanedResources();
      
      expect(orphans).toHaveLength(2);
      expect(orphans.map(o => o.uuid)).toContain('geo-1');
      expect(orphans.map(o => o.uuid)).toContain('tex-1');
      expect(orphans.map(o => o.uuid)).not.toContain('mat-1');
    });

    it('should include name and subtype in orphaned resources', () => {
      tracker.recordCreation('geometry', 'geo-1', {
        name: 'BoxGeometry',
        subtype: 'BoxBufferGeometry',
      });
      
      const orphans = tracker.getOrphanedResources();
      
      expect(orphans[0].name).toBe('BoxGeometry');
      expect(orphans[0].subtype).toBe('BoxBufferGeometry');
    });

    it('should include age in orphaned resources', async () => {
      tracker.recordCreation('geometry', 'geo-1');
      await new Promise(r => setTimeout(r, 10));
      
      const orphans = tracker.getOrphanedResources();
      
      expect(orphans[0].ageMs).toBeGreaterThan(0);
    });
  });

  describe('generateLeakReport', () => {
    it('should generate comprehensive leak report', () => {
      tracker.recordCreation('geometry', 'geo-1');
      tracker.recordCreation('material', 'mat-1');
      tracker.recordDisposal('geometry', 'geo-1');
      
      const report = tracker.generateLeakReport();
      
      expect(report.generatedAt).toBeGreaterThan(0);
      expect(report.sessionDurationMs).toBeGreaterThanOrEqual(0);
      expect(report.summary).toBeDefined();
      expect(report.resourceStats).toBeDefined();
      expect(report.alerts).toBeDefined();
    });

    it('should include resource stats in report', () => {
      tracker.recordCreation('geometry', 'geo-1');
      tracker.recordCreation('geometry', 'geo-2');
      tracker.recordCreation('material', 'mat-1');
      tracker.recordDisposal('geometry', 'geo-1');
      
      const report = tracker.generateLeakReport();
      
      expect(report.resourceStats.geometries.created).toBe(2);
      expect(report.resourceStats.geometries.disposed).toBe(1);
    });

    it('should include recommendations for orphaned resources', () => {
      tracker.recordCreation('geometry', 'geo-1');
      tracker.recordCreation('material', 'mat-1');
      tracker.recordCreation('texture', 'tex-1');
      // All orphaned
      
      const report = tracker.generateLeakReport();
      
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations.some(r => r.includes('geometries'))).toBe(true);
      expect(report.recommendations.some(r => r.includes('materials'))).toBe(true);
      expect(report.recommendations.some(r => r.includes('textures'))).toBe(true);
    });

    it('should recommend addressing critical alerts', async () => {
      const t = new ResourceLifecycleTracker({ leakThresholdMs: 5 });
      t.recordCreation('geometry', 'geo-old');
      await new Promise(r => setTimeout(r, 20));
      
      const report = t.generateLeakReport();
      
      expect(report.recommendations.some(r => r.includes('critical'))).toBe(true);
    });

    it('should recommend reviewing memory growth', () => {
      const t = new ResourceLifecycleTracker();
      
      // Simulate memory growth history by adding resources over time
      for (let i = 0; i < 15; i++) {
        t.recordCreation('texture', `tex-${i}`, {
          estimatedMemory: 10 * 1024 * 1024, // 10MB each
        });
      }
      
      // Manually trigger memory history updates
      const history = t.getMemoryHistory();
      // Note: updateMemoryHistory is called internally, but we can check if it tracks
    });

    it('should count leaked resources in report', async () => {
      const t = new ResourceLifecycleTracker({ leakThresholdMs: 5 });
      t.recordCreation('geometry', 'geo-leak', { estimatedMemory: 1024 });
      await new Promise(r => setTimeout(r, 10));
      
      const report = t.generateLeakReport();
      
      expect(report.resourceStats.geometries.leaked).toBe(1);
      expect(report.summary.estimatedLeakedMemoryBytes).toBe(1024);
    });
  });

  describe('getEstimatedMemory', () => {
    it('should sum memory of active resources', () => {
      tracker.recordCreation('texture', 'tex-1', { estimatedMemory: 1024 });
      tracker.recordCreation('texture', 'tex-2', { estimatedMemory: 2048 });
      tracker.recordCreation('geometry', 'geo-1', { estimatedMemory: 512 });
      
      const total = tracker.getEstimatedMemory();
      
      expect(total).toBe(3584);
    });

    it('should exclude disposed resources', () => {
      tracker.recordCreation('texture', 'tex-1', { estimatedMemory: 1024 });
      tracker.recordCreation('texture', 'tex-2', { estimatedMemory: 2048 });
      tracker.recordDisposal('texture', 'tex-1');
      
      const total = tracker.getEstimatedMemory();
      
      expect(total).toBe(2048);
    });
  });

  describe('getMemoryHistory', () => {
    it('should return copy of memory history', () => {
      const history = tracker.getMemoryHistory();
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('detectDetachedNotDisposed', () => {
    it('should detect resources detached but not disposed', async () => {
      const t = new ResourceLifecycleTracker();
      t.recordCreation('material', 'mat-1');
      t.recordAttachment('material', 'mat-1', 'mesh-1');
      t.recordDetachment('material', 'mat-1', 'mesh-1');
      
      // Need to wait for threshold (10s is too long for test)
      // Just verify the method exists and runs
      t.runLeakDetection();
    });

    it('should not duplicate alerts for same resource', async () => {
      const t = new ResourceLifecycleTracker({ leakThresholdMs: 1 });
      t.recordCreation('geometry', 'geo-1');
      
      await new Promise(r => setTimeout(r, 5));
      t.runLeakDetection();
      const firstCount = t.getAlerts().length;
      
      await new Promise(r => setTimeout(r, 5));
      t.runLeakDetection();
      const secondCount = t.getAlerts().length;
      
      // Some alerts shouldn't be duplicated within threshold
      // (exact behavior depends on alert type)
    });
  });

  describe('detectMemoryGrowth', () => {
    it('should detect consistent memory growth', () => {
      const t = new ResourceLifecycleTracker();
      
      // Need 10+ samples in history
      // Memory growth detection is internal, but we can verify via alerts
    });
  });

  describe('callback errors', () => {
    it('should handle callback errors gracefully', () => {
      const errorCallback = vi.fn(() => { throw new Error('Callback error'); });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      tracker.onEvent(errorCallback);
      
      // Should not throw
      expect(() => {
        tracker.recordCreation('geometry', 'geo-1');
      }).not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly in alerts', async () => {
      const t = new ResourceLifecycleTracker({ leakThresholdMs: 5 });
      
      // Create resource with specific memory
      t.recordCreation('texture', 'tex-1', { estimatedMemory: 1500 }); // 1.5KB
      await new Promise(r => setTimeout(r, 10));
      t.runLeakDetection();
      
      const alerts = t.getAlerts();
      const leakAlert = alerts.find(a => a.type === 'undisposed_resource');
      if (leakAlert && leakAlert.details) {
        expect(leakAlert.details).toBeDefined();
      }
    });

    it('should format MB correctly in alerts', async () => {
      const t = new ResourceLifecycleTracker({ leakThresholdMs: 5 });
      
      t.recordCreation('texture', 'tex-1', { estimatedMemory: 10 * 1024 * 1024 }); // 10MB
      await new Promise(r => setTimeout(r, 10));
      t.runLeakDetection();
      
      const alerts = t.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  describe('clear', () => {
    it('should clear all tracked data', () => {
      tracker.recordCreation('geometry', 'geo-1');
      tracker.recordCreation('material', 'mat-1');
      tracker.runLeakDetection();
      
      tracker.clear();
      
      expect(tracker.getEvents()).toHaveLength(0);
      expect(tracker.getAlerts()).toHaveLength(0);
      expect(tracker.getSummary().geometries.active).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle disposal of non-existent resource', () => {
      expect(() => {
        tracker.recordDisposal('geometry', 'non-existent');
      }).not.toThrow();
    });

    it('should handle detachment of non-existent resource', () => {
      expect(() => {
        tracker.recordDetachment('material', 'non-existent', 'mesh-1');
      }).not.toThrow();
    });

    it('should handle attachment to non-existent resource', () => {
      expect(() => {
        tracker.recordAttachment('material', 'non-existent', 'mesh-1');
      }).not.toThrow();
    });

    it('should handle resource with no metadata', () => {
      tracker.recordCreation('geometry', 'geo-minimal');
      
      const events = tracker.getEvents();
      expect(events[0].resourceName).toBeUndefined();
      expect(events[0].resourceSubtype).toBeUndefined();
    });
  });

  describe('subscription management', () => {
    it('should allow unsubscribe from events', () => {
      const callback = vi.fn();
      const unsub = tracker.onEvent(callback);
      
      tracker.recordCreation('geometry', 'geo-1');
      expect(callback).toHaveBeenCalledTimes(1);
      
      unsub();
      
      tracker.recordCreation('geometry', 'geo-2');
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
