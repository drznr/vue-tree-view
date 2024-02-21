<script setup lang="ts">
import { ref } from 'vue';
import type { ConditionFn, INode, AsyncVoidFunction } from './types';
import treeNode from './components/tree-node.vue';
import { debounce, traverse, getAllNodesValuesUnique, filterNodes, traverseAsync } from './utils';

defineSlots<{
  controls(props: {
    expandAll: AsyncVoidFunction;
    collapseAll: VoidFunction;
    selectAll: AsyncVoidFunction;
    unselectAll: VoidFunction;
    expandToSelection: VoidFunction;
    resetFilter: VoidFunction;
    filter: (conditionFn: ConditionFn<INode>) => void;
    search: (conditionFn: ConditionFn<INode>) => void;
  }): unknown;

  ['node-content'](props: {
    node: INode;
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
const nodesModel = ref(nodesCopy);

const expandedNodes = ref(new Set<string>());
const selectedNodes = ref(new Set<string>(props.modelValue));

const nodeIdIsHttpStateMap = ref(new Map<string, { fetching: boolean; error?: Error }>());

if (props.defaultExpandAll) expandAll();

function toggleExpand(node: INode) {
  if (!node.children?.length) return;

  if (expandedNodes.value.has(node.id)) expandedNodes.value.delete(node.id);
  else expandedNodes.value.add(node.id);
}

async function expandAll() {
  if (props.fetchChildren) {
    await appendAllNodes();
  }
  const allNodeIds = getAllNodesValuesUnique<INode, string>(
    nodesModel.value,
    'children',
    'id',
    node => !!node.children?.length
  );
  expandedNodes.value = allNodeIds;
}

function collapseAll() {
  expandedNodes.value.clear();
}

async function search(conditionFn: ConditionFn<INode>) {
  if (props.fetchChildren) {
    await appendAllNodes();
  }
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

  nodesModel.value.forEach(node => traverse(node, 'children', handler));
}

async function toggleSelection(baseNode: INode, isUnselect: boolean) {
  if (props.fetchChildren) {
    await traverseAsync(baseNode, 'children', appendChildrenToNode);
  }

  const handler = (node: INode) => {
    if (node.children?.length) return;

    if (isUnselect) selectedNodes.value.delete(node.id);
    else selectedNodes.value.add(node.id);
  };

  traverse(baseNode, 'children', handler);

  emit('update:modelValue', Array.from(selectedNodes.value));
}

async function selectAll() {
  if (props.fetchChildren) {
    await appendAllNodes();
  }

  const allNodeIds = getAllNodesValuesUnique<INode, string>(
    nodesModel.value,
    'children',
    'id',
    node => !node.children?.length
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
  const handler = (node: INode, depth: number) => {
    path[depth] = node.id;

    if (selectedNodes.value.has(node.id)) {
      path.forEach(nodeId => {
        expandedNodes.value.add(nodeId);
      });
    }
  };

  nodesModel.value.forEach(node => traverse(node, 'children', handler));
}

async function filter(conditionFn: ConditionFn<INode>) {
  if (props.fetchChildren) {
    await appendAllNodes();
  }

  resetFilter();
  nodesModel.value = filterNodes(nodesModel.value, 'children', conditionFn);
  expandAll();
}

function resetFilter() {
  nodesModel.value = nodesCopy;
  collapseAll();
}

async function appendChildrenToNode(node: INode) {
  if (props.fetchChildren && !node.children?.length && !nodeIdIsHttpStateMap.value.has(node.id)) {
    try {
      nodeIdIsHttpStateMap.value.set(node.id, { fetching: true });
      const fetchedChildren = await props.fetchChildren?.(node.id);
      nodeIdIsHttpStateMap.value.set(node.id, { fetching: false });

      if (!fetchedChildren?.length) {
        return;
      }

      nodesModel.value.forEach(rootNode => {
        traverse(rootNode, 'children', currentNode => {
          if (currentNode.id === node.id) currentNode.children = fetchedChildren;
        });
      });
    } catch (originalError) {
      const error = new Error(`Faild to fetch children for node: [${node.id}]`, { cause: originalError });
      emit('on-error', error);
      nodeIdIsHttpStateMap.value.set(node.id, { fetching: false, error });
    }
  }
}

async function appendAllNodes() {
  await Promise.all(nodesModel.value.map(rootNode => traverseAsync(rootNode, 'children', appendChildrenToNode)));
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
      id-key="id"
      children-key="children"
      :indent-px="indentPx"
      :transition-ms="transitionMs"
      :no-transition="noTransition"
      @created="appendChildrenToNode"
    >
      <template #node-content="scope">
        <slot
          name="node-content"
          :node="scope.node"
          :expanded="scope.expanded"
          :selected="scope.selected"
          :indeterminate="scope.indeterminate"
          :fetching="!!nodeIdIsHttpStateMap.get(scope.node.id)?.fetching"
          :error="!!nodeIdIsHttpStateMap.get(scope.node.id)?.error"
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
