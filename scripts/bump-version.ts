#!/usr/bin/env node

/**
 * Version Bump Script for 3Lens
 *
 * Synchronizes version across all packages in the monorepo.
 *
 * Usage:
 *   pnpm version:bump <version>   # Set specific version
 *   pnpm version:bump patch       # Bump patch version
 *   pnpm version:bump minor       # Bump minor version
 *   pnpm version:bump major       # Bump major version
 *   pnpm version:bump prerelease  # Add/bump prerelease
 */

import * as fs from 'fs';
import * as path from 'path';

const PACKAGES = [
  'packages/core',
  'packages/ui',
  'packages/overlay',
  'packages/react-bridge',
  'packages/angular-bridge',
  'packages/vue-bridge',
];

interface PackageJson {
  name: string;
  version: string;
  [key: string]: unknown;
}

function readPackageJson(pkgPath: string): PackageJson {
  const fullPath = path.join(process.cwd(), pkgPath, 'package.json');
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

function writePackageJson(pkgPath: string, pkg: PackageJson): void {
  const fullPath = path.join(process.cwd(), pkgPath, 'package.json');
  fs.writeFileSync(fullPath, JSON.stringify(pkg, null, 2) + '\n');
}

function getCurrentVersion(): string {
  const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  if (rootPkg.version && rootPkg.version !== '0.0.0') {
    return rootPkg.version;
  }
  // Fall back to core package version
  const corePkg = readPackageJson('packages/core');
  return corePkg.version;
}

function parseVersion(version: string): { major: number; minor: number; patch: number; prerelease: string | null } {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null,
  };
}

function formatVersion(v: { major: number; minor: number; patch: number; prerelease: string | null }): string {
  const base = `${v.major}.${v.minor}.${v.patch}`;
  return v.prerelease ? `${base}-${v.prerelease}` : base;
}

function bumpVersion(current: string, type: string): string {
  const v = parseVersion(current);

  switch (type) {
    case 'major':
      return formatVersion({ major: v.major + 1, minor: 0, patch: 0, prerelease: null });
    case 'minor':
      return formatVersion({ major: v.major, minor: v.minor + 1, patch: 0, prerelease: null });
    case 'patch':
      return formatVersion({ major: v.major, minor: v.minor, patch: v.patch + 1, prerelease: null });
    case 'prerelease':
      if (v.prerelease) {
        // Bump existing prerelease
        const match = v.prerelease.match(/^(.+)\.(\d+)$/);
        if (match) {
          return formatVersion({ ...v, prerelease: `${match[1]}.${parseInt(match[2], 10) + 1}` });
        }
        return formatVersion({ ...v, prerelease: `${v.prerelease}.1` });
      }
      // Add new prerelease
      return formatVersion({ ...v, patch: v.patch + 1, prerelease: 'alpha.1' });
    default:
      // Assume it's a specific version
      parseVersion(type); // Validate format
      return type;
  }
}

function updateWorkspaceDependencies(pkg: PackageJson, newVersion: string): PackageJson {
  const updated = { ...pkg };

  for (const depType of ['dependencies', 'devDependencies', 'peerDependencies'] as const) {
    const deps = updated[depType] as Record<string, string> | undefined;
    if (deps) {
      for (const [name, version] of Object.entries(deps)) {
        if (name.startsWith('@3lens/') && version === 'workspace:*') {
          // Keep workspace:* for local development
          // The publish process will replace these
        }
      }
    }
  }

  return updated;
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
3Lens Version Bump Script

Usage:
  npx ts-node scripts/bump-version.ts <version|type>

Arguments:
  version    Specific version (e.g., 1.0.0, 1.0.0-beta.1)
  type       Version bump type: major, minor, patch, prerelease

Examples:
  npx ts-node scripts/bump-version.ts 1.0.0
  npx ts-node scripts/bump-version.ts patch
  npx ts-node scripts/bump-version.ts minor
  npx ts-node scripts/bump-version.ts prerelease

Options:
  --dry-run  Show changes without writing
  --help     Show this help message
`);
  process.exit(0);
}

const dryRun = args.includes('--dry-run');
const versionArg = args.find((a) => !a.startsWith('--'));

if (!versionArg) {
  console.error('Error: Please specify a version or bump type');
  process.exit(1);
}

const currentVersion = getCurrentVersion();
const newVersion = bumpVersion(currentVersion, versionArg);

console.log(`\n📦 3Lens Version Bump\n`);
console.log(`  Current: ${currentVersion}`);
console.log(`  New:     ${newVersion}`);
console.log(`  Mode:    ${dryRun ? 'Dry Run' : 'Live'}\n`);

// Update root package.json
const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
rootPkg.version = newVersion;

if (!dryRun) {
  fs.writeFileSync('package.json', JSON.stringify(rootPkg, null, 2) + '\n');
  console.log(`  ✅ Updated package.json`);
} else {
  console.log(`  📝 Would update package.json`);
}

// Update all workspace packages
for (const pkgPath of PACKAGES) {
  const pkg = readPackageJson(pkgPath);
  const oldVersion = pkg.version;
  pkg.version = newVersion;

  const updated = updateWorkspaceDependencies(pkg, newVersion);

  if (!dryRun) {
    writePackageJson(pkgPath, updated);
    console.log(`  ✅ Updated ${pkg.name}: ${oldVersion} → ${newVersion}`);
  } else {
    console.log(`  📝 Would update ${pkg.name}: ${oldVersion} → ${newVersion}`);
  }
}

console.log(`\n✨ Version bump complete!\n`);

if (!dryRun) {
  console.log(`Next steps:`);
  console.log(`  1. Review changes: git diff`);
  console.log(`  2. Commit: git commit -am "chore: bump version to ${newVersion}"`);
  console.log(`  3. Push and trigger release workflow`);
}
