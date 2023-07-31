# simple-cache

[![npm](https://img.shields.io/npm/v/@alexsasharegan/simple-cache.svg?style=for-the-badge)](https://img.shields.io/npm/v/@alexsasharegan/simple-cache)
[![npm downloads](https://img.shields.io/npm/dt/@alexsasharegan/simple-cache.svg?style=for-the-badge)](https://www.npmjs.com/package/@alexsasharegan/simple-cache)
[![GitHub issues](https://img.shields.io/github/issues/alexsasharegan/simple-cache.svg?style=for-the-badge)](https://github.com/alexsasharegan/simple-cache/issues)
[![Travis](https://img.shields.io/travis/alexsasharegan/simple-cache.svg?style=for-the-badge)](https://github.com/alexsasharegan/simple-cache)
[![Coverage Status](https://img.shields.io/coveralls/github/alexsasharegan/simple-cache.svg?style=for-the-badge)](https://coveralls.io/github/alexsasharegan/simple-cache)
[![GitHub license](https://img.shields.io/github/license/alexsasharegan/simple-cache.svg?style=for-the-badge)](https://github.com/alexsasharegan/simple-cache/blob/master/LICENSE)

A basic key value store with bounded capacity for simple caching.

## Install

```sh
npm install @alexsasharegan/simple-cache
```

## Documentation

Visit the
[API Documentation here.](https://stupefied-wright-91ee33.netlify.com/)

Cache is an interface for caching key/value pairs of types `K`/`V`. It's primary
functionality includes:

-  `Cache.write`: write a value at a key
-  `Cache.read`: read a value from a key
-  `Cache.get`: read a value as an `Option<V>` (maybe type)
-  `Cache.remove`: remove a value by key
-  `Cache.clear`: empty the cache

## Usage

Creating a cache looks like this in plain JavaScript:

```js
// Creates a cache with a capacity of 10 items. The second parameter is the
// "type label". It serves as a convenience option for more meaningful
// `toString` behavior.
let userCache = SimpleCache(10, { key: "ID", value: "User" })
userCache.toString()
// SimpleCache<ID, User> { size: 0, capacity: 10 }
```

If you're using TypeScript, you need to create a cache by declaring the key and
value types as generic parameters:

```ts
interface User {
	id: number
	name: string
}

let userCache = SimpleCache<number, User>(10, { key: "ID", value: "User" })
userCache.toString()
// SimpleCache<ID, User> { size: 0, capacity: 10 }
```

Here are some examples of the five main interaction methods shown in REPL style.
If you're curious to learn more about the `Option` type returned from
`Cache.get`, visit the
[safe-types repository](https://github.com/alexsasharegan/safe-types).

```js
let userA = { name: "User A", id: 1 }
let userB = { name: "User B", id: 2 }

userCache.write(userA.id, userA)
userCache.write(userB.id, userB)
userCache.size()
// 2

userCache.read(1)
// { name: "User A", id: 1 }
userCache.read(2)
// { name: "User B", id: 2 }
userCache.get(2)
// Some<{ name: "User B", id: 2 }>
userCache.read(3)
// undefined
userCache.get(3)
// None

userCache.remove(1)
userCache.size()
// 1
userCache.read(1)
// undefined
userCache.clear()
userCache.size()
// 0
```

There is an Ephemeral Cache available. It caches items for a duration that's
given in milliseconds.

```ts
// Sets a capacity of 10 users and a max lifetime of 5 seconds
let userCache = EphemeralCache<number, User>(10, 5000, {
	key: "ID",
	value: "User",
})

userCache.write(1, { name: "Temp", id: 1 })

setTimeout(() => {
	userCache.read(1)
	// undefined
}, 5001)

userCache.read(1)
// { name: "Temp", id: 1 }
```
