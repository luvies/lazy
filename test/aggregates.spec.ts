import { assert, test } from 'https://deno.land/x/std@v0.2.8/testing/mod.ts';
import lazy from '../lib/mod.ts';

test(function aggregate() {
  assert.equal(lazy.from([1, 2, 3]).aggregate((acc, curr) => acc + curr, 0), 1 + 2 + 3);
  assert.equal(lazy.from([1, 2, 3, 4]).aggregate((acc, curr) => acc + curr, 0), 1 + 2 + 3 + 4);
  assert.equal(lazy.from([1, 2, 3, 4]).aggregate((acc, curr) => acc * curr, 1), 1 * 2 * 3 * 4);
  assert.equal(lazy.from([1, 2, 3]).aggregate((acc, curr) => acc + curr, ''), '123');
  assert.equal(lazy.from([1, 2, 3]).aggregate((acc, curr) => acc + curr), 1 + 2 + 3);
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

  assert.equal(lazy.from([]).any(), false);
  assert.equal(lazy.from([1]).any(), true);
});

test(function average() {
  const avg = (lst: number[]) => lst.reduce((prev, curr) => prev + curr) / lst.length;

  let orig = [1, 2, 3, 4];
  assert.equal(lazy.from(orig).average(), avg(orig));

  orig = [4, 3, 2, 1];
  assert.equal(lazy.from(orig).average(), avg(orig));

  orig = [1, 2, 3, 4, 9, 8, 6];
  assert.equal(lazy.from(orig).average(), avg(orig));

  assert.throws(() => lazy.from([true]).average());
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

  const comparer = (a: number, b: number) => a.toString() === b.toString();
  assert.equal(lazy.from(orig).contains('1' as any, comparer), true);
  assert.equal(lazy.from(orig).contains('2' as any, comparer), true);
  assert.equal(lazy.from(orig).contains('3' as any, comparer), true);
  assert.equal(lazy.from(orig).contains('4' as any, comparer), true);
  assert.equal(lazy.from(orig).contains('5' as any, comparer), true);
  assert.equal(lazy.from(orig).contains('6' as any, comparer), false);
  assert.equal(lazy.from(orig).contains('7' as any, comparer), false);
});

test(function count() {
  assert.equal(lazy.from([]).count(), 0);
  assert.equal(lazy.from([1]).count(), 1);
  assert.equal(lazy.from([1, 2]).count(), 2);
  assert.equal(lazy.from([1, 2, 3]).count(), 3);
  assert.equal(lazy.from([1, 2, 3, 4]).count(), 4);
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

test(function forEach() {
  const items: Array<{ v: number, i: number }> = [];
  lazy.from([1, 2, 3, 4, 5]).forEach((v, i) => items.push({ v, i }));
  assert.equal(items, [
    { v: 1, i: 0 },
    { v: 2, i: 1 },
    { v: 3, i: 2 },
    { v: 4, i: 3 },
    { v: 5, i: 4 },
  ]);
});

test(function last() {
  assert.equal(lazy.from([1]).last(), 1);
  assert.equal(lazy.from([1, 2]).last(), 2);
  assert.equal(lazy.from([1, 2, 3]).last(), 3);
  assert.equal(lazy.from([1, 2, 3, 4]).last(), 4);
  assert.equal(lazy.from([1, 2, 3, 4, 5]).last(), 5);
  assert.throws(() => lazy.from([]).last());
});

test(function lastOrDefault() {
  assert.equal(lazy.from([1]).lastOrDefault(9), 1);
  assert.equal(lazy.from([1, 2]).lastOrDefault(9), 2);
  assert.equal(lazy.from([1, 2, 3]).lastOrDefault(9), 3);
  assert.equal(lazy.from([1, 2, 3, 4]).lastOrDefault(9), 4);
  assert.equal(lazy.from([1, 2, 3, 4, 5]).lastOrDefault(9), 5);
  assert.equal(lazy.from<number>([]).lastOrDefault(9), 9);
});

test(function max() {
  assert.equal(lazy.from([1, 2, 3, 4, 5]).max(), 5);
  assert.equal(lazy.from([1, 2, 3, 4]).max(), 4);
  assert.equal(lazy.from([1, 2, 3]).max(), 3);
  assert.equal(lazy.from([1, 2]).max(), 2);
  assert.equal(lazy.from([1]).max(), 1);
  assert.throws(() => lazy.from([true]).max());
});

test(function min() {
  assert.equal(lazy.from([1, 2, 3, 4, 5]).min(), 1);
  assert.equal(lazy.from([2, 3, 4, 5]).min(), 2);
  assert.equal(lazy.from([3, 4, 5]).min(), 3);
  assert.equal(lazy.from([4, 5]).min(), 4);
  assert.equal(lazy.from([5]).min(), 5);
  assert.throws(() => lazy.from([true]).min());
});

test(function sequenceEquals() {
  assert.equal(lazy.from([1]).sequenceEquals([1]), true);
  assert.equal(lazy.from([1, 2]).sequenceEquals([1, 2]), true);
  assert.equal(lazy.from([1, 2, 3]).sequenceEquals([1, 2, 3]), true);
  assert.equal(lazy.from([1, 2, 3, 4]).sequenceEquals([1, 2, 3, 4]), true);
  assert.equal(lazy.from([1, 2, 3, 4, 5]).sequenceEquals([1, 2, 3, 4, 5]), true);
  assert.equal(lazy.from([1, 2, 3, 4, 5]).sequenceEquals([5, 4, 3, 2, 1]), false);
  assert.equal(lazy.from([1, 2, 3, 4, 5]).sequenceEquals([1, 2, 3, 4]), false);
  assert.equal(lazy.from([
    { value: 1 }, { value: 2 }, { value: 3 },
  ]).sequenceEquals([
    { value: 1 }, { value: 2 }, { value: 3 },
  ], (a, b) => a.value === b.value), true);
});

test(function single() {
  const orig = [
    { key: 1, value: 'a' },
    { key: 2, value: 'b' },
    { key: 3, value: 'c' },
  ];
  assert.equal(lazy.from(orig).single(v => v.key === 1), { key: 1, value: 'a' });
  assert.equal(lazy.from(orig).single(v => v.key === 2), { key: 2, value: 'b' });
  assert.equal(lazy.from(orig).single(v => v.key === 3), { key: 3, value: 'c' });
  assert.throws(() => lazy.from(orig).single(v => v.key === 4));
});

test(function singleOrDefault() {
  const orig = [
    { key: 1, value: 'a' },
    { key: 2, value: 'b' },
    { key: 3, value: 'c' },
  ];
  assert.equal(
    lazy.from(orig).singleOrDefault(v => v.key === 1, { key: 9, value: 'i' }),
    { key: 1, value: 'a' },
  );
  assert.equal(
    lazy.from(orig).singleOrDefault(v => v.key === 2, { key: 9, value: 'i' }),
    { key: 2, value: 'b' },
  );
  assert.equal(
    lazy.from(orig).singleOrDefault(v => v.key === 3, { key: 9, value: 'i' }),
    { key: 3, value: 'c' },
  );
  assert.equal(
    lazy.from(orig).singleOrDefault(v => v.key === 8, { key: 9, value: 'i' }),
    { key: 9, value: 'i' },
  );
});

test(function stringJoin() {
  assert.equal(lazy.from([]).stringJoin(), '');
  assert.equal(lazy.from([1]).stringJoin(), '1');
  assert.equal(lazy.from([1, 2]).stringJoin(), '12');
  assert.equal(lazy.from([1, 2, 3]).stringJoin(), '123');
  assert.equal(lazy.from([1, 2, 3, 4]).stringJoin(), '1234');

  assert.equal(lazy.from([]).stringJoin(','), '');
  assert.equal(lazy.from([1]).stringJoin(','), '1');
  assert.equal(lazy.from([1, 2]).stringJoin(','), '1,2');
  assert.equal(lazy.from([1, 2, 3]).stringJoin(','), '1,2,3');
  assert.equal(lazy.from([1, 2, 3, 4]).stringJoin(','), '1,2,3,4');

  assert.equal(lazy.from([]).stringJoin(',', i => `${i * 2}`), '');
  assert.equal(lazy.from([1]).stringJoin(',', i => `${i * 2}`), '2');
  assert.equal(lazy.from([1, 2]).stringJoin(',', i => `${i * 2}`), '2,4');
  assert.equal(lazy.from([1, 2, 3]).stringJoin(',', i => `${i * 2}`), '2,4,6');
  assert.equal(lazy.from([1, 2, 3, 4]).stringJoin(',', i => `${i * 2}`), '2,4,6,8');
});

test(function sum() {
  assert.equal(lazy.from([1]).sum(), 1);
  assert.equal(lazy.from([1, 2]).sum(), 3);
  assert.equal(lazy.from([1, 2, 3]).sum(), 6);
  assert.equal(lazy.from([1, 2, 3, 4]).sum(), 10);
  assert.equal(lazy.from([1, 2, 3, 4, 5]).sum(), 15);
  assert.throws(() => lazy.from([true]).sum());
});

test(function toMap() {
  const orig = [
    { key: 1, value: 'a' },
    { key: 2, value: 'b' },
    { key: 3, value: 'c' },
    { key: 4, value: 'd' },
    { key: 5, value: 'e' },
  ];

  const map1 = new Map<number, string>(orig.map<[number, string]>(v => [v.key, v.value]));
  for (const [key, value] of lazy.from(orig).toMap(v => v.key, v => v.value)) {
    assert(map1.has(key));
    assert.equal(map1.get(key), value);
  }

  const map2 = new Map<number, { key: number, value: string }>(
    orig.map<[number, { key: number, value: string }]>(v => [v.key, v]),
  );
  for (const [key, value] of lazy.from(orig).toMap(v => v.key, v => v)) {
    assert(map2.has(key));
    assert.equal(map2.get(key), value);
  }
});
