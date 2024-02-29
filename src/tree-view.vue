<script setup lang="ts" generic="TNode">
import { computed } from 'vue';
import type { TQueryBy } from './types';
import treeNode from './components/tree-node.vue';
import { debounce, getNodeId } from './utils';
import { useTreeView } from './composables/use-tree-view';

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
  }): unknown;

  ['node-content'](props: {
    node: TNode;
    expanded: boolean;
    selected: boolean;
    indeterminate: boolean;
    fetching: boolean;
    error: boolean;
    toggleExpand: VoidFunction;
    toggleSelect: (isUnselect: boolean) => void;
    asyncToggleSelect: (isUnselect: boolean) => Promise<void>;
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

const emit = defineEmits<{ 'update:modelValue': [payload: string[]]; 'on-error': [error: Error] }>();

const childrenKey = computed(() => (props.childrenKey ?? 'children') as keyof TNode);
const idKey = computed(() => (props.idKey ?? 'id') as keyof TNode);

const {
  nodes,
  expandedNodes,
  selectedNodes,
  nodeIdIsHttpStateMap,
  expandAll,
  collapseAll,
  search,
  toggleExpand,
  expandToSelection,
  toggleSelect: _toggleSelect,
  selectAll: _selectAll,
  unselectAll: _unselectAll,
  filter,
  resetFilter,
  asyncToggleSelect: _asyncToggleSelect,
  appendChildrenToNode: _appendChildrenToNode,
} = useTreeView(props.nodes, props.modelValue, idKey.value, childrenKey.value, props.fetchChildren);

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
  asyncToggleSelect,
});

function toggleSelect(baseNode: TNode, isUnselect: boolean) {
  _toggleSelect(baseNode, isUnselect);
  emit('update:modelValue', Array.from(selectedNodes.value));
}

function selectAll() {
  _selectAll();
  emit('update:modelValue', Array.from(selectedNodes.value));
}

function unselectAll() {
  _unselectAll();
  emit('update:modelValue', []);
}

async function asyncToggleSelect(baseNode: TNode, isUnselect: boolean) {
  await _asyncToggleSelect(baseNode, isUnselect);
  emit('update:modelValue', Array.from(selectedNodes.value));
}

async function appendChildrenToNode(node: TNode) {
  try {
    await _appendChildrenToNode(node);
  } catch (error: Error) {
    emit('on-error', error);
  }
}

if (props.defaultExpandAll) expandAll();

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
      v-for="node in nodes"
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
          :toggle-select="(isUnselect: boolean) => toggleSelect(scope.node, isUnselect)"
          :async-toggle-select="(isUnselect: boolean) => asyncToggleSelect(scope.node, isUnselect)"
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
