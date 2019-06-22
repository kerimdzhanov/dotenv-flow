'use strict';

const fs = require('fs');
const {resolve} = require('path');
const dotenv = require('dotenv');

/**
 * Returns a list of `.env*` filenames ordered by the env files priority from lowest to highest.
 *
 * Also, make a note that the `.env.local` file is not included when the value of `node_env` is "test"`,
 * since normally you expect tests to produce the same results for everyone.
 *
 * @param {string} dirname - path to `.env*` files' directory
 * @param {object} [options] - `.env*` files listing options
 * @param {string} [options.node_env] - node environment (development/test/production/etc,.)
 * @return {string[]}
 */
function listDotenvFiles(dirname, options = {}) {
  const {node_env} = options;

  return [
    resolve(dirname, '.env'),
    (node_env !== 'test') && resolve(dirname, '.env.local'),
    node_env && resolve(dirname, `.env.${node_env}`),
    node_env && resolve(dirname, `.env.${node_env}.local`)
  ]
    .filter(filename => Boolean(filename));
}

/**
 * Parse a given file(s) to use the result programmatically.
 *
 * When several filenames are given, the parsed variables are merged using the "overwrite" strategy.
 *
 * @param {string|string[]} filenames - filename or a list of filenames to parse
 * @param {object} [options] - `fs.readFileSync` options
 * @return {object} the resulting map of `{ env_var: value }` as an object
 */
function parse(filenames, options = {}) {
  if (typeof filenames === 'string') {
    return dotenv.parse(fs.readFileSync(filenames, options));
  }

  return filenames.reduce((parsed, filename) => {
    return Object.assign(parsed, dotenv.parse(fs.readFileSync(filename, options)));
  }, {});
}

/**
 * Load variables defined in a given file(s) into `process.env`.
 *
 * When several filenames are given, the parsed variables are merged using the "overwrite" strategy.
 *
 * Merging the parsed environment variables into `process.env` is done using the "append" strategy,
 * thus giving the higher priority to the environment variables that are predefined by the shell.
 *
 * @param {string|string[]} filenames - filename or a list of filenames to load
 * @param {object} [options] - `fs.readFileSync` options
 * @return {object} with a `parsed` key containing the loaded content or an `error` key with an error that is occurred
 */
function load(filenames, options = {}) {
  try {
    const parsed = parse(filenames, options);

    Object.keys(parsed).forEach((key) => {
      if (!process.env.hasOwnProperty(key)) {
        process.env[key] = parsed[key];
      }
      else {
        console.warn('dotenv-flow: "%s" is already defined in `process.env` and will not be overwritten', key); // >>>
      }
    });

    return { parsed };
  }
  catch (error) {
    return { error };
  }
}

/**
 * Unload variables defined in a given file(s) from `process.env`.
 *
 * This function can gracefully resolve the following issue:
 *
 * In some cases the original "dotenv" library can be used by one of the dependent
 * npm modules. It causes calling the original `dotenv.config()` that loads
 * the `.env` file from your project before you can call `dotenv-flow.config()`.
 * Such cases breaks `.env*` files priority because the previously loaded
 * environment variables are treated as shell-defined thus having the higher priority.
 *
 * Unloading the previously loaded `.env` file can be activated when using the `dotenv-flow.config()` with the `purge_dotenv` option set to `true`.
 *
 * @param {string|string[]} filenames - filename or a list of filenames to unload
 * @param {object} [options] - `fs.readFileSync` options
 */
function unload(filenames, options = {}) {
  const parsed = parse(filenames, options);

  Object.keys(parsed).forEach((key) => {
    if (process.env[key] === parsed[key]) {
      delete process.env[key];
    }
  });
}

/**
 * Main entry point into the "dotenv-flow". Allows configuration before loading `.env*` files.
 *
 * @param {object} options - options for parsing `.env*` files
 * @param {string} [options.node_env=process.env.NODE_ENV] - node environment (development/test/production/etc,.)
 * @param {string} [options.default_node_env] - the default node environment
 * @param {string} [options.path=process.cwd()] - path to `.env*` files directory
 * @param {string} [options.encoding="utf8"] - encoding of `.env*` files
 * @param {boolean} [options.purge_dotenv=false] - perform the `.env` file {@link unload}
 * @return {object} with a `parsed` key containing the loaded content or an `error` key with an error that is occurred
 */
function config(options = {}) {
  const node_env = options.node_env || process.env.NODE_ENV || options.default_node_env;

  let path;
  if (options.path) {
    path = options.path;
  }
  else if (options.cwd) {
    console.warn('dotenv-flow: `options.cwd` is deprecated, please use `options.path` instead'); // >>>
    path = options.cwd;
  }
  else {
    path = process.cwd();
  }

  const _options = {}; // `fs.readFile` options
  if (options.encoding) {
    _options.encoding = options.encoding;
  }

  try {
    if (options.purge_dotenv) {
      unload(resolve(path, '.env'), _options);
    }

    const existingFiles = (
      listDotenvFiles(path, { node_env })
        .filter(filename => fs.existsSync(filename))
    );

    return load(existingFiles, _options);
  }
  catch (error) {
    return { error };
  }
}

module.exports = {
  listDotenvFiles,
  parse,
  load,
  unload,
  config
};
