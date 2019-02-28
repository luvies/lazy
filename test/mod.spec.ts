import { assert, test } from 'https://deno.land/x/std@v0.2.8/testing/mod.ts';
import { Lazy } from '../lib/mod.ts';

test(function empty() {
  assert.equal(Lazy.empty().toArray(), []);
});

test(function from() {
  const orig = [1, 2, 3, 4, 5];
  assert.equal(Lazy.from(orig).toArray(), orig);
});

test(function range() {
  assert.equal(Lazy.range(0, 5).toArray(), [0, 1, 2, 3, 4]);
  assert.equal(Lazy.range(0, 0).toArray(), []);
  assert.equal(Lazy.range(0, 1).toArray(), [0]);
  assert.equal(Lazy.range(1, 0).toArray(), [1]);
  assert.equal(Lazy.range(5, 0).toArray(), [5, 4, 3, 2, 1]);

  assert.equal(
    Lazy.range(-1)
      .take(5)
      .toArray(),
    [-1, 0, 1, 2, 3],
  );
  assert.equal(
    Lazy.range(0)
      .take(5)
      .toArray(),
    [0, 1, 2, 3, 4],
  );
  assert.equal(
    Lazy.range(1)
      .take(5)
      .toArray(),
    [1, 2, 3, 4, 5],
  );
  assert.equal(
    Lazy.range(2)
      .take(5)
      .toArray(),
    [2, 3, 4, 5, 6],
  );
  assert.equal(
    Lazy.range(3)
      .take(5)
      .toArray(),
    [3, 4, 5, 6, 7],
  );
  assert.equal(
    Lazy.range(4)
      .take(5)
      .toArray(),
    [4, 5, 6, 7, 8],
  );
});

test(function repeat() {
  assert.equal(Lazy.repeat('a', 1).toArray(), ['a']);
  assert.equal(Lazy.repeat('a', 2).toArray(), ['a', 'a']);
  assert.equal(Lazy.repeat('a', 3).toArray(), ['a', 'a', 'a']);
  assert.equal(Lazy.repeat('a', 4).toArray(), ['a', 'a', 'a', 'a']);
  assert.equal(Lazy.repeat('a', 5).toArray(), ['a', 'a', 'a', 'a', 'a']);
  assert.throws(() => Lazy.repeat('a', -1));

  assert.equal(
    Lazy.repeat('a')
      .take(1)
      .toArray(),
    ['a'],
  );
  assert.equal(
    Lazy.repeat('a')
      .take(2)
      .toArray(),
    ['a', 'a'],
  );
  assert.equal(
    Lazy.repeat('a')
      .take(3)
      .toArray(),
    ['a', 'a', 'a'],
  );
  assert.equal(
    Lazy.repeat('a')
      .take(4)
      .toArray(),
    ['a', 'a', 'a', 'a'],
  );
  assert.equal(
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
    assert.equal(element, current);
    current++;
  }
});
