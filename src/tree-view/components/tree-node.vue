<script setup lang="ts">
import { computed } from 'vue';
import { INode } from '../types';
import { traverseAndCheck, traverseAndCheckAll } from '../utils';

defineSlots<{
  ['node-content'](props: { node: INode; expanded: boolean; selected: boolean; indeterminate: boolean }): unknown;
}>();

const props = withDefaults(
  defineProps<{
    node: INode;
    indentPx: number;
    expandedNodes: Set<string>;
    selectedNodes: Set<string>;
    rootElement?: keyof HTMLElementTagNameMap;
  }>(),
  {
    rootElement: 'li',
  }
);

const isExpanded = computed(() => props.expandedNodes.has(props.node.id));
const isSelected = computed(() =>
  traverseAndCheckAll(props.node, node => !!node.children?.length || props.selectedNodes.has(node.id))
);
const isChildSelected = computed(
  () => !isSelected.value && traverseAndCheck(props.node, node => props.selectedNodes.has(node.id))
);
</script>

<template>
  <component :is="rootElement">
    <slot
      name="node-content"
      :node="node"
      :expanded="isExpanded"
      :selected="isSelected"
      :indeterminate="isChildSelected"
    />

    <template v-if="node.children?.length && isExpanded">
      <ul :style="{ marginInlineStart: indentPx + 'px' }">
        <tree-node
          v-for="childNode in node.children"
          :key="childNode.id"
          :node="childNode"
          :expanded-nodes="expandedNodes"
          :selected-nodes="selectedNodes"
          :indent-px="indentPx"
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
