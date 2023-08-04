/**
 * Copyright (C) 2022-2023 Permanent Data Solutions, Inc. All Rights Reserved.
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
import chai, { expect } from 'chai';
import { describe, it } from 'mocha';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

import { ReadThroughPromiseCache } from './readThroughPromiseCache';

// allows us to use chai's expect syntax with async/await
chai.use(chaiAsPromised);

describe('ReadThroughPromiseCache Class', () => {
  let clock: sinon.SinonFakeTimers;
  before(() => {
    clock = sinon.useFakeTimers();
  });

  after(() => {
    clock.restore();
  });

  it('should be able to cache and retrieve new entries', async () => {
    // Test function to make sure we return a different value after the first call
    // Since function is passed in the constructor

    let testTracker = 0;

    const testFunction = async (): Promise<string> => {
      if (testTracker < 1) {
        testTracker++;
        return 'one';
      } else {
        return 'two';
      }
    };
    const cache = new ReadThroughPromiseCache<string, string>({
      cacheParams: { cacheCapacity: 10, cacheTTL: 60_000 },
      readThroughFunction: testFunction,
    });

    expect(await cache.get('1')).to.equal('one');
    expect(await cache.get('1')).to.equal('one'); // the original cached value has not expired
  });

  it('should throw error if readThroughFunction throws', async () => {
    let testTracker = 0;
    const testFunction = async (): Promise<string>=> {
      if (testTracker < 1) {
        testTracker++;
        throw new Error('test error');
      } else {
        return 'two';
      }
    };
    const cache = new ReadThroughPromiseCache<string, string>({
      cacheParams: { cacheCapacity: 10, cacheTTL: 60_000 },
      readThroughFunction: testFunction,
    });
    await expect(cache.get('1')).to.be.rejectedWith('test error'); // throws error on first call and does not get cached
    expect(await cache.get('1')).to.equal('two'); // resolves on second call
  });

  it('should resolve new promise for key after ttl expires', async () => {
    let testTracker = 0;
    const testFunction = async (): Promise<string> => {
      if (testTracker < 1) {
        testTracker++;
        return 'one';
      } else {
        return 'two';
      }
    };

    const cache = new ReadThroughPromiseCache<string, string>({
      cacheParams: { cacheCapacity: 10, cacheTTL: 60_000 },
      readThroughFunction: testFunction,
    });

    expect(await cache.get('1')).to.equal('one');
    clock.tick(60_001); // tick our fake timer to expire the cache
    expect(await cache.get('1')).to.equal('two');
  });

  it('preserves most requested entries when over capacity', async () => {
    // Test function to make sure we return a different value after the first call
    // Since function is passed in the constructor
    let testTracker = 0;

    const testFunction = async (): Promise<string> => {
      if (testTracker < 1) {
        testTracker++;
        return 'one';
      } else {
        return 'two';
      }
    };

    const cache = new ReadThroughPromiseCache<string, string>({
      cacheParams: { cacheCapacity: 1, cacheTTL: 5 },
      readThroughFunction: testFunction,
    });

    expect(await cache.get('1')).to.equal('one');
    expect(await cache.get('2')).to.equal('two'); // over capacity
    expect(await cache.get('1')).to.equal('two'); // 1 is persisted in cache
  });
});
