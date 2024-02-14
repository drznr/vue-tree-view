import { mount, type ComponentMountingOptions } from '@vue/test-utils';
import treeView from './tree-view.vue';
import { MOCK_TREE } from './__mocks__/tree.mock';
import { type TestWrapper } from '../../vitest.setup';
import { type INode } from './types';
import { TREE_NODE_TEST_ID } from './components/tree-node.vue';

describe('<tree-view />', () => {
  const mountComponent = (options?: ComponentMountingOptions<typeof treeView>) => {
    return mount(treeView, {
      props: {
        nodes: MOCK_TREE,
      },
      ...options,
    }) as unknown as TestWrapper<typeof treeView>;
  };

  describe('expanding', () => {
    it('should render root level by default', () => {
      const wrapper = mountComponent();

      const nodes = wrapper.findAllByTestId(TREE_NODE_TEST_ID);

      expect(nodes).toHaveLength(1);
    });

    it('should render all nodes if specified | defaultExpandAll prop', () => {
      const wrapper = mountComponent({
        props: {
          nodes: MOCK_TREE,
          defaultExpandAll: true,
        },
      });

      const nodes = wrapper.findAllByTestId(TREE_NODE_TEST_ID);

      expect(nodes).toHaveLength(19);
      expect(wrapper.findByText('Chinese softshell turtle')).toBeTruthy();
    });

    it('should allow expanding all nodes | expandAll', async () => {
      const wrapper = mountComponent();

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);

      wrapper.vm.expandAll();
      await wrapper.vm.$nextTick();

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(19);
    });

    it('should allow manual expanding of nodes', async () => {
      const wrapper = mountComponent({
        slots: {
          controls: '',
          'node-content': `
            <template #node-content="scope">
              <div @click="scope.toggleExpand" class="slotted-el" />
            </template>
          `,
        },
      });

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);

      // open root node
      await wrapper.find('.slotted-el').trigger('click');
      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(3);

      // close root node
      await wrapper.find('.slotted-el').trigger('click');
      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);
    });

    it('should expand to matching nodes by given search fn', async () => {
      const wrapper = mountComponent();

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(1);

      wrapper.vm.search((node: INode) => !!node.name?.includes('lizard'));
      await wrapper.vm.$nextTick();

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(8);
    });

    it('should expand to selected nodes', async () => {
      const wrapper = mountComponent({
        props: {
          nodes: MOCK_TREE,
          modelValue: ['10006', '10007'],
        },
      });

      wrapper.vm.expandToSelection();
      await wrapper.vm.$nextTick();

      expect(wrapper.findAllByTestId(TREE_NODE_TEST_ID)).toHaveLength(8);
    });
  });
});
