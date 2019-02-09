/*
  Iterable aggregate functions.
  All of these function cause the iterable to be iterated.
*/

export type AggFn<T, U> = (acc: U, next: T) => U;
export function aggregate<T, U>(iterable: Iterable<T>, agg: AggFn<T, U>, seed: U): U {
  let acc = seed;
  for (const value of iterable) {
    acc = agg(acc, value);
  }
  return acc;
}

export type BoolPredicate<T> = (source: T) => boolean;

export function any<T>(iterable: Iterable<T>, predicate: BoolPredicate<T>): boolean {
  for (const value of iterable) {
    if (predicate(value)) {
      return true;
    }
  }
  return false;
}

export function all<T>(iterable: Iterable<T>, predicate: BoolPredicate<T>): boolean {
  for (const value of iterable) {
    if (!predicate(value)) {
      return false;
    }
  }
  return true;
}

export function average<T>(iterable: Iterable<T>): T extends number ? number : never {
  let total = 0;
  let count = 0;
  for (const value of iterable) {
    if (typeof value !== 'number') {
      throw new TypeError('Cannot average a non-number value');
    }
    total += value;
    count++;
  }
  return total / count as any;
}
