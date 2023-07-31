# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.3.3](https://github.com/alexsasharegan/simple-cache/compare/v3.3.2...v3.3.3) (2019-03-02)



<a name="3.3.2"></a>
## [3.3.2](https://github.com/alexsasharegan/simple-cache/compare/v3.3.1...v3.3.2) (2018-09-19)



<a name="3.3.1"></a>
## [3.3.1](https://github.com/alexsasharegan/simple-cache/compare/v3.3.0...v3.3.1) (2018-09-17)



<a name="3.3.0"></a>
# [3.3.0](https://github.com/alexsasharegan/simple-cache/compare/v3.2.0...v3.3.0) (2018-09-17)


### Features

* adds `Cache.get` & better expiration management to EphemeralCache ([942b4b3](https://github.com/alexsasharegan/simple-cache/commit/942b4b3))



<a name="3.2.0"></a>
# [3.2.0](https://github.com/alexsasharegan/simple-cache/compare/v3.1.0...v3.2.0) (2018-09-17)


### Features

* adds esm support and stricter capacity/duration validation ([06a1589](https://github.com/alexsasharegan/simple-cache/commit/06a1589))



<a name="3.1.0"></a>
# [3.1.0](https://github.com/alexsasharegan/simple-cache/compare/v3.0.0...v3.1.0) (2018-09-16)


### Features

* save extra iterations using Array.from's map func ([b5f9740](https://github.com/alexsasharegan/simple-cache/commit/b5f9740))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/alexsasharegan/simple-cache/compare/v2.0.0...v3.0.0) (2018-09-16)


### Features

* updates documentation and toString supports K/V labeling ([80495a0](https://github.com/alexsasharegan/simple-cache/commit/80495a0))


### BREAKING CHANGES

* type label param refactored to object with fields `key` & `value`



<a name="2.0.0"></a>
# [2.0.0](https://github.com/alexsasharegan/simple-cache/compare/v1.3.0...v2.0.0) (2018-09-16)


### Features

* refactor caches to reuse a core, internal cache implementation ([74db3b7](https://github.com/alexsasharegan/simple-cache/commit/74db3b7))


### BREAKING CHANGES

* Renames TemporaryCache to EphemeralCache
* removes interval methods `startInterval` & `stopInterval`
* Removes internal usage of setInterval



<a name="1.3.0"></a>
# [1.3.0](https://github.com/alexsasharegan/simple-cache/compare/v1.2.0...v1.3.0) (2018-09-16)


### Features

* adds EphemeralCache ([02aa813](https://github.com/alexsasharegan/simple-cache/commit/02aa813))
* breakout lib into separate internal files ([69ea1f1](https://github.com/alexsasharegan/simple-cache/commit/69ea1f1))
* cache now supports any key type ([2b058d9](https://github.com/alexsasharegan/simple-cache/commit/2b058d9))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/alexsasharegan/simple-cache/compare/v1.1.2...v1.2.0) (2018-07-28)


### Features

* adds range error check for capacity ([f997855](https://github.com/alexsasharegan/simple-cache/commit/f997855))



<a name="1.1.2"></a>
## [1.1.2](https://github.com/alexsasharegan/simple-cache/compare/v1.1.1...v1.1.2) (2018-07-27)


### Bug Fixes

* **test:** 100% coverage ([aab184d](https://github.com/alexsasharegan/simple-cache/commit/aab184d))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/alexsasharegan/simple-cache/compare/v1.1.0...v1.1.1) (2018-07-27)



<a name="1.1.0"></a>
# 1.1.0 (2018-07-27)


### Features

* lib and tests ([54564fc](https://github.com/alexsasharegan/simple-cache/commit/54564fc))
