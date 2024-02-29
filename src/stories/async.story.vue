<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ASYNC_TREE, getMockChildren } from '../__mocks__/async';
import TreeView from '../tree-view.vue';
import { useStorySetup } from './use-story-setup';
import colors from 'vuetify/util/colors';

const { model, updateModel, handleError } = useStorySetup();
</script>

<template>
  <v-app>
    <v-main>
      <v-tooltip :text="model.join(', ')" :disabled="!model.length">
        <template #activator="{ props }">
          <div
            v-bind="props"
            class="d-flex flex-row-reverse align-center pb-4 mb-4"
            :style="{ borderBottom: `1px solid ${colors.grey.lighten2}` }"
            :title="model.join(', ')"
          >
            {{ model.length }} Selected
          </div>
        </template>
      </v-tooltip>

      <tree-view
        :nodes="ASYNC_TREE"
        :fetch-children="getMockChildren"
        :model-value="model"
        @update:model-value="updateModel"
        @on-error="handleError"
      >
        <template
          #node-content="{ node, expanded, selected, indeterminate, toggleExpand, asyncToggleSelect, fetching, error }"
        >
          <div class="d-flex align-center my-2" @click="toggleExpand">
            <v-icon
              :icon="fetching ? 'mdi-loading' : 'mdi-chevron-down'"
              class="mr-4"
              :color="!fetching && expanded ? 'primary' : 'default'"
              :class="{
                'rotate-90': !expanded && !fetching,
                invisible: !node.children?.length && !fetching,
                spin: fetching,
              }"
            />

            <v-checkbox
              :model-value="selected"
              :indeterminate="indeterminate"
              class="mr-4"
              density="compact"
              hide-details
              color="primary"
              @click.stop=""
              @update:model-value="value => asyncToggleSelect(!value)"
            />

            <div class="text-subtitle-1">
              <span class="font-weight-bold mr-4">
                {{ node.id }}
              </span>

              {{ node.name }}

              <span v-if="error" class="ms-4">someting went wrong!</span>
            </div>
          </div>
        </template>
      </tree-view>
    </v-main>
  </v-app>
</template>

<style scoped>
.rotate-90 {
  transform: rotate(-90deg);
}

.spin {
  animation: rotate 1.5s linear infinite;
}
@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
