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

export interface CacheParams {
  cacheCapacity: number;
  cacheTTL: number;
  enableMetrics?: boolean;
  metricsConfig?: CacheMetricsConfig;
}
export class PromiseCache<K, V> {
  private readonly cache: Cache<string, Promise<V>>;
  protected readonly metrics?: CacheMetrics;

  constructor({
    cacheCapacity,
    cacheTTL,
    enableMetrics = false,
    metricsConfig,
  }: CacheParams) {
    this.cache = EphemeralCache<string, Promise<V>>(cacheCapacity, cacheTTL);

    if (enableMetrics) {
      this.metrics = new CacheMetrics('promise_cache', metricsConfig);
    }
  }

  cacheKeyString(key: K): string {
    // Note: This implementation may not sufficiently differentiate keys
    // for certain object types depending on their toJSON implementation
    return typeof key === 'string' ? key : JSON.stringify(key);
  }

  put(key: K, value: Promise<V>): Promise<V> {
    this.cache.write(this.cacheKeyString(key), value);
    this.metrics?.recordPut();
    this.metrics?.updateSizeDeferred(() => this.cache.size());
    return value;
  }

  get(key: K): Promise<V> | undefined {
    const result = this.cache.read(this.cacheKeyString(key));
    if (result !== undefined) {
      this.metrics?.recordHit();
    } else {
      this.metrics?.recordMiss();
    }
    this.metrics?.updateSizeDeferred(() => this.cache.size());
    return result;
  }

  remove(key: K): void {
    this.cache.remove(this.cacheKeyString(key));
    this.metrics?.recordRemove();
    this.metrics?.updateSizeDeferred(() => this.cache.size());
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
