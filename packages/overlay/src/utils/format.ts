/**
 * Simple memoization helper for formatting functions
 * Uses a Map cache with bounded size
 */
function createMemoizedFormatter<T extends string | number, R>(
  fn: (arg: T) => R,
  maxSize = 500
): (arg: T) => R {
  const cache = new Map<T, R>();
  return (arg: T): R => {
    if (cache.has(arg)) {
      return cache.get(arg)!;
    }
    const result = fn(arg);
    if (cache.size >= maxSize) {
      // Evict oldest entry
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    cache.set(arg, result);
    return result;
  };
}

/**
 * Format a number for display (1234 -> 1.2K)
 * Memoized for performance in hot render paths
 */
export const formatNumber = createMemoizedFormatter((num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
});

/**
 * Format bytes for display
 * Memoized for performance in hot render paths
 */
export const formatBytes = createMemoizedFormatter((bytes: number): string => {
  if (bytes >= 1073741824) {
    return (bytes / 1073741824).toFixed(2) + ' GB';
  }
  if (bytes >= 1048576) {
    return (bytes / 1048576).toFixed(2) + ' MB';
  }
  if (bytes >= 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  }
  return bytes + ' B';
});

/**
 * Get CSS class for object type
 * Memoized since the same types are queried repeatedly
 */
export const getObjectClass = createMemoizedFormatter((type: string): string => {
  const lower = type.toLowerCase();
  if (lower.includes('scene')) return 'scene';
  if (lower.includes('mesh')) return 'mesh';
  if (lower.includes('group')) return 'group';
  if (lower.includes('light')) return 'light';
  if (lower.includes('camera')) return 'camera';
  if (lower.includes('bone')) return 'bone';
  return 'object';
}, 100);

/**
 * Get icon letter for object type
 * Memoized since the same types are queried repeatedly
 */
export const getObjectIcon = createMemoizedFormatter((type: string): string => {
  const lower = type.toLowerCase();
  if (lower.includes('scene')) return 'S';
  if (lower.includes('mesh')) return 'M';
  if (lower.includes('group')) return 'G';
  if (lower.includes('light')) return 'L';
  if (lower.includes('camera')) return 'C';
  if (lower.includes('bone')) return 'B';
  return 'O';
}, 100);
