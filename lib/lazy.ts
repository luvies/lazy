import * as aggregates from './aggregates.ts';
import * as iterators from './iterators.ts';
import {
  AggFn,
  BoolPredicate,
  CallbackFn,
  ComparerFn,
  MapFn,
  StrFn,
} from './aggregates.ts';
import {
  CombineFn,
  IGrouping,
  IndexIsPredicate,
  IndexMapFn,
  IndexPredicate,
  SortFn,
} from './iterators.ts';

// Base lazy class.

/**
 * The base class that all lazy iterable objects derive from.
 * This can be extended with custom iterators if needed.
 */
export abstract class Lazy<TElement> implements Iterable<TElement> {
  // ===================================== Base iterators =====================================

  /**
   * Creates an empty lazy iterable.
   * @returns The empty lazy iterable object.
   */
  public static empty<TElement>(): Lazy<TElement> {
    return new LazyEmpty<TElement>();
  }

  /**
   * Creates a lazy iterable object from the given iterable object.
   * @param iterable The object to source for lazy iteration.
   * @returns The lazy iterable object with the given iterable as the source.
   * @remarks If you pass in a lazy iterator, then it is returned without
   * changes.
   */
  public static from<TElement>(iterable: Iterable<TElement>): Lazy<TElement> {
    if (iterable instanceof Lazy) {
      return iterable;
    }
    return new LazyIterator(iterable);
  }

  /**
   * Creates a lazy iterable object that will produce a range of integers.
   * @param start The starting number of the range (inclusive).
   * @param end The ending number of the range (exclusive). If not given, then
   * the value is assumed to be +Infinity.
   * @returns The lazy iterable object with the range as the source.
   * @remarks When creating an infinite interable, be very careful. If you do not
   * include your own stop condition (e.g. with `.take(n)`), then it will lock
   * up the thread until the process is aborted. You will also have to take into
   * account that some lazy iterators *require* the interable to be finite to work.
   * Check the remarks on the function you want to use to see which ones will work.
   */
  public static range(start: number, end?: number): Lazy<number> {
    return new LazyRange(start, end);
  }

  /**
   * Creates a lazy iterable object that will repeate the element a given number
   * of times.
   * @param element The value to repeat.
   * @param count The number of times to repeat it. If not given, then the
   * value is assumed to be +Infinity.
   * @returns The lazy iterable object with the repeated value as the source.
   * @throws {Error} If count < 0.
   * @remarks When creating an infinite interable, be very careful. If you do not
   * include your own stop condition (e.g. with `.take(n)`), then it will lock
   * up the thread until the process is aborted. You will also have to take into
   * account that some lazy iterators *require* the interable to be finite to work.
   * Check the remarks on the function you want to use to see which ones will work.
   */
  public static repeat<TElement>(
    element: TElement,
    count?: number,
  ): Lazy<TElement> {
    return new LazyRepeat(element, count);
  }

  // ===================================== Aggregates =====================================

  /**
   * Applies an accumulator function over an interable.
   * @param agg The accumulator function to apply over the iterable.
   * @returns The final accumulator value.
   * @throws {Error} If the iterable was empty.
   * @remarks The function works very similarly to `Array.prototype.reduce`, with
   * the added benefit of working on any general iterable object.
   * This will cause a complete iteration of the iterable object.
   */
  public aggregate(agg: AggFn<TElement, TElement>): TElement;
  /**
   * Applies an accumulator function over an interable.
   * @param agg The accumulator function to apply over the iterable.
   * @param seed The seed to set the initial `acc` param to in the accumulator function.
   * If not given, then the first element is used.
   * @returns The final accumulator value.
   * @remarks The function works very similarly to `Array.prototype.reduce`, with
   * the added benefit of working on any general iterable object.
   * This will cause a complete iteration of the iterable object.
   */
  public aggregate<TAcc>(agg: AggFn<TElement, TAcc>, seed: TAcc): TAcc;
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public aggregate<TAcc>(agg: AggFn<TElement, TAcc | TElement>, seed?: TAcc) {
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
   * @remarks This will iterate until the condition is false or until the iterable
   * ends.
   */
  public all(predicate: BoolPredicate<TElement>): boolean {
    return aggregates.all(this, predicate);
  }

  /**
   * Returns whether the iterable is not empty.
   * @returns Whether the iterable is not empty.
   * @remarks For checking whether the given lazy query has any elements, prefer to use
   * this function over [[Lazy.count]], as that function will iterate the entire
   * object, whereas this will stop at the first.
   * This will iterate only a single time.
   */
  public any(): boolean;
  /**
   * Returns whether any of the elements satisfy the given condition.
   * @param predicate The function to use to test each element.
   * @returns Whether any element in the iterable satisfied the condition.
   * If the iterable was empty, then `false` is returned
   * @remarks For checking whether the given lazy query has any elements, prefer to use
   * this function over [[Lazy.count]], as that function will iterate the entire
   * object, whereas this will stop at the first element that satisfies the condition.
   * This will iterate until the condition is true or until the iterable ends.
   */
  public any(predicate: BoolPredicate<TElement>): boolean;
  public any(predicate?: BoolPredicate<TElement>): boolean {
    return aggregates.any(this, predicate);
  }

  /**
   * Computes the average of the iterable.
   * @returns The numeric average of the iterable.
   * @throws {TypeError} If any element in the iterable was a non-number.
   * @throws {Error} If the iterable was empty.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public average(): TElement extends number ? number : never;
  /**
   * Computes the average of result of the selector function over the iterable.
   * @param selector The transformation function to use for each element.
   * @returns The numeric average of the results of the selector function.
   * @throws {Error} If the iterable was empty.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public average(selector: MapFn<TElement, number>): number;
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public average(selector?: MapFn<TElement, number>) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return aggregates.average(this, selector as any);
  }

  /**
   * Determines whether the iterable has a given element.
   * @param element The value to search for.
   * @param comparer The function that compares 2 elements and returns a boolean on whether they
   * are equal or not. If not given, defaults to strict equals (`===`).
   * @returns Whether the element was in the iterable.
   * @remarks This will iterable until the given value is found, or until the
   * iterable ends.
   */
  public contains(element: TElement, comparer?: ComparerFn<TElement>): boolean {
    return aggregates.contains(this, element, comparer);
  }

  /**
   * Returns the number of elements in the iterable.
   * @returns The number of elements in the iterable.
   * @remarks To determine whether an iterable has any elements, prefer the
   * [[Lazy.any]] method, as this will iterate the entire iterable regardless.
   * This will cause a complete iteration of the iterable object.
   */
  public count(): number;
  /**
   * Returns the number of elements that satify the given condition.
   * @param predicate The predicate to test each element with.
   * @returns The number of elements in the iterable that matched the condition.
   * @remarks To determine whether an iterable has any elements, prefer the
   * [[Lazy.any]] method, as this will iterate the entire iterable regardless.
   * This will cause a complete iteration of the iterable object.
   */
  public count(predicate: BoolPredicate<TElement>): number;
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public count(predicate?: BoolPredicate<TElement>) {
    return aggregates.count(this, predicate);
  }

  /**
   * Returns the element at the given index of the iterable.
   * @param index The index of the element to get.
   * @returns The element at the given index.
   * @throws {Error} If the index was < 0 or if it is >= the length of the iterable.
   * @remarks The will iterate until the specified index, or until the iterable
   * ends.
   */
  public elementAt(index: number): TElement {
    return aggregates.elementAt(this, index);
  }

  /**
   * Returns the element at the given index of the iterable, or the given default
   * value if out of range.
   * @param index The index of the element to get.
   * @param defaultValue The default value to use if the index was out of range.
   * @returns The element at the given index.
   * @remarks This will iterable until the specified index, or unitl the iterable
   * ends.
   */
  public elementAtOrDefault(index: number, defaultValue: TElement): TElement;
  /**
   * Returns the element at the given index of the iterable, or the given default
   * value if out of range.
   * @param index The index of the element to get.
   * @param defaultValue The default value to use if the index was out of range.
   * @returns The element at the given index.
   * @remarks This will iterable until the specified index, or unitl the iterable
   * ends.
   */
  public elementAtOrDefault<TDefault>(
    index: number,
    defaultValue: TDefault,
  ): TElement | TDefault;
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public elementAtOrDefault<TDefault = TElement>(
    index: number,
    defaultValue: TDefault,
  ) {
    return aggregates.elementAtOrDefault(this, index, defaultValue);
  }

  /**
   * Returns the first element in the iterable.
   * @returns The first element in the iterable.
   * @throws {Error} If the iterable was empty.
   * @remarks This will only iterate a single time.
   */
  public first(): TElement;
  /**
   * Returns the first element that satisfies the given condition.
   * @param predicate The predicate to test each element with.
   * @returns The first element in the iterable that satisfies the condition.
   * @throws {Error} If the iterable was empty.
   * @remarks This will iterate until the condition is satisfied, or until the
   * iterable ends.
   */
  public first(predicate: BoolPredicate<TElement>): TElement;
  public first(predicate?: BoolPredicate<TElement>): TElement {
    return aggregates.first(this, predicate);
  }

  /**
   * Returns the first element in the iterable, or the given default value if
   * the iterable was empty.
   * @param defaultValue The value to use of the iterable was empty.
   * @returns The first element in the iterable, or the default value if empty.
   * @remarks This will only iterate a single time.
   */
  public firstOrDefault(defaultValue: TElement): TElement;
  /**
   * Returns the first element in the iterable, or the given default value if
   * the iterable was empty.
   * @param defaultValue The value to use of the iterable was empty.
   * @returns The first element in the iterable, or the default value if empty.
   * @remarks This will only iterate a single time.
   */
  public firstOrDefault<TDefault>(defaultValue: TDefault): TElement | TDefault;
  /**
   * Returns the first element in the iterable that satisfies the condition,
   * or the given default value.
   * @param defaultValue The value to use if no element satisfied the condition.
   * @param predicate The predicate to test each element with.
   * @returns The first element in the iterable that satisfies the condition,
   * or the default value if none satisfied it.
   * @remarks This will iterate until the condition is satisfied, or until the
   * iterable ends.
   */
  public firstOrDefault(
    defaultValue: TElement,
    predicate: BoolPredicate<TElement>,
  ): TElement;
  /**
   * Returns the first element in the iterable that satisfies the condition,
   * or the given default value.
   * @param defaultValue The value to use if no element satisfied the condition.
   * @param predicate The predicate to test each element with.
   * @returns The first element in the iterable that satisfies the condition,
   * or the default value if none satisfied it.
   * @remarks This will iterate until the condition is satisfied, or until the
   * iterable ends.
   */
  public firstOrDefault<TDefault>(
    defaultValue: TDefault,
    predicate: BoolPredicate<TElement>,
  ): TElement | TDefault;
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public firstOrDefault<TDefault = TElement>(
    defaultValue: TDefault,
    predicate?: BoolPredicate<TElement>,
  ) {
    return aggregates.firstOrDefault(this, defaultValue, predicate);
  }

  /**
   * Mimics the behaviour of `Array.prototype.forEach`, with the exception
   * of not providing the entire array as the 3rd param of the callback.
   * @param callbackFn The callback function that will be executed for each element
   * in the iterable.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public forEach(callbackFn: CallbackFn<TElement>): void {
    aggregates.forEach(this, callbackFn);
  }

  /**
   * Determines whether 2 iterables are equal.
   * @param second The iterable to compare against.
   * @param comparer The function to perform the comparision of each pair of
   * elements with. If not given, defaults to strict equals (`===`).
   * @returns Whether the 2 iterables were both equal.
   * @remarks This will check for both order and value, and will iterate
   * both iterables completely.
   */
  public iterableEquals(
    second: Iterable<TElement>,
    comparer?: ComparerFn<TElement>,
  ): boolean {
    return aggregates.iterableEquals(this, second, comparer);
  }

  /**
   * Returns the last element in the iterable.
   * @returns The last element in the iterable.
   * @throws {Error} If the iterable was empty.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public last(): TElement;
  /**
   * Returns the last element in the iterable that satisfies the given condition.
   * @param predicate The predicate to test each element with.
   * @returns The last element in the iterable that satisfied the condition.
   * @throws {Error} If no elements satisfied the condition.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public last(predicate: BoolPredicate<TElement>): TElement;
  public last(predicate?: BoolPredicate<TElement>): TElement {
    return aggregates.last(this, predicate);
  }

  /**
   * Returns the last element in the iterable, or the given default value if
   * the iterable was empty.
   * @param defaultValue The value to use of the iterable was empty.
   * @returns The last element in the iterable, or the default value if empty.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public lastOrDefault(defaultValue: TElement): TElement;
  /**
   * Returns the last element in the iterable, or the given default value if
   * the iterable was empty.
   * @param defaultValue The value to use of the iterable was empty.
   * @returns The last element in the iterable, or the default value if empty.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public lastOrDefault<TDefault>(defaultValue: TDefault): TElement | TDefault;
  /**
   * Returns the last element in the iterable that satisfies the given condition,
   * or the given default value.
   * @param defaultValue The value to use of the iterable was empty.
   * @param predicate The predicate to test each element with.
   * @returns The last element in the iterable, or the default value if no element
   * satisfied the condition.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public lastOrDefault(
    defaultValue: TElement,
    predicate: BoolPredicate<TElement>,
  ): TElement;
  /**
   * Returns the last element in the iterable that satisfies the given condition,
   * or the given default value.
   * @param defaultValue The value to use of the iterable was empty.
   * @param predicate The predicate to test each element with.
   * @returns The last element in the iterable, or the default value if no element
   * satisfied the condition.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public lastOrDefault<TDefault>(
    defaultValue: TDefault,
    predicate: BoolPredicate<TElement>,
  ): TElement | TDefault;
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public lastOrDefault(
    defaultValue: TElement,
    predicate?: BoolPredicate<TElement>,
  ) {
    return aggregates.lastOrDefault(this, defaultValue, predicate);
  }

  /**
   * Returns the maximum value in the iterable.
   * @returns The maximum element.
   * @throws {TypeError} If any element in the iterable was a non-number.
   * @throws {Error} If the iterable was empty.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public max(): TElement extends number ? number : never;
  /**
   * Returns the maximum value of result of the selector function over the iterable.
   * @param selector The transformation function to use for each element.
   * @returns The maximum result of the selector function.
   * @throws {Error} If the iterable was empty.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public max(selector: MapFn<TElement, number>): number;
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public max(selector?: MapFn<TElement, number>) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return aggregates.max(this, selector as any);
  }

  /**
   * Returns the minimum value in the iterable.
   * @returns The minimum element.
   * @throws {TypeError} If any element in the iterable was a non-number.
   * @throws {Error} If the iterable was empty.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public min(): TElement extends number ? number : never;
  /**
   * Returns the minimum value of result of the selector function over the iterable.
   * @param selector The transformation function to use for each element.
   * @returns The minimum result of the selector function.
   * @throws {Error} If the iterable was empty.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public min(selector: MapFn<TElement, number>): number;
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public min(selector?: MapFn<TElement, number>) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return aggregates.min(this, selector as any);
  }

  /**
   * Resolves all of the promises in the iterable, and returns a new Lazy
   * iterable from the result.
   * @returns A promise that will resolve to a lazy iterable object.
   * @remarks This will cause a complete iteration of the iterable object.
   * This will behave similar to [[cache]], in that the original lazy iterable
   * will be resolved completely and then discarded, in favour of the resolved
   * iterable.
   */
  public resolveAll(): Promise<
    TElement extends PromiseLike<infer TResult> ? Lazy<TResult> : Lazy<TElement>
  > {
    return aggregates
      .resolveAll(this)
      .then(iterable => Lazy.from(iterable)) as any;
  }

  /**
   * Returns a single element from the iterable that matches the given
   * condition.
   * @param predicate The predicate function to test each element with.
   * @returns The element that satisfies the condition.
   * @throws {Error} If no element could be found that matched the condition.
   * @remarks This will iterate until the condition is met or until the iterable
   * ends.
   */
  public single(predicate: BoolPredicate<TElement>): TElement {
    return aggregates.single(this, predicate);
  }

  /**
   * Returns a single element from the iterable that matches the given
   * condition, or a default value if no element was found.
   * @param predicate The predicate function to test each element with.
   * @param defaultValue The default value to use if no element could be found.
   * @returns The element that satisfies the condition, or the default value
   * if no element was found.
   * @remarks This will iterate until the condition is met or until the iterable
   * ends.
   */
  public singleOrDefault(
    predicate: BoolPredicate<TElement>,
    defaultValue: TElement,
  ): TElement;
  /**
   * Returns a single element from the iterable that matches the given
   * condition, or a default value if no element was found.
   * @param predicate The predicate function to test each element with.
   * @param defaultValue The default value to use if no element could be found.
   * @returns The element that satisfies the condition, or the default value
   * if no element was found.
   * @remarks This will iterate until the condition is met or until the iterable
   * ends.
   */
  public singleOrDefault<TDefault>(
    predicate: BoolPredicate<TElement>,
    defaultValue: TDefault,
  ): TElement | TDefault;
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public singleOrDefault<TDefault = TElement>(
    predicate: BoolPredicate<TElement>,
    defaultValue: TDefault,
  ) {
    return aggregates.singleOrDefault(this, predicate, defaultValue);
  }

  /**
   * Joins all the elements in the iterable together into a single string,
   * split by the given separator.
   * @param separator The separator to split each element with in the string.
   * Defaults to `''`.
   * @param strFn The function to convert each element into a string.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public stringJoin(separator?: string, strFn?: StrFn<TElement>): string {
    return aggregates.stringJoin(this, separator, strFn);
  }

  /**
   * Computes the sum of all the elements in the iterable.
   * @returns The sum of all the elements.
   * @throws {TypeError} If any element in the iterable was a non-number.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public sum(): TElement extends number ? number : never;
  /**
   * Returns the sum of all the results of the selector function over the iterable.
   * @param selector The transformation function to use for each element.
   * @returns The sum of the results of the selector function.
   * @throws {Error} If the iterable was empty.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public sum(selector: MapFn<TElement, number>): number;
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public sum(selector?: MapFn<TElement, number>) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return aggregates.sum(this, selector as any);
  }

  /**
   * Converts the iterable into a standard JavaScript `Array`.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public toArray(): TElement[] {
    return aggregates.toArray(this);
  }

  /**
   * Converts the iterable to a JSON-serialisable array.
   * @remarks This will cause a complete iteration of the iterable object.
   * This will not do anything to the elements, meaning that you are
   * responsible for ensuring that they are all JSON-serialisable.
   */
  public toJSON(): TElement[] {
    return this.toArray();
  }

  /**
   * Converts the iterable into a map using the key and value function.
   * @param keyFn The function to use to derive the key of each map element.
   * @param valueFn The function to use to derive the value of map value. If
   * not given, then the value itself is used.
   * @returns A `Map<TKey, TResult>` derived from the iterable.
   * @remarks This will cause a complete iteration of the iterable object.
   */
  public toMap<TKey, TResult = TElement>(
    keyFn: MapFn<TElement, TKey>,
    valueFn?: MapFn<TElement, TResult>,
  ): Map<TKey, TResult> {
    return aggregates.toMap(this, keyFn, valueFn);
  }

  // ===================================== Iterators =====================================

  /**
   * Appends the element to the end of the iterable.
   * @param element The element to append.
   * @remarks Does not cause additional unexpected iteration.
   */
  public append(element: TElement): Lazy<TElement> {
    return new LazyAppendPrepend(this, element, false);
  }

  /**
   * Applies the given lazy iterable implementation to the current object.
   * This allows for using custom Lazy implementations using the standard
   * chaining syntax.
   * @param fn The function that will create the iterable instance using
   * the current object.
   * @returns The instantiated iterable object.
   */
  public apply<TLazy extends Lazy<TResult>, TResult = TElement>(
    fn: (t: Lazy<TElement>) => TLazy,
  ): Lazy<TResult> {
    return fn(this);
  }

  /**
   * Batches elements in groups of the given batch size.
   * @param batchSize The size of each batch.
   * @param includeIncomplete Whether to include batches
   * that are smaller than the target size. This only applies
   * to the final batch of the iterable if the total size is
   * not a multiple of the batch size.
   * @remarks Does not cause additional unexpected iteration.
   */
  public batchIn(
    batchSize: number,
    includeIncomplete = true,
  ): Lazy<Iterable<TElement>> {
    return new LazyBatchIn(this, batchSize, includeIncomplete);
  }

  /**
   * Resolves the underlaying iterable completely and returns a lazy
   * of the result.
   * @remarks This will completely iterate the underlaying iterable,
   * and return a completely new lazy object of the result. This allows
   * for some optimisation when a chain has become complex and iteration
   * of it is needed multiple times (as the resulting iterable will only be
   * calulated once, and then reused). This can also be used to ensure
   * that side-effects of the chain are only done once, which can be useful
   * in more complicated computations.
   * Since this will return a completely new Lazy iterable, it means that,
   * if no other references exist, then the previous chain (and even the
   * original iterable) can be freed for garbage collection, potentially
   * helping with memory.
   */
  public cache(): Lazy<TElement> {
    return Lazy.from(this.toArray());
  }

  /**
   * Concatinates multiple iterables in order.
   * @param iterables The other iterables to concatinate with.
   * @remarks Does not cause additional unexpected iteration.
   */
  public concat(...iterables: Array<Iterable<TElement>>): Lazy<TElement> {
    return new LazyConcat(this, ...iterables);
  }

  /**
   * Returns the elements in the iterable, or the given default value
   * as the only element if it contained none.
   * @param defaultValue The value to use if the iterable was empty.
   * @remarks Does not cause additional unexpected iteration.
   */
  public defaultIfEmpty(defaultValue: TElement): Lazy<TElement> {
    return new LazyDefaultIfEmpty(this, defaultValue);
  }

  /**
   * Returns the distinct elements in the iterable.
   * @param compareOn A mapping function to get the key to compare with. The result
   * will be effectively compared using a strict equals (`===`) against the others.
   * If not given, then each element will used directly.
   * @remarks Does not cause additional unexpected iteration.
   */
  public distinct<TKey>(compareOn?: MapFn<TElement, TKey>): Lazy<TElement> {
    return new LazyDistinct(this, compareOn);
  }

  /**
   * Returns the set difference between 2 iterables. This like doing an XOR
   * over the 2 iterables.
   * @param second The iterable to get the difference of.
   * @param compareOn A mapping function to get the key to compare with. The value
   * will be effectively compared using a strict equals (`===`) againt the others.
   * If not given, then each element will used directly.
   * @remarks This will iterate the second iterable completely once it has
   * started iteration (not before). It will not cause additional unexpected iteration
   * on the underlying iterable.
   */
  public except<TKey = TElement>(
    second: Iterable<TElement>,
    compareOn?: MapFn<TElement, TKey>,
  ): Lazy<TElement> {
    return new LazyExcept(this, second, compareOn);
  }

  /**
   * Groups the elements by key.
   * @param keyFn The function to extract the key from each element.
   * @remarks When this is iterated (not before), the underlying iterator is walked through
   * completely.
   */
  public groupBy<TKey>(
    keyFn: MapFn<TElement, TKey>,
  ): Lazy<IGrouping<TKey, TElement>>;
  /**
   * Groups the elements by key and projects each element using the given function.
   * @param keyFn The function to extract the key from each element.
   * @param elementSelector The transformation function to use for each element.
   * @remarks When this is iterated (not before), the underlying iterator is walked through
   * completely.
   */
  public groupBy<TKey, TItem>(
    keyFn: MapFn<TElement, TKey>,
    elementSelector: MapFn<TElement, TItem>,
  ): Lazy<IGrouping<TKey, TItem>>;
  /**
   * Groups the elements by key and projects each element using the given function.
   * The elements of each group are projected using the given function.
   * @param keyFn The function to extract the key from each element.
   * @param elementSelector The transformation function to use for each element.
   * @param resultSelector The transformation function to create the result elements with.
   * @remarks When this is iterated (not before), the underlying iterator is walked through
   * completely.
   */
  public groupBy<TKey, TItem, TResult>(
    keyFn: MapFn<TElement, TKey>,
    elementSelector: MapFn<TElement, TItem>,
    resultSelector: CombineFn<TKey, Iterable<TItem>, TResult>,
  ): Lazy<TResult>;
  public groupBy<TKey, TItem = TElement, TResult = IGrouping<TKey, TElement>>(
    keyFn: MapFn<TElement, TKey>,
    elementSelector?: MapFn<TElement, TItem>,
    resultSelector?: CombineFn<TKey, Iterable<TItem>, TResult>,
  ): Lazy<TResult> {
    return new LazyGroupBy(this, keyFn, elementSelector, resultSelector);
  }

  /**
   * Joins 2 iterables on the given key and groups the results.
   * @param second The other iterable to group join with.
   * @param firstKeyFn The function that extracts the key from an element
   * of the first iterable.
   * @param secondKeyFn The function that extracts the key from an element
   * of the second iterable.
   * @param joinFn The function that takes an element from the first and an
   * iterable of elements from the second, and outputs the resulting element.
   * @remarks This will iterate the second iterable completely once it has
   * started iteration (not before). It will not cause additional unexpected iteration
   * on the underlying iterable.
   */
  public groupJoin<TSecond, TKey, TResult>(
    second: Iterable<TSecond>,
    firstKeyFn: MapFn<TElement, TKey>,
    secondKeyFn: MapFn<TSecond, TKey>,
    joinFn: CombineFn<TElement, Iterable<TSecond>, TResult>,
  ): Lazy<TResult> {
    return new LazyGroupJoin(this, second, firstKeyFn, secondKeyFn, joinFn);
  }

  /**
   * Returns the set intersection between 2 iterables. This like doing an AND
   * over the 2 iterables.
   * @param second The iterable to get the intersection of.
   * @param compareOn A mapping function to get the key to compare with. The value
   * will be effectively compared using a strict equals (`===`) against the others.
   * If not given, then each element will used directly.
   * @remarks This will iterate the second iterable completely once it has
   * started iteration (not before). It will not cause additional unexpected iteration
   * on the underlying iterable.
   */
  public intersect<TKey = TElement>(
    second: Iterable<TElement>,
    compareOn?: MapFn<TElement, TKey>,
  ): Lazy<TElement> {
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
   * started iteration (not before). It will not cause additional unexpected iteration
   * on the underlying iterable.
   */
  public join<TSecond, TKey, TResult>(
    second: Iterable<TSecond>,
    firstKeyFn: MapFn<TElement, TKey>,
    secondKeyFn: MapFn<TSecond, TKey>,
    joinFn: CombineFn<TElement, TSecond, TResult>,
  ): Lazy<TResult> {
    return new LazyJoin(this, second, firstKeyFn, secondKeyFn, joinFn);
  }

  /**
   * Sorts the iterable in ascending order.
   * @param keyFn The function used to get the key from a given element.
   * @param compareFn The function that is passed to `Array.prototype.sort` to
   * compare values and return the comparison number. If not given, a default
   * sorting function will be used. This sorting function will match the
   * behaviour of the standard sort comparison function.
   * @remarks When this is iterated (not before), the underlying iterator is walked through
   * completely in order to allow sorting.
   */
  public orderBy<TKey>(
    keyFn: MapFn<TElement, TKey>,
    compareFn?: SortFn<TKey>,
  ): Lazy<TElement> {
    return new LazyOrderBy(this, keyFn, compareFn, false);
  }

  /**
   * Sorts the iterable in descending order.
   * @param keyFn The function used to get the key from a given element.
   * @param compareFn The function that is passed to `Array.prototype.sort` to
   * compare values and return the comparison number. If not given, a default
   * sorting function will be used. This sorting function will match the
   * behaviour of the standard sort comparison function.
   * @remarks When this is iterated (not before), the underlying iterator is walked through
   * completely in order to allow sorting.
   */
  public orderByDecending<TKey>(
    keyFn: MapFn<TElement, TKey>,
    compareFn?: SortFn<TKey>,
  ): Lazy<TElement> {
    return new LazyOrderBy(this, keyFn, compareFn, true);
  }

  /**
   * Sorts the iterable in acending order according to the numeric
   * result of the key function.
   * @param keyFn The function user to get the key from the given element.
   * @remarks When this is iterated (not before), the underlying iterator is walked through
   * completely in order to allow sorting.
   * This function is equivalent to [[orderBy]] with a numeric comparison
   * compare function.
   */
  public orderNumericallyBy(keyFn: MapFn<TElement, number>): Lazy<TElement> {
    return this.orderBy(keyFn, iterators.numericComparer);
  }

  /**
   * Sorts the iterable in descending order according to the numeric
   * result of the key function.
   * @param keyFn The function used to get the key from a given element.
   * @remarks When this is iterated (not before), the underlying iterator is walked through
   * completely in order to allow sorting.
   * This function is equivalent to [[orderByDecending]] with a numeric comparison
   * compare function.
   */
  public orderNumericallyByDecending(
    keyFn: MapFn<TElement, number>,
  ): Lazy<TElement> {
    return this.orderByDecending(keyFn, iterators.numericComparer);
  }

  /**
   * Prepends the element to the beginning of the iterable.
   * @param element The element to prepend.
   * @remarks Does not cause additional unexpected iteration.
   */
  public prepend(element: TElement): Lazy<TElement> {
    return new LazyAppendPrepend(this, element, true);
  }

  /**
   * Reverses the order of the iterable.
   * @remarks When this is iterated (not before), the underlying iterator is walked through
   * completely in order to allow starting from the end.
   */
  public reverse(): Lazy<TElement> {
    return new LazyReverse(this);
  }

  /**
   * Projects the elements of the iterable into a new form.
   * @param selector The transformation function to use for each element.
   * @remarks Does not cause additional unexpected iteration.
   */
  public select<TResult>(
    selector: IndexMapFn<TElement, TResult>,
  ): Lazy<TResult> {
    return new LazySelect(this, selector);
  }

  /**
   * Projects the elements of the iterable into a new form, and flattens the iterable of iterables
   * into a single iterable.
   * @param selector The transformation function to use for each element. The index parameter
   * is the index that the element was at in the source iterable, *not* the resulting one.
   * @remarks Does not cause additional unexpected iteration.
   */
  public selectMany<TResult>(
    selector: IndexMapFn<TElement, Iterable<TResult>>,
  ): Lazy<TResult> {
    return new LazySelectMany(this, selector);
  }

  /**
   * Skips the given number of elements from the start of the iterable and returns
   * the rest.
   * @param count The number of elements to skip.
   * @remarks Does not cause additional unexpected iteration.
   */
  public skip(count: number): Lazy<TElement> {
    return new LazySkip(this, count);
  }

  /**
   * Skips the given number of elements from the end of the iterable, returning the rest.
   * @param count The number of elements to skip from the end.
   * @remarks This iterator requires the iterable to be finite in length. It will iterate
   * slightly ahead of the resulting iterable.
   */
  public skipLast(count: number): Lazy<TElement> {
    return new LazySkipLast(this, count);
  }

  /**
   * Skips all elements in the iterable until the condition returns true, after which all
   * elements are returned regardless.
   * @param predicate The predicate function to check the condition with.
   * @remarks Does not cause additional unexpected iteration.
   */
  public skipWhile(predicate: IndexPredicate<TElement>): Lazy<TElement> {
    return new LazySkipWhile(this, predicate);
  }

  /**
   * Returns the given number of elements from the start of the iterable, ignoring
   * the rest.
   * @param count The number of elements to take from the start.
   * @remarks Does not cause additional unexpected iteration.
   */
  public take(count: number): Lazy<TElement> {
    return new LazyTake(this, count);
  }

  /**
   * Returns the given number of elements from the end of the iterable, ignore the
   * elements before.
   * @remarks This iterator requires the iterable to be finite in length. It will iterate
   * until the end.
   */
  public takeLast(count: number): Lazy<TElement> {
    return new LazyTakeLast(this, count);
  }

  /**
   * Takes all elements in the iterable until the condition returns true, after which
   * the iterable is considered to have ended.
   * @param predicate The predicate function to check the condition with.
   * @remarks Does not cause additional unexpected iteration.
   */
  public takeWhile(predicate: IndexPredicate<TElement>): Lazy<TElement> {
    return new LazyTakeWhile(this, predicate);
  }

  /**
   * Returns the set union between 2 iterables. This like doing an OR
   * over the 2 iterables.
   * @param second The iterable to get the union of.
   * @param compareOn A mapping function to get the key to compare with. The value
   * will be effectively compared using a strict equals (`===`) against the others.
   * If not given, then the element will used directly.
   * @remarks This will iterate the second iterable completely once it has
   * started iteration (not before). It will not cause additional unexpected iteration
   * on the underlying iterable.
   */
  public union<TKey = TElement>(
    second: Iterable<TElement>,
    compareOn?: MapFn<TElement, TKey>,
  ): Lazy<TElement> {
    return new LazyUnion(this, second, compareOn);
  }

  /**
   * Filters elements based on the given predicate.
   * @param predicate The predicate function to filter elements with.
   * @remarks Does not cause additional unexpected iteration.
   */
  public where<TResult extends TElement>(
    predicate: IndexIsPredicate<TElement, TResult>,
  ): Lazy<TResult>;
  /**
   * Filters elements based on the given predicate.
   * @param predicate The predicate function to filter elements with.
   * @remarks Does not cause additional unexpected iteration.
   */
  public where(predicate: IndexPredicate<TElement>): Lazy<TElement>;
  public where(predicate: IndexPredicate<TElement>): Lazy<TElement> {
    return new LazyWhere(this, predicate);
  }

  /**
   * Combines 2 iterables into an iterable of tuples. This will merge elements
   * on the same index, finishing on the iterable that finishes first. If the
   * first iterable has 3 elements, and the second 4, then the result will
   * have 3 elements.
   * @param second The iterable to zip with.
   * @remarks Does not cause additional unexpected iteration.
   */
  public zip<TSecond>(second: Iterable<TSecond>): Lazy<[TElement, TSecond]>;
  /**
   * Combines 2 iterables using the given selector. This will merge elements
   * on the same index, finishing on the iterable that finishes first. If the
   * first iterable has 3 elements, and the second 4, then the result will
   * have 3 elements.
   * @param second The iterable to zip with.
   * @param selector The function to combine the iterables with.
   * @remarks Does not cause additional unexpected iteration.
   */
  public zip<TSecond, TResult>(
    second: Iterable<TSecond>,
    selector: CombineFn<TElement, TSecond, TResult>,
  ): Lazy<TResult>;
  public zip<TSecond, TResult>(
    second: Iterable<TSecond>,
    selector?: CombineFn<TElement, TSecond, TResult>,
  ): Lazy<TResult> {
    return new LazyZip(this, second, selector);
  }

  public abstract [Symbol.iterator](): Iterator<TElement>;
}

// Base iterators.

/**
 * @hidden
 */
class LazyEmpty<TElement> extends Lazy<TElement> {
  public [Symbol.iterator](): Iterator<TElement> {
    return {
      next() {
        return {
          done: true,
          value: undefined as any,
        };
      },
    };
  }
}

/**
 * @hidden
 */
class LazyIterator<TElement> extends Lazy<TElement> {
  public constructor(private readonly _iterable: Iterable<TElement>) {
    super();
  }

  public count(predicate?: BoolPredicate<TElement>): number {
    if (predicate) {
      return super.count(predicate);
    }

    // Use shortcut if we are directly on an array.
    if (Array.isArray(this._iterable)) {
      return this._iterable.length;
    }

    return super.count();
  }

  public elementAt(index: number): TElement {
    // Use shortcut if we are directly on an array.
    if (Array.isArray(this._iterable)) {
      if (index >= 0 && index < this._iterable.length) {
        return this._iterable[index];
      } else {
        throw new Error('Index out of array bounds');
      }
    }

    return super.elementAt(index);
  }

  public elementAtOrDefault(index: number, defaultValue: TElement): TElement {
    // Use shortcut if we are directly on an array.
    if (Array.isArray(this._iterable)) {
      if (index >= 0 && index < this._iterable.length) {
        return this._iterable[index];
      } else {
        return defaultValue;
      }
    }

    return super.elementAtOrDefault(index, defaultValue);
  }

  public first(predicate?: BoolPredicate<TElement>): TElement {
    if (predicate) {
      return super.first(predicate);
    }

    // Use shortcut if we are directly on an array.
    if (Array.isArray(this._iterable)) {
      if (this._iterable.length > 0) {
        return this._iterable[0];
      } else {
        throw new Error(aggregates.Errors.Empty);
      }
    }

    return super.first();
  }

  public firstOrDefault(
    defaultValue: TElement,
    predicate?: BoolPredicate<TElement>,
  ): TElement {
    if (predicate) {
      return super.firstOrDefault(defaultValue, predicate);
    }

    // Use shortcut if we are directly on an array.
    if (Array.isArray(this._iterable)) {
      if (this._iterable.length > 0) {
        return this._iterable[0];
      } else {
        return defaultValue;
      }
    }

    return super.firstOrDefault(defaultValue);
  }

  public last(predicate?: BoolPredicate<TElement>): TElement {
    if (predicate) {
      return super.last(predicate);
    }

    // Use shortcut if we are directly on an array.
    if (Array.isArray(this._iterable)) {
      if (this._iterable.length > 0) {
        return this._iterable[this._iterable.length - 1];
      } else {
        throw new Error(aggregates.Errors.Empty);
      }
    }

    return super.last();
  }

  public lastOrDefault(
    defaultValue: TElement,
    predicate?: BoolPredicate<TElement>,
  ): TElement {
    if (predicate) {
      return super.lastOrDefault(defaultValue, predicate);
    }

    // Use shortcut if we are directly on an array.
    if (Array.isArray(this._iterable)) {
      if (this._iterable.length > 0) {
        return this._iterable[this._iterable.length - 1];
      } else {
        return defaultValue;
      }
    }
    return super.lastOrDefault(defaultValue);
  }

  public [Symbol.iterator](): Iterator<TElement> {
    return this._iterable[Symbol.iterator]();
  }
}

/**
 * @hidden
 */
class LazyRange extends Lazy<number> {
  public constructor(
    private readonly _start: number,
    private readonly _end: number = +Infinity,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<number> {
    return new iterators.LazyRangeIterator(this._start, this._end);
  }
}

/**
 * @hidden
 */
class LazyRepeat<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _element: TElement,
    private readonly _count: number = +Infinity,
  ) {
    super();
    if (_count < 0) {
      throw new Error('Count cannot be < 0');
    }
  }

  public [Symbol.iterator](): Iterator<TElement> {
    return new iterators.LazyRepeatIterator(this._element, this._count);
  }
}

/*
  Iterator implementations.
  Each of these will apply some form of transformation on an iterable,
  but *only* while it is being iterated.
*/

/**
 * @hidden
 */
class LazyAppendPrepend<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _element: TElement,
    private readonly _atStart: boolean,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TElement> {
    return new iterators.LazyAppendPrependIterator(
      this._iterable,
      this._element,
      this._atStart,
    );
  }
}

/**
 * @hidden
 */
class LazyBatchIn<TElement> extends Lazy<Iterable<TElement>> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _batchSize: number,
    private readonly _includeComplete: boolean,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<Iterable<TElement>> {
    return new iterators.LazyBatchInIterator(
      this._iterable,
      this._batchSize,
      this._includeComplete,
    );
  }
}

/**
 * @hidden
 */
class LazyConcat<TElement> extends Lazy<TElement> {
  private readonly _iterables: Array<Iterable<TElement>>;

  public constructor(..._iterables: Array<Iterable<TElement>>) {
    super();
    this._iterables = _iterables;
  }

  public [Symbol.iterator](): Iterator<TElement> {
    return new iterators.LazyConcatIterator(this._iterables);
  }
}

/**
 * @hidden
 */
class LazyDefaultIfEmpty<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _defaultValue: TElement,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TElement> {
    return new iterators.LazyDefaultIfEmptyIterator(
      this._iterable,
      this._defaultValue,
    );
  }
}

/**
 * @hidden
 */
class LazyDistinct<TElement, TKey = TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _compareOn?: MapFn<TElement, TKey>,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TElement> {
    return new iterators.LazyDistinctIterator(this._iterable, this._compareOn);
  }
}

/**
 * @hidden
 */
class LazyExcept<TElement, TKey = TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _firstIterable: Iterable<TElement>,
    private readonly _secondIterable: Iterable<TElement>,
    private readonly _compareOn?: MapFn<TElement, TKey>,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TElement> {
    return new iterators.LazyExceptIterator(
      this._firstIterable,
      this._secondIterable,
      this._compareOn,
    );
  }
}

/**
 * @hidden
 */
class LazyGroupBy<
  TSource,
  TKey,
  TElement = TSource,
  TResult = IGrouping<TKey, TElement>
> extends Lazy<TResult> {
  public constructor(
    private readonly _iterable: Iterable<TSource>,
    private readonly _keyFn: MapFn<TSource, TKey>,
    private readonly _elementSelector?: MapFn<TSource, TElement>,
    private readonly _resultSelector?: CombineFn<
      TKey,
      Iterable<TElement>,
      TResult
    >,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TResult> {
    return new iterators.LazyGroupByIterator(
      this._iterable,
      this._keyFn,
      this._elementSelector,
      this._resultSelector,
    );
  }
}

/**
 * @hidden
 */
class LazyGroupJoin<TFirst, TSecond, TKey, TResult> extends Lazy<TResult> {
  public constructor(
    private readonly _firstIterable: Iterable<TFirst>,
    private readonly _secondIterable: Iterable<TSecond>,
    private readonly _firstKeyFn: MapFn<TFirst, TKey>,
    private readonly _secondKeyFn: MapFn<TSecond, TKey>,
    private readonly _joinFn: CombineFn<TFirst, Iterable<TSecond>, TResult>,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TResult> {
    return new iterators.LazyGroupJoinIterator(
      this._firstIterable,
      this._secondIterable,
      this._firstKeyFn,
      this._secondKeyFn,
      this._joinFn,
    );
  }
}

/**
 * @hidden
 */
class LazyIntersect<TElement, TKey = TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _firstIterable: Iterable<TElement>,
    private readonly _secondIterable: Iterable<TElement>,
    private readonly _compareOn?: MapFn<TElement, TKey>,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TElement> {
    return new iterators.LazyIntersectIterator(
      this._firstIterable,
      this._secondIterable,
      this._compareOn,
    );
  }
}

/**
 * @hidden
 */
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

  public [Symbol.iterator](): Iterator<TResult> {
    return new iterators.LazyJoinIterator(
      this._firstIterable,
      this._secondIterable,
      this._firstKeyFn,
      this._secondKeyFn,
      this._joinFn,
    );
  }
}

/**
 * @hidden
 */
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
    return iterators.lazyOrderBy(
      this._iterable,
      this._keyFn,
      this._compareFn,
      this._decending,
    );
  }
}

/**
 * @hidden
 */
class LazyReverse<TElement> extends Lazy<TElement> {
  public constructor(private readonly _iterable: Iterable<TElement>) {
    super();
  }

  public [Symbol.iterator](): Iterator<TElement> {
    return new iterators.LazyReverseIterator(this._iterable);
  }
}

/**
 * @hidden
 */
class LazySelect<TSource, TResult> extends Lazy<TResult> {
  public constructor(
    private readonly _iterable: Iterable<TSource>,
    private readonly _selector: IndexMapFn<TSource, TResult>,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TResult> {
    return new iterators.LazySelectIterator(this._iterable, this._selector);
  }
}

/**
 * @hidden
 */
class LazySelectMany<TSource, TResult> extends Lazy<TResult> {
  public constructor(
    private readonly _iterable: Iterable<TSource>,
    private readonly _selector: IndexMapFn<TSource, Iterable<TResult>>,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TResult> {
    return new iterators.LazySelectManyIterator(this._iterable, this._selector);
  }
}

/**
 * @hidden
 */
class LazySkip<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _count: number,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TElement> {
    return new iterators.LazySkipIterator(this._iterable, this._count);
  }
}

/**
 * @hidden
 */
class LazySkipLast<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _count: number,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TElement> {
    return new iterators.LazySkipLastIterator(this._iterable, this._count);
  }
}

/**
 * @hidden
 */
class LazySkipWhile<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _predicate: IndexPredicate<TElement>,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TElement> {
    return new iterators.LazySkipWhile(this._iterable, this._predicate);
  }
}

/**
 * @hidden
 */
class LazyTake<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _count: number,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TElement> {
    return new iterators.LazyTakeIterator(this._iterable, this._count);
  }
}

/**
 * @hidden
 */
class LazyTakeLast<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _count: number,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TElement> {
    return new iterators.LazyTakeLastIterator(this._iterable, this._count);
  }
}

/**
 * @hidden
 */
class LazyTakeWhile<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _predicate: IndexPredicate<TElement>,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TElement> {
    return new iterators.LazyTakeWhileIterator(this._iterable, this._predicate);
  }
}

/**
 * @hidden
 */
class LazyUnion<TElement, TKey = TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _firstIterable: Iterable<TElement>,
    private readonly _secondIterable: Iterable<TElement>,
    private readonly _compareOn?: MapFn<TElement, TKey>,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TElement> {
    return new iterators.LazyUnionIterator(
      this._firstIterable,
      this._secondIterable,
      this._compareOn,
    );
  }
}

/**
 * @hidden
 */
class LazyWhere<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
    private readonly _predicate: IndexPredicate<TElement>,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TElement> {
    return new iterators.LazyWhereIterator(this._iterable, this._predicate);
  }
}

/**
 * @hidden
 */
class LazyZip<TFirst, TSecond, TResult = [TFirst, TSecond]> extends Lazy<
  TResult
> {
  public constructor(
    private readonly _firstIterable: Iterable<TFirst>,
    private readonly _secondIterable: Iterable<TSecond>,
    private readonly _selector?: CombineFn<TFirst, TSecond, TResult>,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TResult> {
    return new iterators.LazyZipIterator(
      this._firstIterable,
      this._secondIterable,
      this._selector,
    );
  }
}
