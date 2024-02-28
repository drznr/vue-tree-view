export type ConditionFn<T> = (node: T, depth?: number) => boolean;

type QueryByKeyPayload<T> = { key: keyof T; term: string };

export type TQueryBy<T> = QueryByKeyPayload<T> | ConditionFn<T>;

export function isQueryByKey<T>(query: TQueryBy<T>): query is QueryByKeyPayload<T> {
  return 'key' in query && 'term' in query;
}
