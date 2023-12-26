# [4.1.0](https://github.com/kerimdzhanov/dotenv-flow/compare/v4.0.1...v4.1.0) (2023-12-26)


### Features

* **dotenv-flow:** implement `options.files`, closes [#83](https://github.com/kerimdzhanov/dotenv-flow/issues/83) ([#87](https://github.com/kerimdzhanov/dotenv-flow/issues/87)) ([6a47b2c](https://github.com/kerimdzhanov/dotenv-flow/commit/6a47b2c953acea1c48ebe730b8f357628c43a815))



## [4.0.1](https://github.com/kerimdzhanov/dotenv-flow/compare/v4.0.0...v4.0.1) (2023-11-06)


### Bug Fixes

* **dotenv-flow:preload:** add `node` resolver for `exports:./config` field, fixes [#81](https://github.com/kerimdzhanov/dotenv-flow/issues/81) ([#82](https://github.com/kerimdzhanov/dotenv-flow/issues/82)) ([74b211b](https://github.com/kerimdzhanov/dotenv-flow/commit/74b211baec25b3b3de292c325356323f6c61e67b))



# [4.0.0](https://github.com/kerimdzhanov/dotenv-flow/compare/v3.3.0...v4.0.0) (2023-09-28)


### Features

* **dotenv-flow:** add `options.pattern` for customizing `.env*` files' naming convention, closes [#8](https://github.com/kerimdzhanov/dotenv-flow/issues/8) ([#71](https://github.com/kerimdzhanov/dotenv-flow/issues/71)) ([f77c553](https://github.com/kerimdzhanov/dotenv-flow/commit/f77c55383e78b153753cf8027ce8d2b408fa96cc))
* **dotenv-flow:** add debug messaging and errors warning ([#76](https://github.com/kerimdzhanov/dotenv-flow/issues/76)) ([7656b50](https://github.com/kerimdzhanov/dotenv-flow/commit/7656b5078c7a4c28c74e8111035743c9929c3bce))
* **dotenv-flow:** add type definitions ([#77](https://github.com/kerimdzhanov/dotenv-flow/issues/77)) ([be94089](https://github.com/kerimdzhanov/dotenv-flow/commit/be940897d3bdbcc434df89e96931a1c2d32cd8df))
* **dotenv-flow:** return error if none of the `.env*` files is found ([#70](https://github.com/kerimdzhanov/dotenv-flow/issues/70)) ([80ff430](https://github.com/kerimdzhanov/dotenv-flow/commit/80ff430783fcf7e76c4ecdd58be0965efd1bf94a)), closes [#41](https://github.com/kerimdzhanov/dotenv-flow/issues/41)
* **dotenv-flow:** rework `.listFiles` to return only existing files + their full paths ([#75](https://github.com/kerimdzhanov/dotenv-flow/issues/75)) ([b1b0497](https://github.com/kerimdzhanov/dotenv-flow/commit/b1b04971bbc4fdfb64acb9c7d3b9f33caf89434f))
* **dotenv:** upgrade dotenv to v16.0.0 ([#54](https://github.com/kerimdzhanov/dotenv-flow/issues/54)) ([778938c](https://github.com/kerimdzhanov/dotenv-flow/commit/778938cee2915c4fad511ececa6f4cc6f50eeccd))


### BREAKING CHANGES

* **dotenv-flow:** New type definitions do replace the `@types/dotenv-flow` package but might be conflicting.
  The recommendation is to remove `@types/dotenv-flow` from dependencies if using dotenv-flow v4 or above.
* **dotenv-flow:** Deprecated `options.cwd` has been removed, use `options.path` instead ([#72](https://github.com/kerimdzhanov/dotenv-flow/issues/72)) ([3b3956c](https://github.com/kerimdzhanov/dotenv-flow/commit/3b3956c4ddb12c380f07b36ac0dcba56b7b4b003)).
* **dotenv-flow:** The `.config()` method now returns an error if none of the appropriate `.env*` files is found ([#70](https://github.com/kerimdzhanov/dotenv-flow/issues/70)) ([80ff430](https://github.com/kerimdzhanov/dotenv-flow/commit/80ff430783fcf7e76c4ecdd58be0965efd1bf94a)).
* **dotenv-flow:** The exposed internal API method `.listDotenvFiles(dirname, options)` is replaced with `.listFiles(options)`.
  The new method receives optional `options.path`, `options.node_env`, and `options.pattern` and returns a list of existing `.env*` files.
* **dotenv:** Dropped Node.js versions support prior to v12.
* **dotenv:** Added multiline values, inline comments, and backticks support.
  Please check the contents of your `.env*` files and make sure that
  all the `#` and backtick symbols are properly quoted if they are part of the value.



# [4.0.0-rc.3](https://github.com/kerimdzhanov/dotenv-flow/compare/v4.0.0-rc.2...v4.0.0-rc.3) (2023-09-26)


### Features

* **dotenv-flow:api:** expose `DEFAULT_PATTERN` ([a0dce78](https://github.com/kerimdzhanov/dotenv-flow/commit/a0dce7892bc4abca87fbbc5d4f88bb272ab28ad1))



# [4.0.0-rc.2](https://github.com/kerimdzhanov/dotenv-flow/compare/v4.0.0-rc.1...v4.0.0-rc.2) (2023-09-21)


### Bug Fixes

* **dotenv-flow:** mark typings' files as "publishing to npm" ([7092f3f](https://github.com/kerimdzhanov/dotenv-flow/commit/7092f3f9c2c3bffac2ac4119396f33c7169b080a))



# [4.0.0-rc.1](https://github.com/kerimdzhanov/dotenv-flow/compare/v3.3.0...v4.0.0-rc.1) (2023-09-20)

### Features

* **dotenv-flow:** add `options.pattern` for customizing `.env*` files' naming convention, closes [#8](https://github.com/kerimdzhanov/dotenv-flow/issues/8) ([#71](https://github.com/kerimdzhanov/dotenv-flow/issues/71)) ([f77c553](https://github.com/kerimdzhanov/dotenv-flow/commit/f77c55383e78b153753cf8027ce8d2b408fa96cc))
* **dotenv-flow:** add debug messaging and errors warning ([#76](https://github.com/kerimdzhanov/dotenv-flow/issues/76)) ([7656b50](https://github.com/kerimdzhanov/dotenv-flow/commit/7656b5078c7a4c28c74e8111035743c9929c3bce))
* **dotenv-flow:** add type definitions ([#77](https://github.com/kerimdzhanov/dotenv-flow/issues/77)) ([be94089](https://github.com/kerimdzhanov/dotenv-flow/commit/be940897d3bdbcc434df89e96931a1c2d32cd8df))
* **dotenv-flow:** return error if none of the `.env*` files is found ([#70](https://github.com/kerimdzhanov/dotenv-flow/issues/70)) ([80ff430](https://github.com/kerimdzhanov/dotenv-flow/commit/80ff430783fcf7e76c4ecdd58be0965efd1bf94a)), closes [#41](https://github.com/kerimdzhanov/dotenv-flow/issues/41)
* **dotenv-flow:** rework `.listFiles` to return only existing files + their full paths ([#75](https://github.com/kerimdzhanov/dotenv-flow/issues/75)) ([b1b0497](https://github.com/kerimdzhanov/dotenv-flow/commit/b1b04971bbc4fdfb64acb9c7d3b9f33caf89434f))
* **dotenv:** upgrade dotenv to v16.0.0 ([#54](https://github.com/kerimdzhanov/dotenv-flow/issues/54)) ([778938c](https://github.com/kerimdzhanov/dotenv-flow/commit/778938cee2915c4fad511ececa6f4cc6f50eeccd))


### BREAKING CHANGES

* **dotenv-flow:** New type definitions do replace the `@types/dotenv-flow` package but might be conflicting.
  The recommendation is to remove `@types/dotenv-flow` from dependencies if using dotenv-flow v4 or above.
* **dotenv-flow:** Deprecated `options.cwd` has been removed, use `options.path` instead ([#72](https://github.com/kerimdzhanov/dotenv-flow/issues/72)) ([3b3956c](https://github.com/kerimdzhanov/dotenv-flow/commit/3b3956c4ddb12c380f07b36ac0dcba56b7b4b003)).
* **dotenv-flow:** The `.config()` method now returns an error if none of the appropriate `.env*` files is found ([#70](https://github.com/kerimdzhanov/dotenv-flow/issues/70)) ([80ff430](https://github.com/kerimdzhanov/dotenv-flow/commit/80ff430783fcf7e76c4ecdd58be0965efd1bf94a)).
* **dotenv-flow:** The exposed internal API method `.listDotenvFiles(dirname, options)` is replaced with `.listFiles(options)`.
  The new method receives optional `options.path`, `options.node_env`, and `options.pattern` and returns a list of existing `.env*` files.
* **dotenv:** Dropped Node.js versions support prior to v12.
* **dotenv:** Added multiline values, inline comments, and backticks support.
  Please check the contents of your `.env*` files and make sure that
  all the `#` and backtick symbols are properly quoted if they are part of the value.



# [3.3.0](https://github.com/kerimdzhanov/dotenv-flow/compare/v3.2.0...v3.3.0) (2023-08-26)


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
