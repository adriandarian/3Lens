# Commands

CLI command documentation for 3Lens operations.

## Command Categories

### Trace Operations

- **[trace-record.md](trace-record.md)** - Record traces for debugging/baseline comparison
- **[trace-open.md](trace-open.md)** - Open saved traces for analysis
- **[diff.md](diff.md)** - Compare traces and frames to detect changes

### Query Operations

- **[query-hotspots.md](query-hotspots.md)** - Find top performance hotspots
- **[query-leaks.md](query-leaks.md)** - Detect memory leaks
- **[query-shader-variants.md](query-shader-variants.md)** - Analyze shader variants
- **[query-resource-usage.md](query-resource-usage.md)** - Query resource usage

### Inspection

- **[inspect.md](inspect.md)** - Inspect entities to answer the 5 Inspector questions

### Scaffold Operations

- **[scaffold-panel.md](scaffold-panel.md)** - Generate panel boilerplate
- **[scaffold-probe.md](scaffold-probe.md)** - Generate probe boilerplate
- **[scaffold-host.md](scaffold-host.md)** - Generate host boilerplate
- **[scaffold-plugin.md](scaffold-plugin.md)** - Generate addon boilerplate
- **[scaffold-query.md](scaffold-query.md)** - Generate query boilerplate
- **[scaffold-mount.md](scaffold-mount.md)** - Generate mount kit boilerplate

### Validation & Testing

- **[validate-contracts.md](validate-contracts.md)** - Validate code against contracts
- **[test-contracts.md](test-contracts.md)** - Run contract compliance tests

### Diagnostics

- **[doctor.md](doctor.md)** - Run diagnostics to check environment and tooling

## Quick Reference

| Command | Purpose | Skill |
|---------|---------|-------|
| `3lens trace:record` | Record trace | trace-operations |
| `3lens trace:open` | Open trace | trace-operations |
| `3lens diff` | Compare traces | diff-operations |
| `3lens query top_hotspots` | Find hotspots | query-operations |
| `3lens query leaks` | Detect leaks | query-operations |
| `3lens inspect` | Inspect entity | inspector-operations |
| `3lens scaffold panel` | Create panel | scaffold-operations |
| `3lens scaffold host` | Create host | scaffold-operations |
| `3lens validate contracts` | Validate contracts | validation-operations |
| `3lens test contracts` | Test contracts | testing-operations |
| `3lens doctor` | Run diagnostics | doctor-operations |

## Command Structure

All command docs follow this structure:

1. **Usage** - Command syntax
2. **Parameters** - Options and flags
3. **Examples** - Common usage patterns
4. **Output Format** - Expected output structure
5. **See Also** - Related skills, agents, contracts

## Related Resources

- Skills: [../skills/](../skills/)
- Agents: [../agents/](../agents/)
- Contracts: [../../agents/contracts/](../../agents/contracts/)