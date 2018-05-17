'use strict';

require('../../lib/dotenv-flow').config({
  default_node_env: 'development'
});

console.log(JSON.stringify(process.env));
