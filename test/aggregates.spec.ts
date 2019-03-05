import { assert, test } from 'https://deno.land/x/std@v0.2.8/testing/mod.ts';
import { Lazy } from '../lib/mod.ts';

test(function aggregate() {
  assert.equal(
    Lazy.from([1, 2, 3]).aggregate((acc, curr) => acc + curr, 0),
    1 + 2 + 3,
  );
  assert.equal(
    Lazy.from([1, 2, 3, 4]).aggregate((acc, curr) => acc + curr, 0),
    1 + 2 + 3 + 4,
  );
  assert.equal(
    Lazy.from([1, 2, 3, 4]).aggregate((acc, curr) => acc * curr, 1),
    1 * 2 * 3 * 4,
  );
  assert.equal(
    Lazy.from([1, 2, 3]).aggregate((acc, curr) => acc + curr, ''),
    '123',
  );
  assert.equal(
    Lazy.from([1, 2, 3]).aggregate((acc, curr) => acc + curr),
    1 + 2 + 3,
  );
});

test(function all() {
  assert.equal(Lazy.from([true, true, true, true]).all(v => v), true);
  assert.equal(Lazy.from([false, true, true, true]).all(v => v), false);
  assert.equal(Lazy.from([true, false, true, true]).all(v => v), false);
  assert.equal(Lazy.from([true, true, false, true]).all(v => v), false);
  assert.equal(Lazy.from([true, true, true, false]).all(v => v), false);
});

test(function any() {
  assert.equal(Lazy.from([true, true, true, true]).any(v => v), true);
  assert.equal(Lazy.from([false, true, true, true]).any(v => v), true);
  assert.equal(Lazy.from([false, false, true, true]).any(v => v), true);
  assert.equal(Lazy.from([false, false, false, true]).any(v => v), true);
  assert.equal(Lazy.from([false, false, false, false]).any(v => v), false);

  assert.equal(Lazy.from([]).any(), false);
  assert.equal(Lazy.from([1]).any(), true);
});

test(function average() {
  const avg = (lst: number[]) =>
    lst.reduce((prev, curr) => prev + curr) / lst.length;

  let orig = [1, 2, 3, 4];
  assert.equal(Lazy.from(orig).average(), avg(orig));

  orig = [4, 3, 2, 1];
  assert.equal(Lazy.from(orig).average(), avg(orig));

  orig = [1, 2, 3, 4, 9, 8, 6];
  assert.equal(Lazy.from(orig).average(), avg(orig));

  assert.throws(() => Lazy.from([true]).average());

  const objs = [
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 4 },
    { value: 5 },
  ];
  assert.equal(
    Lazy.from(objs).average(o => o.value),
    avg(objs.map(o => o.value)),
  );
});

test(function contains() {
  const orig = [1, 2, 3, 4, 5];
  assert.equal(Lazy.from(orig).contains(1), true);
  assert.equal(Lazy.from(orig).contains(2), true);
  assert.equal(Lazy.from(orig).contains(3), true);
  assert.equal(Lazy.from(orig).contains(4), true);
  assert.equal(Lazy.from(orig).contains(5), true);
  assert.equal(Lazy.from(orig).contains(6), false);
  assert.equal(Lazy.from(orig).contains(7), false);

  const comparer = (a: number, b: number) => a.toString() === b.toString();
  assert.equal(Lazy.from(orig).contains('1' as any, comparer), true);
  assert.equal(Lazy.from(orig).contains('2' as any, comparer), true);
  assert.equal(Lazy.from(orig).contains('3' as any, comparer), true);
  assert.equal(Lazy.from(orig).contains('4' as any, comparer), true);
  assert.equal(Lazy.from(orig).contains('5' as any, comparer), true);
  assert.equal(Lazy.from(orig).contains('6' as any, comparer), false);
  assert.equal(Lazy.from(orig).contains('7' as any, comparer), false);
});

test(function count() {
  // Test direct array access.
  assert.equal(Lazy.from([]).count(), 0);
  assert.equal(Lazy.from([1]).count(), 1);
  assert.equal(Lazy.from([1, 2]).count(), 2);
  assert.equal(Lazy.from([1, 2, 3]).count(), 3);
  assert.equal(Lazy.from([1, 2, 3, 4]).count(), 4);

  assert.equal(Lazy.from([]).count(i => i % 2 === 0), 0);
  assert.equal(Lazy.from([1]).count(i => i % 2 === 0), 0);
  assert.equal(Lazy.from([1, 2]).count(i => i % 2 === 0), 1);
  assert.equal(Lazy.from([1, 2, 3]).count(i => i % 2 === 0), 1);
  assert.equal(Lazy.from([1, 2, 3, 4]).count(i => i % 2 === 0), 2);

  // Test iterated array access.
  assert.equal(
    Lazy.from([])
      .select(v => v * 2)
      .count(),
    0,
  );
  assert.equal(
    Lazy.from([1])
      .select(v => v * 2)
      .count(),
    1,
  );
  assert.equal(
    Lazy.from([1, 2])
      .select(v => v * 2)
      .count(),
    2,
  );
  assert.equal(
    Lazy.from([1, 2, 3])
      .select(v => v * 2)
      .count(),
    3,
  );
  assert.equal(
    Lazy.from([1, 2, 3, 4])
      .select(v => v * 2)
      .count(),
    4,
  );

  assert.equal(
    Lazy.from([])
      .select(v => v + 1)
      .count(i => i % 2 === 0),
    0,
  );
  assert.equal(
    Lazy.from([1])
      .select(v => v + 1)
      .count(i => i % 2 === 0),
    1,
  );
  assert.equal(
    Lazy.from([1, 2])
      .select(v => v + 1)
      .count(i => i % 2 === 0),
    1,
  );
  assert.equal(
    Lazy.from([1, 2, 3])
      .select(v => v + 1)
      .count(i => i % 2 === 0),
    2,
  );
  assert.equal(
    Lazy.from([1, 2, 3, 4])
      .select(v => v + 1)
      .count(i => i % 2 === 0),
    2,
  );
});

test(function elementAt() {
  // Test direct array access.
  let orig = [1, 2, 3, 4, 5];
  assert.equal(Lazy.from(orig).elementAt(0), 1);
  assert.equal(Lazy.from(orig).elementAt(1), 2);
  assert.equal(Lazy.from(orig).elementAt(2), 3);
  assert.equal(Lazy.from(orig).elementAt(3), 4);
  assert.equal(Lazy.from(orig).elementAt(4), 5);
  assert.throws(() => Lazy.from(orig).elementAt(5));

  orig = [];
  assert.throws(() => Lazy.from(orig).elementAt(0));

  // Test iterated array access.
  orig = [1, 2, 3, 4, 5];
  assert.equal(
    Lazy.from(orig)
      .select(v => v * 2)
      .elementAt(0),
    2,
  );
  assert.equal(
    Lazy.from(orig)
      .select(v => v * 2)
      .elementAt(1),
    4,
  );
  assert.equal(
    Lazy.from(orig)
      .select(v => v * 2)
      .elementAt(2),
    6,
  );
  assert.equal(
    Lazy.from(orig)
      .select(v => v * 2)
      .elementAt(3),
    8,
  );
  assert.equal(
    Lazy.from(orig)
      .select(v => v * 2)
      .elementAt(4),
    10,
  );
  assert.throws(() =>
    Lazy.from(orig)
      .select(v => v * 2)
      .elementAt(5),
  );

  orig = [];
  assert.throws(() =>
    Lazy.from(orig)
      .select(v => v * 2)
      .elementAt(0),
  );
});

test(function elementAtOrDefault() {
  // Test direct array access.
  let orig = [1, 2, 3, 4, 5];
  assert.equal(Lazy.from(orig).elementAtOrDefault(0, 9), 1);
  assert.equal(Lazy.from(orig).elementAtOrDefault(1, 9), 2);
  assert.equal(Lazy.from(orig).elementAtOrDefault(2, 9), 3);
  assert.equal(Lazy.from(orig).elementAtOrDefault(3, 9), 4);
  assert.equal(Lazy.from(orig).elementAtOrDefault(4, 9), 5);
  assert.equal(Lazy.from(orig).elementAtOrDefault(5, 9), 9);

  orig = [];
  assert.equal(Lazy.from(orig).elementAtOrDefault(5, 9), 9);

  // Test iterated array access.
  orig = [1, 2, 3, 4, 5];
  assert.equal(
    Lazy.from(orig)
      .select(v => v * 2)
      .elementAtOrDefault(0, 9),
    2,
  );
  assert.equal(
    Lazy.from(orig)
      .select(v => v * 2)
      .elementAtOrDefault(1, 9),
    4,
  );
  assert.equal(
    Lazy.from(orig)
      .select(v => v * 2)
      .elementAtOrDefault(2, 9),
    6,
  );
  assert.equal(
    Lazy.from(orig)
      .select(v => v * 2)
      .elementAtOrDefault(3, 9),
    8,
  );
  assert.equal(
    Lazy.from(orig)
      .select(v => v * 2)
      .elementAtOrDefault(4, 9),
    10,
  );
  assert.equal(
    Lazy.from(orig)
      .select(v => v * 2)
      .elementAtOrDefault(5, 9),
    9,
  );

  orig = [];
  assert.equal(
    Lazy.from(orig)
      .select(v => v * 2)
      .elementAtOrDefault(0, 9),
    9,
  );

  interface TestObj {
    value: string;
    key: number;
    o: { a: string };
  }
  const objs: TestObj[] = [
    { key: 0, value: 'a', o: { a: 'z' } },
    { key: 1, value: 'b', o: { a: 'y' } },
    { key: 2, value: 'c', o: { a: 'x' } },
    { key: 3, value: 'd', o: { a: 'w' } },
    { key: 4, value: 'e', o: { a: 'v' } },
  ];
  assert.equal(
    Lazy.from(objs).elementAtOrDefault(2, {
      key: 9,
      value: 'z',
      o: { a: 'a' },
    }),
    {
      key: 2,
      value: 'c',
      o: { a: 'x' },
    },
  );
  assert.equal(
    Lazy.from(objs).elementAtOrDefault(10, {
      key: 9,
      value: 'z',
      o: { a: 'b' },
    }),
    {
      key: 9,
      value: 'z',
      o: { a: 'b' },
    },
  );
  assert.equal(Lazy.from(objs).elementAtOrDefault(2, undefined), {
    key: 2,
    value: 'c',
    o: { a: 'x' },
  });
  assert.equal(Lazy.from(objs).elementAtOrDefault(10, undefined), undefined);
});

test(function first() {
  // Test direct array access.
  assert.equal(Lazy.from([1, 2, 3]).first(), 1);
  assert.equal(Lazy.from([2, 3, 1]).first(), 2);
  assert.equal(Lazy.from([3, 2, 1]).first(), 3);
  assert.throws(() => Lazy.from([]).first());

  assert.equal(Lazy.from([1, 2, 3]).first(i => i % 2 === 0), 2);
  assert.equal(Lazy.from([2, 3, 1]).first(i => i % 2 === 0), 2);
  assert.equal(Lazy.from([3, 2, 1]).first(i => i % 2 === 0), 2);
  assert.throws(() => Lazy.from([]).first(i => i % 2 === 0));

  // Test iterated array access.
  assert.equal(
    Lazy.from([1, 2, 3])
      .select(v => v * 2)
      .first(),
    2,
  );
  assert.equal(
    Lazy.from([2, 3, 1])
      .select(v => v * 2)
      .first(),
    4,
  );
  assert.equal(
    Lazy.from([3, 2, 1])
      .select(v => v * 2)
      .first(),
    6,
  );
  assert.throws(() =>
    Lazy.from([])
      .select(v => v * 2)
      .first(),
  );

  assert.equal(
    Lazy.from([1, 2, 3])
      .select(v => v * 2)
      .first(i => i % 3 === 0),
    6,
  );
  assert.equal(
    Lazy.from([2, 3, 1])
      .select(v => v * 2)
      .first(i => i % 3 === 0),
    6,
  );
  assert.equal(
    Lazy.from([3, 2, 1])
      .select(v => v * 2)
      .first(i => i % 3 === 0),
    6,
  );
  assert.throws(() =>
    Lazy.from([])
      .select(v => v * 2)
      .first(i => i % 3 === 0),
  );
});

test(function firstOrDefault() {
  // Test direct array access.
  assert.equal(Lazy.from([1, 2, 3]).firstOrDefault(9), 1);
  assert.equal(Lazy.from([2, 3, 1]).firstOrDefault(9), 2);
  assert.equal(Lazy.from([3, 2, 1]).firstOrDefault(9), 3);
  assert.equal(Lazy.from<number>([]).firstOrDefault(9), 9);

  assert.equal(Lazy.from([1, 2, 3]).firstOrDefault(9, i => i % 2 === 0), 2);
  assert.equal(Lazy.from([2, 3, 1]).firstOrDefault(9, i => i % 2 === 0), 2);
  assert.equal(Lazy.from([3, 2, 1]).firstOrDefault(9, i => i % 2 === 0), 2);
  assert.equal(Lazy.from<number>([]).firstOrDefault(9, i => i % 2 === 0), 9);

  // Test iterated array access.
  assert.equal(
    Lazy.from([1, 2, 3])
      .select(v => v * 2)
      .firstOrDefault(9),
    2,
  );
  assert.equal(
    Lazy.from([2, 3, 1])
      .select(v => v * 2)
      .firstOrDefault(9),
    4,
  );
  assert.equal(
    Lazy.from([3, 2, 1])
      .select(v => v * 2)
      .firstOrDefault(9),
    6,
  );
  assert.equal(
    Lazy.from<number>([])
      .select(v => v * 2)
      .firstOrDefault(9),
    9,
  );

  assert.equal(
    Lazy.from([1, 2, 3])
      .select(v => v * 2)
      .firstOrDefault(9, i => i % 3 === 0),
    6,
  );
  assert.equal(
    Lazy.from([2, 3, 1])
      .select(v => v * 2)
      .firstOrDefault(9, i => i % 3 === 0),
    6,
  );
  assert.equal(
    Lazy.from([3, 2, 1])
      .select(v => v * 2)
      .firstOrDefault(9, i => i % 3 === 0),
    6,
  );
  assert.equal(
    Lazy.from<number>([])
      .select(v => v * 2)
      .firstOrDefault(9, i => i % 3 === 0),
    9,
  );

  assert.equal(
    Lazy.from([1, 2, 3]).firstOrDefault(undefined, i => i >= 4),
    undefined,
  );
});

test(function forEach() {
  const items: Array<{ v: number; i: number }> = [];
  Lazy.from([1, 2, 3, 4, 5]).forEach((v, i) => items.push({ v, i }));
  assert.equal(items, [
    { v: 1, i: 0 },
    { v: 2, i: 1 },
    { v: 3, i: 2 },
    { v: 4, i: 3 },
    { v: 5, i: 4 },
  ]);
});

test(function iterableEquals() {
  assert.equal(Lazy.from([1]).iterableEquals([1]), true);
  assert.equal(Lazy.from([1, 2]).iterableEquals([1, 2]), true);
  assert.equal(Lazy.from([1, 2, 3]).iterableEquals([1, 2, 3]), true);
  assert.equal(Lazy.from([1, 2, 3, 4]).iterableEquals([1, 2, 3, 4]), true);
  assert.equal(
    Lazy.from([1, 2, 3, 4, 5]).iterableEquals([1, 2, 3, 4, 5]),
    true,
  );
  assert.equal(
    Lazy.from([1, 2, 3, 4, 5]).iterableEquals([5, 4, 3, 2, 1]),
    false,
  );
  assert.equal(Lazy.from([1, 2, 3, 4, 5]).iterableEquals([1, 2, 3, 4]), false);
  assert.equal(
    Lazy.from([{ value: 1 }, { value: 2 }, { value: 3 }]).iterableEquals(
      [{ value: 1 }, { value: 2 }, { value: 3 }],
      (a, b) => a.value === b.value,
    ),
    true,
  );
});

test(function last() {
  // Test direct array access.
  assert.equal(Lazy.from([1]).last(), 1);
  assert.equal(Lazy.from([1, 2]).last(), 2);
  assert.equal(Lazy.from([1, 2, 3]).last(), 3);
  assert.equal(Lazy.from([1, 2, 3, 4]).last(), 4);
  assert.equal(Lazy.from([1, 2, 3, 4, 5]).last(), 5);
  assert.throws(() => Lazy.from([]).last());

  assert.throws(() => Lazy.from([1]).last(i => i % 2 === 0));
  assert.equal(Lazy.from([1, 2]).last(i => i % 2 === 0), 2);
  assert.equal(Lazy.from([1, 2, 3]).last(i => i % 2 === 0), 2);
  assert.equal(Lazy.from([1, 2, 3, 4]).last(i => i % 2 === 0), 4);
  assert.equal(Lazy.from([1, 2, 3, 4, 5]).last(i => i % 2 === 0), 4);
  assert.throws(() => Lazy.from([]).last(i => i % 2 === 0));

  // Test iterated array access.
  assert.equal(
    Lazy.from([1])
      .select(v => v * 2)
      .last(),
    2,
  );
  assert.equal(
    Lazy.from([1, 2])
      .select(v => v * 2)
      .last(),
    4,
  );
  assert.equal(
    Lazy.from([1, 2, 3])
      .select(v => v * 2)
      .last(),
    6,
  );
  assert.equal(
    Lazy.from([1, 2, 3, 4])
      .select(v => v * 2)
      .last(),
    8,
  );
  assert.equal(
    Lazy.from([1, 2, 3, 4, 5])
      .select(v => v * 2)
      .last(),
    10,
  );
  assert.throws(() =>
    Lazy.from([])
      .select(v => v * 2)
      .last(),
  );

  assert.throws(() =>
    Lazy.from([1])
      .select(v => v * 2)
      .last(i => i % 3 === 0),
  );
  assert.throws(() =>
    Lazy.from([1, 2])
      .select(v => v * 2)
      .last(i => i % 3 === 0),
  );
  assert.equal(
    Lazy.from([1, 2, 3])
      .select(v => v * 2)
      .last(i => i % 3 === 0),
    6,
  );
  assert.equal(
    Lazy.from([1, 2, 3, 4])
      .select(v => v * 2)
      .last(i => i % 3 === 0),
    6,
  );
  assert.equal(
    Lazy.from([1, 2, 3, 4, 5])
      .select(v => v * 2)
      .last(i => i % 3 === 0),
    6,
  );
  assert.throws(() =>
    Lazy.from([])
      .select(v => v * 2)
      .last(i => i % 3 === 0),
  );
});

test(function lastOrDefault() {
  // Test direct array access.
  assert.equal(Lazy.from([1]).lastOrDefault(9), 1);
  assert.equal(Lazy.from([1, 2]).lastOrDefault(9), 2);
  assert.equal(Lazy.from([1, 2, 3]).lastOrDefault(9), 3);
  assert.equal(Lazy.from([1, 2, 3, 4]).lastOrDefault(9), 4);
  assert.equal(Lazy.from([1, 2, 3, 4, 5]).lastOrDefault(9), 5);
  assert.equal(Lazy.from<number>([]).lastOrDefault(9), 9);

  assert.equal(Lazy.from([1]).lastOrDefault(9, i => i % 2 === 0), 9);
  assert.equal(Lazy.from([1, 2]).lastOrDefault(9, i => i % 2 === 0), 2);
  assert.equal(Lazy.from([1, 2, 3]).lastOrDefault(9, i => i % 2 === 0), 2);
  assert.equal(Lazy.from([1, 2, 3, 4]).lastOrDefault(9, i => i % 2 === 0), 4);
  assert.equal(
    Lazy.from([1, 2, 3, 4, 5]).lastOrDefault(9, i => i % 2 === 0),
    4,
  );
  assert.equal(Lazy.from<number>([]).lastOrDefault(9, i => i % 2 === 0), 9);

  // Test iterated array access.
  assert.equal(
    Lazy.from([1])
      .select(v => v * 2)
      .lastOrDefault(9),
    2,
  );
  assert.equal(
    Lazy.from([1, 2])
      .select(v => v * 2)
      .lastOrDefault(9),
    4,
  );
  assert.equal(
    Lazy.from([1, 2, 3])
      .select(v => v * 2)
      .lastOrDefault(9),
    6,
  );
  assert.equal(
    Lazy.from([1, 2, 3, 4])
      .select(v => v * 2)
      .lastOrDefault(9),
    8,
  );
  assert.equal(
    Lazy.from([1, 2, 3, 4, 5])
      .select(v => v * 2)
      .lastOrDefault(9),
    10,
  );
  assert.equal(
    Lazy.from<number>([])
      .select(v => v * 2)
      .lastOrDefault(9),
    9,
  );

  assert.equal(
    Lazy.from([1])
      .select(v => v * 2)
      .lastOrDefault(9, i => i % 3 === 0),
    9,
  );
  assert.equal(
    Lazy.from([1, 2])
      .select(v => v * 2)
      .lastOrDefault(9, i => i % 3 === 0),
    9,
  );
  assert.equal(
    Lazy.from([1, 2, 3])
      .select(v => v * 2)
      .lastOrDefault(9, i => i % 3 === 0),
    6,
  );
  assert.equal(
    Lazy.from([1, 2, 3, 4])
      .select(v => v * 2)
      .lastOrDefault(9, i => i % 3 === 0),
    6,
  );
  assert.equal(
    Lazy.from([1, 2, 3, 4, 5])
      .select(v => v * 2)
      .lastOrDefault(9, i => i % 3 === 0),
    6,
  );
  assert.equal(
    Lazy.from<number>([])
      .select(v => v * 2)
      .lastOrDefault(9, i => i % 3 === 0),
    9,
  );

  assert.equal(
    Lazy.from([1, 2, 3]).lastOrDefault(undefined, i => i >= 4),
    undefined,
  );
});

test(function max() {
  assert.equal(Lazy.from([1, 2, 3, 4, 5]).max(), 5);
  assert.equal(Lazy.from([1, 2, 3, 4]).max(), 4);
  assert.equal(Lazy.from([1, 2, 3]).max(), 3);
  assert.equal(Lazy.from([1, 2]).max(), 2);
  assert.equal(Lazy.from([1]).max(), 1);
  assert.throws(() => Lazy.from([true]).max());

  const objs = [
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 4 },
    { value: 5 },
  ];
  assert.equal(Lazy.from(objs).max(o => o.value), 5);
});

test(function min() {
  assert.equal(Lazy.from([1, 2, 3, 4, 5]).min(), 1);
  assert.equal(Lazy.from([2, 3, 4, 5]).min(), 2);
  assert.equal(Lazy.from([3, 4, 5]).min(), 3);
  assert.equal(Lazy.from([4, 5]).min(), 4);
  assert.equal(Lazy.from([5]).min(), 5);
  assert.throws(() => Lazy.from([true]).min());

  const objs = [
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 4 },
    { value: 5 },
  ];
  assert.equal(Lazy.from(objs).min(o => o.value), 1);
});

test(async function resolveAll() {
  const orig = [
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3),
    Promise.resolve(4),
    Promise.resolve(5),
  ];
  assert.equal((await Lazy.from(orig).resolveAll()).toArray(), [1, 2, 3, 4, 5]);
  assert.equal(
    (await Lazy.from(orig).resolveAll()).select(i => i * 2).toArray(),
    [2, 4, 6, 8, 10],
  );

  const mix = [
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3),
    4,
    5,
  ];
  assert.equal((await Lazy.from(mix).resolveAll()).toArray(), [1, 2, 3, 4, 5]);
  assert.equal(
    (await Lazy.from(mix).resolveAll()).select(i => i * 2).toArray(),
    [2, 4, 6, 8, 10],
  );
});

test(function single() {
  const orig = [
    { key: 1, value: 'a' },
    { key: 2, value: 'b' },
    { key: 3, value: 'c' },
  ];
  assert.equal(Lazy.from(orig).single(v => v.key === 1), {
    key: 1,
    value: 'a',
  });
  assert.equal(Lazy.from(orig).single(v => v.key === 2), {
    key: 2,
    value: 'b',
  });
  assert.equal(Lazy.from(orig).single(v => v.key === 3), {
    key: 3,
    value: 'c',
  });
  assert.throws(() => Lazy.from(orig).single(v => v.key === 4));
});

test(function singleOrDefault() {
  const orig = [
    { key: 1, value: 'a' },
    { key: 2, value: 'b' },
    { key: 3, value: 'c' },
  ];
  assert.equal(
    Lazy.from(orig).singleOrDefault(v => v.key === 1, { key: 9, value: 'i' }),
    { key: 1, value: 'a' },
  );
  assert.equal(
    Lazy.from(orig).singleOrDefault(v => v.key === 2, { key: 9, value: 'i' }),
    { key: 2, value: 'b' },
  );
  assert.equal(
    Lazy.from(orig).singleOrDefault(v => v.key === 3, { key: 9, value: 'i' }),
    { key: 3, value: 'c' },
  );
  assert.equal(
    Lazy.from(orig).singleOrDefault(v => v.key === 8, { key: 9, value: 'i' }),
    { key: 9, value: 'i' },
  );

  assert.equal(
    Lazy.from([1, 2, 3]).singleOrDefault(i => i >= 4, undefined),
    undefined,
  );
});

test(function stringJoin() {
  assert.equal(Lazy.from([]).stringJoin(), '');
  assert.equal(Lazy.from([1]).stringJoin(), '1');
  assert.equal(Lazy.from([1, 2]).stringJoin(), '12');
  assert.equal(Lazy.from([1, 2, 3]).stringJoin(), '123');
  assert.equal(Lazy.from([1, 2, 3, 4]).stringJoin(), '1234');

  assert.equal(Lazy.from([]).stringJoin(','), '');
  assert.equal(Lazy.from([1]).stringJoin(','), '1');
  assert.equal(Lazy.from([1, 2]).stringJoin(','), '1,2');
  assert.equal(Lazy.from([1, 2, 3]).stringJoin(','), '1,2,3');
  assert.equal(Lazy.from([1, 2, 3, 4]).stringJoin(','), '1,2,3,4');

  assert.equal(Lazy.from([]).stringJoin(',', i => `${i * 2}`), '');
  assert.equal(Lazy.from([1]).stringJoin(',', i => `${i * 2}`), '2');
  assert.equal(Lazy.from([1, 2]).stringJoin(',', i => `${i * 2}`), '2,4');
  assert.equal(Lazy.from([1, 2, 3]).stringJoin(',', i => `${i * 2}`), '2,4,6');
  assert.equal(
    Lazy.from([1, 2, 3, 4]).stringJoin(',', i => `${i * 2}`),
    '2,4,6,8',
  );
});

test(function sum() {
  assert.equal(Lazy.from([1]).sum(), 1);
  assert.equal(Lazy.from([1, 2]).sum(), 3);
  assert.equal(Lazy.from([1, 2, 3]).sum(), 6);
  assert.equal(Lazy.from([1, 2, 3, 4]).sum(), 10);
  assert.equal(Lazy.from([1, 2, 3, 4, 5]).sum(), 15);
  assert.throws(() => Lazy.from([true]).sum());

  const objs = [
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 4 },
    { value: 5 },
  ];
  assert.equal(Lazy.from(objs).sum(o => o.value), 15);
});

test(function toJSON() {
  const s = JSON.stringify;

  assert.equal(s(Lazy.from([1, 2, 3, 4, 5])), s([1, 2, 3, 4, 5]));
  assert.equal(
    s(Lazy.from([1, 2, 3, 4, 5]).select(i => i * 2)),
    s([2, 4, 6, 8, 10]),
  );
  assert.equal(s(Lazy.from([1, 2, 3, 4, 5]).reverse()), s([5, 4, 3, 2, 1]));
  assert.equal(
    s(Lazy.from([1, 2, 3, 4, 5]).where(i => i % 2 === 0)),
    s([2, 4]),
  );
});

test(function toMap() {
  const orig = [
    { key: 1, value: 'a' },
    { key: 2, value: 'b' },
    { key: 3, value: 'c' },
    { key: 4, value: 'd' },
    { key: 5, value: 'e' },
  ];

  const map1 = new Map<number, string>(
    orig.map<[number, string]>(v => [v.key, v.value]),
  );
  for (const [key, value] of Lazy.from(orig).toMap(v => v.key, v => v.value)) {
    assert(map1.has(key));
    assert.equal(map1.get(key), value);
  }

  const map2 = new Map<number, { key: number; value: string }>(
    orig.map<[number, { key: number; value: string }]>(v => [v.key, v]),
  );
  for (const [key, value] of Lazy.from(orig).toMap(v => v.key, v => v)) {
    assert(map2.has(key));
    assert.equal(map2.get(key), value);
  }
});
