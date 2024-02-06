import { INode } from './types';

type THandler = (node: INode, depth: number) => unknown;
export function traverse(node: INode, handler: THandler, depth = 0) {
  handler(node, depth);

  if (node.children) {
    node.children.forEach(childNode => traverse(childNode, handler, depth + 1));
  }
}

export function debounce<T, R>(func: (...args: T[]) => R, ms: number) {
  console.log(55);
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return function (this: unknown, ...args: T[]) {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      timeout = undefined;
      func.apply(this, args);
    }, ms);
  };
}

export function collectAllNodesIds(node: INode | INode[]) {
  const set: Set<string> = new Set();
  const nodes = Array.isArray(node) ? node : [node];

  nodes.forEach(node => {
    traverse(node, (node: INode) => set.add(node.id));
  });

  return set;
}
