import { ref, type Ref } from 'vue';
import { filterNodes, getNodeId, traverse, traverseAsync } from '../utils';
import type { TQueryBy } from '../types';
import { useSelection } from './use-selection';
import { useExpanding } from './use-expanding';
import { useFetchChildren } from './use-fetch-children';

export function useTreeView<TNode>(
  inputNodes: TNode | TNode[],
  selected: string[],
  idKey: keyof TNode,
  childrenKey: keyof TNode,
  fetchChildren?: (nodeId: string) => Promise<TNode[] | null | undefined>
) {
  const nodes = ref<TNode[]>(Array.isArray(inputNodes) ? inputNodes : [inputNodes]) as Ref<TNode[]>;

  const { expandedNodes, toggleExpand, expandAll, collapseAll, search } = useExpanding<TNode>(
    nodes.value,
    idKey,
    childrenKey
  );

  const { selectedNodes, toggleSelect, selectAll, unselectAll } = useSelection<TNode>(
    selected,
    nodes.value,
    idKey,
    childrenKey
  );

  const { nodeIdIsHttpStateMap, appendChildrenToNode } = useFetchChildren<TNode>(
    nodes.value,
    idKey,
    childrenKey,
    fetchChildren
  );

  function filter(query: TQueryBy<TNode>) {
    resetFilter();
    nodes.value = filterNodes(nodes.value, childrenKey, idKey, query);
    expandAll();
  }

  function resetFilter() {
    nodes.value = Array.isArray(inputNodes) ? inputNodes : [inputNodes];
    collapseAll();
  }

  function expandToSelection() {
    collapseAll();
    if (selectedNodes.value.size === 0) return;

    const path: string[] = [];
    const handler = (node: TNode, depth: number) => {
      const nodeId = getNodeId(node, idKey);
      path[depth] = nodeId;

      if (selectedNodes.value.has(nodeId)) {
        path.forEach(id => {
          expandedNodes.value.add(id);
        });
      }
    };

    nodes.value.forEach(node => traverse(node, childrenKey, handler));
  }

  async function asyncToggleSelect(baseNode: TNode, isUnselect: boolean) {
    await traverseAsync(baseNode, childrenKey, appendChildrenToNode);
    toggleSelect(baseNode, isUnselect);
  }

  return {
    nodes,
    expandedNodes,
    selectedNodes,
    nodeIdIsHttpStateMap,
    toggleExpand,
    expandAll,
    collapseAll,
    search,
    toggleSelect,
    selectAll,
    unselectAll,
    expandToSelection,
    filter,
    resetFilter,
    appendChildrenToNode,
    asyncToggleSelect,
  };
}
