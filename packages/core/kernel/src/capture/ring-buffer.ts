/**
 * Ring Buffer Implementation
 *
 * Bounded buffer for event storage with drop policy.
 *
 * @packageDocumentation
 */

/**
 * Ring buffer for events
 */
export class RingBuffer<T> {
  private items: T[] = [];
  private estimatedBytes = 0;
  private readonly maxBytes: number;

  constructor(maxBytes: number) {
    this.maxBytes = maxBytes;
  }

  /**
   * Push an item to the buffer
   * @returns true if added, false if dropped
   */
  push(item: T): boolean {
    const itemSize = this.estimateSize(item);

    // If single item exceeds buffer, reject it
    if (itemSize > this.maxBytes) {
      return false;
    }

    // Make room if needed
    while (this.estimatedBytes + itemSize > this.maxBytes && this.items.length > 0) {
      const removed = this.items.shift();
      if (removed) {
        this.estimatedBytes -= this.estimateSize(removed);
      }
    }

    // Add item
    this.items.push(item);
    this.estimatedBytes += itemSize;

    return true;
  }

  /**
   * Get all items
   */
  getAll(): T[] {
    return [...this.items];
  }

  /**
   * Get items in a time range
   */
  getRange(startSeq: number, endSeq: number, seqGetter: (item: T) => number): T[] {
    return this.items.filter((item) => {
      const seq = seqGetter(item);
      return seq >= startSeq && seq <= endSeq;
    });
  }

  /**
   * Clear the buffer
   */
  clear(): void {
    this.items = [];
    this.estimatedBytes = 0;
  }

  /**
   * Get used bytes
   */
  get usedBytes(): number {
    return this.estimatedBytes;
  }

  /**
   * Get capacity bytes
   */
  get capacityBytes(): number {
    return this.maxBytes;
  }

  /**
   * Get item count
   */
  get length(): number {
    return this.items.length;
  }

  /**
   * Estimate size of an item in bytes
   */
  private estimateSize(item: T): number {
    // Rough estimation using JSON stringification
    // In production, could use a more efficient method
    try {
      return JSON.stringify(item).length * 2; // UTF-16
    } catch {
      return 1024; // Default estimate for non-serializable items
    }
  }
}
