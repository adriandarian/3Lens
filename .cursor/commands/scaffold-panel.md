---
name: scaffold-panel
description: Generate boilerplate for a new 3Lens UI panel
---

# /scaffold-panel

Generate boilerplate code for a new UI panel.

## Usage

```
/scaffold-panel [name] [addon]
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| name | (required) | Panel name (kebab-case) |
| addon | (none) | Target addon (optional) |

## Examples

```bash
# Create a new panel
3lens scaffold panel perf-timeline

# Create panel in specific addon
3lens scaffold panel my-panel --addon my-addon
```

## Generated Files

```
packages/ui-core/src/panels/
└── [name]/
    ├── index.ts
    ├── [name].ts
    ├── [name].test.ts
    └── README.md
```

## Next Steps

After scaffolding, follow the playbook:
- `agents/playbooks/add-a-panel.md`

## Requirements

Every panel must:
- Answer a clear question
- Show fidelity badges on metrics
- Route selection through Inspector
- Work with offline traces
- Have contract tests

## See Also

- Skill: scaffold-operations
- Skill: ui-operations
- Playbook: agents/playbooks/add-a-panel.md
- Agent: playbook-executor
- Contract: agents/contracts/ui-surfaces.md
- Contract: agents/contracts/inspector.md
- Rule: .cursor/rules/ui-standards.mdc
