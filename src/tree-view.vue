<script setup lang="ts" generic="T">
import { computed, ref, type Ref } from 'vue';
import { isQueryByKey, type TQueryBy, type AsyncVoidFunction } from './types';
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

type TValue = T[keyof T] extends T[] ? TValue : never;

defineSlots<{
  controls(props: {
    expandAll: AsyncVoidFunction;
    collapseAll: VoidFunction;
    selectAll: AsyncVoidFunction;
    unselectAll: VoidFunction;
    expandToSelection: VoidFunction;
    resetFilter: VoidFunction;
    filter: (query: TQueryBy<T>) => void;
    search: (query: TQueryBy<T>) => void;
  }): unknown;

  ['node-content'](props: {
    node: T;
    expanded: boolean;
    selected: boolean;
    indeterminate: boolean;
    fetching: boolean;
    error: boolean;
    toggleExpand: VoidFunction;
    toggleSelection: (isUnselect: boolean) => void;
  }): unknown;
}>();

const props = withDefaults(
  defineProps<{
    nodes: T | T[];
    modelValue?: string[];
    defaultExpandAll?: boolean;
    idKey?: keyof T;
    childrenKey?: keyof T;
    debounceMs?: number;
    transitionMs?: number;
    noTransition?: boolean;
    indentPx?: number;
    fetchChildren?: (nodeId: string) => Promise<T[] | null | undefined>;
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
});

const emit = defineEmits<{ 'update:modelValue': [payload: string[]]; 'on-error': [error: Error] }>();

const clone = structuredClone(props.nodes);
const nodesCopy = Array.isArray(clone) ? clone : [clone];
const nodesModel = ref<T[]>(nodesCopy) as Ref<T[]>;

const expandedNodes = ref(new Set<string>());
const selectedNodes = ref(new Set<string>(props.modelValue));

const nodeIdIsHttpStateMap = ref(new Map<string, { fetching: boolean; error?: Error }>());

const childrenKey = computed(() => (props.childrenKey ?? 'children') as keyof T);
const idKey = computed(() => (props.idKey ?? 'id') as keyof T);

if (props.defaultExpandAll) expandAll();

function toggleExpand(node: T) {
  if (!getNodeChildren(node, childrenKey.value)?.length) return;

  const nodeId = getNodeId(node, idKey.value);

  if (expandedNodes.value.has(nodeId)) expandedNodes.value.delete(nodeId);
  else expandedNodes.value.add(nodeId);
}

async function expandAll() {
  if (props.fetchChildren) {
    await appendAllNodes();
  }
  const allNodeIds = getAllNodesValuesUnique<T, string>(
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

async function search(query: TQueryBy<T>) {
  if (props.fetchChildren) {
    await appendAllNodes();
  }
  collapseAll();

  const path: string[] = [];
  const handler = (node: T, depth: number) => {
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

async function toggleSelection(baseNode: T, isUnselect: boolean) {
  if (props.fetchChildren) {
    await traverseAsync(baseNode, childrenKey.value, appendChildrenToNode);
  }

  const handler = (node: T) => {
    if (getNodeChildren(node, childrenKey.value)?.length) return;

    const nodeId = getNodeId(node, idKey.value);

    if (isUnselect) selectedNodes.value.delete(nodeId);
    else selectedNodes.value.add(nodeId);
  };

  traverse(baseNode, childrenKey.value, handler);

  emit('update:modelValue', Array.from(selectedNodes.value));
}

async function selectAll() {
  if (props.fetchChildren) {
    await appendAllNodes();
  }

  const allNodeIds = getAllNodesValuesUnique<T, string>(
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
  const handler = (node: T, depth: number) => {
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

async function filter(query: TQueryBy<T>) {
  if (props.fetchChildren) {
    await appendAllNodes();
  }

  resetFilter();
  nodesModel.value = filterNodes(nodesModel.value, childrenKey.value, idKey.value, query);
  expandAll();
}

function resetFilter() {
  nodesModel.value = nodesCopy;
  collapseAll();
}

async function appendChildrenToNode(node: T) {
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
            currentNode[childrenKey.value] = fetchedChildren as TValue;
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
