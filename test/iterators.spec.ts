import { Lazy } from '../lib/mod.ts';
import { assertEquals } from './deps/std/testing/asserts.ts';

const test = Deno.test;

test(function append() {
  let orig = [1, 2, 3, 4];
  assertEquals(Lazy.from(orig).append(5).toArray(), [...orig, 5]);

  orig = [4, 3, 2, 1];
  assertEquals(Lazy.from(orig).append(-1).toArray(), [...orig, -1]);

  orig = [9, 8, 7, 6, 5, 4, 3, 2, 1];
  assertEquals(Lazy.from(orig).append(0).toArray(), [...orig, 0]);
});

test(function apply() {
  class LazyNumberToString extends Lazy<string> {
    public constructor(
      private readonly _iterable: Iterable<number>,
      private readonly _adjust: (element: number) => string,
    ) {
      super();
    }

    public *[Symbol.iterator](): Iterator<string> {
      for (const element of this._iterable) {
        yield this._adjust(element);
      }
    }
  }

  class LazySquare extends Lazy<number> {
    public constructor(private readonly _iterable: Iterable<number>) {
      super();
    }

    public *[Symbol.iterator](): Iterator<number> {
      for (const element of this._iterable) {
        yield element ** 2;
      }
    }
  }

  class LazyToString<TSource> extends Lazy<string> {
    public constructor(private readonly _iterable: Iterable<TSource>) {
      super();
    }

    public *[Symbol.iterator](): Iterator<string> {
      for (const element of this._iterable) {
        yield `${element}`;
      }
    }
  }
  const iterableToString = <TSource>(t: Iterable<TSource>) =>
    new LazyToString(t);

  const orig = [1, 2, 3, 4];
  assertEquals(
    Lazy.from(orig)
      .apply<LazyNumberToString, string>(
        t => new LazyNumberToString(t, e => e.toString()),
      )
      .toArray(),
    ['1', '2', '3', '4'],
  );
  assertEquals(
    Lazy.from(orig)
      .apply(t => new LazySquare(t))
      .toArray(),
    [1, 4, 9, 16],
  );
  assertEquals(
    Lazy.from(orig)
      .apply<LazyToString<number>, string>(iterableToString)
      .toArray(),
    ['1', '2', '3', '4'],
  );
});

test(function batchIn() {
  const orig = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  assertEquals(Lazy.from(orig).batchIn(1).toArray(), [
    [1],
    [2],
    [3],
    [4],
    [5],
    [6],
    [7],
    [8],
    [9],
  ]);
  assertEquals(Lazy.from(orig).batchIn(2).toArray(), [
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [9],
  ]);
  assertEquals(Lazy.from(orig).batchIn(3).toArray(), [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]);
  assertEquals(Lazy.from(orig).batchIn(4).toArray(), [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9],
  ]);
  assertEquals(Lazy.from(orig).batchIn(5).toArray(), [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9],
  ]);
  assertEquals(Lazy.from(orig).batchIn(6).toArray(), [
    [1, 2, 3, 4, 5, 6],
    [7, 8, 9],
  ]);
  assertEquals(Lazy.from(orig).batchIn(7).toArray(), [
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9],
  ]);
  assertEquals(Lazy.from(orig).batchIn(8).toArray(), [
    [1, 2, 3, 4, 5, 6, 7, 8],
    [9],
  ]);
  assertEquals(Lazy.from(orig).batchIn(9).toArray(), [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
  ]);
  assertEquals(Lazy.from(orig).batchIn(10).toArray(), [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
  ]);

  assertEquals(Lazy.from(orig).batchIn(1, false).toArray(), [
    [1],
    [2],
    [3],
    [4],
    [5],
    [6],
    [7],
    [8],
    [9],
  ]);
  assertEquals(Lazy.from(orig).batchIn(2, false).toArray(), [
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
  ]);
  assertEquals(Lazy.from(orig).batchIn(3, false).toArray(), [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]);
  assertEquals(Lazy.from(orig).batchIn(4, false).toArray(), [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
  ]);
  assertEquals(Lazy.from(orig).batchIn(5, false).toArray(), [[1, 2, 3, 4, 5]]);
  assertEquals(Lazy.from(orig).batchIn(6, false).toArray(), [
    [1, 2, 3, 4, 5, 6],
  ]);
  assertEquals(Lazy.from(orig).batchIn(7, false).toArray(), [
    [1, 2, 3, 4, 5, 6, 7],
  ]);
  assertEquals(Lazy.from(orig).batchIn(8, false).toArray(), [
    [1, 2, 3, 4, 5, 6, 7, 8],
  ]);
  assertEquals(Lazy.from(orig).batchIn(9, false).toArray(), [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
  ]);
  assertEquals(Lazy.from(orig).batchIn(10, false).toArray(), []);
});

test(function cache() {
  const orig = [1, 2, 3, 4, 5];

  assertEquals(Lazy.from(orig).cache().toArray(), orig);

  let calls = 0;
  const chain = Lazy.from(orig).select(i => {
    calls++;
    return i * 2;
  });

  // Without caching.
  assertEquals(chain.toArray(), [2, 4, 6, 8, 10]);
  assertEquals(calls, 5);
  chain.toArray();
  assertEquals(calls, 10);

  calls = 0;
  const cached = chain.cache();

  // With caching.
  assertEquals(cached.toArray(), [2, 4, 6, 8, 10]);
  assertEquals(calls, 5);
  cached.toArray();
  assertEquals(calls, 5);
});

test(function concat() {
  let first = [1, 2, 3, 4];
  let second = [5, 6, 7, 8];
  assertEquals(Lazy.from(first).concat(second).toArray(), [
    ...first,
    ...second,
  ]);

  first = [9, 8, 7, 6];
  second = [1, 2, 3, 4];
  assertEquals(Lazy.from(first).concat(second).toArray(), [
    ...first,
    ...second,
  ]);

  assertEquals(Lazy.from([1]).concat([2], [3]).toArray(), [1, 2, 3]);

  assertEquals(Lazy.from<number>([]).concat([], [], [1], []).toArray(), [1]);
});

test(function defaultIfEmpty() {
  let orig = [1, 2, 3];
  assertEquals(Lazy.from(orig).defaultIfEmpty(9).toArray(), orig);

  orig = [];
  assertEquals(Lazy.from(orig).defaultIfEmpty(9).toArray(), [9]);
});

test(function distinct() {
  let orig = [1, 2, 3, 1, 2, 3];
  assertEquals(Lazy.from(orig).distinct().toArray(), [1, 2, 3]);

  orig = [1, 2, 3, 1, 8, 9];
  assertEquals(Lazy.from(orig).distinct().toArray(), [1, 2, 3, 8, 9]);

  const objs = [
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 2 },
    { value: 1 },
  ];
  assertEquals(
    Lazy.from(objs)
      .distinct(o => o.value)
      .toArray(),
    [{ value: 1 }, { value: 2 }, { value: 3 }],
  );
});

test(function except() {
  const orig = [1, 2, 3, 4, 5];
  assertEquals(Lazy.from(orig).except([2, 4]).toArray(), [1, 3, 5]);
  assertEquals(Lazy.from(orig).except([1]).toArray(), [2, 3, 4, 5]);
  assertEquals(Lazy.from(orig).except([4, 5]).toArray(), [1, 2, 3]);
});

test(function groupBy() {
  const objs = [
    { key: 1, value: 'a' },
    { key: 2, value: 'b' },
    { key: 3, value: 'c' },
    { key: 3, value: 'd' },
    { key: 2, value: 'e' },
    { key: 1, value: 'f' },
    { key: 4, value: 'g' },
  ];

  assertEquals(
    Lazy.from(objs)
      .groupBy(f => f.key)
      .toArray(),
    [
      {
        key: 1,
        elements: [
          { key: 1, value: 'a' },
          { key: 1, value: 'f' },
        ],
      },
      {
        key: 2,
        elements: [
          { key: 2, value: 'b' },
          { key: 2, value: 'e' },
        ],
      },
      {
        key: 3,
        elements: [
          { key: 3, value: 'c' },
          { key: 3, value: 'd' },
        ],
      },
      { key: 4, elements: [{ key: 4, value: 'g' }] },
    ],
  );
  assertEquals(
    Lazy.from(objs)
      .groupBy(
        f => f.key,
        f => f.value,
      )
      .toArray(),
    [
      { key: 1, elements: ['a', 'f'] },
      { key: 2, elements: ['b', 'e'] },
      { key: 3, elements: ['c', 'd'] },
      { key: 4, elements: ['g'] },
    ],
  );
  assertEquals(
    Lazy.from(objs)
      .groupBy(
        f => f.key,
        f => f.value,
        (key, f) => ({ k: key, values: Array.from(f) }),
      )
      .toArray(),
    [
      { k: 1, values: ['a', 'f'] },
      { k: 2, values: ['b', 'e'] },
      { k: 3, values: ['c', 'd'] },
      { k: 4, values: ['g'] },
    ],
  );
});

test(function groupJoin() {
  const first = [
    { key: 1, value: 5 },
    { key: 2, value: 4 },
    { key: 3, value: 3 },
    { key: 4, value: 2 },
    { key: 5, value: 1 },
    { key: 8, value: 1 },
  ];
  const second = [
    { key: 1, value: 'a' },
    { key: 2, value: 'b' },
    { key: 3, value: 'c' },
    { key: 4, value: 'd' },
    { key: 5, value: 'e' },
    { key: 1, value: 'f' },
    { key: 2, value: 'g' },
    { key: 3, value: 'h' },
    { key: 4, value: 'i' },
    { key: 9, value: 'j' },
  ];
  assertEquals(
    Lazy.from(first)
      .groupJoin(
        second,
        f => f.key,
        s => s.key,
        (f, s) => ({
          key: f.key,
          firstValue: f.value,
          secondValues: Array.from(s).map(v => v.value),
        }),
      )
      .toArray(),
    [
      { key: 1, firstValue: 5, secondValues: ['a', 'f'] },
      { key: 2, firstValue: 4, secondValues: ['b', 'g'] },
      { key: 3, firstValue: 3, secondValues: ['c', 'h'] },
      { key: 4, firstValue: 2, secondValues: ['d', 'i'] },
      { key: 5, firstValue: 1, secondValues: ['e'] },
    ],
  );
});

test(function itersect() {
  const orig = [1, 2, 3, 4, 5];
  assertEquals(Lazy.from(orig).intersect([1, 2, 3]).toArray(), [1, 2, 3]);
  assertEquals(Lazy.from(orig).intersect([2, 3, 4]).toArray(), [2, 3, 4]);
  assertEquals(Lazy.from(orig).intersect([3, 4, 5]).toArray(), [3, 4, 5]);
  assertEquals(Lazy.from(orig).intersect([1, 3, 5, 7, 9]).toArray(), [1, 3, 5]);
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

  assertEquals(
    Lazy.from(first)
      .join(
        second,
        v => v.key,
        v => v.k,
        (f, s) => ({ ky: f.key, value1: f.value1, value2: s.value2 }),
      )
      .toArray(),
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
  const orig = [2, 1, 5, 3, 4, 10, 20];
  assertEquals(
    Lazy.from(orig)
      .orderBy(v => v)
      .toArray(),
    [1, 10, 2, 20, 3, 4, 5],
  );
  assertEquals(
    Lazy.from(orig)
      .orderBy(
        v => v,
        (a, b) => a - b,
      )
      .toArray(),
    [1, 2, 3, 4, 5, 10, 20],
  );

  const objs = [
    { value: 2 },
    { value: 5 },
    { value: 15 },
    { value: 1 },
    { value: 3 },
    { value: 7 },
  ];
  assertEquals(
    Lazy.from(objs)
      .orderBy(v => v.value)
      .toArray(),
    [
      { value: 1 },
      { value: 15 },
      { value: 2 },
      { value: 3 },
      { value: 5 },
      { value: 7 },
    ],
  );

  assertEquals(
    Lazy.from([undefined, 1, 2, 35, undefined, 3, 4, undefined, 5])
      .orderBy(v => v)
      .toArray(),
    [1, 2, 3, 35, 4, 5, undefined, undefined, undefined],
  );
});

test(function orderByDecending() {
  const orig = [2, 1, 5, 3, 4, 10, 20];
  assertEquals(
    Lazy.from(orig)
      .orderByDecending(v => v)
      .toArray(),
    [5, 4, 3, 20, 2, 10, 1],
  );

  const objs = [
    { value: 2 },
    { value: 5 },
    { value: 15 },
    { value: 1 },
    { value: 3 },
    { value: 7 },
  ];
  assertEquals(
    Lazy.from(objs)
      .orderByDecending(v => v.value)
      .toArray(),
    [
      { value: 7 },
      { value: 5 },
      { value: 3 },
      { value: 2 },
      { value: 15 },
      { value: 1 },
    ],
  );

  assertEquals(
    Lazy.from([undefined, 1, 35, 2, undefined, 3, 4, undefined, 5])
      .orderByDecending(v => v)
      .toArray(),
    [5, 4, 35, 3, 2, 1, undefined, undefined, undefined],
  );
});

test(function orderNumericallyBy() {
  const orig = [2, 1, 5, 3, 4, 10, 20];
  assertEquals(
    Lazy.from(orig)
      .orderNumericallyBy(v => v)
      .toArray(),
    [1, 2, 3, 4, 5, 10, 20],
  );

  const objs = [
    { value: 2 },
    { value: 5 },
    { value: 15 },
    { value: 1 },
    { value: 3 },
    { value: 7 },
  ];
  assertEquals(
    Lazy.from(objs)
      .orderNumericallyBy(v => v.value)
      .toArray(),
    [
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 5 },
      { value: 7 },
      { value: 15 },
    ],
  );
});

test(function orderNumericallyByDecending() {
  const orig = [2, 1, 5, 3, 4, 10, 20];
  assertEquals(
    Lazy.from(orig)
      .orderNumericallyByDecending(v => v)
      .toArray(),
    [20, 10, 5, 4, 3, 2, 1],
  );

  const objs = [
    { value: 2 },
    { value: 5 },
    { value: 15 },
    { value: 1 },
    { value: 3 },
    { value: 7 },
  ];
  assertEquals(
    Lazy.from(objs)
      .orderNumericallyByDecending(v => v.value)
      .toArray(),
    [
      { value: 15 },
      { value: 7 },
      { value: 5 },
      { value: 3 },
      { value: 2 },
      { value: 1 },
    ],
  );
});

test(function prepend() {
  let orig = [1, 2, 3, 4];
  assertEquals(Lazy.from(orig).prepend(5).toArray(), [5, ...orig]);

  orig = [4, 3, 2, 1];
  assertEquals(Lazy.from(orig).prepend(-1).toArray(), [-1, ...orig]);

  orig = [9, 8, 7, 6, 5, 4, 3, 2, 1];
  assertEquals(Lazy.from(orig).prepend(0).toArray(), [0, ...orig]);
});

test(function reverse() {
  const orig = [1, 2, 3, 4, 5];
  assertEquals(Lazy.from(orig).reverse().toArray(), [5, 4, 3, 2, 1]);
  assertEquals(Lazy.from(orig).reverse().reverse().toArray(), orig);
});

test(function select() {
  let orig = [
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 4 },
    { value: 5 },
  ];
  assertEquals(
    Lazy.from(orig)
      .select(v => v.value)
      .toArray(),
    [1, 2, 3, 4, 5],
  );

  orig = [{ value: 5 }, { value: 4 }, { value: 3 }, { value: 2 }, { value: 1 }];
  assertEquals(
    Lazy.from(orig)
      .select((v, i) => ({ v: v.value, i }))
      .toArray(),
    [
      { v: 5, i: 0 },
      { v: 4, i: 1 },
      { v: 3, i: 2 },
      { v: 2, i: 3 },
      { v: 1, i: 4 },
    ],
  );
});

test(function selectMany() {
  let orig = [
    { value: [1] },
    { value: [2] },
    { value: [3] },
    { value: [4] },
    { value: [5] },
  ];
  assertEquals(
    Lazy.from(orig)
      .selectMany(v => v.value)
      .toArray(),
    [1, 2, 3, 4, 5],
  );

  orig = [
    { value: [5, 6] },
    { value: [4] },
    { value: [3] },
    { value: [2] },
    { value: [1] },
  ];
  assertEquals(
    Lazy.from(orig)
      .selectMany((v, i) => Lazy.from(v.value).select(v2 => ({ v: v2, i })))
      .toArray(),
    [
      { v: 5, i: 0 },
      { v: 6, i: 0 },
      { v: 4, i: 1 },
      { v: 3, i: 2 },
      { v: 2, i: 3 },
      { v: 1, i: 4 },
    ],
  );

  const arrarr = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];
  assertEquals(
    Lazy.from(arrarr)
      .selectMany(v => v)
      .toArray(),
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
  );
});

test(function skip() {
  const orig = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  assertEquals(Lazy.from(orig).skip(0).toArray(), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assertEquals(Lazy.from(orig).skip(1).toArray(), [2, 3, 4, 5, 6, 7, 8, 9]);
  assertEquals(Lazy.from(orig).skip(2).toArray(), [3, 4, 5, 6, 7, 8, 9]);
  assertEquals(Lazy.from(orig).skip(3).toArray(), [4, 5, 6, 7, 8, 9]);
  assertEquals(Lazy.from(orig).skip(4).toArray(), [5, 6, 7, 8, 9]);
  assertEquals(Lazy.from(orig).skip(5).toArray(), [6, 7, 8, 9]);
  assertEquals(Lazy.from(orig).skip(10).toArray(), []);
});

test(function skipLast() {
  const orig = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  assertEquals(Lazy.from(orig).skipLast(0).toArray(), [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
  ]);
  assertEquals(Lazy.from(orig).skipLast(1).toArray(), [1, 2, 3, 4, 5, 6, 7, 8]);
  assertEquals(Lazy.from(orig).skipLast(2).toArray(), [1, 2, 3, 4, 5, 6, 7]);
  assertEquals(Lazy.from(orig).skipLast(3).toArray(), [1, 2, 3, 4, 5, 6]);
  assertEquals(Lazy.from(orig).skipLast(4).toArray(), [1, 2, 3, 4, 5]);
  assertEquals(Lazy.from(orig).skipLast(5).toArray(), [1, 2, 3, 4]);
  assertEquals(Lazy.from(orig).skipLast(10).toArray(), []);
});

test(function skipWhile() {
  const orig = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  assertEquals(
    Lazy.from(orig)
      .skipWhile(v => v !== 1)
      .toArray(),
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
  );
  assertEquals(
    Lazy.from(orig)
      .skipWhile(v => v !== 2)
      .toArray(),
    [2, 3, 4, 5, 6, 7, 8, 9],
  );
  assertEquals(
    Lazy.from(orig)
      .skipWhile(v => v !== 3)
      .toArray(),
    [3, 4, 5, 6, 7, 8, 9],
  );
  assertEquals(
    Lazy.from(orig)
      .skipWhile(v => v !== 4)
      .toArray(),
    [4, 5, 6, 7, 8, 9],
  );
  assertEquals(
    Lazy.from(orig)
      .skipWhile(v => v !== 5)
      .toArray(),
    [5, 6, 7, 8, 9],
  );
  assertEquals(
    Lazy.from(orig)
      .skipWhile(v => v !== 6)
      .toArray(),
    [6, 7, 8, 9],
  );
  assertEquals(
    Lazy.from(orig)
      .skipWhile(v => v !== 10)
      .toArray(),
    [],
  );
});

test(function take() {
  const orig = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  assertEquals(Lazy.from(orig).take(-1).toArray(), []);
  assertEquals(Lazy.from(orig).take(0).toArray(), []);
  assertEquals(Lazy.from(orig).take(1).toArray(), [1]);
  assertEquals(Lazy.from(orig).take(2).toArray(), [1, 2]);
  assertEquals(Lazy.from(orig).take(3).toArray(), [1, 2, 3]);
  assertEquals(Lazy.from(orig).take(4).toArray(), [1, 2, 3, 4]);
  assertEquals(Lazy.from(orig).take(5).toArray(), [1, 2, 3, 4, 5]);
});

test(function takeLast() {
  const orig = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  assertEquals(Lazy.from(orig).takeLast(-1).toArray(), []);
  assertEquals(Lazy.from(orig).takeLast(0).toArray(), []);
  assertEquals(Lazy.from(orig).takeLast(1).toArray(), [9]);
  assertEquals(Lazy.from(orig).takeLast(2).toArray(), [8, 9]);
  assertEquals(Lazy.from(orig).takeLast(3).toArray(), [7, 8, 9]);
  assertEquals(Lazy.from(orig).takeLast(4).toArray(), [6, 7, 8, 9]);
  assertEquals(Lazy.from(orig).takeLast(5).toArray(), [5, 6, 7, 8, 9]);
});

test(function takeWhile() {
  const orig = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  assertEquals(
    Lazy.from(orig)
      .takeWhile(v => v !== 4)
      .toArray(),
    [1, 2, 3],
  );
  assertEquals(
    Lazy.from(orig)
      .takeWhile(v => v !== 5)
      .toArray(),
    [1, 2, 3, 4],
  );
  assertEquals(
    Lazy.from(orig)
      .takeWhile(v => v !== 6)
      .toArray(),
    [1, 2, 3, 4, 5],
  );
  assertEquals(
    Lazy.from(orig)
      .takeWhile(v => v !== 7)
      .toArray(),
    [1, 2, 3, 4, 5, 6],
  );
  assertEquals(
    Lazy.from(orig)
      .takeWhile(v => v !== 8)
      .toArray(),
    [1, 2, 3, 4, 5, 6, 7],
  );
  assertEquals(
    Lazy.from(orig)
      .takeWhile(v => v !== 9)
      .toArray(),
    [1, 2, 3, 4, 5, 6, 7, 8],
  );
  assertEquals(
    Lazy.from(orig)
      .takeWhile(() => false)
      .toArray(),
    [],
  );
});

test(function union() {
  assertEquals(Lazy.from([1, 2, 3]).union([3, 4, 5]).toArray(), [
    1,
    2,
    3,
    4,
    5,
  ]);
  assertEquals(Lazy.from([1, 2, 3]).union([2, 3, 4, 5]).toArray(), [
    1,
    2,
    3,
    4,
    5,
  ]);
  assertEquals(Lazy.from([1, 2, 3]).union([3, 3, 4, 5]).toArray(), [
    1,
    2,
    3,
    4,
    5,
  ]);
  assertEquals(Lazy.from([1, 2, 3, 2]).union([3, 4, 5]).toArray(), [
    1,
    2,
    3,
    4,
    5,
  ]);
});

test(function where() {
  assertEquals(
    Lazy.from([1, 2, 3, 4, 5])
      .where(v => v === 1)
      .toArray(),
    [1],
  );
  assertEquals(
    Lazy.from([1, 2, 3, 4, 5])
      .where(v => v === 2)
      .toArray(),
    [2],
  );
  assertEquals(
    Lazy.from([1, 2, 3, 4, 5])
      .where(v => v === 3)
      .toArray(),
    [3],
  );
  assertEquals(
    Lazy.from([1, 2, 3, 4, 5])
      .where(v => v % 2 === 0)
      .toArray(),
    [2, 4],
  );
  assertEquals(
    Lazy.from([
      { key: 1, value: 'a' },
      { key: 2, value: 'b' },
      { key: 3, value: 'c' },
      { key: 4, value: 'd' },
      { key: 5, value: 'e' },
    ])
      .where(v => v.value === 'a' || v.value === 'e')
      .toArray(),
    [
      { key: 1, value: 'a' },
      { key: 5, value: 'e' },
    ],
  );

  assertEquals(
    Lazy.from([1, 2, 3, 4, 5])
      .where((_, i) => i === 0)
      .toArray(),
    [1],
  );
  assertEquals(
    Lazy.from([1, 2, 3, 4, 5])
      .where((_, i) => i === 2)
      .toArray(),
    [3],
  );
  assertEquals(
    Lazy.from([1, 2, 3, 4, 5])
      .where((_, i) => i === 4)
      .toArray(),
    [5],
  );
  assertEquals(
    Lazy.from([1, 2, 3, 4, 5])
      .where((v, i) => v < i)
      .toArray(),
    [],
  );
  assertEquals(
    Lazy.from([1, 2, 3, 4, 5])
      .where((v, i) => v > i)
      .toArray(),
    [1, 2, 3, 4, 5],
  );

  assertEquals(
    Lazy.from([1, 2, 3, 4, 5])
      .where((v): v is 1 | 3 | 5 => v % 2 === 1)
      .toArray(),
    [1, 3, 5],
  );
  assertEquals(
    Lazy.from([1, 2, 3, 4, 5])
      .where((v): v is 2 | 4 => v % 2 === 0)
      .toArray(),
    [2, 4],
  );
});

test(function zip() {
  assertEquals(Lazy.from([1, 2, 3, 4]).zip([4, 3, 2, 1]).toArray(), [
    [1, 4],
    [2, 3],
    [3, 2],
    [4, 1],
  ]);
  assertEquals(Lazy.from([1, 2, 3, 4]).zip([4, 3, 2, 1, 0]).toArray(), [
    [1, 4],
    [2, 3],
    [3, 2],
    [4, 1],
  ]);
  assertEquals(Lazy.from([1, 2, 3, 4, 5]).zip([4, 3, 2, 1]).toArray(), [
    [1, 4],
    [2, 3],
    [3, 2],
    [4, 1],
  ]);
  assertEquals(Lazy.from([1, 2, 3, 4]).zip(['4', '3', '2', '1']).toArray(), [
    [1, '4'],
    [2, '3'],
    [3, '2'],
    [4, '1'],
  ]);

  assertEquals(
    Lazy.from([1, 2, 3, 4])
      .zip([4, 3, 2, 1], (first, second) => ({ first, second }))
      .toArray(),
    [
      { first: 1, second: 4 },
      { first: 2, second: 3 },
      { first: 3, second: 2 },
      { first: 4, second: 1 },
    ],
  );
  assertEquals(
    Lazy.from([1, 2, 3, 4])
      .zip([4, 3, 2, 1, 0], (first, second) => ({ first, second }))
      .toArray(),
    [
      { first: 1, second: 4 },
      { first: 2, second: 3 },
      { first: 3, second: 2 },
      { first: 4, second: 1 },
    ],
  );
  assertEquals(
    Lazy.from([1, 2, 3, 4, 5])
      .zip([4, 3, 2, 1], (first, second) => ({ first, second }))
      .toArray(),
    [
      { first: 1, second: 4 },
      { first: 2, second: 3 },
      { first: 3, second: 2 },
      { first: 4, second: 1 },
    ],
  );
});
