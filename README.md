# dotenv-flow

[dotenv](https://github.com/motdotla/dotenv) is a zero-dependency module that loads environment variables
from a `.env` file into [`process.env`](https://nodejs.org/docs/latest/api/process.html#process_process_env).

**dotenv-flow**, in turn, extends **dotenv** adding an ability to have multiple env files, e.g `.env`,
`.env.development`, `.env.test`, `env.production`, `.env.local`, `env.development.local` etc,.

[![npm version](https://badge.fury.io/js/dotenv-flow.svg)](https://badge.fury.io/js/dotenv-flow)
[![Build Status](https://travis-ci.org/kerimdzhanov/dotenv-flow.svg?branch=master)](https://travis-ci.org/kerimdzhanov/dotenv-flow)
[![dependencies status](https://david-dm.org/kerimdzhanov/dotenv-flow/status.svg)](https://david-dm.org/kerimdzhanov/dotenv-flow)

## Installation

Using NPM:

```bash
$ npm install dotenv-flow --save
```

Using Yarn:

```bash
$ yarn add dotenv-flow
```


## Usage

As early as possible in your application, require and configure dotenv-flow.

```js
require('dotenv-flow').config();
```

This will load environment variables from `.env` as usual, but will also read variables defined in `.env.local` if the file exists,
and if the `NODE_ENV` environment variable is provided, the `.env.${NODE_ENV}` file will also be loaded.

When running, your `process.env` will have keys and values you've defined in your `.env*` files.


## `NODE_ENV`-specific env files

Actually **dotenv-flow** have no any "predefined" environments, so you may have whatever environment names you want,
but it's a good practice to use world's universally recognized environment names like `development`, `test`, `production`,
and also frequently used `qa` or `stage`.

The naming convention for `NODE_ENV`-specific files is simply as `.env.${NODE_ENV}`, i.e `.env.development`, `.env.test`, `.env.production`.

To activate specific environment run your application with predefined `NODE_ENV` environment variable, like:

```sh
$ export NODE_ENV=production
$ node your_script.js
```

or:

```sh
$ NODE_ENV=production node your_script.js
```

Or if you are on Windows:

```cmd
> SET NODE_ENV=production
> node your_script.js
```


## Files under version control

**dotenv** doesn't recommend to commit `.env` file and it is true when you are using **dotenv** with its single `.env` file approach.
**dotenv-flow**, in turn, has a different way to manage your environment variables:

The main reason is to not commit database passwords, API keys and other secure things.
For this purposes you'll need to have `.env.local` file that is an individual environment specific and **must** be ignored by VCS.

Thus, the `.env` file became tracked by VCS and it is a really good place to have the default values for all environment variables used by your application.

The `NODE_ENV`-specific files (`.env.development`, `.env.test`, `.env.production`) are also should be under the version control.

Summarizing the above, you can have the following `.env*` files in your project:

 * `.env` – for default values, tracked by VCS
 * `.env.development` – for development environment, tracked by VCS
 * `.env.test` – for test environment, tracked by VCS
 * `.env.production` – for production environment, tracked by VCS
 * `.env.local` – for individual default values, ignored by VCS
 * `.env.development.local` – for individual development environment values, ignored by VCS
 * `.env.test.local` – for individual test environment values, ignored by VCS
 * `.env.production.local` – for production environment values (DB passwords, API keys, etc.), ignored by VCS

Here is an example of `.gitignore`/`.hgignore` entry to keep it clean:

```
# local .env* files
.env.local
.env.*.local
```


## Variables overwriting/priority

Since multiple `.env*` files are loaded together at the same time, all the variables defined there are merged in the following order:

1) `.env` file have a lowest priority over all, keep the most default values there;
2) `.env.local` file have a priority over the `.env`, create it if you want to overwrite the default values only for your environment-specific needs;
3) `NODE_ENV`-specific env files (`.env.development`, `.env.test`, etc.) have a priority over the default `.env` and `.env.local` files, keep default `NODE_ENV`-specific environment variables here;
4) `NODE_ENV`-specific local env files (`.env.development.local`, `.env.production.local`, etc.) have a highest priority, as with `.env.local`, create them only if you need to overwrite `NODE_ENV`-specific default values for your individual needs;
5) if any variables are already defined in the environment before reading from `.env*`, they will not be overwritten, thus having the higher priority over defined in any env file;


## API reference

As an extension of [dotenv](https://github.com/motdotla/dotenv), **dotenv-flow** has the same API adding the following initialization options:

##### `node_env`

By default, the module refers the `NODE_ENV` environment variable to detect the environment to use.
With the `node_env` option you can force the module to use your custom environment value independent of `process.env.NODE_ENV`.

###### Example
```js
require('dotenv-flow').config({
  node_env: process.argv[2] || 'development'
});
```

##### `default_node_env`

If the `NODE_ENV` environment variable is not set, the module doesn't load/parse any `NODE_ENV`-specific files at all.
Therefore, you may want to use `"development"` as the default environment.

###### Example
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

##### `cwd`

With the `cwd` initialization option you can specify a path to `.env*` files directory:

```js
require('dotenv-flow').config({ cwd: '/path/to/my/project' });
```

If the option is not provided, the current working directory is used.

##### `purge_dotenv`

In some cases the original "dotenv" library can be used by one of the dependent
npm modules. It causes calling the original `dotenv.config()` that loads
the `.env` file from your project before you can call `dotenv-flow.config()`.

Such cases breaks `.env*` files priority because the previously loaded
environment variables are treated as shell-defined thus having the higher priority.

Setting the `purge_dotenv` option to `true` can gracefully fix this issue.

```js
require('dotenv-flow').config({ purge_dotenv: true });
```


## Contributing

Feel free to dive in! [Open an issue](https://github.com/kerimdzhanov/dotenv-flow/issues/new) or submit PRs.


## Running tests

Using NPM:

```bash
$ npm test
```

Using Yarn:

```bash
$ yarn test
```


## License

Licensed under [MIT](LICENSE) © 2018 Dan Kerimdzhanov
