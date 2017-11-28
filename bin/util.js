const fs = require("fs");
const path = require("path");

const chalk = require("chalk");

const CWD = process.cwd();
const USER_HOME = process.env.HOME;
const HOMIE_HOME = path.join(USER_HOME, ".homie");
const FIRMWARES = path.join(HOMIE_HOME, "firmwares");

function hasFile(name) {
  return fs.existsSync(name);
}
exports.hasFile = hasFile;

function checkConfigFile(name) {
  if (!hasFile(name)) {
    console.error(chalk.red("Missing configuration file for your sentinel."));
    console.error(`Please create a config.json in '${path.dirname(name)}'`);
    process.exit(1);
  }
}

exports.checkConfigFile = checkConfigFile;

function checkHomeFolder() {
  if (!hasFile(HOMIE_HOME)) {
    fs.mkdirSync(HOMIE_HOME);
    fs.mkdirSync(FIRMWARES);
  }
}

exports.checkHomeFolder = checkHomeFolder;

function createConfig() {}

exports.createConfig = createConfig;
