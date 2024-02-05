import { INode } from './types';

export function traverse(node: INode, handler: Function, depth = 0) {
  handler(node);

  if (node.children) {
    node.children.forEach(childNode => traverse(childNode, handler, depth + 1));
  }
}
