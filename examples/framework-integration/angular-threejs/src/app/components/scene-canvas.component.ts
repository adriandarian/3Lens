import { 
  Component, 
  ElementRef, 
  ViewChild, 
  AfterViewInit, 
  OnDestroy,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreeSceneService } from '../services/three-scene.service';

/**
 * Scene Canvas Component
 * 
 * Renders the Three.js scene and handles canvas initialization.
 */
@Component({
  selector: 'app-scene-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <canvas #canvas class="scene-canvas"></canvas>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    
    .scene-canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class SceneCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private animationFrameId: number = 0;

  constructor(
    private sceneService: ThreeSceneService,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.sceneService.initialize(canvas);
    
    // Run animation loop outside Angular zone for performance
    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.sceneService.render();
  };
}

