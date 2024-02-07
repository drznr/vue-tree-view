import { MOCK_TREE } from './__mocks__/tree.mock';
import { debounce, traverse, getAllNodesValuesUnique, traverseAndCheck, traverseAndCheckAll } from './utils';

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

  describe('getAllNodesValuesUnique()', () => {
    it('should collect all node ids to a set', () => {
      expect(getAllNodesValuesUnique(MOCK_TREE)).toEqual(
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

  describe('traverseAndCheck()', () => {
    it('should return true if one node meet given condition fn', () => {
      expect(traverseAndCheck(MOCK_TREE, node => node.id === '1')).toBe(true);
      expect(traverseAndCheck(MOCK_TREE, node => node.id === '10006')).toBe(true);
      expect(traverseAndCheck(MOCK_TREE, node => node.name === 'Leopard')).toBe(true);
      expect(traverseAndCheck(MOCK_TREE, node => node.id === '102')).toBe(true);
      expect(traverseAndCheck(MOCK_TREE, node => node.id === '1003')).toBe(true);
    });

    it('should return false if any node does not meet given condition fn', () => {
      expect(traverseAndCheck(MOCK_TREE, node => node.id === '100066')).toBe(false);
      expect(traverseAndCheck(MOCK_TREE, node => node.name === 'Mouse')).toBe(false);
    });
  });

  describe('traverseAndCheckAll()', () => {
    it('should return true if all nodes meet given condition fn', () => {
      expect(traverseAndCheckAll(MOCK_TREE, node => typeof node.id === 'string')).toBe(true);
      expect(traverseAndCheckAll(MOCK_TREE, node => !!node.name)).toBe(true);
      expect(traverseAndCheckAll(MOCK_TREE, node => !node.children || !!node.children.length)).toBe(true);
      expect(traverseAndCheckAll(MOCK_TREE, node => !!node.children?.length || +node.id > 10_000)).toBe(true);
    });

    it('should return false if any node does not meet given condition fn', () => {
      expect(traverseAndCheckAll(MOCK_TREE, node => node.id === '10006')).toBe(false);
      expect(traverseAndCheckAll(MOCK_TREE, node => !!node.children?.length)).toBe(false);
      expect(traverseAndCheckAll(MOCK_TREE, node => !!node.children?.length && +node.id > 10_000)).toBe(false);
    });
  });
});
