'use strict';

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

/**
 * In some cases the original "dotenv" library can be used by one of the dependent
 * npm modules. It causes calling the original `dotenv.config()` that loads
 * the `.env` file from your project before you can call `dotenv-flow.config()`.
 * Such cases breaks `.env*` files priority because the previously loaded
 * environment variables are treated as shell-defined thus having the higher priority.
 *
 * This function can gracefully fix this issue, activate it using the `purge_dotenv` option.
 *
 * @private
 * @param {string} cwd – path to `.env*` files directory
 * @param {string} encoding – `.env` file encoding
 */
function cleanupDotenvDefinedVars(cwd, encoding) {
  const dotenvPath = path.join(cwd, '.env');

  if (!fs.existsSync(dotenvPath)) {
    return;
  }

  // specifying an encoding returns a string instead of a buffer
  const variables = dotenv.parse(fs.readFileSync(dotenvPath, { encoding }));

  Object.keys(variables).forEach((key) => {
    if (process.env[key] === variables[key]) {
      delete process.env[key];
    }
  });
}

/**
 * Get existing `.env*` filenames depending on the `node_env` in a prioritized order.
 *
 * We don't include `.env.local` for "test" environment, since
 * normally you expect tests to produce the same results for everyone.
 *
 * @private
 * @param {string} cwd – path to `.env*` files directory
 * @param {string} node_env – current environment
 * @return {string[]}
 */
function getDotenvFilenames(cwd, node_env) {
  return [
    node_env && `${cwd}/.env.${node_env}.local`,
    node_env && `${cwd}/.env.${node_env}`,
    (node_env !== 'test') && `${cwd}/.env.local`,
    `${cwd}/.env`
  ].filter(filename => filename && fs.existsSync(filename));
}

/**
 * Main entry point into the "dotenv-flow". Allows configuration before loading `.env*` files.
 *
 * @param {object} options - options for parsing `.env*` files
 * @param {string} [options.node_env=process.env.NODE_ENV] – environment to use (development/test/production/etc,.)
 * @param {string} [options.default_node_env] – the default environment value
 * @param {string} [options.path=process.cwd()] – path to `.env*` files directory
 * @param {string} [options.encoding="utf8"] – encoding of `.env*` files
 * @param {boolean} [options.purge_dotenv] – perform the {@link cleanupDotenvDefinedVars}
 * @return {object} with a `parsed` key containing the loaded content or an `error` key if it failed
 */
function config(options = {}) {
  const {
    node_env = (process.env.NODE_ENV || options.default_node_env),
    encoding = 'utf8',
    purge_dotenv = false
  } = options;

  // `options.cwd` is here just for backward compatibility
  const path = options.path || options.cwd || process.cwd();

  try {
    if (purge_dotenv) {
      cleanupDotenvDefinedVars(path, encoding);
    }

    const parsed = getDotenvFilenames(path, node_env)
      .reduce((parsed, path) => {
        const result = dotenv.config({ path, encoding });

        if (result.error) {
          throw result.error;
        }

        return Object.assign(result.parsed, parsed);
      }, {});

    return { parsed };
  }
  catch (error) {
    return { error };
  }
}

module.exports = {
  config,
  parse: dotenv.parse
};
