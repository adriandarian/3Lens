/**
 * Addon Interface
 *
 * Third-party addon registration and management.
 *
 * @packageDocumentation
 */

import type { Lens } from './lens';

/**
 * Addon configuration
 */
export interface AddonConfig {
  /** Addon ID (reverse-DNS style) */
  id: string;
  /** Version (semver) */
  version: string;
  /** Display name */
  displayName: string;
  /** Description */
  description: string;
}

/**
 * Addon requirements
 */
export interface AddonRequirements {
  /** Kernel version range */
  kernel: string;
  /** Trace schema version range */
  trace?: string;
  /** Contracts version range */
  contracts?: string;
}

/**
 * Addon capabilities
 */
export interface AddonCapabilities {
  /** Required capabilities (must have to function) */
  required: string[];
  /** Optional capabilities (nice to have) */
  optional: string[];
}

/**
 * Addon interface
 */
export interface Addon {
  // Identity
  /** Unique addon ID */
  readonly id: string;
  /** Version */
  readonly version: string;
  /** Display name */
  readonly displayName: string;
  /** Description */
  readonly description: string;

  // Compatibility
  /** Requirements */
  readonly requires: AddonRequirements;

  // Capabilities
  /** Capabilities */
  readonly capabilities: AddonCapabilities;

  // Lifecycle
  /** Register the addon */
  register?(lens: Lens): void | Promise<void>;
  /** Unregister the addon */
  unregister?(lens: Lens): void;
}

/**
 * Create an addon
 */
export function defineAddon(
  config: AddonConfig & {
    requires: AddonRequirements;
    capabilities?: AddonCapabilities;
    register?: (lens: Lens) => void | Promise<void>;
    unregister?: (lens: Lens) => void;
  }
): Addon {
  return {
    id: config.id,
    version: config.version,
    displayName: config.displayName,
    description: config.description,
    requires: config.requires,
    capabilities: config.capabilities ?? { required: [], optional: [] },
    register: config.register,
    unregister: config.unregister,
  };
}

/**
 * Check addon compatibility
 */
export function checkAddonCompatibility(
  addon: Addon,
  environment: {
    kernelVersion: string;
    traceVersion?: string;
    capabilities: Record<string, boolean>;
  }
): AddonCompatibilityResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check kernel version (simplified - real impl would use semver)
  // TODO: Use semver for proper version checking

  // Check required capabilities
  for (const cap of addon.capabilities.required) {
    if (!environment.capabilities[cap]) {
      errors.push(`Missing required capability: ${cap}`);
    }
  }

  // Check optional capabilities
  for (const cap of addon.capabilities.optional) {
    if (!environment.capabilities[cap]) {
      warnings.push(`Optional capability unavailable: ${cap}`);
    }
  }

  return {
    compatible: errors.length === 0,
    errors,
    warnings,
    degradedCapabilities: addon.capabilities.optional.filter((c) => !environment.capabilities[c]),
  };
}

/**
 * Addon compatibility result
 */
export interface AddonCompatibilityResult {
  /** Whether addon is compatible */
  compatible: boolean;
  /** Errors (incompatible) */
  errors: string[];
  /** Warnings (degraded) */
  warnings: string[];
  /** Capabilities that will be degraded */
  degradedCapabilities: string[];
}
