import { mount } from '@vue/test-utils';
import treeView from './tree-view.vue';
import { MOCK_TREE } from './__mocks__/tree.mock';

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
  });
});
