'use strict';

const fs = require('fs');
const {resolve} = require('path');
const dotenv = require('dotenv');
const yaml = require('js-yaml');

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
function listDotenvFiles(dirname, options = {}) {
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
 * When several filenames are given, the parsed environment variables are merged using the "overwrite" strategy.
 *
 * @param {string|string[]} filenames - filename or a list of filenames to parse
 * @param {object} [options] - `fs.readFileSync` options
 * @return {object} the resulting map of `{ env_var: value }` as an object
 */
function parse(filenamesArg, options = {}) {

  function parseFile(filename, schema = 'properties') {
    const envFileContent = fs.readFileSync(filename, options);
    if (schema === 'properties') {
      return dotenv.parse(envFileContent);
    }
    return yaml.safeLoad(envFileContent, {'schema': options.schema === 'yaml'? yaml.DEFAULT_SAFE_SCHEMA: yaml.JSON_SCHEMA});
  }
  const filenames = typeof(filenamesArg) === 'string'? [filenamesArg] : filenamesArg;

  return filenames.reduce((parsed, filename) => Object.assign(parsed, parseFile(filename, options.schema)), {});
}

/**
 * Load variables defined in a given file(s) into `process.env`.
 *
 * When several filenames are given, parsed environment variables are merged using the "overwrite" strategy since it utilizes `.parse()` for doing this.
 * But eventually, assigning the resulting environment variables to `process.env` is done using the "append" strategy,
 * thus giving a higher priority to the environment variables predefined by the shell.
 *
 * @param {string|string[]} filenames - filename or a list of filenames to load
 * @param {object} [options] - file loading options
 * @param {string} [options.encoding="utf8"] - encoding of `.env*` files
 * @param {boolean} [options.silent=false] - suppress all the console outputs except errors and deprecations
 * @param {string} [options.schema="properties"] - schema of `.env.*` files (properties, yaml, json)
 * @return {object} with a `parsed` key containing the loaded content or an `error` key with an error that is occurred
 */
function load(filenames, options = {}) {
  try {
    const parsed = parse(filenames, {
      encoding: options.encoding,
      schema: options.schema ?? 'properties'
    });

    Object.keys(parsed).forEach((key) => {
      if (!process.env.hasOwnProperty(key)) {
        process.env[key] = parsed[key];
      }
      else if (!options.silent) {
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
 * In some cases the original "dotenv" library can be used by one of the dependent npm modules.
 * It causes calling the original `dotenv.config()` that loads the `.env` file from your project before you can call `dotenv-flow.config()`.
 * Such cases breaks `.env*` files priority because the previously loaded environment variables are treated as shell-defined thus having a higher priority.
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
 * @param {string} [options.schema="prop"] - format of `.env*` files (prop, schema)
 * @return {{ parsed?: object, error?: Error }} with a `parsed` key containing the loaded content or an `error` key with an error that is occurred
 */
function config(options = {}) {
  const node_env = options.node_env || process.env.NODE_ENV || options.default_node_env;

  if (options.schema){
    const schemaValues = ['properties', 'yaml', 'json'];
    if (!schemaValues.includes(options.schema)){
      throw('dotenv-flow: invalid value specified for option schema. Possible values are `properties` (default), `yaml`, or `json`.')
    }
  }

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
    silent = false,
    schema = 'properties'
  } = options;

  try {
    if (options.purge_dotenv) {
      unload(resolve(path, '.env'), { encoding });
    }

    const existingFiles = (
      listDotenvFiles(path, { node_env })
        .filter(filename => fs.existsSync(filename))
    );

    return load(existingFiles, { encoding, silent, schema });
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
