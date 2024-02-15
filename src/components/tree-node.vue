<script setup lang="ts">
import { computed } from 'vue';
import type { INode } from '../types';
import { traverseAndCheck, traverseAndCheckAll } from '../utils';

defineSlots<{
  ['node-content'](props: { node: INode; expanded: boolean; selected: boolean; indeterminate: boolean }): unknown;
}>();

const props = withDefaults(
  defineProps<{
    node: INode;
    expandedNodes: Set<string>;
    selectedNodes: Set<string>;
    indentPx: number;
    transitionMs: number;
    noTransition?: boolean;
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

<script lang="ts">
export const TREE_NODE_TEST_ID = 'tree-node-test-id';
</script>

<template>
  <component :is="rootElement" :data-testid="TREE_NODE_TEST_ID">
    <slot
      name="node-content"
      :node="node"
      :expanded="isExpanded"
      :selected="isSelected"
      :indeterminate="isChildSelected"
    />

    <Transition :name="noTransition ? '' : 'slide-fade'">
      <template v-if="node.children?.length && isExpanded">
        <ul :style="{ marginInlineStart: indentPx + 'px' }">
          <tree-node
            v-for="childNode in node.children"
            :key="childNode.id"
            :node="childNode"
            :expanded-nodes="expandedNodes"
            :selected-nodes="selectedNodes"
            :indent-px="indentPx"
            :transition-ms="transitionMs"
            :no-transition="noTransition"
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
    </Transition>
  </component>
</template>

<style scoped>
/** Expand Transition **/
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition:
    transform v-bind(transitionMs + 'ms') cubic-bezier(0.25, 0.8, 0.5, 1),
    opacity v-bind(transitionMs + 'ms') cubic-bezier(0.25, 0.8, 0.5, 1);
  transform-origin: top;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: scaleY(0);
  opacity: 0;
}
</style>
