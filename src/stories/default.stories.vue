<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import TreeView from '../tree-view.vue';
import { ATC_TREE } from '../__mocks__/atc';
import { useStorySetup } from './use-story-setup';

const { model, updateModel, handleError } = useStorySetup();
</script>

<template>
  <tree-view :nodes="ATC_TREE" :model-value="model" @update:model-value="updateModel" @on-error="handleError">
    <template
      #controls="{ collapseAll, expandAll, search, expandToSelection, selectAll, unselectAll, filter, resetFilter }"
    >
      <button
        class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 me-2"
        @click="expandAll"
      >
        Expand All
      </button>
      <button
        class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 me-2"
        @click="collapseAll"
      >
        Collapse All
      </button>
      <button
        class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 me-2"
        @click="selectAll"
      >
        Select All
      </button>
      <button
        class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 me-2"
        @click="unselectAll"
      >
        Unselect All
      </button>
      <button
        class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 me-2"
        @click="expandToSelection"
      >
        View Selected
      </button>

      <span class="me-2">
        <input
          type="text"
          placeholder="Search"
          class="g-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          @input="
            ev => {
              const { value } = ev.target as HTMLInputElement;
              if (!value) return collapseAll();

              search({ key: 'name', term: value });
            }
          "
        />
      </span>

      <span class="me-2">
        <input
          type="text"
          placeholder="Filter"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          @input="
            ev => {
              const { value } = ev.target as HTMLInputElement;
              if (!value) return resetFilter();

              filter({ key: 'name', term: value });
            }
          "
        />
      </span>

      <span class="font-sans" :title="model.join(', ')">{{ model.length }} Selected</span>
    </template>

    <template #node-content="{ node, expanded, selected, indeterminate, toggleExpand, toggleSelect, fetching, error }">
      <div class="flex flex-row items-center my-2" @click="toggleExpand">
        <svg v-if="fetching" class="me-4" width="16px" height="16px" viewBox="0 0 32 32">
          <rect x="0" y="0" width="100%" height="100%" fill="#FFFFFF" />
          <g>
            <path
              d="M64 128A64 64 0 0 1 18.34 19.16L21.16 22a60 60 0 1 0 52.8-17.17l.62-3.95A64 64 0 0 1 64 128z"
              fill="#000000"
            />
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 64 64"
              to="360 64 64"
              dur="1800ms"
              repeatCount="indefinite"
            />
          </g>
        </svg>
        <span v-else :class="{ 'rotate-90': expanded, invisible: !node.children?.length }" class="me-4">
          <svg class="w-4 h-4 text-gray-800 dark:text-white" aria-hidden="true" fill="currentColor">
            <path d="M3.414 1A2 2 0 0 0 0 2.414v11.172A2 2 0 0 0 3.414 15L9 9.414a2 2 0 0 0 0-2.828L3.414 1Z" />
          </svg>
        </span>

        <span class="me-4" @click.stop="">
          <input
            type="checkbox"
            :checked="selected"
            :indeterminate="indeterminate"
            @change="ev => toggleSelect(!(ev.target as HTMLInputElement).checked)"
          />
        </span>

        <span class="font-bold">
          {{ node.id }}
        </span>

        <span class="ms-4">{{ node.name }}</span>

        <span v-if="error" class="ms-4">someting went wrong!</span>
      </div>
    </template>
  </tree-view>
</template>
