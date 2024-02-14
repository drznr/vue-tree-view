import { mount } from '@vue/test-utils';
import treeView from './tree-view.vue';
import { MOCK_TREE } from './__mocks__/tree.mock';
import { type TestWrapper } from '../../vitest.setup';

describe('<tree-view />', () => {
  describe('expanding', () => {
    it('should render root level by default', () => {
      const wrapper = mount(treeView, {
        props: {
          nodes: MOCK_TREE,
        },
      });

      const nodes = wrapper.findAll('li');

      expect(nodes).toHaveLength(1);
    });

    it('should render all nodes if specified | defaultExpandAll prop', () => {
      const wrapper = mount(treeView, {
        props: {
          nodes: MOCK_TREE,
          defaultExpandAll: true,
        },
      }) as unknown as TestWrapper;

      const nodes = wrapper.findAll('li');

      expect(nodes).toHaveLength(19);
      expect(wrapper.findByText('Chinese softshell turtle')).toBeTruthy();
    });

    it('should allow expanding all nodes | expandAll', async () => {
      const wrapper = mount(treeView, {
        props: {
          nodes: MOCK_TREE,
        },
      }) as unknown as TestWrapper<typeof treeView>;

      expect(wrapper.findAll('li')).toHaveLength(1);

      wrapper.vm.expandAll();
      await wrapper.vm.$nextTick();

      expect(wrapper.findAll('li')).toHaveLength(19);
    });

    it('should allow manual expanding of nodes', async () => {
      const wrapper = mount(treeView, {
        props: {
          nodes: MOCK_TREE,
        },
        slots: {
          controls: '',
          'node-content': `
            <template #node-content="scope">
              <div @click="scope.toggleExpand" class="slotted-el" />
            </template>
          `,
        },
      }) as unknown as TestWrapper<typeof treeView>;

      expect(wrapper.findAll('li')).toHaveLength(1);

      // open root node
      await wrapper.find('.slotted-el').trigger('click');
      expect(wrapper.findAll('li')).toHaveLength(3);

      // close root node
      await wrapper.find('.slotted-el').trigger('click');
      expect(wrapper.findAll('li')).toHaveLength(1);
    });
  });

  describe('', () => {});
});
