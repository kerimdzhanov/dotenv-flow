/// <reference types="node" />
// Minimum TypeScript Version: 3.1

import { readFileSync } from 'fs';

export type ReadFileSyncOptions = Parameters<typeof readFileSync>[1];

export type DotenvFilenames = string | Buffer | Array<string | Buffer>;

export interface DotenvParseOutput {
  [name: string]: string;
}

/**
 * Parse a given file(s) to use the result programmatically.
 *
 * When several filenames are given, the parsed environment variables are merged using the "overwrite" strategy.
 */
export function parse(
  filenames: DotenvFilenames,
  options?: ReadFileSyncOptions
): DotenvParseOutput;

export interface DotenvConfigOptions {
  /**
   * Node environment (development/test/production/etc,.)
   *
   * @default process.env.NODE_ENV
   */
  node_env?: string;

  /**
   * The default node environment
   */
  default_node_env?: string;

  /**
   * Path to `.env*` files directory
   *
   * @default process.cwd()
   */
  path?: string;

  /**
   * Encoding of `.env*` files
   *
   * @default 'utf8'
   */
  encoding?: string;

  /**
   * Perform the `.env` file "unload"
   *
   * @default false
   */
  purge_dotenv?: boolean;

  /**
   * Suppress all the console outputs except errors and deprecations
   *
   * @default false
   */
  silent?: boolean;
}

export interface DotenvConfigOutput {
  error?: Error;
  parsed?: DotenvParseOutput;
}

/**
 * Loads and parses the contents of your .env* files, merges the results and appends to process.env.*.
 */
export function config(
  options?: DotenvConfigOptions
): DotenvConfigOutput;

export interface DotenvListDotenvFilesOptions {
  /**
   * Node environment (development/test/production/etc,.)
   */
  node_env?: string;
}

/**
 * Returns a list of `.env*` filenames ordered by the env files priority from lowest to highest.
 *
 * Also, make a note that the `.env.local` file is not included when the value of `node_env` is `"test"`,
 * since normally you expect tests to produce the same results for everyone.
 */
export function listDotenvFiles(
  dirname: string,
  options?: DotenvListDotenvFilesOptions
): string[];

export interface DotenvLoadOptions {
  /**
   * Encoding of `.env*` files
   */
  encoding?: string;

  /**
   * Suppress all the console outputs except errors and deprecations
   *
   * @default false
   */
  silent?: boolean;
}

export type DotenvLoadOutput = DotenvConfigOutput;

/**
 * Load variables defined in a given file(s) into `process.env`.
 *
 * When several filenames are given, parsed environment variables are merged using the "overwrite" strategy since it utilizes `.parse()` for doing this.
 * But eventually, assigning the resulting environment variables to `process.env` is done using the "append" strategy,
 * thus giving a higher priority to the environment variables predefined by the shell.
 */
export function load(
  filenames: DotenvFilenames,
  options?: DotenvLoadOptions
): DotenvLoadOutput;

/**
 * Unload variables defined in a given file(s) from `process.env`.
 *
 * This function can gracefully resolve the following issue:
 *
 * In some cases the original "dotenv" library can be used by one of the dependent npm modules.
 * It causes calling the original `dotenv.config()` that loads the `.env` file from your project before you can call `dotenv-flow.config()`.
 * Such cases breaks `.env*` files priority because the previously loaded environment variables are treated as shell-defined thus having a higher priority.
 *
 * Unloading the previously loaded `.env` file can be activated when using the `dotenv-flow.config()` with the `purge_dotenv` option set to `true`.
 */
export function unload(
  filenames: DotenvFilenames,
  options?: ReadFileSyncOptions
): void;
