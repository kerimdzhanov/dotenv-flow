import { ObjectEncodingOptions } from 'node:fs';

export const DEFAULT_PATTERN: string;

// --

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
 * Parses a given file (or a list of files) returning an object (map) of `varname => value` entries.
 *
 * When a list of filenames is given, files are parsed and merged in the same order as given.
 * For example, if `['.env', '.env.local']` is given, variables defined in `.env.local`
 * (the second one) will overwrite those are defined in `.env` (the first one) while merging.
 *
 * @param filenames - the name of the file (or a list of filenames) to parse
 * @param options - parse options
 */
export function parse<T extends DotenvFlowParseResult = DotenvFlowParseResult>(
  filenames: string | string[],
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
 * Parses variables defined in given file(s) and assigns them to `process.env`.
 *
 * Variables that are already defined in `process.env` will not be overwritten,
 * thus giving a higher priority to environment variables predefined by the shell.
 *
 * If the loading is successful, an object with `parsed` property is returned.
 * The `parsed` property contains parsed variables' `key => value` pairs merged in order using
 * the "overwrite merge" strategy.
 *
 * If parsing fails for any of the given files, `process.env` is being left untouched,
 * and an object with `error` property is returned.
 * The `error` property, if present, references to the occurred error.
 *
 * @param filenames - the name of the file (or a list of filenames) to load from
 * @param options - parse/load options
 */
export function load<T extends DotenvFlowParseResult = DotenvFlowParseResult>(
  filenames: string | string[],
  options?: DotenvFlowLoadOptions
): DotenvFlowLoadResult<T>;

// --

/**
 * Unload variables defined in a given file(s) from `process.env`.
 *
 * This function can gracefully resolve the following issue:
 *
 * In some cases, the original "dotenv" library can be used by one of the dependent npm modules.
 * It causes calling the original `dotenv.config()` that loads the `.env` file from your project before you can call `dotenv-flow.config()`.
 * Such cases break `.env*` files priority because the previously loaded environment variables are treated as shell-defined thus having a higher priority.
 *
 * Unloading the previously loaded `.env` file can also be activated when using the `dotenv-flow.config()` with the `purge_dotenv` option set to `true`.
 *
 * @param filenames - the name of the file (or a list of filenames) to unload
 * @param options - parse/unload options
 */
export function unload(filenames: string | string[], options?: DotenvFlowParseOptions): void;

// --

export type DotenvFlowConfigOptions = DotenvFlowListFilesOptions & DotenvFlowLoadOptions & {
  default_node_env?: string;
  purge_dotenv?: boolean;
  files?: string[];
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
  DEFAULT_PATTERN: typeof DEFAULT_PATTERN;
  listFiles: typeof listFiles;
  parse: typeof parse;
  load: typeof load;
  unload: typeof unload;
  config: typeof config;
};

export default DotenvFlow;
