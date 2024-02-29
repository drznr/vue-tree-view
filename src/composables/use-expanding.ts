import { isQueryByKey, type TQueryBy } from '../types';
import { getAllNodesValuesUnique, getNodeChildren, getNodeId, searchInNode, traverse } from '../utils';
import { ref } from 'vue';

export function useExpanding<TNode>(
  nodes: TNode[],
  idKey: keyof TNode,
  childrenKey: keyof TNode,
  selectedNodes: Set<string>
) {
  const expandedNodes = ref(new Set<string>());

  function toggleExpand(node: TNode) {
    if (!getNodeChildren(node, childrenKey)?.length) return;

    const nodeId = getNodeId(node, idKey);

    if (expandedNodes.value.has(nodeId)) expandedNodes.value.delete(nodeId);
    else expandedNodes.value.add(nodeId);
  }

  function expandAll() {
    const allNodeIds = getAllNodesValuesUnique<TNode, string>(
      nodes,
      childrenKey,
      idKey,
      node => !!getNodeChildren(node, childrenKey)?.length
    );
    expandedNodes.value = allNodeIds;
  }

  function collapseAll() {
    expandedNodes.value.clear();
  }

  function search(query: TQueryBy<TNode>) {
    collapseAll();

    const path: string[] = [];
    const handler = (node: TNode, depth: number) => {
      path[depth] = getNodeId(node, idKey);

      const isMatch = isQueryByKey(query) ? searchInNode(node, query.key, query.term) : query(node);
      if (isMatch) {
        path.forEach(nodeId => {
          expandedNodes.value.add(nodeId);
        });
      }
    };

    nodes.forEach(node => traverse(node, childrenKey, handler));
  }

  function expandToSelection() {
    collapseAll();
    if (selectedNodes.size === 0) return;

    const path: string[] = [];
    const handler = (node: TNode, depth: number) => {
      const nodeId = getNodeId(node, idKey);
      path[depth] = nodeId;

      if (selectedNodes.has(nodeId)) {
        path.forEach(id => {
          expandedNodes.value.add(id);
        });
      }
    };

    nodes.forEach(node => traverse(node, childrenKey, handler));
  }

  return {
    expandedNodes,
    toggleExpand,
    expandAll,
    collapseAll,
    search,
    expandToSelection,
  };
}
