const dotenvFlow = require('../../lib/dotenv-flow');


test('getting dotenvFlow list in .env subfolder', async () => {
    const list = dotenvFlow.listDotenvFiles('/path/to/project', { node_env: "test" });
    expect(list).toEqual(["D:\\path\\to\\project\\.env\\.env",
        "D:\\path\\to\\project\\.env\\.env.test",
        "D:\\path\\to\\project\\.env\\.env.test.local"])
});