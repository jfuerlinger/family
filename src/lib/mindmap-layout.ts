import type { Edge, Node } from '@xyflow/react';
import type { MindmapNode } from '@/app/[locale]/(app)/mindmaps/mindmap-node';

export type LayoutDirection = 'vertical' | 'horizontal';

interface TreeNode {
  id: string;
  children: TreeNode[];
  position: { x: number; y: number };
}

/**
 * Calculate hierarchical positions for a tree of nodes.
 * Returns a map of nodeId -> new position.
 */
function calculateTreeLayout(
  nodes: MindmapNode[],
  edges: Edge[],
  rootId: string,
  direction: LayoutDirection = 'vertical',
): Map<string, { x: number; y: number }> {
  // Build adjacency: parentId -> [childIds]
  const childrenMap = new Map<string, string[]>();
  edges.forEach((edge) => {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, []);
    }
    childrenMap.get(edge.source)!.push(edge.target);
  });

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const positions = new Map<string, { x: number; y: number }>();

  // Recursive DFS to assign positions
  const traverse = (nodeId: string, x: number, y: number, depth: number) => {
    positions.set(nodeId, { x, y });
    const children = childrenMap.get(nodeId) || [];

    if (children.length === 0) return;

    const childSpacing = direction === 'vertical' ? 80 : 200;
    const verticalGap = 120;

    if (direction === 'vertical') {
      // Children spread horizontally, increase depth vertically
      const totalWidth = (children.length - 1) * childSpacing;
      const startX = x - totalWidth / 2;

      children.forEach((childId, index) => {
        const childX = startX + index * childSpacing;
        const childY = y + verticalGap;
        traverse(childId, childX, childY, depth + 1);
      });
    } else {
      // Horizontal layout: children spread vertically
      const totalHeight = (children.length - 1) * childSpacing;
      const startY = y - totalHeight / 2;

      children.forEach((childId, index) => {
        const childX = x + verticalGap;
        const childY = startY + index * childSpacing;
        traverse(childId, childX, childY, depth + 1);
      });
    }
  };

  const root = nodeMap.get(rootId);
  if (root) {
    traverse(rootId, 0, 0, 0);
  }

  return positions;
}

/**
 * Apply auto-layout to nodes, returning updated nodes with new positions.
 */
export function applyAutoLayout(
  nodes: MindmapNode[],
  edges: Edge[],
  direction: LayoutDirection = 'vertical',
): MindmapNode[] {
  // Find root node (usually the one with 'topic' kind or no parents)
  const allTargets = new Set(edges.map((e) => e.target));
  const rootNode = nodes.find((n) => !allTargets.has(n.id) && n.data.kind === 'topic') || nodes[0];

  if (!rootNode) return nodes;

  const newPositions = calculateTreeLayout(nodes, edges, rootNode.id, direction);

  return nodes.map((node) => {
    const newPos = newPositions.get(node.id);
    return newPos ? { ...node, position: newPos } : node;
  });
}
