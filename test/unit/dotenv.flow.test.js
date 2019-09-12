const dotenvFlow = require("../../lib/dotenv-flow");

test("getting dotenvFlow list in .env subfolder", () => {
  const list = dotenvFlow.listDotenvFiles("/path/to/project", {
    node_env: "test"
  });
  expect(list).toEqual([
    "D:\\path\\to\\project\\.env\\.env",
    "D:\\path\\to\\project\\.env\\.env.local",
    "D:\\path\\to\\project\\.env\\test\\.env.test",
    "D:\\path\\to\\project\\.env\\test\\.env.test.local"
  ]);
});


test("parsing file", () => {
  const parsed = dotenvFlow.parse([
    "D:\\path\\to\\project\\.env\\.env",
    "D:\\path\\to\\project\\.env\\.env.local",
    "D:\\path\\to\\project\\.env\\test\\.env.test",
    "D:\\path\\to\\project\\.env\\test\\.env.test.local"
  ]);
  expect(parsed).toEqual({
    ENV: 'ok',
    ENV_LOCAL: 'ok',
    ENV_TEST: 'ok',
    ENV_TEST_LOCAL: 'ok'
  });
})

test("loading parsed variables in process.env", () => {
  const loaded = dotenvFlow.load([
    "D:\\path\\to\\project\\.env\\.env",
    "D:\\path\\to\\project\\.env\\.env.local",
    "D:\\path\\to\\project\\.env\\test\\.env.test",
    "D:\\path\\to\\project\\.env\\test\\.env.test.local"
  ]);
  expect(process.env).toMatchObject(loaded.parsed)
})