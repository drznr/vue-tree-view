<script setup lang="ts" generic="TNode">
import { computed, ref, type Ref } from 'vue';
import { isQueryByKey, type TQueryBy } from './types';
import treeNode from './components/tree-node.vue';
import {
  debounce,
  traverse,
  getAllNodesValuesUnique,
  filterNodes,
  traverseAsync,
  getNodeChildren,
  getNodeId,
  searchInNode,
} from './utils';

type TNodeValue = TNode[keyof TNode] extends TNode[] ? TNodeValue : never;

defineSlots<{
  controls(props: {
    expandAll: VoidFunction;
    collapseAll: VoidFunction;
    selectAll: VoidFunction;
    unselectAll: VoidFunction;
    expandToSelection: VoidFunction;
    resetFilter: VoidFunction;
    filter: (query: TQueryBy<TNode>) => void;
    search: (query: TQueryBy<TNode>) => void;
    asyncExpandAll: () => Promise<void>;
    asyncSelectAll: () => Promise<void>;
    asyncSearch: (getMatchedPaths: () => Promise<string[]>) => Promise<void>;
    asyncFilter: (getFilteredNodes: () => Promise<TNode[]>) => Promise<void>;
  }): unknown;

  ['node-content'](props: {
    node: TNode;
    expanded: boolean;
    selected: boolean;
    indeterminate: boolean;
    fetching: boolean;
    error: boolean;
    toggleExpand: VoidFunction;
    toggleSelection: (isUnselect: boolean) => void;
    asyncToggleSelection: (isUnselect: boolean) => Promise<void>;
  }): unknown;
}>();

const props = withDefaults(
  defineProps<{
    nodes: TNode | TNode[];
    modelValue?: string[];
    defaultExpandAll?: boolean;
    idKey?: keyof TNode;
    childrenKey?: keyof TNode;
    debounceMs?: number;
    transitionMs?: number;
    noTransition?: boolean;
    indentPx?: number;
    fetchChildren?: (nodeId: string) => Promise<TNode[] | null | undefined>;
  }>(),
  {
    modelValue: () => [],
    debounceMs: 300,
    transitionMs: 300,
    indentPx: 24,
  }
);

defineExpose({
  expandAll,
  collapseAll,
  search,
  toggleExpand,
  expandToSelection,
  filter,
  resetFilter,
  selectAll,
  unselectAll,
  asyncExpandAll,
  asyncSelectAll,
  asyncToggleSelection,
  asyncSearch,
  asyncFilter,
});

const emit = defineEmits<{ 'update:modelValue': [payload: string[]]; 'on-error': [error: Error] }>();

const clone = structuredClone(props.nodes);
const nodesCopy = Array.isArray(clone) ? clone : [clone];
const nodesModel = ref<TNode[]>(nodesCopy) as Ref<TNode[]>;

const expandedNodes = ref(new Set<string>());
const selectedNodes = ref(new Set<string>(props.modelValue));

const nodeIdIsHttpStateMap = ref(new Map<string, { fetching: boolean; error?: Error }>());

const childrenKey = computed(() => (props.childrenKey ?? 'children') as keyof TNode);
const idKey = computed(() => (props.idKey ?? 'id') as keyof TNode);

if (props.defaultExpandAll) expandAll();

function toggleExpand(node: TNode) {
  if (!getNodeChildren(node, childrenKey.value)?.length) return;

  const nodeId = getNodeId(node, idKey.value);

  if (expandedNodes.value.has(nodeId)) expandedNodes.value.delete(nodeId);
  else expandedNodes.value.add(nodeId);
}

function expandAll() {
  const allNodeIds = getAllNodesValuesUnique<TNode, string>(
    nodesModel.value,
    childrenKey.value,
    idKey.value,
    node => !!getNodeChildren(node, childrenKey.value)?.length
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
    path[depth] = getNodeId(node, idKey.value);

    const isMatch = isQueryByKey(query) ? searchInNode(node, query.key, query.term) : query(node);
    if (isMatch) {
      path.forEach(nodeId => {
        expandedNodes.value.add(nodeId);
      });
    }
  };

  nodesModel.value.forEach(node => traverse(node, childrenKey.value, handler));
}

function toggleSelection(baseNode: TNode, isUnselect: boolean) {
  const handler = (node: TNode) => {
    if (getNodeChildren(node, childrenKey.value)?.length) return;

    const nodeId = getNodeId(node, idKey.value);

    if (isUnselect) selectedNodes.value.delete(nodeId);
    else selectedNodes.value.add(nodeId);
  };

  traverse(baseNode, childrenKey.value, handler);

  emit('update:modelValue', Array.from(selectedNodes.value));
}

function selectAll() {
  const allNodeIds = getAllNodesValuesUnique<TNode, string>(
    nodesModel.value,
    childrenKey.value,
    idKey.value,
    node => !getNodeChildren(node, childrenKey.value)?.length
  );

  selectedNodes.value = allNodeIds;
  emit('update:modelValue', Array.from(allNodeIds));
}

function unselectAll() {
  selectedNodes.value.clear();
  emit('update:modelValue', []);
}

function expandToSelection() {
  collapseAll();
  if (selectedNodes.value.size === 0) return;

  const path: string[] = [];
  const handler = (node: TNode, depth: number) => {
    const nodeId = getNodeId(node, idKey.value);
    path[depth] = nodeId;

    if (selectedNodes.value.has(nodeId)) {
      path.forEach(id => {
        expandedNodes.value.add(id);
      });
    }
  };

  nodesModel.value.forEach(node => traverse(node, childrenKey.value, handler));
}

function filter(query: TQueryBy<TNode>) {
  resetFilter();
  nodesModel.value = filterNodes(nodesModel.value, childrenKey.value, idKey.value, query);
  expandAll();
}

function resetFilter() {
  nodesModel.value = nodesCopy;
  collapseAll();
}

async function appendChildrenToNode(node: TNode) {
  const nodeId = getNodeId(node, idKey.value);
  if (
    props.fetchChildren &&
    !getNodeChildren(node, childrenKey.value)?.length &&
    !nodeIdIsHttpStateMap.value.has(nodeId)
  ) {
    try {
      nodeIdIsHttpStateMap.value.set(nodeId, { fetching: true });
      const fetchedChildren = await props.fetchChildren?.(nodeId);
      nodeIdIsHttpStateMap.value.set(nodeId, { fetching: false });

      if (!fetchedChildren?.length) {
        return;
      }

      nodesModel.value.forEach(rootNode => {
        traverse(rootNode, childrenKey.value, currentNode => {
          if (getNodeId(currentNode, idKey.value) === nodeId) {
            currentNode[childrenKey.value] = fetchedChildren as TNodeValue;
          }
        });
      });
    } catch (originalError) {
      const error = new Error(`Faild to fetch children for node: [${nodeId}]`, { cause: originalError });
      emit('on-error', error);
      nodeIdIsHttpStateMap.value.set(nodeId, { fetching: false, error });
    }
  }
}

async function asyncExpandAll() {
  await appendAllNodes();
  expandAll();
}

async function asyncSelectAll() {
  await appendAllNodes();
  selectAll();
}

async function asyncFilter(getFilteredNodes: () => Promise<TNode[]>) {
  resetFilter();
  nodesModel.value = await getFilteredNodes();
  expandAll();
}

async function asyncSearch(getMatchedPaths: () => Promise<string[]>) {
  resetFilter();
  const paths = await getMatchedPaths();
  expandedNodes.value = new Set(paths);
  expandAll();
}

async function asyncToggleSelection(baseNode: TNode, isUnselect: boolean) {
  await traverseAsync(baseNode, childrenKey.value, appendChildrenToNode);
  toggleSelection(baseNode, isUnselect);
}

async function appendAllNodes() {
  await Promise.all(nodesModel.value.map(rootNode => traverseAsync(rootNode, childrenKey.value, appendChildrenToNode)));
}

const debouncedSearch = debounce(search, props.debounceMs);
const debounceFitler = debounce(filter, props.debounceMs);
</script>

<template>
  <slot
    name="controls"
    :expand-all="expandAll"
    :collapse-all="collapseAll"
    :select-all="selectAll"
    :unselect-all="unselectAll"
    :search="debouncedSearch"
    :filter="debounceFitler"
    :reset-filter="resetFilter"
    :expand-to-selection="expandToSelection"
    :async-expand-all="asyncExpandAll"
    :async-select-all="asyncSelectAll"
    :async-search="asyncSearch"
    :async-filter="asyncFilter"
  />
  <ul>
    <tree-node
      v-for="node in nodesModel"
      :key="getNodeId(node, idKey)"
      :node="node"
      :expanded-nodes="expandedNodes"
      :selected-nodes="selectedNodes"
      :indent-px="indentPx"
      :transition-ms="transitionMs"
      :no-transition="noTransition"
      :id-key="idKey"
      :children-key="childrenKey"
      @created="appendChildrenToNode"
    >
      <template #node-content="scope">
        <slot
          name="node-content"
          :node="scope.node"
          :expanded="scope.expanded"
          :selected="scope.selected"
          :indeterminate="scope.indeterminate"
          :fetching="!!nodeIdIsHttpStateMap.get(getNodeId(scope.node, idKey))?.fetching"
          :error="!!nodeIdIsHttpStateMap.get(getNodeId(scope.node, idKey))?.error"
          :toggle-expand="() => toggleExpand(scope.node)"
          :toggle-selection="(isUnselect: boolean) => toggleSelection(scope.node, isUnselect)"
          :async-toggle-selection="(isUnselect: boolean) => asyncToggleSelection(scope.node, isUnselect)"
        />
      </template>
    </tree-node>
  </ul>
</template>

<style scoped>
/** Base **/
*,
*::before,
*::after,
:deep(*, *::before, *::after) {
  box-sizing: border-box;
}

/** Reset **/
ul,
:deep(ul) {
  list-style: none;
  margin: 0;
  padding: 0;
}

li,
:deep(li) {
  padding: 0;
}
</style>
