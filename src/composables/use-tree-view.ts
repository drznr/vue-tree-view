import { ref, type Ref } from 'vue';
import { filterNodes } from '../utils';
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

  const { selectedNodes, toggleSelect, selectAll, unselectAll } = useSelection<TNode>(
    selected,
    nodes.value,
    idKey,
    childrenKey
  );

  const { expandedNodes, toggleExpand, expandAll, collapseAll, search, expandToSelection } = useExpanding<TNode>(
    nodes.value,
    idKey,
    childrenKey,
    selectedNodes.value
  );

  const { nodeIdIsHttpStateMap, appendChildrenToNode, asyncToggleSelect } = useFetchChildren<TNode>(
    nodes.value,
    idKey,
    childrenKey,
    toggleSelect,
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
