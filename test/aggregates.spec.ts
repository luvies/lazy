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

test(function contains() {
  const orig = [1, 2, 3, 4, 5];
  assert.equal(lazy.from(orig).contains(1), true);
  assert.equal(lazy.from(orig).contains(2), true);
  assert.equal(lazy.from(orig).contains(3), true);
  assert.equal(lazy.from(orig).contains(4), true);
  assert.equal(lazy.from(orig).contains(5), true);
  assert.equal(lazy.from(orig).contains(6), false);
  assert.equal(lazy.from(orig).contains(7), false);
});

test(function elementAt() {
  let orig = [1, 2, 3, 4, 5];
  assert.equal(lazy.from(orig).elementAt(0), 1);
  assert.equal(lazy.from(orig).elementAt(1), 2);
  assert.equal(lazy.from(orig).elementAt(2), 3);
  assert.equal(lazy.from(orig).elementAt(3), 4);
  assert.equal(lazy.from(orig).elementAt(4), 5);
  assert.throws(() => lazy.from(orig).elementAt(5));

  orig = [];
  assert.throws(() => lazy.from(orig).elementAt(0));
});

test(function first() {
  assert.equal(lazy.from([1, 2, 3]).first(), 1);
  assert.equal(lazy.from([2, 3, 1]).first(), 2);
  assert.equal(lazy.from([3, 2, 1]).first(), 3);
  assert.throws(() => lazy.from([]).first());
});

test(function first() {
  assert.equal(lazy.from([1, 2, 3]).firstOrDefault(9), 1);
  assert.equal(lazy.from([2, 3, 1]).firstOrDefault(9), 2);
  assert.equal(lazy.from([3, 2, 1]).firstOrDefault(9), 3);
  assert.equal(lazy.from<number>([]).firstOrDefault(9), 9);
});
