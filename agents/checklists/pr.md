# Pull Request Checklist

Use this checklist for every PR to ensure contract compliance and consistency.

## Contract Compliance

### Which contract(s) does this change touch?

- [ ] capture
- [ ] entity-graph
- [ ] attribution
- [ ] fidelity
- [ ] runtime-boundaries
- [ ] overhead
- [ ] inspector
- [ ] shader-graph
- [ ] transport
- [ ] ui-surfaces
- [ ] discovery
- [ ] pipelines
- [ ] loading
- [ ] compatibility
- [ ] storage
- [ ] addons
- [ ] security-csp

### Contract Verification

- [ ] I have read the relevant contract(s)
- [ ] This change does not violate any invariants
- [ ] Acceptance tests pass for touched contracts

## Technical Requirements

### Entities

- [ ] Entities impacted: _____________
- [ ] New entity types added: _____________
- [ ] Entity IDs are stable and namespaced (`context:type:localId`)

### Queries

- [ ] Queries used: _____________
- [ ] New queries added: _____________
- [ ] Query names are namespaced (for addons)

### Actions/Commands

- [ ] Actions added/changed: _____________
- [ ] Actions are reversible (if applicable)
- [ ] Actions produce measurable delta

### Attribution

- [ ] Attribution path exists (metrics -> culprit entity): [ ] Yes [ ] N/A
- [ ] Blame chains include weights
- [ ] No orphan metrics without attribution

### Fidelity

- [ ] All new metrics have fidelity indicators
- [ ] ESTIMATED data is clearly labeled
- [ ] UNAVAILABLE data shows reason

### Live + Offline Parity

- [ ] Works with live sessions
- [ ] Works with offline traces
- [ ] If not, explain why: _____________

## Code Quality

### Architecture

- [ ] No framework code in kernel
- [ ] No UI code in hosts
- [ ] Public API only (no internal imports)

### Testing

- [ ] Unit tests added/updated
- [ ] Contract tests added/updated
- [ ] Regression tests added (if applicable)

### Documentation

- [ ] README updated (if applicable)
- [ ] JSDoc comments added
- [ ] Playbook updated (if applicable)

## Final Checks

- [ ] `pnpm test` passes
- [ ] `pnpm validate` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes

## Reviewer Notes

_Add any additional context for reviewers:_

---

## Quick Copy Template

```
## Contracts Touched
- [ contract name ]

## Changes
- What: 
- Why: 
- How: 

## Testing
- [ ] Unit tests
- [ ] Contract tests
- [ ] Manual testing

## Checklist
- [ ] Attribution paths exist
- [ ] Fidelity indicators present
- [ ] Works offline
- [ ] Tests pass
```
