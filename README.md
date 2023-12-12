# dotenv-flow

<img src="https://raw.githubusercontent.com/kerimdzhanov/dotenv-flow/master/dotenv-flow@2x.png" alt="dotenv-flow" width="280" height="140" align="right" />

> _[dotenv](https://github.com/motdotla/dotenv) is a zero-dependency npm module that loads environment variables from a `.env` file into [`process.env`](https://nodejs.org/docs/latest/api/process.html#process_process_env)._

**dotenv-flow** extends _dotenv_, adding support of `NODE_ENV`-specific `.env*` files _like `.env.development`, `.env.test`, `.env.stage`, and `.env.production`,_ and the appropriate `.env*.local` overrides.

It allows your app to have multiple environments _(like "development", "test", "stage", and "production" respectively)_ with selectively-adjusted environment variable setups and load them dynamically depending on the current `NODE_ENV`.

In addition to that, `.env*.local` overrides add the ability to overwrite variables locally for development, testing, and debugging purposes
_(note that the appropriate `.env*.local` entry should be added to your `.gitignore`)_.

🌱 Inspired by _Ruby's **dotenv** (a.k.a. `dotenv-rails`) gem_, _CreateReactApp's **storing configs in `.env*` files** approach_,
the _Twelve-Factor App methodology_ in general, and _its **[store config in the environment](https://12factor.net/config)** section_ in particular.

[![Build Status](https://github.com/kerimdzhanov/dotenv-flow/actions/workflows/ci.yml/badge.svg?branch=master&event=push)](https://github.com/kerimdzhanov/dotenv-flow/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/dotenv-flow.svg)](https://badge.fury.io/js/dotenv-flow)
[![Known Vulnerabilities](https://snyk.io/test/github/kerimdzhanov/dotenv-flow/badge.svg?targetFile=package.json)](https://snyk.io/test/github/kerimdzhanov/dotenv-flow?targetFile=package.json)
[![npm downloads](https://badgen.net/npm/dw/dotenv-flow)](https://www.npmjs.com/package/dotenv-flow)

## Installation

Using NPM:

```sh
$ npm install dotenv-flow --save
```

Using Yarn:

```sh
$ yarn add dotenv-flow
```

Using PNPM:

```sh
$ pnpm add dotenv-flow
```


## Usage

As early as possible in your Node.js app, initialize **dotenv-flow**:

```js
require('dotenv-flow').config();
```

It will allow you to configure and use **dotenv-flow** from your code programmatically.

If you're using TypeScript or ES Modules:

```ts
import dotenvFlow from 'dotenv-flow';
dotenvFlow.config();
```

Alternatively, you can use the default config entry point that allows you to configure **dotenv-flow** using command switch flags or predefined environment variables:

```js
require('dotenv-flow/config');
```

Or even make **dotenv-flow** load environment variables for your app without adding it to the code using preload technique:

```sh
$ node -r "dotenv-flow/config" your_app.js
```

It works with `ts-node` as well:

```sh
$ ts-node -r "dotenv-flow/config" your_app.ts
```

### How it works
Once **dotenv-flow** is initialized (using `.config` or any other method above), environment variables defined in your `.env*` files are loaded and become accessible in your Node.js app via `process.env.*`.

For example, let's suppose that you have the following `.env*` files in your project:

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

DATABASE_USER=local-user
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

And if you run `your_script.js` in the **development** environment, like:

```sh
$ NODE_ENV=development node your_script.js
```

you'll get the following output:

```text
database host: 127.0.0.1
database port: 27017
database user: local-user
database pass: super-secret
database name: my_app_dev
```

Or if you run the same script in the **production** environment:

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

Note that the `.env*.local` files should be ignored by your version control system (refer the [Files under version control](#files-under-version-control) section below to learn more), and you should have the `.env.production.local` file only on your production deployment machine.


### `NODE_ENV`-specific env files

Actually, **dotenv-flow** doesn't have any predefined environment names, so you may use whatever names you want.
However, it's a good practice to use the world's universally recognized environment names like `development`, `test`, `production`, as well as frequently used `qa` or `stage`.

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

The `--node-env` switch is also supported:

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

The main point here is not to commit production database passwords, API keys and other sensitive things to your source code repository,
but it's still nice to have default database connections, ports, hosts, etc., for development and testing purposes to keep your code clean and simple.

Understanding the above, we have the following approach:

You can keep all the fallback values in the default `.env` file, that (if exists) will always be loaded by default.
Also, it is a good place to have all the application used environment variables there, thus having a reference of environment variables that are used by your application on the whole.
So it is a good reason to share the `.env` file with other developers in your team, but keep all the sensitive data on your own (or production) machine locally in the `.env*.local` files.

It is not necessary, but also a good practice to use `NODE_ENV` to control the environment to run your application in.
And if you follow this practice you can keep the `NODE_ENV`-specific defaults in your `.env.development`, `.env.test`, `.env.production` files sharing them with your team as well.
Any `NODE_ENV`-specific `.env.*` file's values can also be overwritten in the appropriate `.env.*.local` file (i.e. `.env.development.local`, `.env.test.local`, `.env.production.local`).

Summarizing the above, you can have the following `.env*` files in your project:

 * `.env` – for default (fallback) values, **tracked** by VCS
 * `.env.development` – for development environment, **tracked** by VCS
 * `.env.test` – for test environment, **tracked** by VCS
 * `.env.production` – for production environment, **tracked** by VCS
 * `.env.local` – for individual default values, **ignored** by VCS
 * `.env.development.local` – for individual development environment values, **ignored** by VCS
 * `.env.test.local` – for individual test environment values, **ignored** by VCS
 * `.env.production.local` – for production environment values (DB passwords, API keys, etc.), **ignored** by VCS

Note that `.env.*` file names may vary in your project depending on your own needs/preferences, just keep in mind that `.env*.local` files should be untracked (ignored) by your version control system.

Here is an example of the `.gitignore` (or `.hgignore`) file entry to keep it clear:

```gitignore
# local .env* files
.env.local
.env.*.local
```


## Variables overwriting/priority

Since multiple `.env*` files are loaded simultaneously, all the variables defined in these files are merged in the following order:

1) The `.env` file has the lowest priority. _Keep the most default (fallback) values there_;
2) The `.env.local` file has a priority over the `.env` (except when `NODE_ENV=test`, in which case this file is not loaded). _Create it if you want to overwrite the default values for your own environment-specific needs_;
3) `NODE_ENV`-specific env files (like `.env.development`, `.env.test`, etc.) have a priority over the default `.env` and `.env.local` files. _Keep `NODE_ENV`-specific environment variables there_;
4) `NODE_ENV`-specific local env files (`.env.development.local`, `.env.production.local`, etc.) have the highest priority over all the env files. _As with `.env.local`, create them only if you need to overwrite `NODE_ENV`-specific values for your own environment-specific needs_;
5) Environment variables that are already set will not be overwritten, that means that the command line variables have a higher priority over all those defined in env files;


## Alternative defaults: `.env.defaults` 

In addition to `.env`, you may also use `.env.defaults` to store default (fallback) values.

This may come handy e.g. when migrating from [dotenv](https://github.com/motdotla/dotenv) (where it is strongly advised against committing `.env` file to VCS)
and you already have `.env` file used to store your local values.

In such case, you may prefer to keep using your existing `.env` (**ignored** by VCS) as your local config
and create additional `.env.defaults` (**tracked** by VCS) file which will be loaded before `.env`. 

Then at every place `.env` is mentioned in the docs, read it as: "`.env.defaults` first, then `.env`".


## `dotenv-flow/config` options

The following configuration options can be used when:
- a) preloading **dotenv-flow** using Node's `-r` (`[ts-]node --require`) switch, or…
- b) `require`ing the `dotenv-flow/config` entry point (using `require('dotenv-flow/config');`).

### Environment variables

* `NODE_ENV` => [`options.node_env`](#optionsnode_env);
* `DEFAULT_NODE_ENV` => [`options.default_node_env`](#optionsdefault_node_env);
* `DOTENV_FLOW_PATH` => [`options.path`](#optionspath);
* `DOTENV_FLOW_PATTERN` => [`options.pattern`](#optionspattern);
* `DOTENV_FLOW_ENCODING` => [`options.encoding`](#optionsencoding);
* `DOTENV_FLOW_PURGE_DOTENV` => [`options.purge_dotenv`](#optionspurge_dotenv);
* `DOTENV_FLOW_DEBUG` => [`options.debug`](#optionsdebug);
* `DOTENV_FLOW_SILENT` => [`options.silent`](#optionssilent);

##### _for example:_
```sh
$ NODE_ENV=production DOTENV_FLOW_PATH=/path/to/env-files-dir node -r dotenv-flow/config your_script.js
```

### Command line switches

* `--node-env` => [`options.node_env`](#optionsnode_env);
* `--default-node-env` => [`options.default_node_env`](#optionsdefault_node_env);
* `--dotenv-flow-path` => [`options.path`](#optionspath);
* `--dotenv-flow-pattern` => [`options.pattern`](#optionspattern);
* `--dotenv-flow-encoding` => [`options.encoding`](#optionsencoding);
* `--dotenv-flow-purge-dotenv` => [`options.purge_dotenv`](#optionspurge_dotenv);
* `--dotenv-flow-debug` => [`options.debug`](#optionsdebug);
* `--dotenv-flow-silent` => [`options.silent`](#optionssilent);

> Make sure that **dotenv-flow/config**-specific CLI switches are separated from Node's by `--` (double dash) since they are not recognized by **Node.js**.

##### _for example:_
```sh
$ node --require dotenv-flow/config your_script.js -- --dotenv-flow-path=/path/to/project --dotenv-flow-encoding=base64
```


## API reference

#### `.config([options]) => object`

"dotenv-flow" initialization function (API entry point).

Allows configuring dotenv-flow programmatically.

Also, like the original module ([dotenv](https://github.com/motdotla/dotenv)),
it returns an `object` with `.parsed` property containing the resulting
`varname => values` pairs or `.error` property if the initialization is failed.

##### `options.node_env`
###### Type: `string`
###### Default: `process.env.NODE_ENV`

With the `node_env` option you can force the module to use your custom environment value independent of `process.env.NODE_ENV`:

```js
require('dotenv-flow').config({
  node_env: process.argv[2] || 'development'
});
```

##### `options.default_node_env`
###### Type: `string`
###### Default: _undefined_

If the `NODE_ENV` environment variable is not set, the module doesn't load/parse any `NODE_ENV`-specific files at all.
Therefore, you may want to use `"development"` as a default environment, like:

```js
require('dotenv-flow').config({
  default_node_env: 'development'
});
```

To be clear, just make a note that all the following initialization examples are also equivalent:

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

All the examples above, considers the value of `process.env.NODE_ENV` at first, and if it is not set, uses `"development"` as the value by default.
You can just choose one that looks prettier for you.

##### `options.path`
###### Type: `string`
###### Default: `process.cwd()` _(current working directory)_

With the `path` initialization option you can specify a path to `.env*` files directory:

```js
require('dotenv-flow').config({
  path: '/path/to/env-files-dir'
});
```

If the option is not provided, the current working directory is used.

##### `options.pattern`
###### Type: `string`
###### Default: `".env[.node_env][.local]"`

Allows you to change the default `.env*` files' naming convention
if you want to have a specific file naming structure for maintaining
your environment variables' files.

**Default Value**

The default value `".env[.node_env][.local]"` makes *dotenv-flow* look up
and load the following files in order:

1. `.env`
2. `.env.local`
3. `.env.${NODE_ENV}`
4. `.env.${NODE_ENV}.local`

For example, when the `proess.env.NODE_ENV` (or `options.node_env`) is set to `"development"`,
*dotenv-flow* will be looking for and parsing (if found) the following files:

1. `.env`
2. `.env.local`
3. `.env.development`
4. `.env.development.local`

**Custom Pattern**

Here is a couple of examples of customizing the `.env*` files naming convention:

For example, if you set the pattern to `".env/[local/]env[.node_env]"`,
*dotenv-flow* will look for these files instead:

1. `.env/env`
2. `.env/local/env`
3. `.env/env.development`
4. `.env/local/env.development`

… or if you set the pattern to `".env/[.node_env/].env[.node_env][.local]"`,
*dotenv-flow* will try to find and parse:

1. `.env/.env`
2. `.env/.env.local`
3. `.env/development/.env.development`
4. `.env/development/.env.development.local`

› Please refer to [`.listFiles([options])`](#listfiles-options--string) to dive deeper.

##### `options.files`
###### Type: `string[]`

Allows explicitly specifying a list (and the order) of `.env*` files to load.

Note that options like `node_env`, `default_node_env`, and `pattern` are ignored in this case.

```js
require('dotenv-flow').config({
  files: [
    '.env',
    '.env.local',
    `.env.${process.env.NODE_ENV}`, // '.env.development'
    `.env.${process.env.NODE_ENV}.local` // '.env.development.local'
  ]
});
```

##### `options.encoding`
###### Type: `string`
###### Default: `"utf8"`

You can specify the encoding for reading your files containing environment variables.

```js
require('dotenv-flow').config({
  encoding: 'base64'
});
```

##### `options.purge_dotenv`
###### Type: `boolean`
###### Default: `false`

In some cases the original "dotenv" library can be used by one of the dependent
npm modules. It causes calling the original `dotenv.config()` that loads
the `.env` file from your project before you can call `dotenv-flow.config()`.

Such cases breaks `.env*` files priority because the previously loaded
environment variables are treated as shell-defined thus having a higher priority.

Setting the `purge_dotenv` option to `true` can gracefully fix this issue.

```js
require('dotenv-flow').config({
  purge_dotenv: true
});
```

##### `options.debug`
###### Type: `boolean`
###### Default: `false`

Enables detailed logging to debug why certain variables are not being set as you expect.

##### `options.silent`
###### Type: `boolean`
###### Default: `false`

Suppresses all kinds of warnings including ".env*" files' loading errors.

```js
require('dotenv-flow').config({
  silent: true
});
```

---

The following API is considered as internal, although it's exposed
for programmatic use of **dotenv-flow** for your own project-specific needs.


#### `.listFiles([options]) => string[]`

Returns a list of existing `.env*` filenames depending on the given `options`.

The resulting list is ordered by the env files'
variables overwriting priority from lowest to highest.

This can also be referenced as "env files' environment cascade"
or "order of ascending priority."

⚠️ Note that the `.env.local` file is not listed for "test" environment,
since normally you expect tests to produce the same results for everyone.

##### Parameters:

##### `options.node_env`
###### Type: `string`
###### Default: _undefined_

The node environment (a.k.a. `process.env.NODE_ENV`).

The conventionally used values are `"development"`, `"test"`
(or `"staging"`) and `"production"`, also commonly used are `"qa"`, `"uat"`, `"ci"`.


##### `options.pattern`
###### Type: `string`
###### Default: `".env[.node_env][.local]"`

`.env*` files' naming convention pattern.

The default one, (`".env[.node_env][.local]"`) without `options.node_env` given,
produces the following list of filenames:

- `.env`
- `.env.local`

When `options.node_env` is set, for example to `"development"`,
it appends "node_env-specific" filenames, that will make `.listFiles` to return:

- `.env`
- `.env.local`
- `.env.development`
- `.env.development.local`

Another example might be the pattern `".env/[local/]env[.node_env]"`,
that without `options.node_env` will produce:

- `.env/env`
- `.env/local/env`

… and if `options.node_env` is set to (for example) `"development"`,
will append "node_env-specific" files producing the following:

- `.env/env`
- `.env/local/env`
- `.env/env.development`
- `.env/local/development`

Also, note that if `[node_env]` placeholders is missing in the pattern,
none of the "node_env-specific" files fill be listed.
For example, a pattern like `".env[.local]"`,
independently of whether the `options.node_env` is set, will always produce:

- `.env`
- `.env.local`

… except the case when `options.node_env` is set to `"test"`,
which (as mentioned above) will exclude `.env.local` producing just a single:

- `.env`

… since normally we expect tests to produce the same results for everyone.


##### `options.debug`
###### Type: `boolean`
###### Default: `false`

Enables debug messages.


##### Returns:

###### Type: `string[]`

A list of `.env*` filenames.


##### Example:

```js
const dotenvFlow = require('dotenv-flow');

const filenames = dotenvFlow.listFiles({ node_env: 'development' });

console.log(filenames); // will output the following:
// > [ '/path/to/project/.env.defaults',
// >   '/path/to/project/.env',
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


##### `options.encoding`
###### Type: `string`
###### Default: `"utf8"`

An optional encoding for reading files.


##### `options.debug`
###### Type: `boolean`
###### Default: `false`

Enables debug messages.


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

When several filenames are given, parsed environment variables are merged using the "overwrite" strategy since it utilizes [`.parse()`](#parsefilenames-options--object) for doing this.
But eventually, assigning the parsed environment variables to `process.env` is done using the "append" strategy, thus giving a higher priority to the environment variables predefined by the shell.


##### Parameters:

##### `filenames`
###### Type: `string|string[]`

A filename or a list of filenames to load.

##### `options.encoding`
###### Type: `string`
###### Default: `"utf8"`

An optional encoding for reading files.

##### `options.debug`
###### Type: `boolean`
###### Default: `false`

Optionally, turn on debug messages.

##### `options.silent`
###### Type: `boolean`
###### Default: `false`

If enabled, suppresses all kinds of warnings including ".env*" files' loading errors.

##### Returns:

###### Type: `object`

The same as `.config()`, the returning object contains
`.parsed` property with a parsed content of the given file(s),
or if parsing is failed the `.error` property with a reference
to the reasoning error.

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

##### `options.encoding`
###### Type: `string`
###### Default: `"utf8"`

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


## Related packages

* [`@types/dotenv-flow`](https://www.npmjs.com/package/@types/dotenv-flow) – type definitions for using `dotenv-flow` with TypeScript
* [`dotenv-flow-webpack`](https://github.com/kerimdzhanov/dotenv-flow-webpack) – a webpack plugin for using `dotenv-flow` in web applications
* [`dotenv-flow-cli`](https://github.com/ovos/dotenv-flow-cli) – CLI executable that preloads environment variables using `dotenv-flow`
* [`dotenv-expand`](https://github.com/motdotla/dotenv-expand) – environment variables expansion _(originally designed for `dotenv`, but also compatible with `dotenv-flow`)_


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

Licensed under [MIT](LICENSE) © 2018-2023 Dan Kerimdzhanov
