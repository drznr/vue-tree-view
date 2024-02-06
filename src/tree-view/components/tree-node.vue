<script setup lang="ts">
import { computed } from 'vue';
import { INode } from '../types';

const props = defineProps<{
  node: INode;
  expandedNodes: Set<string>;
}>();

defineSlots<{
  ['node-content'](props: { node: INode; expanded: boolean }): unknown;
}>();

const emit = defineEmits(['expand']);

const expanded = computed(() => props.expandedNodes.has(props.node.id));
</script>

<template>
  <ul>
    <li @click.stop="emit('expand', node)">
      <slot name="node-content" :node="node" :expanded="expanded" />

      <template v-if="node.children && expanded">
        <tree-node
          v-for="childNode in node.children"
          :key="childNode.id"
          :node="childNode"
          :expanded-nodes="expandedNodes"
          @expand="emit('expand', $event)"
        >
          <template #node-content="scope">
            <slot name="node-content" :node="scope.node" :expanded="scope.expanded" />
          </template>
        </tree-node>
      </template>
    </li>
  </ul>
</template>

<style scoped>
ul {
  list-style: none;
}
</style>
