<script setup lang="ts">
import { computed } from 'vue';
import { INode } from '../types';

defineSlots<{
  ['node-content'](props: { node: INode; expanded: boolean; selected: boolean }): unknown;
}>();

const props = defineProps<{
  node: INode;
  indentValue: string;
  expandedNodes: Set<string>;
  selectedNodes: Set<string>;
}>();

const expanded = computed(() => props.expandedNodes.has(props.node.id));
const selected = computed(() => props.selectedNodes.has(props.node.id));
</script>

<template>
  <component :is="'li'">
    <slot name="node-content" :node="node" :expanded="expanded" :selected="selected" />

    <template v-if="node.children && expanded">
      <ul :style="{ marginInlineStart: indentValue }">
        <tree-node
          v-for="childNode in node.children"
          :key="childNode.id"
          :node="childNode"
          :expanded-nodes="expandedNodes"
          :selected-nodes="selectedNodes"
          :indent-value="indentValue"
        >
          <template #node-content="scope">
            <slot name="node-content" :node="scope.node" :expanded="scope.expanded" :selected="scope.selected" />
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
