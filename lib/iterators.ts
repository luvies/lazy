import * as aggregates from './aggregates.ts';

type MapFn<T, U> = (source: T) => U;

export abstract class Lazy<T> implements Iterable<T> {
  // Aggregates.
  public aggregate<U>(agg: aggregates.AggFn<T, U>, seed: U) {
    return aggregates.aggregate(this, agg, seed);
  }

  public all(predicate: aggregates.BoolPredicate<T>) {
    return aggregates.all(this, predicate);
  }

  public any(predicate: aggregates.BoolPredicate<T>) {
    return aggregates.any(this, predicate);
  }

  public average() {
    return aggregates.average(this);
  }

  public contains(value: T, comparer?: aggregates.ComparerFn<T>) {
    return aggregates.contains(this, value, comparer);
  }

  public elementAt(index: number) {
    return aggregates.elementAt(this, index);
  }

  public elementAtOrDefault(index: number, defaultValue: T) {
    return aggregates.elementAtOrDefault(this, index, defaultValue);
  }

  public first() {
    return aggregates.first(this);
  }

  public firstOrDefault(defaultValue: T) {
    return aggregates.firstOrDefault(this, defaultValue);
  }

  public toArray() {
    return aggregates.toArray(this);
  }

  // Iterators.
  public append(element: T) {
    return new LazyAppend(this, element);
  }

  public concat(iterable: Iterable<T>) {
    return new LazyConcat(this, iterable);
  }

  public defaultIfEmpty(defaultValue: T) {
    return new LazyDefaultIfEmpty(this, defaultValue);
  }

  public distinct<U>(compareOn?: MapFn<T, U>) {
    return new LazyDistinct(this, compareOn);
  }

  public except<U>(second: Iterable<T>, compareOn?: MapFn<T, U>) {
    return new LazyExcept(this, second, compareOn);
  }

  public select<U>(selector: MapFn<T, U>) {
    return new LazySelect(this, selector);
  }

  public abstract [Symbol.iterator](): Iterator<T>;
}

/*
  Iterator implementations.
  Each of these will apply some form of transformation on an iterable,
  but *only* while it is being iterated.
*/

class LazyAppend<T> extends Lazy<T> {
  public constructor(
    private readonly iterable: Iterable<T>,
    private readonly element: T,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<T> {
    for (const value of this.iterable) {
      yield value;
    }
    yield this.element;
  }
}

class LazyConcat<T> extends Lazy<T> {
  public constructor(
    private firstIterable: Iterable<T>,
    private secondIterable: Iterable<T>,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<T> {
    for (const value of this.firstIterable) {
      yield value;
    }
    for (const value of this.secondIterable) {
      yield value;
    }
  }
}

class LazyDefaultIfEmpty<T> extends Lazy<T> {
  public constructor(
    private readonly iterable: Iterable<T>,
    private readonly defaultValue: T,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<T> {
    let yielded = false;
    for (const value of this.iterable) {
      yield value;
      yielded = true;
    }
    if (!yielded) {
      yield this.defaultValue;
    }
  }
}

class LazyDistinct<T, U> extends Lazy<T> {
  public constructor(
    private readonly iterable: Iterable<T>,
    private readonly compareOn?: MapFn<T, U>,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<T> {
    const compareOn: MapFn<T, U> = this.compareOn ? this.compareOn : ((value: T) => value) as any;

    const found = new Map<U, T>();
    for (const value of this.iterable) {
      const key = compareOn(value);
      if (!found.has(key)) {
        found.set(key, value);
        yield value;
      }
    }
  }
}

class LazyExcept<T, U> extends Lazy<T> {
  public constructor(
    private readonly firstIterable: Iterable<T>,
    private readonly secondIterable: Iterable<T>,
    private readonly compareOn?: MapFn<T, U>,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<T> {
    const compareOn: MapFn<T, U> = this.compareOn ? this.compareOn : ((value: T) => value) as any;

    const secondValues = new Map<U, T>();
    for (const value of this.secondIterable) {
      const key = compareOn(value);
      if (!secondValues.has(key)) {
        secondValues.set(key, value);
      }
    }

    for (const value of this.firstIterable) {
      const key = compareOn(value);
      if (!secondValues.has(key)) {
        yield value;
      }
    }
  }
}

class LazySelect<T, U> extends Lazy<U> {
  public constructor(
    private readonly iterable: Iterable<T>,
    private readonly selector: MapFn<T, U>,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<U> {
    for (const value of this.iterable) {
      yield this.selector(value);
    }
  }
}
