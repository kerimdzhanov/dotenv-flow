'use strict';

const ENV_OPTIONS_MAP = {
  NODE_ENV: 'node_env',
  DEFAULT_NODE_ENV: 'default_node_env',
  DOTENV_FLOW_PATH: 'path',
  DOTENV_FLOW_ENCODING: 'encoding',
  DOTENV_FLOW_PURGE_DOTENV: 'purge_dotenv'
};

/**
 * Get environment variable defined options for `dotenv-flow#config()`.
 *
 * @param {object} [env=process.env]
 * @return {{node_env?: string, default_node_env?: string, path?: string, encoding?: string, purge_dotenv?: string}}
 */
module.exports = function env_options(env = process.env) {
  return Object.keys(ENV_OPTIONS_MAP)
    .reduce((options, key) => {
      if (key in env) {
        options[ ENV_OPTIONS_MAP[key] ] = env[key];
      }
      return options;
    }, {});
};
