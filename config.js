'use strict';

const env_options = require('./lib/env-options');

require('./lib/dotenv-flow').config(env_options());
