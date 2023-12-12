'use strict';

const {expect} = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const os = require('os');
const path = require('path');

const dotenvFlow = require('../../lib/dotenv-flow');

describe('dotenv-flow (API)', () => {
  let _processEnvBackup;

  before('backup the original `process.env` object', () => {
    _processEnvBackup = process.env;
  });

  beforeEach('setup the `process.env` copy', () => {
    process.env = { ..._processEnvBackup };
  });

  after('restore the original `process.env` object', () => {
    process.env = _processEnvBackup;
  });

  // --

  let $processCwd;

  beforeEach('stub `process.cwd`', () => {
    $processCwd = sinon.stub(process, 'cwd')
      .returns('/path/to/project');
  });

  afterEach(() => $processCwd.restore());

  if (os.platform() === 'win32') {
    let $pathResolve;

    beforeEach('stub `path.resolve()`', () => {
      $pathResolve = sinon.stub(path, 'resolve')
        .callsFake((...paths) => paths.join('/'));
    });

    afterEach(() => $pathResolve.restore());
  }

  // --

  /**
   * `.env*` files stub.
   *
   * @type {{ [filename: string]: string }}
   */
  let $dotenvFiles = {};

  /**
   * Mock `.env*` files.
   *
   * @param {{[filename: string]: string}} fileMap - a map of `filename => contents`
   */
  function mockFS(fileMap) {
    $dotenvFiles = fileMap;
  }

  afterEach('reset `$dotenvFiles` stub', () => {
    $dotenvFiles = {};
  });

  let $fs_existsSync;

  beforeEach('stub `fs.existsSync`', () => {
    $fs_existsSync = sinon.stub(fs, 'existsSync')
      .callsFake(filename => $dotenvFiles.hasOwnProperty(filename));
  });

  afterEach(() => $fs_existsSync.restore());

  let $fs_readFileSync;

  beforeEach('stub `fs.readFileSync`', () => {
    $fs_readFileSync = sinon.stub(fs, 'readFileSync')
      .callsFake((filename) => {
        if (!$dotenvFiles.hasOwnProperty(filename)) {
          const error = new Error(`ENOENT: no such file or directory, open '${filename}'`);
          error.code = 'ENOENT';
          error.errno = -2;  // ENOENT's numeric error code
          error.syscall = 'read';
          error.path = filename;
          throw error;
        }

        return $dotenvFiles[filename];
      });
  });

  afterEach(() => $fs_readFileSync.restore());

  // --

  describe('.listFiles', () => {
    describe('by default (when no options are given)', () => {
      it('lists the default `.env` file if present', () => {
        expect(dotenvFlow.listFiles())
          .to.not.include('.env');

        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok'
        });

        expect(dotenvFlow.listFiles())
          .to.include('/path/to/project/.env');
      });

      it('lists the `.env.local` file if present', () => {
        expect(dotenvFlow.listFiles())
          .to.not.include('/path/to/project/.env.local');

        mockFS({
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
        });

        expect(dotenvFlow.listFiles())
          .to.include('/path/to/project/.env.local');
      });

      it('lists the `.env.defaults` file if present', () => {
        expect(dotenvFlow.listFiles())
          .to.not.include('/path/to/project/.env.defaults');

        mockFS({
          '/path/to/project/.env.defaults': 'DEFAULT_ENV_VAR=ok'
        });

        expect(dotenvFlow.listFiles())
          .to.include('/path/to/project/.env.defaults');
      });

      it('lists files in the order of ascending priority', () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
        });

        expect(dotenvFlow.listFiles())
          .to.have.ordered.members([
            '/path/to/project/.env',
            '/path/to/project/.env.local'
          ]);

        // --

        mockFS({
          '/path/to/project/.env.defaults': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env': 'LOCAL_ENV_VAR=ok'
        });

        expect(dotenvFlow.listFiles())
          .to.have.ordered.members([
            '/path/to/project/.env.defaults',
            '/path/to/project/.env'
          ]);
      });
    });

    describe('when `options.node_env` is given', () => {
      let options;

      beforeEach('setup `options.node_env`', () => {
        options = { node_env: 'development' };
      });

      it('lists the default `.env` file if present', () => {
        expect(dotenvFlow.listFiles(options))
          .to.not.include('/path/to/project/.env');

        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok'
        });

        expect(dotenvFlow.listFiles(options))
          .to.include('/path/to/project/.env');
      });

      it('lists the `.env.local` file if present', () => {
        expect(dotenvFlow.listFiles(options))
          .to.not.include('/path/to/project/.env.local');

        mockFS({
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
        });

        expect(dotenvFlow.listFiles(options))
          .to.include('/path/to/project/.env.local');
      });

      it('lists the "node_env-specific" file if present', () => {
        expect(dotenvFlow.listFiles(options))
          .to.not.include('/path/to/project/.env.development');

        mockFS({
          '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR=ok'
        });

        expect(dotenvFlow.listFiles(options))
          .to.include('/path/to/project/.env.development');
      });

      it('lists the "node_env-specific" local file if present', () => {
        expect(dotenvFlow.listFiles(options))
          .to.not.include('/path/to/project/.env.development.local');

        mockFS({
          '/path/to/project/.env.development.local': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
        });

        expect(dotenvFlow.listFiles(options))
          .to.include('/path/to/project/.env.development.local');
      });

      it('lists the `.env.defaults` file if present', () => {
        expect(dotenvFlow.listFiles(options))
          .to.not.include('/path/to/project/.env.defaults');

        mockFS({
          '/path/to/project/.env.defaults': 'DEFAULT_ENV_VAR=ok'
        });

        expect(dotenvFlow.listFiles(options))
          .to.include('/path/to/project/.env.defaults');
      });

      it('lists files in the order of ascending priority', () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
        });

        expect(dotenvFlow.listFiles(options))
          .to.have.ordered.members([
            '/path/to/project/.env',
            '/path/to/project/.env.local'
          ]);

        // --

        mockFS({
          '/path/to/project/.env.defaults': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env': 'LOCAL_ENV_VAR=ok'
        });

        expect(dotenvFlow.listFiles(options))
          .to.have.ordered.members([
            '/path/to/project/.env.defaults',
            '/path/to/project/.env',
          ]);

        // --

        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR=ok'
        });

        expect(dotenvFlow.listFiles(options))
          .to.have.ordered.members([
            '/path/to/project/.env',
            '/path/to/project/.env.development'
          ]);

        // --

        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok',
          '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR=ok',
          '/path/to/project/.env.development.local': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
        });

        expect(dotenvFlow.listFiles(options))
          .to.have.ordered.members([
            '/path/to/project/.env',
            '/path/to/project/.env.local',
            '/path/to/project/.env.development',
            '/path/to/project/.env.development.local'
          ]);
      });
    });

    describe('when `options.node_env` is set to "test"', () => {
      let options;

      beforeEach('set `options.node_env` to "test"', () => {
        options = { node_env: 'test' };
      });

      it("doesn't list the `.env.local` file", () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok',
          '/path/to/project/.env.test': 'TEST_ENV_VAR=ok',
          '/path/to/project/.env.test.local': 'LOCAL_TEST_ENV_VAR=ok'
        });

        expect(dotenvFlow.listFiles(options))
          .to.have.ordered.members([
            '/path/to/project/.env',
            '/path/to/project/.env.test',
            '/path/to/project/.env.test.local'
          ])
          .and.not.include(
            '/path/to/project/.env.local'
          );
      });
    });

    describe('when `options.pattern` is set to ".env/[local/]env[.node_env]"', () => {
      let options;

      beforeEach('setup `options.pattern`', () => {
        options = { pattern: '.env/[local/]env[.node_env]' };
      });

      describe('… and no `options.node_env` is given', () => {
        it('lists `.env/env` as a default `.env` file', () => {
          mockFS({
            '/path/to/project/.env/env': 'DEFAULT_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.include('/path/to/project/.env/env');
        });

        it('lists `.env/local/env` as `.env.local` file', () => {
          mockFS({
            '/path/to/project/.env/local/env': 'LOCAL_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.include('/path/to/project/.env/local/env');
        });

        it('lists files in the order of ascending priority', () => {
          mockFS({
            '/path/to/project/.env/env': 'DEFAULT_ENV_VAR=ok',
            '/path/to/project/.env/local/env': 'LOCAL_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.have.ordered.members([
              '/path/to/project/.env/env',
              '/path/to/project/.env/local/env'
            ]);
          });
      });

      describe('… and `options.node_env` is given', () => {
        beforeEach('setup `.options.node_env`', () => {
          options.node_env = 'development';
        });

        it('lists `.env/env` as a default `.env` file', () => {
          mockFS({
            '/path/to/project/.env/env': 'DEFAULT_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.include('/path/to/project/.env/env');
        });

        it('lists `.env/local/env` as `.env.local` file', () => {
          mockFS({
            '/path/to/project/.env/local/env': 'LOCAL_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.include('/path/to/project/.env/local/env');
        });

        it('lists `.env/env.<node_env>` as a "node_env-specific" file', () => {
          mockFS({
            '/path/to/project/.env/env.development': 'DEVELOPMENT_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.include('/path/to/project/.env/env.development');
        });

        it('lists `.env/local/env.<node_env>` as a local "node_env-specific" file', () => {
          mockFS({
            '/path/to/project/.env/local/env.development': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.include('/path/to/project/.env/local/env.development');
        });

        it('lists files in the order of ascending priority', () => {
          mockFS({
            '/path/to/project/.env/env': 'DEFAULT_ENV_VAR=ok',
            '/path/to/project/.env/local/env': 'LOCAL_ENV_VAR=ok',
            '/path/to/project/.env/env.development': 'DEVELOPMENT_ENV_VAR=ok',
            '/path/to/project/.env/local/env.development': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.have.ordered.members([
              '/path/to/project/.env/env',
              '/path/to/project/.env/local/env',
              '/path/to/project/.env/env.development',
              '/path/to/project/.env/local/env.development'
            ]);
        });
      });

      describe('… and `options.node_env` is set to "test"', () => {
        beforeEach('set `.options.node_env` to "test"', () => {
          options.node_env = 'test';
        });

        it("doesn't list `.env.local`'s alternate file", () => {
          mockFS({
            '/path/to/project/.env/env': 'DEFAULT_ENV_VAR=ok',
            '/path/to/project/.env/local/env': 'LOCAL_ENV_VAR=ok',
            '/path/to/project/.env/env.test': 'DEVELOPMENT_ENV_VAR=ok',
            '/path/to/project/.env/local/env.test': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.have.ordered.members([
              '/path/to/project/.env/env',
              '/path/to/project/.env/env.test',
              '/path/to/project/.env/local/env.test'
            ])
            .and.not.include('/path/to/project/.env/local/env');
        });
      });
    });

    describe('when `options.pattern` is set to ".env/[node_env/].env[.node_env][.local]"', () => {
      let options;

      beforeEach('setup `options.pattern`', () => {
        options = {
          pattern: '.env/[node_env/].env[.node_env][.local]'
        };
      });

      describe('… and no `options.node_env` is given', () => {
        it('lists `.env/.env` as a default `.env` file', () => {
          mockFS({
            '/path/to/project/.env/.env': 'DEFAULT_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.include('/path/to/project/.env/.env');
        });

        it('lists `.env/.env.local` as `.env.local` file', () => {
          mockFS({
            '/path/to/project/.env/.env.local': 'LOCAL_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.include('/path/to/project/.env/.env.local');
        });

        it('lists files in the order of ascending priority', () => {
          mockFS({
            '/path/to/project/.env/.env': 'DEFAULT_ENV_VAR=ok',
            '/path/to/project/.env/.env.local': 'LOCAL_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.have.ordered.members([
              '/path/to/project/.env/.env',
              '/path/to/project/.env/.env.local'
            ]);
        });
      });

      describe('… and `options.node_env` is given', () => {
        beforeEach('setup `.options.node_env`', () => {
          options.node_env = 'development';
        });

        it('lists `.env/.env` as a default `.env` file', () => {
          mockFS({
            '/path/to/project/.env/.env': 'DEFAULT_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.include('/path/to/project/.env/.env');
        });

        it('lists `.env/.env.local` as `.env.local` file', () => {
          mockFS({
            '/path/to/project/.env/.env.local': 'LOCAL_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.include('/path/to/project/.env/.env.local');
        });

        it('lists `.env/<node_env>/.env.<node_env>` as a "node_env-specific" file', () => {
          mockFS({
            '/path/to/project/.env/development/.env.development': 'DEVELOPMENT_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.include('/path/to/project/.env/development/.env.development');
        });

        it('lists `.env/<node_env>/.env.<node_env>.local` as a local "node_env-specific" file', () => {
          mockFS({
            '/path/to/project/.env/development/.env.development.local': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.include('/path/to/project/.env/development/.env.development.local');
        });

        it('lists files in the order of ascending priority', () => {
          mockFS({
            '/path/to/project/.env/.env': 'DEFAULT_ENV_VAR=ok',
            '/path/to/project/.env/.env.local': 'LOCAL_ENV_VAR=ok',
            '/path/to/project/.env/development/.env.development': 'DEVELOPMENT_ENV_VAR=ok',
            '/path/to/project/.env/development/.env.development.local': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.have.ordered.members([
              '/path/to/project/.env/.env',
              '/path/to/project/.env/.env.local',
              '/path/to/project/.env/development/.env.development',
              '/path/to/project/.env/development/.env.development.local'
            ]);
        });
      });

      describe('… and `options.node_env` is set to "test"', () => {
        beforeEach('set `.options.node_env` to "test"', () => {
          options.node_env = 'test';
        });

        it("doesn't list `.env.local`'s alternate file", () => {
          mockFS({
            '/path/to/project/.env/.env': 'DEFAULT_ENV_VAR=ok',
            '/path/to/project/.env/.env.local': 'LOCAL_ENV_VAR=ok',
            '/path/to/project/.env/test/.env.test': 'TEST_ENV_VAR=ok',
            '/path/to/project/.env/test/.env.test.local': 'LOCAL_TEST_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.have.ordered.members([
              '/path/to/project/.env/.env',
              '/path/to/project/.env/test/.env.test',
              '/path/to/project/.env/test/.env.test.local'
            ])
            .and.not.include('/path/to/project/.env/.env.local');
        });
      });
    });

    describe('when `options.pattern` is set to ".env[.local]" (no `[node_env]` placeholder specified)', () => {
      let options;

      beforeEach('setup `options.pattern`', () => {
        options = { pattern: '.env[.local]' };
      });

      describe('… and no `options.node_env` is given', () => {
        it('lists the default `.env` file', () => {
          mockFS({
            '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.include('/path/to/project/.env');
        });

        it('lists the `.env.local` file', () => {
          mockFS({
            '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.include('/path/to/project/.env.local');
        });

        it('lists files in the order of ascending priority', () => {
          mockFS({
            '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
            '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.have.ordered.members([
              '/path/to/project/.env',
              '/path/to/project/.env.local'
            ]);
        });
      });

      describe('… and `options.node_env` is given', () => {
        beforeEach('setup `.options.node_env`', () => {
          options.node_env = 'development';
        });

        it('lists the default `.env` file', () => {
          mockFS({
            '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.include('/path/to/project/.env');
        });

        it('lists the `env.local` file', () => {
          mockFS({
            '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.include('/path/to/project/.env.local');
        });

        it(`doesn't list any "node_env-specific" files`, () => {
          mockFS({
            '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
            '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok',
            '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR=ok',
            '/path/to/project/.env.development.local': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
          });

          for (const filename of dotenvFlow.listFiles(options)) {
            expect(filename).to.not.include('development');
          }
        });

        it('lists files in the order of ascending priority', () => {
          mockFS({
            '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
            '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.have.ordered.members([
              '/path/to/project/.env',
              '/path/to/project/.env.local'
            ]);
        });
      });

      describe('… and `options.node_env` is set to "test"', () => {
        beforeEach('set `.options.node_env` to "test"', () => {
          options.node_env = 'test';
        });

        it('lists only the default `.env` file', () => {
          mockFS({
            '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
            '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok',
            '/path/to/project/.env.test': 'TEST_ENV_VAR=ok',
            '/path/to/project/.env.test.local': 'LOCAL_TEST_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.deep.equal(['/path/to/project/.env']);
        });
      });
    });

    describe('when `options.pattern` is set to ".env[.node_env]" (no `[local]` placeholder specified)', () => {
      let options;

      beforeEach('setup `options.pattern`', () => {
        options = { pattern: '.env[.node_env]' };
      });

      describe('… and no `options.node_env` is given', () => {
        it('lists only the default `.env` file', () => {
          mockFS({
            '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
            '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.deep.equal(['/path/to/project/.env']);
        });
      });

      describe('… and `options.node_env` is given', () => {
        beforeEach('setup `.options.node_env`', () => {
          options.node_env = 'development';
        });

        it('lists the default `.env` file', () => {
          mockFS({
            '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.include('/path/to/project/.env');
        });

        it('lists the "node_env-specific" file', () => {
          mockFS({
            '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.include('/path/to/project/.env.development');
        });

        it("doesn't list any `.local` files", () => {
          mockFS({
            '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
            '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok',
            '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR=ok',
            '/path/to/project/.env.development.local': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
          });

          for (const filename of dotenvFlow.listFiles(options)) {
            expect(filename).to.not.include('local');
          }
        });

        it('lists files in the order of ascending priority', () => {
          mockFS({
            '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
            '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok',
            '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR=ok',
            '/path/to/project/.env.development.local': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
          });

          expect(dotenvFlow.listFiles(options))
            .to.have.ordered.members([
              '/path/to/project/.env',
              '/path/to/project/.env.development'
            ]);
        });
      });
    });

    describe('when `options.path` is given', () => {
      let options;

      beforeEach('setup `options.pattern`', () => {
        options = { path: '/path/to/another/project' };
      });

      it('uses the given `options.path` as a working directory', () => {
        mockFS({
          '/path/to/another/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/another/project/.env.local': 'LOCAL_ENV_VAR=ok'
        });

        expect(dotenvFlow.listFiles(options))
          .to.deep.equal([
            '/path/to/another/project/.env',
            '/path/to/another/project/.env.local'
          ]);
      });
    });
  });

  describe('.parse', () => {
    describe('when a single filename is given', () => {
      beforeEach('stub `.env` file content', () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok'
        });
      });

      it('parses the contents of the file returning the resulting `name => value` map', () => {
        const parsed = dotenvFlow.parse('/path/to/project/.env');

        expect(parsed)
          .to.be.an('object')
          .with.property('DEFAULT_ENV_VAR', 'ok');
      });

      it("throws if file doesn't exist", () => {
        expect(() => dotenvFlow.parse('/path/to/project/non-existent-file'))
          .to.throw("ENOENT: no such file or directory, open '/path/to/project/non-existent-file'");
      });
    });

    describe('when multiple filenames are given', () => {
      beforeEach("stub `.env*` files' contents", () => {
        mockFS({
          '/path/to/project/.env': (
              'DEFAULT_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR="should be overwritten by `.env.local`"'
          ),
          '/path/to/project/.env.local': (
              'LOCAL_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR=ok'
          )
        });
      });

      it('parses and merges the contents of the given files using the "overwrite merge" strategy', () => {
        const parsed = dotenvFlow.parse([
          '/path/to/project/.env',
          '/path/to/project/.env.local'
        ]);

        expect(parsed)
          .to.be.an('object')
          .that.deep.equals({
            DEFAULT_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok',
            SHARED_ENV_VAR: 'ok'
          });
      });

      it("throws if any of the given files doesn't exist", () => {
        expect(() => dotenvFlow.parse([
          '/path/to/project/.env',
          '/path/to/project/.env-non-existent',
          '/path/to/project/.env.local'
        ]))
          .to.throw("ENOENT: no such file or directory, open '/path/to/project/.env-non-existent'");
      });
    });

    describe('when `options.encoding` is given', () => {
      beforeEach("setup `.env*` files' stubs", () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
        });
      });

      it('provides the given `options.encoding` to `fs.readFileSync()`', () => {
        dotenvFlow.parse('/path/to/project/.env', {
          encoding: 'base64'
        });

        expect($fs_readFileSync)
          .to.have.been.calledWith('/path/to/project/.env', { encoding: 'base64' });

        dotenvFlow.parse([
          '/path/to/project/.env',
          '/path/to/project/.env.local'
        ], {
          encoding: 'base64'
        });

        expect($fs_readFileSync)
          .to.have.been.calledWith('/path/to/project/.env.local', { encoding: 'base64' });
      });
    });
  });

  describe('.load', () => {
    beforeEach("stub `.env*` files' contents", () => {
      mockFS({
        '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
        '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR=ok'
      });
    });

    beforeEach('stub `console.warn`', () => {
      sinon.stub(console, 'warn');
    });

    afterEach('restore `console.warn`', () => {
      console.warn.restore();
    });

    it('loads environment variables from the given files into `process.env`', () => {
      expect(process.env)
        .to.not.have.keys([
          'DEFAULT_ENV_VAR',
          'DEVELOPMENT_ENV_VAR'
        ]);

      dotenvFlow.load([
        '/path/to/project/.env',
        '/path/to/project/.env.development'
      ]);

      expect(process.env)
        .to.include({
          DEFAULT_ENV_VAR: 'ok',
          DEVELOPMENT_ENV_VAR: 'ok'
        });
    });

    it('returns cumulative parsed contents of the given files within the `.parsed` property', () => {
      const result = dotenvFlow.load([
        '/path/to/project/.env',
        '/path/to/project/.env.development'
      ]);

      expect(result)
        .to.be.an('object')
        .with.property('parsed')
        .that.deep.equals({
          DEFAULT_ENV_VAR: 'ok',
          DEVELOPMENT_ENV_VAR: 'ok'
        });
    });

    it("doesn't overwrite predefined environment variables", () => {
      process.env.DEFAULT_ENV_VAR = 'predefined';

      dotenvFlow.load([
        '/path/to/project/.env',
        '/path/to/project/.env.development'
      ]);

      expect(process.env)
        .to.include({
          DEFAULT_ENV_VAR: 'predefined',
          DEVELOPMENT_ENV_VAR: 'ok'
        });
    });

    describe('when `options.encoding` is given', () => {
      let options;

      beforeEach('setup `options.encoding`', () => {
        options = { encoding: 'base64' };
      });

      it('provides the given `options.encoding` to `fs.readFileSync()`', () => {
        dotenvFlow.load([
          '/path/to/project/.env',
          '/path/to/project/.env.development',
        ], options);

        expect($fs_readFileSync)
          .to.have.been.calledWith('/path/to/project/.env', { encoding: 'base64' });

        expect($fs_readFileSync)
          .to.have.been.calledWith('/path/to/project/.env.development', { encoding: 'base64' });
      });
    });

    describe('if parsing is failed', () => {
      beforeEach('stub `fs.readFileSync` error', () => {
        $fs_readFileSync
          .withArgs('/path/to/project/.env.local')
          .throws(new Error('`.env.local` file reading error stub'));
      });

      let filenames;

      beforeEach('setup `filenames` for loading', () => {
        filenames = [
          '/path/to/project/.env',
          '/path/to/project/.env.local', // << the mocked error filename
          '/path/to/project/.env.development'
        ];
      });

      it('leaves `process.env` untouched (does not assign any variables)', () => {
        const processEnvCopy = { ...process.env };

        dotenvFlow.load(filenames);

        expect(process.env)
          .to.deep.equal(processEnvCopy);
      });

      it('returns the occurred error within the `.error` property', () => {
        const result = dotenvFlow.load(filenames);

        expect(result)
          .to.be.an('object')
          .with.property('error')
          .that.is.an('error')
          .with.property('message', '`.env.local` file reading error stub');
      });

      it('warns about the occurred error', () => {
        dotenvFlow.load(filenames);

        expect(console.warn)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*`\.env\.local` file reading error stub/
          );
      });

      it("doesn't warn when suppressed by `options.silent`", () => {
        dotenvFlow.load(filenames, { silent: true });

        expect(console.warn)
          .to.have.not.been.called;
      });
    });
  });

  describe('.unload', () => {
    beforeEach('stub `fs.readFileSync`', () => {
      mockFS({
        '/path/to/project/.env': 'DEFAULT_ENV_VAR="defined by `.env`"'
      });
    });

    it('cleanups `process.env` from the environment variables defined in a given file', () => {
      process.env.DEFAULT_ENV_VAR = 'defined by `.env`';

      dotenvFlow.unload('/path/to/project/.env');

      expect(process.env)
        .to.not.have.property('DEFAULT_ENV_VAR');
    });

    it("doesn't touch the other environment variables", () => {
      process.env.ENV_VAR = 'defined by the environment';
      process.env.DEFAULT_ENV_VAR = 'defined by `.env`';

      dotenvFlow.unload('/path/to/project/.env');

      expect(process.env)
        .to.not.have.property('DEFAULT_ENV_VAR');

      expect(process.env)
        .to.have.property('ENV_VAR', 'defined by the environment');
    });

    describe('when `options.encoding` is given', () => {
      let options;

      beforeEach('setup `options.encoding`', () => {
        options = { encoding: 'base64' };
      });

      it('provides the given `options.encoding` to `fs.readFileSync()`', () => {
        dotenvFlow.unload('/path/to/project/.env', options);

        expect($fs_readFileSync)
          .to.have.been.calledWith('/path/to/project/.env', { encoding: 'base64' });
      });
    });
  });

  describe('.config', () => {
    describe('by default (when no options are given)', () => {
      it('loads the default `.env` file', () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok'
        });

        expect(process.env)
          .to.not.have.property('DEFAULT_ENV_VAR');

        dotenvFlow.config();

        expect(process.env)
          .to.have.property('DEFAULT_ENV_VAR', 'ok');
      });

      it('loads the `.env.local` file', () => {
        mockFS({
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
        });

        expect(process.env)
          .to.not.have.property('LOCAL_ENV_VAR');

        dotenvFlow.config();

        expect(process.env)
          .to.have.property('LOCAL_ENV_VAR', 'ok');
      });

      it("merges the parsed files' contents", () => {
        mockFS({
          '/path/to/project/.env': (
              'DEFAULT_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR="should be overwritten by `.env.local`"'
          ),
          '/path/to/project/.env.local': (
              'LOCAL_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR=ok'
          )
        });

        expect(process.env)
          .to.not.have.keys([
            'DEFAULT_ENV_VAR',
            'LOCAL_ENV_VAR',
            'SHARED_ENV_VAR'
          ]);

        dotenvFlow.config();

        expect(process.env)
          .to.include({
            DEFAULT_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok',
            SHARED_ENV_VAR: 'ok'
          });
      });

      it('returns the merged contents of the files within the `.parsed` property', () => {
        mockFS({
          '/path/to/project/.env': (
              'DEFAULT_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR="should be overwritten by `.env.local`"'
          ),
          '/path/to/project/.env.local': (
              'LOCAL_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR=ok'
          )
        });

        const result = dotenvFlow.config();

        expect(result)
          .to.be.an('object')
          .with.property('parsed')
          .that.deep.equals({
            DEFAULT_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok',
            SHARED_ENV_VAR: 'ok'
          });
      });
    });

    describe('when the `NODE_ENV` environment variable is present', () => {
      beforeEach('setup `process.env.NODE_ENV`', () => {
        process.env.NODE_ENV = 'development';
      });

      it('loads the default `.env` file', () => {
        mockFS({
          '/path/to/project/.env' :'DEFAULT_ENV_VAR=ok'
        });

        expect(process.env)
          .to.not.have.property('DEFAULT_ENV_VAR');

        dotenvFlow.config();

        expect(process.env)
          .to.have.property('DEFAULT_ENV_VAR', 'ok');
      });

      it('loads the `.env.local` file', () => {
        mockFS({
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
        });

        expect(process.env)
          .to.not.have.property('LOCAL_ENV_VAR');

        dotenvFlow.config();

        expect(process.env)
          .to.have.property('LOCAL_ENV_VAR', 'ok');
      });

      it('loads the "node_env-specific" env file', () => {
        mockFS({
          '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR=ok'
        });

        expect(process.env)
          .to.not.have.property('DEVELOPMENT_ENV_VAR');

        dotenvFlow.config();

        expect(process.env)
          .to.have.property('DEVELOPMENT_ENV_VAR', 'ok');
      });

      it('loads the "node_env-specific" local env file', () => {
        mockFS({
          '/path/to/project/.env.development.local': 'DEVELOPMENT_LOCAL_ENV_VAR=ok'
        });

        expect(process.env)
          .to.not.have.property('DEVELOPMENT_LOCAL_ENV_VAR');

        dotenvFlow.config();

        expect(process.env)
          .to.have.property('DEVELOPMENT_LOCAL_ENV_VAR', 'ok');
      });

      it("merges the parsed files' contents", () => {
        mockFS({
          '/path/to/project/.env': (
              'DEFAULT_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR="should be overwritten by `.env.local`"'
          ),

          '/path/to/project/.env.local': (
              'LOCAL_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR="should be overwritten by `.env.development`"'
          ),

          '/path/to/project/.env.development': (
              'DEVELOPMENT_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR="should be overwritten by `.env.development.local`"'
          ),

          '/path/to/project/.env.development.local': (
              'LOCAL_DEVELOPMENT_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR=ok'
          ),
        });

        expect(process.env)
          .to.not.have.keys([
            'DEFAULT_ENV_VAR',
            'LOCAL_ENV_VAR',
            'DEVELOPMENT_ENV_VAR',
            'LOCAL_DEVELOPMENT_ENV_VAR',
            'SHARED_ENV_VAR'
          ]);

        dotenvFlow.config();

        expect(process.env)
          .to.include({
            DEFAULT_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok',
            DEVELOPMENT_ENV_VAR: 'ok',
            LOCAL_DEVELOPMENT_ENV_VAR: 'ok',
            SHARED_ENV_VAR: 'ok'
          });
      });

      it('returns the merged contents of the files within the `.parsed` property', () => {
        mockFS({
          '/path/to/project/.env': (
              'DEFAULT_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR="should be overwritten by `.env.local`"'
          ),

          '/path/to/project/.env.local': (
              'LOCAL_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR="should be overwritten by `.env.development`"'
          ),

          '/path/to/project/.env.development': (
              'DEVELOPMENT_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR="should be overwritten by `.env.development.local`"'
          ),

          '/path/to/project/.env.development.local': (
              'LOCAL_DEVELOPMENT_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR=ok'
          ),
        });

        const result = dotenvFlow.config();

        expect(result)
          .to.be.an('object')
          .with.property('parsed')
          .that.deep.equals({
            DEFAULT_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok',
            DEVELOPMENT_ENV_VAR: 'ok',
            LOCAL_DEVELOPMENT_ENV_VAR: 'ok',
            SHARED_ENV_VAR: 'ok'
          });
      });
    });

    describe('when `options.node_env` is given', () => {
      let options;

      beforeEach('setup `options.node_env`', () => {
        options = { node_env: 'production' };
      });

      it('uses the given `options.node_env` instead of `NODE_ENV`', () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok',
          '/path/to/project/.env.production': 'PRODUCTION_ENV_VAR=ok',
          '/path/to/project/.env.production.local': 'LOCAL_PRODUCTION_ENV_VAR=ok'
        });

        process.env.NODE_ENV = 'development';

        expect(process.env)
          .to.not.have.keys([
            'DEFAULT_ENV_VAR',
            'LOCAL_ENV_VAR',
            'PRODUCTION_ENV_VAR',
            'LOCAL_PRODUCTION_ENV_VAR'
          ]);

        const result = dotenvFlow.config(options);

        expect(result)
          .to.be.an('object')
          .with.property('parsed')
          .that.deep.equals({
            DEFAULT_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok',
            PRODUCTION_ENV_VAR: 'ok',
            LOCAL_PRODUCTION_ENV_VAR: 'ok'
          });

        expect(process.env)
          .to.include({
            DEFAULT_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok',
            PRODUCTION_ENV_VAR: 'ok',
            LOCAL_PRODUCTION_ENV_VAR: 'ok'
          });
      });
    });

    describe('when `options.default_node_env` is given', () => {
      let options;

      beforeEach('setup `options.default_node_env`', () => {
        options = { default_node_env: 'development' };
      });

      it('uses the given environment as default', () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok',
          '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR=ok',
          '/path/to/project/.env.development.local': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
        });

        expect(process.env)
          .to.not.have.keys([
            'DEFAULT_ENV_VAR',
            'LOCAL_ENV_VAR',
            'DEVELOPMENT_ENV_VAR',
            'LOCAL_DEVELOPMENT_ENV_VAR'
          ]);

        const result = dotenvFlow.config(options);

        expect(result)
          .to.be.an('object')
          .with.property('parsed')
          .that.deep.equals({
            DEFAULT_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok',
            DEVELOPMENT_ENV_VAR: 'ok',
            LOCAL_DEVELOPMENT_ENV_VAR: 'ok'
          });

        expect(process.env)
          .to.include({
            DEFAULT_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok',
            DEVELOPMENT_ENV_VAR: 'ok',
            LOCAL_DEVELOPMENT_ENV_VAR: 'ok'
          });
      });

      it('prioritizes the `NODE_ENV` environment variable if present', () => {
        mockFS({
          '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR="should not be loaded"',
          '/path/to/project/.env.production': 'PRODUCTION_ENV_VAR=ok'
        });

        process.env.NODE_ENV = 'production';

        expect(process.env)
          .to.not.have.keys([
            'DEVELOPMENT_ENV_VAR',
            'PRODUCTION_ENV_VAR'
          ]);

        dotenvFlow.config(options);

        expect(process.env)
          .to.have.property('PRODUCTION_ENV_VAR', 'ok');
      });

      it('prioritizes `options.node_env` if given', () => {
        mockFS({
          '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR="should not be loaded"',
          '/path/to/project/.env.production': 'PRODUCTION_ENV_VAR=ok'
        });

        options.node_env = 'production';

        expect(process.env)
          .to.not.have.keys([
            'DEVELOPMENT_ENV_VAR',
            'PRODUCTION_ENV_VAR'
          ]);

        dotenvFlow.config(options);

        expect(process.env)
          .to.have.property('PRODUCTION_ENV_VAR', 'ok');
      });
    });

    describe('when `options.path` is given', () => {
      let options;

      beforeEach('setup `options.path`', () => {
        options = { path: '/path/to/another/project' };
      });

      it('uses the given `options.path` as a working directory', () => {
        mockFS({
          '/path/to/another/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/another/project/.env.local': 'LOCAL_ENV_VAR=ok'
        });

        expect(process.env)
          .to.not.have.keys([
            'DEFAULT_ENV_VAR',
            'LOCAL_ENV_VAR'
          ]);

        dotenvFlow.config(options);

        expect(process.env)
          .to.include({
            DEFAULT_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok'
          });
      });
    });

    describe('when `options.pattern` is given', () => {
      let options;

      beforeEach('setup `options.pattern`', () => {
        options = { pattern: '.env/[local/]env[.node_env]' };
      });

      it('reads files by the given `.env*` files naming convention', () => {
        mockFS({
          '/path/to/project/.env/env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env/env.development': 'DEVELOPMENT_ENV_VAR=ok',
          '/path/to/project/.env/local/env': 'LOCAL_ENV_VAR=ok',
          '/path/to/project/.env/local/env.development': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
        });

        process.env.NODE_ENV = 'development';

        expect(process.env)
          .to.not.have.keys([
            'DEFAULT_ENV_VAR',
            'LOCAL_ENV_VAR',
            'DEVELOPMENT_ENV_VAR',
            'LOCAL_DEVELOPMENT_ENV_VAR'
          ]);

        dotenvFlow.config(options);

        expect(process.env)
          .to.include({
            DEFAULT_ENV_VAR: 'ok',
            DEVELOPMENT_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok',
            LOCAL_DEVELOPMENT_ENV_VAR: 'ok'
          });
      });
    });

    describe('when `options.files` is given', () => {
      let options;

      beforeEach('setup `options.files`', () => {
        options = {
          files: [
            '.env',
            '.env.production',
            '.env.local'
          ]
        };
      });

      it('loads the given list of files', () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok',
          '/path/to/project/.env.production': 'PRODUCTION_ENV_VAR=ok',
          '/path/to/project/.env.production.local': 'LOCAL_PRODUCTION_ENV_VAR=ok'
        });

        expect(process.env)
          .to.not.have.keys([
            'DEFAULT_ENV_VAR',
            'PRODUCTION_ENV_VAR',
            'LOCAL_ENV_VAR',
            'LOCAL_PRODUCTION_ENV_VAR'
          ]);

        const result = dotenvFlow.config(options);

        expect(result)
          .to.be.an('object')
          .with.property('parsed')
          .that.deep.equals({
            DEFAULT_ENV_VAR: 'ok',
            PRODUCTION_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok'
          });

        expect(process.env)
          .to.include({
            DEFAULT_ENV_VAR: 'ok',
            PRODUCTION_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok'
          });

        expect(process.env)
          .to.not.have.key('LOCAL_PRODUCTION_ENV_VAR');
      });

      it('ignores `options.node_env`', () => {
        options.node_env = 'development';

        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok',
          '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR=ok',
          '/path/to/project/.env.production': 'PRODUCTION_ENV_VAR=ok'
        });

        expect(process.env)
          .to.not.have.keys([
            'DEFAULT_ENV_VAR',
            'DEVELOPMENT_ENV_VAR',
            'PRODUCTION_ENV_VAR',
            'LOCAL_ENV_VAR'
          ]);

        const result = dotenvFlow.config(options);

        expect(result)
          .to.be.an('object')
          .with.property('parsed')
          .that.deep.equals({
            DEFAULT_ENV_VAR: 'ok',
            PRODUCTION_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok'
          });

        expect(process.env)
          .to.include({
            DEFAULT_ENV_VAR: 'ok',
            PRODUCTION_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok'
          });

        expect(process.env)
          .to.not.have.key('DEVELOPMENT_ENV_VAR');
      });

      it('loads the list of files in the given order', () => {
        mockFS({
          '/path/to/project/.env': (
            'DEFAULT_ENV_VAR=ok\n' +
            'PRODUCTION_ENV_VAR="should be overwritten by `.env.production"`'
          ),
          '/path/to/project/.env.local': (
            'LOCAL_ENV_VAR=ok'
          ),
          '/path/to/project/.env.production': (
            'LOCAL_ENV_VAR="should be overwritten by `.env.local"`\n' +
            'PRODUCTION_ENV_VAR=ok'
          )
        });

        expect(process.env)
          .to.not.have.keys([
            'DEFAULT_ENV_VAR',
            'PRODUCTION_ENV_VAR',
            'LOCAL_ENV_VAR'
          ]);

        const result = dotenvFlow.config(options);

        expect(result)
          .to.be.an('object')
          .with.property('parsed')
          .that.deep.equals({
            DEFAULT_ENV_VAR: 'ok',
            PRODUCTION_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok'
          });

        expect(process.env)
          .to.include({
            DEFAULT_ENV_VAR: 'ok',
            PRODUCTION_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok'
          });
      });

      it('ignores missing files', () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok'
        });

        expect(process.env)
          .to.not.have.keys([
            'DEFAULT_ENV_VAR',
            'PRODUCTION_ENV_VAR',
            'LOCAL_ENV_VAR'
          ]);

        const result = dotenvFlow.config(options);

        expect(result)
          .to.be.an('object')
          .with.property('parsed')
          .that.deep.equals({
            DEFAULT_ENV_VAR: 'ok'
          });

        expect(process.env)
          .to.include({
            DEFAULT_ENV_VAR: 'ok'
          });

        expect(process.env)
          .to.not.have.keys([
            'PRODUCTION_ENV_VAR',
            'LOCAL_ENV_VAR'
          ]);
      });

      describe('… and `options.path` is given', () => {
        beforeEach('setup `options.path`', () => {
          options.path = '/path/to/another/project';
        });

        it('uses the given `options.path` as a working directory', () => {
          mockFS({
            '/path/to/another/project/.env': 'DEFAULT_ENV_VAR=ok',
            '/path/to/another/project/.env.production': 'PRODUCTION_ENV_VAR=ok',
            '/path/to/another/project/.env.local': 'LOCAL_ENV_VAR=ok'
          });

          expect(process.env)
            .to.not.have.keys([
            'DEFAULT_ENV_VAR',
            'PRODUCTION_ENV_VAR',
            'LOCAL_ENV_VAR'
          ]);

          const result = dotenvFlow.config(options);

          expect(result)
            .to.be.an('object')
            .with.property('parsed')
            .that.deep.equals({
              DEFAULT_ENV_VAR: 'ok',
              PRODUCTION_ENV_VAR: 'ok',
              LOCAL_ENV_VAR: 'ok'
            });

          expect(process.env)
            .to.include({
              DEFAULT_ENV_VAR: 'ok',
              PRODUCTION_ENV_VAR: 'ok',
              LOCAL_ENV_VAR: 'ok'
            });
        });
      });
    });

    describe('when `options.encoding` is given', () => {
      let options;

      beforeEach('setup `options.encoding`', () => {
        options = { encoding: 'base64' };
      });

      it('provides the given `options.encoding` to `fs.readFileSync()`', () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
        });

        expect(process.env)
          .to.not.have.keys([
            'DEFAULT_ENV_VAR',
            'LOCAL_ENV_VAR'
          ]);

        dotenvFlow.config(options);

        expect($fs_readFileSync)
          .to.have.been.calledWith('/path/to/project/.env', { encoding: 'base64' });

        expect($fs_readFileSync)
          .to.have.been.calledWith('/path/to/project/.env.local', { encoding: 'base64' });
      });
    });

    describe('when `options.purge_dotenv` is enabled', () => {
      let options;

      beforeEach('setup `options.purge_dotenv`', () => {
        options = { purge_dotenv: true };
      });

      beforeEach("setup `.env*` files' contents", () => {
        mockFS({
          '/path/to/project/.env': (
              'DEFAULT_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR="should be overwritten by `.env.local`"'
          ),
          '/path/to/project/.env.local': (
              'LOCAL_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR=ok'
          )
        });
      });

      it('fixes the "preloaded `.env` file" issue', () => {
        process.env.DEFAULT_ENV_VAR = 'ok';
        process.env.SHARED_ENV_VAR = 'should be overwritten by `.env.local`';

        dotenvFlow.config(options);

        expect(process.env)
          .to.include({
            DEFAULT_ENV_VAR: 'ok',
            LOCAL_ENV_VAR: 'ok',
            SHARED_ENV_VAR: 'ok'
          });
      });

      it('provides `options.encoding` to `fs.readFileSync()` if given', () => {
        options.encoding = 'base64';

        dotenvFlow.config(options);

        expect($fs_readFileSync.firstCall)
          .to.have.been.calledWith('/path/to/project/.env', { encoding: 'base64' });

        expect($fs_readFileSync.secondCall)
          .to.have.been.calledWith('/path/to/project/.env', { encoding: 'base64' });
      });

      it("doesn't fail if the default `.env` file is not present", () => {
        delete $dotenvFiles['/path/to/project/.env'];

        dotenvFlow.config(options);

        expect(process.env)
          .to.include({
            LOCAL_ENV_VAR: 'ok',
            SHARED_ENV_VAR: 'ok'
          });

        expect(process.env)
          .to.not.have.property('DEFAULT_ENV_VAR');
      });
    });

    describe('when `options.debug` is enabled', () => {
      let options;

      beforeEach('setup `options.debug`', () => {
        options = { debug: true };
      });

      beforeEach('stub `console.debug`', () => {
        sinon.stub(console, 'debug');
      });

      afterEach('restore `console.debug`', () => {
        console.debug.restore();
      });

      beforeEach("stub `.env*` files' contents", () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok'
        });
      });

      it('prints out initialization options [0]', () => {
        dotenvFlow.config(options);

        expect(console.debug)
          .to.have.been.calledWithMatch(/dotenv-flow\b.*init/);

        expect(console.debug)
          .to.have.not.been.calledWithMatch(/dotenv-flow\b.*options\./);
      });

      it('prints out initialization options [1]', () => {
        dotenvFlow.config({
          ...options,
          node_env: 'development'
        });

        expect(console.debug)
          .to.have.been.calledWithMatch(/dotenv-flow\b.*init/);

        expect(console.debug)
          .to.have.been.calledWithMatch('options.node_env', 'development');
      });

      it('prints out initialization options [2]', () => {
        dotenvFlow.config({
          ...options,
          node_env: 'production',
          default_node_env: 'development'
        });

        expect(console.debug)
          .to.have.been.calledWithMatch(/dotenv-flow\b.*init/);

        expect(console.debug)
          .to.have.been.calledWithMatch('options.node_env', 'production');

        expect(console.debug)
          .to.have.been.calledWithMatch('options.default_node_env', 'development');
      });

      it('prints out initialization options [3]', () => {
        process.env.NODE_ENV = 'test';

        dotenvFlow.config({
          ...options,
          node_env: 'production',
          default_node_env: 'development',
          path: '/path/to/project',
          pattern: '.env[.node_env][.local]',
          encoding: 'utf8',
          purge_dotenv: false,
          silent: false,
        });

        expect(console.debug)
          .to.have.been.calledWithMatch(/dotenv-flow\b.*init/);

        expect(console.debug)
          .to.have.been.calledWithMatch('options.node_env', "production");

        expect(console.debug)
          .to.have.been.calledWithMatch('options.default_node_env', "development");

        expect(console.debug)
          .to.have.been.calledWithMatch('options.path', '/path/to/project');

        expect(console.debug)
          .to.have.been.calledWithMatch('options.pattern', '.env[.node_env][.local]');

        expect(console.debug)
          .to.have.been.calledWithMatch('options.encoding', 'utf8');

        expect(console.debug)
          .to.have.been.calledWithMatch('options.purge_dotenv', false);

        expect(console.debug)
          .to.have.been.calledWithMatch('options.silent', false);
      });

      it('prints out initialization options [4]', () => {
        dotenvFlow.config({
          ...options,
          path: '/path/to/another/project',
          files: [
            '.env',
            '.env.production',
            '.env.local'
          ],
        });

        expect(console.debug)
          .to.have.been.calledWithMatch(/dotenv-flow\b.*init/);

        expect(console.debug)
          .to.have.been.calledWithMatch('options.path', '/path/to/another/project');

        expect(console.debug)
          .to.have.been.calledWithMatch('options.files', [
            '.env',
            '.env.production',
            '.env.local'
          ]);
      });

      it('prints out effective node_env set by `options.node_env`', () => {
        dotenvFlow.config({
          ...options,
          node_env: 'production'
        });

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*operating in "production" environment.*`options\.node_env`/
          );
      });

      it('prints out effective node_env set by `process.env.NODE_ENV`', () => {
        process.env.NODE_ENV = 'test';

        dotenvFlow.config(options);

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*operating in "test" environment.*`process\.env\.NODE_ENV`/
          );
      });

      it('prints out effective node_env taken from `options.default_node_env`', () => {
        dotenvFlow.config({
          ...options,
          default_node_env: 'development'
        });

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*operating in "development" environment.*`options\.default_node_env`/
          );
      });

      it('notifies about operating in "no environment" mode when none of the related options is set', () => {
        dotenvFlow.config(options);

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*operating in "no environment" mode/
          );
      });

      it('prints out the list of effective `.env*` files', () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok',
          '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR=ok',
          '/path/to/project/.env.development.local': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
        });

        dotenvFlow.config({
          ...options,
          node_env: 'development'
        });

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*>> %s/,
            /^\/path\/to\/project\/\.env$/
          );

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*>> %s/,
            /^\/path\/to\/project\/\.env\.local$/
          );

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*>> %s/,
            /^\/path\/to\/project\/\.env\.development$/
          );

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*>> %s/,
            /^\/path\/to\/project\/\.env\.development\.local$/
          );
      });

      it('prints out parsing files', () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok',
          '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR=ok',
          '/path/to/project/.env.development.local': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
        });

        dotenvFlow.config({
          ...options,
          node_env: 'development'
        });

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*parsing.*%s/,
            /^\/path\/to\/project\/\.env$/
          );

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*parsing.*%s/,
            /^\/path\/to\/project\/\.env\.local$/
          );

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*parsing.*%s/,
            /^\/path\/to\/project\/\.env\.development$/
          );

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*parsing.*%s/,
            /^\/path\/to\/project\/\.env\.development\.local$/
          );
      });

      it('prints out parsed environment variables', () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok',
          '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR=ok',
          '/path/to/project/.env.development.local': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
        });

        dotenvFlow.config({
          ...options,
          node_env: 'development'
        });

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*>> %s/,
            'DEFAULT_ENV_VAR'
          );

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*> %s/,
            'LOCAL_ENV_VAR'
          );

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*> %s/,
            'DEVELOPMENT_ENV_VAR'
          );

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*> %s/,
            'LOCAL_DEVELOPMENT_ENV_VAR'
          );
      });

      it('prints out environment variables assigned to `process.env`', () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok',
          '/path/to/project/.env.development': 'DEVELOPMENT_ENV_VAR=ok',
          '/path/to/project/.env.development.local': 'LOCAL_DEVELOPMENT_ENV_VAR=ok'
        });

        dotenvFlow.config({
          ...options,
          node_env: 'development'
        });

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*merging.*variables.*`process.env`/
          );

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*>> process\.env\.%s/,
            'DEFAULT_ENV_VAR'
          );

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*>> process\.env\.%s/,
            'LOCAL_ENV_VAR'
          );

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*>> process\.env\.%s/,
            'DEVELOPMENT_ENV_VAR'
          );

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*>> process\.env\.%s/,
            'LOCAL_DEVELOPMENT_ENV_VAR'
          );
      });

      it('informs when merging with overwrites', () => {
        mockFS({
          '/path/to/project/.env': (
              'DEFAULT_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR=1'
          ),
          '/path/to/project/.env.local': (
              'LOCAL_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR=2'
          ),
          '/path/to/project/.env.development': (
              'DEVELOPMENT_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR=3'
          ),
          '/path/to/project/.env.development.local': (
              'LOCAL_DEVELOPMENT_ENV_VAR=ok\n' +
              'SHARED_ENV_VAR=4'
          )
        });

        dotenvFlow.config({
          ...options,
          node_env: 'development'
        });

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*%s.*overwritten by.*%s/,
            'SHARED_ENV_VAR',
            /^\/path\/to\/project\/\.env\.local$/
          );

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*%s.*overwritten by.*%s/,
            'SHARED_ENV_VAR',
            /^\/path\/to\/project\/\.env\.development$/
          );

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*%s.*overwritten by.*%s/,
            'SHARED_ENV_VAR',
            /^\/path\/to\/project\/\.env\.development\.local$/
          );
      });

      it('informs when predefined environment variable is not being overwritten', () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR="should be predefined"'
        });

        process.env.DEFAULT_ENV_VAR = 'predefined';

        dotenvFlow.config(options);

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*%s.*predefined.*not.*overwritten/,
            'DEFAULT_ENV_VAR'
          );
      });

      it('prints out the completion status', () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok'
        });

        dotenvFlow.config({
          ...options,
          node_env: 'development'
        });

        expect(console.debug)
          .to.have.been.calledWithMatch(
            /dotenv-flow\b.*initialization completed/
          );
      });

      describe('… and `options.node_env` is set to "test"', () => {
        beforeEach('set `.options.node_env` to "test"', () => {
          options.node_env = 'test';
        });

        it('notifies that `.env.local` is being skipped in "test" environment', () => {
          mockFS({
            '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
            '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok',
            '/path/to/project/.env.test': 'TEST_ENV_VAR=ok',
            '/path/to/project/.env.test.local': 'LOCAL_TEST_ENV_VAR=ok'
          });

          dotenvFlow.config(options);

          expect(console.debug)
            .to.have.been.calledWithMatch(
              /dotenv-flow\b.*%s.*is being skipped for "test" environment/,
              '.env.local'
            );
        });

        it("doesn't spam about skipping `.env.local` if it doesn't exist", () => {
          mockFS({
            '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
            '/path/to/project/.env.test': 'TEST_ENV_VAR=ok',
            '/path/to/project/.env.test.local': 'LOCAL_TEST_ENV_VAR=ok'
          });

          dotenvFlow.config(options);

          expect(console.debug)
            .to.have.not.been.calledWithMatch(/dotenv-flow\b.*%s.*skipped/);
        });
      });

      describe('… and `options.purge_dotenv` is enabled', () => {
        beforeEach('setup `options.purge_dotenv`', () => {
          options.purge_dotenv = true;
        });

        it('prints out the "unloading `.env` file" message', () => {
          dotenvFlow.config(options);

          expect(console.debug)
            .to.have.been.calledWithMatch(
              /dotenv-flow\b.*`options\.purge_dotenv`.*unloading.*`\.env`/
            );
        });
      });
    });

    describe('if parsing is failed', () => {
      beforeEach("stub `.env*` files' contents", () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
        });
      });

      beforeEach('stub `fs.readFileSync` error', () => {
        $fs_readFileSync
          .withArgs('/path/to/project/.env.local')
          .throws(new Error('`.env.local` file reading error stub'));
      });

      beforeEach('stub `console.warn`', () => {
        sinon.stub(console, 'warn');
      });

      afterEach('restore `console.warn`', () => {
        console.warn.restore();
      });

      it("doesn't load any environment variables", () => {
        const processEnvCopy = { ...process.env };

        dotenvFlow.config();

        expect(process.env)
          .to.deep.equal(processEnvCopy);
      });

      it('returns the occurred error in the `error` property', () => {
        const result = dotenvFlow.config();

        expect(result)
          .to.be.an('object')
          .with.property('error')
          .that.is.an('error')
          .with.property('message', '`.env.local` file reading error stub');
      });

      it('warns about the occurred error', () => {
        dotenvFlow.config();

        expect(console.warn)
          .to.have.been.calledWithMatch(/dotenv-flow\b.*`\.env\.local` file reading error stub/);
      });
    });

    describe('when none of the appropriate ".env*" files is present', () => {
      beforeEach('stub `console.warn`', () => {
        sinon.stub(console, 'warn');
      });

      afterEach('restore `console.warn`', () => {
        console.warn.restore();
      });

      describe('… and no "node_env-related" options are set', () => {
        it('returns "no `.env*` files" error', () => {
          const result = dotenvFlow.config();

          expect(result)
            .to.be.an('object')
            .with.property('error')
            .that.is.an('error')
            .with.property('message')
            .that.matches(/no "\.env\*" files/);
        });

        it('warns about the "no `.env*` files" error', () => {
          dotenvFlow.config();

          expect(console.warn)
            .to.have.been.calledWithMatch(/dotenv-flow\b.*no "\.env\*" files/);
        });

        describe('the returning error message', () => {
          it('indicates the working directory', () => {
            const defaultResult = dotenvFlow.config();

            expect(defaultResult.error)
              .to.be.an('error')
              .with.property('message')
              .that.includes('/path/to/project');

            const pathResult = dotenvFlow.config({
              path: '/path/to/another/project'
            });

            expect(pathResult.error)
              .to.be.an('error')
              .with.property('message')
              .that.includes('/path/to/another/project');
          });

          it('indicates the naming convention pattern', () => {
            const defaultResult = dotenvFlow.config();

            expect(defaultResult.error)
              .to.be.an('error')
              .with.property('message')
              .that.includes('.env[.node_env][.local]');

            const patternResult = dotenvFlow.config({
              pattern: 'config/[local/].env[.node_env]'
            });

            expect(patternResult.error)
              .to.be.an('error')
              .with.property('message')
              .that.includes('config/[local/].env[.node_env]');
          });
        });
      });

      describe('… and the `NODE_ENV` environment variable is present', () => {
        beforeEach('setup `process.env.NODE_ENV`', () => {
          process.env.NODE_ENV = 'development';
        });

        it('returns "no `.env*` files" error', () => {
          const result = dotenvFlow.config();

          expect(result)
            .to.be.an('object')
            .with.property('error')
            .that.is.an('error')
            .with.property('message')
            .that.matches(/no "\.env\*" files/);
        });

        it('warns about the "no `.env*` files" error', () => {
          dotenvFlow.config();

          expect(console.warn)
            .to.have.been.calledWithMatch(/dotenv-flow\b.*no "\.env\*" files/);
        });

        describe('the returning error message', () => {
          it('indicates the working directory', () => {
            const defaultResult = dotenvFlow.config();

            expect(defaultResult.error)
              .to.be.an('error')
              .with.property('message')
              .that.includes('/path/to/project');

            const pathResult = dotenvFlow.config({
              path: '/path/to/another/project'
            });

            expect(pathResult.error)
              .to.be.an('error')
              .with.property('message')
              .that.includes('/path/to/another/project');
          });

          it('indicates the naming convention pattern for the specified node_env', () => {
            const defaultResult = dotenvFlow.config();

            expect(defaultResult.error)
              .to.be.an('error')
              .with.property('message')
              .that.includes('.env[.development][.local]');

            const patternResult = dotenvFlow.config({
              pattern: 'config/[local/].env[.node_env]'
            });

            expect(patternResult.error)
              .to.be.an('error')
              .with.property('message')
              .that.includes('config/[local/].env[.development]');
          });
        });
      });
    });

    describe('when `options.silent` is enabled', () => {
      let options;

      beforeEach('setup `options.silent`', () => {
        options = { silent: true };
      });

      beforeEach('stub `console.warn`', () => {
        sinon.stub(console, 'warn');
      });

      afterEach('restore `console.warn`', () => {
        console.warn.restore();
      });

      it("doesn't warn if parsing is failed", () => {
        mockFS({
          '/path/to/project/.env': 'DEFAULT_ENV_VAR=ok',
          '/path/to/project/.env.local': 'LOCAL_ENV_VAR=ok'
        });

        $fs_readFileSync
          .withArgs('/path/to/project/.env.local')
          .throws(new Error('`.env.local` file reading error stub'));

        const result = dotenvFlow.config(options);

        expect(console.warn)
          .to.have.not.been.called;

        expect(result.error)
          .to.be.an('error')
          .with.property('message', '`.env.local` file reading error stub');
      });

      it("doesn't warn about missing `.env*` files", () => {
        const result = dotenvFlow.config(options);

        expect(console.warn)
          .to.have.not.been.called;

        expect(result.error)
          .to.be.an('error')
          .with.property('message')
          .that.matches(/no "\.env\*" files/);
      });
    });
  });
});
