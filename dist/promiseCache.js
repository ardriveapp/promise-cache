"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseCache = void 0;
const simple_cache_1 = require("@alexsasharegan/simple-cache");
class PromiseCache {
    constructor({ cacheCapacity, cacheTTL }) {
        this.cache = (0, simple_cache_1.EphemeralCache)(cacheCapacity, cacheTTL);
    }
    cacheKeyString(key) {
        // Note: This implementation may not sufficiently differentiate keys
        // for certain object types depending on their toJSON implementation
        return typeof key === "string" ? key : JSON.stringify(key);
    }
    put(key, value) {
        this.cache.write(this.cacheKeyString(key), value);
        return value;
    }
    get(key) {
        return this.cache.read(this.cacheKeyString(key));
    }
    remove(key) {
        this.cache.remove(this.cacheKeyString(key));
    }
    clear() {
        this.cache.clear();
    }
    size() {
        return this.cache.size();
    }
}
exports.PromiseCache = PromiseCache;
