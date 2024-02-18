import type { INode } from '../types';

export const ANIMALS: INode = {
  id: '1',
  name: 'Animals',
  children: [
    {
      id: '101',
      name: 'Mammals',
      children: [
        {
          id: '1001',
          name: 'Cats',
          children: [
            {
              id: '10001',
              name: 'Lion',
            },
            {
              id: '10002',
              name: 'Leopard',
            },
            {
              id: '10003',
              name: 'Cat',
            },
          ],
        },
        {
          id: '1002',
          name: 'Primates',
          children: [
            {
              id: '10004',
              name: 'Mandrill',
            },
            {
              id: '10005',
              name: 'Baboon',
            },
          ],
        },
      ],
    },
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
            {
              id: '10007',
              name: 'Flying lizard',
            },
          ],
        },
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
        {
          id: '1005',
          name: 'Turtles',
          children: [
            {
              id: '10009',
              name: 'Common snapping turtle',
            },
            {
              id: '10010',
              name: 'Sea turtle',
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
};
