# Lazy Iteration
This module is meant to provide memory-efficient lazy-enumeration/iteration for iterable objects. The aim of this project is to support browser, node and deno, and support all native JavaScript systems for iteration (for-of, for-await-of, etc).

## Overview
At a base level, this module provides the following exports:

```ts
abstract class Lazy<TElement> {...}

function from<TElement>(iterable: Iterable<TElement>): Lazy<TElement>;
function empty<TElement>(): Lazy<TElement>;
function range(start: number, end: number): Lazy<number>;
function repeat<TElement>(value: TElement, count: number): Lazy<TElement>;
```

The `Lazy` class is the root of the module, all things come from it and are derived off it, but it doesn't provide iteration by itself. In order to start using the module, you need to do something like the following:

```ts
import lazy from '@luvies/lazy';

const iterable = lazy.from([1, 2, 3, 4, 5]);
```

After you have done this, the full power of the module is available to play with.

## Examples
The aim of the modules is to support the full suite of Linq methods the C# provides, as it covers a large surface area with the possible use-cases. Not only does it aim to provide them, it aims to act like them. Nothing is is executed until you call the iterator and start walking through the items of the list. Here's a small example:

```ts
const evenSquares = lazy.range(0, 1000).where(i => i % 2 === 0).select(i => i ** 2);
```

The result of this chain is an iterator object, however nothing has actually happened yet. As with linq, things only happen exactly when you ask for it:

```ts
for (const num of evenSquares) {
  console.log(num); // 0, 4, 16, 36, 64, 100, 144...
}
```

A huge part of what makes linq so powerful is its composability, which this module provides at a base level:

```ts
const selectedEvenNumbers = evenNumbers.take(10);
```

As with C# Linq, this statement will create a new iteratable object that only returns the first 10 items of the original iterable object. And the order of composability is not limited, every single method that returns an iterator supports chaining with every other method. On top of this, this module supports the same linq aggregation functions that linq does, for example:

```ts
console.log(selectedEvenNumbers.sum()); // -> 1140
```

These functions allow you to deal with iterable objects at a high-level, hiding the fact that not all of the values might be available until the iteration is actually done. They also handle things like short-cuts, for example:

```ts
console.log(lazy.range(0, 1000).any(i => i > 100)) // -> true
```

This function knows that as soon as the condition is fulfilled, it can stop iterating and hand back the result, saving time with iterating the entire list (which would be easy to forget otherwise).

The main benefit of this library is to allow complex transformations on large datasets without having to deal with the copying that JavaScript normally does, for example:

```ts
const data = getData(); // Could be a large list of datapoints.

// Native JS
const points = data.map(d => d.x).filter(x => selectPoint(x)).map(x => adjustPoint(x));
const avg = points.reduce((prev, curr) => prev + curr) / points.length;

// Lazy iterators
const avg = lazy.from(data).select(d => d.x).where(x => selectPoint(x)).select(x => adjustPoint(x)).avg();
```

The native version will create 3 copies of the array, non of which are used beyond the last to calculate the final average, after which point it is also usless. In contrast, the lazy iterator will only apply the transformations/filters at the exact point they are needed, so no copies are done, and the built-in aggregation functions allow for a number nicer final calculation.

## Interop with native
While all of these functions are good, it would be difficult to integrate them without being about to easily convert back to native JS objects. Fortunately, this module provides just that. Currently there are 2 functions, `toArray` and `toMap`, which do pretty much exactly as they seem. You can end a lazy chain with one of these to make it resolve all of the iterators and output a native JS object, which can be then used in consuming code.

On top of this, the entire module is build upon the native JS iteration protocol, meaning that any object that implements that can be used with it with no other changes. Just drop the object into a `lazy.from(...)` call, and everything will be available.

## API
For a full overview of the API, please refer to [mod.ts](lib/mod.ts) for the initial iterator functions, and [iterators.ts](lib/iterators.ts) for the complete API surface that is available. Only the `Lazy` class at the top matters for consuming code, and it is fully documented.

For an overview of the reference I use for developing this module, visit the [.NET Linq docs](https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable).

# Footnotes
Massive thanks to the .NET Core team and their work on Linq, the source reference was invaluable when implementing some of the methods here.
