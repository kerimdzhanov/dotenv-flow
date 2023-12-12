'use strict';

const fs = require('fs');
const p = require('path');
const dotenv = require('dotenv');
const {version} = require('../package.json');

const DEFAULT_PATTERN = '.env[.node_env][.local]';

const LOCAL_PLACEHOLDER_REGEX = /\[(\W*\blocal\b\W*)]/g;
const NODE_ENV_PLACEHOLDER_REGEX = /\[(\W*\b)node_env(\b\W*)]/g;

/**
 * Compose a filename from a given `patten`.
 *
 * @param {string} pattern
 * @param {object} [options]
 * @param {boolean} [options.local]
 * @param {string} [options.node_env]
 * @return {string} filename
 */
function composeFilename(pattern, options) {
  let filename = pattern;

  filename = filename.replace(
    LOCAL_PLACEHOLDER_REGEX,
    (options && options.local) ? '$1' : ''
  );

  filename = filename.replace(
    NODE_ENV_PLACEHOLDER_REGEX,
    (options && options.node_env) ? `$1${options.node_env}$2` : ''
  );

  return filename;
}

/**
 * Returns a list of existing `.env*` filenames depending on the given `options`.
 *
 * The resulting list is ordered by the env files'
 * variables overwriting priority from lowest to highest.
 *
 * This can also be referenced as "env files' environment cascade"
 * or "order of ascending priority."
 *
 * ⚠️ Note that the `.env.local` file is not listed for "test" environment,
 * since normally you expect tests to produce the same results for everyone.
 *
 * @param {object} [options] - `.env*` files listing options
 * @param {string} [options.node_env] - node environment (development/test/production/etc.)
 * @param {string} [options.path] - path to the working directory (default: `process.cwd()`)
 * @param {string} [options.pattern] - `.env*` files' naming convention pattern
 *                                       (default: ".env[.node_env][.local]")
 * @param {boolean} [options.debug] - turn on debug messages
 * @return {string[]}
 */
function listFiles(options = {}) {
  options.debug && debug('listing effective `.env*` files…');

  const {
    node_env,
    path = process.cwd(),
    pattern = DEFAULT_PATTERN,
  } = options;

  const hasLocalPlaceholder = LOCAL_PLACEHOLDER_REGEX.test(pattern);

  const filenames = {};

  if (pattern === DEFAULT_PATTERN) {
    filenames['.env.defaults'] = '.env.defaults'; // for seamless transition from ".env + .env.defaults"
  }

  filenames['.env'] = composeFilename(pattern);

  if (hasLocalPlaceholder) {
    const envlocal = composeFilename(pattern, { local: true });

    if (node_env !== 'test') {
      filenames['.env.local'] = envlocal;
    }
    else if (options.debug && fs.existsSync(p.resolve(path, envlocal))) {
      debug(
        '[!] note that `%s` is being skipped for "test" environment',
        envlocal
      );
    }
  }

  if (node_env && NODE_ENV_PLACEHOLDER_REGEX.test(pattern)) {
    filenames['.env.node_env'] = composeFilename(pattern, { node_env });

    if (hasLocalPlaceholder) {
      filenames['.env.node_env.local'] = composeFilename(pattern, { node_env, local: true });
    }
  }

  return [
    '.env.defaults',
    '.env',
    '.env.local',
    '.env.node_env',
    '.env.node_env.local'
  ]
    .reduce((list, basename) => {
      if (!filenames[basename]) {
        return list;
      }

      const filename = p.resolve(path, filenames[basename]);
      if (fs.existsSync(filename)) {
        options.debug && debug('>> %s', filename);
        list.push(filename);
      }

      return list;
    }, []);
}

/**
 * Parses a given file or a list of files.
 *
 * When a list of filenames is given, the files will be parsed and merged in the same order as given.
 *
 * @param {string|string[]} filenames - filename or a list of filenames to parse and merge
 * @param {{ encoding?: string, debug?: boolean }} [options] - parse options
 * @return {Object<string, string>} the resulting map of `{ env_var: value }` as an object
 */
function parse(filenames, options = {}) {
  if (typeof filenames === 'string') {
    options.debug && debug('parsing "%s"…', filenames);

    const parsed = dotenv.parse(
      fs.readFileSync(
        filenames,
        options.encoding && { encoding: options.encoding }
      )
    );

    if (options.debug) {
      Object.keys(parsed)
        .forEach(varname => debug('>> %s', varname));
    }

    return parsed;
  }

  return filenames.reduce((result, filename) => {
    const parsed = parse(filename, options);

    if (options.debug) {
      Object.keys(parsed)
        .filter(varname => result.hasOwnProperty(varname))
        .forEach(varname => debug('`%s` is being overwritten by merge from "%s"', varname, filename));
    }

    return Object.assign(result, parsed);
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
 * @param {boolean} [options.debug=false] - turn on debug messages
 * @param {boolean} [options.silent=false] - suppress console errors and warnings
 * @return {{ error: Error } | { parsed: Object<string, string> }}
 */
function load(filenames, options = {}) {
  try {
    const parsed = parse(filenames, {
      encoding: options.encoding,
      debug: options.debug
    });

    options.debug && debug('safe-merging parsed environment variables into `process.env`…');

    for (const varname of Object.keys(parsed)) {
      if (!process.env.hasOwnProperty(varname)) {
        options.debug && debug('>> process.env.%s', varname);
        process.env[varname] = parsed[varname];
      }
      else if (options.debug && process.env[varname] !== parsed[varname]) {
        debug('environment variable `%s` is predefined and not being overwritten', varname);
      }
    }

    return { parsed };
  }
  catch (error) {
    return failure(error, options);
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
 * Returns effective (computed) `node_env`.
 *
 * @param {object} [options]
 * @param {string} [options.node_env]
 * @param {string} [options.default_node_env]
 * @param {boolean} [options.debug]
 * @return {string|undefined} node_env
 */
function getEffectiveNodeEnv(options = {}) {
  if (options.node_env) {
    options.debug && debug(
      `operating in "${options.node_env}" environment (set by \`options.node_env\`)`
    );
    return options.node_env;
  }

  if (process.env.NODE_ENV) {
    options.debug && debug(
      `operating in "${process.env.NODE_ENV}" environment (as per \`process.env.NODE_ENV\`)`
    );
    return process.env.NODE_ENV;
  }

  if (options.default_node_env) {
    options.debug && debug(
      `operating in "${options.default_node_env}" environment (taken from \`options.default_node_env\`)`
    );
    return options.default_node_env;
  }

  options.debug && debug(
    'operating in "no environment" mode (no environment-related options are set)'
  );
  return undefined;
}

const CONFIG_OPTION_KEYS = [
  'node_env',
  'default_node_env',
  'path',
  'pattern',
  'files',
  'encoding',
  'purge_dotenv',
  'silent'
];

/**
 * "dotenv-flow" initialization function (API entry point).
 *
 * Allows configuring dotenv-flow programmatically.
 *
 * @param {object} [options] - configuration options
 * @param {string} [options.node_env=process.env.NODE_ENV] - node environment (development/test/production/etc.)
 * @param {string} [options.default_node_env] - the default node environment
 * @param {string} [options.path=process.cwd()] - path to `.env*` files directory
 * @param {string} [options.pattern=".env[.node_env][.local]"] - `.env*` files' naming convention pattern
 * @param {string[]} [options.files] - an explicit list of `.env*` files to load (note that `options.[default_]node_env` and `options.pattern` are ignored in this case)
 * @param {string} [options.encoding="utf8"] - encoding of `.env*` files
 * @param {boolean} [options.purge_dotenv=false] - perform the `.env` file {@link unload}
 * @param {boolean} [options.debug=false] - turn on detailed logging to help debug why certain variables are not being set as you expect
 * @param {boolean} [options.silent=false] - suppress all kinds of warnings including ".env*" files' loading errors
 * @return {{ parsed?: object, error?: Error }} with a `parsed` key containing the loaded content or an `error` key with an error that is occurred
 */
function config(options = {}) {
  if (options.debug) {
    debug('initializing…');

    CONFIG_OPTION_KEYS
      .filter(key => key in options)
      .forEach(key => debug(`| options.${key} =`, options[key]));
  }

  const {
    path = process.cwd(),
    pattern = DEFAULT_PATTERN
  } = options;

  if (options.purge_dotenv) {
    options.debug && debug(
      '`options.purge_dotenv` is enabled, unloading potentially pre-loaded `.env`…'
    );

    const dotenvFile = p.resolve(path, '.env');
    try {
      fs.existsSync(dotenvFile) && unload(dotenvFile, { encoding: options.encoding });
    }
    catch (error) {
      !options.silent && warn('unloading failed: ', error);
    }
  }

  try {
    let filenames;

    if (options.files) {
      options.debug && debug(
        'using explicit list of `.env*` files: %s…',
        options.files.join(', ')
      );

      filenames = options.files
        .reduce((list, basename) => {
          const filename = p.resolve(path, basename);

          if (fs.existsSync(filename)) {
            list.push(filename);
          }
          else if (options.debug) {
            debug('>> %s does not exist, skipping…', filename);
          }

          return list;
        }, []);
    }
    else {
      const node_env = getEffectiveNodeEnv(options);

      filenames = listFiles({ node_env, path, pattern, debug: options.debug });

      if (filenames.length === 0) {
        const _pattern = node_env
          ? pattern.replace(NODE_ENV_PLACEHOLDER_REGEX, `[$1${node_env}$2]`)
          : pattern;

        return failure(
          new Error(`no ".env*" files matching pattern "${_pattern}" in "${path}" dir`),
          options
        );
      }
    }

    const result = load(filenames, {
      encoding: options.encoding,
      debug: options.debug,
      silent: options.silent
    });

    options.debug && debug('initialization completed.');

    return result;
  }
  catch (error) {
    return failure(error, options);
  }
}

function failure(error, options) {
  if (!options.silent) {
    warn(`".env*" files loading failed: ${error.message || error}`);
  }

  return { error };
}

function warn(message, error) {
  if (error) {
    message += ': %s';
  }

  console.warn(`[dotenv-flow@${version}]: ${message}`, error);
}

function debug(message, ...values) {
  console.debug(`[dotenv-flow@${version}]: ${message}`, ...values);
}

module.exports = {
  DEFAULT_PATTERN,
  listFiles,
  parse,
  load,
  unload,
  config
};
