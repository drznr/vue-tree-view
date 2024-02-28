export const ASYNC_CUSTOM_TREE = {
  _id: '1',
  label: 'ROOT',
  meta: { key: 'some extra', number: 2 },
  childs: [
    { _id: '1.0', label: 'Branch A', meta: { key: 'some extra', number: 7 } },
    { _id: '1.1', label: 'Branch B', meta: { key: 'some extra', number: 3 } },
  ],
};

export const getMockCustomChildren = (nodeId: string, timeout = 300) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(
        nodeId.length > 8
          ? null
          : Array(3)
              .fill(null)
              .map((_, i) => ({
                _id: nodeId + '.' + i,
                meta: {
                  key: 'some extra' + (Math.random() + 1).toString(36).substring(7),
                  number: Math.floor(Math.random() * 5),
                },
                label: nodeId.length + '-node-' + (Math.random() + 1).toString(36).substring(7),
              }))
      );
    }, timeout);
  });
};
