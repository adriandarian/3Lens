#!/usr/bin/env node
/**
 * Clean start script for VitePress dev server
 * Clears cache and ensures no locks before starting
 */

import { existsSync, rmSync, readdirSync, statSync, renameSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const cacheDir = join(rootDir, 'docs', '.vitepress', 'cache');

console.log('🧹 Cleaning VitePress cache...');

// Kill any existing node/vitepress processes
console.log('   Checking for running VitePress processes...');

// Check common VitePress ports (5173, 5174, etc.)
const portsToCheck = [5173, 5174, 5175];
const pidsToKill = new Set();

for (const port of portsToCheck) {
  try {
    const netstatOutput = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: 'pipe' });
    const lines = netstatOutput.split('\n').filter(line => line.includes('LISTENING'));
    for (const line of lines) {
      const match = line.match(/\s+(\d+)$/);
      if (match) {
        pidsToKill.add(match[1]);
      }
    }
  } catch (e) {
    // No processes found on this port, that's fine
  }
}

// Also try to find node processes that might be holding the cache
try {
  const tasklistOutput = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', { encoding: 'utf8', stdio: 'pipe' });
  // Check if any node processes are running vitepress
  // We'll be conservative and only kill processes on the ports we checked
} catch (e) {
  // Can't check, continue
}

// Kill all found processes
for (const pid of pidsToKill) {
  console.log(`   Stopping process ${pid}...`);
  try {
    execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' });
  } catch (e) {
    // Process might already be gone
  }
}

if (pidsToKill.size === 0) {
  console.log('   ✓ No running processes found');
}

// Wait longer for processes to fully terminate and locks to be released
console.log('   Waiting for processes to terminate...');
await new Promise(resolve => setTimeout(resolve, 3000));

// Try to kill any node processes that might be holding the cache
try {
  console.log('   Checking for node processes holding cache...');
  const tasklistOutput = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', { encoding: 'utf8', stdio: 'pipe' });
  const lines = tasklistOutput.split('\n').filter(line => line.trim() && !line.includes('PID'));
  // Don't kill all node processes, just log them for user awareness
  if (lines.length > 0) {
    console.log(`   Found ${lines.length} node process(es) - they may need to be closed manually`);
  }
} catch (e) {
  // Can't check, continue
}

// Remove cache directory with improved Windows handling
if (existsSync(cacheDir)) {
  let retries = 0;
  const maxRetries = 10;
  const retryDelay = 1000;
  
  while (retries < maxRetries) {
    try {
      // Try to remove the specific problematic temp directories first
      // This addresses the EBUSY rename error by cleaning up temp dirs before they're renamed
      try {
        const entries = readdirSync(cacheDir);
        for (const entry of entries) {
          if (entry.startsWith('deps_temp_') || entry === 'deps') {
            const entryPath = join(cacheDir, entry);
            try {
              const stats = statSync(entryPath);
              if (stats.isDirectory()) {
                // Try to remove contents first, then the directory
                try {
                  rmSync(entryPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
                } catch (e) {
                  // If removal fails, try renaming it to mark for deletion
                  try {
                    const tempName = `${entryPath}.deleted.${Date.now()}`;
                    renameSync(entryPath, tempName);
                    // Try to remove the renamed directory
                    setTimeout(() => {
                      try {
                        rmSync(tempName, { recursive: true, force: true });
                      } catch (e2) {
                        // Ignore - will be cleaned up later
                      }
                    }, 100);
                  } catch (e2) {
                    // Can't rename either, continue
                  }
                }
              } else {
                rmSync(entryPath, { force: true, maxRetries: 3, retryDelay: 200 });
              }
            } catch (e) {
              // Individual entry failed, continue
            }
          }
        }
      } catch (e) {
        // Can't read directory, try removing whole thing
      }
      
      // Now try to remove the entire cache directory
      rmSync(cacheDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
      console.log('   ✓ Cache cleared');
      break;
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        console.warn(`   ⚠ Could not fully clear cache after ${maxRetries} attempts: ${error.message}`);
        console.warn('');
        console.warn('   Troubleshooting steps:');
        console.warn('   1. Close any editors (VS Code, etc.) that might have the cache open');
        console.warn('   2. Close any file explorer windows showing the cache directory');
        console.warn('   3. Restart your terminal/command prompt');
        console.warn('   4. Manually delete: docs\\.vitepress\\cache');
        console.warn('   5. If antivirus is scanning the directory, temporarily disable it');
        console.warn('');
        console.warn('   The dev server will still attempt to start...');
        // Don't exit - let VitePress try to start anyway
      } else {
        console.log(`   Retrying cache cleanup (${retries}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
} else {
  console.log('   ✓ No cache to clear');
}

console.log('\n🚀 Starting VitePress dev server...\n');

// Start VitePress with force optimization to clear stale deps
// The --force flag will force Vite to re-optimize dependencies
execSync('pnpm vitepress dev docs --force', { 
  cwd: rootDir, 
  stdio: 'inherit',
  env: { 
    ...process.env,
    // Force Vite to clear optimize cache
    VITE_FORCE_OPTIMIZE: 'true'
  }
});
