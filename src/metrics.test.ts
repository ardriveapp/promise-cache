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

import { expect } from 'chai';
import { Registry, register } from 'prom-client';
import { PromiseCache, ReadThroughPromiseCache } from './index';
import { CacheMetrics } from './metrics';

describe('Metrics functionality', () => {
  let registry: Registry;

  beforeEach(() => {
    registry = new Registry();
  });

  afterEach(() => {
    // In case the global register is used, clear it after each test
    register.clear();
  });

  describe('PromiseCache with metrics', () => {
    it('should track cache hits and misses', async () => {
      const cache = new PromiseCache<string, string>({
        cacheCapacity: 10,
        cacheTTL: 60000,
        metricsConfig: {
          cacheId: 'test_cache',
          registry,
          prefix: 'test_prefix',
          labels: { test_label: 'test_value' },
        },
      });

      await cache.put('key1', Promise.resolve('value1'));

      // Should be a hit
      cache.get('key1');

      // Should be a miss
      cache.get('key2');

      const metrics = await registry.metrics();
      expect(metrics).to.include(
        'test_prefix_hits_total{cache_id="test_cache",test_label="test_value"} 1',
      );
      expect(metrics).to.include(
        'test_prefix_misses_total{cache_id="test_cache",test_label="test_value"} 1',
      );
    });

    it('should track put operations', async () => {
      const cache = new PromiseCache<string, string>({
        cacheCapacity: 10,
        cacheTTL: 60000,
        metricsConfig: {
          cacheId: 'test_cache',
          registry,
          prefix: 'test_prefix',
        },
      });

      await cache.put('key1', Promise.resolve('value1'));
      await cache.put('key2', Promise.resolve('value2'));

      const metrics = await registry.metrics();
      expect(metrics).to.include(
        'test_prefix_puts_total{cache_id="test_cache"} 2',
      );
    });

    it('should track cache size', async () => {
      const cache = new PromiseCache<string, string>({
        cacheCapacity: 10,
        cacheTTL: 60000,
        metricsConfig: { cacheId: 'test_cache', registry },
      });

      await cache.put('key1', Promise.resolve('value1'));
      await cache.put('key2', Promise.resolve('value2'));

      const metrics = await registry.metrics();
      expect(metrics).to.include('promise_cache_size{cache_id="test_cache"} 2');
    });

    it('should track remove operations', async () => {
      const cache = new PromiseCache<string, string>({
        cacheCapacity: 10,
        cacheTTL: 60000,
        metricsConfig: { cacheId: 'test_cache', registry },
      });

      await cache.put('key1', Promise.resolve('value1'));
      cache.remove('key1');

      const metrics = await registry.metrics();
      expect(metrics).to.include(
        'promise_cache_removes_total{cache_id="test_cache"} 1',
      );
    });

    it('should track clear operations', async () => {
      const cache = new PromiseCache<string, string>({
        cacheCapacity: 10,
        cacheTTL: 60000,
        metricsConfig: { cacheId: 'test_cache', registry },
      });

      await cache.put('key1', Promise.resolve('value1'));
      cache.clear();

      const metrics = await registry.metrics();
      expect(metrics).to.include(
        'promise_cache_clears_total{cache_id="test_cache"} 1',
      );
    });

    it('should track eviction operations when called directly', async () => {
      const cache = new PromiseCache<string, string>({
        cacheCapacity: 2,
        cacheTTL: 60000,
        metricsConfig: { cacheId: 'test_cache', registry },
      });

      const metrics = cache.getMetrics();
      metrics!.recordEviction();

      const metricsOutput = await registry.metrics();
      expect(metricsOutput).to.include(
        'promise_cache_evictions_total{cache_id="test_cache"} 1',
      );
    });

    it('should provide access to metrics objects', () => {
      const cache = new PromiseCache<string, string>({
        cacheCapacity: 10,
        cacheTTL: 60000,
        metricsConfig: { cacheId: 'test_cache', registry },
      });

      const metrics = cache.getMetrics();
      expect(metrics).to.not.be.undefined;

      const metricsObj = metrics!.getMetrics();
      expect(metricsObj.hits).to.not.be.undefined;
      expect(metricsObj.misses).to.not.be.undefined;
      expect(metricsObj.puts).to.not.be.undefined;
      expect(metricsObj.removes).to.not.be.undefined;
      expect(metricsObj.clears).to.not.be.undefined;
      expect(metricsObj.evictions).to.not.be.undefined;
      expect(metricsObj.size).to.not.be.undefined;
    });
  });

  describe('ReadThroughPromiseCache with metrics', () => {
    it('should track cache hits and misses', async () => {
      const cache = new ReadThroughPromiseCache<string, string>({
        cacheParams: { cacheCapacity: 10, cacheTTL: 60000 },
        readThroughFunction: async (key: string) => `value-${key}`,
        metricsConfig: {
          cacheId: 'test_cache',
          registry,
          prefix: 'test_rt_cache_1',
        },
      });

      // First access should be a miss
      await cache.get('key1');

      // Second access should be a hit
      await cache.get('key1');

      const metrics = await registry.metrics();
      expect(metrics).to.include(
        'test_rt_cache_1_hits_total{cache_id="test_cache"} 1',
      );
      expect(metrics).to.include(
        'test_rt_cache_1_misses_total{cache_id="test_cache"} 1',
      );
    });

    it('should remove failed promises from cache in getWithStatus', async () => {
      const cache = new ReadThroughPromiseCache<string, string>({
        cacheParams: { cacheCapacity: 10, cacheTTL: 60000 },
        readThroughFunction: async (key: string) => {
          if (key === 'fail') {
            throw new Error('Test error');
          }
          return `value-${key}`;
        },
        metricsConfig: {
          cacheId: 'test_cache',
          registry,
          prefix: 'test_rt_cache_3',
        },
      });

      try {
        await cache.getWithStatus('fail');
      } catch (error) {
        // Expected to fail
      }

      // The failed promise should be removed from cache
      expect(cache.size()).to.equal(0);
    });

    it('should not enable metrics with an undefined metricsConfig', async () => {
      const cache = new ReadThroughPromiseCache<string, string>({
        cacheParams: { cacheCapacity: 10, cacheTTL: 60000 },
        readThroughFunction: async (key: string) => `value-${key}`,
      });

      await cache.get('key1');

      const metrics = await register.metrics();
      expect(metrics).to.equal('\n');
    });

    it('should handle a minimally-provided metricsConfig', async () => {
      const cache = new ReadThroughPromiseCache<string, string>({
        cacheParams: { cacheCapacity: 10, cacheTTL: 60000 },
        readThroughFunction: async (key: string) => `value-${key}`,
        metricsConfig: { cacheId: 'test_cache' },
      });

      await cache.get('key1');

      const metrics = await register.metrics();
      expect(metrics).to.include(
        'promise_cache_misses_total{cache_id="test_cache"} 1',
      );
    });

    it('should handle undefined prefix in metricsConfig', async () => {
      const cache = new ReadThroughPromiseCache<string, string>({
        cacheParams: { cacheCapacity: 10, cacheTTL: 60000 },
        readThroughFunction: async (key: string) => `value-${key}`,
        metricsConfig: { cacheId: 'test_cache', registry },
      });

      await cache.get('key1');

      const metrics = await registry.metrics();
      expect(metrics).to.include(
        'promise_cache_misses_total{cache_id="test_cache"} 1',
      );
    });

    it('should handle a zero length prefix', async () => {
      const cache = new ReadThroughPromiseCache<string, string>({
        cacheParams: { cacheCapacity: 10, cacheTTL: 60000 },
        readThroughFunction: async (key: string) => `value-${key}`,
        metricsConfig: { cacheId: 'test_cache', prefix: '' },
      });

      await cache.get('key1');

      const metrics = await register.metrics();
      expect(metrics).to.include(
        'promise_cache_misses_total{cache_id="test_cache"} 1',
      );
    });

    it('should handle empty registry in metricsConfig', async () => {
      const cache = new ReadThroughPromiseCache<string, string>({
        cacheParams: { cacheCapacity: 10, cacheTTL: 60000 },
        readThroughFunction: async (key: string) => `value-${key}`,
        metricsConfig: {
          cacheId: 'test_cache',
          prefix: 'test_rt_cache_empty_registry',
        },
      });

      await cache.get('key1');

      const metrics = await register.metrics();
      expect(metrics).to.include(
        'test_rt_cache_empty_registry_misses_total{cache_id="test_cache"} 1',
      );
    });

    it('should provide access to metrics objects', () => {
      const cache = new ReadThroughPromiseCache<string, string>({
        cacheParams: { cacheCapacity: 10, cacheTTL: 60000 },
        readThroughFunction: async (key: string) => `value-${key}`,
        metricsConfig: {
          cacheId: 'test_cache',
          registry,
          prefix: 'test_rt_cache_metrics_obj',
        },
      });

      const metrics = cache.getMetrics();
      expect(metrics).to.not.be.undefined;
    });
  });

  describe('Metrics disabled by default', () => {
    it('should not create metrics when disabled', () => {
      const cache = new PromiseCache<string, string>({
        cacheCapacity: 10,
        cacheTTL: 60000,
      });

      const metrics = cache.getMetrics();
      expect(metrics).to.be.undefined;
    });
  });

  describe('CacheMetrics constructor', () => {
    it('should create metrics with default values', async () => {
      const cacheMetrics = new CacheMetrics({ cacheId: 'test_cache' });
      cacheMetrics.recordHit();
      const metrics = await register.metrics();
      expect(metrics).to.include(
        'promise_cache_hits_total{cache_id="test_cache"} 1',
      );
    });
  });
});
