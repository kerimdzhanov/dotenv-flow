import { createRequire } from 'node:module';
import { expect } from 'chai';

const require = createRequire(import.meta.url)

describe('exports', () => {
  describe('commonjs', () => {
    it('should load module using require', () => {
      const dotenv = require('../..')

      expect(dotenv).to.include.keys([
        'listFiles',
        'config',
        'parse',
        'load',
        'unload'
      ]);
    });
  });

  describe('esm', () => {
    it('should load module using import', async () => {
      const dotenv = await import('dotenv-flow'); // self-import

      expect(dotenv).to.include.keys([
        'listFiles',
        'config',
        'parse',
        'load',
        'unload',
        'default'
      ]);
    });

    it('should load config entry point', async () => {
      // just checking that it doesn't throw, ideally should test that it loads some env too
      await import('dotenv-flow/config'); // self-import
    });
  });
});
