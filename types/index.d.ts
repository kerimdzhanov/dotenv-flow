/// <reference types="node" />
// Minimum TypeScript Version: 3.1

import { readFileSync } from 'fs';

export type ReadFileSyncOptions = Parameters<typeof readFileSync>[1];

export type DotenvFlowFilenames = string | Buffer | Array<string | Buffer>;

export interface DotenvFlowParseOutput {
  [name: string]: string;
}

/**
 * Parse a given file(s) to use the result programmatically.
 *
 * When several filenames are given, the parsed environment variables are merged using the "overwrite" strategy.
 */
export function parse(
  filenames: DotenvFlowFilenames,
  options?: ReadFileSyncOptions
): DotenvFlowParseOutput;

export interface DotenvFlowConfigOptions {
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

export interface DotenvFlowConfigOutput {
  error?: Error;
  parsed?: DotenvFlowParseOutput;
}

/**
 * Loads and parses the contents of your .env* files, merges the results and appends to process.env.*.
 */
export function config(
  options?: DotenvFlowConfigOptions
): DotenvFlowConfigOutput;

export interface DotenvFlowListDotenvFilesOptions {
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
  options?: DotenvFlowListDotenvFilesOptions
): string[];

export interface DotenvFlowLoadOptions {
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

export type DotenvFlowLoadOutput = DotenvFlowConfigOutput;

/**
 * Load variables defined in a given file(s) into `process.env`.
 *
 * When several filenames are given, parsed environment variables are merged using the "overwrite" strategy since it utilizes `.parse()` for doing this.
 * But eventually, assigning the resulting environment variables to `process.env` is done using the "append" strategy,
 * thus giving a higher priority to the environment variables predefined by the shell.
 */
export function load(
  filenames: DotenvFlowFilenames,
  options?: DotenvFlowLoadOptions
): DotenvFlowLoadOutput;

export function unload(
  filenames: DotenvFlowFilenames,
  options?: ReadFileSyncOptions
): void;
