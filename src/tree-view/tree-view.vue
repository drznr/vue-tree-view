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

const expandedChildsMap = ref(new Map());

function toggleExpandNode(node: INode) {
  if (!node.children) return;

  if (expandedChildsMap.value.get(node.id)) {
    expandedChildsMap.value.delete(node.id);
    return;
  }

  expandedChildsMap.value.set(node.id, true);
}

function expandAll() {
  const handler = (node: INode) => expandedChildsMap.value.set(node.id, true);
  data.value.forEach(node => traverse(node, handler));
}

function collapseAll() {
  expandedChildsMap.value.clear();
}

function onSearch(term: string) {
  collapseAll();
  if (!term) return;

  const path: string[] = [];
  const handler = (node: INode, depth: number) => {
    path[depth] = node.id;

    if (node.name?.toLowerCase().includes(term.toLowerCase())) {
      path.forEach(nodeId => {
        expandedChildsMap.value.set(nodeId, true);
      });
    }
  };

  data.value.forEach(node => traverse(node, handler));
}
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
    :expanded-map="expandedChildsMap"
    @expand="toggleExpandNode"
  >
    <template #node-content="{ node, expanded }">
      <slot name="node-content" :node="node" :expanded="expanded" />
    </template>
  </tree-node>
</template>
