<script setup lang="ts">
import { computed, ref } from 'vue';
import { INode } from './types';
import treeNode from './components/tree-node.vue';
import { debounce, traverse, collectAllNodesIds } from './utils';

const props = withDefaults(
  defineProps<{
    nodes: INode | INode[];
    debounceSearch?: number;
    open?: boolean;
    indentValue?: string;
  }>(),
  {
    debounceSearch: 300,
    indentValue: '24px',
  }
);

const data = computed(() => (Array.isArray(props.nodes) ? props.nodes : [props.nodes]));

const expandedNodes = ref(props.open ? collectAllNodesIds(data.value) : new Set<string>());

function toggleExpandNode(node: INode) {
  if (!node.children) return;

  if (expandedNodes.value.has(node.id)) {
    expandedNodes.value.delete(node.id);
    return;
  }

  expandedNodes.value.add(node.id);
}

function expandAll() {
  const allNodes = collectAllNodesIds(data.value);
  expandedNodes.value = allNodes;
}

function collapseAll() {
  expandedNodes.value.clear();
}

function onSearch(term: string) {
  collapseAll();
  if (!term) return;

  const path: string[] = [];
  const handler = (node: INode, depth: number) => {
    path[depth] = node.id;

    if (node.name?.toLowerCase().includes(term.toLowerCase())) {
      path.forEach(nodeId => {
        expandedNodes.value.add(nodeId);
      });
    }
  };

  data.value.forEach(node => traverse(node, handler));
}

defineExpose({
  expandAll,
  collapseAll,
  onSearch,
  toggleExpandNode,
});
</script>

<template>
  <slot
    name="controls"
    :expand-all="expandAll"
    :collapse-all="collapseAll"
    :on-search="debounce(onSearch, props.debounceSearch)"
  />
  <ul>
    <tree-node
      v-for="node in data"
      :key="node.id"
      :node="node"
      :expanded-nodes="expandedNodes"
      :indent-value="indentValue"
    >
      <template #node-content="scope">
        <slot
          name="node-content"
          :node="scope.node"
          :expanded="scope.expanded"
          :toggle-expand="toggleExpandNode.bind(null, scope.node)"
        />
      </template>
    </tree-node>
  </ul>
</template>
