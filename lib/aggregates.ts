/*
  Iterable aggregate functions.
  All of these function cause the iterable to be iterated.
*/

// Function types.

export type AggFn<T, U> = (acc: U, next: T) => U;
export type BoolPredicate<T> = (source: T) => boolean;
export type ComparerFn<T> = (a: T, b: T) => boolean;

// Aggregation functions.

export function aggregate<T, U>(iterable: Iterable<T>, agg: AggFn<T, U>, seed: U): U {
  let acc = seed;
  for (const value of iterable) {
    acc = agg(acc, value);
  }
  return acc;
}

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

export function contains<T>(iterable: Iterable<T>, value: T, comparer?: ComparerFn<T>): boolean {
  for (const ivalue of iterable) {
    if (comparer ? comparer(value, ivalue) : value === ivalue) {
      return true;
    }
  }
  return false;
}

function getElementAt<T>(iterable: Iterable<T>, index: number): { found: false } | { found: true, value: T } {
  let cindex = 0;
  for (const value of iterable) {
    if (cindex === index) {
      return { found: true, value };
    }
    cindex++;
  }
  return { found: false };
}

export function elementAt<T>(iterable: Iterable<T>, index: number): T {
  const res = getElementAt(iterable, index);
  if (res.found) {
    return res.value;
  } else {
    throw new Error(`No element found at index ${index}`);
  }
}

export function elementAtOrDefault<T>(iterable: Iterable<T>, index: number, defaultValue: T): T {
  const res = getElementAt(iterable, index);
  if (res.found) {
    return res.value;
  } else {
    return defaultValue;
  }
}

export function first<T>(iterable: Iterable<T>): T {
  const res = iterable[Symbol.iterator]().next();

  if (!res.done) {
    return res.value;
  } else {
    throw new Error('No elements in iterable');
  }
}

export function firstOrDefault<T>(iterable: Iterable<T>, defaultValue: T): T {
  const res = iterable[Symbol.iterator]().next();

  if (!res.done) {
    return res.value;
  } else {
    return defaultValue;
  }
}

export function toArray<T>(iterable: Iterable<T>): T[] {
  return Array.from(iterable);
}
