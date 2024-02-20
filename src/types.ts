export interface INode {
  id: string;
  name?: string;
  children?: INode[];
}

export type ConditionFn = (node: INode) => boolean;

export type AsyncVoidFunction = () => Promise<void>;
