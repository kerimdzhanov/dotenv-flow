'use strict';

require('../../../lib/dotenv-flow').config({
  node_env: process.env.CUSTOM_ENV
});

console.log(JSON.stringify(process.env));
