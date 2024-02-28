<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import TreeView from '../tree-view.vue';
import { ATC_TREE } from '../__mocks__/atc';
import { useStorySetup } from './use-story-setup';
import colors from 'vuetify/util/colors';

const { model, updateModel, handleError } = useStorySetup();
</script>

<template>
  <v-app>
    <v-main>
      <tree-view :nodes="ATC_TREE" :model-value="model" @update:model-value="updateModel" @on-error="handleError">
        <template
          #controls="{ collapseAll, expandAll, search, expandToSelection, selectAll, unselectAll, filter, resetFilter }"
        >
          <div class="d-flex align-center py-4 mb-4" :style="{ borderBottom: `1px solid ${colors.grey.lighten2}` }">
            <v-btn variant="outlined" class="btn mr-2" @click="expandAll"> Expand All </v-btn>
            <v-btn variant="outlined" class="btn mr-2" @click="collapseAll"> Collapse All </v-btn>
            <v-btn variant="outlined" class="btn mr-2" @click="selectAll"> Select All </v-btn>
            <v-btn variant="outlined" class="btn mr-2" @click="unselectAll"> Unselect All </v-btn>
            <v-btn variant="outlined" class="btn mr-2" @click="expandToSelection"> View Selected </v-btn>

            <v-text-field
              label="Search"
              variant="outlined"
              density="compact"
              class="mr-2 input"
              hide-details="auto"
              @update:model-value="(value: string) => (value ? search({ key: 'name', term: value }) : collapseAll())"
            />

            <v-text-field
              label="Filter"
              variant="outlined"
              density="compact"
              class="mr-2 input"
              hide-details="auto"
              @update:model-value="(value: string) => (value ? filter({ key: 'name', term: value }) : resetFilter())"
            />

            <v-tooltip :text="model.join(', ')" :disabled="!model.length">
              <template #activator="{ props }">
                <span v-bind="props" class="text-subtitle-2">{{ model.length }} Selected</span>
              </template>
            </v-tooltip>
          </div>
        </template>

        <template #node-content="{ node, expanded, selected, indeterminate, toggleExpand, toggleSelect }">
          <div class="d-flex align-center my-2" @click="toggleExpand">
            <v-icon
              icon="$vuetify"
              :color="expanded ? 'primary' : 'default'"
              class="mr-4 primary"
              :class="{ 'rotate-90': expanded, invisible: !node.children?.length }"
            />

            <v-checkbox
              :model-value="selected"
              :indeterminate="indeterminate"
              class="mr-4"
              density="compact"
              hide-details
              color="primary"
              @click.stop=""
              @update:model-value="(value: boolean) => toggleSelect(!value)"
            />

            <div class="text-subtitle-1">
              <span class="font-weight-bold mr-4">
                {{ node.id }}
              </span>

              {{ node.name }}
            </div>
          </div>
        </template>
      </tree-view>
    </v-main>
  </v-app>
</template>

<style scoped>
.input {
  max-width: 240px;
}
.btn {
  height: 40px;
}
.rotate-90 {
  transform: rotate(-90deg);
}
</style>
