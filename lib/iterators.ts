import * as aggregates from './aggregates.ts';

export abstract class Lazy<T> implements Iterable<T> {
  // Aggregates.
  public aggregate<U>(agg: aggregates.AggFn<T, U>, seed: U): U {
    return aggregates.aggregate<T, U>(this, agg, seed);
  }

  public all(predicate: aggregates.BoolPredicate<T>) {
    return aggregates.all<T>(this, predicate);
  }

  public any(predicate: aggregates.BoolPredicate<T>) {
    return aggregates.any<T>(this, predicate);
  }

  public average() {
    return aggregates.average<T>(this);
  }

  // Iterators.
  public append(element: T) {
    return new LazyAppend<T>(this, element);
  }

  public concat(iterable: Iterable<T>) {
    return new LazyConcat<T>(this, iterable);
  }

  public select<U>(selector: (source: T) => U) {
    return new LazySelect<T, U>(this, selector);
  }

  public abstract [Symbol.iterator](): Iterator<any>;
}

/*
  Iterator implementations.
  Each of these will apply some form of transformation on an iterable,
  but *only* when it is being iterated.
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

  public *[Symbol.iterator]() {
    for (const value of this.firstIterable) {
      yield value;
    }
    for (const value of this.secondIterable) {
      yield value;
    }
  }
}

class LazySelect<T, U> extends Lazy<T> {
  public constructor(
    private readonly iterable: Iterable<T>,
    private readonly selector: (source: T) => U,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<U> {
    for (const value of this.iterable) {
      yield this.selector(value);
    }
  }
}
