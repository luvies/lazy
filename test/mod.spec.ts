import { assert, test } from 'https://deno.land/x/std@v0.2.8/testing/mod.ts';
import lazy from '../lib/mod.ts';

test(function empty() {
  assert.equal(lazy.empty().toArray(), []);
});

test(function from() {
  const orig = [1, 2, 3, 4, 5];
  assert.equal(lazy.from(orig).toArray(), orig);
});

test(function range() {
  assert.equal(lazy.range(0, 5).toArray(), [0, 1, 2, 3, 4]);
  assert.equal(lazy.range(0, 0).toArray(), []);
  assert.equal(lazy.range(0, 1).toArray(), [0]);
  assert.equal(lazy.range(1, 0).toArray(), [1]);
  assert.equal(lazy.range(5, 0).toArray(), [5, 4, 3, 2, 1]);
});

test(function repeat() {
  assert.equal(lazy.repeat('a', 1).toArray(), ['a']);
  assert.equal(lazy.repeat('a', 2).toArray(), ['a', 'a']);
  assert.equal(lazy.repeat('a', 3).toArray(), ['a', 'a', 'a']);
  assert.equal(lazy.repeat('a', 4).toArray(), ['a', 'a', 'a', 'a']);
  assert.equal(lazy.repeat('a', 5).toArray(), ['a', 'a', 'a', 'a', 'a']);
  assert.throws(() => lazy.repeat('a', -1));
});
