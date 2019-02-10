import * as aggregates from './aggregates.ts';

// Helpers types.

type MapFn<TSource, TResult> = aggregates.MapFn<TSource, TResult>;
type IndexMapFn<TSource, TResult> = (source: TSource, index: number) => TResult;
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

/**
 * The base class that all lazy iterable objects derive from.
 * This can be extended with custom iterators if needed.
 */
export abstract class Lazy<TElement> implements Iterable<TElement> {
  // Aggregates.

  /**
   * Applies an accumulator function over a sequence.
   * @param agg The accumulator function to apply over the iterable.
   * @param seed The seed to set the initial `acc` param to in the accumulator function.
   * If not given, then the first element is used.
   * @returns The function accumulator value.
   * @throws {Error} If no seed is given and iterable was empty.
   * @remarks The function works very similarly to Array.prototype.reduce, with
   * the added benefit of working on any general iterable object.
   */
  public aggregate(agg: aggregates.AggFn<TElement, TElement>, seed?: undefined): TElement;
  public aggregate<TAcc>(agg: aggregates.AggFn<TElement, TAcc>, seed: TAcc): TAcc;
  public aggregate<TAcc>(agg: aggregates.AggFn<TElement, TAcc | TElement>, seed?: TAcc) {
    if (arguments.length >= 2) {
      return aggregates.aggregate(this, agg as any, seed);
    } else {
      return aggregates.aggregate(this, agg as any);
    }
  }

  /**
   * Returns whether all elements satisfy the given condition.
   * @param predicate The function to use to test each element.
   * @returns Whether all elements satisfied the condition.
   */
  public all(predicate: aggregates.BoolPredicate<TElement>) {
    return aggregates.all(this, predicate);
  }

  /**
   * Returns whether any of the elements satisfy the given condition.
   * @param predicate The function to use to test each element. If not given,
   * then this function will return true if at least 1 element exists in the iterable.
   * @returns Whether any element satisfied the condition, or the iterable was not empty.
   * @remarks For check whether the given lazy query has any elements, prefer to use
   * this function over {@link Lazy#count}, as that function will iterate the entire
   * object, whereas this will stop at the first.
   */
  public any(predicate?: aggregates.BoolPredicate<TElement>) {
    return aggregates.any(this, predicate);
  }

  /**
   * Computes the average of the iterable.
   * @returns The numeric average of the iterable.
   * @throws {TypeError} If any element in the iterable was a non-number.
   */
  public average() {
    return aggregates.average(this);
  }

  /**
   * Determines whether the iterable has a given elements.
   * @param value The value to search for.
   * @param comparer The function that compares 2 elements and returns a boolean on whether they
   * are equal or not. If not given, defaults to strict equals (`===`).
   * @returns Whether the element was in the iterable.
   */
  public contains(value: TElement, comparer?: aggregates.ComparerFn<TElement>) {
    return aggregates.contains(this, value, comparer);
  }

  /**
   * Returns the number of elements in the iterable.
   * @returns The number of elements in the iterable.
   * @remarks To determine whether an iterable has any elements, prefer the
   * {@link Lazy#any} method, as this will iterate the entire iterable
   * regardless.
   */
  public count() {
    return aggregates.count(this);
  }

  /**
   * Returns the element at the given index of the iterable.
   * @param index The index of the element to get.
   * @returns The element at the given index.
   * @throws {Error} If the index was < 0 or if it is >= the length of the iterable.
   */
  public elementAt(index: number) {
    return aggregates.elementAt(this, index);
  }

  /**
   * Returns the element at the given index of the iterable, or the given default
   * value if out of range.
   * @param index The index of the element to get.
   * @param defaultValue The default value to use if the index was out of range.
   * @returns The element at the given index.
   */
  public elementAtOrDefault(index: number, defaultValue: TElement) {
    return aggregates.elementAtOrDefault(this, index, defaultValue);
  }

  /**
   * Returns the first element in the iterable.
   * @returns The first element in the iterable.
   * @throws {Error} If the iterable was empty.
   */
  public first() {
    return aggregates.first(this);
  }

  /**
   * Returns the first element in the iterable, or the given default value if
   * the iterable was empty.
   * @param defaultValue The value to use of the iterable was empty.
   * @returns The first element in the iterable, or the default value if empty.
   */
  public firstOrDefault(defaultValue: TElement) {
    return aggregates.firstOrDefault(this, defaultValue);
  }

  /**
   * Mimics the behaviour of {@link Array#forEach}, with the exception
   * of not providing the entire array as the 3rd param of the callback.
   * @param callbackFn The callback function that will be executed for each item
   * in the iterable.
   */
  public forEach(callbackFn: aggregates.CallbackFn<TElement>) {
    aggregates.forEach(this, callbackFn);
  }

  /**
   * Returns the last element in the iterable.
   * @returns The last element in the iterable.
   * @throws {Error} If the iterable was empty.
   */
  public last() {
    return aggregates.last(this);
  }

  /**
   * Returns the last element in the iterable, or the given default value if
   * the iterable was empty.
   * @param defaultValue The value to use of the iterable was empty.
   * @returns The last element in the iterable, or the default value if empty.
   */
  public lastOrDefault(defaultValue: TElement) {
    return aggregates.lastOrDefault(this, defaultValue);
  }

  /**
   * Returns the maximum value in the iterable.
   * @returns The maximum element.
   * @throws {TypeError} If any element in the iterable was a non-number.
   * @throws {Error} If the iterable was empty
   */
  public max() {
    return aggregates.max(this);
  }

  /**
   * Returns the minimum value in the iterable.
   * @returns The minimum element.
   * @throws {TypeError} If any element in the iterable was a non-number.
   * @throws {Error} If the iterable was empty
   */
  public min() {
    return aggregates.min(this);
  }

  /**
   * Determines whether 2 iterables are equal.
   * @param second The iterable to compare against.
   * @param comparer The function to perform the comparision of each pair of
   * elements with. If not given, defaults to strict equals (`===`).
   * @returns Whether the 2 iterables were both equal.
   * @remarks This will check for both order and value. To check for only value,
   * you can use:
   * ```ts
   * lazyIter.intersect(other, compareOn?).any()
   * ```
   */
  public sequenceEquals(second: Iterable<TElement>, comparer?: aggregates.ComparerFn<TElement>) {
    return aggregates.sequenceEquals(this, second, comparer);
  }

  /**
   * Returns a single element from the iterable that matches the given
   * condition.
   * @param predicate The predicate function to test each element with.
   * @returns The element that satisfies the condition.
   * @throws {Error} If no element could be found that matched the condition.
   */
  public single(predicate: aggregates.BoolPredicate<TElement>) {
    return aggregates.single(this, predicate);
  }

  /**
   * Returns a single element from the iterable that matches the given
   * condition, or a default value if no element was found.
   * @param predicate The predicate function to test each element with.
   * @param defaultValue The default value to use if no element could be found.
   * @returns The element that satisfies the condition, or the default value
   * if no element was found.
   */
  public singleOrDefault(predicate: aggregates.BoolPredicate<TElement>, defaultValue: TElement) {
    return aggregates.singleOrDefault(this, predicate, defaultValue);
  }

  /**
   * Joins all the elements in the iterable together into a single string,
   * split by the given separator.
   * @param separator The separator to split each element with in the string.
   * Defaults to `''`.
   * @param strFn The function to convert each element into a string.
   */
  public stringJoin(separator?: string, strFn?: aggregates.StrFn<TElement>) {
    return aggregates.stringJoin(this, separator, strFn);
  }

  /**
   * Computes the sum of all the elements in the iterable.
   * @returns The sum of all of the elements.
   * @throws {TypeError} If any element in the iterable was a non-number.
   */
  public sum() {
    return aggregates.sum(this);
  }

  /**
   * Converts the iterable into a standard JavaScript {@link Array}.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public toArray() {
    return aggregates.toArray(this);
  }

  /**
   * Converts the iterable into a map using the key and value function.
   * @param keyFn The function to use to derive the key of each map element.
   * @param valueFn The function to use to derive the value of map value. If
   * not given, then the value itself it used.
   * @returns A {@link Map<TKey, TResult>} derived from the iterable.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public toMap<TKey, TResult = TElement>(keyFn: MapFn<TElement, TKey>, valueFn?: MapFn<TElement, TResult>) {
    return aggregates.toMap(this, keyFn, valueFn);
  }

  // Iterators.

  /**
   * Appends the element to the end of the iterable.
   * @param element The element to append.
   */
  public append(element: TElement) {
    return new LazyAppendPrepend(this, element, false);
  }

  /**
   * Concatinates 2 iterables.
   * @param iterable The other iterable to concatinate with.
   */
  public concat(iterable: Iterable<TElement>) {
    return new LazyConcat(this, iterable);
  }

  /**
   * Returns the elements in the iterable, or the given default value
   * as the only element if it contained none.
   * @param defaultValue The value to use if the iterable was empty.
   */
  public defaultIfEmpty(defaultValue: TElement) {
    return new LazyDefaultIfEmpty(this, defaultValue);
  }

  /**
   * Returns the distinct elements in the iterable.
   * @param compareOn A mapping function to use as the key to compare with. The value
   * will be effectively compared using a strict equals (`===`). If not given, then
   * the strict equals will used directly.
   */
  public distinct<TKey>(compareOn?: MapFn<TElement, TKey>) {
    return new LazyDistinct(this, compareOn);
  }

  /**
   * Returns the set difference between 2 iterables. This like doing an XOR
   * over the 2 iterables.
   * @param second The iterable to get the difference of.
   * @param compareOn A mapping function to use as the key to compare with. The value
   * will be effectively compared using a strict equals (`===`). If not given, then
   * the strict equals will used directly.
   * @remarks This will iterate the second iterable completely once it has
   * started iteration (not before).
   */
  public except<TKey = TElement>(second: Iterable<TElement>, compareOn?: MapFn<TElement, TKey>) {
    return new LazyExcept(this, second, compareOn);
  }

  /**
   * Returns the set intersection between 2 iterables. This like doing an AND
   * over the 2 iterables.
   * @param second The iterable to get the intersection of.
   * @param compareOn A mapping function to use as the key to compare with. The value
   * will be effectively compared using a strict equals (`===`). If not given, then
   * the strict equals will used directly.
   * @remarks This will iterate the second iterable completely once it has
   * started iteration (not before).
   */
  public intersect<TKey = TElement>(second: Iterable<TElement>, compareOn?: MapFn<TElement, TKey>) {
    return new LazyIntersect(this, second, compareOn);
  }

  /**
   * Joins 2 iterables on the given matching keys. This is similar to a JOIN in
   * SQL.
   * @param second The iterable to join.
   * @param firstKeyFn The function that extracts the key from the first iterable.
   * @param secondKeyFn The function that extracts the key from the second iterable.
   * @param joinFn The function that takes in a single element from the from each of
   * the first and second iterables, and outputs the resulting element.
   * @remarks This will iterate the second iterable completely once it has
   * started iteration (not before).
   */
  public join<TSecond, TKey, TResult>(
    second: Iterable<TSecond>,
    firstKeyFn: MapFn<TElement, TKey>,
    secondKeyFn: MapFn<TSecond, TKey>,
    joinFn: CombineFn<TElement, TSecond, TResult>,
  ) {
    return new LazyJoin(this, second, firstKeyFn, secondKeyFn, joinFn);
  }

  /**
   * Sorts the iterable in ascending order.
   * @param keyFn The function used to get the key from a given element.
   * @param compareFn The function that is passed to {@link Array#sort} to
   * compare values and return the comparison number. If not give, as default
   * sorting function will be used.
   * @remarks When this is iterated (not before), the underlying iterator is walked through
   * completely in order to allow sorting.
   */
  public orderBy<TKey>(
    keyFn: MapFn<TElement, TKey>,
    compareFn?: SortFn<TKey>,
  ) {
    return new LazyOrderBy(this, keyFn, compareFn, false);
  }

  /**
   * Sorts the iterable in descending order.
   * @param keyFn The function used to get the key from a given element.
   * @param compareFn The function that is passed to {@link Array#sort} to
   * compare values and return the comparison number. If not give, as default
   * sorting function will be used.
   * @remarks When this is iterated (not before), the underlying iterator is walked through
   * completely in order to allow sorting.
   */
  public orderByDecending<TKey>(
    keyFn: MapFn<TElement, TKey>,
    compareFn?: SortFn<TKey>,
  ) {
    return new LazyOrderBy(this, keyFn, compareFn, true);
  }

  /**
   * Appends the element to the beginning of the iterable.
   * @param element The element to append.
   */
  public prepend(element: TElement) {
    return new LazyAppendPrepend(this, element, true);
  }

  /**
   * Inverts the order of the iterable.
   * @remarks When this is iterated (not before), the underlying iterator is walked through
   * completely in order to allow starting from the end.
   */
  public reverse() {
    return new LazyReverse(this);
  }

  /**
   * Projects the elements of the iterable into a new form.
   * @param selector The transformation function to use for each element.
   */
  public select<TResult>(selector: IndexMapFn<TElement, TResult>) {
    return new LazySelect(this, selector);
  }

  /**
   * Projects the elements of the iterable into a new form, and flattens the iterable of iterables
   * into a single iterable.
   * @param selector The transformation function to use for each element. The index parameter
   * is the index that the element was at in the source iterable, *not* the resulting one.
   */
  public selectMany<TResult>(selector: IndexMapFn<TElement, Iterable<TResult>>) {
    return new LazySelectMany(this, selector);
  }

  /**
   * Skips the given number of elements from the start of the iterable and returns
   * the rest.
   * @param count The number of elements to skip.
   */
  public skip(count: number) {
    return new LazySkip(this, count);
  }

  /**
   * Skips the given number of elements from the end of the iterable, returning the rest.
   * @param count The number of elements to skip from the end.
   * @remarks This iterator requires the iterable to be finite in length.
   */
  public skipLast(count: number) {
    return new LazySkipLast(this, count);
  }

  /**
   * Skips all elements in the iterable until the condition returns true, after which all
   * elements are returned regardless.
   * @param predicate The predicate function to check the condition with.
   */
  public skipWhile(predicate: IndexPredicate<TElement>) {
    return new LazySkipWhile(this, predicate);
  }

  /**
   * Returns the given number of elements from the start of the iterable, ignoring
   * the rest.
   * @param count The number of elements to take from the start.
   */
  public take(count: number) {
    return new LazyTake(this, count);
  }

  /**
   * Returns the given number of elements from the end of the iterable, ignore the
   * elements before.
   * @remarks This iterator requires the iterable to be finite in length.
   */
  public takeLast(count: number) {
    return new LazyTakeLast(this, count);
  }

  /**
   * Takes all elements in the iterable until the condition returns true, after which
   * the iterable is considered to have ended.
   * @param predicate The predicate function to check the condition with.
   */
  public takeWhile(predicate: IndexPredicate<TElement>) {
    return new LazyTakeWhile(this, predicate);
  }

  /**
   * Returns the set union between 2 iterables. This like doing an OR
   * over the 2 iterables.
   * @param second The iterable to get the union of.
   * @param compareOn A mapping function to use as the key to compare with. The value
   * will be effectively compared using a strict equals (`===`). If not given, then
   * the strict equals will used directly.
   * @remarks This will iterate the second iterable completely once it has
   * started iteration (not before).
   */
  public union<TKey = TElement>(second: Iterable<TElement>, compareOn?: MapFn<TElement, TKey>) {
    return new LazyUnion(this, second, compareOn);
  }

  /**
   * Filters elements based on the given predicate.
   * @param predicate The predicate function to filter elements with.
   */
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

  public *[Symbol.iterator](): Iterator<TElement> {
    const arr = aggregates.toArray(this._iterable);
    for (let i = arr.length - 1; i >= 0; i--) {
      yield arr[i];
    }
  }
}

class LazySelect<TSource, TResult> extends Lazy<TResult> {
  public constructor(
    private readonly _iterable: Iterable<TSource>,
    private readonly _selector: IndexMapFn<TSource, TResult>,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TResult> {
    let index = 0;
    for (const value of this._iterable) {
      yield this._selector(value, index);
      index++;
    }
  }
}

class LazySelectMany<TSource, TResult> extends Lazy<TResult> {
  public constructor(
    private readonly _iterable: Iterable<TSource>,
    private readonly _selector: IndexMapFn<TSource, Iterable<TResult>>,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<TResult> {
    let index = 0;
    for (const outer of this._iterable) {
      for (const inner of this._selector(outer, index)) {
        yield inner;
      }
      index++;
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
