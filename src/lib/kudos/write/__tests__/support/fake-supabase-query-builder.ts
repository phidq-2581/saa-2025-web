/** A minimal PromiseLike Postgrest query-builder stand-in: every chain
 *  method returns itself, and awaiting the chain at any point resolves to
 *  the pre-configured result -- mirrors supabase-js's own thenable builder.
 *  Shared test support for write-layer server actions that chain
 *  `.from(...).select(...).eq(...)` style calls. */

export interface FakeResult<T> {
  data: T | null;
  error: { message: string } | null;
  count?: number | null;
}

export interface FakeQueryBuilder<T> extends PromiseLike<FakeResult<T>> {
  select: (...args: unknown[]) => FakeQueryBuilder<T>;
  eq: (...args: unknown[]) => FakeQueryBuilder<T>;
  delete: (...args: unknown[]) => FakeQueryBuilder<T>;
  insert: (...args: unknown[]) => FakeQueryBuilder<T>;
  single: (...args: unknown[]) => FakeQueryBuilder<T>;
  maybeSingle: (...args: unknown[]) => FakeQueryBuilder<T>;
}

export function fakeQueryBuilder<T>(result: FakeResult<T>): FakeQueryBuilder<T> {
  const builder: FakeQueryBuilder<T> = {
    select: () => builder,
    eq: () => builder,
    delete: () => builder,
    insert: () => builder,
    single: () => builder,
    maybeSingle: () => builder,
    then: (onFulfilled, onRejected) => Promise.resolve(result).then(onFulfilled, onRejected),
  };
  return builder;
}
