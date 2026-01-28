# Agents

Specialized subagents for specific tasks in the 3Lens development workflow.

## Available Agents

### Validation & Review

- **[contract-validator.md](contract-validator.md)** - Validates code changes against 3Lens contracts
  - Use when: Reviewing PRs, checking contract compliance, validating architectural rules
  - Checks: Contract violations, dependency rules, attribution paths, fidelity labeling

- **[code-reviewer.md](code-reviewer.md)** - PR review with architectural awareness
  - Use when: Reviewing pull requests, checking code quality, ensuring architectural compliance
  - Checks: Dependency violations, contract compliance, anti-patterns, code quality

### Workflow Guidance

- **[playbook-executor.md](playbook-executor.md)** - Guides through structured playbooks
  - Use when: Adding panels, probes, hosts, or plugins
  - Guides: Step-by-step through playbooks, tracks progress, validates completion

- **[onboarding-guide.md](onboarding-guide.md)** - Help new contributors navigate
  - Use when: Onboarding new team members, explaining project structure, answering "where do I find X?"
  - Provides: Project structure, architecture explanation, file locations, common questions

### Analysis & Optimization

- **[trace-analyzer.md](trace-analyzer.md)** - Deep trace analysis
  - Use when: Analyzing trace files, comparing traces, investigating performance issues
  - Analyzes: Performance bottlenecks, memory leaks, hotspots, attribution

- **[performance-optimizer.md](performance-optimizer.md)** - Performance analysis and optimization
  - Use when: Investigating performance issues, optimizing capture overhead, analyzing regressions
  - Analyzes: Bottlenecks, overhead budgets, optimization opportunities, before/after comparisons

### Development Support

- **[migration-assistant.md](migration-assistant.md)** - Version upgrade guidance
  - Use when: Upgrading 3Lens versions, migrating between API versions, handling breaking changes
  - Provides: Migration plans, compatibility checks, step-by-step guidance

- **[test-generator.md](test-generator.md)** - Generate contract and regression tests
  - Use when: Adding new features, ensuring contract compliance, creating regression test suites
  - Generates: Contract compliance tests, regression tests, snapshot tests

## When to Use Which Agent

| Task | Agent |
|------|-------|
| Review PR code | code-reviewer |
| Validate contracts | contract-validator |
| Add a component | playbook-executor |
| Analyze trace | trace-analyzer |
| Optimize performance | performance-optimizer |
| Upgrade version | migration-assistant |
| Write tests | test-generator |
| Navigate codebase | onboarding-guide |

## Agent Patterns

All agents follow consistent patterns:

1. **Role Definition** - Clear description of agent's purpose
2. **When to Use** - Specific scenarios for invocation
3. **Process** - Step-by-step workflow
4. **Output Format** - Structured output format
5. **Key Rules** - Important constraints and requirements
6. **Related Resources** - Links to contracts, playbooks, skills

## Related Resources

- Commands: [../commands/](../commands/)
- Skills: [../skills/](../skills/)
- Playbooks: [../../agents/playbooks/](../../agents/playbooks/)
- Contracts: [../../agents/contracts/](../../agents/contracts/)