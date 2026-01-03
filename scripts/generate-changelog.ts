#!/usr/bin/env npx ts-node

/**
 * Changelog Generator for 3Lens
 *
 * Generates a changelog based on conventional commits since the last tag.
 * Supports both full changelog generation and release notes for a specific version.
 *
 * Usage:
 *   pnpm changelog              # Generate full CHANGELOG.md
 *   pnpm changelog:release      # Generate release notes for current version
 *   pnpm changelog:preview      # Preview changelog without writing
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface Commit {
  hash: string;
  type: string;
  scope: string | null;
  subject: string;
  body: string;
  breaking: boolean;
  issues: string[];
  pr: string | null;
}

interface ChangelogSection {
  title: string;
  emoji: string;
  types: string[];
  commits: Commit[];
}

const COMMIT_TYPES: Record<string, { title: string; emoji: string }> = {
  feat: { title: 'Features', emoji: '✨' },
  fix: { title: 'Bug Fixes', emoji: '🐛' },
  perf: { title: 'Performance Improvements', emoji: '⚡' },
  refactor: { title: 'Code Refactoring', emoji: '♻️' },
  docs: { title: 'Documentation', emoji: '📚' },
  test: { title: 'Tests', emoji: '✅' },
  build: { title: 'Build System', emoji: '📦' },
  ci: { title: 'CI/CD', emoji: '🔧' },
  chore: { title: 'Chores', emoji: '🔨' },
  style: { title: 'Styles', emoji: '💄' },
  revert: { title: 'Reverts', emoji: '⏪' },
};

const PACKAGES = [
  '@3lens/core',
  '@3lens/overlay',
  '@3lens/ui',
  '@3lens/react-bridge',
  '@3lens/angular-bridge',
  '@3lens/vue-bridge',
];

function exec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
}

function getLastTag(): string | null {
  const tag = exec('git describe --tags --abbrev=0 2>/dev/null');
  return tag || null;
}

function getAllTags(): string[] {
  const tags = exec('git tag --sort=-version:refname');
  return tags ? tags.split('\n').filter(Boolean) : [];
}

function getCommitsSince(since?: string): string[] {
  const range = since ? `${since}..HEAD` : 'HEAD';
  const format = '%H|%s|%b|%D';
  const log = exec(`git log ${range} --format="${format}" --no-merges`);
  return log ? log.split('\n').filter(Boolean) : [];
}

function parseCommit(raw: string): Commit | null {
  const [hash, subject, body = '', refs = ''] = raw.split('|');

  // Parse conventional commit format: type(scope): subject
  const conventionalMatch = subject.match(/^(\w+)(?:\(([^)]+)\))?!?:\s*(.+)$/);

  if (!conventionalMatch) {
    // Not a conventional commit, categorize as 'chore'
    return {
      hash: hash.substring(0, 7),
      type: 'chore',
      scope: null,
      subject: subject,
      body,
      breaking: false,
      issues: extractIssues(subject + ' ' + body),
      pr: extractPR(refs),
    };
  }

  const [, type, scope, message] = conventionalMatch;
  const breaking = subject.includes('!:') || body.toLowerCase().includes('breaking change');

  return {
    hash: hash.substring(0, 7),
    type: type.toLowerCase(),
    scope: scope || null,
    subject: message,
    body,
    breaking,
    issues: extractIssues(subject + ' ' + body),
    pr: extractPR(refs),
  };
}

function extractIssues(text: string): string[] {
  const matches = text.match(/#(\d+)/g);
  return matches ? [...new Set(matches)] : [];
}

function extractPR(refs: string): string | null {
  const match = refs.match(/pull\/(\d+)/);
  return match ? `#${match[1]}` : null;
}

function groupCommitsByType(commits: Commit[]): Map<string, Commit[]> {
  const groups = new Map<string, Commit[]>();

  for (const commit of commits) {
    const type = COMMIT_TYPES[commit.type] ? commit.type : 'chore';
    if (!groups.has(type)) {
      groups.set(type, []);
    }
    groups.get(type)!.push(commit);
  }

  return groups;
}

function groupCommitsByScope(commits: Commit[]): Map<string | null, Commit[]> {
  const groups = new Map<string | null, Commit[]>();

  for (const commit of commits) {
    const scope = commit.scope;
    if (!groups.has(scope)) {
      groups.set(scope, []);
    }
    groups.get(scope)!.push(commit);
  }

  return groups;
}

function formatCommit(commit: Commit, repoUrl: string): string {
  let line = `- `;

  if (commit.scope) {
    line += `**${commit.scope}:** `;
  }

  line += commit.subject;

  // Add commit hash link
  line += ` ([${commit.hash}](${repoUrl}/commit/${commit.hash}))`;

  // Add PR link if available
  if (commit.pr) {
    line += ` (${commit.pr})`;
  }

  // Add issue links
  if (commit.issues.length > 0) {
    const issueLinks = commit.issues.map((i) => `[${i}](${repoUrl}/issues/${i.slice(1)})`);
    line += `, closes ${issueLinks.join(', ')}`;
  }

  return line;
}

function generateVersionChangelog(
  version: string,
  date: string,
  commits: Commit[],
  repoUrl: string
): string {
  const lines: string[] = [];

  lines.push(`## [${version}](${repoUrl}/releases/tag/v${version}) (${date})`);
  lines.push('');

  // Breaking changes section
  const breakingCommits = commits.filter((c) => c.breaking);
  if (breakingCommits.length > 0) {
    lines.push('### ⚠️ BREAKING CHANGES');
    lines.push('');
    for (const commit of breakingCommits) {
      lines.push(formatCommit(commit, repoUrl));
      if (commit.body) {
        const breakingNote = commit.body
          .split('\n')
          .find((l) => l.toLowerCase().includes('breaking change'));
        if (breakingNote) {
          lines.push(`  > ${breakingNote.replace(/breaking change:?\s*/i, '')}`);
        }
      }
    }
    lines.push('');
  }

  // Group by type
  const groupedByType = groupCommitsByType(commits);

  // Order: feat, fix, perf, refactor, docs, test, build, ci, chore
  const typeOrder = ['feat', 'fix', 'perf', 'refactor', 'docs', 'test', 'build', 'ci', 'chore'];

  for (const type of typeOrder) {
    const typeCommits = groupedByType.get(type);
    if (!typeCommits || typeCommits.length === 0) continue;

    const typeInfo = COMMIT_TYPES[type];
    lines.push(`### ${typeInfo.emoji} ${typeInfo.title}`);
    lines.push('');

    // Group by scope within type
    const groupedByScope = groupCommitsByScope(typeCommits);
    const scopes = Array.from(groupedByScope.keys()).sort((a, b) => {
      if (a === null) return 1;
      if (b === null) return -1;
      return a.localeCompare(b);
    });

    for (const scope of scopes) {
      const scopeCommits = groupedByScope.get(scope)!;
      for (const commit of scopeCommits) {
        lines.push(formatCommit(commit, repoUrl));
      }
    }

    lines.push('');
  }

  return lines.join('\n');
}

function generateFullChangelog(repoUrl: string): string {
  const lines: string[] = [];

  lines.push('# Changelog');
  lines.push('');
  lines.push('All notable changes to this project will be documented in this file.');
  lines.push('');
  lines.push(
    'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),'
  );
  lines.push('and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).');
  lines.push('');

  const tags = getAllTags();

  if (tags.length === 0) {
    // No tags yet, generate unreleased section
    const commits = getCommitsSince()
      .map(parseCommit)
      .filter((c): c is Commit => c !== null);

    if (commits.length > 0) {
      lines.push('## [Unreleased]');
      lines.push('');
      const content = generateVersionChangelog('Unreleased', 'TBD', commits, repoUrl);
      // Skip the header since we already added it
      lines.push(content.split('\n').slice(2).join('\n'));
    }
  } else {
    // Generate unreleased section
    const unreleasedCommits = getCommitsSince(tags[0])
      .map(parseCommit)
      .filter((c): c is Commit => c !== null);

    if (unreleasedCommits.length > 0) {
      lines.push('## [Unreleased]');
      lines.push('');
      const content = generateVersionChangelog('Unreleased', 'TBD', unreleasedCommits, repoUrl);
      lines.push(content.split('\n').slice(2).join('\n'));
    }

    // Generate sections for each tag
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      const prevTag = tags[i + 1];
      const version = tag.replace(/^v/, '');
      const date = exec(`git log -1 --format=%cs ${tag}`);

      const commits = getCommitsSince(prevTag)
        .map(parseCommit)
        .filter((c): c is Commit => c !== null);

      if (commits.length > 0) {
        lines.push(generateVersionChangelog(version, date, commits, repoUrl));
      }
    }
  }

  return lines.join('\n');
}

function generateReleaseNotes(version: string, repoUrl: string): string {
  const lastTag = getLastTag();
  const commits = getCommitsSince(lastTag)
    .map(parseCommit)
    .filter((c): c is Commit => c !== null);

  const date = new Date().toISOString().split('T')[0];

  const lines: string[] = [];
  lines.push(`# 🎉 3Lens v${version}`);
  lines.push('');
  lines.push(generateVersionChangelog(version, date, commits, repoUrl).split('\n').slice(2).join('\n'));

  // Add packages section
  lines.push('## 📦 Packages');
  lines.push('');
  lines.push('| Package | Version |');
  lines.push('|---------|---------|');
  for (const pkg of PACKAGES) {
    lines.push(`| \`${pkg}\` | ${version} |`);
  }
  lines.push('');

  // Add installation section
  lines.push('## 🚀 Installation');
  lines.push('');
  lines.push('```bash');
  lines.push('# Core package');
  lines.push(`npm install @3lens/core@${version}`);
  lines.push('');
  lines.push('# With overlay UI');
  lines.push(`npm install @3lens/overlay@${version}`);
  lines.push('');
  lines.push('# Framework bridges (optional)');
  lines.push(`npm install @3lens/react-bridge@${version}`);
  lines.push(`npm install @3lens/vue-bridge@${version}`);
  lines.push(`npm install @3lens/angular-bridge@${version}`);
  lines.push('```');
  lines.push('');

  return lines.join('\n');
}

// Main execution
const args = process.argv.slice(2);
const repoUrl = 'https://github.com/adriandarian/3Lens';

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
3Lens Changelog Generator

Usage:
  npx ts-node scripts/generate-changelog.ts [options]

Options:
  --release <version>  Generate release notes for a specific version
  --preview           Preview without writing to file
  --output <file>     Output file (default: CHANGELOG.md)
  --help, -h          Show this help message

Examples:
  npx ts-node scripts/generate-changelog.ts
  npx ts-node scripts/generate-changelog.ts --release 1.0.0
  npx ts-node scripts/generate-changelog.ts --preview
`);
  process.exit(0);
}

const preview = args.includes('--preview');
const releaseIndex = args.indexOf('--release');
const outputIndex = args.indexOf('--output');

if (releaseIndex !== -1) {
  const version = args[releaseIndex + 1];
  if (!version) {
    console.error('Error: --release requires a version argument');
    process.exit(1);
  }

  const releaseNotes = generateReleaseNotes(version, repoUrl);

  if (preview) {
    console.log(releaseNotes);
  } else {
    const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : 'RELEASE_NOTES.md';
    fs.writeFileSync(outputFile, releaseNotes);
    console.log(`Release notes written to ${outputFile}`);
  }
} else {
  const changelog = generateFullChangelog(repoUrl);

  if (preview) {
    console.log(changelog);
  } else {
    const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : 'CHANGELOG.md';
    fs.writeFileSync(outputFile, changelog);
    console.log(`Changelog written to ${outputFile}`);
  }
}
