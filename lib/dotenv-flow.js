'use strict';

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

/**
 * Cleanup previously loaded .env file variables,
 * otherwise `.env` defined variables will have
 * higher priority than other `.env.*` files.
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
 * Get existing .env* filenames depending on the `NODE_ENV` in a prioritized order.
 *
 * @private
 * @param {string} cwd – path to `.env*` files directory
 * @return {string[]}
 */
function getDotenvFilenames(cwd) {
  const {NODE_ENV = undefined} = process.env;

  const filenames = [];

  if (NODE_ENV) {
    filenames.push(
      `${cwd}/.env.${NODE_ENV}.local`,
      `${cwd}/.env.${NODE_ENV}`
    );
  }

  // Don't include `.env.local` for `test` environment
  // since normally you expect tests to produce the same
  // results for everyone
  if (NODE_ENV !== 'test') {
    filenames.push(`${cwd}/.env.local`);
  }

  filenames.push(`${cwd}/.env`);

  return filenames.filter(file => fs.existsSync(file));
}

/**
 * Main entry point into the "dotenv-flow". Allows configuration before loading `.env*` files.
 *
 * @param {object} options - options for parsing `.env*` files
 * @param {string} [options.default_node_env] – the default value for `process.env.NODE_ENV`
 * @param {string} [options.cwd=process.cwd()] – path to `.env*` files directory
 * @param {string} [options.encoding=utf8] – encoding of `.env*` files
 * @return {object} with a `parsed` key containing the loaded content or an `error` key if it failed
*/
function config(options = {}) {
  const cwd = options.cwd || process.cwd();
  const encoding = options.encoding || 'utf8';

  if (!process.env.NODE_ENV && options.default_node_env) {
    process.env.NODE_ENV = options.default_node_env;
  }

  try {
    cleanupDotenvDefinedVars(cwd, encoding);

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
