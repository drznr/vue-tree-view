<script setup lang="ts">
import { computed, ref } from 'vue';
import { INode } from './types';
import treeNode from './components/tree-node.vue';
import { debounce, traverse } from './utils';

const props = withDefaults(
  defineProps<{
    nodes: INode | INode[];
    expanded?: boolean;
    debounceSearch?: number;
  }>(),
  {
    debounceSearch: 300,
  }
);

const data = computed(() => (Array.isArray(props.nodes) ? props.nodes : [props.nodes]));

const expandedNodes = ref(new Set<string>());

function toggleExpandNode(node: INode) {
  if (!node.children) return;

  if (expandedNodes.value.has(node.id)) {
    expandedNodes.value.delete(node.id);
    return;
  }

  expandedNodes.value.add(node.id);
}

function expandAll() {
  const handler = (node: INode) => expandedNodes.value.add(node.id);
  data.value.forEach(node => traverse(node, handler));
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

defineExpose({
  expandAll,
  collapseAll,
  onSearch,
});
</script>

<template>
  <slot
    name="controls"
    :expandAll="expandAll"
    :collapseAll="collapseAll"
    :onSearch="debounce(onSearch, props.debounceSearch)"
  />
  <tree-node
    v-for="node in data"
    :key="node.id"
    :node="node"
    :expanded-nodes="expandedNodes"
    @expand="toggleExpandNode"
  >
    <template #node-content="{ node, expanded }">
      <slot name="node-content" :node="node" :expanded="expanded" />
    </template>
  </tree-node>
</template>
