interface INode {
  id: string;
  name: string;
  children?: INode[];
}

export const ASYNC_TREE: INode = {
  id: '1',
  name: 'ROOT',
  children: [
    { id: '1.0', name: 'Branch A' },
    { id: '1.1', name: 'Branch B' },
  ],
};

export const getMockChildren = (nodeId: string): Promise<INode[] | null> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(
        nodeId.length > 8
          ? null
          : Array(3)
              .fill(null)
              .map((_, i) => ({
                id: nodeId + '.' + i,
                name: nodeId.length + '-node-' + (Math.random() + 1).toString(36).substring(7),
              }))
      );
    }, 300);
  });
};
