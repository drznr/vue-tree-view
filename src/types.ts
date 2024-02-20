export interface INode {
  id: string;
  name?: string;
  children?: INode[];
}

export type ConditionFn<T> = (node: T, depth?: number) => boolean;

export type AsyncVoidFunction = () => Promise<void>;
