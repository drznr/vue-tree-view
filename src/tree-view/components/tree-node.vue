<script setup lang="ts">
import { computed } from 'vue';
import { INode } from '../types';
import { traverseAndCheck, traverseAndCheckAll } from '../utils';

defineSlots<{
  ['node-content'](props: { node: INode; expanded: boolean; selected: boolean; indeterminate: boolean }): unknown;
}>();

const props = defineProps<{
  node: INode;
  indentValue: string;
  expandedNodes: Set<string>;
  selectedNodes: Set<string>;
}>();

const isExpanded = computed(() => props.expandedNodes.has(props.node.id));
const isSelected = computed(() =>
  traverseAndCheckAll(props.node, node => !!node.children?.length || props.selectedNodes.has(node.id))
);
const isChildSelected = computed(
  () => !isSelected.value && traverseAndCheck(props.node, node => props.selectedNodes.has(node.id))
);
</script>

<template>
  <component :is="'li'">
    <slot
      name="node-content"
      :node="node"
      :expanded="isExpanded"
      :selected="isSelected"
      :indeterminate="isChildSelected"
    />

    <template v-if="node.children?.length && isExpanded">
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
            <slot
              name="node-content"
              :node="scope.node"
              :expanded="scope.expanded"
              :selected="scope.selected"
              :indeterminate="scope.indeterminate"
            />
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
