## PromiseCache

PromiseCache is a caching library designed to cache promises, enabling faster subsequent retrievals of data. If you put multiple promises with the same key, it will cache the first one and return that value for subsequent retrievals.

## Installation

You can install the library using npm or yarn:

```bash
npm i @ardrive/ardrive-promise-cache
```

```bash
yarn add @ardrive/ardrive-promise-cache
```

## Usage

Here's a simple example of how you can use `PromiseCache`:

```typescript
import { PromiseCache, CacheParams } from '@ardrive/ardrive-promise-cache';

const params: CacheParams = {
  cacheCapacity: 100,
  cacheTTL: 60000, // Time to live in milliseconds
};

const cache = new PromiseCache<string, number>(params);

// Storing a promise
const promise1 = new Promise<number>((resolve) => resolve(42));
const promise2 = new Promise<number>((resolve) => resolve(100));

cache.put('answer', promise1);
cache.put('answer', promise2);

// Retrieving a promise
const retrievedPromise = cache.get('answer'); // This will resolve with 42 and not 100 since the first promise was cached.
// eg usecase: caching network requests by parameters

// Removing a promise
cache.remove('answer');

// Clearing the cache
cache.clear();

// Getting the cache size
const size = cache.size();
```

## API

### `PromiseCache`

#### `constructor({ cacheCapacity, cacheTTL }: CacheParams)`

Creates a new `PromiseCache` instance with the specified capacity and time-to-live (TTL) for cached items.

#### `put(key: K, value: Promise<V>): Promise<V>`

Stores a promise with the specified key in the cache.

#### `get(key: K): Promise<V> | undefined`

Retrieves a promise from the cache using the specified key. Returns `undefined` if the key is not found.

#### `remove(key: K): void`

Removes a promise from the cache using the specified key.

#### `clear(): void`

Clears the entire cache.

#### `size(): number`

Returns the current number of items in the cache.

## Note

The method `cacheKeyString(key: K): string` is used internally to create cache keys. The default implementation may not sufficiently differentiate keys for certain object types, depending on their `toJSON` implementation. You may need to override this method if you encounter issues.

