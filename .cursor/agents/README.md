# Agents

Specialized subagents for specific tasks in the 3Lens development workflow.

**Core rule: Use a specialized agent instead of describing the task inline. Keeps main context small and answers more focused.**

## Task → Agent Routing

| Task | Agent | Trigger |
|------|-------|---------|
| Fix a bug autonomously | [bug-fixer](bug-fixer.md) | Paste context, say "fix" |
| Review a PR (normal) | [code-reviewer](code-reviewer.md) | "Review my changes" |
| Review a PR (strict) | [code-reviewer](code-reviewer.md) | "Grill me" / "Harsh review" |
| Analyze a trace file | [trace-analyzer](trace-analyzer.md) | Paste trace path |
| Optimize performance | [performance-optimizer](performance-optimizer.md) | Describe bottleneck |
| Onboard / explain codebase | [onboarding-guide](onboarding-guide.md) | "Where do I find X?" |
| Learn a 3Lens concept | [onboarding-guide](onboarding-guide.md) | "Explain X from scratch" |
| Write tests | [test-generator](test-generator.md) | Describe what to test |
| Upgrade versions / migrate APIs | [migration-assistant](migration-assistant.md) | Describe version change |

## Available Agents

### Bug Fixing

- **[bug-fixer.md](bug-fixer.md)** - Autonomous end-to-end bug fixer
  - Use when: You have a bug report, CI failure, logs, or a trace and want it fixed with minimal supervision
  - Process: Diagnose → Plan → Fix → Verify

### Validation & Review

- **[code-reviewer.md](code-reviewer.md)** - PR review with architectural awareness
  - Use when: Reviewing pull requests, checking code quality, ensuring architectural compliance
  - Modes: Normal (constructive) or Harsh ("Grill me" / "Prove this works")
  - Checks: Dependency violations, contract compliance, anti-patterns, code quality

### Workflow Guidance

- **[onboarding-guide.md](onboarding-guide.md)** - Help new contributors navigate and learn
  - Use when: Onboarding new team members, explaining project structure, learning 3Lens concepts
  - Provides: Project structure, architecture explanation, file locations, learning mode

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
- Playbooks: [../playbooks/](../playbooks/)
- Contracts: [../contracts/](../contracts/)