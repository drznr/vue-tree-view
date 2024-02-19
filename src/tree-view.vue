<script setup lang="ts">
import { ref } from 'vue';
import type { ConditionFn, INode } from './types';
import treeNode from './components/tree-node.vue';
import { debounce, traverse, getAllNodesValuesUnique, filterNodes } from './utils';

defineSlots<{
  controls(props: {
    expandAll: VoidFunction;
    collapseAll: VoidFunction;
    selectAll: VoidFunction;
    unselectAll: VoidFunction;
    expandToSelection: VoidFunction;
    resetFilter: VoidFunction;
    filter: (conditionFn: ConditionFn) => void;
    search: (conditionFn: ConditionFn) => void;
  }): unknown;

  ['node-content'](props: {
    node: INode;
    expanded: boolean;
    selected: boolean;
    indeterminate: boolean;
    fetching: boolean;
    toggleExpand: VoidFunction;
    toggleSelection: (isUnselect: boolean) => void;
  }): unknown;
}>();

const props = withDefaults(
  defineProps<{
    nodes: INode | INode[];
    modelValue?: string[];
    debounceMs?: number;
    transitionMs?: number;
    noTransition?: boolean;
    defaultExpandAll?: boolean;
    indentPx?: number;
    fetchChildren?: (nodeId: string) => Promise<INode[] | undefined>;
  }>(),
  {
    debounceMs: 300,
    transitionMs: 300,
    indentPx: 24,
    modelValue: () => [],
    fetchChildren: undefined,
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
const nodesModel = ref(nodesCopy);

const nodeIdIsFetchingMap = ref(new Map<string, boolean>());

const expandedNodes = ref(
  props.defaultExpandAll
    ? getAllNodesValuesUnique<string>(nodesModel.value, node => !!node.children?.length)
    : new Set<string>()
);
const selectedNodes = ref(new Set<string>(props.modelValue));

function toggleExpand(node: INode) {
  if (!node.children?.length) return;

  if (expandedNodes.value.has(node.id)) expandedNodes.value.delete(node.id);
  else expandedNodes.value.add(node.id);
}

function expandAll() {
  const allNodeIds = getAllNodesValuesUnique<string>(nodesModel.value, node => !!node.children?.length);
  expandedNodes.value = allNodeIds;
}

function collapseAll() {
  expandedNodes.value.clear();
}

function search(conditionFn: ConditionFn) {
  collapseAll();

  const path: string[] = [];
  const handler = (node: INode, depth: number) => {
    path[depth] = node.id;

    if (conditionFn(node)) {
      path.forEach(nodeId => {
        expandedNodes.value.add(nodeId);
      });
    }
  };

  nodesModel.value.forEach(node => traverse(node, handler));
}

function toggleSelection(baseNode: INode, isUnselect: boolean) {
  const handler = (node: INode) => {
    if (node.children?.length) return;

    if (isUnselect) selectedNodes.value.delete(node.id);
    else selectedNodes.value.add(node.id);
  };

  traverse(baseNode, handler);

  emit('update:modelValue', Array.from(selectedNodes.value));
}

function selectAll() {
  const allNodeIds = getAllNodesValuesUnique<string>(nodesModel.value, node => !node.children?.length);

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
  const handler = (node: INode, depth: number) => {
    path[depth] = node.id;

    if (selectedNodes.value.has(node.id)) {
      path.forEach(nodeId => {
        expandedNodes.value.add(nodeId);
      });
    }
  };

  nodesModel.value.forEach(node => traverse(node, handler));
}

function filter(conditionFn: ConditionFn) {
  resetFilter();
  nodesModel.value = filterNodes(nodesModel.value, conditionFn);
  expandAll();
}

function resetFilter() {
  nodesModel.value = nodesCopy;
  collapseAll();
}

function onChildNodeCreated(node: INode) {
  if (props.fetchChildren && !node.children?.length && !nodeIdIsFetchingMap.value.has(node.id)) {
    appendChildrenToNode(node);
  }
}

async function appendChildrenToNode(node: INode) {
  try {
    nodeIdIsFetchingMap.value.set(node.id, true);
    const fetchedChildren = await props.fetchChildren?.(node.id);

    if (!fetchedChildren?.length) {
      return;
    }

    nodesModel.value.forEach(rootNode => {
      traverse(rootNode, currentNode => {
        if (currentNode.id === node.id) currentNode.children = fetchedChildren;
      });
    });
  } catch (err) {
    emit('on-error', new Error(`Faild to fetch children for node: [${node.id}]`, { cause: err }));
  } finally {
    nodeIdIsFetchingMap.value.set(node.id, false);
  }
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
      :key="node.id"
      :node="node"
      :expanded-nodes="expandedNodes"
      :selected-nodes="selectedNodes"
      :indent-px="indentPx"
      :transition-ms="transitionMs"
      :no-transition="noTransition"
      @created="onChildNodeCreated"
    >
      <template #node-content="scope">
        <slot
          name="node-content"
          :node="scope.node"
          :expanded="scope.expanded"
          :selected="scope.selected"
          :indeterminate="scope.indeterminate"
          :fetching="!!nodeIdIsFetchingMap.get(scope.node.id)"
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
