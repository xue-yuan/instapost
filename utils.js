const crypto = require("crypto");
const fs = require("fs");

function generateRandomString(length) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

function removeFile(path) {
  fs.access(path, fs.constants.F_OK, (err) => {
    if (!err) {
      fs.unlink(path, (err) => {
        if (err) {
          console.error(`Error deleting file ${path}: ${err}`);
          return;
        }
      });
    }
  });
}

module.exports = {
  generateRandomString,
  removeFile,
};
