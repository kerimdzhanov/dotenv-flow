'use strict';

const path = require('path');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const {expect} = require('chai');

/**
 * Get the path to a given fixture project.
 *
 * @param {string} name – fixture project name
 * @return {string} – path to a fixture project
 */
function getFixtureProjectPath(name) {
  return path.join(__dirname, 'fixtures', name);
}

/**
 * Executes the preload helper script using the given fixture project as a working directory.
 *
 * @param {string} cwd – path to a fixture project
 * @param {object} [env] – predefined environment variables
 * @param {string[]} [args] – command line arguments
 * @return {Promise<object>} – stdout parsed as a json
 */
async function execWithPreload(cwd, {env = {}, args = []} = {}) {
  const {stdout} = await execFile(
    process.argv[0], // ~= /usr/bin/node
    [
      '-r', path.join(__dirname, '../../config'),
      '-e', 'console.log(JSON.stringify(process.env));',
      '--', ...args
    ],
    { cwd, env }
  );

  try {
    return JSON.parse(stdout);
  }
  catch (e) {
    console.error(e);
    throw new Error(`Unable to parse the following as a JSON:\n${stdout}`);
  }
}

describe('dotenv-flow/config (preload)', () => {
  it('preloads `.env*` files defined environment variables', async () => {
    const variables = await execWithPreload(getFixtureProjectPath('env'));

    expect(variables)
      .to.have.property('DEFAULT_ENV_VAR')
      .that.is.equal('ok');
  });

  it('supports configuration via environment variables', async () => {
    let variables = await execWithPreload(getFixtureProjectPath('env'), {
      env: {
        DEFAULT_NODE_ENV: 'development',
        DOTENV_FLOW_PATH: getFixtureProjectPath('node-env')
      }
    });

    expect(variables).to.include({
      DEFAULT_NODE_ENV: 'development',
      DEFAULT_ENV_VAR: 'ok',
      DEVELOPMENT_ENV_VAR: 'ok',
      DEVELOPMENT_ONLY_VAR: 'ok'
    });

    // --

    variables = await execWithPreload(getFixtureProjectPath('env'), {
      env: {
        NODE_ENV: 'production',
        DEFAULT_NODE_ENV: 'development',
        DOTENV_FLOW_PATH: getFixtureProjectPath('node-env')
      }
    });

    expect(variables).to.include({
      NODE_ENV: 'production',
      DEFAULT_NODE_ENV: 'development',
      DEFAULT_ENV_VAR: 'ok',
      PRODUCTION_ENV_VAR: 'ok',
      PRODUCTION_ONLY_VAR: 'ok'
    });
  });

  it('supports configuration via command line options', async () => {
    let variables = await execWithPreload(getFixtureProjectPath('env'), {
      args: [
        '--default-node-env=development',
        '--dotenv-flow-path', getFixtureProjectPath('node-env-local')
      ]
    });

    expect(variables).to.include({
      DEFAULT_ENV_VAR: 'ok',
      DEVELOPMENT_ENV_VAR: 'ok',
      DEVELOPMENT_LOCAL_VAR: 'ok'
    });

    // --

    variables = await execWithPreload(getFixtureProjectPath('env'), {
      args: [
        '--node-env=production',
        '--default-node-env=development',
        '--dotenv-flow-path', getFixtureProjectPath('node-env-local')
      ]
    });

    expect(variables).to.include({
      DEFAULT_ENV_VAR: 'ok',
      PRODUCTION_ENV_VAR: 'ok',
      PRODUCTION_LOCAL_VAR: 'ok'
    });
  });
});
