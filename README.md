# Lazy Iteration

[![Build Status](https://travis-ci.com/luvies/lazy.svg?branch=master)](https://travis-ci.com/luvies/lazy) ![Github Build Status](https://github.com/luvies/lazy/workflows/Node%2FDeno%20CI/badge.svg) [![npm version](https://badge.fury.io/js/%40luvies%2Flazy.svg)](https://badge.fury.io/js/%40luvies%2Flazy)

This module is meant to provide memory-efficient lazy-evaluation iteration for iterable objects. The aim of this project is to support deno, node and browser, and support all native JavaScript systems for iteration (for-of, for-await-of, etc).

## Contents

- [Installation](#installation)
  - [Deno](#deno)
  - [Node](#node)
- [Overview](#overview)
- [Examples](#examples)
- [Introp with native](#interop-with-native)
- [API](#api)
  - [Promises](#promises)
  - [No additional unexpected iteration](#no-additional-unexpected-iteration)
  - [Custom implementations](#custom-implementations)
  - [Compatibility](#compatibility)
  - [Shorthand usage](#shorthand-usage)
- [Setting up this project](#setting-up-this-project)
- [Footnotes](#footnotes)

## Installation

### Deno

Use the following import:

```ts
import { Lazy } from 'https://deno.land/x/lazy@v{version}/mod.ts';
```

Make sure the `@v{version}` tag is the correct one you want. I'd recommend against master, as it could change without notice & might be broken (although I will try not to break it).

### Node

The packge can be found here: https://www.npmjs.com/package/@luvies/lazy.

Install via

```
yarn add @luvies/lazy
```

or

```
npm install @luvies/lazy
```

Import using

```ts
import { Lazy } from '@luvies/lazy';
```

or

```js
const { Lazy } = require('@luvies/lazy');
```

## Overview

At a base level, this module provides the following exports:

```ts
abstract class Lazy<TElement> {...}

// These are provided to allow direct imports, but are just aliases over the static class methods.
function from<TElement>(iterable: Iterable<TElement>): Lazy<TElement>;
function empty<TElement>(): Lazy<TElement>;
function range(start: number, end?: number): Lazy<number>;
function repeat<TElement>(element: TElement, count?: number): Lazy<TElement>;
```

The `Lazy` class is the root of the module, all things come from it and are derived off it. To start using it, do something like the following:

```ts
// Static method import.
import { Lazy } from 'https://deno.land/x/lazy@v{version}/mod.ts';

const iterable = Lazy.from([1, 2, 3, 4, 5]);

// Direct function import.
import { from } from 'https://deno.land/x/lazy@v{version}/mod.ts';

const iterable = from([1, 2, 3, 4, 5]);
```

After you have done this, the full power of the module is available to play with.

## Examples

The aim of the module is to support the full suite of Linq methods the C# provides, as it covers a large surface area with the possible use-cases. Not only does it aim to provide them, it aims to act like them. Nothing is is executed until you call the iterator and start walking through the elements of the list. Here's a small example:

```ts
const evenSquares = Lazy.range(0, 1000)
  .where(i => i % 2 === 0)
  .select(i => i ** 2);
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

As with C# Linq, this statement will create a new iteratable object that only returns the first 10 elements of the original iterable object. And the order of composability is not limited, every single method that returns an iterator supports chaining with every other method. On top of this, this module supports the same linq aggregation functions that linq does, for example:

```ts
console.log(selectedEvenNumbers.sum()); // -> 1140
```

These functions allow you to deal with iterable objects at a high-level, hiding the fact that not all of the values might be available until the iteration is actually done. They also handle things like short-cuts, for example:

```ts
console.log(Lazy.range(0, 1000).any(i => i > 100)); // -> true
```

This function knows that as soon as the condition is fulfilled, it can stop iterating and hand back the result, saving time with iterating the entire list (which would be easy to forget otherwise).

A primary aim of this library is to allow complex transformations on large datasets without having to deal with the copying that JavaScript normally does, for example:

```ts
const data = getData(); // Could be a large list of datapoints.

// Native JS
const points = data
  .map(d => d.x)
  .filter(x => selectPoint(x))
  .map(x => adjustPoint(x));
const avg = points.reduce((prev, curr) => prev + curr) / points.length;

// Lazy iterators
const avg = Lazy.from(data)
  .select(d => d.x)
  .where(x => selectPoint(x))
  .select(x => adjustPoint(x))
  .average();
```

The native version will create 3 copies of the array, non of which are used beyond the last to calculate the final average, after which point it is also usless. In contrast, the lazy iterator will only apply the transformations/filters at the exact point they are needed, so no copies are done, and the built-in aggregation function allow for a nicer final calculation.

## Interop with native

While all of these functions are good, it would be difficult to integrate them without being about to easily convert back to native JS objects. Fortunately, this module provides just that. Currently there are 2 functions, `toArray` and `toMap`, which do pretty much exactly as they seem. You can end a lazy chain with one of these to make it resolve all of the iterators and output a native JS object, which can be then used in consuming code.

On top of this, the entire module is build upon the native JS iteration protocol, meaning that any object that implements that can be used with it with no other changes. Just drop the object into a `Lazy.from(...)` call, and everything will be available.

The `Lazy` class is also JSON-serialisable (as a list), meaning that you can simply pass the result of a chain into `JSON.stringify` and it will stringify correctly.

## API

Visit https://luvies.github.io/lazy/ for the full documentation.

For an overview of the reference I use for developing this module, visit the [.NET Linq docs](https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable).

As an aside, all of the functions exported from [aggregates.ts](lib/aggregates.ts) support taking in any object that implements the `Iterator<T>` iterface, so you can use them without wrapping the iterable around `Lazy` first if you so wish (although I'd recommend using them through `Lazy`).

### Promises

This module fully supports promises, and things like for-await-of. As an example (taken from the tests):

```ts
const list = [
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
  Promise.resolve(4),
  Promise.resolve(5),
];

for await (const element of Lazy.from(list)) {
  console.log(element);
}

/*
  Output:

  -> 1
  -> 2
  -> 3
  -> 4
  -> 5
*/
```

However, it also supports resolving all promises in the iterable to their values all at once, using the help of `Promise.all`:

```ts
const list = [
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
  Promise.resolve(4),
  Promise.resolve(5),
];

for (const element of (await Lazy.from(list).resolveAll()).select(
  i => i ** 2,
)) {
  console.log(element);
}

/*
  Output:

  -> 1
  -> 4
  -> 9
  -> 16
  -> 25
*/
```

For TypeScript users, the `resolveAll` function all also correctly determines the resulting object type, even if there is a mix of promises and non promises:

```ts
const list = [
  Promise.resolve(1),
  2
  Promise.resolve(3),
  4
  Promise.resolve(5),
]; // type -> Array<number | Promise<number>>

Lazy.from(list).resolveAll() // type -> Promise<Lazy<number>>
```

### 'No additional unexpected iteration'

For any function on `Lazy` that uses this term, it simply means 'if you start iteration on the resulting object, it will not perform any iteration you did not ask for'. To put it another way, when you call the iterator function, nothing will happen until you explicitly ask for the next element. This term is used since, for some functions, additional iteration is needed in order to perform the action required. An example of this would be the `reverse` method; you cannot iterate the first element of the result until you know what the last element of the underlying iterable is, so it has to iterate it completely first before returning the first element. In contrast, the `select` method will only iterate to the next element when you ask it to, thus it doesn't perform any additional unexpected iteration.

### Custom implementations

This module supports using your own lazy iterable implementations in the chain. This is because of the way all of the functions are implemented, which is that they return a new object that extends the `Lazy` class and only contains the exact properties needed to perform the iteration. This allows you to write a custom implementation that does something unique to the problem you need to solve, and then integrate it into the normal chain. Here is an example implementation:

```ts
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
const iterableToString = <TSource>(t: Iterable<TSource>) => new LazyToString(t);

const result = Lazy.from([1, 10, 100, 1000])
  .apply<LazyToString<number>, string>(iterableToString)
  .select(s => s.length)
  .toArray();

// result -> [1, 2, 3, 4]
```

Obviously this is a contrived example, since the same could be done with a single `select`, but you see the power that is available. You can make any custom implementation at all, and it will chain as if it was part of the API itself.

### Shorthand usage

If you are using `Lazy.from` a lot in your code, you can use the following snippet to make usage much more ergonomic:

```ts
declare global {
  interface Array<T> {
    /**
     * Returns the lazy iterator of the current array.
     */
    lazy: Lazy<T>;
  }
}

Object.defineProperty(Array.prototype, 'lazy', {
  get() {
    return Lazy.from(this);
  },
});
```

## Setting up this project

This project is written primarily for deno, with node support being done via a 2-step compilation process. In order to set up the project, you need to install [deno](https://github.com/denoland/deno) globally. To make editing work in VSCode, make sure that you do the following:

- Run `yarn` to install the dependencies that VSCode needs to edit properly
- Run `yarn init-types` to grab the types for the testing module
- Make sure that VSCode is using the local TypeScript version (bottom right of the editor while opening a `.ts` file)
- Adjust the [`tsconfig.json`](tsconfig.json) so that the `paths` are pointing to the right directory
  - They should point to the `$HOME/.deno/deps/http` and `$HOME/.deno/deps/https` directories
  - The path has to be relative due to a TS server limitation
  - _DO NOT COMMIT THIS CHANGE_, as it only applies to your setup and your setup only

### Compatibility

As mentioned before, this module is fully compatible with normal ES2015 iterators and native arrays/maps. It targets ES2015, meaning that if you need to support ES5 & earlier, you will need to use a transpiler like babel. For Node.js, it requires about v6 or higher (not properly tested on this version though).

## Footnotes

Massive thanks to the .NET Core team and their work on Linq, the source reference was invaluable when implementing some of the methods here.
