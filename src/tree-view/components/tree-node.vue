<script setup lang="ts">
import { computed } from 'vue';
import { INode } from '../types';

const props = defineProps<{
  node: INode;
  expandedNodes: Set<string>;
  indentValue: string;
}>();

defineSlots<{
  ['node-content'](props: { node: INode; expanded: boolean }): unknown;
}>();

const expanded = computed(() => props.expandedNodes.has(props.node.id));
</script>

<template>
  <component :is="'li'">
    <slot name="node-content" :node="node" :expanded="expanded" />

    <template v-if="node.children && expanded">
      <ul :style="{ marginInlineStart: indentValue }">
        <tree-node
          v-for="childNode in node.children"
          :key="childNode.id"
          :node="childNode"
          :expanded-nodes="expandedNodes"
          :indent-value="indentValue"
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
