/**
 * ThreeLens Angular Panel Component
 *
 * Embeds the full workspace (inspect, performance, memory, changes, shaders) in a
 * container you own. For the quiet HUD above the app, use `<threelens-hud>` or
 * the service.
 *
 * @packageDocumentation
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import type { Subscription } from 'rxjs';
import { ThreeLensService } from './threelens.service';

/**
 * @example
 * ```html
 * <threelens-panel style="height: 480px" (selectionChange)="onSelect($event)"></threelens-panel>
 * ```
 */
@Component({
  selector: 'threelens-panel',
  template: `<div #container class="threelens-container"></div>`,
  styles: [
    `
      .threelens-container {
        width: 100%;
        height: 100%;
        position: relative;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThreeLensComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true })
  containerRef!: ElementRef<HTMLElement>;

  /** Disable all scene-mutating actions. */
  @Input() readonly = false;

  /** Emits the selected entity ids whenever selection changes. */
  @Output() selectionChange = new EventEmitter<string[]>();

  private unmount: (() => void) | undefined;
  private subscription: Subscription | undefined;

  constructor(private readonly threeLens: ThreeLensService) {}

  ngAfterViewInit(): void {
    this.unmount = this.threeLens.mountWorkspace(this.containerRef.nativeElement, { readonly: this.readonly });
    this.subscription = this.threeLens.selection$.subscribe((selection) => {
      if (selection) this.selectionChange.emit([...selection.entity_ids]);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.unmount?.();
  }
}
