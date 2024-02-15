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
                <button style="margin-inline-end: 8px;" @click="expandAll">Expand All</button>
                <button style="margin-inline-end: 8px;" @click="collapseAll">Collapse All</button>
                <button style="margin-inline-end: 8px;" @click="selectAll">Select All</button>
                <button style="margin-inline-end: 8px;" @click="unselectAll">Unselect All</button>
                <button style="margin-inline-end: 8px;" @click="expandToSelection">View Selected</button>

                <span style="margin-inline-end: 8px;">
                    <input
                        type="text"
                        placeholder="Search"
                        @input="
                            ev => {
                            const { value } = ev.target;
                            if (!value) return collapseAll();

                            search(node => !!node.name?.toLowerCase().includes(value.toLowerCase()));
                            }
                        "
                    />
                </span>

                <span style="margin-inline-end: 8px;">
                    <input
                        type="text"
                        placeholder="Filter"
                        @input="
                            ev => {
                                const { value } = ev.target;
                                if (!value) return resetFilter();

                                filter(node => !!node.name?.toLowerCase().includes(value.toLowerCase()));
                            }
                        "
                    />
                </span>

                <span>{{ model.length }} Selected</span>
            </template>

            <template #node-content="{ node, expanded, selected, indeterminate, toggleExpand, toggleSelection }">
                <div style="margin-block: 8px;display: flex;flex-direction: row;align-items: center;" @click="toggleExpand">
                <span
                    :style="{ visibility: node.children?.length ? 'visible' : 'hidden', marginInlineEnd: '24px' }"
                    :class="{ rotate: expanded }"
                >
                    &#x25B6;
                </span>

                <span style="margin-inline-end: 24px;" @click.stop="">
                    <input
                        type="checkbox"
                        :checked="selected"
                        :indeterminate="indeterminate"
                        @change="ev => toggleSelection(!ev.target.checked)"
                    />
                </span>

                <span style="margin-inline-end: 24px;font-weight: 700;">
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
