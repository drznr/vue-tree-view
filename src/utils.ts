import type { ConditionFn, INode } from './types';

export function traverse(node: INode, handler: (node: INode, depth: number) => void, depth = 0) {
  handler(node, depth);

  if (node.children?.length) {
    node.children.forEach(childNode => traverse(childNode, handler, depth + 1));
  }
}

export async function traverseAsync(node: INode, handler: (node: INode, depth: number) => Promise<void>, depth = 0) {
  await handler(node, depth);

  if (node.children?.length) {
    await Promise.all(node.children.map(childNode => traverseAsync(childNode, handler, depth + 1)));
  }
}

export function traverseAndCheck(
  node: INode,
  conditionFn: (node: INode, depth: number) => boolean,
  depth = 0
): boolean {
  if (conditionFn(node, depth)) {
    return true;
  }

  if (node.children?.length) {
    for (const childNode of node.children) {
      if (traverseAndCheck(childNode, conditionFn, depth + 1)) return true;
    }
  }

  return false;
}

export function traverseAndCheckAll(
  node: INode,
  conditionFn: (node: INode, depth: number) => boolean,
  depth = 0
): boolean {
  if (!conditionFn(node, depth)) {
    return false;
  }

  if (node.children?.length) {
    for (const childNode of node.children) {
      if (!traverseAndCheckAll(childNode, conditionFn, depth + 1)) return false;
    }
  }

  return true;
}

export function debounce<A extends unknown[], R>(fn: (...args: A) => R, ms: number) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (...args: A) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

export function getAllNodesValuesUnique<T extends INode[keyof INode]>(
  rootNode: INode | INode[],
  conditionFn: ConditionFn = () => true,
  prop: keyof INode = 'id'
) {
  const set: Set<T> = new Set();
  const nodes = Array.isArray(rootNode) ? rootNode : [rootNode];

  nodes.forEach(node => {
    traverse(node, (currentNode: INode) => conditionFn(currentNode) && set.add(currentNode[prop] as T));
  });

  return set;
}

export function filterNodes(nodes: INode[], conditionFn: ConditionFn): INode[] {
  const filteredNodes: INode[] = [];

  nodes.forEach(node => {
    if (conditionFn(node)) {
      filteredNodes.push({ ...node });
    }

    if (node.children?.length) {
      const filteredChildren = filterNodes(node.children, conditionFn);

      if (filteredChildren.length) {
        filteredNodes.push({ ...node, children: filteredChildren });
      }
    }
  });

  return filteredNodes;
}
