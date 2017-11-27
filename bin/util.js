const fs = require("fs");
const chalk = require("chalk");

const CWD = process.cwd();

function hasConfigFile(name) {
  return fs.existsSync(name);
}
exports.hasConfigFile = hasConfigFile;

function checkConfigFile(name) {
  if (!hasConfigFile(name)) {
    console.error(chalk.red("Missing configuration file for your sentinel."));
    console.error(`Please create a config.json in '${CWD}'`);
    process.exit(1);
  }
}

exports.checkConfigFile = checkConfigFile;
