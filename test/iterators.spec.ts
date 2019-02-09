import { assert, test } from 'https://deno.land/x/std@v0.2.8/testing/mod.ts';
import * as lazy from '../lib/mod.ts';

test(function append() {
  let orig = [1, 2, 3, 4];
  assert.equal(lazy.from(orig).append(5).toArray(), [...orig, 5]);

  orig = [4, 3, 2, 1];
  assert.equal(lazy.from(orig).append(-1).toArray(), [...orig, -1]);

  orig = [9, 8, 7, 6, 5, 4, 3, 2, 1];
  assert.equal(lazy.from(orig).append(0).toArray(), [...orig, 0]);
});

test(function concat() {
  let first = [1, 2, 3, 4];
  let second = [5, 6, 7, 8];
  assert.equal(lazy.from(first).concat(second).toArray(), [...first, ...second]);

  first = [9, 8, 7, 6];
  second = [1, 2, 3, 4];
  assert.equal(lazy.from(first).concat(second).toArray(), [...first, ...second]);
});

test(function defaultIfEmpty() {
  let orig = [1, 2, 3];
  assert.equal(lazy.from(orig).defaultIfEmpty(9).toArray(), orig);

  orig = [];
  assert.equal(lazy.from(orig).defaultIfEmpty(9).toArray(), [9]);
});

test(function distinct() {
  let orig = [1, 2, 3, 1, 2, 3];
  assert.equal(lazy.from(orig).distinct().toArray(), [1, 2, 3]);

  orig = [1, 2, 3, 1, 8, 9];
  assert.equal(lazy.from(orig).distinct().toArray(), [1, 2, 3, 8, 9]);

  const objs = [
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 2 },
    { value: 1 },
  ];
  assert.equal(lazy.from(objs).distinct(o => o.value).toArray(), [
    { value: 1 },
    { value: 2 },
    { value: 3 },
  ]);
});

test(function except() {
  const orig = [1, 2, 3, 4, 5];
  assert.equal(lazy.from(orig).except([2, 4]).toArray(), [1, 3, 5]);
  assert.equal(lazy.from(orig).except([1]).toArray(), [2, 3, 4, 5]);
  assert.equal(lazy.from(orig).except([4, 5]).toArray(), [1, 2, 3]);
});

test(function select() {
  const orig = [
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 4 },
    { value: 5 },
  ];
  assert.equal(lazy.from(orig).select(v => v.value).toArray(), [1, 2, 3, 4, 5]);
});
