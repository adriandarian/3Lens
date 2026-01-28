---
name: scaffold-plugin
description: Generate boilerplate for a new 3Lens addon/plugin
---

# /scaffold-plugin

Generate boilerplate code for a third-party addon/plugin.

## Usage

```
/scaffold-plugin [name]
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
[name]/
├── package.json
├── 3lens-addon.json
├── src/
│   ├── index.ts
│   ├── queries/
│   └── panels/
├── tests/
└── README.md
```

## Manifest (3lens-addon.json)

```json
{
  "id": "com.company.[name]",
  "version": "1.0.0",
  "requires": {
    "kernel": "^1.0.0"
  },
  "capabilities": {
    "required": [],
    "optional": []
  }
}
```

## Next Steps

After scaffolding, follow the playbook:
- `agents/playbooks/add-a-plugin.md`

## Requirements

Every addon must:
- Have unique, namespaced ID
- Declare version compatibility
- Declare capabilities (required + optional)
- Handle missing capabilities gracefully
- Not break traces when not installed

## See Also

- Skill: scaffold-operations
- Playbook: agents/playbooks/add-a-plugin.md
- Contract: agents/contracts/addons.md
