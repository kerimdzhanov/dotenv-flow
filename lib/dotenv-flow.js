'use strict';

const fs = require('fs');
const {resolve} = require('path');
const dotenv = require('dotenv');

/**
 * Returns a list of `.env*` filenames ordered by the env files priority from lowest to highest.
 *
 * Also, make a note that the `.env.local` file is not included when the value of `node_env` is `"test"`,
 * since normally you expect tests to produce the same results for everyone.
 *
 * @param {string} dirname - path to `.env*` files' directory
 * @param {object} [options] - `.env*` files listing options
 * @param {string} [options.node_env] - node environment (development/test/production/etc,.)
 * @return {string[]}
 */
function listFiles(dirname, options = {}) {
  const {node_env} = options;

  return [
    resolve(dirname, '.env.defaults'),
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
 * When a list of filenames is given, the files will be parsed and merged in the same order as given.
 *
 * @param {string|string[]} filenames - filename or a list of filenames to parse and merge
 * @param {{ encoding?: string }} [options] - `fs.readFileSync` options
 * @return {Object<string, string>} the resulting map of `{ env_var: value }` as an object
 */
function parse(filenames, options) {
  if (typeof filenames === 'string') {
    return dotenv.parse(fs.readFileSync(filenames, options));
  }

  return filenames.reduce((parsed, filename) => {
    return Object.assign(parsed, parse(filename, options));
  }, {});
}

/**
 * Parses variables defined in given file(s) and assigns them to `process.env`.
 *
 * Variables that are already defined in `process.env` will not be overwritten,
 * thus giving a higher priority to environment variables predefined by the shell.
 *
 * If the loading is successful, an object with `parsed` property is returned.
 * The `parsed` property contains parsed variables' `key => value` pairs merged in order using
 * the "overwrite merge" strategy.
 *
 * If parsing fails for any of the given files, `process.env` is being left untouched,
 * and an object with `error` property is returned.
 * The `error` property, if present, references to the occurred error.
 *
 * @param {string|string[]} filenames - filename or a list of filenames to parse and merge
 * @param {object} [options] - file loading options
 * @param {string} [options.encoding="utf8"] - encoding of `.env*` files
 * @param {boolean} [options.silent=false] - suppress all the console outputs except errors and deprecations
 * @return {{ error: Error } | { parsed: Object<string, string> }}
 */
function load(filenames, options) {
  const _options = (options && options.encoding) ? { encoding: options.encoding } : undefined;
  const _verbose = !(options && options.silent);

  try {
    const parsed = parse(filenames, _options);

    for (const varname of Object.keys(parsed)) {
      if (!process.env.hasOwnProperty(varname)) {
        process.env[varname] = parsed[varname];
      }
      else if (_verbose) {
        console.warn('dotenv-flow: "%s" is already defined in `process.env` and will not be overwritten', varname); // >>>
      }
    }

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
 * In some cases, the original "dotenv" library can be used by one of the dependent npm modules.
 * It causes calling the original `dotenv.config()` that loads the `.env` file from your project before you can call `dotenv-flow.config()`.
 * Such cases break `.env*` files priority because the previously loaded environment variables are treated as shell-defined thus having a higher priority.
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
 * @param {object} [options] - configuration options
 * @param {string} [options.node_env=process.env.NODE_ENV] - node environment (development/test/production/etc,.)
 * @param {string} [options.default_node_env] - the default node environment
 * @param {string} [options.path=process.cwd()] - path to `.env*` files directory
 * @param {string} [options.encoding="utf8"] - encoding of `.env*` files
 * @param {boolean} [options.purge_dotenv=false] - perform the `.env` file {@link unload}
 * @param {boolean} [options.silent=false] - suppress all the console outputs except errors and deprecations
 * @return {{ parsed?: object, error?: Error }} with a `parsed` key containing the loaded content or an `error` key with an error that is occurred
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

  const {
    encoding = undefined,
    silent = false
  } = options;

  if (options.purge_dotenv) {
    const dotenvFile = resolve(path, '.env');
    try {
      fs.existsSync(dotenvFile) && unload(dotenvFile, { encoding });
    }
    catch (error) {
      return { error };
    }
  }

  try {
    const existingFiles = (
      listFiles(path, { node_env })
        .filter(filename => fs.existsSync(filename))
    );

    return load(existingFiles, { encoding, silent });
  }
  catch (error) {
    return { error };
  }
}

module.exports = {
  listFiles,
  listDotenvFiles: listFiles, // for API backward compatibility
  parse,
  load,
  unload,
  config
};
