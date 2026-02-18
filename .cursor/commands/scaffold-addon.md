---
name: scaffold-addon
description: Generate boilerplate for a new 3Lens addon
---

# /scaffold-addon

Generate boilerplate code for a third-party addon.

## Usage

```
/scaffold-addon [name]
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| name | (required) | Addon name (kebab-case) |

## Examples

```bash
# Create a new addon
3lens scaffold addon my-company-addon
```

## Generated Files

```
packages/addon-[name]/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
�?  ├── index.ts
�?  └── ...
└── README.md
```

## Next Steps

After scaffolding, follow the playbook:
- `.cursor/playbooks/add-a-plugin.md`

## Requirements

Every addon must:
- Have unique, namespaced ID
- Declare version compatibility
- Declare capabilities (required + optional)
- Handle missing capabilities gracefully
- Not break traces when not installed

## See Also

- Skill: scaffold-operations
- Playbook: .cursor/playbooks/add-a-plugin.md
- Contract: .cursor/contracts/addons.md
