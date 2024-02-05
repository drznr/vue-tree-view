import { INode } from './types';

export function traverse(node: INode, handler: Function, depth = 0) {
  handler(node, depth);

  if (node.children) {
    node.children.forEach(childNode => traverse(childNode, handler, depth + 1));
  }
}

export function debounce(func: Function, ms: number) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return function (...args: unknown[]) {
    const context = this;

    clearTimeout(timeout);

    timeout = setTimeout(function () {
      timeout = undefined;
      func.apply(context, args);
    }, ms);
  };
}
