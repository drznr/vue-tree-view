<script setup lang="ts">
import { computed, ref } from 'vue';
import { INode } from './types';
import treeNode from './components/tree-node.vue';

const props = defineProps<{
  nodes: INode | INode[];
  expanded?: boolean;
}>();

const data = computed(() => (Array.isArray(props.nodes) ? props.nodes : [props.nodes]));

const expandedChildsMap = ref(new Map());

function expandNode(node: INode) {
  if (!node.children) return;

  if (expandedChildsMap.value.get(node.id)) {
    expandedChildsMap.value.delete(node.id);
    return;
  }

  expandedChildsMap.value.set(node.id, true);
}
</script>

<template>
  <tree-node v-for="node in data" :node="node" :expanded-map="expandedChildsMap" @expand="expandNode" />
</template>
