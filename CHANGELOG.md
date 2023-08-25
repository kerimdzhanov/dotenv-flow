# [3.3.0-rc.2](https://github.com/kerimdzhanov/dotenv-flow/compare/v3.2.0...v3.3.0-rc.2) (2023-08-25)


### Features

* **dotenv-flow:** Add "exports" field ([352888b](https://github.com/kerimdzhanov/dotenv-flow/commit/352888b374c6ef3a1e7cd80d8882f15a8aa20c0f)), closes [#56](https://github.com/kerimdzhanov/dotenv-flow/issues/56)
* **dotenv:** upgrade dotenv to v8.6.0 ([69d9273](https://github.com/kerimdzhanov/dotenv-flow/commit/69d9273c299e3ead2a33c6c43114dccd66406ec7))

### Bug Fixes

* **dotenv-flow:config:** load the rest of `.env*` files even if `.env` doesn't exist ([07502e3](https://github.com/kerimdzhanov/dotenv-flow/commit/07502e373bd868ad086940576bdf4ecc1f768685)), closes [#50](https://github.com/kerimdzhanov/dotenv-flow/issues/50)



# [3.2.0](https://github.com/kerimdzhanov/dotenv-flow/compare/v3.1.0...v3.2.0) (2020-06-27)


### Features

* **dotenv-flow:** alternative defaults: `.env.defaults` ([#29](https://github.com/kerimdzhanov/dotenv-flow/issues/29)) ([4d2124c](https://github.com/kerimdzhanov/dotenv-flow/commit/4d2124c))



# [3.1.0](https://github.com/kerimdzhanov/dotenv-flow/compare/v3.0.0...v3.1.0) (2019-08-17)


### Features

* **dotenv-flow:** implement the "silence" mode, closes [#17](https://github.com/kerimdzhanov/dotenv-flow/issues/17) ([1177162](https://github.com/kerimdzhanov/dotenv-flow/commit/1177162))



# [3.0.0](https://github.com/kerimdzhanov/dotenv-flow/compare/v2.0.0...v3.0.0) (2019-07-14)


### Features

* **dotenv-flow:** redesign and expose the internal API, [#16](https://github.com/kerimdzhanov/dotenv-flow/issues/16) ([266b9e2](https://github.com/kerimdzhanov/dotenv-flow/commit/266b9e2))


### BREAKING CHANGES

* **dotenv-flow:** The `.parse` method's signature is changed. Now it takes the filename or a list of filenames to parse.



# [2.0.0](https://github.com/kerimdzhanov/dotenv-flow/compare/v1.0.0...v2.0.0) (2019-06-04)


### Features

* **dotenv:** update `dotenv` up to `v8.0.0` ([5ff1a42](https://github.com/kerimdzhanov/dotenv-flow/commit/5ff1a42))


### BREAKING CHANGES

* **dotenv:** Dropping Node.js v6 support because of end-of-life



# [1.0.0](https://github.com/kerimdzhanov/dotenv-flow/compare/v0.4.0...v1.0.0) (2019-06-04)


#### Nothing changed

The version is released to follow the semver rules setting the baseline of the package.
Starting from here all the "BREAKING CHANGES" will always be released with bumping up the major version.



# [0.4.0](https://github.com/kerimdzhanov/dotenv-flow/compare/v0.3.0...v0.4.0) (2019-04-29)


### Features

* **dotenv-flow/config:**
  * add support for `-r dotenv-flow/config`, closes [#11](https://github.com/kerimdzhanov/dotenv-flow/issues/11) ([d94d21c](https://github.com/kerimdzhanov/dotenv-flow/commit/d94d21c))
  * add ability to configure `dotenv-flow/config` via environment variables, relates [#11](https://github.com/kerimdzhanov/dotenv-flow/issues/11) ([0118d27](https://github.com/kerimdzhanov/dotenv-flow/commit/0118d27))
  * add ability to configure `dotenv-flow/config` via command line switches, relates [#11](https://github.com/kerimdzhanov/dotenv-flow/issues/11) ([ee87e39](https://github.com/kerimdzhanov/dotenv-flow/commit/ee87e39))



# [0.3.0](https://github.com/kerimdzhanov/dotenv-flow/compare/v0.2.0...v0.3.0) (2019-04-07)


### Features

* **dotenv:** update `dotenv` up to `v7.0.0` ([a5ab798](https://github.com/kerimdzhanov/dotenv-flow/commit/a5ab798))


### BREAKING CHANGES

* **dotenv:** Removed the `.load()` alias in order to comply with the `dotenv` API.



# [0.2.0](https://github.com/kerimdzhanov/dotenv-flow/compare/v0.1.0...v0.2.0) (2018-12-23)


### Features

* **options:** add `options.node_env` (defaults to `process.env.NODE_ENV`), PR [#6](https://github.com/kerimdzhanov/dotenv-flow/issues/6), closes [#5](https://github.com/kerimdzhanov/dotenv-flow/issues/5) ([30db488](https://github.com/kerimdzhanov/dotenv-flow/commit/30db488))


### BREAKING CHANGES

* **dotenv-flow:** `process.env.NODE_ENV` can now be used separately/isolated from the module and no longer be set to default value (when the `default_node_env` option is provided).



# [0.1.0](https://github.com/kerimdzhanov/dotenv-flow/compare/v0.1.0-beta.4...v0.1.0) (2018-08-02)



# [0.1.0-beta.4](https://github.com/kerimdzhanov/dotenv-flow/compare/v0.1.0-beta.3...v0.1.0-beta.4) (2018-08-02)


### Features

* **dotenv:** make "cleanup dotenv defined variables" optional ([9495bcb](https://github.com/kerimdzhanov/dotenv-flow/commit/9495bcb))
* **dotenv-flow:** make `.config()` to return object like "dotenv" ([882c53c](https://github.com/kerimdzhanov/dotenv-flow/commit/882c53c))



# [0.1.0-beta.3](https://github.com/kerimdzhanov/dotenv-flow/compare/v0.1.0-beta.2...v0.1.0-beta.3) (2018-07-17)


### Bug Fixes

* **default-env:** add ability to use without a default `.env` file, fixes [#1](https://github.com/kerimdzhanov/dotenv-flow/issues/1) ([5bdab69](https://github.com/kerimdzhanov/dotenv-flow/commit/5bdab69))



# [0.1.0-beta.2](https://github.com/kerimdzhanov/dotenv-flow/compare/v0.1.0-beta.1...v0.1.0-beta.2) (2018-06-10)


### Features

* **dotenv:** update `dotenv` up to "v6.0.0" ([526ce09](https://github.com/kerimdzhanov/dotenv-flow/commit/526ce09))



# 0.1.0-beta.1 (2018-05-17)
