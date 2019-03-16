#!/bin/bash
yarn prepare
deno --prefetch test/benchmarks/deno.ts

echo "=== node ==="
node test/benchmarks/node.js

echo "=== deno ==="
deno test/benchmarks/deno.ts
