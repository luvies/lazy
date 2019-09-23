/*
  Iterable aggregation functions.
  All of these function cause the iterable to be iterated.
*/

/**
 * Error messages.
 * @hidden
 */
export enum Errors {
  Empty = 'Empty iterable',
  NonNumber = 'Cannot perform function on a non-number value',
}

// Function types.

/**
 * A function that maps one type to another.
 */
export type MapFn<TSource, TResult> = (source: TSource) => TResult;
/**
 * A function that takes in an accumulated result and the next value, and
 * outputs the next result.
 */
export type AggFn<T, U> = (acc: U, next: T) => U;
/**
 * A function that takes in a value and outputs a boolean.
 */
export type BoolPredicate<T> = (source: T) => boolean;
/**
 * A function that returns whether 2 values are equal.
 */
export type ComparerFn<T> = (a: T, b: T) => boolean;
/**
 * An iterator callback function.
 */
export type CallbackFn<T> = (element: T, index: number) => void;
/**
 * A function that creates a string from the given value.
 */
export type StrFn<T> = (element: T) => string;

// Aggregation functions.

/**
 * @hidden
 */
export function aggregate<TSource>(
  iterable: Iterable<TSource>,
  agg: AggFn<TSource, TSource>,
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
    for (const element of iterable) {
      acc = agg(acc, element) as TAcc;
    }
    return acc;
  } else {
    let items = false;
    let acc: TSource;
    for (const element of iterable) {
      if (!items) {
        acc = element;
      } else {
        acc = agg(acc!, element) as TSource;
      }
      items = true;
    }
    if (!items) {
      throw new Error(Errors.Empty);
    }
    return acc!;
  }
}

/**
 * @hidden
 */
export function all<TElement>(
  iterable: Iterable<TElement>,
  predicate: BoolPredicate<TElement>,
): boolean {
  for (const element of iterable) {
    if (!predicate(element)) {
      return false;
    }
  }
  return true;
}

/**
 * @hidden
 */
export function any<TElement>(
  iterable: Iterable<TElement>,
  predicate?: BoolPredicate<TElement>,
): boolean {
  if (predicate) {
    for (const element of iterable) {
      if (predicate(element)) {
        return true;
      }
    }
    return false;
  } else {
    return !iterable[Symbol.iterator]().next().done;
  }
}

/**
 * @hidden
 */
export function average<TElement>(
  iterable: Iterable<TElement>,
): TElement extends number ? number : never;
export function average<TSource>(
  iterable: Iterable<TSource>,
  selector: MapFn<TSource, number>,
): number;
export function average<TSource>(
  iterable: Iterable<TSource>,
  selector?: MapFn<TSource, number>,
): number | never {
  let total = 0;
  let ccount = 0;
  for (const element of iterable) {
    const value = selector ? selector(element) : element;
    if (typeof value !== 'number') {
      throw new TypeError(Errors.NonNumber);
    }
    total += value;
    ccount++;
  }
  if (ccount === 0) {
    throw new Error(Errors.Empty);
  }
  return (total / ccount) as any;
}

/**
 * @hidden
 */
export function contains<TElement>(
  iterable: Iterable<TElement>,
  element: TElement,
  comparer?: ComparerFn<TElement>,
): boolean {
  for (const ielement of iterable) {
    if (comparer ? comparer(element, ielement) : element === ielement) {
      return true;
    }
  }
  return false;
}

/**
 * @hidden
 */
export function count<TElement>(
  iterable: Iterable<TElement>,
  predicate?: BoolPredicate<TElement>,
): number {
  let ccount = 0;
  for (const element of iterable) {
    if (!predicate || predicate(element)) {
      ccount++;
    }
  }
  return ccount;
}

/**
 * @hidden
 */
function getElementAt<TElement>(
  iterable: Iterable<TElement>,
  index: number,
): { found: false } | { found: true; element: TElement } {
  let cindex = 0;
  for (const element of iterable) {
    if (cindex === index) {
      return { found: true, element };
    }
    cindex++;
  }
  return { found: false };
}

/**
 * @hidden
 */
export function elementAt<TElement>(
  iterable: Iterable<TElement>,
  index: number,
): TElement {
  if (index < 0) {
    throw new Error('Index cannot be negative');
  }

  const res = getElementAt(iterable, index);

  if (res.found) {
    return res.element;
  } else {
    throw new Error(`No element found at index ${index}`);
  }
}

/**
 * @hidden
 */
export function elementAtOrDefault<TElement>(
  iterable: Iterable<TElement>,
  index: number,
  defaultValue: TElement,
): TElement;
export function elementAtOrDefault<TElement, TDefault>(
  iterable: Iterable<TElement>,
  index: number,
  defaultValue: TDefault,
): TElement | TDefault;
export function elementAtOrDefault<TElement, TDefault = TElement>(
  iterable: Iterable<TElement>,
  index: number,
  defaultValue: TDefault,
): TElement | TDefault {
  const res = getElementAt(iterable, index);

  if (res.found) {
    return res.element;
  } else {
    return defaultValue;
  }
}

/**
 * @hidden
 */
function getFirst<TElement>(
  iterable: Iterable<TElement>,
  predicate?: BoolPredicate<TElement>,
): { items: false } | { items: true; element: TElement } {
  for (const element of iterable) {
    if (!predicate || predicate(element)) {
      return { items: true, element };
    }
  }
  return { items: false };
}

/**
 * @hidden
 */
export function first<TElement>(
  iterable: Iterable<TElement>,
  predicate?: BoolPredicate<TElement>,
): TElement {
  const res = getFirst(iterable, predicate);

  if (res.items) {
    return res.element;
  } else {
    throw new Error(Errors.Empty);
  }
}

/**
 * @hidden
 */
export function firstOrDefault<TElement>(
  iterable: Iterable<TElement>,
  defaultValue: TElement,
  predicate?: BoolPredicate<TElement>,
): TElement;
export function firstOrDefault<TElement, TDefault>(
  iterable: Iterable<TElement>,
  defaultValue: TDefault,
  predicate?: BoolPredicate<TElement>,
): TElement | TDefault;
export function firstOrDefault<TElement, TDefault = TElement>(
  iterable: Iterable<TElement>,
  defaultValue: TDefault,
  predicate?: BoolPredicate<TElement>,
): TElement | TDefault {
  const res = getFirst(iterable, predicate);

  if (res.items) {
    return res.element;
  } else {
    return defaultValue;
  }
}

/**
 * @hidden
 */
export function forEach<TElement>(
  iterable: Iterable<TElement>,
  callbackFn: CallbackFn<TElement>,
): void {
  let index = 0;
  for (const element of iterable) {
    callbackFn(element, index);
    index++;
  }
}

/**
 * @hidden
 */
export function iterableEquals<TElement>(
  firstIterable: Iterable<TElement>,
  secondIterable: Iterable<TElement>,
  comparer?: ComparerFn<TElement>,
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
    } else if (
      comparer
        ? !comparer(firstMove.value, secondMove.value)
        : firstMove.value !== secondMove.value
    ) {
      return false;
    }
  } while (!done);
  return true;
}

/**
 * @hidden
 */
function getLast<TElement>(
  iterable: Iterable<TElement>,
  predicate?: BoolPredicate<TElement>,
): { items: false } | { items: true; element: TElement } {
  let items = false;
  let latest: TElement;
  for (const element of iterable) {
    if (!predicate || predicate(element)) {
      latest = element;
      items = true;
    }
  }
  if (items) {
    return { items: true, element: latest! };
  } else {
    return { items: false };
  }
}

/**
 * @hidden
 */
export function last<TElement>(
  iterable: Iterable<TElement>,
  predicate?: BoolPredicate<TElement>,
): TElement {
  const res = getLast(iterable, predicate);

  if (res.items) {
    return res.element;
  } else {
    throw new Error(Errors.Empty);
  }
}

/**
 * @hidden
 */
export function lastOrDefault<TElement>(
  iterable: Iterable<TElement>,
  defaultValue: TElement,
  predicate?: BoolPredicate<TElement>,
): TElement;
export function lastOrDefault<TElement, TDefault>(
  iterable: Iterable<TElement>,
  defaultValue: TDefault,
  predicate?: BoolPredicate<TElement>,
): TElement | TDefault;
export function lastOrDefault<TElement, TDefault = TElement>(
  iterable: Iterable<TElement>,
  defaultValue: TDefault,
  predicate?: BoolPredicate<TElement>,
): TElement | TDefault {
  const res = getLast(iterable, predicate);

  if (res.items) {
    return res.element;
  } else {
    return defaultValue;
  }
}

/**
 * @hidden
 */
export function max<TElement>(
  iterable: Iterable<TElement>,
): TElement extends number ? number : never;
export function max<TSource>(
  iterable: Iterable<TSource>,
  selector: MapFn<TSource, number>,
): number;
export function max<TSource>(
  iterable: Iterable<TSource>,
  selector?: MapFn<TSource, number>,
): number | never {
  let cmax = -Infinity;
  let items = false;
  for (const element of iterable) {
    const value = selector ? selector(element) : element;
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

/**
 * @hidden
 */
export function min<TElement>(
  iterable: Iterable<TElement>,
): TElement extends number ? number : never;
export function min<TSource>(
  iterable: Iterable<TSource>,
  selector: MapFn<TSource, number>,
): number;
export function min<TSource>(
  iterable: Iterable<TSource>,
  selector?: MapFn<TSource, number>,
): number | never {
  let cmin = +Infinity;
  let items = false;
  for (const element of iterable) {
    const value = selector ? selector(element) : element;
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

/**
 * @hidden
 */
export function resolveAll<TElement>(
  iterable: Iterable<TElement>,
): Promise<
  TElement extends PromiseLike<infer TResult> ? TResult[] : TElement[]
> {
  return Promise.all(iterable) as any;
}

/**
 * @hidden
 */
function getSingle<TElement>(
  iterable: Iterable<TElement>,
  predicate: BoolPredicate<TElement>,
): { found: false } | { found: true; element: TElement } {
  for (const element of iterable) {
    if (predicate(element)) {
      return { found: true, element };
    }
  }
  return { found: false };
}

/**
 * @hidden
 */
export function single<TElement>(
  iterable: Iterable<TElement>,
  predicate: BoolPredicate<TElement>,
): TElement {
  const res = getSingle(iterable, predicate);

  if (res.found) {
    return res.element;
  } else {
    throw new Error(Errors.Empty);
  }
}

/**
 * @hidden
 */
export function singleOrDefault<TElement>(
  iterable: Iterable<TElement>,
  predicate: BoolPredicate<TElement>,
  defaultValue: TElement,
): TElement;
export function singleOrDefault<TElement, TDefault>(
  iterable: Iterable<TElement>,
  predicate: BoolPredicate<TElement>,
  defaultValue: TDefault,
): TElement | TDefault;
export function singleOrDefault<TElement, TDefault = TElement>(
  iterable: Iterable<TElement>,
  predicate: BoolPredicate<TElement>,
  defaultValue: TDefault,
): TElement | TDefault {
  const res = getSingle(iterable, predicate);

  if (res.found) {
    return res.element;
  } else {
    return defaultValue;
  }
}

/**
 * @hidden
 */
export function stringJoin<TElement>(
  iterable: Iterable<TElement>,
  separator = '',
  strFn: StrFn<TElement> = element => `${element}`,
): string {
  let str = '';
  let started = false;
  for (const element of iterable) {
    if (started) {
      str += separator;
    }
    str += strFn(element);
    started = true;
  }
  return str;
}

/**
 * @hidden
 */
export function sum<TElement>(
  iterable: Iterable<TElement>,
): TElement extends number ? number : never;
export function sum<TSource>(
  iterable: Iterable<TSource>,
  selector: MapFn<TSource, number>,
): number;
export function sum<TSource>(
  iterable: Iterable<TSource>,
  selector?: MapFn<TSource, number>,
): number | never {
  let total = 0;
  let items = false;
  for (const element of iterable) {
    const value = selector ? selector(element) : element;
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

/**
 * @hidden
 */
export function toArray<T>(iterable: Iterable<T>): T[] {
  const arr: T[] = [];

  for (const element of iterable) {
    arr.push(element);
  }

  return arr;
}

/**
 * @hidden
 */
export function toMap<TSource, TKey, TElement = TSource>(
  iterable: Iterable<TSource>,
  keyFn: MapFn<TSource, TKey>,
  valueFn?: MapFn<TSource, TElement>,
): Map<TKey, TElement> {
  const map = new Map<TKey, TElement>();
  for (const element of iterable) {
    const key = keyFn(element);
    if (map.has(key)) {
      throw new Error('Duplicate key found');
    }
    map.set(key, valueFn ? valueFn(element) : (element as any));
  }
  return map;
}
