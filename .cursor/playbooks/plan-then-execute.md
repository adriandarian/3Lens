# Playbook: Plan Then Execute

Separate planning from execution for non-trivial work. Invest in planning before writing code — and again for verification.

---

## When to Use This Playbook

Use plan-then-execute for:

- Changes touching **3 or more files**
- New features that interact with **multiple contracts**
- **Architectural changes** (new layer, new package, new host)
- Any task where you are **not 100% sure of the approach**
- After things go sideways — stop coding, re-plan before continuing

For simple single-file edits, plan-then-execute is overkill. Use your judgment.

---

## Step 1: Write the Plan

Before writing any code, produce a written plan that answers:

1. **What** — What is being built or changed?
2. **Why** — What problem does it solve? Which design principle does it serve?
3. **Which files** — List every file that will be created, modified, or deleted.
4. **Which contracts** — Which contracts are affected? Read them now.
5. **Risks** — What could go wrong? What are the edge cases?
6. **Verification** — How will you prove it works? (trace, diff, test, validate)

### Plan format

```markdown
## Plan: [Feature Name]

### What
[One paragraph description]

### Why
[Design principle or problem being solved]

### Files
- CREATE: [path] – [purpose]
- MODIFY: [path] – [what changes]
- DELETE: [path] – [why]

### Contracts Affected
- [contract name] – [how it applies]

### Risks
- [risk] – [mitigation]

### Verification
- [ ] [specific check]
- [ ] `3lens validate all` passes
- [ ] Works in offline trace mode
```

---

## Step 2: Review Before Coding

Before writing a single line of implementation:

- **Human review**: Walk through the plan with a teammate or re-read it yourself after a break.
- **Second Cursor window**: Open a separate worktree (see `.cursor/README.md`), paste the plan, and ask the AI to critique it.
- Questions to ask during review:
  - Does this violate any contract?
  - Is this the simplest approach?
  - Does this work in offline trace mode?
  - Are there shared primitives we should improve first?

Only proceed to Step 3 when the plan is solid.

---

## Step 3: Execute

Implement the plan. Stay disciplined:

- If you discover a flaw mid-implementation → **stop and re-plan** (go back to Step 1)
- Do not expand scope without updating the plan
- Commit the plan document to the branch (optional but recommended for large changes)

---

## Step 4: Verify

After implementation, run the verification steps from the plan:

```bash
# Validate all contracts
3lens validate all

# Record a trace and verify offline parity
3lens trace:record --duration 10s --out traces/verify.json
3lens trace:open traces/verify.json

# If performance-related
3lens query top_hotspots --window 120f
```

Then review with the code-reviewer agent (use "harsh mode" for architectural changes).

---

## Related Resources

- Contracts: `.cursor/contracts/`
- Code Reviewer: `.cursor/agents/code-reviewer.md`
- Bug Fixer: `.cursor/agents/bug-fixer.md`
- Worktrees: `.cursor/README.md`
