/*
  Iterable aggregation functions.
  All of these function cause the iterable to be iterated.
*/

// Error messages.
enum Errors {
  Empty = 'Empty iterable',
  NonNumber = 'Cannot perform function on a non-number value',
}

// Function types.

export type MapFn<TSource, TResult> = (source: TSource) => TResult;
export type AggFn<T, U> = (acc: U, next: T) => U;
export type BoolPredicate<T> = (source: T) => boolean;
export type ComparerFn<T> = (a: T, b: T) => boolean;
export type CallbackFn<T> = (element: T, index: number) => void;

// Aggregation functions.

export function aggregate<TSource>(
  iterable: Iterable<TSource>,
  agg: AggFn<TSource, TSource>,
  seed?: undefined,
): TSource;
export function aggregate<TSource, TAcc>(
  iterable: Iterable<TSource>,
  agg: AggFn<TSource, TAcc>,
  seed: TAcc,
): TAcc;
export function aggregate<TSource, TAcc>(
  iterable: Iterable<TSource>,
  agg: AggFn<TSource, TAcc | TSource>,
  seed?: TAcc,
): TAcc | TSource {
  const gotSeed = arguments.length >= 3;

  if (gotSeed) {
    let acc = seed as TAcc;
    for (const value of iterable) {
      acc = agg(acc, value) as TAcc;
    }
    return acc;
  } else {
    let items = false;
    let acc: TSource;
    for (const value of iterable) {
      if (!items) {
        acc = value;
      } else {
        acc = agg(acc!, value) as TSource;
      }
      items = true;
    }
    if (!items) {
      throw new Error(Errors.Empty);
    }
    return acc;
  }
}

export function all<TElement>(
  iterable: Iterable<TElement>,
  predicate: BoolPredicate<TElement>,
): boolean {
  for (const value of iterable) {
    if (!predicate(value)) {
      return false;
    }
  }
  return true;
}

export function any<TElement>(
  iterable: Iterable<TElement>,
  predicate?: BoolPredicate<TElement>,
): boolean {
  if (predicate) {
    for (const value of iterable) {
      if (predicate(value)) {
        return true;
      }
    }
    return false;
  } else {
    return !iterable[Symbol.iterator]().next().done;
  }
}

export function average<TElement>(
  iterable: Iterable<TElement>,
): TElement extends number ? number : never {
  let total = 0;
  let ccount = 0;
  for (const value of iterable) {
    if (typeof value !== 'number') {
      throw new TypeError(Errors.NonNumber);
    }
    total += value;
    ccount++;
  }
  if (ccount === 0) {
    throw new Error(Errors.Empty);
  }
  return total / ccount as any;
}

export function contains<TElement>(
  iterable: Iterable<TElement>,
  value: TElement,
  comparer?: ComparerFn<TElement>,
): boolean {
  for (const ivalue of iterable) {
    if (comparer ? comparer(value, ivalue) : value === ivalue) {
      return true;
    }
  }
  return false;
}

export function count<TElement>(iterable: Iterable<TElement>): number {
  let ccount = 0;
  for (const _ of iterable) {
    ccount++;
  }
  return ccount;
}

function getElementAt<TElement>(
  iterable: Iterable<TElement>,
  index: number,
): { found: false } | { found: true, value: TElement } {
  let cindex = 0;
  for (const value of iterable) {
    if (cindex === index) {
      return { found: true, value };
    }
    cindex++;
  }
  return { found: false };
}

export function elementAt<TElement>(
  iterable: Iterable<TElement>,
  index: number,
): TElement {
  if (index < 0) {
    throw new Error('Index cannot be negative');
  }

  const res = getElementAt(iterable, index);

  if (res.found) {
    return res.value;
  } else {
    throw new Error(`No element found at index ${index}`);
  }
}

export function elementAtOrDefault<TElement>(
  iterable: Iterable<TElement>,
  index: number,
  defaultValue: TElement,
): TElement {
  const res = getElementAt(iterable, index);

  if (res.found) {
    return res.value;
  } else {
    return defaultValue;
  }
}

export function first<TElement>(
  iterable: Iterable<TElement>,
): TElement {
  const res = iterable[Symbol.iterator]().next();

  if (!res.done) {
    return res.value;
  } else {
    throw new Error(Errors.Empty);
  }
}

export function firstOrDefault<TElement>(
  iterable: Iterable<TElement>,
  defaultValue: TElement,
): TElement {
  const res = iterable[Symbol.iterator]().next();

  if (!res.done) {
    return res.value;
  } else {
    return defaultValue;
  }
}

export function forEach<TElement>(
  iterable: Iterable<TElement>,
  callbackFn: CallbackFn<TElement>,
): void {
  let index = 0;
  for (const value of iterable) {
    callbackFn(value, index);
    index++;
  }
}

function getLast<TElement>(
  iterable: Iterable<TElement>,
): { items: false } | { items: true, value: TElement } {
  let items = false;
  let latest: TElement;
  for (const value of iterable) {
    latest = value;
    items = true;
  }
  if (items) {
    return { items: true, value: latest! };
  } else {
    return { items: false };
  }
}

export function last<TElement>(iterable: Iterable<TElement>): TElement {
  const res = getLast(iterable);
  if (res.items) {
    return res.value;
  } else {
    throw new Error(Errors.Empty);
  }
}

export function lastOrDefault<TElement>(iterable: Iterable<TElement>, defaultValue: TElement): TElement {
  const res = getLast(iterable);
  if (res.items) {
    return res.value;
  } else {
    return defaultValue;
  }
}

export function max<TElement>(
  iterable: Iterable<TElement>,
): TElement extends number ? number : never {
  let cmax = -Infinity;
  let items = false;
  for (const value of iterable) {
    if (typeof value !== 'number') {
      throw new TypeError(Errors.NonNumber);
    }
    if (value > cmax) {
      cmax = value;
    }
    items = true;
  }
  if (!items) {
    throw new Error(Errors.Empty);
  }
  return cmax as any;
}

export function min<TElement>(
  iterable: Iterable<TElement>,
): TElement extends number ? number : never {
  let cmin = +Infinity;
  let items = false;
  for (const value of iterable) {
    if (typeof value !== 'number') {
      throw new TypeError(Errors.NonNumber);
    }
    if (value < cmin) {
      cmin = value;
    }
    items = true;
  }
  if (!items) {
    throw new Error(Errors.Empty);
  }
  return cmin as any;
}

export function sequenceEquals<TElement>(
  firstIterable: Iterable<TElement>,
  secondIterable: Iterable<TElement>,
  comparer: ComparerFn<TElement> = (a, b) => a === b,
): boolean {
  let done = false;
  const firstIter = firstIterable[Symbol.iterator]();
  let firstMove: IteratorResult<TElement>;
  const secondIter = secondIterable[Symbol.iterator]();
  let secondMove: IteratorResult<TElement>;
  do {
    firstMove = firstIter.next();
    secondMove = secondIter.next();

    if (firstMove.done !== secondMove.done) {
      return false;
    } else if (firstMove.done && secondMove.done) {
      done = true;
    } else if (!comparer(firstMove.value, secondMove.value)) {
      return false;
    }
  } while (!done);
  return true;
}

function getSingle<TElement>(
  iterable: Iterable<TElement>,
  predicate: BoolPredicate<TElement>,
): { found: false } | { found: true, value: TElement } {
  for (const value of iterable) {
    if (predicate(value)) {
      return { found: true, value };
    }
  }
  return { found: false };
}

export function single<TElement>(
  iterable: Iterable<TElement>,
  predicate: BoolPredicate<TElement>,
): TElement {
  const res = getSingle(iterable, predicate);
  if (res.found) {
    return res.value;
  } else {
    throw new Error(Errors.Empty);
  }
}

export function singleOrDefault<TElement>(
  iterable: Iterable<TElement>,
  predicate: BoolPredicate<TElement>,
  defaultValue: TElement,
): TElement {
  const res = getSingle(iterable, predicate);
  if (res.found) {
    return res.value;
  } else {
    return defaultValue;
  }
}

export function sum<TElement>(iterable: Iterable<TElement>): TElement extends number ? number : never {
  let total = 0;
  let items = false;
  for (const value of iterable) {
    if (typeof value !== 'number') {
      throw new TypeError(Errors.NonNumber);
    }
    total += value;
    items = true;
  }
  if (!items) {
    throw new Error(Errors.Empty);
  }
  return total as any;
}

export function toArray<T>(iterable: Iterable<T>): T[] {
  return Array.from(iterable);
}

export function toMap<TSource, TKey, TElement = TSource>(
  iterable: Iterable<TSource>,
  keyFn: MapFn<TSource, TKey>,
  valueFn: MapFn<TSource, TElement> = ((value: TSource) => value) as any,
): Map<TKey, TElement> {
  const map = new Map<TKey, TElement>();
  for (const value of iterable) {
    const key = keyFn(value);
    if (map.has(key)) {
      throw new Error('Duplicate key found');
    }
    map.set(key, valueFn(value));
  }
  return map;
}
