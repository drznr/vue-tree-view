<script setup lang="ts">
import { computed } from 'vue';
import { INode } from '../types';

const props = defineProps<{
  node: INode;
  expandedNodes: Set<string>;
}>();

defineSlots<{
  ['node-content'](props: { node: INode; expanded: boolean }): any;
}>();

const emit = defineEmits(['expand']);

const expanded = computed(() => props.expandedNodes.has(props.node.id));
</script>

<template>
  <ul>
    <li @click.stop="emit('expand', node)">
      <slot name="node-content" :node="node" :expanded="expanded" />

      <tree-node
        v-if="node.children && expanded"
        v-for="childNode in node.children"
        :key="childNode.id"
        :node="childNode"
        :expanded-nodes="expandedNodes"
        @expand="emit('expand', $event)"
      >
        <template #node-content="{ node, expanded }">
          <slot name="node-content" :node="node" :expanded="expanded" />
        </template>
      </tree-node>
    </li>
  </ul>
</template>

<style scoped>
ul {
  list-style: none;
}
</style>
