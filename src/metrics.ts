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
  prefix: string;
  registry?: Registry;
  labels?: Record<string, string>;
}

export class CacheMetrics {
  private readonly hitCounter: Counter<string>;
  private readonly missCounter: Counter<string>;
  private readonly putCounter: Counter<string>;
  private readonly removeCounter: Counter<string>;
  private readonly clearCounter: Counter<string>;
  private readonly evictionCounter: Counter<string>;
  private readonly sizeGauge: Gauge<string>;
  private readonly prefix: string;
  private readonly defaultLabels: Record<string, string>;

  constructor(config: CacheMetricsConfig) {
    const registry = config.registry || register;
    this.prefix = config.prefix || 'promise_cache';
    this.defaultLabels = { ...config.labels };

    this.hitCounter = createCounter({
      name: `${this.prefix}_hits_total`,
      help: 'Number of cache hits',
      labels: this.defaultLabels,
      registry,
    });

    this.missCounter = createCounter({
      name: `${this.prefix}_misses_total`,
      help: 'Number of cache misses',
      labels: this.defaultLabels,
      registry,
    });

    this.putCounter = createCounter({
      name: `${this.prefix}_puts_total`,
      help: 'Number of cache put operations',
      labels: this.defaultLabels,
      registry,
    });

    this.removeCounter = createCounter({
      name: `${this.prefix}_removes_total`,
      help: 'Number of cache remove operations',
      labels: this.defaultLabels,
      registry,
    });

    this.clearCounter = createCounter({
      name: `${this.prefix}_clears_total`,
      help: 'Number of cache clear operations',
      labels: this.defaultLabels,
      registry,
    });

    this.evictionCounter = createCounter({
      name: `${this.prefix}_evictions_total`,
      help: 'Number of cache evictions due to TTL or capacity',
      labels: this.defaultLabels,
      registry,
    });

    this.sizeGauge = createGauge({
      name: `${this.prefix}_size`,
      help: 'Current number of items in cache',
      labels: this.defaultLabels,
      registry,
    });
  }

  recordHit(): void {
    this.hitCounter.inc(this.defaultLabels);
  }

  recordMiss(): void {
    this.missCounter.inc(this.defaultLabels);
  }

  recordPut(): void {
    this.putCounter.inc(this.defaultLabels);
  }

  recordRemove(): void {
    this.removeCounter.inc(this.defaultLabels);
  }

  recordClear(): void {
    this.clearCounter.inc(this.defaultLabels);
  }

  recordEviction(): void {
    this.evictionCounter.inc(this.defaultLabels);
  }

  updateSize(size: number): void {
    this.sizeGauge.set(this.defaultLabels, size);
  }

  updateSizeDeferred(getSizeCallback: () => number): void {
    // Defers the size update to the next tick to allow for any pending purges to complete
    Promise.resolve().then(() => {
      this.sizeGauge.set(this.defaultLabels, getSizeCallback());
    });
  }

  getMetrics(): {
    hits: Counter<string>;
    misses: Counter<string>;
    puts: Counter<string>;
    removes: Counter<string>;
    clears: Counter<string>;
    evictions: Counter<string>;
    size: Gauge<string>;
  } {
    return {
      hits: this.hitCounter,
      misses: this.missCounter,
      puts: this.putCounter,
      removes: this.removeCounter,
      clears: this.clearCounter,
      evictions: this.evictionCounter,
      size: this.sizeGauge,
    };
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
