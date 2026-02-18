# Command: Harsh Code Review

Invoke the code-reviewer agent in **Harsh Mode** — acts as a strict senior engineer who demands proof and doesn't spare feelings.

## When to Use

- Before merging architectural changes
- When you want an unsparing critique, not encouragement
- To pressure-test a design decision
- When you suspect something is wrong but can't pinpoint it

## Usage

Provide your changes (diff, file paths, or paste the code), then use one of these trigger phrases:

```
Grill me on these changes.
```

```
Prove this works in both live and offline modes.
```

```
Scrap this and implement an elegant version.
```

```
Harsh review — don't spare me.
```

## What to Expect

The reviewer will:

1. Challenge every design decision — "why not simpler?"
2. Demand proof of offline trace parity
3. Reject vague attribution (require specific entity IDs + weights)
4. Hard-fail any missing fidelity labels
5. Suggest a rewrite if complexity is unjustified
6. Not approve until the entire PR checklist is green

## Output

Same format as normal review, plus a **Harsh Assessment** section at the top summarizing the verdict.

## Related

- Agent: `.cursor/agents/code-reviewer.md`
- PR Checklist: see "Code Review Checklist" in the agent file
- Contracts: `.cursor/contracts/`
