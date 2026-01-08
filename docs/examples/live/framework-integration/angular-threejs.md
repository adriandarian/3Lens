---
title: Angular Three.js
description: Integrate 3Lens with Angular applications
---

# Angular Three.js

Integrate 3Lens with Angular applications using dependency injection.

<ExampleViewer
  src="/examples/framework-integration/angular-threejs/"
  title="Angular Three.js Demo"
  description="Use 3Lens with Angular through a dedicated service. Leverage RxJS observables for reactive debugging."
  difficulty="intermediate"
  github-url="https://github.com/adriandarian/3Lens/tree/main/examples/framework-integration/angular-threejs"
/>

## Features Demonstrated

- **Angular Service**: Injectable 3Lens service
- **RxJS Integration**: Observables for probe events
- **Component Lifecycle**: Proper setup and teardown
- **Zone.js Awareness**: Works with Angular change detection

## Usage

```typescript
import { ThreeLensService } from '@3lens/angular-bridge';

@Component({...})
export class SceneComponent implements OnInit, OnDestroy {
  constructor(private threeLens: ThreeLensService) {}
  
  ngOnInit() {
    this.threeLens.observeRenderer(this.renderer);
    this.threeLens.observeScene(this.scene);
  }
  
  ngOnDestroy() {
    this.threeLens.dispose();
  }
}
```

## Related Examples

- [Vanilla Three.js](./vanilla-threejs) - Basic setup
- [React Three Fiber](./react-three-fiber) - React integration
