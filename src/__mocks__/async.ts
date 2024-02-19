import type { INode } from 'src/types';

export const ASYNC_TREE: INode = {
  id: '1',
  name: 'ROOT',
  children: [
    { id: '1.0', name: 'Branch A' },
    { id: '1.1', name: 'Branch B' },
  ],
};

export const getMockChildren = (nodeId: string): Promise<INode[] | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(
        nodeId.length > 6
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
