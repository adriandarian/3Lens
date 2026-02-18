# 3Lens – AI Persistent Memory

This file is the long-term memory for AI sessions working on this repository.
After every correction, update this file so the same mistake is not repeated.

**To add a new entry:** Date | Mistake | Fix/Rule

---

## Corrections & Learned Patterns

| Date | Mistake | Fix / Rule |
|------|---------|-----------|
| 2026-02-14 | Referenced `agents/` folder paths (contracts, playbooks) after migration | All contracts are now under `.cursor/contracts/`, all playbooks under `.cursor/playbooks/`. The `agents/` folder no longer exists. |
| 2026-02-14 | Used `3lens validate contracts` command | Correct command is `3lens validate all` (or `3lens validate <name>` for a specific contract). |
| 2026-02-14 | Referenced `agents/checklists/pr.md` for PR checklist | PR checklist is now in the "Code Review Checklist" section of `.cursor/agents/code-reviewer.md`. |

---

## How to Use

When the AI makes a mistake and you correct it, say:

> "Add this to MEMORY.md so you don't make this mistake again."

The AI will add a row with today's date, the mistake, and the fix rule.
Edit entries ruthlessly — remove outdated ones, merge duplicates.
