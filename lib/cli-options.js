'use strict';

const CLI_OPTIONS_MAP = {
  '--node-env': 'node_env',
  '--default-node-env': 'default_node_env',
  '--dotenv-flow-path': 'path',
  '--dotenv-flow-pattern': 'pattern',
  '--dotenv-flow-encoding': 'encoding',
  '--dotenv-flow-purge-dotenv': 'purge_dotenv',
  '--dotenv-flow-debug': 'debug',
  '--dotenv-flow-silent': 'silent'
};

const CLI_OPTION_KEYS = Object.keys(CLI_OPTIONS_MAP);

/**
 * Get CLI options for `dotenv-flow#config()`.
 *
 * @param {string[]} [argv=process.argv]
 * @return {{node_env?: string, default_node_env?: string, path?: string, encoding?: string, purge_dotenv?: string, silent?: string}}
 */
module.exports = function cli_options(argv = process.argv) {
  const options = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg in CLI_OPTIONS_MAP) {
      options[ CLI_OPTIONS_MAP[arg] ] = argv[++i];
      continue;
    }

    for (let j = 0; j < CLI_OPTION_KEYS.length; j++) {
      const flag = CLI_OPTION_KEYS[j];

      if (arg.startsWith(flag + '=')) {
        options[ CLI_OPTIONS_MAP[flag] ] = arg.slice(flag.length + 1);
        break;
      }
    }
  }

  return options;
};
