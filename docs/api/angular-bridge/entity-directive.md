# ThreeLensEntityDirective

The `ThreeLensEntityDirective` is an Angular directive for registering Three.js objects as named entities in the 3Lens devtools.

## Import

```typescript
import { ThreeLensEntityDirective } from '@3lens/angular-bridge';
```

## Usage

The directive can be used with wrapper components that hold Three.js object references:

```typescript
import { Component, AfterViewInit } from '@angular/core';
import { ThreeLensEntityDirective } from '@3lens/angular-bridge';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [ThreeLensEntityDirective],
  template: `
    <div
      threeLensEntity
      [threeLensObject]="playerMesh"
      [threeLensName]="'Player'"
      [threeLensModule]="'game/entities'"
      [threeLensMetadata]="{ health: health, level: level }"
      [threeLensTags]="['player', 'controllable']"
    ></div>
  `
})
export class PlayerComponent implements AfterViewInit {
  playerMesh!: THREE.Mesh;
  health = 100;
  level = 5;

  ngAfterViewInit() {
    this.playerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial({ color: 'blue' })
    );
  }
}
```

## Selector

```typescript
selector: '[threeLensEntity]'
```

## Inputs

| Input | Type | Description |
|-------|------|-------------|
| `threeLensObject` | `THREE.Object3D \| undefined` | The Three.js object to register |
| `threeLensName` | `string \| undefined` | Display name in devtools |
| `threeLensModule` | `string \| undefined` | Module/category for grouping |
| `threeLensMetadata` | `Record<string, unknown> \| undefined` | Custom metadata |
| `threeLensTags` | `string[] \| undefined` | Tags for filtering |

## Lifecycle

1. **ngOnInit**: Registers the entity if the object is available
2. **ngOnChanges**: Re-registers if the object changes; updates metadata otherwise
3. **ngOnDestroy**: Unregisters the entity

## Examples

### Basic Registration

```html
<div
  threeLensEntity
  [threeLensObject]="mesh"
  [threeLensName]="'MyMesh'"
></div>
```

### With Full Options

```html
<div
  threeLensEntity
  [threeLensObject]="enemyMesh"
  [threeLensName]="'Enemy_' + enemyId"
  [threeLensModule]="'game/enemies'"
  [threeLensMetadata]="{
    health: enemy.health,
    speed: enemy.speed,
    type: enemy.type
  }"
  [threeLensTags]="['enemy', enemy.type, enemy.isAggressive ? 'aggressive' : 'passive']"
></div>
```

### Dynamic Updates

The directive automatically updates when inputs change:

```typescript
@Component({
  selector: 'app-health-bar',
  template: `
    <div
      threeLensEntity
      [threeLensObject]="playerMesh"
      [threeLensName]="'Player'"
      [threeLensMetadata]="{ health: currentHealth }"
    ></div>
  `
})
export class HealthBarComponent {
  playerMesh!: THREE.Mesh;
  currentHealth = 100;

  takeDamage(amount: number) {
    this.currentHealth -= amount;
    // Metadata automatically updates in devtools
  }
}
```

### Programmatic Alternative

For more control, use `ThreeLensService` directly:

```typescript
import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { ThreeLensService } from '@3lens/angular-bridge';

@Component({
  selector: 'app-vehicle',
  template: `<ng-content></ng-content>`
})
export class VehicleComponent implements AfterViewInit, OnDestroy {
  private vehicleMesh!: THREE.Mesh;

  constructor(private threeLens: ThreeLensService) {}

  ngAfterViewInit() {
    this.vehicleMesh = this.createVehicle();
    
    this.threeLens.registerEntity(this.vehicleMesh, {
      name: 'PlayerVehicle',
      module: 'game/vehicles',
      metadata: {
        speed: this.maxSpeed,
        fuel: this.fuelCapacity
      },
      tags: ['vehicle', 'player-controlled']
    });
  }

  ngOnDestroy() {
    this.threeLens.unregisterEntity(this.vehicleMesh);
  }
}
```

## Helper Function

The `createEntityOptions` helper constructs options from separate parameters:

```typescript
import { createEntityOptions } from '@3lens/angular-bridge';

const options = createEntityOptions(
  'Player',           // name
  'game/entities',    // module
  { health: 100 },    // metadata
  ['player']          // tags
);
```

## Standalone Usage

The directive is standalone and can be imported directly:

```typescript
@Component({
  standalone: true,
  imports: [ThreeLensEntityDirective],
  // ...
})
export class MyComponent {}
```

Or included via the module:

```typescript
@NgModule({
  imports: [ThreeLensModule],
  // ...
})
export class MyModule {}
```

## Related

- [ThreeLensService](./three-lens-service.md) - Service API for entity registration
- [ThreeLensModule](./module.md) - Module that exports the directive
- [NxLibraryHelper](./nx-helpers.md) - Nx workspace entity registration
