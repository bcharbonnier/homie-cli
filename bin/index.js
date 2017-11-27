#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { fork } = require("child_process");

const chalk = require("chalk");
const program = require("commander");

const pkg = require("../package.json");

const CWD = process.cwd();
const CONFIG_FILE = path.join(CWD, "config.json");
const SENTINEL = path.join(CWD, "index.js");

function hasConfigFile() {
  return fs.existsSync(CONFIG_FILE);
}

function checkConfigFile() {
  if (!hasConfigFile()) {
    console.error(chalk.red("Missing configuration file for your sentinel."));
    console.error(`Please create a config.json in '${CWD}'`);
    process.exit(1);
  }
}

program.version(pkg.version).description(pkg.description);

program
  .command("server")
  .description("Start a local sentinel server")
  .option("--start", "Start the server")
  .option("--install", "Install a script to startup the server at boot time")
  .action(env => {
    checkConfigFile();
    if (env.install) {
    } else if (env.start) {
      const sentinel = fork(SENTINEL, { stdio: "inherit" });
    }
  });

program
  .command("package")
  .description("Manage packages installed in this sentinel")
  .option("-l, --list", "List installed packages")
  .option("-a, --add", "Deploy a new package")
  .option("-r, --remove", "Remove an installed package")
  .action(() => {
    checkConfigFile();
  });

program.parse(process.argv);
