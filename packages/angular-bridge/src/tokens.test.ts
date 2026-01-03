/**
 * Tokens Test Suite
 *
 * Tests for the Angular injection tokens and configuration.
 */

import { describe, it, expect, vi } from 'vitest';

// Mock @angular/core
vi.mock('@angular/core', () => ({
  InjectionToken: class InjectionToken<T> {
    constructor(public description: string) {}
  },
}));

import {
  THREELENS_PROBE,
  THREELENS_CONFIG,
  DEFAULT_THREELENS_CONFIG,
  ThreeLensModuleConfig,
} from './tokens';

describe('Injection Tokens', () => {
  describe('THREELENS_PROBE', () => {
    it('should be defined', () => {
      expect(THREELENS_PROBE).toBeDefined();
    });

    it('should have correct description', () => {
      expect(THREELENS_PROBE.description).toBe('THREELENS_PROBE');
    });
  });

  describe('THREELENS_CONFIG', () => {
    it('should be defined', () => {
      expect(THREELENS_CONFIG).toBeDefined();
    });

    it('should have correct description', () => {
      expect(THREELENS_CONFIG.description).toBe('THREELENS_CONFIG');
    });
  });
});

describe('DEFAULT_THREELENS_CONFIG', () => {
  it('should have default appName', () => {
    expect(DEFAULT_THREELENS_CONFIG.appName).toBe('Angular Three.js App');
  });

  it('should have showOverlay enabled by default', () => {
    expect(DEFAULT_THREELENS_CONFIG.showOverlay).toBe(true);
  });

  it('should have default toggle shortcut', () => {
    expect(DEFAULT_THREELENS_CONFIG.toggleShortcut).toBe('ctrl+shift+d');
  });

  it('should have debug disabled by default', () => {
    expect(DEFAULT_THREELENS_CONFIG.debug).toBe(false);
  });

  it('should have autoCreateOverlay enabled by default', () => {
    expect(DEFAULT_THREELENS_CONFIG.autoCreateOverlay).toBe(true);
  });

  it('should be a valid ThreeLensModuleConfig', () => {
    const config: ThreeLensModuleConfig = DEFAULT_THREELENS_CONFIG;
    expect(config).toBeDefined();
  });
});

describe('ThreeLensModuleConfig interface', () => {
  it('should allow partial configuration', () => {
    const partialConfig: ThreeLensModuleConfig = {
      appName: 'Custom App',
    };
    expect(partialConfig.appName).toBe('Custom App');
    expect(partialConfig.showOverlay).toBeUndefined();
  });

  it('should allow full configuration', () => {
    const fullConfig: ThreeLensModuleConfig = {
      appName: 'Full Config App',
      showOverlay: false,
      toggleShortcut: 'alt+d',
      debug: true,
      autoCreateOverlay: false,
    };

    expect(fullConfig.appName).toBe('Full Config App');
    expect(fullConfig.showOverlay).toBe(false);
    expect(fullConfig.toggleShortcut).toBe('alt+d');
    expect(fullConfig.debug).toBe(true);
    expect(fullConfig.autoCreateOverlay).toBe(false);
  });
});
