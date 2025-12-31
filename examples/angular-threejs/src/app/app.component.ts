import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SceneCanvasComponent } from './components/scene-canvas.component';
import { ThreeSceneService } from './services/three-scene.service';

/**
 * Main App Component
 * 
 * Demonstrates 3Lens integration with Angular using:
 * - ThreeSceneService for Three.js scene management
 * - Direct DevtoolProbe creation and attachment
 * - RxJS observables for reactive metrics
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SceneCanvasComponent],
  template: `
    <div class="app-container">
      <app-scene-canvas></app-scene-canvas>
      <div class="info-panel">
        <h3>3Lens Angular Example</h3>
        <p>FPS: {{ fps$ | async | number:'1.0-0' }}</p>
        <p>Draw Calls: {{ drawCalls$ | async }}</p>
        <p>Triangles: {{ triangles$ | async | number }}</p>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      width: 100vw;
      height: 100vh;
      position: relative;
    }
    
    .info-panel {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-size: 14px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .info-panel h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #4ecdc4;
    }
    
    .info-panel p {
      margin: 4px 0;
      opacity: 0.9;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  fps$ = this.sceneService.fps$;
  drawCalls$ = this.sceneService.drawCalls$;
  triangles$ = this.sceneService.triangles$;

  constructor(private sceneService: ThreeSceneService) {}

  ngOnInit(): void {
    // Scene service initializes automatically
  }

  ngOnDestroy(): void {
    this.sceneService.dispose();
  }
}

