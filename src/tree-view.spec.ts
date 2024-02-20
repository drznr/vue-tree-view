import { mount, type ComponentMountingOptions, flushPromises } from '@vue/test-utils';
import treeView from './tree-view.vue';
import { ANIMALS_TREE } from './__mocks__/animals';
import { ASYNC_TREE, getMockChildren } from './__mocks__/async';
import { type TestWrapper } from '../vitest.setup';
import { TREE_NODE_TEST_ID } from './components/tree-node.vue';

type MountFnOptions = ComponentMountingOptions<typeof treeView>;

describe('<tree-view />', () => {
  const OPTIONS: MountFnOptions = {
    props: {
      nodes: ANIMALS_TREE,
    },
  };
  const mountComponent = (options?: MountFnOptions) => {
    return mount(treeView, {
      ...OPTIONS,
      ...options,
    }) as unknown as TestWrapper<typeof treeView>;
  };

  describe('Expanding', () => {
    const ALL_NODS_COUNT = 19;

    it('should render root level by default', () => {
      const wrapper = mountComponent();

      const nodes = wrapper.findAllByTestId(TREE_NODE_TEST_ID);

      expect(nodes).toHaveLength(1);
    });

    it('should render all nodes if specified | defaultExpandAll prop', () => {
      const wrapper = mountComponent({
        props: {
          ...OPTIONS.props,
          defaultExpandAll: true,
        },
      } as MountFnOptions);

      const nodes = wrapper.findAllByTestId(TREE_NODE_TEST_ID);

      expect(nodes).toHaveLength(ALL_NODS_COUNT);
    });

    it('should collapse all nodes on demand | collapseAll()', async () => {
      const wrapper = mountComponent({
        props: {
          ...OPTIONS.props,
          defaultExpandAll: true,
        },
      } as MountFnOptions);

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(ALL_NODS_COUNT);

      wrapper.vm.collapseAll();
      await wrapper.vm.$nextTick();

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);
    });

    it('should allow expanding all nodes | expandAll()', async () => {
      const wrapper = mountComponent();

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);

      wrapper.vm.expandAll();
      await wrapper.vm.$nextTick();

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(ALL_NODS_COUNT);
    });

    it('should allow manual expanding of nodes and supply correct indication for expanded', async () => {
      const wrapper = mountComponent({
        slots: {
          controls: '',
          'node-content': `
            <template #node-content="scope">
              <div @click="scope.toggleExpand" class="slotted-el">
                {{ scope.expanded && 'OPEN' }}
              </div>
            </template>
          `,
        },
      });

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);

      // open root node
      await wrapper.find('.slotted-el').trigger('click');
      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(3);
      expect(wrapper.findByText('OPEN')?.isVisible()).toBe(true);

      // close root node
      await wrapper.find('.slotted-el').trigger('click');
      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);
      expect(wrapper.findByText('OPEN')).toBeNull();
    });

    it('should expand to matching nodes by given search fn | search()', async () => {
      const wrapper = mountComponent();

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);

      wrapper.vm.search(node => !!node.name?.includes('lizard'));
      await wrapper.vm.$nextTick();

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(8);
    });

    it('should expand to selected nodes | expandToSelection()', async () => {
      const wrapper = mountComponent({
        props: {
          ...OPTIONS.props,
          modelValue: ['10006', '10007'],
        },
      } as MountFnOptions);

      wrapper.vm.expandToSelection();
      await wrapper.vm.$nextTick();

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(8);
    });
  });

  describe('Selecting', () => {
    const ALL_LEAFS_IDS = [
      '10001',
      '10002',
      '10003',
      '10004',
      '10005',
      '10006',
      '10007',
      '10008',
      '10009',
      '10010',
      '10011',
    ];

    it('should allow recursive selection of nodes | toggleSelection()', async () => {
      const wrapper = mountComponent({
        props: {
          nodes: [ANIMALS_TREE],
          modelValue: [],
          'onUpdate:modelValue': value => wrapper.setProps({ modelValue: value }),
        },
        slots: {
          controls: '',
          'node-content': `
            <template #node-content="{ toggleSelection }">
              <input type="checkbox" @change="ev => toggleSelection(!ev.target.checked)" />
            </template>
          `,
        },
      });

      expect(wrapper.props('modelValue')).toEqual([]);

      const checkbox = wrapper.find<HTMLInputElement>('input[type="checkbox"]');
      checkbox.element.checked = false;
      checkbox.trigger('click');
      checkbox.trigger('change');
      await wrapper.vm.$nextTick();

      expect(wrapper.props('modelValue')).toEqual(ALL_LEAFS_IDS);

      checkbox.element.checked = true;
      checkbox.trigger('click');
      checkbox.trigger('change');
      await wrapper.vm.$nextTick();

      expect(wrapper.props('modelValue')).toEqual([]);
    });

    it('should allow selection of single nodes | toggleSelection()', async () => {
      const wrapper = mountComponent({
        props: {
          nodes: [ANIMALS_TREE],
          defaultExpandAll: true,
          modelValue: [],
          'onUpdate:modelValue': value => wrapper.setProps({ modelValue: value }),
        },
        slots: {
          controls: '',
          'node-content': `
            <template #node-content="{ node, toggleSelection }">
              <input type="checkbox" :class="node.name" @change="ev => toggleSelection(!ev.target.checked)" />
            </template>
          `,
        },
      });

      const checkbox = wrapper.find<HTMLInputElement>('.Leopard');

      checkbox.element.checked = false;
      checkbox.trigger('click');
      checkbox.trigger('change');
      await wrapper.vm.$nextTick();

      expect(wrapper.props('modelValue')).toEqual(['10002']);

      checkbox.element.checked = true;
      checkbox.trigger('click');
      checkbox.trigger('change');
      await wrapper.vm.$nextTick();

      expect(wrapper.props('modelValue')).toEqual([]);
    });

    it('should select all nodes on demand | selectAll()', async () => {
      const wrapper = mountComponent({
        props: {
          nodes: [ANIMALS_TREE],
          modelValue: [],
          'onUpdate:modelValue': value => wrapper.setProps({ modelValue: value }),
        },
      });

      wrapper.vm.selectAll();
      await wrapper.vm.$nextTick();

      expect(wrapper.props('modelValue')).toEqual(ALL_LEAFS_IDS);
    });

    it('should unselect all nodes on demand | unselectAll()', async () => {
      const wrapper = mountComponent({
        props: {
          nodes: [ANIMALS_TREE],
          modelValue: ALL_LEAFS_IDS,
          'onUpdate:modelValue': value => wrapper.setProps({ modelValue: value }),
        },
      });

      wrapper.vm.unselectAll();
      await wrapper.vm.$nextTick();

      expect(wrapper.props('modelValue')).toEqual([]);
    });

    it('should supply correct indications if selected / childs selected', async () => {
      const wrapper = mountComponent({
        props: {
          nodes: [ANIMALS_TREE],
          modelValue: [],
          'onUpdate:modelValue': value => wrapper.setProps({ modelValue: value }),
        },
        slots: {
          controls: '',
          'node-content': `
            <template #node-content="{ toggleSelection, selected, indeterminate }">
              <input type="checkbox" :class="'box_' + node.name" @change="ev => toggleSelection(!ev.target.checked)" />
              <span :class="node.name">
                {{ selected ? 'SELECTED' : '' }}
                {{ indeterminate ? 'INDETERMINATE' : '' }}
              </span>
            </template>
          `,
        },
      });

      expect(wrapper.props('modelValue')).toEqual([]);

      const rootCheckbox = wrapper.find<HTMLInputElement>('.box_Animals');
      rootCheckbox.element.checked = false;
      rootCheckbox.trigger('click');
      rootCheckbox.trigger('change');
      await wrapper.vm.$nextTick();

      // root selected as all siblings selected
      expect(wrapper.props('modelValue')).toEqual(ALL_LEAFS_IDS);
      expect(wrapper.get('.Animals').text()).toBe('SELECTED');

      wrapper.vm.expandAll();
      await wrapper.vm.$nextTick();

      const leafCheckbox = wrapper.find<HTMLInputElement>('.box_Leopard');
      leafCheckbox.element.checked = true;
      leafCheckbox.trigger('click');
      leafCheckbox.trigger('change');
      await wrapper.vm.$nextTick();

      // leaf is unselected and root is indeterminate
      expect(wrapper.props('modelValue')).toEqual(ALL_LEAFS_IDS.filter(id => id !== '10002'));
      expect(wrapper.get('.Leopard').text()).toBe('');
      expect(wrapper.get('.Animals').text()).toBe('INDETERMINATE');

      rootCheckbox.element.checked = true;
      rootCheckbox.trigger('click');
      rootCheckbox.trigger('change');
      await wrapper.vm.$nextTick();

      // unselected all
      expect(wrapper.props('modelValue')).toEqual([]);
      expect(wrapper.get('.Animals').text()).toBe('');
    });
  });

  describe('Filtering', () => {
    it('should filter nodes by given condition fn | filter()', async () => {
      const wrapper = mountComponent();

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);

      wrapper.vm.filter(node => node.name === 'Baboon');
      await wrapper.vm.$nextTick();

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(4);
    });

    it('should return to initial state on demand | resetFilter()', async () => {
      const wrapper = mountComponent();

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);

      wrapper.vm.filter(node => node.name === 'Baboon');
      await wrapper.vm.$nextTick();

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(4);

      wrapper.vm.resetFilter();
      await wrapper.vm.$nextTick();

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);
    });
  });

  describe('Async | fetchChildren()', () => {
    const ASYNC_OPTIONS: MountFnOptions = {
      props: {
        nodes: ASYNC_TREE,
        fetchChildren: getMockChildren,
      },
    };
    const mountComponentAsyncMode = (options: MountFnOptions = {}) => mountComponent({ ...ASYNC_OPTIONS, ...options });

    describe('Expanding', () => {
      const ALL_NODS_COUNT = 81;

      it('should render root level by default', () => {
        const wrapper = mountComponentAsyncMode();

        const nodes = wrapper.findAllByTestId(TREE_NODE_TEST_ID);

        expect(nodes).toHaveLength(1);
      });

      it('should render all nodes if specified | defaultExpandAll prop', async () => {
        const wrapper = mountComponentAsyncMode({
          props: {
            ...ASYNC_OPTIONS.props,
            defaultExpandAll: true,
          },
        } as MountFnOptions);

        await idle();

        const nodes = wrapper.findAllByTestId(TREE_NODE_TEST_ID);

        expect(nodes).toHaveLength(ALL_NODS_COUNT);
      });

      it('should collapse all nodes on demand | collapseAll()', async () => {
        const wrapper = mountComponentAsyncMode({
          props: {
            ...ASYNC_OPTIONS.props,
            defaultExpandAll: true,
          },
        } as MountFnOptions);

        await idle();

        expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(ALL_NODS_COUNT);

        wrapper.vm.collapseAll();
        await wrapper.vm.$nextTick();

        expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);
      });

      it('should allow expanding all nodes | expandAll()', async () => {
        const wrapper = mountComponentAsyncMode();

        expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);

        await wrapper.vm.expandAll();
        await wrapper.vm.$nextTick();

        expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(ALL_NODS_COUNT);
      });

      it('should allow manual expanding of nodes and supply correct indication for expanded', async () => {
        const wrapper = mountComponentAsyncMode({
          slots: {
            controls: '',
            'node-content': `
              <template #node-content="scope">
                <div @click="scope.toggleExpand" class="slotted-el">
                  {{ scope.expanded && 'OPEN' }}
                </div>
              </template>
            `,
          },
        });

        expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);

        // open root node
        await wrapper.find('.slotted-el').trigger('click');
        expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(3);
        expect(wrapper.findByText('OPEN')?.isVisible()).toBe(true);

        // close root node
        await wrapper.find('.slotted-el').trigger('click');
        expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);
        expect(wrapper.findByText('OPEN')).toBeNull();
      });

      it('should expand to matching nodes by given search fn | search()', async () => {
        const wrapper = mountComponentAsyncMode();

        expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);

        await wrapper.vm.search(node => node.id === '1.1.1.1.1');
        await wrapper.vm.$nextTick();

        expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(12);
      });

      it('should expand to selected nodes | expandToSelection()', async () => {
        const wrapper = mountComponentAsyncMode({
          props: {
            ...ASYNC_OPTIONS.props,
            modelValue: ['1.1.1.1.1', '1.1.0.0.2'],
            defaultExpandAll: true,
          },
        } as MountFnOptions);

        await idle();

        wrapper.vm.collapseAll();
        await wrapper.vm.$nextTick();

        expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);

        wrapper.vm.expandToSelection();
        await wrapper.vm.$nextTick();

        expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(18);
      });
    });

    describe('Filtering', () => {
      it('should filter nodes by given condition fn | filter()', async () => {
        const wrapper = mountComponentAsyncMode();

        expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);

        await wrapper.vm.filter(node => node.id === '1.1.1.1.1');

        await flushPromises();

        expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(5);
      });

      it('should return to initial state on demand | resetFilter()', async () => {
        const wrapper = mountComponentAsyncMode();

        expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);

        await wrapper.vm.filter(node => node.id === '1.1.1.1.1');
        await flushPromises();

        expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(5);

        wrapper.vm.resetFilter();
        await wrapper.vm.$nextTick();

        expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);
      });
    });
  });
});

async function idle(timeout = 3000) {
  // flushPromises won't wait for un suspensed operation on component mounting
  await new Promise(resolve => window.setTimeout(resolve, timeout));
}
