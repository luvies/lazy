import * as aggregates from './aggregates.ts';

// Helpers types.

type MapFn<TSource, TResult> = aggregates.MapFn<TSource, TResult>;
type CombineFn<TFirst, TSecond, TResult> = (first: TFirst, second: TSecond) => TResult;
type SortFn<TSource> = (a: TSource, b: TSource) => number;
type IndexPredicate<TSource> = (value: TSource, index: number) => boolean;

// Helper classes.

class Queue<T> {
  private _buffer: T[] = [];
  private _front = 0;

  public get length(): number {
    return this._buffer.length - this._front;
  }

  public enqueue(value: T): void {
    this._buffer.push(value);
  }

  public dequeue(): T {
    const value = this._buffer[this._front];
    delete this._buffer[this._front];
    this._front++;
    return value;
  }
}

// Base lazy class.

export abstract class Lazy<TElement> implements Iterable<TElement> {
  // Aggregates.
  public aggregate<TAcc>(agg: aggregates.AggFn<TElement, TAcc>, seed: TAcc) {
    return aggregates.aggregate(this, agg, seed);
  }

  public all(predicate: aggregates.BoolPredicate<TElement>) {
    return aggregates.all(this, predicate);
  }

  public any(predicate?: aggregates.BoolPredicate<TElement>) {
    return aggregates.any(this, predicate);
  }

  public average() {
    return aggregates.average(this);
  }

  public contains(value: TElement, comparer?: aggregates.ComparerFn<TElement>) {
    return aggregates.contains(this, value, comparer);
  }

  public count() {
    return aggregates.count(this);
  }

  public elementAt(index: number) {
    return aggregates.elementAt(this, index);
  }

  public elementAtOrDefault(index: number, defaultValue: TElement) {
    return aggregates.elementAtOrDefault(this, index, defaultValue);
  }

  public first() {
    return aggregates.first(this);
  }

  public firstOrDefault(defaultValue: TElement) {
    return aggregates.firstOrDefault(this, defaultValue);
  }

  public last() {
    return aggregates.last(this);
  }

  public lastOrDefault(defaultValue: TElement) {
    return aggregates.lastOrDefault(this, defaultValue);
  }

  public max() {
    return aggregates.max(this);
  }

  public min() {
    return aggregates.min(this);
  }

  public sequenceEquals(second: Iterable<TElement>, comparer?: aggregates.ComparerFn<TElement>) {
    return aggregates.sequenceEquals(this, second, comparer);
  }

  public single(predicate: aggregates.BoolPredicate<TElement>) {
    return aggregates.single(this, predicate);
  }

  public singleOrDefault(predicate: aggregates.BoolPredicate<TElement>, defaultValue: TElement) {
    return aggregates.singleOrDefault(this, predicate, defaultValue);
  }

  public sum() {
    return aggregates.sum(this);
  }

  public toArray() {
    return aggregates.toArray(this);
  }

  public toMap<TKey, TResult = TElement>(keyFn: MapFn<TElement, TKey>, valueFn?: MapFn<TElement, TResult>) {
    return aggregates.toMap(this, keyFn, valueFn);
  }

  // Iterators.
  public append(element: TElement) {
    return new LazyAppendPrepend(this, element, false);
  }

  public concat(iterable: Iterable<TElement>) {
    return new LazyConcat(this, iterable);
  }

  public defaultIfEmpty(defaultValue: TElement) {
    return new LazyDefaultIfEmpty(this, defaultValue);
  }

  public distinct<TKey>(compareOn?: MapFn<TElement, TKey>) {
    return new LazyDistinct(this, compareOn);
  }

  public except<TKey = TElement>(second: Iterable<TElement>, compareOn?: MapFn<TElement, TKey>) {
    return new LazyExcept(this, second, compareOn);
  }

  public intersect<TKey = TElement>(second: Iterable<TElement>, compareOn?: MapFn<TElement, TKey>) {
    return new LazyIntersect(this, second, compareOn);
  }

  public join<TSecond, TKey, TResult = TElement>(
    second: Iterable<TSecond>,
    firstKeyFn: MapFn<TElement, TKey>,
    secondKeyFn: MapFn<TSecond, TKey>,
    joinFn: CombineFn<TElement, TSecond, TResult>,
  ) {
    return new LazyJoin(this, second, firstKeyFn, secondKeyFn, joinFn);
  }

  public orderBy<TKey>(
    keyFn: MapFn<TElement, TKey>,
    compareFn?: SortFn<TKey> | undefined,
  ) {
    return new LazyOrderBy(this, keyFn, compareFn, false);
  }

  public orderByDecending<TKey>(
    keyFn: MapFn<TElement, TKey>,
    compareFn?: SortFn<TKey> | undefined,
  ) {
    return new LazyOrderBy(this, keyFn, compareFn, true);
  }

  public prepend(element: TElement) {
    return new LazyAppendPrepend(this, element, true);
  }

  public reverse() {
    return new LazyReverse(this);
  }

  public select<TResult>(selector: MapFn<TElement, TResult>) {
    return new LazySelect(this, selector);
  }

  public selectMany<TResult>(selector: MapFn<TElement, Iterable<TResult>>) {
    return new LazySelectMany(this, selector);
  }

  public skip(count: number) {
    return new LazySkip(this, count);
  }

  public skipLast(count: number) {
    return new LazySkipLast(this, count);
  }

  public skipWhile(predicate: IndexPredicate<TElement>) {
    return new LazySkipWhile(this, predicate);
  }

  public take(count: number) {
    return new LazyTake(this, count);
  }

  public takeLast(count: number) {
    return new LazyTakeLast(this, count);
  }

  public takeWhile(predicate: IndexPredicate<TElement>) {
    return new LazyTakeWhile(this, predicate);
  }

  public union<TKey = TElement>(second: Iterable<TElement>, compareOn?: MapFn<TElement, TKey>) {
    return new LazyUnion(this, second, compareOn);
  }

  public where(predicate: aggregates.BoolPredicate<TElement>) {
    return new LazyWhere(this, predicate);
  }

  public abstract [Symbol.iterator](): Iterator<TElement>;
}

/*
  Iterator implementations.
  Each of these will apply some form of transformation on an iterable,
  but *only* while it is being iterated.
*/

class LazyAppendPrepend<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _element: TElement,
    private readonly _atStart: boolean,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TElement> {
    if (this._atStart) {
      yield this._element;
    }
    for (const value of this._iterable) {
      yield value;
    }
    if (!this._atStart) {
      yield this._element;
    }
  }
}

class LazyConcat<TElement> extends Lazy<TElement> {
  public constructor(
    private _firstIterable: Iterable<TElement>,
    private _secondIterable: Iterable<TElement>,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TElement> {
    for (const value of this._firstIterable) {
      yield value;
    }
    for (const value of this._secondIterable) {
      yield value;
    }
  }
}

class LazyDefaultIfEmpty<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _defaultValue: TElement,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TElement> {
    let yielded = false;
    for (const value of this._iterable) {
      yield value;
      yielded = true;
    }
    if (!yielded) {
      yield this._defaultValue;
    }
  }
}

class LazyDistinct<TElement, TKey = TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _compareOn: MapFn<TElement, TKey> = ((value: TElement) => value) as any,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TElement> {
    const found = new Map<TKey, TElement>();
    for (const value of this._iterable) {
      const key = this._compareOn(value);
      if (!found.has(key)) {
        found.set(key, value);
        yield value;
      }
    }
  }
}

class LazyExcept<TElement, TKey = TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _firstIterable: Iterable<TElement>,
    private readonly _secondIterable: Iterable<TElement>,
    private readonly _compareOn: MapFn<TElement, TKey> = ((value: TElement) => value) as any,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TElement> {
    const set = new Set<TKey>();
    for (const value of this._secondIterable) {
      const key = this._compareOn(value);
      set.add(key);
    }

    for (const value of this._firstIterable) {
      const key = this._compareOn(value);
      if (!set.has(key)) {
        set.add(key);
        yield value;
      }
    }
  }
}

class LazyIntersect<TElement, TKey = TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _firstIterable: Iterable<TElement>,
    private readonly _secondIterable: Iterable<TElement>,
    private readonly _compareOn: MapFn<TElement, TKey> = ((value: TElement) => value) as any,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TElement> {
    const set = new Set<TKey>();
    for (const value of this._secondIterable) {
      const key = this._compareOn(value);
      set.add(key);
    }

    for (const value of this._firstIterable) {
      const key = this._compareOn(value);
      if (set.has(key)) {
        set.delete(key);
        yield value;
      }
    }
  }
}

class LazyJoin<TFirst, TSecond, TKey, TResult> extends Lazy<TResult> {
  public constructor(
    private readonly _firstIterable: Iterable<TFirst>,
    private readonly _secondIterable: Iterable<TSecond>,
    private readonly _firstKeyFn: MapFn<TFirst, TKey>,
    private readonly _secondKeyFn: MapFn<TSecond, TKey>,
    private readonly _joinFn: CombineFn<TFirst, TSecond, TResult>,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TResult> {
    const secondMap = aggregates.toMap(this._secondIterable, this._secondKeyFn);
    for (const firstValue of this._firstIterable) {
      const key = this._firstKeyFn(firstValue);
      const secondValue = secondMap.get(key);
      if (secondValue) {
        yield this._joinFn(firstValue, secondValue);
      }
    }
  }
}

// Attempts to mimic the built-in sorting as close as possible.
function defaultComparer<T>(a: T, b: T): number {
  if (typeof a === 'undefined') {
    return +1;
  } else if (typeof b === 'undefined') {
    return -1;
  }
  return `${a}`.localeCompare(`${b}`);
}

function comparerFactory<TSource, TKey>(
  keyFn: MapFn<TSource, TKey>,
  reverse: boolean,
  compareFn: SortFn<TKey> = defaultComparer,
): (a: TSource, b: TSource) => number {
  return (a, b) => {
    if (reverse) {
      const t = a;
      a = b;
      b = t;
    }
    return compareFn(keyFn(a), keyFn(b));
  };
}

class LazyOrderBy<TElement, TKey> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _keyFn: MapFn<TElement, TKey>,
    private readonly _compareFn: SortFn<TKey> | undefined,
    private readonly _decending: boolean,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TElement> {
    const arr = aggregates.toArray(this._iterable);
    arr.sort(comparerFactory(this._keyFn, this._decending, this._compareFn));
    return arr[Symbol.iterator]();
  }
}

class LazyReverse<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TElement> {
    const arr = aggregates.toArray(this._iterable);
    arr.reverse();
    return arr[Symbol.iterator]();
  }
}

class LazySelect<TSource, TResult> extends Lazy<TResult> {
  public constructor(
    private readonly _iterable: Iterable<TSource>,
    private readonly _selector: MapFn<TSource, TResult>,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TResult> {
    for (const value of this._iterable) {
      yield this._selector(value);
    }
  }
}

class LazySelectMany<TSource, TResult> extends Lazy<TResult> {
  public constructor(
    private readonly _iterable: Iterable<TSource>,
    private readonly _selector: MapFn<TSource, Iterable<TResult>>,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TResult> {
    for (const outer of this._iterable) {
      for (const inner of this._selector(outer)) {
        yield inner;
      }
    }
  }
}

class LazySkip<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _count: number,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TElement> {
    let skipped = 0;
    for (const value of this._iterable) {
      if (skipped < this._count) {
        skipped++;
      } else {
        yield value;
      }
    }
  }
}

class LazySkipLast<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _count: number,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TElement> {
    const queue = new Queue<TElement>();
    let yielding = false;
    for (const value of this._iterable) {
      queue.enqueue(value);

      if (!yielding && queue.length > this._count) {
        yielding = true;
      }

      if (yielding) {
        yield queue.dequeue();
      }
    }
  }
}

class LazySkipWhile<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _predicate: IndexPredicate<TElement>,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TElement> {
    let yielding = false;
    let index = 0;
    for (const value of this._iterable) {
      yielding = yielding || !this._predicate(value, index);

      if (yielding) {
        yield value;
      }

      index++;
    }
  }
}

class LazyTake<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _count: number,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TElement> {
    if (this._count > 0) {
      let taken = 0;
      for (const value of this._iterable) {
        if (taken < this._count) {
          yield value;
          taken++;
        } else {
          break;
        }
      }
    }
  }
}

class LazyTakeLast<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _count: number,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TElement> {
    const queue = new Queue<TElement>();
    let buffered = false;
    for (const value of this._iterable) {
      if (queue.length >= this._count) {
        buffered = true;
      }

      if (!buffered) {
        queue.enqueue(value);
      } else {
        queue.dequeue();
        queue.enqueue(value);
      }
    }

    while (queue.length > 0) {
      yield queue.dequeue();
    }
  }
}

class LazyTakeWhile<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _predicate: IndexPredicate<TElement>,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TElement> {
    let index = 0;
    for (const value of this._iterable) {
      if (!this._predicate(value, index)) {
        break;
      }

      yield value;

      index++;
    }
  }
}

class LazyUnion<TElement, TKey = TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _firstIterable: Iterable<TElement>,
    private readonly _secondIterable: Iterable<TElement>,
    private readonly _compareOn: MapFn<TElement, TKey> = ((value: TElement) => value) as any,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TElement> {
    const set = new Set<TKey>();
    for (const iter of [this._firstIterable, this._secondIterable]) {
      for (const value of iter) {
        const key = this._compareOn(value);
        if (!set.has(key)) {
          set.add(key);
          yield value;
        }
      }
    }
  }
}

class LazyWhere<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _predicate: aggregates.BoolPredicate<TElement>,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TElement> {
    for (const value of this._iterable) {
      if (this._predicate(value)) {
        yield value;
      }
    }
  }
}
