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

import { Counter, Gauge, Registry, register } from 'prom-client';

// Resulting metrics will be of the form:
// <prefix ?? "promise_cache">_<metric name>{cache_id=<cacheId>, <label name 1>=<label value 1>, ..., <label name N>=<label value N>} <metric value>
export interface CacheMetricsConfig {
  cacheName: string;
  registry?: Registry;
  labels?: Record<string, string>;
}

export type MetricsGroup = {
  readCounter: Counter<string>;
  writeCounter: Counter<string>;
  evictionCounter: Counter<string>;
  sizeGauge: Gauge<string>;
};

const registryToMetrics = new WeakMap<Registry, MetricsGroup>();

export class CacheMetrics {
  private readonly cacheName: string;
  private readonly defaultLabels: Record<string, string>;
  private readonly registry: Registry;

  constructor(config: CacheMetricsConfig) {
    this.cacheName = config.cacheName || 'unknown_cache';
    this.registry = config.registry || register;

    // Lazily initialize metrics for the registry. Cache name will be a label (cache_name) on each metric.
    this.defaultLabels = { cache_name: this.cacheName, ...config.labels };
    if (
      !registryToMetrics.has(this.registry) ||
      // Handle case where registry seems to be missing expected metrics
      !this.registry
        .getMetricsAsArray()
        .some((metric) => metric.name.startsWith('promise_cache_'))
    ) {
      registryToMetrics.set(this.registry, {
        readCounter: createCounter({
          name: `promise_cache_reads_total`,
          help: 'Number of cache reads with label for result type (hit/miss)',
          labels: {
            ...this.defaultLabels,
            result: 'hit', // Default to hit, will be updated later
          },
          registry: this.registry,
        }),
        writeCounter: createCounter({
          name: `promise_cache_writes_total`,
          help: 'Number of cache write operations with label for operation type (put/remove/clear)',
          labels: {
            ...this.defaultLabels,
            op: 'put', // Default to put, will be updated later
          },
          registry: this.registry,
        }),
        evictionCounter: createCounter({
          name: `promise_cache_evictions_total`,
          help: 'Number of cache evictions due to TTL or capacity',
          labels: this.defaultLabels,
          registry: this.registry,
        }),
        sizeGauge: createGauge({
          name: `promise_cache_size`,
          help: 'Current number of items in cache',
          labels: this.defaultLabels,
          registry: this.registry,
        }),
      });
    }
  }

  recordHit(): void {
    registryToMetrics.get(this.registry)?.readCounter.inc({
      ...this.defaultLabels,
      result: 'hit',
    });
  }

  recordMiss(): void {
    registryToMetrics.get(this.registry)?.readCounter.inc({
      ...this.defaultLabels,
      result: 'miss',
    });
  }

  recordPut(): void {
    registryToMetrics.get(this.registry)?.writeCounter.inc({
      ...this.defaultLabels,
      op: 'put',
    });
  }

  recordRemove(): void {
    registryToMetrics.get(this.registry)?.writeCounter.inc({
      ...this.defaultLabels,
      op: 'remove',
    });
  }

  recordClear(): void {
    registryToMetrics.get(this.registry)?.writeCounter.inc({
      ...this.defaultLabels,
      op: 'clear',
    });
  }

  recordEvictions(count: number = 1): void {
    registryToMetrics
      .get(this.registry)
      ?.evictionCounter.inc(this.defaultLabels, count);
  }

  updateSize(size: number): void {
    registryToMetrics
      .get(this.registry)
      ?.sizeGauge.set(this.defaultLabels, size);
  }

  updateSizeDeferred(getSizeCallback: () => number): void {
    // Defers the size update to the next tick to allow for any pending purges to complete
    Promise.resolve().then(() => {
      registryToMetrics
        .get(this.registry)
        ?.sizeGauge.set(this.defaultLabels, getSizeCallback());
    });
  }

  getMetrics(): MetricsGroup {
    return registryToMetrics.get(this.registry)!;
  }
}

function createCounter({
  name,
  help,
  labels,
  registry,
}: {
  name: string;
  help: string;
  labels: Record<string, string>;
  registry: Registry;
}): Counter<string> {
  const counter = new Counter({
    name,
    help,
    labelNames: Object.keys(labels),
    registers: [registry],
  });
  counter.inc(labels, 0); // Initialize to zero
  return counter;
}

function createGauge({
  name,
  help,
  labels,
  registry,
}: {
  name: string;
  help: string;
  labels: Record<string, string>;
  registry: Registry;
}): Gauge<string> {
  const gauge = new Gauge({
    name,
    help,
    labelNames: Object.keys(labels),
    registers: [registry],
  });
  gauge.set(labels, 0); // Initialize to zero
  return gauge;
}
