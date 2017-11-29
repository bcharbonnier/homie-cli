const crypto = require("crypto");

function checksum(str, algorithm, encoding) {
  return crypto
    .createHash(algorithm || "md5")
    .update(str, "utf8")
    .digest(encoding || "hex");
}

exports.md5 = function computeMd5Checksum(str) {
  return checksum(str);
};
