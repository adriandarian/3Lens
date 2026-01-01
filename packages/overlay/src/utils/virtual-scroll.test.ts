import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { countTreeNodes } from './virtual-scroll';

// Mock tree node structure (matches countTreeNodes constraint)
interface TestNode {
  id: string;
  name: string;
  children: TestNode[];
}

function createTestNode(id: string, name: string, children: TestNode[] = []): TestNode {
  return { id, name, children };
}

// Note: VirtualScroller tests would require jsdom environment and are more suitable
// for integration tests. We test the utility functions here.

describe('countTreeNodes', () => {
  it('should count single node', () => {
    const node = createTestNode('root', 'Root');
    expect(countTreeNodes(node)).toBe(1);
  });

  it('should count node with children', () => {
    const node = createTestNode('root', 'Root', [
      createTestNode('child1', 'Child 1'),
      createTestNode('child2', 'Child 2'),
    ]);
    expect(countTreeNodes(node)).toBe(3);
  });

  it('should count nested children', () => {
    const node = createTestNode('root', 'Root', [
      createTestNode('child1', 'Child 1', [
        createTestNode('grandchild1', 'Grandchild 1'),
        createTestNode('grandchild2', 'Grandchild 2'),
      ]),
      createTestNode('child2', 'Child 2'),
    ]);
    expect(countTreeNodes(node)).toBe(5);
  });

  it('should handle deep nesting', () => {
    const deepNode = createTestNode('level4', 'Level 4');
    const level3 = createTestNode('level3', 'Level 3', [deepNode]);
    const level2 = createTestNode('level2', 'Level 2', [level3]);
    const level1 = createTestNode('level1', 'Level 1', [level2]);
    const root = createTestNode('root', 'Root', [level1]);
    
    expect(countTreeNodes(root)).toBe(5);
  });

  it('should handle wide tree', () => {
    const children: TestNode[] = [];
    for (let i = 0; i < 10; i++) {
      children.push(createTestNode(`child${i}`, `Child ${i}`));
    }
    const root = createTestNode('root', 'Root', children);
    
    expect(countTreeNodes(root)).toBe(11); // root + 10 children
  });

  it('should handle mixed depth tree', () => {
    const node = createTestNode('root', 'Root', [
      createTestNode('a', 'A', [
        createTestNode('a1', 'A1'),
        createTestNode('a2', 'A2', [
          createTestNode('a2a', 'A2A'),
        ]),
      ]),
      createTestNode('b', 'B'),
      createTestNode('c', 'C', [
        createTestNode('c1', 'C1'),
      ]),
    ]);
    
    // root, a, a1, a2, a2a, b, c, c1 = 8 nodes
    expect(countTreeNodes(node)).toBe(8);
  });
});
