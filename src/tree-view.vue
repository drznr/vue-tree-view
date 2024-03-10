<script setup lang="ts" generic="TNode">
import { computed } from 'vue';
import type { TQueryBy } from './types';
import TreeNode from './components/tree-node.vue';
import { debounce, getNodeId } from './utils';
import { useTreeView } from './composables/use-tree-view';

defineSlots<{
  /**
   * Slot above tree data, can be used to renders controls for handling tree operations
   * has all global tree handlers in scope
   */
  controls(props: {
    /**
     * Expand all tree nodes
     */
    expandAll: VoidFunction;
    /**
     * Collapse all tree nodes
     */
    collapseAll: VoidFunction;
    /**
     * Select all tree nodes
     */
    selectAll: VoidFunction;
    /**
     * Unselect all tree nodes
     */
    unselectAll: VoidFunction;
    /**
     * Expand tree nodes to see all selected nodes
     */
    expandToSelection: VoidFunction;
    /**
     * Restore to initial nodes after filtering
     */
    resetFilter: VoidFunction;
    /**
     * Filter tree nodes by query
     * @param query - name of field and term or a boolean returning function to filter by
     */
    filter: (query: TQueryBy<TNode>) => void;
    /**
     * Expand tree nodes by query
     * @param query - name of field and term or a boolean returning function to search by
     */
    search: (query: TQueryBy<TNode>) => void;
  }): unknown;

  /**
   * Slot for node itself, use for rendering node
   * has scoped node and metadata about its state and node specific handlers
   */
  ['node-content'](props: {
    /**
     * Node object
     */
    node: TNode;
    /**
     * A flag for telling if node is expanded
     */
    expanded: boolean;
    /**
     * A flag for telling if node is selected
     * (or all childs are selected)
     */
    selected: boolean;
    /**
     * A flag for telling if any child of a node is selected
     */
    indeterminate: boolean;
    /**
     * A flag for telling fetchChildren prop is fetching
     */
    fetching: boolean;
    /**
     * A flag for telling fetchChildren prop has failed
     */
    error: boolean;
    /**
     * Toggle node expanding
     */
    toggleExpand: VoidFunction;
    /**
     * Toggle node selection
     * (will run recursively for all childs of none leaf nodes)
     * @param isSelected - current state of node selection
     */
    toggleSelect: (isSelected: boolean) => void;
    /**
     * Async toggle node selection, will fetch node children
     * (will run recursively for all childs of none leaf nodes)
     * @param isSelected - current state of node selection
     */
    asyncToggleSelect: (isSelected: boolean) => Promise<void>;
  }): unknown;
}>();

const props = withDefaults(
  defineProps<{
    /**
     * Tree data structure object or array
     * @required
     */
    nodes: TNode | TNode[];
    /**
     * An array of selected nodes identifiers
     * @default []
     */
    modelValue?: string[];
    /**
     * Render all tree nodes by default
     * @default false
     */
    defaultExpandAll?: boolean;
    /**
     * Property name to be used as node identifier
     * @default 'id'
     */
    idKey?: keyof TNode;
    /**
     * Property name to be used as node children
     * @default 'children'
     */
    childrenKey?: keyof TNode;
    /**
     * number of milliseconds to be used for debouncing
     * search and filter handlers, 0 will cancel debouncing
     * @default 300
     */
    debounceMs?: number;
    /**
     * number of milliseconds to be used for transitioning
     * node expanding, 0 will cancel transition
     * @default 300
     */
    transitionMs?: number;
    /**
     * number of pixels to be used to indent tree nested levels
     * @default 24
     */
    indentPx?: number;
    /**
     * render only nodes that are in viewport, uses IntersectionObserver API
     * recommended for large trees that causes heavy rendering
     * @default false
     */
    optimizeExpanding?: boolean;
    /**
     * if supplied will be used to fetch node children on creating
     * and to recursively select nodes
     * @default undefined
     */
    fetchChildren?: (nodeId: string) => Promise<TNode[] | null | undefined>;
  }>(),
  {
    modelValue: () => [],
    debounceMs: 300,
    transitionMs: 300,
    indentPx: 24,
    optimizeExpanding: false,
  }
);

const emit = defineEmits<{
  /**
   * Change off selected nodes
   * payload is a list of selected nodes
   */
  'update:modelValue': [payload: string[]];
  /**
   * Error of fetchChildren function of a specific node
   * payload is an error with node details and original error reference
   */
  'on-error': [error: Error];
}>();

const childrenKey = computed(() => (props.childrenKey ?? 'children') as keyof TNode);
const idKey = computed(() => (props.idKey ?? 'id') as keyof TNode);

const {
  nodes,
  expandedNodes,
  selectedNodes,
  nodeIdIsHttpStateMap,
  expandAll,
  collapseAll,
  search,
  toggleExpand,
  expandToSelection,
  toggleSelect: _toggleSelect,
  selectAll: _selectAll,
  unselectAll: _unselectAll,
  filter,
  resetFilter,
  asyncToggleSelect: _asyncToggleSelect,
  appendChildrenToNode: _appendChildrenToNode,
} = useTreeView(props.nodes, props.modelValue, idKey.value, childrenKey.value, props.fetchChildren);

defineExpose({
  /**
   * Expand all tree nodes
   */
  expandAll,
  /**
   * Collapse all tree nodes
   */
  collapseAll,
  /**
   * Select all tree nodes
   */
  selectAll,
  /**
   * Unselect all tree nodes
   */
  unselectAll,
  /**
   * Restore to initial nodes after filtering
   */
  expandToSelection,
  /**
   * Expand tree nodes by query
   * @param query - name of field and term or a boolean returning function to search by
   */
  search,
  /**
   * Filter tree nodes by query
   * @param query - name of field and term or a boolean returning function to filter by
   */
  filter,
  /**
   * Restore to initial nodes after filtering
   */
  resetFilter,
  /**
   * Toggle expanding of a specific node
   * @param node - the node
   */
  toggleExpand,
  /**
   * Toggle selection of a specific node
   * (will run recursively for all childs of none leaf nodes)
   * @param node - the node
   * @param isSelected - current state of node selection
   */
  toggleSelect,
  /**
   * Toggle selection of a specific node, will fetch node children
   * (will run recursively for all childs of none leaf nodes)
   * @param node - the node
   * @param isSelected - current state of node selection
   */
  asyncToggleSelect,
});

function toggleSelect(baseNode: TNode, isUnselect: boolean) {
  _toggleSelect(baseNode, isUnselect);
  emit('update:modelValue', Array.from(selectedNodes.value));
}

function selectAll() {
  _selectAll();
  emit('update:modelValue', Array.from(selectedNodes.value));
}

function unselectAll() {
  _unselectAll();
  emit('update:modelValue', []);
}

async function asyncToggleSelect(baseNode: TNode, isUnselect: boolean) {
  await _asyncToggleSelect(baseNode, isUnselect);
  emit('update:modelValue', Array.from(selectedNodes.value));
}

async function appendChildrenToNode(node: TNode) {
  try {
    await _appendChildrenToNode(node);
  } catch (originalError) {
    const nodeId = getNodeId(node, idKey.value);
    const error = new Error(`Faild to fetch children for node: [${nodeId}]`, { cause: originalError });
    emit('on-error', error);
  }
}

if (props.defaultExpandAll) expandAll();

const debouncedSearch = debounce(search, props.debounceMs);
const debounceFitler = debounce(filter, props.debounceMs);
</script>

<template>
  <slot
    name="controls"
    :expand-all="expandAll"
    :collapse-all="collapseAll"
    :select-all="selectAll"
    :unselect-all="unselectAll"
    :search="debouncedSearch"
    :filter="debounceFitler"
    :reset-filter="resetFilter"
    :expand-to-selection="expandToSelection"
  />
  <ul>
    <tree-node
      v-for="node in nodes"
      :key="getNodeId(node, idKey)"
      :node="node"
      :expanded-nodes="expandedNodes"
      :selected-nodes="selectedNodes"
      :indent-px="indentPx"
      :transition-ms="transitionMs"
      :optimize-expanding="optimizeExpanding"
      :id-key="idKey"
      :children-key="childrenKey"
      @created="appendChildrenToNode"
    >
      <template #node-content="scope">
        <slot
          name="node-content"
          :node="scope.node"
          :expanded="scope.expanded"
          :selected="scope.selected"
          :indeterminate="scope.indeterminate"
          :fetching="!!nodeIdIsHttpStateMap.get(getNodeId(scope.node, idKey))?.fetching"
          :error="!!nodeIdIsHttpStateMap.get(getNodeId(scope.node, idKey))?.error"
          :toggle-expand="() => toggleExpand(scope.node)"
          :toggle-select="(isUnselect: boolean) => toggleSelect(scope.node, isUnselect)"
          :async-toggle-select="(isUnselect: boolean) => asyncToggleSelect(scope.node, isUnselect)"
        />
      </template>
    </tree-node>
  </ul>
</template>

<style scoped>
/** Base **/
*,
*::before,
*::after,
:deep(*, *::before, *::after) {
  box-sizing: border-box;
}

/** Reset **/
ul,
:deep(ul) {
  list-style: none;
  margin: 0;
  padding: 0;
}

li,
:deep(li) {
  padding: 0;
}
</style>
