import dotenvFlow from '../../lib/dotenv-flow';

const filenames: string[] = dotenvFlow.listFiles();
dotenvFlow.listFiles({});
dotenvFlow.listFiles({ node_env: 'development' });
dotenvFlow.listFiles({ path: '/path/to/project' });
dotenvFlow.listFiles({ pattern: '.env[.node_env][.local]' });
dotenvFlow.listFiles({ debug: true });
dotenvFlow.listFiles({
  node_env: 'development',
  path: '/path/to/project',
  pattern: '.env[.node_env][.local]',
  debug: true
});

dotenvFlow.parse('/path/to/project/.env');
dotenvFlow.parse('/path/to/project/.env', {});
dotenvFlow.parse('/path/to/project/.env', { encoding: 'utf8' });
dotenvFlow.parse('/path/to/project/.env', { debug: true });
dotenvFlow.parse('/path/to/project/.env', {
  encoding: 'utf8',
  debug: true
});

dotenvFlow.parse(['/path/to/project/.env']);
dotenvFlow.parse(['/path/to/project/.env'], {});
dotenvFlow.parse(['/path/to/project/.env'], { encoding: 'utf8' });
dotenvFlow.parse(['/path/to/project/.env'], { debug: true });
dotenvFlow.parse(['/path/to/project/.env'], {
  encoding: 'utf8',
  debug: true
});

const parsed: { [name: string]: string } = dotenvFlow.parse('/path/to/project/.env');
const typed: { VARNAME: string } = dotenvFlow.parse('/path/to/project/.env');

// --

dotenvFlow.load('/path/to/project/.env');
dotenvFlow.load('/path/to/project/.env', {});
dotenvFlow.load('/path/to/project/.env', { encoding: 'utf8' });
dotenvFlow.load('/path/to/project/.env', { debug: true });
dotenvFlow.load('/path/to/project/.env', { silent: true });
dotenvFlow.load('/path/to/project/.env', {
  encoding: 'utf8',
  debug: true,
  silent: false
});

dotenvFlow.load(['/path/to/project/.env']);
dotenvFlow.load(['/path/to/project/.env'], {});
dotenvFlow.load(['/path/to/project/.env'], { encoding: 'utf8' });
dotenvFlow.load(['/path/to/project/.env'], { debug: true });
dotenvFlow.load(['/path/to/project/.env'], { silent: true });
dotenvFlow.load(['/path/to/project/.env'], {
  encoding: 'utf8',
  debug: true,
  silent: false
});

const defaultLoadResult = dotenvFlow.load('/path/to/project/.env');
const value1: string | undefined = defaultLoadResult.parsed?.['VARNAME'];
const error1: Error | undefined = defaultLoadResult.error;

const typedLoadResult = dotenvFlow.load<{ VARNAME: string }>('/path/to/project/.env');
const value2: string | undefined = typedLoadResult.parsed?.VARNAME;
const error2: Error | undefined = typedLoadResult.error;

// --

dotenvFlow.unload('/path/to/project/.env');
dotenvFlow.unload('/path/to/project/.env', {});
dotenvFlow.unload('/path/to/project/.env', { encoding: 'utf8' });

dotenvFlow.unload(['/path/to/project/.env']);
dotenvFlow.unload(['/path/to/project/.env'], {});
dotenvFlow.unload(['/path/to/project/.env'], { encoding: 'utf8' });

// --

dotenvFlow.config();
dotenvFlow.config({});
dotenvFlow.config({ node_env: 'production' });
dotenvFlow.config({ default_node_env: 'development' });
dotenvFlow.config({ path: '/path/to/project' });
dotenvFlow.config({ pattern: '.env[.node_env][.local]' });
dotenvFlow.config({ encoding: 'utf8' });
dotenvFlow.config({ purge_dotenv: true });
dotenvFlow.config({ debug: true });
dotenvFlow.config({ silent: true });
dotenvFlow.config({
  node_env: 'production',
  default_node_env: 'development',
  path: '/path/to/project',
  pattern: '.env[.node_env][.local]',
  encoding: 'utf8',
  purge_dotenv: true,
  debug: true,
  silent: false
});

const defaultConfigResult = dotenvFlow.config();
const value3: string | undefined = defaultConfigResult.parsed?.['VARNAME'];
const error3: Error | undefined = defaultConfigResult.error;

const typedConfigResult = dotenvFlow.config<{ VARNAME: string }>();
const value4: string | undefined = typedConfigResult.parsed?.VARNAME;
const error4: Error | undefined = typedConfigResult.error;
