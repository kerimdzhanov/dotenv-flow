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
 * Get existing `.env*` filenames depending on the `NODE_ENV` in a prioritized order.
 *
 * We don't include `.env.local` for "test" environment, since
 * normally you expect tests to produce the same results for everyone.
 *
 * @private
 * @param {string} cwd – path to `.env*` files directory
 * @return {string[]}
 */
function getDotenvFilenames(cwd) {
  const { NODE_ENV = 'development' } = process.env;

  let modeI = process.argv.indexOf("--mode")
  let mode = (modeI != -1 && process.argv.length > modeI + 1) ?
    process.argv[modeI + 1] :
    NODE_ENV

  return [
    NODE_ENV && `${cwd}/.env.${mode}.local`,
    NODE_ENV && `${cwd}/.env.${mode}`,
    NODE_ENV !== 'test' && `${cwd}/.env.local`,
    `${cwd}/.env`
  ].filter(filename => filename && fs.existsSync(filename));
}

/**
 * Main entry point into the "dotenv-flow". Allows configuration before loading `.env*` files.
 *
 * @param {object} options - options for parsing `.env*` files
 * @param {string} [options.default_node_env] – the default value for `process.env.NODE_ENV`
 * @param {string} [options.cwd=process.cwd()] – path to `.env*` files directory
 * @param {string} [options.encoding=utf8] – encoding of `.env*` files
 * @param {boolean} [options.purge_dotenv] – perform the {@link cleanupDotenvDefinedVars}
 * @return {object} with a `parsed` key containing the loaded content or an `error` key if it failed
*/
function config(options = {}) {
  const cwd = options.cwd || process.cwd();
  const encoding = options.encoding || 'utf8';

  if (!process.env.NODE_ENV && options.default_node_env) {
    process.env.NODE_ENV = options.default_node_env;
  }

  try {
    if (options.purge_dotenv) {
      cleanupDotenvDefinedVars(cwd, encoding);
    }

    const parsed = getDotenvFilenames(cwd)
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
  load: config,
  parse: dotenv.parse
};
