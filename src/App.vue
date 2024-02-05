<script setup lang="ts">
import treeView from './tree-view/tree-view.vue';
import atc from './assets/atc.json';
</script>

<template>
    <tree-view :nodes="atc" />
</template>
