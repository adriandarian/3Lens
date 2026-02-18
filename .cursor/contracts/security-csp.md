# Contract: Security & CSP

## Purpose

Define how 3Lens operates in security-constrained environments:
- Strict Content Security Policy (CSP)
- Enterprise restrictions
- No eval / no inline scripts
- Limited injection capabilities

## Security Profiles

```typescript
type SecurityProfile = 'default' | 'cspSafe' | 'enterpriseStrict';

interface SecurityConfig {
  profile: SecurityProfile;
  allowEval: boolean;
  allowInlineStyles: boolean;
  allowInlineScripts: boolean;
  allowPopups: boolean;
  allowedOrigins: string[];
  styleNonce?: string;
  scriptNonce?: string;
}
```

### default
- Standard web environment
- All features available
- Style/script injection allowed

### cspSafe
- No inline scripts or styles
- No eval or new Function
- External CSS required
- Nonce support if provided

### enterpriseStrict
- cspSafe + additional restrictions
- No external fetching without allowlist
- No popup windows
- Audit logging enabled

## CSP Constraints

### What CSP Can Block
- Inline `<script>` tags
- Inline `style=""` attributes
- `<style>` blocks (depending on policy)
- `eval()` and `new Function()`
- Dynamic stylesheet injection
- Popup windows
- Cross-origin requests

### 3Lens CSP Guarantees

**Runtime + UI Core MUST NOT use:**
- `eval()` or `new Function()`
- Inline style attributes in critical paths
- Inline scripts

**Runtime + UI Core SHOULD support:**
- External CSS loading
- Nonce-based style injection
- Class-based styling only

## CSP-Safe Mode Features

### Enabled
- All core capture functionality
- Entity graph and queries
- Trace export/import
- Basic UI rendering

### Disabled/Limited
- Dynamic theme injection (use external CSS)
- Some "fancy" UI effects
- Auto-discovery via prototype patching (if blocked)
- One-line snippet loaders

### CSP-Safe Styling Options

```typescript
// Option A: Host imports CSS
import "@3lens/ui/styles.css";

// Option B: External CSS URL
uiOverlay({ cssUrl: "/assets/3lens.css" });

// Option C: Nonce-based injection
uiOverlay({ styleNonce: "abc123" });
```

## Enterprise Considerations

Beyond CSP, enterprise environments may have:
- Strict dependency allowlists
- Internal registries only
- No unapproved CDN assets
- WebAssembly restrictions
- Cross-origin window restrictions

### Enterprise Mode Features
```typescript
interface EnterpriseConfig extends SecurityConfig {
  auditLog: boolean;              // Log all 3Lens actions
  dataRetention: boolean;         // Control trace storage
  redactByDefault: boolean;       // Redact sensitive data
  approvedAddons: string[];       // Addon whitelist
}
```

## Invariants (MUST ALWAYS HOLD)

1. **No eval in kernel/UI core:**
   - Kernel and UI core never use `eval()` or `new Function()`.

2. **Graceful CSP detection:**
   - Detect CSP constraints and adapt.
   - Never crash on CSP violation.

3. **Multiple styling paths:**
   - At least one styling option works in any CSP environment.

4. **Clear degradation reporting:**
   - Doctor reports what's blocked and why.

5. **Code-integrated mode always works:**
   - Direct import path works in strictest CSP.

## CSP Detection

```typescript
function detectCSPConstraints(): CSPConstraints {
  return {
    inlineStylesBlocked: !canInjectInlineStyle(),
    evalBlocked: !canUseEval(),
    popupsBlocked: !canOpenPopup(),
    // ... other checks
  };
}

function canInjectInlineStyle(): boolean {
  try {
    const el = document.createElement('div');
    el.style.color = 'red';
    return el.style.color === 'red';
  } catch {
    return false;
  }
}
```

## Doctor CSP Report

```typescript
interface CSPDoctorReport {
  profile: SecurityProfile;
  detected_constraints: {
    inline_styles: boolean;
    inline_scripts: boolean;
    eval: boolean;
    popups: boolean;
  };
  active_workarounds: string[];
  disabled_features: string[];
  recommendations: string[];
}
```

## Plugin Security

Plugins/addons in CSP environments:
- Must not use eval-based code loading
- Must declare CSP requirements
- Can be disabled if incompatible

```typescript
interface AddonSecurityRequirements {
  requiresEval: boolean;
  requiresInlineStyles: boolean;
  requiresPopup: boolean;
  cspCompatible: boolean;
}
```

## Acceptance Tests

- **No eval:**
  - Kernel and UI core pass with `'unsafe-eval'` blocked.
- **No inline styles:**
  - UI renders acceptably with external CSS only.
- **CSP detection:**
  - CSP constraints detected and reported in Doctor.
- **Graceful degradation:**
  - Blocked features don't crash, just degrade.
- **Enterprise mode:**
  - Audit log captures all significant actions.

## Anti-goals

- Using eval for any core functionality
- Requiring inline styles for basic operation
- Crashing on CSP violation
- Hiding CSP limitations from users
- Complex workarounds that break security model
