'use strict';

const util = require('util');
const path = require('path');
const {expect} = require('chai');
const execFile = util.promisify(require('child_process').execFile);

/**
 * Executes a given helper file using the given fixture as a current working directory.
 *
 * @param {string} fixture – fixture project name
 * @param {string} helper – helper file name
 * @param {object} env – provided environment variables
 * @return {Promise<object>} – parsed stdout'ed json
 */
async function execHelper(fixture, helper, env = {}) {
  const {stdout} = await execFile(
    process.argv[0],
    [ path.join(__dirname, 'helpers', helper) ],
    {
      cwd: path.join(__dirname, 'fixtures', fixture),
      env
    }
  );

  return JSON.parse(stdout);
}

describe('dotenv-flow', () => {
  describe('when the project contains the `.env` file', () => {
    it('reads environment variables from this file', async () => {
      const variables = await execHelper('env', 'print-env.js');

      expect(variables)
        .to.have.property('DEFAULT_ENV_VAR')
        .that.is.equal('ok');
    });
  });

  describe('when the project contains the `.env.local` file', () => {
    it('merges environment variables prioritizing the `.env.local`', async () => {
      const variables = await execHelper('env-local', 'print-env.js');

      expect(variables).to.include({
        DEFAULT_ENV_VAR: 'ok',
        LOCAL_ENV_VAR: 'ok',
        LOCAL_ONLY_VAR: 'ok'
      });
    });

    it("doesn't merge `.env.local` variables for 'test' environment", async () => {
      const environment = {
        NODE_ENV: 'test'
      };

      const variables = await execHelper('env-local', 'print-env.js', environment);

      expect(variables).to.include({
        DEFAULT_ENV_VAR: 'ok',
        LOCAL_ENV_VAR: 'should be overwritten by `.env.local`'
      });

      expect(variables)
        .to.not.have.property('LOCAL_ONLY_VAR');
    });
  });

  describe('when the project contains node_env-specific files', () => {
    it('merges environment variables prioritizing the node_env-specific', async () => {
      let environment, variables;

      // --

      environment = {
        NODE_ENV: 'development'
      };

      variables = await execHelper('node-env', 'print-env.js', environment);

      expect(variables).to.include({
        NODE_ENV: 'development',
        DEFAULT_ENV_VAR: 'ok',
        DEVELOPMENT_ENV_VAR: 'ok',
        DEVELOPMENT_ONLY_VAR: 'ok'
      });

      // --

      environment = {
        NODE_ENV: 'test'
      };

      variables = await execHelper('node-env', 'print-env.js', environment);

      expect(variables).to.include({
        NODE_ENV: 'test',
        DEFAULT_ENV_VAR: 'ok',
        TEST_ENV_VAR: 'ok',
        TEST_ONLY_VAR: 'ok'
      });

      // --

      environment = {
        NODE_ENV: 'production'
      };

      variables = await execHelper('node-env', 'print-env.js', environment);

      expect(variables).to.include({
        NODE_ENV: 'production',
        DEFAULT_ENV_VAR: 'ok',
        PRODUCTION_ENV_VAR: 'ok',
        PRODUCTION_ONLY_VAR: 'ok'
      });
    });
  });

  describe('when the project contains node_env-specific `*.local` files', () => {
    it('merges environment variables prioritizing the node_env-specific local', async () => {
      let environment, variables;

      // --

      environment = {
        NODE_ENV: 'development'
      };

      variables = await execHelper('node-env-local', 'print-env.js', environment);

      expect(variables).to.include({
        NODE_ENV: 'development',
        DEFAULT_ENV_VAR: 'ok',
        DEVELOPMENT_ENV_VAR: 'ok',
        DEVELOPMENT_LOCAL_VAR: 'ok'
      });

      // --

      environment = {
        NODE_ENV: 'test'
      };

      variables = await execHelper('node-env-local', 'print-env.js', environment);

      expect(variables).to.include({
        NODE_ENV: 'test',
        DEFAULT_ENV_VAR: 'ok',
        TEST_ENV_VAR: 'ok',
        TEST_LOCAL_VAR: 'ok'
      });

      // --

      environment = {
        NODE_ENV: 'production'
      };

      variables = await execHelper('node-env-local', 'print-env.js', environment);

      expect(variables).to.include({
        NODE_ENV: 'production',
        DEFAULT_ENV_VAR: 'ok',
        PRODUCTION_ENV_VAR: 'ok',
        PRODUCTION_LOCAL_VAR: 'ok'
      });
    });
  });

  describe("when the project doesn't contain the default `.env` file", () => {
    it('merges environment variables from existing `*.env` files', async () => {
      const environment = {
        NODE_ENV: 'development'
      };

      const variables = await execHelper('no-default-env', 'print-env.js', environment);

      expect(variables).to.include({
        LOCAL_ENV_VAR: 'ok',
        DEVELOPMENT_ENV_VAR: 'ok',
        DEVELOPMENT_LOCAL_VAR: 'ok'
      });
    });
  });

  describe('when an environment variable is provided from the shell', () => {
    it('has a highest priority over those that are defined in `.env*` files', async () => {
      const environment = {
        NODE_ENV: 'production',
        DEFAULT_ENV_VAR: 'shell-defined',
        PRODUCTION_ENV_VAR: 'shell-defined',
        PRODUCTION_LOCAL_VAR: 'shell-defined',
        SHELL_ENV_VAR: 'shell-defined'
      };

      const variables = await execHelper('node-env-local', 'print-env.js', environment);

      expect(variables).to.include({
        NODE_ENV: 'production',
        DEFAULT_ENV_VAR: 'shell-defined',
        PRODUCTION_ENV_VAR: 'shell-defined',
        PRODUCTION_LOCAL_VAR: 'shell-defined',
        SHELL_ENV_VAR: 'shell-defined'
      });
    });
  });

  describe('when the `default_node_env` option is provided', () => {
    it('uses that value as a default for `process.env.NODE_ENV`', async () => {
      let environment, variables;

      variables = await execHelper('node-env-local', 'print-env-with-default.js');

      expect(variables).to.include({
        NODE_ENV: 'development',
        DEFAULT_ENV_VAR: 'ok',
        DEVELOPMENT_ENV_VAR: 'ok',
        DEVELOPMENT_LOCAL_VAR: 'ok'
      });

      environment = {
        NODE_ENV: 'production'
      };

      variables = await execHelper('node-env-local', 'print-env-with-default.js', environment);

      expect(variables).to.include({
        NODE_ENV: 'production',
        DEFAULT_ENV_VAR: 'ok',
        DEVELOPMENT_ENV_VAR: 'should be overwritten by `.env.development`',
        DEVELOPMENT_LOCAL_VAR: 'should be overwritten by `.env.development.local`',
        PRODUCTION_ENV_VAR: 'ok',
        PRODUCTION_LOCAL_VAR: 'ok'
      });
    });
  });
});
