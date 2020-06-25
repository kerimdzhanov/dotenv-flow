const os = require('os');

const isWindows = () => os.type().startsWith('Windows');

const itSkipOnWindows = isWindows() ? it.skip : it;

// convert win to posix path
// example: 'C:\path\to\project\.env' -> '/path/to/project/.env'
const normalizePosixPath = (path) => {
  return path.replace(/^[a-z]\:/i, '').replace(/\\/g, '/')
};

module.exports = {
  isWindows,
  itSkipOnWindows,
  normalizePosixPath
};
