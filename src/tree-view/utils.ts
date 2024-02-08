import { ConditionFn, INode } from './types';

type THandler = (node: INode, depth: number) => unknown;
export function traverse(node: INode, handler: THandler, depth = 0) {
  handler(node, depth);

  if (node.children?.length) {
    node.children.forEach(childNode => traverse(childNode, handler, depth + 1));
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

  return function (this: unknown, ...args: A) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

export function getAllNodesValuesUnique<T extends INode[keyof INode]>(
  rootNode: INode | INode[],
  prop: keyof INode = 'id'
) {
  const set: Set<T> = new Set();
  const nodes = Array.isArray(rootNode) ? rootNode : [rootNode];

  nodes.forEach(node => {
    traverse(node, (currentNode: INode) => set.add(currentNode[prop] as T));
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
