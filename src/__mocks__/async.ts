import type { INode } from 'src/types';

export const ASYNC_TREE: INode = {
  id: '1',
  name: 'ROOT',
};

export const getMockChildren = (nodeId: string): Promise<INode[] | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(
        nodeId.length > 5
          ? undefined
          : Array(3)
              .fill(null)
              .map((_, i) => ({
                id: nodeId + '.' + i,
                name: (Math.random() + 1).toString(36).substring(7),
              }))
      );
    }, 300);
  });
};
