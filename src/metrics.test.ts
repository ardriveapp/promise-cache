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
import { Counter, Registry, register } from 'prom-client';
import { PromiseCache, ReadThroughPromiseCache } from './index';
import { CacheMetrics } from './metrics';

describe('Metrics functionality', () => {
  let registry: Registry;

  beforeEach(() => {
    registry = new Registry();

    // In case the global register is used, clear it before each test
    register.clear();
  });

  describe('PromiseCache with metrics', () => {
    it('should track cache hits and misses', async () => {
      const cache = new PromiseCache<string, string>({
        cacheCapacity: 10,
        cacheTTL: 60000,
        metricsConfig: {
          registry,
          cacheName: 'test_cache',
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
        'promise_cache_reads_total{cache_name="test_cache",test_label="test_value",result="hit"} 1',
      );
      expect(metrics).to.include(
        'promise_cache_reads_total{cache_name="test_cache",test_label="test_value",result="miss"} 1',
      );
    });

    it('should track put operations', async () => {
      const cache = new PromiseCache<string, string>({
        cacheCapacity: 10,
        cacheTTL: 60000,
        metricsConfig: { registry, cacheName: 'test_cache' },
      });

      await cache.put('key1', Promise.resolve('value1'));
      await cache.put('key2', Promise.resolve('value2'));

      const metrics = await registry.metrics();
      expect(metrics).to.include(
        'promise_cache_writes_total{cache_name="test_cache",op="put"} 2',
      );
    });

    it('should track cache size', async () => {
      const cache = new PromiseCache<string, string>({
        cacheCapacity: 10,
        cacheTTL: 60000,
        metricsConfig: { registry, cacheName: 'test_cache' },
      });

      await cache.put('key1', Promise.resolve('value1'));
      await cache.put('key2', Promise.resolve('value2'));

      const metrics = await registry.metrics();
      expect(metrics).to.include(
        'promise_cache_size{cache_name="test_cache"} 2',
      );
    });

    it('should track remove operations', async () => {
      const cache = new PromiseCache<string, string>({
        cacheCapacity: 10,
        cacheTTL: 60000,
        metricsConfig: { registry, cacheName: 'test_cache' },
      });

      await cache.put('key1', Promise.resolve('value1'));
      cache.remove('key1');

      const metrics = await registry.metrics();
      expect(metrics).to.include(
        'promise_cache_writes_total{cache_name="test_cache",op="put"} 1',
      );
      expect(metrics).to.include(
        'promise_cache_writes_total{cache_name="test_cache",op="remove"} 1',
      );
    });

    it('should track clear operations', async () => {
      const cache = new PromiseCache<string, string>({
        cacheCapacity: 10,
        cacheTTL: 60000,
        metricsConfig: { registry, cacheName: 'test_cache' },
      });

      await cache.put('key1', Promise.resolve('value1'));
      cache.clear();

      const metrics = await registry.metrics();
      expect(metrics).to.include(
        'promise_cache_writes_total{cache_name="test_cache",op="put"} 1',
      );
      expect(metrics).to.include(
        'promise_cache_writes_total{cache_name="test_cache",op="clear"} 1',
      );
    });

    it('should track eviction operations when called directly', async () => {
      const cache = new PromiseCache<string, string>({
        cacheCapacity: 2,
        cacheTTL: 60000,
        metricsConfig: { registry, cacheName: 'test_cache' },
      });

      const metrics = cache.getMetrics();
      metrics!.recordEvictions();

      const metricsOutput = await registry.metrics();
      expect(metricsOutput).to.include(
        'promise_cache_evictions_total{cache_name="test_cache"} 1',
      );
    });

    it('should provide access to metrics objects', () => {
      const cache = new PromiseCache<string, string>({
        cacheCapacity: 10,
        cacheTTL: 60000,
        metricsConfig: { registry, cacheName: 'test_cache' },
      });

      const metrics = cache.getMetrics();
      expect(metrics).to.not.be.undefined;

      const metricsObj = metrics!.getMetrics();
      expect(metricsObj.readCounter).to.not.be.undefined;
      expect(metricsObj.writeCounter).to.not.be.undefined;
      expect(metricsObj.evictionCounter).to.not.be.undefined;
      expect(metricsObj.sizeGauge).to.not.be.undefined;
    });

    it('should record evictions due to ttls on put', async () => {
      const cache = new PromiseCache<string, string>({
        cacheCapacity: 2,
        cacheTTL: 10, // 10 milliseconds TTL
        metricsConfig: { registry, cacheName: 'test_eviction_cache' },
      });

      await cache.put('key1', Promise.resolve('value1'));

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 11));

      // Any read or write action will trigger a deferred eviction
      await cache.put('key2', Promise.resolve('value2'));

      // Move to next tick to allow eviction to be processed
      await new Promise(process.nextTick);

      const metrics = await registry.metrics();

      // Control for race conditions by parsing the eviction total and asserting the minimum expected
      const evictionCount = +(
        metrics.match(/promise_cache_evictions_total.+ (\d+)/)?.[1] ?? 0
      );
      expect(evictionCount).to.be.at.least(1);
    });

    it('should record evictions due to ttls on get', async () => {
      const cache = new PromiseCache<string, string>({
        cacheCapacity: 2,
        cacheTTL: 10, // 10 milliseconds TTL
        metricsConfig: { registry, cacheName: 'test_eviction_cache' },
      });

      await cache.put('key1', Promise.resolve('value1'));

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 11));

      // Any read or write action will trigger a deferred eviction
      await cache.get('key1');

      // Move to next tick to allow eviction to be processed
      await new Promise(process.nextTick);

      const metrics = await registry.metrics();

      // Control for race conditions by parsing the eviction total and asserting the minimum expected
      const evictionCount = +(
        metrics.match(/promise_cache_evictions_total.+ (\d+)/)?.[1] ?? 0
      );
      expect(evictionCount).to.be.at.least(1);
    });
  });

  describe('ReadThroughPromiseCache with metrics', () => {
    it('should track cache hits and misses', async () => {
      const cache = new ReadThroughPromiseCache<string, string>({
        cacheParams: { cacheCapacity: 10, cacheTTL: 60000 },
        readThroughFunction: async (key: string) => `value-${key}`,
        metricsConfig: { registry, cacheName: 'test_rt_cache_1' },
      });

      // First access should be a miss
      await cache.get('key1');

      // Second access should be a hit
      await cache.get('key1');

      const metrics = await registry.metrics();
      expect(metrics).to.include(
        'promise_cache_reads_total{cache_name="test_rt_cache_1",result="hit"} 1',
      );
      expect(metrics).to.include(
        'promise_cache_reads_total{cache_name="test_rt_cache_1",result="miss"} 1',
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
        metricsConfig: { registry, cacheName: 'test_rt_cache_3' },
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const cache = new ReadThroughPromiseCache<string, string>({
        cacheParams: { cacheCapacity: 10, cacheTTL: 60000 },
        readThroughFunction: async (key: string) => `value-${key}`,
        metricsConfig: { cacheName: 'test_cache' },
      });

      const metrics = await register.metrics();
      expect(metrics).to.include(
        'promise_cache_reads_total{cache_name="test_cache",result="hit"} 0',
      );
    });

    it('should default to label "unknown_cache" for a zero length cache name', async () => {
      const cache = new ReadThroughPromiseCache<string, string>({
        cacheParams: { cacheCapacity: 10, cacheTTL: 60000 },
        readThroughFunction: async (key: string) => `value-${key}`,
        metricsConfig: { cacheName: '' },
      });

      await cache.get('key1');

      const metrics = await register.metrics();
      expect(metrics).to.include(
        'promise_cache_reads_total{cache_name="unknown_cache",result="miss"} 1',
      );
    });

    it('should handle empty registry in metricsConfig', async () => {
      const cache = new ReadThroughPromiseCache<string, string>({
        cacheParams: { cacheCapacity: 10, cacheTTL: 60000 },
        readThroughFunction: async (key: string) => `value-${key}`,
        metricsConfig: { cacheName: 'test_rt_cache_empty_registry' },
      });

      await cache.get('key1');

      const metrics = await register.metrics();
      expect(metrics).to.include(
        'promise_cache_reads_total{cache_name="test_rt_cache_empty_registry",result="miss"} 1',
      );
    });

    it('should provide access to metrics objects', () => {
      const cache = new ReadThroughPromiseCache<string, string>({
        cacheParams: { cacheCapacity: 10, cacheTTL: 60000 },
        readThroughFunction: async (key: string) => `value-${key}`,
        metricsConfig: { registry, cacheName: 'test_rt_cache_metrics_obj' },
      });

      const metrics = cache.getMetrics();
      expect(metrics).to.not.be.undefined;
    });

    it('should record evictions', async () => {
      const cache = new ReadThroughPromiseCache<string, string>({
        cacheParams: { cacheCapacity: 2, cacheTTL: 60000 },
        readThroughFunction: async (key: string) => `value-${key}`,
        metricsConfig: { registry, cacheName: 'test_rt_cache_eviction' },
      });

      await cache.get('key1');
      await cache.get('key2');
      await cache.get('key3'); // This should cause an eviction

      const metrics = await registry.metrics();
      expect(metrics).to.include(
        'promise_cache_evictions_total{cache_name="test_rt_cache_eviction"} 1',
      );
    });

    it('should not record an eviction when at capacity if existing key is updated', async () => {
      const cache = new ReadThroughPromiseCache<string, string>({
        cacheParams: { cacheCapacity: 2, cacheTTL: 60000 },
        readThroughFunction: async (key: string) => `value-${key}`,
        metricsConfig: { registry, cacheName: 'test_rt_cache_no_eviction' },
      });

      await cache.get('key1');
      await cache.get('key2');
      await cache.get('key1'); // This should not cause an eviction

      const metrics = await registry.metrics();
      expect(metrics).to.include(
        'promise_cache_evictions_total{cache_name="test_rt_cache_no_eviction"} 0',
      );
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
      const cacheMetrics = new CacheMetrics({ cacheName: 'test_cache' });
      cacheMetrics.recordHit();
      const metrics = await register.metrics();
      expect(metrics).to.include(
        'promise_cache_reads_total{cache_name="test_cache",result="hit"} 1',
      );
    });

    it('should add metrics to a registry with unrelated existing metrics without removing them', async () => {
      const cacheMetrics = new CacheMetrics({ cacheName: 'test_cache' });
      cacheMetrics.recordHit();

      const unrelatedCounter = new Counter({
        name: 'unrelated_metric_total',
        help: 'An unrelated metric',
        labelNames: ['label1'],
        registers: [register],
      });
      unrelatedCounter.inc({ label1: 'value1' }, 1);

      const metrics = await register.metrics();
      expect(metrics).to.include(
        'promise_cache_reads_total{cache_name="test_cache",result="hit"} 1',
      );
      expect(metrics).to.include('unrelated_metric_total{label1="value1"} 1');
    });
  });
});
