import type { ConditionFn } from './types';

export function traverse<T>(node: T, childrenKey: keyof T, handler: (node: T, depth: number) => void, depth = 0) {
  handler(node, depth);

  const children = getNodeChildren(node, childrenKey);
  if (children?.length) {
    children.forEach(childNode => traverse(childNode, childrenKey, handler, depth + 1));
  }
}

export async function traverseAsync<T>(
  node: T,
  childrenKey: keyof T,
  handler: (node: T, depth: number) => Promise<void>,
  depth = 0
) {
  await handler(node, depth);

  const children = getNodeChildren(node, childrenKey);
  if (children?.length) {
    await Promise.all(children.map(childNode => traverseAsync(childNode, childrenKey, handler, depth + 1)));
  }
}

export function traverseAndCheck<T>(
  node: T,
  childrenKey: keyof T,
  conditionFn: (node: T, depth: number) => boolean,
  depth = 0
): boolean {
  if (conditionFn(node, depth)) {
    return true;
  }

  const children = getNodeChildren(node, childrenKey);

  if (children?.length) {
    for (const childNode of children) {
      if (traverseAndCheck(childNode, childrenKey, conditionFn, depth + 1)) return true;
    }
  }

  return false;
}

export function traverseAndCheckAll<T>(
  node: T,
  childrenKey: keyof T,
  conditionFn: (node: T, depth: number) => boolean,
  depth = 0
): boolean {
  if (!conditionFn(node, depth)) {
    return false;
  }

  const children = getNodeChildren(node, childrenKey);

  if (children?.length) {
    for (const childNode of children) {
      if (!traverseAndCheckAll(childNode, childrenKey, conditionFn, depth + 1)) return false;
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

export function getAllNodesValuesUnique<T, V extends T[keyof T]>(
  rootNode: T | T[],
  childrenKey: keyof T,
  valuesKey: keyof T,
  conditionFn: ConditionFn<T> = () => true
) {
  const set: Set<V> = new Set();
  const nodes = Array.isArray(rootNode) ? rootNode : [rootNode];

  nodes.forEach(node => {
    traverse(node, childrenKey, (currentNode: T) => conditionFn(currentNode) && set.add(currentNode[valuesKey] as V));
  });

  return set;
}

export function filterNodes<T>(nodes: T[], childrenKey: keyof T, conditionFn: ConditionFn<T>): T[] {
  const filteredNodes: T[] = [];

  nodes.forEach(node => {
    if (conditionFn(node)) {
      filteredNodes.push({ ...node });
    }

    const children = getNodeChildren(node, childrenKey);

    if (children?.length) {
      const filteredChildren = filterNodes(children, childrenKey, conditionFn);

      if (filteredChildren.length) {
        filteredNodes.push({ ...node, [childrenKey]: filteredChildren });
      }
    }
  });

  return filteredNodes;
}

function getNodeChildren<T>(node: T, childrenKey: keyof T) {
  const children = node[childrenKey];

  if (!Array.isArray(children) && children !== undefined) {
    throw new Error(`Invalid children for node: [${JSON.stringify(node, undefined, '\t')}]`);
  }

  return children as T[] | undefined;
}
