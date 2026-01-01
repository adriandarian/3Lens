# CI Integration Guide

This guide covers integrating 3Lens into your continuous integration (CI) pipeline for automated performance testing, regression detection, and quality gates.

## Table of Contents

- [Overview](#overview)
- [Headless Mode](#headless-mode)
- [Performance Benchmarks](#performance-benchmarks)
- [GitHub Actions](#github-actions)
- [GitLab CI](#gitlab-ci)
- [Other CI Systems](#other-ci-systems)
- [Performance Budgets](#performance-budgets)
- [Regression Detection](#regression-detection)
- [Reporting](#reporting)
- [Best Practices](#best-practices)

---

## Overview

3Lens can be used in CI environments to:

- Run automated performance benchmarks
- Enforce performance budgets
- Detect performance regressions
- Generate performance reports
- Validate scene complexity limits

### Prerequisites

- Node.js 18+
- A headless browser (Puppeteer, Playwright)
- Your three.js application with 3Lens integrated

---

## Headless Mode

### Setting Up Headless Testing

3Lens works in headless browser environments. Use Puppeteer or Playwright to run your three.js app and collect metrics.

```typescript
// benchmark.ts
import puppeteer from 'puppeteer';

interface BenchmarkResult {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  triangles: number;
  gpuMemoryMB: number;
  passed: boolean;
  violations: string[];
}

export async function runBenchmark(url: string): Promise<BenchmarkResult> {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu', // Or enable for WebGL testing
      '--use-gl=swiftshader', // Software rendering
    ],
  });

  const page = await browser.newPage();

  // Set viewport for consistent testing
  await page.setViewport({ width: 1920, height: 1080 });

  // Navigate to your app
  await page.goto(url, { waitUntil: 'networkidle0' });

  // Wait for 3Lens to initialize and collect data
  await page.waitForFunction(() => {
    return (window as any).__3LENS_PROBE__?.isReady();
  }, { timeout: 30000 });

  // Let it run for a few seconds to stabilize
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Collect metrics
  const result = await page.evaluate(() => {
    const probe = (window as any).__3LENS_PROBE__;
    const stats = probe.getLatestFrameStats();
    const violations = probe.getRuleViolations();

    return {
      fps: stats?.fps ?? 0,
      frameTimeMs: stats?.frameTimeMs ?? 0,
      drawCalls: stats?.drawCalls ?? 0,
      triangles: stats?.triangles ?? 0,
      gpuMemoryMB: (stats?.memory?.gpuMemoryEstimate ?? 0) / 1024 / 1024,
      violations: violations.map((v: any) => v.message),
    };
  });

  await browser.close();

  return {
    ...result,
    passed: result.violations.length === 0,
  };
}
```

### Exposing the Probe

Make sure your app exposes the probe for headless testing:

```typescript
// In your app initialization
import { createProbe } from '@3lens/core';

const probe = createProbe({
  appName: 'My App',
  rules: {
    maxDrawCalls: 500,
    maxTriangles: 250000,
    maxFrameTimeMs: 16.67,
  },
});

// Expose for CI testing
if (typeof window !== 'undefined') {
  (window as any).__3LENS_PROBE__ = probe;
}
```

---

## Performance Benchmarks

### Benchmark Configuration

```typescript
// benchmark.config.ts
export interface BenchmarkConfig {
  /**
   * URL to test
   */
  url: string;

  /**
   * Warm-up time before measuring (ms)
   */
  warmupTime: number;

  /**
   * Duration to collect metrics (ms)
   */
  measureTime: number;

  /**
   * Number of test iterations
   */
  iterations: number;

  /**
   * Performance thresholds
   */
  thresholds: {
    minFPS: number;
    maxFrameTimeMs: number;
    maxDrawCalls: number;
    maxTriangles: number;
    maxGpuMemoryMB: number;
  };
}

export const defaultConfig: BenchmarkConfig = {
  url: 'http://localhost:3000',
  warmupTime: 3000,
  measureTime: 10000,
  iterations: 3,
  thresholds: {
    minFPS: 55,
    maxFrameTimeMs: 18,
    maxDrawCalls: 500,
    maxTriangles: 250000,
    maxGpuMemoryMB: 512,
  },
};
```

### Running Benchmarks

```typescript
// run-benchmark.ts
import { runBenchmark } from './benchmark';
import { defaultConfig, BenchmarkConfig } from './benchmark.config';

interface BenchmarkSummary {
  iterations: number;
  avgFPS: number;
  minFPS: number;
  maxFPS: number;
  avgFrameTime: number;
  maxFrameTime: number;
  avgDrawCalls: number;
  maxDrawCalls: number;
  avgTriangles: number;
  avgGpuMemoryMB: number;
  passed: boolean;
  failures: string[];
}

export async function runFullBenchmark(
  config: BenchmarkConfig = defaultConfig
): Promise<BenchmarkSummary> {
  const results: Awaited<ReturnType<typeof runBenchmark>>[] = [];

  console.log(`Running ${config.iterations} iterations...`);

  for (let i = 0; i < config.iterations; i++) {
    console.log(`Iteration ${i + 1}/${config.iterations}`);
    const result = await runBenchmark(config.url);
    results.push(result);
  }

  // Calculate summary
  const avgFPS = results.reduce((sum, r) => sum + r.fps, 0) / results.length;
  const minFPS = Math.min(...results.map((r) => r.fps));
  const maxFPS = Math.max(...results.map((r) => r.fps));
  const avgFrameTime = results.reduce((sum, r) => sum + r.frameTimeMs, 0) / results.length;
  const maxFrameTime = Math.max(...results.map((r) => r.frameTimeMs));
  const avgDrawCalls = results.reduce((sum, r) => sum + r.drawCalls, 0) / results.length;
  const maxDrawCalls = Math.max(...results.map((r) => r.drawCalls));
  const avgTriangles = results.reduce((sum, r) => sum + r.triangles, 0) / results.length;
  const avgGpuMemoryMB = results.reduce((sum, r) => sum + r.gpuMemoryMB, 0) / results.length;

  // Check thresholds
  const failures: string[] = [];

  if (minFPS < config.thresholds.minFPS) {
    failures.push(`FPS too low: ${minFPS.toFixed(1)} < ${config.thresholds.minFPS}`);
  }
  if (maxFrameTime > config.thresholds.maxFrameTimeMs) {
    failures.push(`Frame time too high: ${maxFrameTime.toFixed(2)}ms > ${config.thresholds.maxFrameTimeMs}ms`);
  }
  if (maxDrawCalls > config.thresholds.maxDrawCalls) {
    failures.push(`Draw calls too high: ${maxDrawCalls} > ${config.thresholds.maxDrawCalls}`);
  }
  if (avgTriangles > config.thresholds.maxTriangles) {
    failures.push(`Triangle count too high: ${avgTriangles.toFixed(0)} > ${config.thresholds.maxTriangles}`);
  }
  if (avgGpuMemoryMB > config.thresholds.maxGpuMemoryMB) {
    failures.push(`GPU memory too high: ${avgGpuMemoryMB.toFixed(1)}MB > ${config.thresholds.maxGpuMemoryMB}MB`);
  }

  return {
    iterations: config.iterations,
    avgFPS,
    minFPS,
    maxFPS,
    avgFrameTime,
    maxFrameTime,
    avgDrawCalls,
    maxDrawCalls,
    avgTriangles,
    avgGpuMemoryMB,
    passed: failures.length === 0,
    failures,
  };
}

// CLI entry point
async function main() {
  const summary = await runFullBenchmark();

  console.log('\n=== Benchmark Results ===');
  console.log(`FPS: ${summary.avgFPS.toFixed(1)} (min: ${summary.minFPS.toFixed(1)}, max: ${summary.maxFPS.toFixed(1)})`);
  console.log(`Frame Time: ${summary.avgFrameTime.toFixed(2)}ms (max: ${summary.maxFrameTime.toFixed(2)}ms)`);
  console.log(`Draw Calls: ${summary.avgDrawCalls.toFixed(0)} (max: ${summary.maxDrawCalls})`);
  console.log(`Triangles: ${summary.avgTriangles.toLocaleString()}`);
  console.log(`GPU Memory: ${summary.avgGpuMemoryMB.toFixed(1)}MB`);

  if (summary.passed) {
    console.log('\n✅ All performance checks passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Performance checks failed:');
    summary.failures.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
```

---

## GitHub Actions

### Basic Workflow

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  benchmark:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Start server
        run: npm run preview &
        env:
          PORT: 3000

      - name: Wait for server
        run: npx wait-on http://localhost:3000 --timeout 30000

      - name: Run performance benchmark
        run: npm run benchmark

      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: benchmark-results
          path: benchmark-results.json
```

### With Performance Regression Detection

```yaml
# .github/workflows/performance-regression.yml
name: Performance Regression Check

on:
  pull_request:
    branches: [main]

jobs:
  benchmark-base:
    runs-on: ubuntu-latest
    outputs:
      baseline: ${{ steps.baseline.outputs.metrics }}

    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.base_ref }}

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build
      - run: npm run preview &
      - run: npx wait-on http://localhost:3000

      - name: Run baseline benchmark
        id: baseline
        run: |
          METRICS=$(npm run benchmark:json --silent)
          echo "metrics=$METRICS" >> $GITHUB_OUTPUT

  benchmark-pr:
    runs-on: ubuntu-latest
    needs: benchmark-base

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build
      - run: npm run preview &
      - run: npx wait-on http://localhost:3000

      - name: Run PR benchmark
        id: pr
        run: |
          METRICS=$(npm run benchmark:json --silent)
          echo "metrics=$METRICS" >> $GITHUB_OUTPUT

      - name: Compare results
        uses: actions/github-script@v7
        with:
          script: |
            const baseline = JSON.parse('${{ needs.benchmark-base.outputs.baseline }}');
            const pr = JSON.parse('${{ steps.pr.outputs.metrics }}');

            const regressions = [];

            // Check FPS regression (>10% drop)
            if (pr.avgFPS < baseline.avgFPS * 0.9) {
              regressions.push(`FPS: ${baseline.avgFPS.toFixed(1)} → ${pr.avgFPS.toFixed(1)} (${((1 - pr.avgFPS / baseline.avgFPS) * 100).toFixed(1)}% drop)`);
            }

            // Check draw calls increase (>20%)
            if (pr.avgDrawCalls > baseline.avgDrawCalls * 1.2) {
              regressions.push(`Draw Calls: ${baseline.avgDrawCalls} → ${pr.avgDrawCalls} (${((pr.avgDrawCalls / baseline.avgDrawCalls - 1) * 100).toFixed(1)}% increase)`);
            }

            // Check triangle count increase (>20%)
            if (pr.avgTriangles > baseline.avgTriangles * 1.2) {
              regressions.push(`Triangles: ${baseline.avgTriangles} → ${pr.avgTriangles}`);
            }

            // Check memory increase (>30%)
            if (pr.avgGpuMemoryMB > baseline.avgGpuMemoryMB * 1.3) {
              regressions.push(`GPU Memory: ${baseline.avgGpuMemoryMB.toFixed(1)}MB → ${pr.avgGpuMemoryMB.toFixed(1)}MB`);
            }

            // Create comment
            let body = '## 📊 Performance Benchmark Results\n\n';
            body += '| Metric | Baseline | PR | Change |\n';
            body += '|--------|----------|-----|--------|\n';
            body += `| FPS | ${baseline.avgFPS.toFixed(1)} | ${pr.avgFPS.toFixed(1)} | ${((pr.avgFPS / baseline.avgFPS - 1) * 100).toFixed(1)}% |\n`;
            body += `| Frame Time | ${baseline.avgFrameTime.toFixed(2)}ms | ${pr.avgFrameTime.toFixed(2)}ms | ${((pr.avgFrameTime / baseline.avgFrameTime - 1) * 100).toFixed(1)}% |\n`;
            body += `| Draw Calls | ${baseline.avgDrawCalls} | ${pr.avgDrawCalls} | ${((pr.avgDrawCalls / baseline.avgDrawCalls - 1) * 100).toFixed(1)}% |\n`;
            body += `| Triangles | ${baseline.avgTriangles.toLocaleString()} | ${pr.avgTriangles.toLocaleString()} | ${((pr.avgTriangles / baseline.avgTriangles - 1) * 100).toFixed(1)}% |\n`;
            body += `| GPU Memory | ${baseline.avgGpuMemoryMB.toFixed(1)}MB | ${pr.avgGpuMemoryMB.toFixed(1)}MB | ${((pr.avgGpuMemoryMB / baseline.avgGpuMemoryMB - 1) * 100).toFixed(1)}% |\n`;

            if (regressions.length > 0) {
              body += '\n### ⚠️ Performance Regressions Detected\n\n';
              regressions.forEach(r => body += `- ${r}\n`);
              core.setFailed('Performance regressions detected');
            } else {
              body += '\n### ✅ No significant regressions detected\n';
            }

            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: body
            });
```

---

## GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - benchmark

variables:
  NODE_VERSION: '20'

build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

benchmark:
  stage: benchmark
  image: node:${NODE_VERSION}
  services:
    - name: browserless/chrome:latest
      alias: chrome
  variables:
    PUPPETEER_EXECUTABLE_PATH: /usr/bin/chromium-browser
    CHROME_HOST: chrome
  before_script:
    - apt-get update && apt-get install -y chromium
  script:
    - npm ci
    - npm run preview &
    - npx wait-on http://localhost:3000
    - npm run benchmark -- --reporter json > benchmark-results.json
  artifacts:
    paths:
      - benchmark-results.json
    reports:
      metrics: benchmark-results.json
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"

performance-regression:
  stage: benchmark
  image: node:${NODE_VERSION}
  needs: [benchmark]
  script:
    - npm run check-regression
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

---

## Other CI Systems

### Jenkins

```groovy
// Jenkinsfile
pipeline {
    agent any

    tools {
        nodejs 'Node20'
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Performance Test') {
            steps {
                script {
                    // Start server in background
                    sh 'npm run preview &'
                    sh 'npx wait-on http://localhost:3000'
                    
                    // Run benchmark
                    def result = sh(
                        script: 'npm run benchmark:json',
                        returnStdout: true
                    ).trim()
                    
                    def metrics = readJSON text: result
                    
                    if (metrics.passed == false) {
                        error "Performance checks failed: ${metrics.failures.join(', ')}"
                    }
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'benchmark-results.json', fingerprint: true
        }
    }
}
```

### CircleCI

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  node: circleci/node@5.1.0
  browser-tools: circleci/browser-tools@1.4.4

jobs:
  benchmark:
    docker:
      - image: cimg/node:20.0-browsers
    steps:
      - checkout
      - node/install-packages
      - run:
          name: Build
          command: npm run build
      - run:
          name: Start server
          command: npm run preview
          background: true
      - run:
          name: Wait for server
          command: npx wait-on http://localhost:3000
      - run:
          name: Run benchmark
          command: npm run benchmark
      - store_artifacts:
          path: benchmark-results.json
      - store_test_results:
          path: benchmark-results

workflows:
  test-and-benchmark:
    jobs:
      - benchmark:
          filters:
            branches:
              only:
                - main
                - /feature\/.*/
```

---

## Performance Budgets

### Budget Configuration File

```typescript
// performance-budget.ts
export interface PerformanceBudget {
  /**
   * Target environment
   */
  target: 'desktop' | 'mobile' | 'vr';

  /**
   * Minimum acceptable FPS
   */
  minFPS: number;

  /**
   * Maximum frame time in milliseconds
   */
  maxFrameTimeMs: number;

  /**
   * Maximum draw calls per frame
   */
  maxDrawCalls: number;

  /**
   * Maximum triangles per frame
   */
  maxTriangles: number;

  /**
   * Maximum GPU memory in MB
   */
  maxGpuMemoryMB: number;

  /**
   * Maximum texture count
   */
  maxTextures: number;

  /**
   * Maximum total texture memory in MB
   */
  maxTextureMemoryMB: number;

  /**
   * Maximum geometry count
   */
  maxGeometries: number;
}

export const budgets: Record<string, PerformanceBudget> = {
  desktop: {
    target: 'desktop',
    minFPS: 60,
    maxFrameTimeMs: 16.67,
    maxDrawCalls: 500,
    maxTriangles: 500000,
    maxGpuMemoryMB: 1024,
    maxTextures: 200,
    maxTextureMemoryMB: 512,
    maxGeometries: 500,
  },
  mobile: {
    target: 'mobile',
    minFPS: 30,
    maxFrameTimeMs: 33.33,
    maxDrawCalls: 100,
    maxTriangles: 100000,
    maxGpuMemoryMB: 256,
    maxTextures: 50,
    maxTextureMemoryMB: 128,
    maxGeometries: 100,
  },
  vr: {
    target: 'vr',
    minFPS: 72, // Or 90 for high-end
    maxFrameTimeMs: 13.89,
    maxDrawCalls: 200,
    maxTriangles: 200000,
    maxGpuMemoryMB: 512,
    maxTextures: 100,
    maxTextureMemoryMB: 256,
    maxGeometries: 200,
  },
};
```

### Budget Checker

```typescript
// check-budget.ts
import { budgets, PerformanceBudget } from './performance-budget';
import { runBenchmark } from './benchmark';

interface BudgetCheckResult {
  budget: PerformanceBudget;
  metrics: Awaited<ReturnType<typeof runBenchmark>>;
  passed: boolean;
  violations: string[];
}

export async function checkBudget(
  url: string,
  target: 'desktop' | 'mobile' | 'vr' = 'desktop'
): Promise<BudgetCheckResult> {
  const budget = budgets[target];
  const metrics = await runBenchmark(url);
  const violations: string[] = [];

  if (metrics.fps < budget.minFPS) {
    violations.push(`FPS: ${metrics.fps.toFixed(1)} < ${budget.minFPS} (${target})`);
  }

  if (metrics.frameTimeMs > budget.maxFrameTimeMs) {
    violations.push(`Frame time: ${metrics.frameTimeMs.toFixed(2)}ms > ${budget.maxFrameTimeMs}ms`);
  }

  if (metrics.drawCalls > budget.maxDrawCalls) {
    violations.push(`Draw calls: ${metrics.drawCalls} > ${budget.maxDrawCalls}`);
  }

  if (metrics.triangles > budget.maxTriangles) {
    violations.push(`Triangles: ${metrics.triangles} > ${budget.maxTriangles}`);
  }

  if (metrics.gpuMemoryMB > budget.maxGpuMemoryMB) {
    violations.push(`GPU memory: ${metrics.gpuMemoryMB.toFixed(1)}MB > ${budget.maxGpuMemoryMB}MB`);
  }

  return {
    budget,
    metrics,
    passed: violations.length === 0,
    violations,
  };
}
```

---

## Regression Detection

### Storing Baseline Metrics

```typescript
// baseline.ts
import fs from 'fs';
import path from 'path';

interface BaselineMetrics {
  timestamp: string;
  commit: string;
  branch: string;
  metrics: {
    avgFPS: number;
    avgFrameTime: number;
    avgDrawCalls: number;
    avgTriangles: number;
    avgGpuMemoryMB: number;
  };
}

const BASELINE_FILE = '.3lens-baseline.json';

export function saveBaseline(metrics: BaselineMetrics['metrics']): void {
  const baseline: BaselineMetrics = {
    timestamp: new Date().toISOString(),
    commit: process.env.GIT_COMMIT ?? 'unknown',
    branch: process.env.GIT_BRANCH ?? 'unknown',
    metrics,
  };

  fs.writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2));
}

export function loadBaseline(): BaselineMetrics | null {
  if (!fs.existsSync(BASELINE_FILE)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf-8'));
}

export function checkRegression(
  current: BaselineMetrics['metrics'],
  thresholds = {
    fpsDropPercent: 10,
    frameTimeIncreasePercent: 15,
    drawCallsIncreasePercent: 20,
    trianglesIncreasePercent: 20,
    memoryIncreasePercent: 30,
  }
): { passed: boolean; regressions: string[] } {
  const baseline = loadBaseline();
  
  if (!baseline) {
    return { passed: true, regressions: ['No baseline found, skipping regression check'] };
  }

  const regressions: string[] = [];
  const prev = baseline.metrics;

  // FPS drop
  const fpsDrop = (prev.avgFPS - current.avgFPS) / prev.avgFPS * 100;
  if (fpsDrop > thresholds.fpsDropPercent) {
    regressions.push(`FPS dropped by ${fpsDrop.toFixed(1)}% (${prev.avgFPS.toFixed(1)} → ${current.avgFPS.toFixed(1)})`);
  }

  // Frame time increase
  const frameTimeIncrease = (current.avgFrameTime - prev.avgFrameTime) / prev.avgFrameTime * 100;
  if (frameTimeIncrease > thresholds.frameTimeIncreasePercent) {
    regressions.push(`Frame time increased by ${frameTimeIncrease.toFixed(1)}%`);
  }

  // Draw calls increase
  const drawCallsIncrease = (current.avgDrawCalls - prev.avgDrawCalls) / prev.avgDrawCalls * 100;
  if (drawCallsIncrease > thresholds.drawCallsIncreasePercent) {
    regressions.push(`Draw calls increased by ${drawCallsIncrease.toFixed(1)}%`);
  }

  // Triangles increase
  const trianglesIncrease = (current.avgTriangles - prev.avgTriangles) / prev.avgTriangles * 100;
  if (trianglesIncrease > thresholds.trianglesIncreasePercent) {
    regressions.push(`Triangle count increased by ${trianglesIncrease.toFixed(1)}%`);
  }

  // Memory increase
  const memoryIncrease = (current.avgGpuMemoryMB - prev.avgGpuMemoryMB) / prev.avgGpuMemoryMB * 100;
  if (memoryIncrease > thresholds.memoryIncreasePercent) {
    regressions.push(`GPU memory increased by ${memoryIncrease.toFixed(1)}%`);
  }

  return {
    passed: regressions.length === 0,
    regressions,
  };
}
```

---

## Reporting

### JSON Reporter

```typescript
// reporters/json.ts
interface JsonReport {
  timestamp: string;
  summary: {
    passed: boolean;
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
  };
  metrics: Record<string, number>;
  thresholds: Record<string, number>;
  violations: string[];
  environment: {
    nodeVersion: string;
    platform: string;
    ci: boolean;
  };
}

export function generateJsonReport(results: any): JsonReport {
  return {
    timestamp: new Date().toISOString(),
    summary: {
      passed: results.passed,
      totalChecks: results.violations.length === 0 ? 5 : 5,
      passedChecks: 5 - results.violations.length,
      failedChecks: results.violations.length,
    },
    metrics: {
      fps: results.avgFPS,
      frameTimeMs: results.avgFrameTime,
      drawCalls: results.avgDrawCalls,
      triangles: results.avgTriangles,
      gpuMemoryMB: results.avgGpuMemoryMB,
    },
    thresholds: {
      minFPS: 55,
      maxFrameTimeMs: 18,
      maxDrawCalls: 500,
      maxTriangles: 250000,
      maxGpuMemoryMB: 512,
    },
    violations: results.violations,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      ci: !!process.env.CI,
    },
  };
}
```

### HTML Reporter

```typescript
// reporters/html.ts
export function generateHtmlReport(results: any): string {
  const statusClass = results.passed ? 'passed' : 'failed';
  const statusEmoji = results.passed ? '✅' : '❌';

  return `
<!DOCTYPE html>
<html>
<head>
  <title>3Lens Performance Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
    .header { display: flex; align-items: center; gap: 10px; margin-bottom: 30px; }
    .status { font-size: 24px; }
    .status.passed { color: #4caf50; }
    .status.failed { color: #f44336; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .metric { background: #f5f5f5; padding: 20px; border-radius: 8px; }
    .metric-label { font-size: 14px; color: #666; }
    .metric-value { font-size: 32px; font-weight: bold; }
    .violations { background: #fff3e0; padding: 20px; border-radius: 8px; }
    .violations h3 { margin-top: 0; color: #ff9800; }
    .violations ul { margin: 0; padding-left: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>3Lens Performance Report</h1>
    <span class="status ${statusClass}">${statusEmoji} ${results.passed ? 'PASSED' : 'FAILED'}</span>
  </div>

  <div class="metrics">
    <div class="metric">
      <div class="metric-label">Average FPS</div>
      <div class="metric-value">${results.avgFPS.toFixed(1)}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Frame Time</div>
      <div class="metric-value">${results.avgFrameTime.toFixed(2)}ms</div>
    </div>
    <div class="metric">
      <div class="metric-label">Draw Calls</div>
      <div class="metric-value">${results.avgDrawCalls.toFixed(0)}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Triangles</div>
      <div class="metric-value">${results.avgTriangles.toLocaleString()}</div>
    </div>
    <div class="metric">
      <div class="metric-label">GPU Memory</div>
      <div class="metric-value">${results.avgGpuMemoryMB.toFixed(1)} MB</div>
    </div>
  </div>

  ${results.violations.length > 0 ? `
  <div class="violations">
    <h3>⚠️ Violations</h3>
    <ul>
      ${results.violations.map((v: string) => `<li>${v}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  <p style="color: #999; font-size: 12px;">
    Generated at ${new Date().toISOString()}
  </p>
</body>
</html>
  `;
}
```

---

## Best Practices

### 1. Run Benchmarks in Isolation

```yaml
# Dedicate resources to benchmark jobs
benchmark:
  runs-on: ubuntu-latest
  strategy:
    max-parallel: 1  # Don't run in parallel
```

### 2. Use Consistent Hardware/VMs

```yaml
# Pin to specific runner
runs-on: [self-hosted, benchmark-runner]
```

### 3. Warm Up Before Measuring

```typescript
// Allow scene to stabilize
await page.waitForFunction(() => {
  const probe = (window as any).__3LENS_PROBE__;
  const stats = probe.getLatestFrameStats();
  return stats && stats.fps > 0;
});

// Additional warm-up
await new Promise(resolve => setTimeout(resolve, 3000));
```

### 4. Run Multiple Iterations

```typescript
const iterations = 5;
const results = [];

for (let i = 0; i < iterations; i++) {
  results.push(await runBenchmark(url));
}

// Use median instead of average to reduce outlier impact
const sortedFPS = results.map(r => r.fps).sort((a, b) => a - b);
const medianFPS = sortedFPS[Math.floor(iterations / 2)];
```

### 5. Set Appropriate Thresholds

```typescript
// Be slightly lenient for CI variance
const ciThresholds = {
  minFPS: 50,  // Instead of 60, account for CI overhead
  maxFrameTimeMs: 20,  // Instead of 16.67
};
```

### 6. Archive Results for Trending

```yaml
- name: Upload to monitoring
  run: |
    curl -X POST $METRICS_ENDPOINT \
      -H "Content-Type: application/json" \
      -d @benchmark-results.json
```

---

## Related Guides

- [Getting Started](./GETTING-STARTED.md)
- [Plugin Development](./PLUGIN-DEVELOPMENT.md)
- [React/R3F Guide](./REACT-R3F-GUIDE.md)
