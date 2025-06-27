# [1.2.0-alpha.3](https://github.com/ardriveapp/promise-cache/compare/v1.2.0-alpha.2...v1.2.0-alpha.3) (2025-06-27)


### Features

* **metrics:** initialize metrics to 0 PE-8242 ([89882c1](https://github.com/ardriveapp/promise-cache/commit/89882c15b57476efe70b370339782388197654fb))

# [1.2.0-alpha.2](https://github.com/ardriveapp/promise-cache/compare/v1.2.0-alpha.1...v1.2.0-alpha.2) (2025-06-27)


### Features

* **cache:** deprecate cacheTTL in favor of cacheTTLMills PE-8242 ([397baea](https://github.com/ardriveapp/promise-cache/commit/397baeab1d1949c0715030dba1b33bee6b272b78))
* **metrics:** drop cacheId in favor of prefix PE-8242 ([baddd50](https://github.com/ardriveapp/promise-cache/commit/baddd50d25b31aec7ef5a74ce9724491f95edef9))

# [1.2.0-alpha.1](https://github.com/ardriveapp/promise-cache/compare/v1.1.4-alpha.1...v1.2.0-alpha.1) (2025-06-27)


### Features

* add new method '.getWithStatus' to ReadThroughPromiseCache ([6b2a687](https://github.com/ardriveapp/promise-cache/commit/6b2a68753d7de65368e2492ca5f39fe9617400b2))
* **metrics:** clean up label handling PE-8242 ([988ea20](https://github.com/ardriveapp/promise-cache/commit/988ea20ba3da71dc81da65d4f776a7b98fc104e6))
* **metrics:** quick take at prometheus metrics PE-8242 ([0232b76](https://github.com/ardriveapp/promise-cache/commit/0232b76715621318ec6429c0d1f20a81310dfe4b))
* **metrics:** require a cacheId and apply it in labels PE-8242 ([7ae226e](https://github.com/ardriveapp/promise-cache/commit/7ae226e341d6f3b6694fe6aacced493ce38cfdd7))
* **metrics:** simplify metrics setup PE-8242 ([45d8147](https://github.com/ardriveapp/promise-cache/commit/45d814733fb5e6f42ed7d4d8892c552a77586b7e))
* **metrics:** use all label names PE-8242 ([8395e9f](https://github.com/ardriveapp/promise-cache/commit/8395e9fb5dc8109471a10d00bd5b02490941fa06))
* **read through promise cache:** add apis of promisecache to readthroughpromisecache PE-6327 ([f2bd75b](https://github.com/ardriveapp/promise-cache/commit/f2bd75b6fc291e5c16dc96568f7b767696f74c44))
* **read through promise cache:** support ferrying of read through data to read through fn PE-6327 ([85de9b3](https://github.com/ardriveapp/promise-cache/commit/85de9b3c168f4950b474771521ceb9c6adb53d4e))
* **ts:** make ferried parameter to ReadThroughPromiseCache be dependently void ([869c39c](https://github.com/ardriveapp/promise-cache/commit/869c39cac49296b3ba2849bd417cc6354d7a4391))

# [1.4.0](https://github.com/ardriveapp/promise-cache/compare/v1.3.0...v1.4.0) (2024-09-05)


### Features

* add new method '.getWithStatus' to ReadThroughPromiseCache ([67981c1](https://github.com/ardriveapp/promise-cache/commit/67981c101143c50e56feeb2d87b78f45e6ea176f))

# [1.3.0](https://github.com/ardriveapp/promise-cache/compare/v1.2.0...v1.3.0) (2024-06-25)


### Features

* **ts:** make ferried parameter to ReadThroughPromiseCache be dependently void ([7e4638b](https://github.com/ardriveapp/promise-cache/commit/7e4638b376fdf51f0bcee4b58ea5ddc2c216bcde))

# [1.2.0](https://github.com/ardriveapp/promise-cache/compare/v1.1.4...v1.2.0) (2024-06-20)


### Features

* **read through promise cache:** add apis of promisecache to readthroughpromisecache PE-6327 ([e413eae](https://github.com/ardriveapp/promise-cache/commit/e413eae7e9b42cf5acd393ee42ee571e7ab6bbf4))
* **read through promise cache:** support ferrying of read through data to read through fn PE-6327 ([e354686](https://github.com/ardriveapp/promise-cache/commit/e35468611bb829ae5a807b19b45623e4655aef32))

## [1.1.4](https://github.com/ardriveapp/promise-cache/compare/v1.1.3...v1.1.4) (2023-09-19)


### Bug Fixes

* remove await when putting value into promiseCache ([20ccb41](https://github.com/ardriveapp/promise-cache/commit/20ccb413f36927380c458e9d3b972351b3090b6b))

## [1.1.4-alpha.1](https://github.com/ardriveapp/promise-cache/compare/v1.1.3...v1.1.4-alpha.1) (2023-09-19)


### Bug Fixes

* remove await when putting value into promiseCache ([20ccb41](https://github.com/ardriveapp/promise-cache/commit/20ccb413f36927380c458e9d3b972351b3090b6b))

## [1.1.3](https://github.com/ardriveapp/promise-cache/compare/v1.1.2...v1.1.3) (2023-08-17)


### Bug Fixes

* build before publishing ([682f60f](https://github.com/ardriveapp/promise-cache/commit/682f60f8cd097aadae7dc7b19ab01e707ea418ed))
* temp ([a7e9021](https://github.com/ardriveapp/promise-cache/commit/a7e9021d1421149b5f744dd6bb9643e2e68e064c))

## [1.1.2](https://github.com/ardriveapp/promise-cache/compare/v1.1.1...v1.1.2) (2023-08-17)


### Bug Fixes

* include types, upgrade to yarn ([03949a6](https://github.com/ardriveapp/promise-cache/commit/03949a60b8a53213c6ca40181978d25b13a016ab))

## [1.1.1](https://github.com/ardriveapp/promise-cache/compare/v1.1.0...v1.1.1) (2023-08-17)


### Bug Fixes

* add types ([0956f0a](https://github.com/ardriveapp/promise-cache/commit/0956f0ab605e47bdc63e7227f26de8402b041c89))
* move to yarn ([6914535](https://github.com/ardriveapp/promise-cache/commit/6914535761df88e5342183959010e793d42b3863))

# [1.1.0](https://github.com/ar-io/promise-cache/compare/v1.0.13...v1.1.0) (2023-08-04)


### Features

* **ReadThroughPromiseCache:** add ReadThroughPromiseCache and update tests and README ([fac1fa2](https://github.com/ar-io/promise-cache/commit/fac1fa2a5d11fe589394293467cf5c9aadafd457))

## [1.0.13](https://github.com/ar-io/promise-cache/compare/v1.0.12...v1.0.13) (2023-08-04)


### Bug Fixes

* publish commonjs module ([05e5c49](https://github.com/ar-io/promise-cache/commit/05e5c49751edcde033f193a63d35716e5b8efb85))

## [1.0.12](https://github.com/ar-io/promise-cache/compare/v1.0.11...v1.0.12) (2023-08-04)


### Bug Fixes

* include declaration files on output ([8937ef4](https://github.com/ar-io/promise-cache/commit/8937ef4822b3b04192143013a4761643e4299df9))

## [1.0.11](https://github.com/ar-io/promise-cache/compare/v1.0.10...v1.0.11) (2023-08-03)


### Bug Fixes

* publish CHANGELOG.md on release ([7da0408](https://github.com/ar-io/promise-cache/commit/7da0408015a085ef42cf8201264aa7c1276a1eba))
