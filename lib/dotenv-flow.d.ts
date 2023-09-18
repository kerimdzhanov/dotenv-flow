import { ObjectEncodingOptions } from 'node:fs';

export type DotenvFlowListFilesOptions = {
    node_env?: string;
    path?: string;
    pattern?: string;
    debug?: boolean;
};

/**
 * Returns a list of existing `.env*` filenames depending on the given `options`.
 *
 * The resulting list is ordered by the env files'
 * variables overwriting priority from lowest to highest.
 *
 * This can also be referenced as "env files' environment cascade"
 * or "order of ascending priority."
 *
 * ⚠️ Note that the `.env.local` file is not listed for "test" environment,
 * since normally you expect tests to produce the same results for everyone.
 *
 * @param options - `.env*` files listing options
 * @param options.node_env - node environment (development/test/production/etc.)
 * @param options.path - path to the working directory (default: `process.cwd()`)
 * @param options.pattern - `.env*` files' naming convention pattern
 *                          (default: ".env[.node_env][.local]")
 * @param options.debug - turn on debug messages
 */
export function listFiles(options?: DotenvFlowListFilesOptions): string[];

// --

export type DotenvFlowParseOptions = ObjectEncodingOptions & {
  debug?: boolean;
};

export type DotenvFlowParseResult = {
  [name: string]: string;
};

/**
 * Parses a given file and returns an object (map) of `varname => value` entries.
 *
 * @param filename - the name of the file to parse
 * @param options - parse options
 */
export function parse<T extends DotenvFlowParseResult = DotenvFlowParseResult>(
  filename: string,
  options?: DotenvFlowParseOptions
): T;

/**
 * Parses a list of given files and returns a merged object (map) of `varname => value` entries.
 *
 * Note that files are parsed and merged in the same order as given. For example,
 * if `['.env', '.env.local']` is given, variables defined in `.env.local` (the second one)
 * will overwrite those are defined in `.env` (the first one) while merging.
 *
 * @param filenames - a list of filenames to parse and merge
 * @param options - parse options
 */
export function parse<T extends DotenvFlowParseResult = DotenvFlowParseResult>(
  filenames: string[],
  options?: DotenvFlowParseOptions
): T;

// --

export type DotenvFlowLoadOptions = DotenvFlowParseOptions & {
  silent?: boolean;
};

export type DotenvFlowLoadResult<T extends DotenvFlowParseResult = DotenvFlowParseResult> = {
  parsed?: T,
  error?: Error
};

/**
 * Parses and assigns variables defined in a given file to `process.env`.
 *
 * @param filename - the name of the file to load from
 * @param options - parse/load options
 */
export function load<T extends DotenvFlowParseResult = DotenvFlowParseResult>(
  filename: string,
  options?: DotenvFlowLoadOptions
): DotenvFlowLoadResult<T>;

/**
 * Parses, merges, and assigns variables from the given files to `process.env`.
 *
 * @param filenames - a list of filenames to load from
 * @param options - parse/load options
 */
export function load<T extends DotenvFlowParseResult = DotenvFlowParseResult>(
    filenames: string[],
    options?: DotenvFlowLoadOptions
): DotenvFlowLoadResult<T>;

// --

/**
 * Unload variables defined in a given file from `process.env`.
 *
 * @param filename - the name of the file to unload
 * @param options - parse/unload options
 */
export function unload(filename: string, options?: DotenvFlowParseOptions): void;

/**
 * Unload variables defined in given files from `process.env`.
 *
 * @param filenames - a list of filenames to unload
 * @param options - parse/unload options
 */
export function unload(filenames: string[], options?: DotenvFlowParseOptions): void;

// --

export type DotenvFlowConfigOptions = DotenvFlowListFilesOptions & DotenvFlowLoadOptions & {
  default_node_env?: string;
  purge_dotenv?: boolean;
}

export type DotenvFlowConfigResult<T extends DotenvFlowParseResult = DotenvFlowParseResult> = DotenvFlowLoadResult<T>;

/**
 * "dotenv-flow" initialization function (API entry point). Allows configuring dotenv-flow programmatically.
 *
 * @param options - configuration options
 */
export function config<T extends DotenvFlowParseResult = DotenvFlowParseResult>(
  options?: DotenvFlowConfigOptions
): DotenvFlowConfigResult<T>;

// --

declare const DotenvFlow: {
  listFiles: typeof listFiles;
  parse: typeof parse;
  load: typeof load;
  unload: typeof unload;
  config: typeof config;
};

export default DotenvFlow;
