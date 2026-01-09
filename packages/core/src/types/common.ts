import type * as THREE from 'three';

/**
 * Unsubscribe function returned by event subscriptions
 */
export type Unsubscribe = () => void;

/**
 * Type alias for the THREE.js namespace
 * Used to pass the THREE module to helpers that need to create THREE objects
 */
export type ThreeNamespace = typeof THREE;
