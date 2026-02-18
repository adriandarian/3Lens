# Skills

Detailed skill documentation for specialized 3Lens operations.

## Skill Categories

### Core Operations

- **[analytics-operations/SKILL.md](analytics-operations/SKILL.md)** - Interpret and act on query/diff output
  - Use when: Analyzing `3lens query` or `3lens diff` output, validating attribution chains, ad-hoc regression exploration

- **[diff-operations/SKILL.md](diff-operations/SKILL.md)** - Compare traces and frames
  - Use when: Comparing before/after states, detecting regressions, analyzing changes

- **[doctor-operations/SKILL.md](doctor-operations/SKILL.md)** - Diagnose project and tooling issues
  - Use when: Troubleshooting setup problems, checking compatibility, generating diagnostics

- **[inspector-operations/SKILL.md](inspector-operations/SKILL.md)** - Navigate and inspect entities
  - Use when: Examining entities, understanding dependencies, tracing cost attribution

- **[query-operations/SKILL.md](query-operations/SKILL.md)** - Analytical queries
  - Use when: Analyzing performance, finding memory leaks, understanding resource consumption

- **[scaffold-operations/SKILL.md](scaffold-operations/SKILL.md)** - Generate boilerplate code
  - Use when: Creating panels, probes, hosts, or addons

- **[shader-operations/SKILL.md](shader-operations/SKILL.md)** - Introspect shaders and render pipelines
  - Use when: Analyzing shader variants, attributing shader costs, performing shader mutations

- **[trace-operations/SKILL.md](trace-operations/SKILL.md)** - Capture and replay traces
  - Use when: Recording traces, opening/replaying saved traces, exporting trace data

- **[validation-operations/SKILL.md](validation-operations/SKILL.md)** - Validate contracts and run regression tests
  - Use when: Checking contract compliance, validating attribution coverage, running CI validation

### Development Operations

- **[mount-operations/SKILL.md](mount-operations/SKILL.md)** - Framework mount development
  - Use when: Creating mount kits, integrating 3Lens with frameworks, debugging mount issues

- **[ui-operations/SKILL.md](ui-operations/SKILL.md)** - UI Core and Web Components operations
  - Use when: Creating UI panels, integrating UI Core components, debugging UI issues

- **[host-operations/SKILL.md](host-operations/SKILL.md)** - Host development workflows
  - Use when: Creating hosts, debugging host issues, understanding host implementation patterns

- **[testing-operations/SKILL.md](testing-operations/SKILL.md)** - Contract and regression testing
  - Use when: Writing tests, validating contract compliance, creating regression test suites

- **[example-operations/SKILL.md](example-operations/SKILL.md)** - Creating and maintaining examples
  - Use when: Creating example code, documenting features, providing usage demonstrations

## Skill Structure

All skills follow this structure:

1. **When to Use** - Specific scenarios for using the skill
2. **Commands** - CLI commands and usage patterns
3. **Agent Use Cases** - Common agent scenarios
4. **Post-Scaffold Steps** - Next steps after scaffolding
5. **Additional Resources** - Related contracts, playbooks, commands

## Quick Reference

| Operation | Skill | Command |
|-----------|-------|---------|
| Interpret query/diff output | analytics-operations | `3lens query` / `3lens diff` |
| Compare traces | diff-operations | `3lens diff` |
| Diagnose issues | doctor-operations | `3lens doctor` |
| Inspector (runtime) | inspector-operations | UI / client API |
| Query data | query-operations | `3lens query` |
| Scaffold code | scaffold-operations | `3lens scaffold` |
| Analyze shaders | shader-operations | addon-shader |
| Capture traces | trace-operations | `3lens trace:*` |
| Validate contracts | validation-operations | `3lens validate` |
| Create mounts | mount-operations | manual / playbook |
| Create UI | ui-operations | `3lens scaffold panel` |
| Create hosts | host-operations | `3lens scaffold host` |
| Write tests | testing-operations | vitest |
| Create examples | example-operations | manual |

## Related Resources

- Commands: [../commands/](../commands/)
- Agents: [../agents/](../agents/)
- Contracts: [../contracts/](../contracts/)
- Playbooks: [../playbooks/](../playbooks/)