/**
 * Performance Benchmark Utilities
 *
 * Provides utilities for measuring and reporting performance benchmarks
 * across the 3Lens core utilities.
 */

export interface BenchmarkResult {
  name: string;
  opsPerSecond: number;
  avgTimeMs: number;
  minTimeMs: number;
  maxTimeMs: number;
  medianTimeMs: number;
  p95TimeMs: number;
  p99TimeMs: number;
  samples: number;
  totalTimeMs: number;
}

export interface BenchmarkSuite {
  name: string;
  results: BenchmarkResult[];
  totalDurationMs: number;
}

export interface BenchmarkOptions {
  /** Minimum number of iterations */
  minIterations?: number;
  /** Maximum time to run in milliseconds */
  maxTimeMs?: number;
  /** Number of warmup iterations */
  warmupIterations?: number;
  /** Target error margin (coefficient of variation) */
  targetCV?: number;
}

const DEFAULT_OPTIONS: Required<BenchmarkOptions> = {
  minIterations: 100,
  maxTimeMs: 5000,
  warmupIterations: 10,
  targetCV: 0.05,
};

/**
 * Run a single benchmark
 */
export function benchmark(
  name: string,
  fn: () => void,
  options: BenchmarkOptions = {}
): BenchmarkResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const times: number[] = [];

  // Warmup
  for (let i = 0; i < opts.warmupIterations; i++) {
    fn();
  }

  const startTime = performance.now();
  let iterations = 0;

  // Run iterations
  while (
    iterations < opts.minIterations ||
    (performance.now() - startTime < opts.maxTimeMs && !hasConverged(times, opts.targetCV))
  ) {
    const iterStart = performance.now();
    fn();
    times.push(performance.now() - iterStart);
    iterations++;

    // Safety limit
    if (iterations > 1000000) break;
  }

  const totalTimeMs = performance.now() - startTime;
  const sorted = [...times].sort((a, b) => a - b);

  return {
    name,
    opsPerSecond: (iterations / totalTimeMs) * 1000,
    avgTimeMs: times.reduce((a, b) => a + b, 0) / times.length,
    minTimeMs: sorted[0],
    maxTimeMs: sorted[sorted.length - 1],
    medianTimeMs: percentile(sorted, 50),
    p95TimeMs: percentile(sorted, 95),
    p99TimeMs: percentile(sorted, 99),
    samples: iterations,
    totalTimeMs,
  };
}

/**
 * Run a benchmark with async setup/teardown
 */
export async function benchmarkAsync(
  name: string,
  fn: () => Promise<void>,
  options: BenchmarkOptions = {}
): Promise<BenchmarkResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const times: number[] = [];

  // Warmup
  for (let i = 0; i < opts.warmupIterations; i++) {
    await fn();
  }

  const startTime = performance.now();
  let iterations = 0;

  // Run iterations
  while (
    iterations < opts.minIterations ||
    (performance.now() - startTime < opts.maxTimeMs && !hasConverged(times, opts.targetCV))
  ) {
    const iterStart = performance.now();
    await fn();
    times.push(performance.now() - iterStart);
    iterations++;

    // Safety limit
    if (iterations > 10000) break;
  }

  const totalTimeMs = performance.now() - startTime;
  const sorted = [...times].sort((a, b) => a - b);

  return {
    name,
    opsPerSecond: (iterations / totalTimeMs) * 1000,
    avgTimeMs: times.reduce((a, b) => a + b, 0) / times.length,
    minTimeMs: sorted[0],
    maxTimeMs: sorted[sorted.length - 1],
    medianTimeMs: percentile(sorted, 50),
    p95TimeMs: percentile(sorted, 95),
    p99TimeMs: percentile(sorted, 99),
    samples: iterations,
    totalTimeMs,
  };
}

/**
 * Run batched operations benchmark (for micro-benchmarks)
 */
export function benchmarkBatched(
  name: string,
  fn: () => void,
  batchSize: number,
  options: BenchmarkOptions = {}
): BenchmarkResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const times: number[] = [];

  // Warmup
  for (let w = 0; w < opts.warmupIterations; w++) {
    for (let i = 0; i < batchSize; i++) {
      fn();
    }
  }

  const startTime = performance.now();
  let batches = 0;
  const minBatches = Math.ceil(opts.minIterations / batchSize);

  // Run batched iterations
  while (
    batches < minBatches ||
    (performance.now() - startTime < opts.maxTimeMs && !hasConverged(times, opts.targetCV))
  ) {
    const batchStart = performance.now();
    for (let i = 0; i < batchSize; i++) {
      fn();
    }
    times.push((performance.now() - batchStart) / batchSize);
    batches++;

    // Safety limit
    if (batches > 100000) break;
  }

  const totalTimeMs = performance.now() - startTime;
  const totalOps = batches * batchSize;
  const sorted = [...times].sort((a, b) => a - b);

  return {
    name,
    opsPerSecond: (totalOps / totalTimeMs) * 1000,
    avgTimeMs: times.reduce((a, b) => a + b, 0) / times.length,
    minTimeMs: sorted[0],
    maxTimeMs: sorted[sorted.length - 1],
    medianTimeMs: percentile(sorted, 50),
    p95TimeMs: percentile(sorted, 95),
    p99TimeMs: percentile(sorted, 99),
    samples: totalOps,
    totalTimeMs,
  };
}

/**
 * Format benchmark results as a table
 */
export function formatBenchmarkResults(results: BenchmarkResult[]): string {
  const lines: string[] = [];

  // Header
  lines.push('┌' + '─'.repeat(40) + '┬' + '─'.repeat(15) + '┬' + '─'.repeat(12) + '┬' + '─'.repeat(12) + '┬' + '─'.repeat(12) + '┐');
  lines.push(
    '│ ' +
      'Benchmark'.padEnd(38) +
      ' │ ' +
      'ops/sec'.padStart(13) +
      ' │ ' +
      'avg (ms)'.padStart(10) +
      ' │ ' +
      'p95 (ms)'.padStart(10) +
      ' │ ' +
      'samples'.padStart(10) +
      ' │'
  );
  lines.push('├' + '─'.repeat(40) + '┼' + '─'.repeat(15) + '┼' + '─'.repeat(12) + '┼' + '─'.repeat(12) + '┼' + '─'.repeat(12) + '┤');

  // Results
  for (const result of results) {
    const name = result.name.length > 38 ? result.name.slice(0, 35) + '...' : result.name;
    const ops = formatNumber(result.opsPerSecond);
    const avg = result.avgTimeMs.toFixed(4);
    const p95 = result.p95TimeMs.toFixed(4);
    const samples = result.samples.toString();

    lines.push(
      '│ ' +
        name.padEnd(38) +
        ' │ ' +
        ops.padStart(13) +
        ' │ ' +
        avg.padStart(10) +
        ' │ ' +
        p95.padStart(10) +
        ' │ ' +
        samples.padStart(10) +
        ' │'
    );
  }

  lines.push('└' + '─'.repeat(40) + '┴' + '─'.repeat(15) + '┴' + '─'.repeat(12) + '┴' + '─'.repeat(12) + '┴' + '─'.repeat(12) + '┘');

  return lines.join('\n');
}

/**
 * Format results as JSON for CI integration
 */
export function formatBenchmarkResultsJSON(suite: BenchmarkSuite): string {
  return JSON.stringify(
    {
      suite: suite.name,
      timestamp: new Date().toISOString(),
      totalDurationMs: suite.totalDurationMs,
      results: suite.results.map((r) => ({
        name: r.name,
        opsPerSecond: Math.round(r.opsPerSecond),
        avgTimeMs: Number(r.avgTimeMs.toFixed(6)),
        minTimeMs: Number(r.minTimeMs.toFixed(6)),
        maxTimeMs: Number(r.maxTimeMs.toFixed(6)),
        medianTimeMs: Number(r.medianTimeMs.toFixed(6)),
        p95TimeMs: Number(r.p95TimeMs.toFixed(6)),
        p99TimeMs: Number(r.p99TimeMs.toFixed(6)),
        samples: r.samples,
      })),
    },
    null,
    2
  );
}

/**
 * Assert benchmark meets performance threshold
 */
export function assertPerformance(
  result: BenchmarkResult,
  minOpsPerSecond: number,
  description?: string
): void {
  if (result.opsPerSecond < minOpsPerSecond) {
    throw new Error(
      `Performance assertion failed${description ? ` (${description})` : ''}: ` +
        `${result.name} achieved ${Math.round(result.opsPerSecond)} ops/sec, ` +
        `expected at least ${minOpsPerSecond} ops/sec`
    );
  }
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

function hasConverged(times: number[], targetCV: number): boolean {
  if (times.length < 30) return false;

  const recent = times.slice(-30);
  const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
  if (mean === 0) return true;

  const variance = recent.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / recent.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  return cv < targetCV;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(2) + 'K';
  return n.toFixed(2);
}
