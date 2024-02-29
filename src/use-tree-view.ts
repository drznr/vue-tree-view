import { ref, type Ref } from 'vue';
import {
  filterNodes,
  getAllNodesValuesUnique,
  getNodeChildren,
  getNodeId,
  searchInNode,
  traverse,
  traverseAsync,
} from './utils';
import { isQueryByKey, type TQueryBy } from './types';

type THttpState = { fetching: boolean; error?: Error };
type TNodeValue<T> = T[keyof T] extends T[] ? TNodeValue<T> : never;

export function useTreeView<TNode>(
  inputNodes: TNode | TNode[],
  selected: string[],
  idKey: keyof TNode,
  childrenKey: keyof TNode,
  fetchChildren?: (nodeId: string) => Promise<TNode[] | null | undefined>
) {
  const nodes = ref<TNode[]>(Array.isArray(inputNodes) ? inputNodes : [inputNodes]) as Ref<TNode[]>;

  const expandedNodes = ref(new Set<string>());
  const selectedNodes = ref(new Set<string>(selected));
  const nodeIdIsHttpStateMap = ref(new Map<string, THttpState>());

  function toggleExpand(node: TNode) {
    if (!getNodeChildren(node, childrenKey)?.length) return;

    const nodeId = getNodeId(node, idKey);

    if (expandedNodes.value.has(nodeId)) expandedNodes.value.delete(nodeId);
    else expandedNodes.value.add(nodeId);
  }

  function expandAll() {
    const allNodeIds = getAllNodesValuesUnique<TNode, string>(
      nodes.value,
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

    nodes.value.forEach(node => traverse(node, childrenKey, handler));
  }

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
      nodes.value,
      childrenKey,
      idKey,
      node => !getNodeChildren(node, childrenKey)?.length
    );

    selectedNodes.value = allNodeIds;
  }

  function unselectAll() {
    selectedNodes.value.clear();
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

  function filter(query: TQueryBy<TNode>) {
    resetFilter();
    nodes.value = filterNodes(nodes.value, childrenKey, idKey, query);
    expandAll();
  }

  function resetFilter() {
    nodes.value = Array.isArray(inputNodes) ? inputNodes : [inputNodes];
    collapseAll();
  }

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

        nodes.value.forEach(rootNode => {
          traverse(rootNode, childrenKey, currentNode => {
            if (getNodeId(currentNode, idKey) === nodeId) {
              currentNode[childrenKey] = fetchedChildren as TNodeValue<TNode>;
            }
          });
        });
      } catch (originalError) {
        const error = new Error(`Faild to fetch children for node: [${nodeId}]`, { cause: originalError });
        nodeIdIsHttpStateMap.value.set(nodeId, { fetching: false, error });
        throw error;
      }
    }
  }

  async function asyncExpandAll() {
    await _appendAllNodes();
    expandAll();
  }

  async function asyncSelectAll() {
    await _appendAllNodes();
    selectAll();
  }

  async function asyncToggleSelect(baseNode: TNode, isUnselect: boolean) {
    await traverseAsync(baseNode, childrenKey, appendChildrenToNode);
    toggleSelect(baseNode, isUnselect);
  }

  async function _appendAllNodes() {
    await Promise.all(nodes.value.map(rootNode => traverseAsync(rootNode, childrenKey, appendChildrenToNode)));
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
    asyncExpandAll,
    asyncSelectAll,
    asyncToggleSelect,
  };
}
