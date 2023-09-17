'use strict';

const {expect} = require('chai');
const cli_options = require('../../lib/cli-options');

describe('cli_options', () => {
  it('maps related `--switches` to options', () => {
    expect(cli_options([
      'node',
      '-r', 'dotenv-flow/config',
      '--node-env', 'production',
      '--default-node-env', 'development',
      '--dotenv-flow-path', '/path/to/project',
      '--dotenv-flow-encoding', 'latin1',
      '--dotenv-flow-purge-dotenv', 'yes',
      '--dotenv-flow-debug', 'enabled',
      '--dotenv-flow-silent', 'true'
    ]))
      .to.deep.equal({
        node_env: 'production',
        default_node_env: 'development',
        path: '/path/to/project',
        encoding: 'latin1',
        purge_dotenv: 'yes',
        debug: 'enabled',
        silent: 'true'
      });
  });

  it('supports `--switch=value` syntax', () => {
    expect(cli_options([
      'node',
      '-r', 'dotenv-flow/config',
      '--node-env=production',
      '--default-node-env=development',
      '--dotenv-flow-path=/path/to/project',
      '--dotenv-flow-pattern=config/[local/].env[.node_env]',
      '--dotenv-flow-encoding=latin1',
      '--dotenv-flow-purge-dotenv=yes',
      '--dotenv-flow-debug=enabled',
      '--dotenv-flow-silent=true'
    ]))
      .to.deep.equal({
        node_env: 'production',
        default_node_env: 'development',
        path: '/path/to/project',
        pattern: 'config/[local/].env[.node_env]',
        encoding: 'latin1',
        purge_dotenv: 'yes',
        debug: 'enabled',
        silent: 'true'
      });
  });

  it("doesn't include undefined switches", () => {
    expect(cli_options([
      'node',
      '-r', 'dotenv-flow/config',
      '--default-node-env', 'development',
      '--dotenv-flow-encoding', 'latin1'
    ]))
      .to.have.keys([
        'default_node_env',
        'encoding'
      ]);
  });

  it('ignores unrelated `--switches`', () => {
    expect(cli_options([ '--foo', 'bar', '--baz=qux' ])).to.be.empty;
  });
});
