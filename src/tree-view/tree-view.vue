<script setup lang="ts">
import { computed, ref } from 'vue';
import { INode } from './types';
import treeNode from './components/tree-node.vue';
import { traverse } from './utils';

const props = defineProps<{
  nodes: INode | INode[];
  expanded?: boolean;
}>();

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
</script>

<template>
  <slot name="controls" :expandAll="expandAll" :collapseAll="collapseAll" />
  <tree-node
    v-for="node in data"
    :key="node.id"
    :node="node"
    :expanded-map="expandedChildsMap"
    @expand="toggleExpandNode"
  >
    <template #node-content="{ node }">
      <slot name="node-content" :node="node" />
    </template>
  </tree-node>
</template>
