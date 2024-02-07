import { INode } from './types';

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

export function debounce<A, R>(fn: (...args: A[]) => R, ms: number) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (this: unknown, ...args: A[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

export function getAllNodesValuesUnique<T extends INode[keyof INode]>(
  baseNode: INode | INode[],
  prop: keyof INode = 'id'
) {
  const set: Set<T> = new Set();
  const nodes = Array.isArray(baseNode) ? baseNode : [baseNode];

  nodes.forEach(node => {
    traverse(node, (currentNode: INode) => set.add(currentNode[prop] as T));
  });

  return set;
}
