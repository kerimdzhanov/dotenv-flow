'use strict';

require('../../lib/dotenv-flow').config({
  node_env: 'test'
});

console.log(JSON.stringify(process.env));
