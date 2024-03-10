<script setup lang="ts" generic="T">
import { computed, ref } from 'vue';
import { getNodeChildren, getNodeId, traverseAndCheck, traverseAndCheckAll } from '../utils';
import { useElementVisibility } from '../composables/use-element-visibility';

defineSlots<{
  ['node-content'](props: { node: T; expanded: boolean; selected: boolean; indeterminate: boolean }): unknown;
}>();

const props = withDefaults(
  defineProps<{
    node: T;
    expandedNodes: Set<string>;
    selectedNodes: Set<string>;
    idKey: keyof T;
    childrenKey: keyof T;
    indentPx: number;
    transitionMs: number;
    optimizeExpanding: boolean;
    rootElement?: keyof HTMLElementTagNameMap;
  }>(),
  {
    rootElement: 'li',
  }
);

const emit = defineEmits<(event: 'created', node: T) => void>();

const elementRef = ref<HTMLElement | null>(null);
const isVisible = props.optimizeExpanding ? useElementVisibility(elementRef) : true;

const isExpanded = computed(() => props.expandedNodes.has(getNodeId(props.node, props.idKey)));
const isSelected = computed(() =>
  traverseAndCheckAll(
    props.node,
    props.childrenKey,
    node => !!getNodeChildren(node, props.childrenKey)?.length || props.selectedNodes.has(getNodeId(node, props.idKey))
  )
);
const isChildSelected = computed(
  () =>
    !isSelected.value &&
    traverseAndCheck(props.node, props.childrenKey, node => props.selectedNodes.has(getNodeId(node, props.idKey)))
);
const nodeChildren = computed(() => getNodeChildren(props.node, props.childrenKey));

emit('created', props.node);
</script>

<script lang="ts">
export const TREE_NODE_TEST_ID = 'tree-node-test-id';
</script>

<template>
  <component :is="rootElement" ref="elementRef" :data-testid="TREE_NODE_TEST_ID">
    <slot
      name="node-content"
      :node="node as T"
      :expanded="isExpanded"
      :selected="isSelected"
      :indeterminate="isChildSelected"
    />

    <Transition :name="transitionMs ? 'slide-fade' : ''">
      <template v-if="isVisible && nodeChildren?.length && isExpanded">
        <ul :style="{ marginInlineStart: indentPx + 'px' }">
          <tree-node
            v-for="childNode in nodeChildren"
            :key="getNodeId(childNode, props.idKey)"
            :node="childNode as typeof node"
            :expanded-nodes="expandedNodes"
            :selected-nodes="selectedNodes"
            :optimize-expanding="optimizeExpanding"
            :id-key="idKey"
            :children-key="childrenKey"
            :indent-px="indentPx"
            :transition-ms="transitionMs"
            @created="emit('created', $event)"
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
