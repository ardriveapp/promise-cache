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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { expect } from "chai";
import { PromiseCache } from "./promiseCache";
describe("PromiseCache class", () => {
    it("constructor takes a capacity that is not exceeded by excessive puts", () => __awaiter(void 0, void 0, void 0, function* () {
        const cache = new PromiseCache({ cacheCapacity: 1, cacheTTL: 60 });
        cache.put("1", Promise.resolve("one"));
        cache.put("2", Promise.resolve("two"));
        expect(cache.get("1")).to.be.undefined;
        expect(cache.get("2")).to.not.be.undefined;
        expect(yield cache.get("2")).to.equal("two");
        expect(cache.size()).to.equal(1);
    }));
    it("preserves most requested entries when over capacity", () => __awaiter(void 0, void 0, void 0, function* () {
        const cache = new PromiseCache({ cacheCapacity: 3, cacheTTL: 60 });
        cache.put("1", Promise.resolve("one"));
        cache.put("2", Promise.resolve("two"));
        cache.put("3", Promise.resolve("three"));
        cache.get("1");
        cache.get("3");
        cache.put("4", Promise.resolve("four"));
        expect(cache.get("1")).to.not.be.undefined;
        expect(cache.get("2")).to.be.undefined;
        expect(cache.get("3")).to.not.be.undefined;
        expect(cache.get("4")).to.not.be.undefined;
        expect(yield cache.get("1")).to.equal("one");
        expect(yield cache.get("3")).to.equal("three");
        expect(yield cache.get("4")).to.equal("four");
        expect(cache.size()).to.equal(3);
    }));
    it("caches and retrieves new entries", () => __awaiter(void 0, void 0, void 0, function* () {
        const cache = new PromiseCache({ cacheCapacity: 1, cacheTTL: 60 });
        cache.put("1", Promise.resolve("one"));
        expect(cache.get("1")).to.not.be.undefined;
        expect(yield cache.get("1")).to.equal("one");
        expect(cache.size()).to.equal(1);
    }));
    it("updates and retrieves existing entries", () => __awaiter(void 0, void 0, void 0, function* () {
        const cache = new PromiseCache({ cacheCapacity: 2, cacheTTL: 60 });
        cache.put("1", Promise.resolve("one"));
        cache.put("1", Promise.resolve("uno"));
        expect(cache.get("1")).to.not.be.undefined;
        expect(yield cache.get("1")).to.equal("uno");
        expect(cache.size()).to.equal(1);
    }));
    it("caches and retrieves different object entries", () => __awaiter(void 0, void 0, void 0, function* () {
        const cache = new PromiseCache({
            cacheCapacity: 2, cacheTTL: 60
        });
        const cacheKey1 = { foo: "bar" };
        const cacheKey2 = { bar: "foo" };
        cache.put(cacheKey1, Promise.resolve("foobar"));
        cache.put(cacheKey2, Promise.resolve("barfoo"));
        expect(cache.get(cacheKey1)).to.not.be.undefined;
        expect(yield cache.get(cacheKey1)).to.equal("foobar");
        expect(cache.get(cacheKey2)).to.not.be.undefined;
        expect(yield cache.get(cacheKey2)).to.equal("barfoo");
        expect(cache.size()).to.equal(2);
    }));
    describe("remove function", () => {
        it("removes a single entry", () => __awaiter(void 0, void 0, void 0, function* () {
            const cache = new PromiseCache({ cacheCapacity: 2, cacheTTL: 60 });
            cache.put("1", Promise.resolve("one"));
            cache.put("2", Promise.resolve("two"));
            expect(cache.get("1")).to.not.be.undefined;
            expect(cache.get("2")).to.not.be.undefined;
            cache.remove("2");
            expect(cache.get("2")).to.be.undefined;
            expect(cache.get("1")).to.not.undefined;
            expect(yield cache.get("1")).to.equal("one");
            expect(cache.size()).to.equal(1);
        }));
    });
    describe("clear function", () => {
        it("purges all entries", () => __awaiter(void 0, void 0, void 0, function* () {
            const cache = new PromiseCache({ cacheCapacity: 1, cacheTTL: 60 });
            cache.put("1", Promise.resolve("one"));
            cache.clear();
            expect(cache.get("1")).to.be.undefined;
            expect(cache.size()).to.equal(0);
        }));
    });
    describe("size function", () => {
        it("returns the correct entry count", () => __awaiter(void 0, void 0, void 0, function* () {
            const cache = new PromiseCache({ cacheCapacity: 2, cacheTTL: 60 });
            cache.put("1", Promise.resolve("one"));
            cache.put("2", Promise.resolve("two"));
            expect(cache.size()).to.equal(2);
        }));
    });
    describe("cacheKeyString function", () => {
        it("returns and input string as the same string", () => __awaiter(void 0, void 0, void 0, function* () {
            const cache = new PromiseCache({ cacheCapacity: 1, cacheTTL: 60 });
            expect(cache.cacheKeyString("key")).to.equal("key");
            expect(cache.cacheKeyString('{ bad: "json"')).to.equal('{ bad: "json"');
        }));
        it("returns an input number as a string", () => __awaiter(void 0, void 0, void 0, function* () {
            const cache = new PromiseCache({ cacheCapacity: 1, cacheTTL: 60 });
            expect(cache.cacheKeyString(1)).to.equal("1");
        }));
        it("returns an input object as its JSON representation", () => __awaiter(void 0, void 0, void 0, function* () {
            const cache = new PromiseCache({
                cacheCapacity: 1, cacheTTL: 60
            });
            expect(cache.cacheKeyString({ foo: "bar" })).to.equal('{"foo":"bar"}');
        }));
    });
    describe("time to live", () => {
        it("purges all entries after ttl", () => __awaiter(void 0, void 0, void 0, function* () {
            const cache = new PromiseCache({
                cacheCapacity: 1,
                cacheTTL: 10,
            });
            cache.put("1", Promise.resolve("one"));
            yield new Promise((resolve) => setTimeout(resolve, 15));
            expect(cache.get("1")).to.be.undefined;
            expect(cache.size()).to.equal(0);
        }));
    });
});
