export type ConditionFn<T> = (node: T, depth?: number) => boolean;

export type AsyncVoidFunction = () => Promise<void>;
