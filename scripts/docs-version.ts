#!/usr/bin/env ts-node
/**
 * 3Lens Documentation Version Manager
 * 
 * This script manages documentation versions for the VitePress site.
 * 
 * Commands:
 *   pnpm docs:version create <version>  - Create a new version from current docs
 *   pnpm docs:version list              - List all available versions
 *   pnpm docs:version set-current <ver> - Set a version as current
 * 
 * Examples:
 *   pnpm docs:version create v1.0
 *   pnpm docs:version create v2.0-beta
 *   pnpm docs:version list
 */

import * as fs from 'fs'
import * as path from 'path'

const DOCS_DIR = path.join(process.cwd(), 'docs')
const VERSIONS_DIR = path.join(DOCS_DIR, 'versions')
const VERSIONS_CONFIG = path.join(DOCS_DIR, '.vitepress', 'versions.ts')

interface DocVersion {
  label: string
  path: string
  current?: boolean
  date?: string
  status?: 'stable' | 'beta' | 'alpha' | 'deprecated'
  releaseNotes?: string
}

// Directories to copy when creating a version snapshot
const COPY_DIRS = ['guide', 'api', 'examples', 'packages']
// Files to copy
const COPY_FILES = ['index.md', 'changelog.md', 'contributing.md', 'architecture.md']

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function copyRecursive(src: string, dest: string): void {
  if (!fs.existsSync(src)) return
  
  const stats = fs.statSync(src)
  
  if (stats.isDirectory()) {
    ensureDir(dest)
    const entries = fs.readdirSync(src)
    for (const entry of entries) {
      // Skip .vitepress, node_modules, and hidden files
      if (entry.startsWith('.') || entry === 'node_modules' || entry === 'versions') {
        continue
      }
      copyRecursive(path.join(src, entry), path.join(dest, entry))
    }
  } else if (stats.isFile()) {
    fs.copyFileSync(src, dest)
  }
}

function createVersion(version: string): void {
  // Normalize version name
  const versionName = version.startsWith('v') ? version : `v${version}`
  const versionPath = path.join(VERSIONS_DIR, versionName)
  
  if (fs.existsSync(versionPath)) {
    console.error(`❌ Version ${versionName} already exists at ${versionPath}`)
    process.exit(1)
  }
  
  console.log(`📦 Creating documentation version: ${versionName}`)
  
  // Create version directory
  ensureDir(versionPath)
  
  // Copy directories
  for (const dir of COPY_DIRS) {
    const srcDir = path.join(DOCS_DIR, dir)
    const destDir = path.join(versionPath, dir)
    if (fs.existsSync(srcDir)) {
      console.log(`  📁 Copying ${dir}/...`)
      copyRecursive(srcDir, destDir)
    }
  }
  
  // Copy files
  for (const file of COPY_FILES) {
    const srcFile = path.join(DOCS_DIR, file)
    const destFile = path.join(versionPath, file)
    if (fs.existsSync(srcFile)) {
      console.log(`  📄 Copying ${file}`)
      fs.copyFileSync(srcFile, destFile)
    }
  }
  
  // Update internal links in the copied docs
  console.log(`  🔗 Updating internal links...`)
  updateLinks(versionPath, `/versions/${versionName}`)
  
  console.log(`\n✅ Version ${versionName} created successfully!`)
  console.log(`\n📝 Next steps:`)
  console.log(`   1. Update docs/.vitepress/versions.ts to add the new version`)
  console.log(`   2. Set the appropriate status (stable, beta, alpha, deprecated)`)
  console.log(`   3. Commit and push the changes`)
}

function updateLinks(dir: string, basePath: string): void {
  const entries = fs.readdirSync(dir)
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    const stats = fs.statSync(fullPath)
    
    if (stats.isDirectory()) {
      updateLinks(fullPath, basePath)
    } else if (entry.endsWith('.md')) {
      let content = fs.readFileSync(fullPath, 'utf-8')
      
      // Update absolute links to point to versioned path
      // Match links like [text](/guide/...) but not external URLs
      content = content.replace(
        /\]\(\/(?!http|https|mailto|versions)([\w/-]+)\)/g,
        `](${basePath}/$1)`
      )
      
      fs.writeFileSync(fullPath, content, 'utf-8')
    }
  }
}

function listVersions(): void {
  console.log('📚 Available Documentation Versions:\n')
  
  // Read versions from config
  if (fs.existsSync(VERSIONS_CONFIG)) {
    const configContent = fs.readFileSync(VERSIONS_CONFIG, 'utf-8')
    
    // Simple regex to extract version info (not a full parser)
    const versionRegex = /label:\s*['"]([^'"]+)['"]/g
    const matches = [...configContent.matchAll(versionRegex)]
    
    if (matches.length > 0) {
      matches.forEach((match, i) => {
        console.log(`  ${i === 0 ? '→' : ' '} ${match[1]}`)
      })
    }
  }
  
  // List version directories
  if (fs.existsSync(VERSIONS_DIR)) {
    const versionDirs = fs.readdirSync(VERSIONS_DIR)
    if (versionDirs.length > 0) {
      console.log('\n📁 Archived versions in /docs/versions/:')
      versionDirs.forEach(v => {
        console.log(`    ${v}/`)
      })
    }
  } else {
    console.log('\n📁 No archived versions yet.')
  }
}

function printHelp(): void {
  console.log(`
🔧 3Lens Documentation Version Manager

Usage:
  pnpm docs:version <command> [options]

Commands:
  create <version>    Create a new version snapshot from current docs
  list               List all available versions
  help               Show this help message

Examples:
  pnpm docs:version create v1.0
  pnpm docs:version create v2.0-beta
  pnpm docs:version list

Version Format:
  - Versions should follow semver: v1.0, v1.1, v2.0
  - Add suffix for pre-releases: v2.0-beta, v2.0-alpha
  - The 'v' prefix is optional (will be added automatically)
`)
}

// Main CLI
const args = process.argv.slice(2)
const command = args[0]

switch (command) {
  case 'create':
    if (!args[1]) {
      console.error('❌ Please specify a version name: pnpm docs:version create <version>')
      process.exit(1)
    }
    createVersion(args[1])
    break
    
  case 'list':
    listVersions()
    break
    
  case 'help':
  case '--help':
  case '-h':
    printHelp()
    break
    
  default:
    if (command) {
      console.error(`❌ Unknown command: ${command}`)
    }
    printHelp()
    process.exit(command ? 1 : 0)
}
