import { getNodeChildren, getNodeId, traverse } from '../utils';
import { ref } from 'vue';

type THttpState = { fetching: boolean; error?: unknown };
type TNodeValue<T> = T[keyof T] extends T[] ? TNodeValue<T> : never;

export function useFetchChildren<TNode>(
  nodes: TNode[],
  idKey: keyof TNode,
  childrenKey: keyof TNode,
  fetchChildren?: (nodeId: string) => Promise<TNode[] | null | undefined>
) {
  const nodeIdIsHttpStateMap = ref(new Map<string, THttpState>());

  async function appendChildrenToNode(node: TNode) {
    const nodeId = getNodeId(node, idKey);
    if (fetchChildren && !getNodeChildren(node, childrenKey)?.length && !nodeIdIsHttpStateMap.value.has(nodeId)) {
      try {
        nodeIdIsHttpStateMap.value.set(nodeId, { fetching: true });
        const fetchedChildren = await fetchChildren(nodeId);
        nodeIdIsHttpStateMap.value.set(nodeId, { fetching: false });

        if (!fetchedChildren?.length) {
          return;
        }

        nodes.forEach(rootNode => {
          traverse(rootNode, childrenKey, currentNode => {
            if (getNodeId(currentNode, idKey) === nodeId) {
              currentNode[childrenKey] = fetchedChildren as TNodeValue<TNode>;
            }
          });
        });
      } catch (error) {
        nodeIdIsHttpStateMap.value.set(nodeId, { fetching: false, error });
        throw error;
      }
    }
  }

  return {
    nodeIdIsHttpStateMap,
    appendChildrenToNode,
  };
}
