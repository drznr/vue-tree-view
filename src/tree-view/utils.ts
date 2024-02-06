import { INode } from './types';

export function traverse(node: INode, handler: Function, depth = 0) {
  handler(node, depth);

  if (node.children) {
    node.children.forEach(childNode => traverse(childNode, handler, depth + 1));
  }
}

export function debounce(func: Function, ms: number) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return function (this: unknown, ...args: unknown[]) {
    const context = this;

    clearTimeout(timeout);

    timeout = setTimeout(function () {
      timeout = undefined;
      func.apply(context, args);
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
