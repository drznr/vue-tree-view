import { MOCK_TREE } from './__mocks__/tree.mock';
import { traverse } from './utils';

describe('Tree View Utils', () => {
  describe('traverse()', () => {
    const handlerSpy = jest.fn();

    it('should run given handler for all tree nodes', () => {
      traverse(MOCK_TREE, handlerSpy);

      expect(handlerSpy).toHaveBeenCalledTimes(19);
      expect(handlerSpy).toHaveBeenNthCalledWith(1, expect.objectContaining({ id: '1' }));
      expect(handlerSpy).toHaveBeenLastCalledWith(expect.objectContaining({ id: '10011' }));
    });
  });
});
