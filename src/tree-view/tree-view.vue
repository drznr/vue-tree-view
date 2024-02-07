<script setup lang="ts">
import { computed, ref } from 'vue';
import { INode } from './types';
import treeNode from './components/tree-node.vue';
import { debounce, traverse, collectAllNodesIds } from './utils';

defineSlots<{
  controls(props: { expandAll: () => void; collapseAll: () => void; onSearch: (term: string) => void }): unknown;

  ['node-content'](props: {
    node: INode;
    expanded: boolean;
    selected: boolean;
    toggleExpand: () => void;
    toggleSelection: (isUnselect: boolean) => void;
  }): unknown;
}>();

defineExpose({
  expandAll,
  collapseAll,
  onSearch,
  toggleExpand,
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

const expandedNodes = ref(props.open ? collectAllNodesIds(data.value) : new Set<string>());
const selectedNodes = ref(new Set<string>());

function toggleExpand(node: INode) {
  if (!node.children?.length) return;

  if (expandedNodes.value.has(node.id)) expandedNodes.value.delete(node.id);
  else expandedNodes.value.add(node.id);
}

function expandAll() {
  const allNodes = collectAllNodesIds(data.value);
  expandedNodes.value = allNodes;
}

function collapseAll() {
  expandedNodes.value.clear();
}

function onSearch(term: string) {
  collapseAll();
  if (!term) return;

  const path: string[] = [];
  const handler = (node: INode, depth: number) => {
    path[depth] = node.id;

    if (node.name?.toLowerCase().includes(term.toLowerCase())) {
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
</script>

<template>
  <slot
    name="controls"
    :expand-all="expandAll"
    :collapse-all="collapseAll"
    :on-search="debounce(onSearch, props.debounceSearch)"
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
*::after {
  box-sizing: border-box;
}
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
