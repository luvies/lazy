import { Lazy } from './iterators.ts';

export { Lazy };

/**
 * Creates an empty lazy iterable.
 * @returns The empty lazy iterable object.
 */
export function empty<TElement>() {
  return new LazyEmpty<TElement>();
}

/**
 * Creates a lazy iterable object from the given iterable object.
 * @param iterable The object to source for lazy iteration.
 * @returns The lazy iterable object with the given iterable as the source.
 */
export function from<TElement>(iterable: Iterable<TElement>) {
  return new LazyEnumerator(iterable);
}

/**
 * Creates a lazy iterable object that will produce a range of integers.
 * @param start The starting number of the range (inclusive).
 * @param end The ending number of the range (exclusive).
 * @returns The lazy iterable object with the range as the source.
 */
export function range(start: number, end: number) {
  return new LazyRange(start, end);
}

/**
 * Creates a lazy iterable object that will repeate the element a given number
 * of times.
 * @param value The value to repeat.
 * @param count The number of times to repeat it.
 * @returns The lazy iterable object with the repeated value as the source.
 */
export function repeat<TElement>(value: TElement, count: number) {
  return new LazyRepeat(value, count);
}

class LazyEmpty<TElement> extends Lazy<TElement> {
  public *[Symbol.iterator](): Iterator<TElement> {
    // Don't yield anything for an empty enumerable.
  }
}

class LazyEnumerator<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _iterable: Iterable<TElement>,
  ) {
    super();
  }

  public [Symbol.iterator](): Iterator<TElement> {
    return this._iterable[Symbol.iterator]();
  }
}

class LazyRange extends Lazy<number> {
  public constructor(
    private readonly _start: number,
    private readonly _end: number,
  ) {
    super();
  }

  public *[Symbol.iterator](): Iterator<number> {
    const direction = this._end - this._start < 0 ? -1 : 1;
    for (
      let i = this._start;
      direction === 1 ? i < this._end : i > this._end;
      i += direction
    ) {
      yield i;
    }
  }
}

class LazyRepeat<TElement> extends Lazy<TElement> {
  public constructor(
    private readonly _element: TElement,
    private readonly _count: number,
  ) {
    super();
    if (_count < 0) {
      throw new Error('Count cannot be < 0');
    }
  }

  public *[Symbol.iterator](): Iterator<TElement> {
    for (let i = 0; i < this._count; i++) {
      yield this._element;
    }
  }
}
