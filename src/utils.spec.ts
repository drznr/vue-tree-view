import { ANIMALS_TREE } from './__mocks__/animals';
import {
  debounce,
  traverse,
  getAllNodesValuesUnique,
  traverseAndCheck,
  traverseAndCheckAll,
  filterNodes,
  traverseAsync,
  getNodeChildren,
  getNodeId,
} from './utils';

describe('Tree View Utils', () => {
  describe('traverse()', () => {
    const handlerSpy = vi.fn();

    it('should run given handler for all tree nodes', () => {
      traverse(ANIMALS_TREE, 'children', handlerSpy);

      expect(handlerSpy).toHaveBeenCalledTimes(19);
      expect(handlerSpy).toHaveBeenNthCalledWith(1, expect.objectContaining({ id: '1' }), 0);
      expect(handlerSpy).toHaveBeenLastCalledWith(expect.objectContaining({ id: '10011' }), 3);
    });
  });

  describe('traverseAsync()', () => {
    const handlerSpy = vi.fn();

    it('should run given handler for all tree nodes', async () => {
      await traverseAsync(ANIMALS_TREE, 'children', handlerSpy);

      expect(handlerSpy).toHaveBeenCalledTimes(19);
      expect(handlerSpy).toHaveBeenNthCalledWith(1, expect.objectContaining({ id: '1' }), 0);
      expect(handlerSpy).toHaveBeenLastCalledWith(expect.objectContaining({ id: '10011' }), 3);
    });
  });

  describe('debounce()', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should debounce function calls', () => {
      const callback = vi.fn();
      const debounced = debounce(callback, 500);

      debounced();
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      debounced();
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(499);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAllNodesValuesUnique()', () => {
    it('should collect all node ids to a set', () => {
      expect(getAllNodesValuesUnique(ANIMALS_TREE, 'children', 'id')).toEqual(
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

    it('should collect all node ids after condition fn filtering to a set', () => {
      expect(getAllNodesValuesUnique(ANIMALS_TREE, 'children', 'id', node => !node.children)).toEqual(
        new Set(['10001', '10002', '10003', '10004', '10005', '10006', '10007', '10008', '10009', '10010', '10011'])
      );
    });
  });

  describe('traverseAndCheck()', () => {
    it('should return true if one node meet given condition fn', () => {
      expect(traverseAndCheck(ANIMALS_TREE, 'children', node => node.id === '1')).toBe(true);
      expect(traverseAndCheck(ANIMALS_TREE, 'children', node => node.id === '10006')).toBe(true);
      expect(traverseAndCheck(ANIMALS_TREE, 'children', node => node.name === 'Leopard')).toBe(true);
      expect(traverseAndCheck(ANIMALS_TREE, 'children', node => node.id === '102')).toBe(true);
      expect(traverseAndCheck(ANIMALS_TREE, 'children', node => node.id === '1003')).toBe(true);
    });

    it('should return false if any node does not meet given condition fn', () => {
      expect(traverseAndCheck(ANIMALS_TREE, 'children', node => node.id === '100066')).toBe(false);
      expect(traverseAndCheck(ANIMALS_TREE, 'children', node => node.name === 'Mouse')).toBe(false);
    });
  });

  describe('traverseAndCheckAll()', () => {
    it('should return true if all nodes meet given condition fn', () => {
      expect(traverseAndCheckAll(ANIMALS_TREE, 'children', node => typeof node.id === 'string')).toBe(true);
      expect(traverseAndCheckAll(ANIMALS_TREE, 'children', node => !!node.name)).toBe(true);
      expect(traverseAndCheckAll(ANIMALS_TREE, 'children', node => !node.children || !!node.children.length)).toBe(
        true
      );
      expect(traverseAndCheckAll(ANIMALS_TREE, 'children', node => !!node.children?.length || +node.id > 10_000)).toBe(
        true
      );
    });

    it('should return false if any node does not meet given condition fn', () => {
      expect(traverseAndCheckAll(ANIMALS_TREE, 'children', node => node.id === '10006')).toBe(false);
      expect(traverseAndCheckAll(ANIMALS_TREE, 'children', node => !!node.children?.length)).toBe(false);
      expect(traverseAndCheckAll(ANIMALS_TREE, 'children', node => !!node.children?.length && +node.id > 10_000)).toBe(
        false
      );
    });
  });

  describe('filterNodes()', () => {
    it('should return filtered nodes that meet condition fn', () => {
      expect(filterNodes([ANIMALS_TREE], 'children', node => node.name === 'Flying lizard')).toEqual([
        {
          id: '1',
          name: 'Animals',
          children: [
            {
              id: '102',
              name: 'Reptiles',
              children: [
                {
                  id: '1003',
                  name: 'Lizards',
                  children: [
                    {
                      id: '10007',
                      name: 'Flying lizard',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);

      expect(filterNodes([ANIMALS_TREE], node => !!node.name?.toLowerCase().includes('iguana'))).toEqual([
        {
          id: '1',
          name: 'Animals',
          children: [
            {
              id: '102',
              name: 'Reptiles',
              children: [
                {
                  id: '1004',
                  name: 'Iguanas',
                  children: [
                    {
                      id: '10008',
                      name: 'Green iguana',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);

      expect(filterNodes([ANIMALS_TREE], node => node.name?.split(' ').length === 3)).toEqual([
        {
          id: '1',
          name: 'Animals',
          children: [
            {
              id: '102',
              name: 'Reptiles',
              children: [
                {
                  id: '1003',
                  name: 'Lizards',
                  children: [
                    {
                      id: '10006',
                      name: 'Western green lizard',
                    },
                  ],
                },
                {
                  id: '1005',
                  name: 'Turtles',
                  children: [
                    {
                      id: '10009',
                      name: 'Common snapping turtle',
                    },
                    {
                      id: '10011',
                      name: 'Chinese softshell turtle',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);
    });

    it('should return null if no nodes meet condition fn', () => {
      expect(filterNodes([ANIMALS_TREE], 'children', node => node.name === 'MISSING VALUE')).toEqual([]);
    });
  });

  describe('getNodeChildren()', () => {
    it('should return valid children from object', () => {
      expect(getNodeChildren({ children: undefined }, 'children')).toBeUndefined();
      expect(getNodeChildren({ custom: [] }, 'custom')).toEqual([]);
      expect(getNodeChildren({ children: [1, 2, 3], other: 1 }, 'children')).toEqual([1, 2, 3]);
    });

    it('should throw an error if children are not valid', async () => {
      await expect(async () => getNodeChildren({ children: null }, 'children')).rejects.toThrowError();
      await expect(async () => getNodeChildren({ custom: { children: [] } }, 'custom')).rejects.toThrowError();
      await expect(async () => getNodeChildren({ children: 2, other: [] }, 'children')).rejects.toThrowError();
      await expect(async () => getNodeChildren({ children: '' }, 'children')).rejects.toThrowError();
    });
  });

  describe('getNodeId()', () => {
    it('should return valid id from object', () => {
      expect(getNodeId({ id: '1' }, 'id')).toBe('1');
      expect(getNodeId({ custom: '123' }, 'custom')).toBe('123');
      expect(getNodeId({ id: '321', other: 1 }, 'id')).toBe('321');
    });

    it('should throw an error if id is not valid', async () => {
      await expect(async () => getNodeId({ id: null }, 'id')).rejects.toThrowError();
      await expect(async () => getNodeId({ custom: { id: [] } }, 'custom')).rejects.toThrowError();
      await expect(async () => getNodeId({ id: 2, other: [] }, 'id')).rejects.toThrowError();
      await expect(async () => getNodeId({ id: undefined }, 'id')).rejects.toThrowError();
    });
  });
});
