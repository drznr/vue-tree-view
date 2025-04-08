## Vue Tree View 🌳🌳🌳

A headless tree view component for Vue 3.

- 🧠 Logic only (headless): you control the rendering.
- 🪄 Simple API for building nested trees.
- 💪 Zero dependencies — lean and efficient.
- 🔎 Built-in support for search, filter, and node selection.
- 🌐 Async mode — load children on-demand as nodes are expanded.
- ⏱️ Optimized to handle large, deeply nested trees smoothly.
- 🎯 Type-safe with full TypeScript support.
- 🛠️ Built for Vue 3 leveraging its latest features and improvements.

[!Component Markup Screenshot](src/assets/preview.png)

## Installation

```
npm i vue-tree-view
```

## 🚀 Usage

The useTreeView composable gives you the state and logic for rendering your tree however you like.
You control all the markup and styling.

```vue
<template>
  <ul>
    <li v-for="node in tree" :key="node.id">
      <div @click="toggleNode(node)">
        {{ node.label }}
      </div>
      <ul v-if="isOpen(node)">
        <li v-for="child in node.children" :key="child.id">
          {{ child.label }}
        </li>
      </ul>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTreeView } from 'vue-tree-view';

const nodes = ref([
  {
    id: 1,
    label: 'Root',
    children: [
      { id: 2, label: 'Child A', children: [] },
      { id: 3, label: 'Child B', children: [] },
    ],
  },
]);

const { tree, toggleNode, isOpen } = useTreeView(nodes);
</script>
```
