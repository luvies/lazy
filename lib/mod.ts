import { Lazy } from './iterators.ts';

export function from<T>(iterable: Iterable<T>) {
  return new LazyEnumerator(iterable);
}

export function range(start: number, end: number) {
  return new LazyRange(start, end);
}

class LazyEnumerator<T> extends Lazy<T> {
  public constructor(
    private readonly iterable: Iterable<T>,
  ) {
    super();
  }

  public [Symbol.iterator]() {
    return this.iterable[Symbol.iterator]();
  }
}

class LazyRange extends Lazy<number> {
  public constructor(
    private readonly start: number,
    private readonly end: number,
  ) {
    super();
  }

  public *[Symbol.iterator]() {
    const direction = this.end - this.start < 0 ? -1 : 1;
    for (
      let i = this.start;
      direction === 1 ? i < this.end : i > this.end;
      i += direction
    ) {
      yield i;
    }
  }
}
