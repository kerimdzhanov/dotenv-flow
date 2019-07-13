# dotenv-flow

<img src="https://raw.githubusercontent.com/kerimdzhanov/dotenv-flow/master/dotenv-flow@2x.png" alt="dotenv-flow" width="280" height="140" align="right" />

[dotenv](https://github.com/motdotla/dotenv) is a zero-dependency npm module that loads environment variables from a `.env` file into [`process.env`](https://nodejs.org/docs/latest/api/process.html#process_process_env).

**dotenv-flow** extends **dotenv** adding the ability to have multiple `.env*` files like `.env.development`, `.env.test` and `.env.production`, also allowing defined variables to be overwritten individually in the appropriate `.env*.local` file.

Storing configuration in _environment variables_ separate from code and grouping them by environments like _development_, _test_ and _production_ is based on [The Twelve-Factor App](https://12factor.net/config) methodology.

[![npm version](https://badge.fury.io/js/dotenv-flow.svg)](https://badge.fury.io/js/dotenv-flow)
[![npm downloads](https://badgen.net/npm/dw/dotenv-flow)](https://www.npmjs.com/package/dotenv-flow)
[![Build Status](https://travis-ci.org/kerimdzhanov/dotenv-flow.svg?branch=master)](https://travis-ci.org/kerimdzhanov/dotenv-flow)
[![dependencies status](https://david-dm.org/kerimdzhanov/dotenv-flow/status.svg)](https://david-dm.org/kerimdzhanov/dotenv-flow)
![node version](https://badgen.net/npm/node/dotenv-flow)


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

For example, let's suppose that you have the following `.env.*` files in your project:

```sh
# .env

DATABASE_HOST=127.0.0.1
DATABASE_PORT=27017
DATABASE_USER=default
DATABASE_PASS=
DATABASE_NAME=my_app
```

```sh
# .env.local

DATABASE_USER=hacker
DATABASE_PASS=super-secret
```

```sh
# .env.development

DATABASE_NAME=my_app_dev
```

```sh
# .env.test

DATABASE_NAME=my_app_test
```

```sh
# .env.production

DATABASE_NAME=my_app_prod
```

```sh
# .env.production.local

DATABASE_HOST=10.0.0.32
DATABASE_PORT=27017
DATABASE_USER=devops
DATABASE_PASS=1qa2ws3ed4rf5tg6yh
DATABASE_NAME=application_storage
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

And if you run `your_script.js` in **development** environment, like this:

```sh
$ NODE_ENV=development node your_scrips.js
```

then you'll get the following output:

```text
database host: 127.0.0.1
database port: 27017
database user: hacker
database pass: super-secret
database name: my_app_dev
```

Or if you run the same script in **production** environment:

```sh
$ NODE_ENV=production node your_script.js
```

you'll get the following:

```text
database host: 10.0.0.32
database port: 27017
database user: devops
database pass: 1qa2ws3ed4rf5tg6yh
database name: application_storage
```

And as you may already understood, the `.env*.local` files should be ignored by your version control system (refer the [Files under version control](#files-under-version-control) section below to learn more), and you'll have the `.env.production.local` file only on your production deployment machine.


### `NODE_ENV`-specific env files

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

Or even better, use [cross-env](https://github.com/kentcdodds/cross-env) to make it work independent of platform:

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

Refer to the [`dotenv-flow/config` options](#dotenv-flowconfig-options) section below to see all available options.


## Files under version control

The general thing here – is not to commit production database passwords, API keys and other sensitive things to your source code repository,
but it's still ok to keep default database connections, ports, hosts, etc., like `localhost:3000` and so on as a fallback to keep your code clean, simple and always "just work".

Understanding the above, we have the following approach:

You can keep all the fallback values in the default `.env` file, that (if exists) will always be loaded independently from any environment.
And also it is a good place to have all the application used environment variables here, thus having a reference of environment variables that are used by your application on the whole.
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

Make a note that `.env.*` file names may vary in your project depending on your own needs/preferences, just keep in mind that `.env*.local` files should be untracked (ignored) by your version control system.

Here is an example of the `.gitignore` (or `.hgignore`) file entry to keep it clean:

```gitignore
# local .env* files
.env.local
.env.*.local
```


## Variables overwriting/priority

Since multiple `.env*` files are loaded together at the same time, all the variables defined there are merged in the following order:

1) `.env` file have a lowest priority over all, keep the most default (fallback) values here;
2) `.env.local` file have a priority over the `.env`, create it if you want to overwrite the default values for your own environment-specific needs;
3) `NODE_ENV`-specific env files (`.env.development`, `.env.test`, etc.) have a priority over the default `.env` and `.env.local` files, keep default `NODE_ENV`-specific environment variables here;
4) `NODE_ENV`-specific local env files (`.env.development.local`, `.env.production.local`, etc.) have a highest priority, as with `.env.local`, create them only if you need to overwrite `NODE_ENV`-specific default values for your individual needs;
5) if any variables are already defined in the environment before reading from `.env*`, they will not be overwritten, thus having the higher priority over defined in any env file;


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


## API reference

#### `.config([options]) => object`

The main entry point function that parses the contents of your `.env*` files, merges the results and appends to `process.env.*`.

Also, like the original module ([dotenv](https://github.com/motdotla/dotenv)), it returns an `object` with the `parsed` property containing the resulting key/values or the `error` property if the initialization is failed.

##### `options.node_env`

###### Type: `string`

By default, the module refers the `NODE_ENV` environment variable to detect the environment to use.
With the `node_env` option you can force the module to use your custom environment value independent of `process.env.NODE_ENV`:

```js
require('dotenv-flow').config({
  node_env: process.argv[2] || 'development'
});
```

##### `options.default_node_env`

###### Type: `string`

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

###### Type: `string`

With the `path` initialization option you can specify a path to `.env*` files directory:

```js
require('dotenv-flow').config({
  path: '/path/to/env-files-dir'
});
```

If the option is not provided, the current working directory is used.

##### `options.encoding`

###### Type: `string`

You can specify the encoding of your files containing environment variables. The default value is `'utf8'`.

```js
require('dotenv-flow').config({
  encoding: 'base64'
});
```

##### `options.purge_dotenv`

###### Type: `Boolean`

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

---

The following API is considered as internal, but it is also exposed to give the ability to be used programmatically by your own needs.


#### `.listDotenvFiles(dirname, [options]) => string[]`

Returns a list of `.env*` filenames depending on the given `options.node_env`. The resulting list is ordered by the env files priority from lowest to highest.

Also, make a note that the `.env.local` file is not included when the value of `node_env` is "test"`, since normally you expect tests to produce the same results for everyone.


##### Parameters:

##### `dirname`

###### Type: `string`

A path to `.env*` files' directory.

##### `[options.node_env]`

###### Type: `string`

The node environment (development/test/production/etc,).


##### Returns:

###### Type: `string[]`

A list of `.env*` filenames.


##### Example:

```js
const dotenvFlow = require('dotenv-flow');

const filenames = dotenvFlow.listDotenvFiles('/path/to/project', { node_env: 'development' });

console.log(filenames); // will output the following:
// > [ '/path/to/project/.env',
// >   '/path/to/project/.env.local',
// >   '/path/to/project/.env.development',
// >   '/path/to/project/.env.development.local' ]
```


#### `.parse(filenames, [options]) => object`

Parses the content of a given file(s) to use the result programmatically. Accepts a filename or a list of filenames and returns a map of the parsed key/values as an object.

When several filenames are given, the parsed variables are merged into a single object using the "overwrite" strategy.


##### Parameters:

##### `filenames`

###### Type: `string|string[]`

A filename or a list of filenames to parse.

##### `[options.encoding]`

###### Type: `string`

An optional encoding for reading files.


##### Returns:

###### Type: `object`

The resulting map of `{ env_var: value }` as an object.


##### Example:

```sh
# .env

FOO=bar
BAZ=bar
```

```sh
# .env.local

BAZ=qux
```

```js
const dotenvFlow = require('dotenv-flow');

const variables = dotenvFlow.parse([
  '/path/to/project/.env',
  '/path/to/project/.env.local'
]);

console.log(typeof variables, variables); // > object { FOO: 'bar', BAZ: 'qux' }
```


#### `.load(filenames, [options]) => object`

Loads variables defined in a given file(s) into `process.env`.

When several filenames are given, the parsed variables are merged using the "overwrite" strategy.

Merging the parsed environment variables into `process.env` is done using the "append" strategy, thus giving the higher priority to the environment variables that are predefined by the shell.


##### Parameters:

##### `filenames`

###### Type: `string|string[]`

A filename or a list of filenames to load.

##### `[options.encoding]`

###### Type: `string`

An optional encoding for reading files.


##### Returns:

###### Type: `object`

The returning object have the same shape as the `.config()`'s, it will contain the `parsed` property with a parsed content of a given file(s) or the `error` property if the parsing is failed.


##### Example:

```sh
# .env

FOO=bar
BAZ=bar
```

```sh
# .env.local

BAZ=qux
```

```js
const dotenvFlow = require('dotenv-flow');

process.env.BAZ = 'Yay!';

const result = dotenvFlow.load([
  '/path/to/project/.env',
  '/path/to/project/.env.local'
]);

console.log(typeof result, result); // > object { parsed: { FOO: 'bar', BAZ: 'qux' } }

console.log(process.env.FOO); // > 'bar'
console.log(process.env.BAZ); // > 'Yay!'
```


#### `.unload(filenames, [options]) => void`

Unloads variables defined in a given file(s) from `process.env`.

The environment variables that are predefined (i.e. by the shell) will not be unloaded.


##### Parameters:

##### `filenames`

###### Type: `string|string[]`

A filename or a list of filenames to unload.

##### `[options.encoding]`

###### Type: `string`

An optional encoding for reading files.


##### Example:

```sh
# .env

FOO=bar
BAZ=bar
```

```sh
# .env.local

BAZ=qux
```

```js
const dotenvFlow = require('dotenv-flow');

process.env.BAZ = 'Yay!';

dotenvFlow.load([
  '/path/to/project/.env',
  '/path/to/project/.env.local'
]);

console.log(process.env.FOO); // > 'bar'
console.log(process.env.BAZ); // > 'Yay!'

dotenvFlow.unload([
  '/path/to/project/.env',
  '/path/to/project/.env.local'
]);

console.log(process.env.FOO); // > undefined
console.log(process.env.BAZ); // > 'Yay!'
```

---


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
