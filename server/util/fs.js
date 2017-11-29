const fs = require("fs");
const { promisify } = require("util");

exports.renameFile = promisify(fs.rename);
exports.writeFile = promisify(fs.writeFile);
exports.existFile = promisify(fs.exists);
exports.deleteFile = promisify(fs.unlink);
