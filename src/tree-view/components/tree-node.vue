<script setup lang="ts">
import { computed } from 'vue';
import { INode } from '../types';

const props = defineProps<{
  node: INode;
  expandedMap: Map<string, boolean>;
}>();

const emit = defineEmits(['expand']);

const expanded = computed(() => !!props.expandedMap.get(props.node.id));
</script>

<template>
  <ul>
    <li @click.stop="emit('expand', node)">
      <span :style="{ color: 'red', marginInlineEnd: '24px' }">
        {{ node.id }}
      </span>

      <span v-if="node.name">{{ node.name }}</span>

      <tree-node
        v-if="node.children && expanded"
        v-for="childNode in node.children"
        :node="childNode"
        :expanded-map="expandedMap"
        @expand="emit('expand', $event)"
      />
    </li>
  </ul>
</template>
