/**
 * ThreeLens Angular Component
 *
 * A component that renders the 3Lens UI.
 *
 * @packageDocumentation
 */

import {
  Component,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
} from '@angular/core';
import type { Selection } from '@3lens/runtime';
import { ThreeLensService } from './threelens.service';

/**
 * Angular component for rendering 3Lens UI
 *
 * @example
 * ```html
 * <threelens-panel
 *   [mode]="'overlay'"
 *   (selectionChange)="onSelection($event)">
 * </threelens-panel>
 * ```
 */
@Component({
  selector: 'threelens-panel',
  template: `<div #container class="threelens-container"></div>`,
  styles: [`
    .threelens-container {
      width: 100%;
      height: 100%;
      position: relative;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThreeLensComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true })
  containerRef!: ElementRef<HTMLElement>;

  /** UI mode */
  @Input() mode: 'overlay' | 'dock' = 'overlay';

  /** Initial visibility */
  @Input() visible = true;

  /** Selection change event */
  @Output() selectionChange = new EventEmitter<Selection>();

  /** Visibility change event */
  @Output() visibilityChange = new EventEmitter<boolean>();

  private subscription: { unsubscribe: () => void } | null = null;

  constructor(private readonly threeLens: ThreeLensService) {}

  ngOnInit(): void {
    // Mount the UI to the container
    this.threeLens.mount(this.containerRef.nativeElement);

    // Set initial visibility
    if (!this.visible) {
      this.threeLens.hide();
    }

    // Subscribe to selection changes
    this.subscription = this.threeLens.selection$.subscribe((selection) => {
      if (selection) {
        this.selectionChange.emit(selection);
      }
    }) as { unsubscribe: () => void };

    // Subscribe to visibility changes
    this.threeLens.visible$.subscribe((visible) => {
      this.visibilityChange.emit(visible);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.threeLens.unmount();
  }

  /** Show the panel */
  show(): void {
    this.threeLens.show();
  }

  /** Hide the panel */
  hide(): void {
    this.threeLens.hide();
  }

  /** Toggle visibility */
  toggle(): void {
    this.threeLens.toggle();
  }
}
