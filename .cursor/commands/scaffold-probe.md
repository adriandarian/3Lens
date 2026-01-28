---
name: scaffold-probe
description: Generate boilerplate for a new 3Lens instrumentation probe
---

# /scaffold-probe

Generate boilerplate code for a new instrumentation probe.

## Usage

```
/scaffold-probe [name]
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| name | (required) | Probe name (kebab-case) |

## Examples

```bash
# Create texture upload probe
3lens scaffold probe texture-upload

# Create custom event probe
3lens scaffold probe custom-event
```

## Generated Files

```
packages/kernel/src/probes/
└── [name]/
    ├── index.ts
    ├── schema.ts
    └── [name].test.ts
```

## Next Steps

After scaffolding, follow the playbook:
- `agents/playbooks/add-a-probe.md`

## See Also

- Skill: scaffold-operations
- Playbook: agents/playbooks/add-a-probe.md
- Contract: agents/contracts/capture.md
