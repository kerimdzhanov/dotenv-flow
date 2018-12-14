'use strict';

require('../../lib/dotenv-flow').config({
  node_env: 'development'
});

console.log(JSON.stringify(process.env));
