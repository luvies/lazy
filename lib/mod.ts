import { Lazy } from './iterators.ts';

export { Lazy };

/**
 * @see Lazy.empty
 */
export function empty<TElement>(): Lazy<TElement> {
  return Lazy.empty<TElement>();
}

/**
 * @see Lazy.from
 */
export function from<TElement>(iterable: Iterable<TElement>): Lazy<TElement> {
  return Lazy.from(iterable);
}

/**
 * @see Lazy.range
 */
export function range(start: number, end?: number): Lazy<number> {
  return Lazy.range(start, end);
}

/**
 * @see Lazy.repeat
 */
export function repeat<TElement>(value: TElement, count?: number): Lazy<TElement> {
  return Lazy.repeat(value, count);
}
