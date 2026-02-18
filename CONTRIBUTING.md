# Contributing to 3Lens

## Development Environment

### Terminal

A good terminal setup removes friction and speeds up development significantly.

**Recommended setup:**
- A modern terminal with a status line (e.g. Ghostty, Windows Terminal, iTerm2)
- Status line showing: current git branch, `pnpm` script execution status
- Voice dictation for faster input — approximately 3× faster than typing for longer instructions to the AI

**Verify `3lens` is in your PATH after setup:**

```bash
pnpm install
3lens doctor
```

If `3lens` is not found, ensure the repo's `.bin` is resolved by pnpm:

```bash
pnpm exec 3lens doctor
```

### Node / pnpm

This project uses [pnpm](https://pnpm.io/) workspaces. Ensure you have the correct version:

```bash
# Check pnpm version (see package.json for required version)
pnpm --version

# Install all workspace dependencies
pnpm install
```

### Parallel Sessions (Git Worktrees)

For running multiple independent Cursor AI sessions simultaneously:

```bash
git worktree add ../3Lens-wt2 main
```

Open `3Lens-wt2` in a separate Cursor window. Each window gets isolated AI context with no interference.

See `.cursor/README.md` for full worktree documentation.

---

## Development Workflow

1. **Read the contracts** — `.cursor/contracts/` defines non-negotiable behaviors
2. **Choose a playbook** — `.cursor/playbooks/add-a-*.md` for structured development
3. **Scaffold** — `3lens scaffold [component]` generates boilerplate
4. **Validate** — `3lens validate all` before submitting

For complex tasks, write a plan first: `.cursor/playbooks/plan-then-execute.md`

---

## Code Review

- Use the `code-reviewer` agent for architectural review
- For strict review: say "Grill me" or "Harsh review"
- See `.cursor/commands/review-harsh.md`

---

## Definition of Done

A change is complete only if:

- [ ] No contract violations
- [ ] Attribution path present for any new metrics
- [ ] Works in both live mode and offline trace mode
- [ ] Fidelity is explicit for any new metrics
- [ ] Tests updated for touched contracts

See `.cursor/agents/code-reviewer.md` for the full checklist.
