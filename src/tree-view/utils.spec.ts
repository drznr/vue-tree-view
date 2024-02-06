import { MOCK_TREE } from './__mocks__/tree.mock';
import { debounce, traverse, collectAllNodesIds } from './utils';

describe('Tree View Utils', () => {
  describe('traverse()', () => {
    const handlerSpy = jest.fn();

    it('should run given handler for all tree nodes', () => {
      traverse(MOCK_TREE, handlerSpy);

      expect(handlerSpy).toHaveBeenCalledTimes(19);
      expect(handlerSpy).toHaveBeenNthCalledWith(1, expect.objectContaining({ id: '1' }), 0);
      expect(handlerSpy).toHaveBeenLastCalledWith(expect.objectContaining({ id: '10011' }), 3);
    });
  });

  describe('debounce()', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const callback = jest.fn();
      const debounced = debounce(callback, 500);

      debounced();
      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      debounced();
      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(499);
      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('collectAllNodesIds()', () => {
    it('should collect all node ids to a set', () => {
      expect(collectAllNodesIds(MOCK_TREE)).toEqual(
        new Set([
          '1',
          '10001',
          '10002',
          '10003',
          '10004',
          '10005',
          '10006',
          '10007',
          '10008',
          '10009',
          '1001',
          '10010',
          '10011',
          '1002',
          '1003',
          '1004',
          '1005',
          '101',
          '102',
        ])
      );
    });
  });
});
