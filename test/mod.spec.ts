import {
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@v0.3.1/testing/asserts.ts';
import { test } from 'https://deno.land/std@v0.3.1/testing/mod.ts';
import { Lazy } from '../lib/mod.ts';

test(function empty() {
  assertEquals(Lazy.empty().toArray(), []);
});

test(function from() {
  const orig = [1, 2, 3, 4, 5];
  assertEquals(Lazy.from(orig).toArray(), orig);
});

test(function range() {
  assertEquals(Lazy.range(0, 5).toArray(), [0, 1, 2, 3, 4]);
  assertEquals(Lazy.range(0, 0).toArray(), []);
  assertEquals(Lazy.range(0, 1).toArray(), [0]);
  assertEquals(Lazy.range(1, 0).toArray(), [1]);
  assertEquals(Lazy.range(5, 0).toArray(), [5, 4, 3, 2, 1]);

  assertEquals(
    Lazy.range(-1)
      .take(5)
      .toArray(),
    [-1, 0, 1, 2, 3],
  );
  assertEquals(
    Lazy.range(0)
      .take(5)
      .toArray(),
    [0, 1, 2, 3, 4],
  );
  assertEquals(
    Lazy.range(1)
      .take(5)
      .toArray(),
    [1, 2, 3, 4, 5],
  );
  assertEquals(
    Lazy.range(2)
      .take(5)
      .toArray(),
    [2, 3, 4, 5, 6],
  );
  assertEquals(
    Lazy.range(3)
      .take(5)
      .toArray(),
    [3, 4, 5, 6, 7],
  );
  assertEquals(
    Lazy.range(4)
      .take(5)
      .toArray(),
    [4, 5, 6, 7, 8],
  );
});

test(function repeat() {
  assertEquals(Lazy.repeat('a', 1).toArray(), ['a']);
  assertEquals(Lazy.repeat('a', 2).toArray(), ['a', 'a']);
  assertEquals(Lazy.repeat('a', 3).toArray(), ['a', 'a', 'a']);
  assertEquals(Lazy.repeat('a', 4).toArray(), ['a', 'a', 'a', 'a']);
  assertEquals(Lazy.repeat('a', 5).toArray(), ['a', 'a', 'a', 'a', 'a']);
  assertThrows(() => Lazy.repeat('a', -1));

  assertEquals(
    Lazy.repeat('a')
      .take(1)
      .toArray(),
    ['a'],
  );
  assertEquals(
    Lazy.repeat('a')
      .take(2)
      .toArray(),
    ['a', 'a'],
  );
  assertEquals(
    Lazy.repeat('a')
      .take(3)
      .toArray(),
    ['a', 'a', 'a'],
  );
  assertEquals(
    Lazy.repeat('a')
      .take(4)
      .toArray(),
    ['a', 'a', 'a', 'a'],
  );
  assertEquals(
    Lazy.repeat('a')
      .take(5)
      .toArray(),
    ['a', 'a', 'a', 'a', 'a'],
  );
});

test(async function _forAwait() {
  // This isn't a test of any specific implementation, just of functionality.

  const orig = [
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3),
    Promise.resolve(4),
    Promise.resolve(5),
  ];

  let current = 1;
  for await (const element of Lazy.from(orig)) {
    assertEquals(element, current);
    current++;
  }
});
