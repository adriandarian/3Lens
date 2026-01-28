---
name: scaffold-operations
description: Generate boilerplate code for 3Lens components including panels, probes, hosts, and addons. Use when creating new UI panels, instrumentation probes, framework hosts, or third-party addons.
---

# Scaffold Operations

Scaffold operations generate boilerplate code for common 3Lens components, ensuring consistency and contract compliance.

## When to Use

- Creating a new UI panel
- Adding instrumentation probes
- Building a framework host
- Developing third-party addons

## Commands

### Scaffold a Panel

```bash
# Create a new panel
3lens scaffold panel perf-timeline

# Create panel in a specific addon
3lens scaffold panel my-custom-panel --addon my-addon
```

**Generates:**

- Panel source file with standard interface
- Query hooks for data fetching
- Contract compliance checklist
- Test file template

### Scaffold a Probe

```bash
# Create a texture upload probe
3lens scaffold probe texture-upload

# Create a custom event probe
3lens scaffold probe custom-event
```

**Generates:**

- Probe source file
- Event schema definition
- Integration hooks

### Scaffold a Host

```bash
# Create a host for a new framework
3lens scaffold host my-framework
```

**Generates:**

- Host adapter source
- Context registration
- Lifecycle hooks
- Framework-specific bindings

### Scaffold an Addon

```bash
# Create a third-party addon
3lens scaffold addon my-company-addon
```

**Generates:**

- Addon package structure
- Manifest file (`3lens-addon.json`)
- Registration code
- Capability declarations
- README template

## Generated Structure

### Panel

```
packages/ui-core/src/panels/
└── my-panel/
    ├── index.ts
    ├── my-panel.ts
    ├── my-panel.test.ts
    └── README.md
```

### Probe

```
packages/kernel/src/probes/
└── my-probe/
    ├── index.ts
    ├── schema.ts
    └── my-probe.test.ts
```

### Host

```
packages/hosts/
└── my-framework/
    ├── package.json
    ├── src/
    │   └── index.ts
    └── tsconfig.json
```

### Addon

```
my-addon/
├── package.json
├── 3lens-addon.json
├── src/
│   ├── index.ts
│   ├── queries/
│   └── panels/
├── tests/
└── README.md
```

## Agent Use Cases

1. **New panel**: "Scaffold a performance timeline panel"
2. **New probe**: "Create a probe for tracking texture uploads"
3. **Framework support**: "Scaffold a host for Solid.js"
4. **Third-party addon**: "Generate boilerplate for a custom analytics addon"

## Post-Scaffold Steps

After scaffolding, follow the relevant playbook:

- Panels: [agents/playbooks/add-a-panel.md](../../../agents/playbooks/add-a-panel.md)
- Probes: [agents/playbooks/add-a-probe.md](../../../agents/playbooks/add-a-probe.md)
- Hosts: [agents/playbooks/add-a-host.md](../../../agents/playbooks/add-a-host.md)
- Addons: [agents/playbooks/add-a-plugin.md](../../../agents/playbooks/add-a-plugin.md)

## Additional Resources

- For detailed command syntax, see [skills.md](../../../skills.md)
- For addon contract, see [agents/contracts/addons.md](../../../agents/contracts/addons.md)
- Commands: [.cursor/commands/scaffold-*.md](../../../commands/)
- Playbooks: [agents/playbooks/add-a-*.md](../../../agents/playbooks/)
- Agent: [playbook-executor](../../../agents/playbook-executor.md)
