'use strict';

const env_options = require('./lib/env-options');
const cli_options = require('./lib/cli-options');

require('./lib/dotenv-flow').config({
  ...env_options(),
  ...cli_options()
});
