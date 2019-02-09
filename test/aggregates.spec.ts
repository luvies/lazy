import { assert, test } from 'https://deno.land/x/std@v0.2.8/testing/mod.ts';
import * as lazy from '../lib/mod.ts';

test(function aggregate() {
  assert.equal(lazy.from([1, 2, 3]).aggregate((acc, curr) => acc + curr, 0), 1 + 2 + 3);
  assert.equal(lazy.from([1, 2, 3, 4]).aggregate((acc, curr) => acc + curr, 0), 1 + 2 + 3 + 4);
  assert.equal(lazy.from([1, 2, 3, 4]).aggregate((acc, curr) => acc * curr, 1), 1 * 2 * 3 * 4);
});

test(function all() {
  assert.equal(lazy.from([true, true, true, true]).all(v => v), true);
  assert.equal(lazy.from([false, true, true, true]).all(v => v), false);
  assert.equal(lazy.from([true, false, true, true]).all(v => v), false);
  assert.equal(lazy.from([true, true, false, true]).all(v => v), false);
  assert.equal(lazy.from([true, true, true, false]).all(v => v), false);
});

test(function any() {
  assert.equal(lazy.from([true, true, true, true]).any(v => v), true);
  assert.equal(lazy.from([false, true, true, true]).any(v => v), true);
  assert.equal(lazy.from([false, false, true, true]).any(v => v), true);
  assert.equal(lazy.from([false, false, false, true]).any(v => v), true);
  assert.equal(lazy.from([false, false, false, false]).any(v => v), false);
});

test(function average() {
  const avg = (lst: number[]) => lst.reduce((prev, curr) => prev + curr) / lst.length;

  let orig = [1, 2, 3, 4];
  assert.equal(lazy.from(orig).average(), avg(orig));

  orig = [4, 3, 2, 1];
  assert.equal(lazy.from(orig).average(), avg(orig));

  orig = [1, 2, 3, 4, 9, 8, 6];
  assert.equal(lazy.from(orig).average(), avg(orig));
});
