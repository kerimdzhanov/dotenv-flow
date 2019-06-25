'use strict';

const path = require('path');
const tmp = require('tmp');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const writeFile = util.promisify(require('fs').writeFile);
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
 * Executes a given helper script using the given fixture project as a working directory.
 *
 * @param {string} helper – helper file name
 * @param {string} cwd – path to a fixture project
 * @param {object} [env] – predefined environment variables
 * @return {Promise<object>} – stdout parsed as a json
 */
async function execHelper(helper, cwd, env = {}) {
  const {stdout} = await execFile(
    process.argv[0], // ~= /usr/bin/node
    [ path.join(__dirname, 'helpers', helper) ],
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

describe('dotenv-flow.config (entry point)', () => {
  describe('when the project contains the `.env` file', () => {
    const directory = getFixtureProjectPath('env');

    it('reads environment variables from this file', async () => {
      const variables = await execHelper('print-env.js', directory);

      expect(variables)
        .to.have.property('DEFAULT_ENV_VAR')
        .that.is.equal('ok');
    });
  });

  describe('when the project contains the `.env.local` file', () => {
    const directory = getFixtureProjectPath('env-local');

    it('merges environment variables prioritizing the `.env.local`', async () => {
      const variables = await execHelper('print-env.js', directory);

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

      const variables = await execHelper('print-env.js', directory, environment);

      expect(variables).to.include({
        DEFAULT_ENV_VAR: 'ok',
        LOCAL_ENV_VAR: 'should be overwritten by `.env.local`'
      });

      expect(variables)
        .to.not.have.property('LOCAL_ONLY_VAR');
    });
  });

  describe('when the project contains node_env-specific files', () => {
    const directory = getFixtureProjectPath('node-env');

    it('merges environment variables prioritizing the node_env-specific', async () => {
      let environment, variables;

      // --

      environment = {
        NODE_ENV: 'development'
      };

      variables = await execHelper('print-env.js', directory, environment);

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

      variables = await execHelper('print-env.js', directory, environment);

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

      variables = await execHelper('print-env.js', directory, environment);

      expect(variables).to.include({
        NODE_ENV: 'production',
        DEFAULT_ENV_VAR: 'ok',
        PRODUCTION_ENV_VAR: 'ok',
        PRODUCTION_ONLY_VAR: 'ok'
      });
    });
  });

  describe('when the project contains node_env-specific `*.local` files', () => {
    const directory = getFixtureProjectPath('node-env-local');

    it('merges environment variables prioritizing the node_env-specific local', async () => {
      let environment, variables;

      // --

      environment = {
        NODE_ENV: 'development'
      };

      variables = await execHelper('print-env.js', directory, environment);

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

      variables = await execHelper('print-env.js', directory, environment);

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

      variables = await execHelper('print-env.js', directory, environment);

      expect(variables).to.include({
        NODE_ENV: 'production',
        DEFAULT_ENV_VAR: 'ok',
        PRODUCTION_ENV_VAR: 'ok',
        PRODUCTION_LOCAL_VAR: 'ok'
      });
    });
  });

  describe("when the project doesn't contain the default `.env` file", () => {
    const directory = getFixtureProjectPath('no-default-env');

    it('merges environment variables from existing `*.env` files', async () => {
      const environment = {
        NODE_ENV: 'development'
      };

      const variables = await execHelper('print-env.js', directory, environment);

      expect(variables).to.include({
        LOCAL_ENV_VAR: 'ok',
        DEVELOPMENT_ENV_VAR: 'ok',
        DEVELOPMENT_LOCAL_VAR: 'ok'
      });
    });
  });

  describe('when an environment variable is provided from the shell', () => {
    const directory = getFixtureProjectPath('node-env-local');

    it('has a highest priority over those that are defined in `.env*` files', async () => {
      const environment = {
        NODE_ENV: 'production',
        DEFAULT_ENV_VAR: 'shell-defined',
        PRODUCTION_ENV_VAR: 'shell-defined',
        PRODUCTION_LOCAL_VAR: 'shell-defined',
        SHELL_ENV_VAR: 'shell-defined'
      };

      const variables = await execHelper('print-env.js', directory, environment);

      expect(variables).to.include({
        NODE_ENV: 'production',
        DEFAULT_ENV_VAR: 'shell-defined',
        PRODUCTION_ENV_VAR: 'shell-defined',
        PRODUCTION_LOCAL_VAR: 'shell-defined',
        SHELL_ENV_VAR: 'shell-defined'
      });
    });
  });

  describe('when the `node_env` option is provided', () => {
    const directory = getFixtureProjectPath('node-env-local');

    it('uses that value to load node_env-specific files independent of `NODE_ENV`', async () => {
      let environment, variables;

      // --

      environment = {
        NODE_ENV: 'production',
        CUSTOM_ENV: 'development'
      };

      variables = await execHelper('print-env-with-node_env.js', directory, environment);

      expect(variables).to.include({
        NODE_ENV: 'production',
        DEFAULT_ENV_VAR: 'ok',
        DEVELOPMENT_ENV_VAR: 'ok',
        DEVELOPMENT_LOCAL_VAR: 'ok'
      });

      // --

      environment = {
        NODE_ENV: 'production',
        CUSTOM_ENV: 'test'
      };

      variables = await execHelper('print-env-with-node_env.js', directory, environment);

      expect(variables).to.include({
        NODE_ENV: 'production',
        DEFAULT_ENV_VAR: 'ok',
        TEST_ENV_VAR: 'ok',
        TEST_LOCAL_VAR: 'ok'
      });
    });
  });

  describe('when the `default_node_env` option is provided', () => {
    const directory = getFixtureProjectPath('node-env-local');

    it('uses that value as a default environment', async () => {
      let environment, variables;

      // --

      variables = await execHelper('print-env-with-default.js', directory);

      expect(variables).to.include({
        DEFAULT_ENV_VAR: 'ok',
        DEVELOPMENT_ENV_VAR: 'ok',
        DEVELOPMENT_LOCAL_VAR: 'ok'
      });

      environment = {
        NODE_ENV: 'production'
      };

      // --

      variables = await execHelper('print-env-with-default.js', directory, environment);

      expect(variables).to.include({
        DEFAULT_ENV_VAR: 'ok',
        PRODUCTION_ENV_VAR: 'ok',
        PRODUCTION_LOCAL_VAR: 'ok'
      });
    });
  });

  describe('when the `purge_dotenv` option is set to `true`', () => {
    const directory = getFixtureProjectPath('node-env-local');

    it('fixes the `.env*` files priority issue', async () => {
      const environment = {
        NODE_ENV: 'development'
      };

      const variables = await execHelper('print-env-with-purge.js', directory, environment);

      expect(variables).to.include({
        NODE_ENV: 'development',
        DEFAULT_ENV_VAR: 'ok',
        DEVELOPMENT_ENV_VAR: 'ok',
        DEVELOPMENT_LOCAL_VAR: 'ok'
      });
    });
  });

  describe('the returning object', () => {
    describe('when the parsing is successful', () => {
      const directory = getFixtureProjectPath('node-env-local');

      it('includes the `parsed` property that is a map of parsed environment variables', async () => {
        const environment = {
          NODE_ENV: 'development'
        };

        const result = await execHelper('print-result.js', directory, environment);

        expect(result).to.have.property('parsed')
          .that.includes({
            DEFAULT_ENV_VAR: 'ok',
            DEVELOPMENT_ENV_VAR: 'ok',
            DEVELOPMENT_LOCAL_VAR: 'ok'
          });

        expect(result).to.not.have.key('error');
      });
    });

    describe('if an error occurred while reading `*.env` files', () => {
      it('includes the `error` property that is a reference to the occurred error object', (done) => {
        tmp.dir({ unsafeCleanup: true }, (err, directory) => {
          if (err) {
            return done(err);
          }

          const filename = path.join(directory, '.env.local');

          writeFile(filename, 'LOCAL_ENV_VAR=ok', { mode: 0o000 })
            .then(() => execHelper('print-result.js', directory))
            .then((result) => {
              expect(result).to.have.property('error')
                .that.is.an('object').with.property('errno', -13);

              expect(result).to.not.have.key('parsed');
            })
            .then(() => done())
            .catch(done);
        });
      });
    });
  });
});
