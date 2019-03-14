import {
  // AggFn,
  // BoolPredicate,
  // CallbackFn,
  // ComparerFn,
  MapFn,
  // StrFn,
} from './aggregates.ts';

// Helpers types.

/**
 * A function that maps one type to another, and is given the index that
 * the iterator is currently on.
 */
export type IndexMapFn<TSource, TResult> = (
  source: TSource,
  index: number,
) => TResult;
/**
 * A function that combines 2 types into another.
 */
export type CombineFn<TFirst, TSecond, TResult> = (
  first: TFirst,
  second: TSecond,
) => TResult;
/**
 * A function that takes in 2 values and returns the sorting number.
 */
export type SortFn<TSource> = (a: TSource, b: TSource) => number;
/**
 * A function that takes in a value and an index and returns a boolean.
 */
export type IndexPredicate<TSource> = (
  element: TSource,
  index: number,
) => boolean;
/**
 * A function that takes in a value and an index and returns whether the
 * value is of a given type.
 */
export type IndexIsPredicate<TSource, TResult extends TSource> = (
  element: TSource,
  index: number,
) => element is TResult;

/**
 * A grouping of elements based on the key.
 */
export interface IGrouping<TKey, TElement> {
  key: TKey;
  elements: Iterable<TElement>;
}

// Helper classes.

/**
 * @hidden
 */
// class Queue<T> {
//   private _buffer: T[] = [];
//   private _front = 0;

//   public get length(): number {
//     return this._buffer.length - this._front;
//   }

//   public enqueue(element: T): void {
//     this._buffer.push(element);
//   }

//   public dequeue(): T {
//     const element = this._buffer[this._front];
//     delete this._buffer[this._front];
//     this._front++;
//     return element;
//   }
// }

// Base Iterators

/**
 * @hidden
 */
export class LazyRangeIterator implements Iterator<number> {
  private _i: number;
  private readonly _direction: number;

  public constructor(_start: number, private readonly _end: number) {
    this._i = _start;
    this._direction = _end < _start ? -1 : 1;
  }

  public next(): IteratorResult<number> {
    if (this._direction > 0 ? this._i >= this._end : this._i <= this._end) {
      return { done: true, value: undefined as any };
    } else {
      const nextResult = { done: false, value: this._i };
      this._i += this._direction;
      return nextResult;
    }
  }
}

/**
 * @hidden
 */
export class LazyRepeatIterator<TElement> implements Iterator<TElement> {
  private _i = 0;

  public constructor(
    private readonly _element: TElement,
    private readonly _count: number,
  ) {}

  public next(): IteratorResult<TElement> {
    if (this._i >= this._count) {
      return { done: true, value: undefined as any };
    } else {
      const nextResult = { done: false, value: this._element };
      this._i++;
      return nextResult;
    }
  }
}

// Iterators

/**
 * @hidden
 */
export class LazyAppendPrependIterator<TElement> implements Iterator<TElement> {
  private readonly _iterator: Iterator<TElement>;
  private _started = false;
  private _finished = false;

  public constructor(
    iterable: Iterable<TElement>,
    private readonly _element: TElement,
    private readonly _atStart: boolean,
  ) {
    this._iterator = iterable[Symbol.iterator]();
  }

  public next(): IteratorResult<TElement> {
    if (!this._started) {
      this._started = true;

      if (this._atStart) {
        return { done: false, value: this._element };
      }
    }

    if (this._finished) {
      return { done: true, value: undefined as any };
    }

    const result = this._iterator.next();

    if (result.done) {
      this._finished = true;

      if (!this._atStart) {
        return { done: false, value: this._element };
      } else {
        return { done: true, value: undefined as any };
      }
    } else {
      return result;
    }
  }
}

/**
 * @hidden
 */
export class LazyConcatIterator<TElement> implements Iterator<TElement> {
  private readonly _iterators: Array<Iterator<TElement>> = [];
  private _current = 0;

  public constructor(iterables: Array<Iterable<TElement>>) {
    for (const iterable of iterables) {
      this._iterators.push(iterable[Symbol.iterator]());
    }
  }

  public next(): IteratorResult<TElement> {
    if (this._current >= this._iterators.length) {
      return { done: true, value: undefined as any };
    }

    while (this._current < this._iterators.length) {
      const result = this._iterators[this._current].next();

      if (!result.done) {
        return result;
      } else {
        this._current++;
      }
    }

    return { done: true, value: undefined as any };
  }
}

/**
 * @hidden
 */
export class LazyDefaultIfEmptyIterator<TElement>
  implements Iterator<TElement> {
  private readonly _iterator: Iterator<TElement>;
  private _started = false;
  private _done = false;

  public constructor(
    iterable: Iterable<TElement>,
    private readonly _defaultValue: TElement,
  ) {
    this._iterator = iterable[Symbol.iterator]();
  }

  public next(): IteratorResult<TElement> {
    if (this._done) {
      return { done: true, value: undefined as any };
    }

    const result = this._iterator.next();

    if (!this._started) {
      this._started = true;

      if (result.done) {
        this._done = true;

        return { done: false, value: this._defaultValue };
      } else {
        return result;
      }
    } else {
      return result;
    }
  }
}

/**
 * @hidden
 */
export class LazyDistinctIterator<TElement, TKey>
  implements Iterator<TElement> {
  private readonly _iterator: Iterator<TElement>;
  private readonly _found = new Set<TKey>();

  public constructor(
    iterable: Iterable<TElement>,
    private readonly _compareOn: MapFn<TElement, TKey>,
  ) {
    this._iterator = iterable[Symbol.iterator]();
  }

  public next(): IteratorResult<TElement> {
    while (true) {
      const result = this._iterator.next();

      if (result.done) {
        return { done: true, value: undefined as any };
      } else {
        const key = this._compareOn(result.value);

        if (!this._found.has(key)) {
          this._found.add(key);

          return result;
        }
      }
    }
  }
}

/**
 * @hidden
 */
export class LazyExceptIterator<TElement, TKey> implements Iterator<TElement> {
  private readonly _firstIterator: Iterator<TElement>;
  private readonly _set = new Set<TKey>();

  public constructor(
    firstIterable: Iterable<TElement>,
    secondIterable: Iterable<TElement>,
    private readonly _compareOn: MapFn<TElement, TKey>,
  ) {
    this._firstIterator = firstIterable[Symbol.iterator]();
    for (const element of secondIterable) {
      this._set.add(_compareOn(element));
    }
  }

  public next(): IteratorResult<TElement> {
    while (true) {
      const result = this._firstIterator.next();

      if (result.done) {
        return { done: true, value: undefined as any };
      } else {
        const key = this._compareOn(result.value);

        if (!this._set.has(key)) {
          this._set.add(key);

          return result;
        }
      }
    }
  }
}

/**
 * @hidden
 */
export class LazySelectIterator<TSource, TResult> implements Iterator<TResult> {
  private readonly _iterator: Iterator<TSource>;
  private _index = 0;

  public constructor(
    iterable: Iterable<TSource>,
    private readonly _selector: IndexMapFn<TSource, TResult>,
  ) {
    this._iterator = iterable[Symbol.iterator]();
  }

  public next() {
    const result = this._iterator.next();

    if (result.done) {
      return { done: true, value: undefined as any };
    } else {
      const nextResult = {
        done: false,
        value: this._selector(result.value, this._index),
      };
      this._index++;

      return nextResult;
    }
  }
}
