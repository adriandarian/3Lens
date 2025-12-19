/**
 * @3lens/core
 *
 * Core probe SDK for 3Lens - the definitive developer toolkit for three.js
 */

// Types
export type {
  ProbeConfig,
  SamplingConfig,
  RulesConfig,
  CustomRule,
  RuleResult,
} from './types/config';

export type {
  TrackedObjectRef,
  ObjectMeta,
  LogicalEntity,
} from './types/objects';

export type {
  FrameStats,
  WebGLFrameExtras,
  WebGPUFrameExtras,
  RuleViolation,
} from './types/stats';

export type {
  SceneSnapshot,
  SceneNode,
  TransformData,
  Vector3Data,
  EulerData,
} from './types/snapshot';

export type {
  RendererAdapter,
  RendererKind,
} from './types/adapter';

export type {
  Transport,
  DebugMessage,
} from './types/transport';

export type { Unsubscribe } from './types/common';

// Core
export { DevtoolProbe } from './probe/DevtoolProbe';
export { createProbe } from './probe/createProbe';

// Adapters
export { createWebGLAdapter } from './adapters/webgl-adapter';

// Transport
export { createPostMessageTransport } from './transport/postmessage-transport';
export { createDirectTransport } from './transport/direct-transport';

