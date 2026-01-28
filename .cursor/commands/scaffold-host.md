---
name: scaffold-host
description: Generate boilerplate for a new 3Lens framework host
---

# /scaffold-host

Generate boilerplate code for a new framework host.

## Usage

```
/scaffold-host [name]
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| name | (required) | Host/framework name |

## Examples

```bash
# Create host for a new framework
3lens scaffold host solid-js
```

## Generated Files

```
packages/hosts/
└── [name]/
    ├── package.json
    ├── src/
    │   └── index.ts
    └── tsconfig.json
```

## Next Steps

After scaffolding, follow the playbook:
- `agents/playbooks/add-a-host.md`

## Requirements

Every host must:
- Implement context registration
- Handle lifecycle hooks
- Support multiple renderers
- Follow runtime-boundaries contract

## Existing Hosts

- `manual` - Manual attachment
- `r3f` - React Three Fiber
- `tres` - TresJS (Vue)
- `worker` - Web Worker

## See Also

- Skill: scaffold-operations
- Skill: host-operations
- Playbook: agents/playbooks/add-a-host.md
- Agent: playbook-executor
- Contract: agents/contracts/runtime-boundaries.md
- Contract: agents/contracts/capture.md
- Rule: .cursor/rules/host-standards.mdc
- Contract: agents/contracts/runtime-boundaries.md
