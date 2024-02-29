import { getAllNodesValuesUnique, getNodeChildren, getNodeId, traverse } from '../utils';
import { ref } from 'vue';

export function useSelection<TNode>(
  initialSelected: string[],
  nodes: TNode[],
  idKey: keyof TNode,
  childrenKey: keyof TNode
) {
  const selectedNodes = ref(new Set<string>(initialSelected));

  function toggleSelect(baseNode: TNode, isUnselect: boolean) {
    const handler = (node: TNode) => {
      if (getNodeChildren(node, childrenKey)?.length) return;

      const nodeId = getNodeId(node, idKey);

      if (isUnselect) selectedNodes.value.delete(nodeId);
      else selectedNodes.value.add(nodeId);
    };

    traverse(baseNode, childrenKey, handler);
  }

  function selectAll() {
    const allNodeIds = getAllNodesValuesUnique<TNode, string>(
      nodes,
      childrenKey,
      idKey,
      node => !getNodeChildren(node, childrenKey)?.length
    );

    selectedNodes.value = allNodeIds;
  }

  function unselectAll() {
    selectedNodes.value.clear();
  }

  return {
    selectedNodes,
    toggleSelect,
    selectAll,
    unselectAll,
  };
}
