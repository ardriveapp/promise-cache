## @ardrive/ardrive-promise-cache

`@ardrive/ardrive-promise-cache` is a caching library designed to cache promises, enabling faster subsequent retrievals of data. It includes two types of caching implementations:

- [PromiseCache](#promisecache) - a simple cache that stores promises in memory
- [ReadThroughPromiseCache](#readthroughpromisecache) - a wrapper of `PromiseCache` that allows providing an async `readThroughFunction` that is called when the cache does contain the requested key

## Installation

You can install the library using npm or yarn:

```bash
npm i @ardrive/ardrive-promise-cache
```

```bash
yarn add @ardrive/ardrive-promise-cache
```

## Usage

### PromiseCache

#### Example

```typescript
import { PromiseCache, CacheParams } from '@ardrive/ardrive-promise-cache';

const params: CacheParams = {
  cacheCapacity: 100,
  cacheTTL: 60_000, // cache for 1 minute
};

const cache = new PromiseCache<string, number>(params);

// Storing a promise
const promise1 = new Promise<number>((resolve) => resolve(42));

cache.put('answer', promise1);

// resolves to 42
await cache.get('answer');

const promise2 = new Promise<number>((resolve) => resolve(100));

// overwrite existing cached promise
cache.put('answer', promise2);

// resolves to 100
await cache.get('answer');

// removes the promise from the cache
cache.remove('answer');

// resolves to undefined as no longer exists in the cache
await cache.get('answer');

// clear the cache
cache.clear();

// Getting the cache size
const size = cache.size();
```

#### API

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

---

### ReadThroughPromiseCache

#### Example

```typescript
import { ReadThroughPromiseCache, CacheParams } from '@ardrive/ardrive-promise-cache';

const params: CacheParams = {
  cacheCapacity: 100,
  cacheTTL: 60_000, // cache for 1 minute
};

const readThroughCacheParams: ReadThroughPromiseCacheParams<string,AxiosResponse> = {
  cacheParams: params,
  readThroughFunction: async (key: K) => {
    // This function will be called when the cache does not contain the requested key.
    // It should return a promise that resolves with the value to cache.
    return axios.get(`https://example.com/api/${key}`);
  }
};

// create ReadThroughPromiseCache with capacity of 100 and TTL of 1 minute, and readThroughFunction to call API function
const readThroughCache = new ReadThroughPromiseCache<string, AxiosResponse>(readThroughCacheParams);

// caches new key and resulting axios promise (https://example.com/api/example) for 1 minute
const { status, data } = await readThroughCache.get('example')

// the cached axios promise will be returned
const { status: cachedStatus, data: cacheData } = await readThroughCache.get('example')

// wait 1 minute
await new Promise((res) => setTimeout(() => res, 60_000);

// 'example' key has expired, so readThroughFunction will be called again and new promise will be returned
const { status: refreshedStatus, data:refreshedData } = await readThroughCache.get('example')
```

### API

#### `constructor({ cacheParams: { cacheCapacity, cacheTTL }, readThroughFunction: (key: string) => Promise<V>: ReadThroughPromiseCacheParams)`

Creates a new `ReadThroughPromiseCache` instance with the specified capacity and time-to-live (TTL) for cached items and `readThroughFunction` that will be called when the cache does not contain the key.

## Note

The method `cacheKeyString(key: K): string` is used internally to create cache keys. The default implementation may not sufficiently differentiate keys for certain object types, depending on their `toJSON` implementation. You may need to override this method if you encounter issues.
