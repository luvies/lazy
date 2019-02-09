import { assert, test } from 'https://deno.land/x/std@v0.2.8/testing/mod.ts';
import * as lazy from '../lib/mod.ts';

test(function append() {
  let orig = [1, 2, 3, 4];
  let iterable = lazy.from(orig).append(5);
  assert.equal([...iterable], [...orig, 5]);

  orig = [4, 3, 2, 1];
  iterable = lazy.from(orig).append(-1);
  assert.equal([...iterable], [...orig, -1]);

  orig = [9, 8, 7, 6, 5, 4, 3, 2, 1];
  iterable = lazy.from(orig).append(0);
  assert.equal([...iterable], [...orig, 0]);
});

test(function concat() {
  let first = [1, 2, 3, 4];
  let second = [5, 6, 7, 8];
  let iterable = lazy.from(first).concat(second);
  assert.equal([...iterable], [...first, ...second]);

  first = [9, 8, 7, 6];
  second = [1, 2, 3, 4];
  iterable = lazy.from(first).concat(second);
  assert.equal([...iterable], [...first, ...second]);
});

test(function select() {
  const orig = [
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 4 },
    { value: 5 },
  ];
  const iterable = lazy.from(orig).select(v => v.value);
  assert.equal([...iterable], [1, 2, 3, 4, 5]);
});
