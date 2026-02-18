# Playbook: Add a Skill

Skills convert repeated AI instructions into a reusable, token-efficient document. When you find yourself typing the same guidance to the AI more than once a day, that's a skill.

---

## When to Create a Skill

Create a skill when:

- You repeat the same instructions daily or more often
- A workflow has 3+ distinct steps that the AI needs to know
- A domain has specific 3Lens commands, file patterns, or contract references
- You want a named entry point in Cursor Settings → Skills

**Criterion:** "If you keep typing the same instructions, it's a skill."

---

## Skill File Structure

Create the file at: `.cursor/skills/[name]-operations/SKILL.md`

```markdown
# Skill: [Name] Operations

[One sentence: what this skill is for.]

## When to Use This Skill

- [Scenario 1]
- [Scenario 2]

## Prerequisites

- [Tool or context required]

## Workflow

### Step 1: [Action]

[Description]

```bash
[command]
```

### Step 2: [Action]

[Description]

## Examples

### Example: [Scenario name]

```bash
[example commands]
```

## Key Rules

- [Rule 1]
- [Rule 2]

## Related Resources

- Commands: `.cursor/commands/[related].md`
- Contracts: `.cursor/contracts/[relevant].md`
- Skills: [cross-references]
```

---

## Step-by-Step

### 1. Identify the repeated task

Write one sentence describing what you keep doing.
Example: "I keep running trace commands and asking the AI to interpret the output."

### 2. Name the skill

Use the format `[domain]-operations`. Keep it lowercase with hyphens.
Examples: `analytics-operations`, `deploy-operations`, `asset-operations`

### 3. Create the directory and file

```
.cursor/skills/[name]-operations/SKILL.md
```

### 4. Fill in the SKILL.md

Minimum required sections:
- **When to Use This Skill** — specific trigger scenarios
- **Workflow** — numbered steps with commands
- **Examples** — at least one concrete example
- **Related Resources** — links to contracts and commands

### 5. Add to the Skills README

Add an entry to `.cursor/skills/README.md`:

```markdown
- **[name]-operations** – [one-line description]
```

### 6. (Optional) Add a command shortcut

If the skill has a primary CLI command, create `.cursor/commands/[name].md`:

```markdown
# Command: [Name]

[Description]

## Usage

```bash
[command with common flags]
```
```

---

## Existing Skills for Reference

| Skill | Domain |
|-------|--------|
| `analytics-operations` | Interpreting trace/query output |
| `diff-operations` | Comparing traces and frames |
| `trace-operations` | Recording and replaying traces |
| `query-operations` | Running analytical queries |
| `validation-operations` | Contract validation |
| `scaffold-operations` | Generating boilerplate |
| `inspector-operations` | Navigating entities |

---

## Related Resources

- Skills directory: `.cursor/skills/`
- Commands directory: `.cursor/commands/`
- Worktree docs: `.cursor/README.md`
