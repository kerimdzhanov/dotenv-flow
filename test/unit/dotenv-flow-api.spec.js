'use strict';

const {expect} = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const {normalize} = require('path');
const {isWindows, normalizePosixPath} = require('../integration/helpers/windows');

const dotenvFlow = require('../../lib/dotenv-flow');

function isolateProcessEnv() {
  let processEnvBackup;

  before('backup the original `process.env` object', () => {
    processEnvBackup = process.env;
  });

  beforeEach('setup the `process.env` copy', () => {
    process.env = { ...processEnvBackup };
  });

  after('restore the original `process.env` object', () => {
    process.env = processEnvBackup;
  });
}

describe('dotenv-flow (API)', () => {
  describe('.listFiles', () => {
    describe('by default (when no options are given)', () => {
      let filenames;

      beforeEach('apply `.listFiles` without extra options', () => {
        filenames = dotenvFlow.listFiles('/path/to/project')
          .map(p => normalizePosixPath(p));
      });

      it('lists the default `.env.defaults` file', () => {
        expect(filenames)
          .to.include('/path/to/project/.env.defaults');
      });

      it('lists the default `.env` file', () => {
        expect(filenames)
          .to.include('/path/to/project/.env');
      });

      it('lists the `.env.local` file', () => {
        expect(filenames)
          .to.include('/path/to/project/.env.local');
      });

      it('lists `.env*` files in the "variables overwriting" order', () => {
        expect(filenames)
          .to.have.ordered.members([
            "/path/to/project/.env.defaults",
            '/path/to/project/.env',
            '/path/to/project/.env.local'
          ]);
      });
    });

    describe('when the `node_env` option is given', () => {
      let filenames;

      beforeEach('apply `.listFiles` with the `node_env` option', () => {
        filenames = dotenvFlow.listFiles('/path/to/project', { node_env: 'development' })
          .map(p => normalizePosixPath(p));
      });

      it('lists the default `.env` file', () => {
        expect(filenames)
          .to.include('/path/to/project/.env');
      });

      it('lists the `.env.local` file', () => {
        expect(filenames)
          .to.include('/path/to/project/.env.local');
      });

      it('lists the node_env-specific file', () => {
        expect(filenames)
          .to.include('/path/to/project/.env.development');
      });

      it('lists the node_env-specific local file', () => {
        expect(filenames)
          .to.include('/path/to/project/.env.development.local');
      });

      it('lists `.env*` files in the "variables overwriting" order', () => {
        expect(filenames)
          .to.have.ordered.members([
            '/path/to/project/.env.defaults',
            '/path/to/project/.env',
            '/path/to/project/.env.local',
            '/path/to/project/.env.development',
            '/path/to/project/.env.development.local'
          ]);
      });
    });

    describe('when the `node_env` option is set to "test"', () => {
      let filenames;

      beforeEach('apply `.listFiles` with the `node_env` option value of "test"', () => {
        filenames = dotenvFlow.listFiles('/path/to/project', { node_env: 'test' })
          .map(p => normalizePosixPath(p));
      });

      it("doesn't list the `.env.local` file", () => {
        expect(filenames)
          .to.not.include('/path/to/project/.env.local');
      });
    });
  });

  describe('.parse', () => {
    let $readFileSync;

    beforeEach('stub `fs.readFileSync`', () => {
      $readFileSync = sinon.stub(fs, 'readFileSync');
    });

    afterEach(() => $readFileSync.restore());

    describe('when a single filename is given', () => {
      beforeEach('stub the `.env` file content', () => {
        $readFileSync
          .withArgs('/path/to/project/.env')
          .returns('DEFAULT_ENV_VAR=ok')

          .withArgs('/path/to/project/non-existent-file')
          .throws(new Error("ENOENT: no such file or directory, open '/path/to/project/non-existent-file'"));
      });

      it('returns the parsed content of the file as an object', () => {
        const parsed = dotenvFlow.parse('/path/to/project/.env');

        expect(parsed)
          .to.be.an('object')
          .with.property('DEFAULT_ENV_VAR', 'ok');
      });

      it('provides the value of `options.encoding` to `fs.readFileSync` if given', () => {
        dotenvFlow.parse('/path/to/project/.env', { encoding: 'base64' });

        expect($readFileSync)
            .to.have.been.calledWith('/path/to/project/.env', { encoding: 'base64' });
      });

      it("throws if file doesn't exist", () => {
        expect(() => dotenvFlow.parse('/path/to/project/non-existent-file'))
          .to.throw("ENOENT: no such file or directory, open '/path/to/project/non-existent-file'");
      });
    });

    describe('when multiple filenames are given', () => {
      it("returns parsed files' contents merging them to a single object", () => {
        $readFileSync
          .withArgs('/path/to/project/.env')
          .returns('DEFAULT_ENV_VAR=ok')

          .withArgs('/path/to/project/.env.local')
          .returns('LOCAL_ENV_VAR=ok');

        const parsed = dotenvFlow.parse([
          '/path/to/project/.env',
          '/path/to/project/.env.local'
        ]);

        expect(parsed)
          .to.be.an('object')
          .that.deep.equals({
            DEFAULT_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok'
          });
      });

      it('merges parsed variables using the "overwrite" strategy', () => {
        $readFileSync
          .withArgs('/path/to/project/.env')
          .returns('DEFAULT_ENV_VAR=ok\nBOTH_ENVS_VAR=should be overwritten by `.env.local`')

          .withArgs('/path/to/project/.env.local')
          .returns('LOCAL_ENV_VAR=ok\nBOTH_ENVS_VAR=ok');

        const parsed = dotenvFlow.parse([
          '/path/to/project/.env',
          '/path/to/project/.env.local'
        ]);

        expect(parsed)
          .to.be.an('object')
          .that.deep.equals({
            DEFAULT_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok',
            BOTH_ENVS_VAR: 'ok'
          });
      });

      it('provides the value of `options.encoding` to `fs.readFileSync` if given', () => {
        $readFileSync
            .withArgs('/path/to/project/.env')
            .returns('DEFAULT_ENV_VAR=ok')

            .withArgs('/path/to/project/.env.local')
            .returns('LOCAL_ENV_VAR=ok');

        dotenvFlow.parse([
          '/path/to/project/.env',
          '/path/to/project/.env.local'
        ], { encoding: 'base64' });

        expect($readFileSync)
            .to.have.been.calledWith('/path/to/project/.env', { encoding: 'base64' });

        expect($readFileSync)
            .to.have.been.calledWith('/path/to/project/.env.local', { encoding: 'base64' });
      });

      it("throws if any of the given files doesn't exist", () => {
        $readFileSync
          .withArgs('/path/to/project/.env')
          .returns('DEFAULT_ENV_VAR=ok')

          .withArgs('/path/to/project/.env.local')
          .returns('LOCAL_ENV_VAR=ok')

          .withArgs('/path/to/project/non-existent-file')
          .throws(new Error("ENOENT: no such file or directory, open '/path/to/project/non-existent-file'"));

        expect(() => dotenvFlow.parse([
          '/path/to/project/.env',
          '/path/to/project/non-existent-file',
          '/path/to/project/.env.local'
        ]))
          .to.throw("ENOENT: no such file or directory, open '/path/to/project/non-existent-file'");
      });
    });
  });

  describe('.load', () => {
    isolateProcessEnv();

    let $readFileSync;

    beforeEach('stub `fs.readFileSync`', () => {
      $readFileSync = sinon.stub(fs, 'readFileSync');
    });

    beforeEach('stub the `.env` file content', () => {
      $readFileSync
        .withArgs('/path/to/project/.env')
        .returns('ENV_VAR="defined by the `.env`"');
    });

    afterEach(() => $readFileSync.restore());

    it('loads environment variables from the given file into `process.env`', () => {
      expect(process.env)
        .to.not.have.property('ENV_VAR');

      dotenvFlow.load('/path/to/project/.env');

      expect(process.env)
        .to.have.property('ENV_VAR', 'defined by the `.env`');
    });

    it('returns the parsed content of the file in the `parsed` property', () => {
      const result = dotenvFlow.load('/path/to/project/.env');

      expect(result)
        .to.be.an('object')
        .with.property('parsed')
        .that.deep.equals({
          ENV_VAR: 'defined by the `.env`'
        });
    });

    describe('when an environment variable is already defined', () => {
      beforeEach('predefine the environment variable', () => {
        process.env.ENV_VAR = 'predefined';
      });

      beforeEach('stub `console.warn`', () => {
        sinon.stub(console, 'warn');
      });

      afterEach('restore `console.warn`', () => {
        console.warn.restore();
      });

      it("doesn't overwrite the predefined variable", () => {
        dotenvFlow.load('/path/to/project/.env');

        expect(process.env)
          .to.have.property('ENV_VAR', 'predefined');
      });

      it('warns about the predefined variable', () => {
        dotenvFlow.load('/path/to/project/.env');

        expect(console.warn)
          .to.have.been.calledWithMatch(/^dotenv-flow: .*%s.+/, 'ENV_VAR');
      });

      it('suppresses the console output when the `silent` option is given', () => {
        dotenvFlow.load('/path/to/project/.env', { silent: true });

        expect(console.warn)
          .to.have.not.been.called;
      });

      it('returns the parsed content of the file in the `parsed` property', () => {
        const result = dotenvFlow.load('/path/to/project/.env');

        expect(result)
          .to.be.an('object')
          .with.property('parsed')
          .that.deep.equals({
            ENV_VAR: 'defined by the `.env`'
          });
      });
    });

    describe('if an error occurred during the parsing', () => {
      beforeEach('stub `fs.readFileSync` error', () => {
        $readFileSync
          .withArgs('/path/to/project/.env.error')
          .throws(new Error('file reading error stub'));
      });

      it('returns the occurred error in the `error` property', () => {
        const result = dotenvFlow.load('/path/to/project/.env.error');

        expect(result)
          .to.be.an('object')
          .with.property('error')
          .that.is.an('error')
          .with.property('message', 'file reading error stub');
      });
    });
  });

  describe('.unload', () => {
    isolateProcessEnv();

    beforeEach('stub `fs.readFileSync`', () => {
      sinon.stub(fs, 'readFileSync')
        .withArgs('/path/to/project/.env')
        .returns('ENV_VAR="defined by the `.env`"');
    });

    afterEach(() => fs.readFileSync.restore());

    it('unloads environment variables defined in the given file from `process.env`', () => {
      process.env.ENV_VAR = 'defined by the `.env`';

      dotenvFlow.unload('/path/to/project/.env');

      expect(process.env)
        .to.not.have.property('ENV_VAR');
    });

    it("doesn't unload predefined variables (with different value)", () => {
      process.env.ENV_VAR = 'predefined';

      dotenvFlow.unload('/path/to/project/.env');

      expect(process.env)
        .to.have.property('ENV_VAR', 'predefined');
    });
  });

  describe('.config', () => {
    isolateProcessEnv();

    let $dotenvFiles;

    beforeEach('init the `$dotenvFiles` stub', () => {
      $dotenvFiles = {};
    });

    let $existsSync;

    beforeEach('stub `fs.existsSync`', () => {
      $existsSync = sinon.stub(fs, 'existsSync')
        .callsFake(filename => $dotenvFiles.hasOwnProperty(normalizePosixPath(filename)));
    });

    afterEach(() => $existsSync.restore());

    let $readFileSync;

    beforeEach('stub `fs.readFileSync`', () => {
      $readFileSync = sinon.stub(fs, 'readFileSync')
        .callsFake((filename) => {
          const normalizedFilename = normalizePosixPath(filename);
          if (!$dotenvFiles.hasOwnProperty(normalizedFilename)) {
            throw new Error(`file "${normalizedFilename}" doesn't exist`);
          }

          return $dotenvFiles[normalizedFilename];
        });
    });

    afterEach(() => $readFileSync.restore());

    let $processCwd;

    beforeEach('stub `process.cwd`', () => {
      $processCwd = sinon.stub(process, 'cwd')
        .returns('/path/to/project');
    });

    afterEach(() => $processCwd.restore());

    describe('by default (when no options are given)', () => {
      it('loads the default `.env` file', () => {
        $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR=ok';

        expect(process.env)
          .to.not.have.property('DEFAULT_ENV_VAR');

        dotenvFlow.config();

        expect(process.env)
          .to.have.property('DEFAULT_ENV_VAR', 'ok');
      });

      it('loads the `.env.local` file', () => {
        $dotenvFiles['/path/to/project/.env.local'] = 'LOCAL_ENV_VAR=ok';

        expect(process.env)
          .to.not.have.property('LOCAL_ENV_VAR');

        dotenvFlow.config();

        expect(process.env)
          .to.have.property('LOCAL_ENV_VAR', 'ok');
      });

      it('uses `process.cwd()` as a default `path`', () => {
        $processCwd.returns('/current/working/directory');

        $dotenvFiles['/current/working/directory/.env'] = 'DEFAULT_ENV_VAR=ok';

        dotenvFlow.config();

        // path.resolve() calls process.cwd() internally on windows
        // https://github.com/nodejs/node/blob/d0377a825bf7ceb838570f434fdd7d4b1773b8fa/lib/path.js#L146
        // listDotenvFiles calls path.resolve() 3 times, so $processCwd.callCount === 4 on win (and 1 on posix)
        if (!isWindows()) {
          expect($processCwd)
            .to.have.been.calledOnce;
        }

        expect(process.env)
          .to.have.property('DEFAULT_ENV_VAR', 'ok');
      });
    });

    describe('when the `NODE_ENV` environment variable is present', () => {
      beforeEach('setup the `NODE_ENV` environment variable', () => {
        process.env.NODE_ENV = 'development';
      });

      it('loads the default `.env` file', () => {
        $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR=ok';

        expect(process.env)
          .to.not.have.property('DEFAULT_ENV_VAR');

        dotenvFlow.config();

        expect(process.env)
          .to.have.property('DEFAULT_ENV_VAR', 'ok');
      });

      it('loads the `.env.local` file', () => {
        $dotenvFiles['/path/to/project/.env.local'] = 'LOCAL_ENV_VAR=ok';

        expect(process.env)
          .to.not.have.property('LOCAL_ENV_VAR');

        dotenvFlow.config();

        expect(process.env)
          .to.have.property('LOCAL_ENV_VAR', 'ok');
      });

      it('loads the node_env-specific env file', () => {
        $dotenvFiles['/path/to/project/.env.development'] = 'DEVELOPMENT_ENV_VAR=ok';

        expect(process.env)
          .to.not.have.property('DEVELOPMENT_ENV_VAR');

        dotenvFlow.config();

        expect(process.env)
          .to.have.property('DEVELOPMENT_ENV_VAR', 'ok');
      });

      it('loads the node_env-specific local env file', () => {
        $dotenvFiles['/path/to/project/.env.development.local'] = 'DEVELOPMENT_LOCAL_ENV_VAR=ok';

        expect(process.env)
          .to.not.have.property('DEVELOPMENT_LOCAL_ENV_VAR');

        dotenvFlow.config();

        expect(process.env)
          .to.have.property('DEVELOPMENT_LOCAL_ENV_VAR', 'ok');
      });
    });

    describe('when the `node_env` option is given', () => {
      it('loads the default `.env` file', () => {
        $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR=ok';

        expect(process.env)
          .to.not.have.property('DEFAULT_ENV_VAR');

        dotenvFlow.config({
          node_env: 'development'
        });

        expect(process.env)
          .to.have.property('DEFAULT_ENV_VAR', 'ok');
      });

      it('loads the `.env.local` file', () => {
        $dotenvFiles['/path/to/project/.env.local'] = 'LOCAL_ENV_VAR=ok';

        expect(process.env)
          .to.not.have.property('LOCAL_ENV_VAR');

        dotenvFlow.config({
          node_env: 'development'
        });

        expect(process.env)
          .to.have.property('LOCAL_ENV_VAR', 'ok');
      });

      it('loads the node_env-specific env file', () => {
        $dotenvFiles['/path/to/project/.env.development'] = 'DEVELOPMENT_ENV_VAR=ok';

        expect(process.env)
          .to.not.have.property('DEVELOPMENT_ENV_VAR');

        dotenvFlow.config({
          node_env: 'development'
        });

        expect(process.env)
          .to.have.property('DEVELOPMENT_ENV_VAR', 'ok');
      });

      it('loads the node_env-specific local env file', () => {
        $dotenvFiles['/path/to/project/.env.development.local'] = 'DEVELOPMENT_LOCAL_ENV_VAR=ok';

        expect(process.env)
          .to.not.have.property('DEVELOPMENT_LOCAL_ENV_VAR');

        dotenvFlow.config({
          node_env: 'development'
        });

        expect(process.env)
          .to.have.property('DEVELOPMENT_LOCAL_ENV_VAR', 'ok');
      });

      it('ignores the `NODE_ENV` environment variable', () => {
        $dotenvFiles['/path/to/project/.env.development'] = 'DEVELOPMENT_ENV_VAR=ok';
        $dotenvFiles['/path/to/project/.env.production'] = 'PRODUCTION_ENV_VAR=ok';

        process.env.NODE_ENV = 'development';

        dotenvFlow.config({
          node_env: 'production'
        });

        expect(process.env)
          .to.not.have.property('DEVELOPMENT_ENV_VAR');

        expect(process.env)
          .to.have.property('PRODUCTION_ENV_VAR', 'ok');
      });
    });

    describe('when the `default_node_env` option is given', () => {
      it('loads the default `.env` file', () => {
        $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR=ok';

        expect(process.env)
          .to.not.have.property('DEFAULT_ENV_VAR');

        dotenvFlow.config({
          default_node_env: 'development'
        });

        expect(process.env)
          .to.have.property('DEFAULT_ENV_VAR', 'ok');
      });

      it('loads the `.env.local` file', () => {
        $dotenvFiles['/path/to/project/.env.local'] = 'LOCAL_ENV_VAR=ok';

        expect(process.env)
          .to.not.have.property('LOCAL_ENV_VAR');

        dotenvFlow.config({
          default_node_env: 'development'
        });

        expect(process.env)
          .to.have.property('LOCAL_ENV_VAR', 'ok');
      });

      it('loads the node_env-specific env file', () => {
        $dotenvFiles['/path/to/project/.env.development'] = 'DEVELOPMENT_ENV_VAR=ok';

        expect(process.env)
          .to.not.have.property('DEVELOPMENT_ENV_VAR');

        dotenvFlow.config({
          default_node_env: 'development'
        });

        expect(process.env)
          .to.have.property('DEVELOPMENT_ENV_VAR', 'ok');
      });

      it('loads the node_env-specific local env file', () => {
        $dotenvFiles['/path/to/project/.env.development.local'] = 'DEVELOPMENT_LOCAL_ENV_VAR=ok';

        expect(process.env)
          .to.not.have.property('DEVELOPMENT_LOCAL_ENV_VAR');

        dotenvFlow.config({
          default_node_env: 'development'
        });

        expect(process.env)
          .to.have.property('DEVELOPMENT_LOCAL_ENV_VAR', 'ok');
      });

      it('respects the `NODE_ENV` environment variable if it is present', () => {
        $dotenvFiles['/path/to/project/.env.development'] = 'DEVELOPMENT_ENV_VAR=ok';
        $dotenvFiles['/path/to/project/.env.production'] = 'PRODUCTION_ENV_VAR=ok';

        process.env.NODE_ENV = 'production';

        dotenvFlow.config({
          default_node_env: 'development'
        });

        expect(process.env)
          .to.not.have.property('DEVELOPMENT_ENV_VAR');

        expect(process.env)
          .to.have.property('PRODUCTION_ENV_VAR', 'ok');
      });
    });

    describe('when the `path` option is given', () => {
      it('uses the given `path` for listing the `.env*` files', () => {
        $dotenvFiles['/custom/working/directory/.env'] = 'DEFAULT_ENV_VAR=ok';

        dotenvFlow.config({
          path: '/custom/working/directory'
        });

        // path.resolve() calls process.cwd() internally on windows
        // https://github.com/nodejs/node/blob/d0377a825bf7ceb838570f434fdd7d4b1773b8fa/lib/path.js#L146
        // listDotenvFiles calls path.resolve() 3 times, so $processCwd.callCount === 3 on win (and 0 on posix)
        if (!isWindows()) {
          expect($processCwd)
            .to.have.not.been.called;
        }

        expect(process.env)
          .to.have.property('DEFAULT_ENV_VAR', 'ok');
      });
    });

    describe('when the `encoding` option is given', () => {
      it('provides the given `encoding` to `fs.readFileSync` through `.load`', () => {
        $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR=ok';

        dotenvFlow.config({
          encoding: 'base64'
        });

        expect($readFileSync)
          .to.have.been.calledWith(normalize('/path/to/project/.env'), { encoding: 'base64' });
      });
    });

    describe('when the `purge_dotenv` option is given', () => {
      let options;

      beforeEach('setup the `purge_dotenv` option', () => {
        options = {
          purge_dotenv: true
        };
      });

      beforeEach('stub the `.env*` files contents', () => {
        $dotenvFiles['/path/to/project/.env'] = 'ENV_VAR=defined by the `.env`';
        $dotenvFiles['/path/to/project/.env.local'] = 'ENV_VAR=overwritten by the `.env.local`';
      });

      it('fixes the previously loaded `.env` file issue', () => {
        process.env.ENV_VAR = 'defined by the `.env`';

        dotenvFlow.config(options);

        expect(process.env)
          .to.have.property('ENV_VAR')
          .that.equals('overwritten by the `.env.local`');
      });

      it('provides the `encoding` option if given', () => {
        options.encoding = 'base64';

        $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR=ok';

        dotenvFlow.config(options);

        expect($readFileSync.firstCall)
          .to.have.been.calledWith(normalize('/path/to/project/.env'), { encoding: 'base64' });

        expect($readFileSync.secondCall)
          .to.have.been.calledWith(normalize('/path/to/project/.env'), { encoding: 'base64' });
      });

      it("loads the rest of `.env*` files even if `.env` file doesn't exist", () => {
        delete $dotenvFiles['/path/to/project/.env'];

        dotenvFlow.config(options);

        expect(process.env)
            .to.have.property('ENV_VAR')
            .that.equals('overwritten by the `.env.local`');
      });
    });

    describe('when the `silent` option is given', () => {
      beforeEach('stub `console.warn`', () => {
        sinon.stub(console, 'warn');
      });

      afterEach('restore `console.warn`', () => {
        console.warn.restore();
      });

      it('suppresses console outputs', () => {
        process.env.DEFAULT_ENV_VAR = 'predefined';

        $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR=ok';

        dotenvFlow.config({
          silent: true
        });

        expect(console.warn)
          .to.have.not.been.called;
      });
    });

    describe('the return object', () => {
      it('includes the parsed contents of the files in the `parsed` property', () => {
        $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR=ok';
        $dotenvFiles['/path/to/project/.env.local'] = 'LOCAL_ENV_VAR=ok';

        const result = dotenvFlow.config();

        expect(result)
          .to.be.an('object')
          .with.property('parsed')
          .that.deep.equals({
            DEFAULT_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok'
          });
      });
    });

    describe('if the parsing is failed', () => {
      beforeEach('stub the `.env*` files contents', () => {
        $dotenvFiles['/path/to/project/.env'] = 'DEFAULT_ENV_VAR=ok';
        $dotenvFiles['/path/to/project/.env.local'] = 'LOCAL_ENV_VAR=ok';
      });

      beforeEach('stub `fs.readFileSync` error', () => {
        $readFileSync
          .withArgs(normalize('/path/to/project/.env.local'))
          .throws(new Error('file reading error stub'));
      });

      it("doesn't load any environment variables", () => {
        const processEnvBefore = { ...process.env };

        dotenvFlow.config();

        expect(process.env)
          .to.deep.equal(processEnvBefore);
      });

      it('returns the occurred error in the `error` property', () => {
        const result = dotenvFlow.config();

        expect(result)
          .to.be.an('object')
          .with.property('error')
          .that.is.an('error')
          .with.property('message', 'file reading error stub');
      });
    });
  });
});
