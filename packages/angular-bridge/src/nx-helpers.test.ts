/**
 * NxLibraryHelper Test Suite
 *
 * Tests for the Nx library integration helpers.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ThreeLensService
const mockService = {
  registerEntity: vi.fn(),
  unregisterEntity: vi.fn(),
};

vi.mock('./threelens.service', () => ({
  ThreeLensService: vi.fn(() => mockService),
}));

import {
  NxLibraryHelper,
  createNxLibraryHelper,
  NxThreeLensLibrary,
  NxLibraryOptions,
} from './nx-helpers';

describe('NxLibraryHelper', () => {
  let helper: NxLibraryHelper;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create helper with basic options', () => {
      helper = new NxLibraryHelper(mockService as any, {
        name: 'feature-player',
      });
      expect(helper).toBeDefined();
      expect(helper.fullModulePath).toBe('feature-player');
    });

    it('should create helper with scoped module path', () => {
      helper = new NxLibraryHelper(mockService as any, {
        name: 'feature-player',
        scope: 'game',
      });
      expect(helper.fullModulePath).toBe('@game/feature-player');
    });

    it('should create helper with all options', () => {
      helper = new NxLibraryHelper(mockService as any, {
        name: 'feature-editor',
        scope: 'tools',
        type: 'feature',
        tags: ['editor', 'tools'],
      });
      expect(helper.fullModulePath).toBe('@tools/feature-editor');
    });
  });

  describe('registerEntity', () => {
    beforeEach(() => {
      helper = new NxLibraryHelper(mockService as any, {
        name: 'feature-player',
        scope: 'game',
        type: 'feature',
      });
    });

    it('should register entity with module path', () => {
      const obj = { uuid: 'test-uuid' } as any;
      helper.registerEntity(obj, 'PlayerMesh');

      expect(mockService.registerEntity).toHaveBeenCalledWith(obj, {
        name: 'PlayerMesh',
        module: '@game/feature-player',
        metadata: {
          __nx: {
            library: 'feature-player',
            scope: 'game',
            type: 'feature',
          },
        },
        tags: ['feature', 'nx:feature-player', 'scope:game'],
      });
    });

    it('should register entity with custom metadata', () => {
      const obj = { uuid: 'test-uuid' } as any;
      helper.registerEntity(obj, 'Player', {
        metadata: { health: 100, level: 5 },
      });

      expect(mockService.registerEntity).toHaveBeenCalledWith(obj, {
        name: 'Player',
        module: '@game/feature-player',
        metadata: {
          health: 100,
          level: 5,
          __nx: {
            library: 'feature-player',
            scope: 'game',
            type: 'feature',
          },
        },
        tags: ['feature', 'nx:feature-player', 'scope:game'],
      });
    });

    it('should register entity with custom tags', () => {
      const obj = { uuid: 'test-uuid' } as any;
      helper.registerEntity(obj, 'Enemy', {
        tags: ['hostile', 'ai-controlled'],
      });

      expect(mockService.registerEntity).toHaveBeenCalled();
      const call = mockService.registerEntity.mock.calls[0][1];
      expect(call.tags).toContain('hostile');
      expect(call.tags).toContain('ai-controlled');
      expect(call.tags).toContain('feature');
      expect(call.tags).toContain('nx:feature-player');
      expect(call.tags).toContain('scope:game');
    });

    it('should include library tags when provided', () => {
      helper = new NxLibraryHelper(mockService as any, {
        name: 'ui-hud',
        scope: 'game',
        type: 'ui',
        tags: ['hud', 'ui-component'],
      });

      const obj = { uuid: 'test-uuid' } as any;
      helper.registerEntity(obj, 'HealthBar');

      const call = mockService.registerEntity.mock.calls[0][1];
      expect(call.tags).toContain('hud');
      expect(call.tags).toContain('ui-component');
      expect(call.tags).toContain('ui');
      expect(call.tags).toContain('nx:ui-hud');
    });
  });

  describe('unregisterEntity', () => {
    beforeEach(() => {
      helper = new NxLibraryHelper(mockService as any, {
        name: 'feature-player',
        scope: 'game',
      });
    });

    it('should unregister entity', () => {
      const obj = { uuid: 'test-uuid' } as any;
      helper.unregisterEntity(obj);
      expect(mockService.unregisterEntity).toHaveBeenCalledWith(obj);
    });
  });

  describe('createScopedRegistrar', () => {
    beforeEach(() => {
      helper = new NxLibraryHelper(mockService as any, {
        name: 'feature-player',
        scope: 'game',
        type: 'feature',
      });
    });

    it('should create scoped registrar function', () => {
      const registerPlayerPart = helper.createScopedRegistrar('PlayerCharacter');
      expect(typeof registerPlayerPart).toBe('function');
    });

    it('should register with component-scoped name', () => {
      const registerPlayerPart = helper.createScopedRegistrar('PlayerCharacter');
      const obj = { uuid: 'test-uuid' } as any;

      registerPlayerPart(obj, 'Head');

      expect(mockService.registerEntity).toHaveBeenCalledWith(obj, {
        name: 'PlayerCharacter/Head',
        module: '@game/feature-player',
        metadata: expect.any(Object),
        tags: expect.arrayContaining(['component:PlayerCharacter']),
      });
    });

    it('should include additional tags in scoped registration', () => {
      const registerPlayerPart = helper.createScopedRegistrar('PlayerCharacter');
      const obj = { uuid: 'test-uuid' } as any;

      registerPlayerPart(obj, 'Weapon', { tags: ['equipment'] });

      const call = mockService.registerEntity.mock.calls[0][1];
      expect(call.tags).toContain('equipment');
      expect(call.tags).toContain('component:PlayerCharacter');
    });

    it('should include metadata in scoped registration', () => {
      const registerPlayerPart = helper.createScopedRegistrar('PlayerCharacter');
      const obj = { uuid: 'test-uuid' } as any;

      registerPlayerPart(obj, 'Body', { metadata: { bodyPart: 'torso' } });

      const call = mockService.registerEntity.mock.calls[0][1];
      expect(call.metadata.bodyPart).toBe('torso');
    });
  });

  describe('without scope', () => {
    it('should work without scope', () => {
      helper = new NxLibraryHelper(mockService as any, {
        name: 'shared-utils',
        type: 'util',
      });

      expect(helper.fullModulePath).toBe('shared-utils');

      const obj = { uuid: 'test-uuid' } as any;
      helper.registerEntity(obj, 'Helper');

      const call = mockService.registerEntity.mock.calls[0][1];
      expect(call.module).toBe('shared-utils');
      expect(call.tags).not.toContain('scope:undefined');
    });
  });

  describe('type handling', () => {
    it('should default to unknown type', () => {
      helper = new NxLibraryHelper(mockService as any, {
        name: 'some-lib',
      });

      const obj = { uuid: 'test-uuid' } as any;
      helper.registerEntity(obj, 'Entity');

      const call = mockService.registerEntity.mock.calls[0][1];
      expect(call.tags).toContain('unknown');
    });

    it('should use provided type', () => {
      helper = new NxLibraryHelper(mockService as any, {
        name: 'data-lib',
        type: 'data-access',
      });

      const obj = { uuid: 'test-uuid' } as any;
      helper.registerEntity(obj, 'DataModel');

      const call = mockService.registerEntity.mock.calls[0][1];
      expect(call.tags).toContain('data-access');
    });
  });
});

describe('createNxLibraryHelper', () => {
  it('should create NxLibraryHelper instance', () => {
    const helper = createNxLibraryHelper(mockService as any, {
      name: 'feature-editor',
      scope: 'tools',
      type: 'feature',
    });

    expect(helper).toBeInstanceOf(NxLibraryHelper);
    expect(helper.fullModulePath).toBe('@tools/feature-editor');
  });
});

describe('NxThreeLensLibrary decorator', () => {
  it('should store options as static metadata', () => {
    const options: NxLibraryOptions = {
      name: 'feature-terrain',
      scope: 'world',
      type: 'feature',
    };

    @NxThreeLensLibrary(options)
    class TerrainService {}

    expect((TerrainService as any).__3lens_nx_options).toEqual(options);
  });

  it('should preserve class functionality', () => {
    @NxThreeLensLibrary({ name: 'test-lib' })
    class TestClass {
      value = 42;
      getValue() {
        return this.value;
      }
    }

    const instance = new TestClass();
    expect(instance.getValue()).toBe(42);
  });
});
