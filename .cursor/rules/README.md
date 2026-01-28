# Rules

File-pattern-specific rules and standards for 3Lens development.

## Rule Types

### Always Applied Rules

These rules apply to all files:

- **[project-standards.mdc](project-standards.mdc)** - Core 3Lens design principles
  - Shared primitives before new UI
  - Inspector is the spine
  - Metrics must attribute
  - Live and offline parity
  - Kernel is privileged; plugins are constrained
  - Data fidelity is explicit

- **[commit-standards.mdc](commit-standards.mdc)** - Commit message format
  - Conventional commits format
  - Type and scope requirements
  - Body and footer guidelines

### Pattern-Specific Rules

These rules apply to specific file patterns:

- **[contract-compliance.mdc](contract-compliance.mdc)** - `packages/core/**/*.ts`, `packages/hosts/**/*.ts`
  - Contract compliance for kernel and runtime
  - Dependency rule validation
  - Fidelity and attribution requirements

- **[test-standards.mdc](test-standards.mdc)** - `packages/**/*.test.ts`, `tests/**/*.ts`
  - Test file structure
  - Contract test patterns
  - Fidelity and attribution testing
  - Live/offline parity testing

- **[docs-standards.mdc](docs-standards.mdc)** - `docs/**/*.md`
  - Documentation structure
  - Frontmatter requirements
  - Code example standards
  - Cross-reference patterns

- **[addon-standards.mdc](addon-standards.mdc)** - `packages/addons/**/*.ts`
  - Addon structure
  - Manifest requirements
  - Namespacing rules
  - Capability declarations
  - Trace compatibility

- **[ui-standards.mdc](ui-standards.mdc)** - `packages/ui/**/*.ts`
  - UI layer separation
  - Panel requirements
  - Fidelity badges
  - Inspector routing
  - Accessibility

- **[host-standards.mdc](host-standards.mdc)** - `packages/hosts/**/*.ts`
  - Host interface implementation
  - Context registration
  - Event emission patterns
  - Multi-context support
  - Overhead management

- **[mount-standards.mdc](mount-standards.mdc)** - `packages/mounts/**/*.ts`
  - Mount kit structure
  - Framework integration patterns
  - UI component integration
  - Live/offline parity

- **[example-standards.mdc](example-standards.mdc)** - `examples/**/*`
  - Example structure
  - README requirements
  - Code quality standards
  - Setup instructions

## Rule Application

Rules are applied automatically based on:
- File path patterns (glob patterns)
- File extensions
- Directory structure

## Rule Structure

Each rule file includes:

1. **Purpose** - What the rule enforces
2. **Requirements** - Specific requirements
3. **Examples** - Correct and incorrect patterns
4. **See Also** - Related contracts, playbooks, skills

## Related Resources

- Contracts: [../../agents/contracts/](../../agents/contracts/)
- Playbooks: [../../agents/playbooks/](../../agents/playbooks/)
- Skills: [../skills/](../skills/)
- Project Guide: [../../agents.md](../../agents.md)