# dotenv-flow

<img src="https://raw.githubusercontent.com/kerimdzhanov/dotenv-flow/master/dotenv-flow@2x.png" alt="dotenv-flow" width="280" height="140" align="right" />

[dotenv](https://github.com/motdotla/dotenv) is a zero-dependency npm module that loads environment variables from a `.env` file into [`process.env`](https://nodejs.org/docs/latest/api/process.html#process_process_env).

**dotenv-flow**, in turn, extends **dotenv** adding the ability to have multiple env files like `.env.development`, `.env.test`, `.env.production`, etc., also allowing the values to be overwritten locally by defining them in the appropriate `.env*.local` file.

The `.env*` files loading strategy is controlled by `process.env.NODE_ENV` (by default) and merged in a prioritized order explained in the [variables overwriting/priority](#variables-overwritingpriority) section above.

Storing configuration in _environment variables_ separate from code and grouping them by environments like _development_, _test_ and _production_ is based on [The Twelve-Factor App](https://12factor.net/config) methodology.

[![npm version](https://badge.fury.io/js/dotenv-flow.svg)](https://badge.fury.io/js/dotenv-flow)
[![Build Status](https://travis-ci.org/kerimdzhanov/dotenv-flow.svg?branch=master)](https://travis-ci.org/kerimdzhanov/dotenv-flow)
[![dependencies status](https://david-dm.org/kerimdzhanov/dotenv-flow/status.svg)](https://david-dm.org/kerimdzhanov/dotenv-flow)


## Installation

Using NPM:

```sh
$ npm install dotenv-flow --save
```

Using Yarn:

```sh
$ yarn add dotenv-flow
```


## Usage

As early as possible in your application, require and configure **dotenv-flow**.

```js
require('dotenv-flow').config();
```

This will read environment variables from the `.env` file allowing them to be overwritten locally in the `.env.local` file.

When running, your `process.env` will have keys and values you've defined in your `.env*` files.

Additionally, if the `NODE_ENV` environment variable is set, then`.env.${NODE_ENV}` and the appropriate `.env.${NODE_ENV}.local` files are also be loaded.

For example, let's suppose you have the following `.env.*` files in your project:

```text
# .env

DATABASE_HOST=127.0.0.1
DATABASE_PORT=27017
DATABASE_USER=default
DATABASE_NAME=my_app
```

```text
# .env.local

DATABASE_USER=hacker
DATABASE_PASS=super-secret
```

```text
# .env.development

DATABASE_NAME=my_app_dev
```

```text
# .env.test

DATABASE_NAME=my_app_test
```

```text
# .env.production

DATABASE_NAME=my_app_prod
```

```js
// your_script.js

require('dotenv-flow').config();

console.log('database host:', process.env.DATABASE_HOST);
console.log('database port:', process.env.DATABASE_PORT);
console.log('database user:', process.env.DATABASE_USER);
console.log('database pass:', process.env.DATABASE_PASS);
console.log('database name:', process.env.DATABASE_NAME);
```

And if you run `your_script.js` in `development` environment, like this:

```sh
$ NODE_ENV=development node your_scrips.js
```

you'll get the following output:

```text
database host: 127.0.0.1
database port: 27017
database user: hacker
database pass: super-secret
database name: my_app_dev
```

And as you may already understood, the `.env*.local` files should be excluded from version control system (refer the [motivation](#motivation) section above to learn more).


### `NODE_ENV`-specific `.env.*` files

Actually **dotenv-flow** have no any "predefined" environments, so you may have whatever environment names you want,
but it's a good practice to use world's universally recognized environment names like `development`, `test`, `production`, and also frequently used `qa` or `stage`.

The naming convention for `NODE_ENV`-specific files is simply as `.env.${NODE_ENV}[.local]` (i.e. `.env.development`, `.env.test`, `.env.production`, `.env.development.local`, `.env.production.local`, etc.).

To activate specific environment run your application with predefined `NODE_ENV` environment variable, like:

```sh
$ export NODE_ENV=production
$ node your_script.js
```

or:

```sh
$ NODE_ENV=production node your_script.js
```

If you are on Windows:

```bat
> SET NODE_ENV=production
> node your_script.js
```

Or even better use [cross-env](https://github.com/kentcdodds/cross-env) to run independent of platform:

```sh
$ cross-env NODE_ENV=production node your_script.js
```

`--node-env` switch is also supported:

```sh
$ node your_script.js --node-env=production
```


### Preload

Alternatively, you can preload **dotenv-flow** using node's [`-r` (`--require`) command line option](https://nodejs.org/api/cli.html#cli_r_require_module).

```sh
$ NODE_ENV=production node -r dotenv-flow/config your_script.js
```

or:

```sh
$ node -r dotenv-flow/config your_script.js --node-env=production
```

You can also use environment variables to set configuration options when preloading the `dotenv-flow/config`:

```sh
$ DOTENV_FLOW_PATH=/path/to/env-files-dir node -r dotenv-flow/config your_script.js
```

Refer to the [`dotenv-flow/config` options](#dotenv-flowconfig-options) section to see all available options.


## Files under version control

#### TL;DR

Here is an example of the `.gitignore` (or `.hgignore`) file entry to keep it clean:

```
# local .env* files
.env.local
.env.*.local
```

#### Motivation

The general thing here is not to commit production database passwords, API keys and other sensitive things to your source code repository,
but it's ok to keep default database connections, ports, hosts, etc., like `localhost:3000` and so on as a fallback to keep your code simple and always "just work".

Understanding the above, we have the following approach:

You can keep all the fallback values in the `.env` file that is loaded in any environment by default.
And also it is a good place to have all the application used environment variables here thus having a reference of environment variables that are used by your application on the whole.
So it's a good reason to share the `.env` file with other developers in your team, but keep all the sensitive data on your own (or production) machine locally in the `.env.local` file.

It is not necessary, but also a good practice to use `NODE_ENV` to control the environment to run your application in.
And if you follow this practice you can keep the `NODE_ENV`-specific defaults in your `.env.development`, `.env.test`, `.env.production` files and share them with your team.
Any `NODE_ENV`-specific `.env.*` file's values can also be overwritten in the appropriate `.env.*.local` (i.e. `.env.development.local`, `.env.test.local`, `.env.production.local`).

Summarizing the above, you can have the following `.env*` files in your project:

 * `.env` – for default (fallback) values, **tracked** by VCS
 * `.env.development` – for development environment, **tracked** by VCS
 * `.env.test` – for test environment, **tracked** by VCS
 * `.env.production` – for production environment, **tracked** by VCS
 * `.env.local` – for individual default values, **ignored** by VCS
 * `.env.development.local` – for individual development environment values, **ignored** by VCS
 * `.env.test.local` – for individual test environment values, **ignored** by VCS
 * `.env.production.local` – for production environment values (DB passwords, API keys, etc.), **ignored** by VCS

Make a note that `.env.*` files names may vary in your project, just keep in mind that **`.env*.local` files must be untracked/ignored by your CVS**.


## Variables overwriting/priority

Since multiple `.env*` files are loaded together at the same time, all the variables defined there are merged in the following order:

1) `.env` file have a lowest priority over all, keep the most default (fallback) values here;
2) `.env.local` file have a priority over the `.env`, create it if you want to overwrite the default values for your own environment-specific needs;
3) `NODE_ENV`-specific env files (`.env.development`, `.env.test`, etc.) have a priority over the default `.env` and `.env.local` files, keep default `NODE_ENV`-specific environment variables here;
4) `NODE_ENV`-specific local env files (`.env.development.local`, `.env.production.local`, etc.) have a highest priority, as with `.env.local`, create them only if you need to overwrite `NODE_ENV`-specific default values for your individual needs;
5) if any variables are already defined in the environment before reading from `.env*`, they will not be overwritten, thus having the higher priority over defined in any env file;


## API reference

As an extension of [dotenv](https://github.com/motdotla/dotenv), **dotenv-flow** has the same API with a little difference in initialization options described below.


#### `.config(options)`

The main initialization function that reads and parses the contents of your `.env.*` files,
merges the results into `process.env.*` (respecting the definition priority), and returns an `Object`
with a `parsed` key containing the resulting key/values or an `error` key if the initialization is failed.

##### `options.node_env`

By default, the module refers the `NODE_ENV` environment variable to detect the environment to use.
With the `node_env` option you can force the module to use your custom environment value independent of `process.env.NODE_ENV`:

```js
require('dotenv-flow').config({
  node_env: process.argv[2] || 'development'
});
```

##### `options.default_node_env`

If the `NODE_ENV` environment variable is not set, the module doesn't load/parse any `NODE_ENV`-specific files at all.
Therefore, you may want to use `"development"` as the default environment:

```js
require('dotenv-flow').config({
  default_node_env: 'development'
});
```

Just make a note that all the following initialization examples are also equivalent:

```js
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

require('dotenv-flow').config();
```

```js
require('dotenv-flow').config({
  node_env: process.env.NODE_ENV || 'development'
});
```

```js
require('dotenv-flow').config({
  node_env: process.env.NODE_ENV,
  default_node_env: 'development'
});
```

All the examples above, considers the value of `process.env.NODE_ENV` at first, and if not set, uses `"development"` as the value by default. You can just choose one that looks prettier for you.

##### `options.path`

With the `path` initialization option you can specify a path to `.env*` files directory:

```js
require('dotenv-flow').config({
  path: '/path/to/env-files-dir'
});
```

If the option is not provided, the current working directory is used.

##### `options.encoding`

You can specify the encoding of your files containing environment variables. The default value is `'utf8'`.

_[inherited from dotenv [`options.encoding`](https://github.com/motdotla/dotenv#encoding)]_

```js
require('dotenv-flow').config({
  encoding: 'base64'
});
```

##### `options.purge_dotenv`

In some cases the original "dotenv" library can be used by one of the dependent
npm modules. It causes calling the original `dotenv.config()` that loads
the `.env` file from your project before you can call `dotenv-flow.config()`.

Such cases breaks `.env*` files priority because the previously loaded
environment variables are treated as shell-defined thus having the higher priority.

Setting the `purge_dotenv` option to `true` can gracefully fix this issue.

```js
require('dotenv-flow').config({
  purge_dotenv: true
});
```


#### `.parse(source)`

An internal function that parses the contents of your file containing environment variables.
Accepts a `String` or `Buffer` and returns an `Object` with the parsed keys and values.

_[inherited from [`dotenv.parse(source)`](https://github.com/motdotla/dotenv#parse)]_

```js
const dotenvFlow = require('dotenv-flow');

const source = Buffer.from('FOO=bar\nBAZ=qux');
const config = dotenvFlow.parse(source);

console.log(typeof config, config); // > object { FOO: 'bar', BAZ: 'qux' }
```


## `dotenv-flow/config` options

When preloading **dotenv-flow** using the node's `-r` switch you can use the following configuration options:

### Environment variables

* `NODE_ENV` => [`options.node_env`](#optionsnode_env);
* `DEFAULT_NODE_ENV` => [`options.default_node_env`](#optionsdefault_node_env);
* `DOTENV_FLOW_PATH` => [`options.path`](#optionspath);
* `DOTENV_FLOW_ENCODING` => [`options.encoding`](#optionsencoding);
* `DOTENV_FLOW_PURGE_DOTENV` => [`options.purge_dotenv`](#optionspurge_dotenv);

```sh
$ NODE_ENV=production DOTENV_FLOW_PATH=/path/to/env-files-dir node -r dotenv-flow/config your_script.js
```

### Command line switches

* `--node-env` => [`options.node_env`](#optionsnode_env);
* `--default-node-env` => [`options.default_node_env`](#optionsdefault_node_env);
* `--dotenv-flow-path` => [`options.path`](#optionspath);
* `--dotenv-flow-encoding` => [`options.encoding`](#optionsencoding);
* `--dotenv-flow-purge-dotenv` => [`options.purge_dotenv`](#optionspurge_dotenv);

Don't forget to separate **dotenv-flow/config**-specific CLI switches with `--` because they're unrecognized by **Node.js**:

```sh
$ node -r dotenv-flow/config your_script.js -- --dotenv-flow-encoding=latin1 --dotenv-flow-path=...
```


## Contributing

Feel free to dive in! [Open an issue](https://github.com/kerimdzhanov/dotenv-flow/issues/new) or submit PRs.


## Running tests

Using NPM:

```sh
$ npm test
```

Using Yarn:

```sh
$ yarn test
```


## License

Licensed under [MIT](LICENSE) © 2018-2019 Dan Kerimdzhanov
