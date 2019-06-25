'use strict';

require('dotenv').config();

require('../../../lib/dotenv-flow').config({
  purge_dotenv: true
});

console.log(JSON.stringify(process.env));
