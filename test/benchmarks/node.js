const { Lazy } = require('../../dist/mod');
const { performance } = require('perf_hooks');

const arr = Lazy.range(0, 10000).toArray();

function bench(fn, iters = 10000) {
  // Run the function a few times to get JIT opts done.
  for (const _ of Lazy.range(0, 1000)) {
    fn();
  }

  const benches = [];

  for (const _ of Lazy.range(0, iters)) {
    const start = performance.now();

    fn();

    const end = performance.now() - start;

    benches.push(end);
  }

  return Lazy.from(benches).average();
}

let result;

function bench_map() {
  result = arr
    .map(i => i * 2)
    .map(i => i / 2)
    .map(i => i * 2)
    .map(i => i / 2)
    .map(i => i * 2)
    .map(i => i / 2)
    .map(i => i * 2)
    .map(i => i / 2);
}

function bench_map_loop() {
  result = arr
    .map(i => i * 2)
    .map(i => i / 2)
    .map(i => i * 2)
    .map(i => i / 2)
    .map(i => i * 2)
    .map(i => i / 2)
    .map(i => i * 2)
    .map(i => i / 2);

  let i;
  for (const v of result) {
    i = v;
  }
}

function bench_select() {
  result = Lazy.from(arr)
    .select(i => i * 2)
    .select(i => i / 2)
    .select(i => i * 2)
    .select(i => i / 2)
    .select(i => i * 2)
    .select(i => i / 2)
    .select(i => i * 2)
    .select(i => i / 2)
    .toArray();
}

function bench_select_loop() {
  result = Lazy.from(arr)
    .select(i => i * 2)
    .select(i => i / 2)
    .select(i => i * 2)
    .select(i => i / 2)
    .select(i => i * 2)
    .select(i => i / 2)
    .select(i => i * 2)
    .select(i => i / 2);

  let i;
  for (const v of result) {
    i = v;
  }
}

console.log(`Map benchmark: ${bench(bench_map)}ms`);
console.log(`Map for-of benchmark: ${bench(bench_map_loop)}ms`);
console.log(`Select benchmarks: ${bench(bench_select)}ms`);
console.log(`Select for-of benchmark: ${bench(bench_select_loop)}ms`);
