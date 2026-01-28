/**
 * @3lens/ui-web
 *
 * Web Components for 3Lens UI.
 * Provides custom elements for framework-agnostic embedding.
 *
 * @example
 * ```html
 * <script type="module">
 *   import '@3lens/ui-web';
 *   import { createLens } from '@3lens/runtime';
 *
 *   const lens = createLens();
 *   document.querySelector('three-lens-panel').lens = lens;
 * </script>
 *
 * <three-lens-panel mode="overlay"></three-lens-panel>
 * ```
 *
 * @packageDocumentation
 */

export * from './elements/ThreeLensPanel';
export * from './elements/ThreeLensOverlay';
export * from './elements/ThreeLensDock';
export * from './styles';
export * from './register';
