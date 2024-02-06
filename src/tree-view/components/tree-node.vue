<script setup lang="ts">
import { computed } from 'vue';
import { INode } from '../types';

const props = defineProps<{
  node: INode;
  depth: number;
  expandedNodes: Set<string>;
  baseElement: keyof HTMLElementTagNameMap;
}>();

defineSlots<{
  ['node-content'](props: { node: INode; expanded: boolean }): unknown;
}>();

const emit = defineEmits(['expand']);

const expanded = computed(() => props.expandedNodes.has(props.node.id));
</script>

<template>
  <component :is="baseElement" @click.stop="emit('expand', node)">
    <slot name="node-content" :node="node" :expanded="expanded" />

    <template v-if="node.children && expanded">
      <ul>
        <tree-node
          v-for="childNode in node.children"
          :key="childNode.id"
          :node="childNode"
          :depth="depth + 1"
          :expanded-nodes="expandedNodes"
          :base-element="baseElement"
          @expand="emit('expand', $event)"
        >
          <template #node-content="scope">
            <slot name="node-content" :node="scope.node" :expanded="scope.expanded" />
          </template>
        </tree-node>
      </ul>
    </template>
  </component>
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
li {
  padding: 0;
}
</style>
