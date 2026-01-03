/**
 * ThreeLensEntityDirective Test Suite
 *
 * Tests for the Angular directive that registers Three.js objects with 3Lens.
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

// Mock @angular/core
vi.mock('@angular/core', () => ({
  Directive: () => (target: any) => target,
  Input: () => () => {},
  OnInit: class {},
  OnDestroy: class {},
  OnChanges: class {},
}));

import { ThreeLensEntityDirective, createEntityOptions } from './threelens-entity.directive';
import { ThreeLensService, EntityOptions } from './threelens.service';

describe('ThreeLensEntityDirective', () => {
  let directive: ThreeLensEntityDirective;

  beforeEach(() => {
    vi.clearAllMocks();
    directive = new ThreeLensEntityDirective(mockService as any);
  });

  describe('initialization', () => {
    it('should create the directive', () => {
      expect(directive).toBeDefined();
    });

    it('should not register without object', () => {
      directive.ngOnInit();
      expect(mockService.registerEntity).not.toHaveBeenCalled();
    });

    it('should register when object is provided', () => {
      const obj = { uuid: 'test-uuid', name: '', userData: {} } as any;
      directive.threeLensObject = obj;
      directive.threeLensName = 'TestEntity';
      directive.ngOnInit();
      
      expect(mockService.registerEntity).toHaveBeenCalledWith(obj, {
        name: 'TestEntity',
        module: undefined,
        metadata: undefined,
        tags: undefined,
      });
    });

    it('should register with all options', () => {
      const obj = { uuid: 'test-uuid', name: '', userData: {} } as any;
      directive.threeLensObject = obj;
      directive.threeLensName = 'Player';
      directive.threeLensModule = 'game/entities';
      directive.threeLensMetadata = { health: 100 };
      directive.threeLensTags = ['player', 'controllable'];
      directive.ngOnInit();

      expect(mockService.registerEntity).toHaveBeenCalledWith(obj, {
        name: 'Player',
        module: 'game/entities',
        metadata: { health: 100 },
        tags: ['player', 'controllable'],
      });
    });
  });

  describe('changes handling', () => {
    it('should re-register when object changes', () => {
      const obj1 = { uuid: 'uuid-1', name: '', userData: {} } as any;
      const obj2 = { uuid: 'uuid-2', name: '', userData: {} } as any;

      directive.threeLensObject = obj1;
      directive.threeLensName = 'Entity1';
      directive.ngOnInit();

      expect(mockService.registerEntity).toHaveBeenCalledTimes(1);
      expect(mockService.registerEntity).toHaveBeenCalledWith(obj1, expect.any(Object));

      // Simulate object change
      directive.threeLensObject = obj2;
      directive.ngOnChanges({
        threeLensObject: {
          currentValue: obj2,
          previousValue: obj1,
          firstChange: false,
          isFirstChange: () => false,
        },
      } as any);

      // Should unregister old object and register new one
      expect(mockService.unregisterEntity).toHaveBeenCalled();
      expect(mockService.registerEntity).toHaveBeenCalledTimes(2);
      expect(mockService.registerEntity).toHaveBeenLastCalledWith(obj2, expect.any(Object));
    });

    it('should update metadata without re-registering', () => {
      const obj = { uuid: 'test-uuid', name: '', userData: { __3lens: {} } } as any;
      directive.threeLensObject = obj;
      directive.threeLensName = 'Entity';
      directive.ngOnInit();

      const initialCallCount = mockService.registerEntity.mock.calls.length;

      // Simulate metadata change
      directive.threeLensMetadata = { newData: true };
      directive.ngOnChanges({
        threeLensMetadata: {
          currentValue: { newData: true },
          previousValue: undefined,
          firstChange: false,
          isFirstChange: () => false,
        },
      } as any);

      // Should not re-register
      expect(mockService.registerEntity).toHaveBeenCalledTimes(initialCallCount);
    });

    it('should update name in userData when changed', () => {
      const obj = { uuid: 'test-uuid', name: 'OldName', userData: { __3lens: { module: 'test' } } } as any;
      directive.threeLensObject = obj;
      directive.threeLensName = 'OldName';
      directive.ngOnInit();

      // Simulate name change
      directive.threeLensName = 'NewName';
      directive.ngOnChanges({
        threeLensName: {
          currentValue: 'NewName',
          previousValue: 'OldName',
          firstChange: false,
          isFirstChange: () => false,
        },
      } as any);

      expect(obj.name).toBe('NewName');
    });
  });

  describe('cleanup', () => {
    it('should unregister on destroy', () => {
      const obj = { uuid: 'test-uuid', name: '', userData: {} } as any;
      directive.threeLensObject = obj;
      directive.threeLensName = 'Entity';
      directive.ngOnInit();

      directive.ngOnDestroy();
      expect(mockService.unregisterEntity).toHaveBeenCalledWith(obj);
    });

    it('should not unregister if not registered', () => {
      directive.ngOnDestroy();
      expect(mockService.unregisterEntity).not.toHaveBeenCalled();
    });
  });
});

describe('createEntityOptions', () => {
  it('should create entity options with name', () => {
    const options = createEntityOptions('TestEntity');
    expect(options).toEqual({ name: 'TestEntity' });
  });

  it('should create entity options with all properties', () => {
    const options = createEntityOptions('Player', {
      module: 'game/entities',
      metadata: { health: 100 },
      tags: ['player'],
    });
    expect(options).toEqual({
      name: 'Player',
      module: 'game/entities',
      metadata: { health: 100 },
      tags: ['player'],
    });
  });
});
