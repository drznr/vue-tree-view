<script setup lang="ts">
import { computed, ref } from 'vue';
import { ConditionFn, INode } from './types';
import treeNode from './components/tree-node.vue';
import { debounce, traverse, getAllNodesValuesUnique } from './utils';

defineSlots<{
  controls(props: {
    expandAll: VoidFunction;
    collapseAll: VoidFunction;
    selectAll: VoidFunction;
    unselectAll: VoidFunction;
    onSearch: (conditionFn: ConditionFn) => void;
    expandToSelection: VoidFunction;
  }): unknown;

  ['node-content'](props: {
    node: INode;
    expanded: boolean;
    selected: boolean;
    indeterminate: boolean;
    toggleExpand: VoidFunction;
    toggleSelection: (isUnselect: boolean) => void;
  }): unknown;
}>();

defineExpose({
  expandAll,
  collapseAll,
  onSearch,
  toggleExpand,
  expandToSelection,
});

const emit = defineEmits(['update:modelValue']);

const props = withDefaults(
  defineProps<{
    nodes: INode | INode[];
    modelValue?: string[];
    debounceSearch?: number;
    open?: boolean;
    indentValue?: string;
  }>(),
  {
    debounceSearch: 300,
    indentValue: '24px',
    modelValue: () => [],
  }
);

const data = computed(() => (Array.isArray(props.nodes) ? props.nodes : [props.nodes]));

const expandedNodes = ref(props.open ? getAllNodesValuesUnique<string>(data.value) : new Set<string>());
const selectedNodes = ref(new Set<string>());

function toggleExpand(node: INode) {
  if (!node.children?.length) return;

  if (expandedNodes.value.has(node.id)) expandedNodes.value.delete(node.id);
  else expandedNodes.value.add(node.id);
}

function expandAll() {
  const allNodeIds = getAllNodesValuesUnique<string>(data.value);
  expandedNodes.value = allNodeIds;
}

function collapseAll() {
  expandedNodes.value.clear();
}

function onSearch(conditionFn: ConditionFn) {
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

  data.value.forEach(node => traverse(node, handler));
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
  const allNodeIds = getAllNodesValuesUnique<string>(data.value);
  selectedNodes.value = allNodeIds;
}

function unselectAll() {
  selectedNodes.value.clear();
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

  data.value.forEach(node => traverse(node, handler));
}
</script>

<template>
  <slot
    name="controls"
    :expand-all="expandAll"
    :collapse-all="collapseAll"
    :select-all="selectAll"
    :unselect-all="unselectAll"
    :on-search="debounce(onSearch, props.debounceSearch)"
    :expand-to-selection="expandToSelection"
  />
  <ul>
    <tree-node
      v-for="node in data"
      :key="node.id"
      :node="node"
      :expanded-nodes="expandedNodes"
      :selected-nodes="selectedNodes"
      :indent-value="indentValue"
    >
      <template #node-content="scope">
        <slot
          name="node-content"
          :node="scope.node"
          :expanded="scope.expanded"
          :selected="scope.selected"
          :indeterminate="scope.indeterminate"
          :toggle-expand="() => toggleExpand(scope.node)"
          :toggle-selection="(isUnselect: boolean) => toggleSelection(scope.node, isUnselect)"
        />
      </template>
    </tree-node>
  </ul>
</template>

<style scoped>
*,
*::before,
*::after,
:deep(*, *::before, *::after) {
  box-sizing: border-box;
}

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
