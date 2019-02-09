import { assert, test } from 'https://deno.land/x/std@v0.2.8/testing/mod.ts';
import * as lazy from '../lib/mod.ts';

test(function from() {
  const orig = [1, 2, 3, 4, 5];
  const iterable = lazy.from(orig);
  assert.equal([...iterable], orig);
});

test(function range() {
  let iterable = lazy.range(0, 5);
  assert.equal([...iterable], [0, 1, 2, 3, 4]);

  iterable = lazy.range(0, 0);
  assert.equal([...iterable], []);

  iterable = lazy.range(0, 1);
  assert.equal([...iterable], [0]);

  iterable = lazy.range(1, 0);
  assert.equal([...iterable], [1]);

  iterable = lazy.range(5, 0);
  assert.equal([...iterable], [5, 4, 3, 2, 1]);
});
