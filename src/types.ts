export interface INode {
  id: string;
  name?: string;
  children?: INode[];
}

export type ConditionFn<T> = (node: T) => boolean;

export type AsyncVoidFunction = () => Promise<void>;
