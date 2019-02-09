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

test(function itersect() {
  const orig = [1, 2, 3, 4, 5];
  assert.equal(lazy.from(orig).intersect([1, 2, 3]).toArray(), [1, 2, 3]);
  assert.equal(lazy.from(orig).intersect([2, 3, 4]).toArray(), [2, 3, 4]);
  assert.equal(lazy.from(orig).intersect([3, 4, 5]).toArray(), [3, 4, 5]);
  assert.equal(lazy.from(orig).intersect([1, 3, 5, 7, 9]).toArray(), [1, 3, 5]);
});

test(function join() {
  const first = [
    { key: 1, value1: 'a1' },
    { key: 2, value1: 'b1' },
    { key: 3, value1: 'c1' },
    { key: 4, value1: 'd1' },
    { key: 5, value1: 'e1' },
  ];
  const second = [
    { k: 1, value2: 'a2' },
    { k: 2, value2: 'b2' },
    { k: 3, value2: 'c2' },
    { k: 4, value2: 'd2' },
    { k: 5, value2: 'e2' },
  ];

  assert.equal(
    lazy.from(first).join(
      second,
      v => v.key,
      v => v.k,
      (f, s) => ({ ky: f.key, value1: f.value1, value2: s.value2 }),
    ).toArray(),
    [
      { ky: 1, value1: 'a1', value2: 'a2' },
      { ky: 2, value1: 'b1', value2: 'b2' },
      { ky: 3, value1: 'c1', value2: 'c2' },
      { ky: 4, value1: 'd1', value2: 'd2' },
      { ky: 5, value1: 'e1', value2: 'e2' },
    ],
  );
});

test(function orderBy() {
  const orig = [2, 1, 5, 3, 4];
  assert.equal(lazy.from(orig).orderBy(v => v).toArray(), [1, 2, 3, 4, 5]);
  assert.equal(lazy.from(orig).orderBy(v => v, (a, b) => a - b).toArray(), [1, 2, 3, 4, 5]);

  const objs = [
    { value: 2 },
    { value: 5 },
    { value: 1 },
    { value: 3 },
    { value: 7 },
  ];
  assert.equal(lazy.from(objs).orderBy(v => v.value).toArray(), [
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 5 },
    { value: 7 },
  ]);
});

test(function orderByDecending() {
  const orig = [2, 1, 5, 3, 4];
  assert.equal(lazy.from(orig).orderByDecending(v => v).toArray(), [5, 4, 3, 2, 1]);

  const objs = [
    { value: 2 },
    { value: 5 },
    { value: 1 },
    { value: 3 },
    { value: 7 },
  ];
  assert.equal(lazy.from(objs).orderByDecending(v => v.value).toArray(), [
    { value: 7 },
    { value: 5 },
    { value: 3 },
    { value: 2 },
    { value: 1 },
  ]);
});

test(function prepend() {
  let orig = [1, 2, 3, 4];
  assert.equal(lazy.from(orig).prepend(5).toArray(), [5, ...orig]);

  orig = [4, 3, 2, 1];
  assert.equal(lazy.from(orig).prepend(-1).toArray(), [-1, ...orig]);

  orig = [9, 8, 7, 6, 5, 4, 3, 2, 1];
  assert.equal(lazy.from(orig).prepend(0).toArray(), [0, ...orig]);
});

test(function reverse() {
  const orig = [1, 2, 3, 4, 5];
  assert.equal(lazy.from(orig).reverse().toArray(), [5, 4, 3, 2, 1]);
  assert.equal(lazy.from(orig).reverse().reverse().toArray(), orig);
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

test(function selectMany() {
  const orig = [
    { value: [1] },
    { value: [2] },
    { value: [3] },
    { value: [4] },
    { value: [5] },
  ];
  assert.equal(lazy.from(orig).selectMany(v => v.value).toArray(), [1, 2, 3, 4, 5]);

  const arrarr = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  assert.equal(lazy.from(arrarr).selectMany(v => v).toArray(), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test(function skip() {
  const orig = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  assert.equal(lazy.from(orig).skip(0).toArray(), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(lazy.from(orig).skip(1).toArray(), [2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(lazy.from(orig).skip(2).toArray(), [3, 4, 5, 6, 7, 8, 9]);
  assert.equal(lazy.from(orig).skip(3).toArray(), [4, 5, 6, 7, 8, 9]);
  assert.equal(lazy.from(orig).skip(4).toArray(), [5, 6, 7, 8, 9]);
  assert.equal(lazy.from(orig).skip(5).toArray(), [6, 7, 8, 9]);
});

test(function skipLast() {
  const orig = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  assert.equal(lazy.from(orig).skipLast(0).toArray(), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(lazy.from(orig).skipLast(1).toArray(), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(lazy.from(orig).skipLast(2).toArray(), [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(lazy.from(orig).skipLast(3).toArray(), [1, 2, 3, 4, 5, 6]);
  assert.equal(lazy.from(orig).skipLast(4).toArray(), [1, 2, 3, 4, 5]);
  assert.equal(lazy.from(orig).skipLast(5).toArray(), [1, 2, 3, 4]);
});

test(function skipWhile() {
  const orig = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  assert.equal(lazy.from(orig).skipWhile(v => v !== 1).toArray(), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(lazy.from(orig).skipWhile(v => v !== 2).toArray(), [2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(lazy.from(orig).skipWhile(v => v !== 3).toArray(), [3, 4, 5, 6, 7, 8, 9]);
  assert.equal(lazy.from(orig).skipWhile(v => v !== 4).toArray(), [4, 5, 6, 7, 8, 9]);
  assert.equal(lazy.from(orig).skipWhile(v => v !== 5).toArray(), [5, 6, 7, 8, 9]);
  assert.equal(lazy.from(orig).skipWhile(v => v !== 6).toArray(), [6, 7, 8, 9]);
});

test(function take() {
  const orig = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  assert.equal(lazy.from(orig).take(-1).toArray(), []);
  assert.equal(lazy.from(orig).take(0).toArray(), []);
  assert.equal(lazy.from(orig).take(1).toArray(), [1]);
  assert.equal(lazy.from(orig).take(2).toArray(), [1, 2]);
  assert.equal(lazy.from(orig).take(3).toArray(), [1, 2, 3]);
  assert.equal(lazy.from(orig).take(4).toArray(), [1, 2, 3, 4]);
  assert.equal(lazy.from(orig).take(5).toArray(), [1, 2, 3, 4, 5]);
});

test(function takeLast() {
  const orig = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  assert.equal(lazy.from(orig).takeLast(0).toArray(), []);
  assert.equal(lazy.from(orig).takeLast(1).toArray(), [9]);
  assert.equal(lazy.from(orig).takeLast(2).toArray(), [8, 9]);
  assert.equal(lazy.from(orig).takeLast(3).toArray(), [7, 8, 9]);
  assert.equal(lazy.from(orig).takeLast(4).toArray(), [6, 7, 8, 9]);
  assert.equal(lazy.from(orig).takeLast(5).toArray(), [5, 6, 7, 8, 9]);
});

test(function takeWhile() {
  const orig = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  assert.equal(lazy.from(orig).takeWhile(v => v !== 4).toArray(), [1, 2, 3]);
  assert.equal(lazy.from(orig).takeWhile(v => v !== 5).toArray(), [1, 2, 3, 4]);
  assert.equal(lazy.from(orig).takeWhile(v => v !== 6).toArray(), [1, 2, 3, 4, 5]);
  assert.equal(lazy.from(orig).takeWhile(v => v !== 7).toArray(), [1, 2, 3, 4, 5, 6]);
  assert.equal(lazy.from(orig).takeWhile(v => v !== 8).toArray(), [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(lazy.from(orig).takeWhile(v => v !== 9).toArray(), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test(function union() {
  assert.equal(lazy.from([1, 2, 3]).union([3, 4, 5]).toArray(), [1, 2, 3, 4, 5]);
  assert.equal(lazy.from([1, 2, 3]).union([2, 3, 4, 5]).toArray(), [1, 2, 3, 4, 5]);
  assert.equal(lazy.from([1, 2, 3]).union([3, 3, 4, 5]).toArray(), [1, 2, 3, 4, 5]);
  assert.equal(lazy.from([1, 2, 3, 2]).union([3, 4, 5]).toArray(), [1, 2, 3, 4, 5]);
});

test(function where() {
  assert.equal(lazy.from([1, 2, 3, 4, 5]).where(v => v === 1).toArray(), [1]);
  assert.equal(lazy.from([1, 2, 3, 4, 5]).where(v => v === 2).toArray(), [2]);
  assert.equal(lazy.from([1, 2, 3, 4, 5]).where(v => v === 3).toArray(), [3]);
  assert.equal(lazy.from([1, 2, 3, 4, 5]).where(v => v % 2 === 0).toArray(), [2, 4]);
  assert.equal(lazy.from([
    { key: 1, value: 'a' },
    { key: 2, value: 'b' },
    { key: 3, value: 'c' },
    { key: 4, value: 'd' },
    { key: 5, value: 'e' },
  ]).where(v => v.value === 'a' || v.value === 'e').toArray(), [
    { key: 1, value: 'a' },
    { key: 5, value: 'e' },
  ]);
});
