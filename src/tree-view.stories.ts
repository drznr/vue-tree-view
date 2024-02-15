import type { Meta, StoryObj } from '@storybook/vue3';
import TreeView from './tree-view.vue';
import { MOCK_TREE as ANIMALS } from './__mocks__/tree.mock';
import ATC_TREE from './assets/atc.json';
import { ref } from 'vue';

export default {
  title: 'Tree View',
  component: TreeView,
  tags: ['autodocs'],
} satisfies Meta;

type Story = StoryObj<typeof TreeView>;

const BaseTemplate: Story = {
  render: args => ({
    components: { TreeView },
    setup() {
      global.structuredClone = (value: unknown) => JSON.parse(JSON.stringify(value));

      const model = ref<string[]>([]);
      const updateModel = (event: string[]) => {
        model.value = event;
        args['onUpdate:modelValue']?.(event);
      };

      return { args, model, updateModel };
    },
    template: `
        <tree-view v-bind="args" :modelValue="model" @update:modelValue="updateModel">
            <template #controls="{ collapseAll, expandAll, search, expandToSelection, selectAll, unselectAll, filter, resetFilter }">
                <button class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 me-2" @click="expandAll">Expand All</button>
                <button class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 me-2" @click="collapseAll">Collapse All</button>
                <button class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 me-2" @click="selectAll">Select All</button>
                <button class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 me-2" @click="unselectAll">Unselect All</button>
                <button class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 me-2" @click="expandToSelection">View Selected</button>

                <span class="me-2">
                    <input
                        type="text"
                        placeholder="Search"
                        class="g-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        @input="
                            ev => {
                            const { value } = ev.target;
                            if (!value) return collapseAll();

                            search(node => !!node.name?.toLowerCase().includes(value.toLowerCase()));
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
                                const { value } = ev.target;
                                if (!value) return resetFilter();

                                filter(node => !!node.name?.toLowerCase().includes(value.toLowerCase()));
                            }
                        "
                    />
                </span>

                <span class="font-sans">{{ model.length }} Selected</span>
            </template>

            <template #node-content="{ node, expanded, selected, indeterminate, toggleExpand, toggleSelection }">
                <div class="flex flex-row items-center my-2" @click="toggleExpand">
                <span
                    :class="{ 'rotate-90': expanded, invisible: !node.children?.length }"
                    class="me-6"
                >
                <svg class="w-4 h-4 text-gray-800 dark:text-white" aria-hidden="true" fill="currentColor">
                    <path d="M3.414 1A2 2 0 0 0 0 2.414v11.172A2 2 0 0 0 3.414 15L9 9.414a2 2 0 0 0 0-2.828L3.414 1Z" />
                </svg>
                </span>

                <span class="me-6" @click.stop="">
                    <input
                        type="checkbox"
                        :checked="selected"
                        :indeterminate="indeterminate"
                        @change="ev => toggleSelection(!ev.target.checked)"
                    />
                </span>

                <span class="me-6 font-bold">
                    {{ node.id }}
                </span>

                <span v-if="node.name">{{ node.name }}</span>
                </div>
            </template>
        </tree-view>
    `,
  }),
};

export const Animals: Story = {
  ...BaseTemplate,
  args: {
    nodes: ANIMALS,
  },
};

export const ATC: Story = {
  ...BaseTemplate,
  args: {
    nodes: ATC_TREE,
  },
};
