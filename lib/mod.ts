import { Lazy } from './iterators.ts';

export { Lazy };

export function empty<TElement>() {
  return new LazyEmpty<TElement>();
}

export function from<TElement>(iterable: Iterable<TElement>) {
  return new LazyEnumerator(iterable);
}

export function range(start: number, end: number) {
  return new LazyRange(start, end);
}

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
