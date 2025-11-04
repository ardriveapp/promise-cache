/**
 * Copyright (C) 2022-2024 Permanent Data Solutions, Inc. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Cache, EphemeralCache } from '@alexsasharegan/simple-cache';
import { CacheMetrics, CacheMetricsConfig } from './metrics';

export type CacheParams =
  | {
      cacheCapacity: number;
      /** Time-to-live in milliseconds (deprecated, use cacheTTLMillis instead) */
      cacheTTL: number;
      cacheTTLMillis?: never;
      metricsConfig?: CacheMetricsConfig;
    }
  | {
      cacheCapacity: number;
      cacheTTL?: never;
      /** Time-to-live in milliseconds */
      cacheTTLMillis: number;
      metricsConfig?: CacheMetricsConfig;
    };
export class PromiseCache<K, V> {
  private readonly cache: Cache<string, Promise<V>>;
  protected readonly metrics?: CacheMetrics;
  protected readonly cacheCapacity: number;

  constructor({
    cacheCapacity,
    cacheTTL,
    cacheTTLMillis,
    metricsConfig,
  }: CacheParams) {
    this.cache = EphemeralCache<string, Promise<V>>(
      cacheCapacity,
      cacheTTLMillis ?? cacheTTL,
    );
    this.cacheCapacity = cacheCapacity;

    if (metricsConfig !== undefined) {
      this.metrics = new CacheMetrics(metricsConfig);
    }
  }

  cacheKeyString(key: K): string {
    // Note: This implementation may not sufficiently differentiate keys
    // for certain object types depending on their toJSON implementation
    return typeof key === 'string' ? key : JSON.stringify(key);
  }

  put(key: K, value: Promise<V>): Promise<V> {
    const preWriteSize = this.cache.size();
    this.cache.write(this.cacheKeyString(key), value);
    this.metrics?.recordPut();
    this.metrics?.updateSizeDeferred(() => {
      const postWriteSize = this.cache.size();
      const evictions = preWriteSize - postWriteSize + 1;
      if (evictions > 0 && this.metrics) {
        this.metrics.recordEvictions(evictions);
      }
      return postWriteSize;
    });
    return value;
  }

  get(key: K): Promise<V> | undefined {
    const preReadSize = this.cache.size();
    const result = this.cache.read(this.cacheKeyString(key));
    if (result !== undefined) {
      this.metrics?.recordHit();
    } else {
      this.metrics?.recordMiss();
    }
    this.metrics?.updateSizeDeferred(() => {
      const postReadSize = this.cache.size();
      const evictions = preReadSize - postReadSize;
      if (evictions > 0 && this.metrics) {
        this.metrics.recordEvictions(evictions);
      }
      return postReadSize;
    });
    return result;
  }

  remove(key: K): void {
    this.cache.remove(this.cacheKeyString(key));
    this.metrics?.recordRemove();
    // Purges are not handled during removals so no need to defer size update
    this.metrics?.updateSize(this.cache.size());
  }

  clear(): void {
    this.cache.clear();
    this.metrics?.recordClear();
    this.metrics?.updateSize(0);
  }

  size(): number {
    return this.cache.size();
  }

  getMetrics(): CacheMetrics | undefined {
    return this.metrics;
  }
}
