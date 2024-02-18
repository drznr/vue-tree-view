import type { INode } from '../types';

export const MOCK_ASYNC_TREE: INode = {
  id: '1',
  name: 'Animals',
};

export const GET_NODES = (nodeId: string): Promise<INode[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const returnValue =
        nodeId.length > 4
          ? []
          : Array(3)
              .fill(null)
              .map((_, i) => ({ id: nodeId + '0' + i, name: (Math.random() + 1).toString(36).substring(7) }));

      resolve(returnValue);
    }, 500);
  });
};
