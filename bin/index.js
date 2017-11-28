#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const path = require("path");
const { fork } = require("child_process");

const chalk = require("chalk");
const program = require("commander");

const {
  createConfig,
  checkHomeFolder,
  hasFile,
  checkConfigFile
} = require("./util");

const pkg = require("../package.json");

const CWD = process.cwd();
const USER_HOME = process.env.HOME;
const HOMIE_HOME = path.join(USER_HOME, ".homie");
const CONFIG_FILE = path.join(HOMIE_HOME, "config.json");

const SENTINEL_SERVER = path.join(__dirname, "..", "server", "index.js");
const SENTINEL = path.join(__dirname, "..", "sentinel", "index.js");
const HOSTNAME = os.hostname();

program.version(pkg.version).description(pkg.description);

// Configuration files
program
  .command("config <action>")
  .option("--reset", "Erase the existing configuration file")
  .description("Manage your Homie configuration")
  .action((command, options) => {
    switch (command) {
      case "create":
        if (hasFile(CONFIG_FILE) && !options.reset) {
          console.error(chalk.red("Configuration already exist"));
          console.error(`
To overwrite it, you can use this command
> ${chalk.cyan("homie config create --reset")}
          `);
          process.exit(1);
        }

        createConfig();
        break;

      default:
        console.error(chalk.red("Error:"), `Unknown command '${command}'`);
        break;
    }
  });

// Server CLI
program
  .command("server <command>")
  .description("Start Homie Server")
  .action(command => {
    checkHomeFolder();
    checkConfigFile(CONFIG_FILE);

    switch (command) {
      case "start":
        const server = fork(SENTINEL_SERVER, { stdio: "inherit" });
        break;

      default:
        console.error(chalk.red("Error:"), `Unknown command '${command}'`);
        break;
    }
  });

// Sentinel CLI
program
  .command("sentinel <command>")
  .option("--host [s]", "Host address to bind to (default: 127.0.0.1)")
  .option("--port [n]", "Port to listen to (default: 5000)")
  .option("--name [name]", "Name of the sentinel", HOSTNAME)
  .description("Start an Homie Sentinel")
  .action((command, options) => {
    const LOCAL_CONFIG = path.join(CWD, "config.json");
    const hostname = os.hostname();
    const config = Object.assign(
      {
        host: "127.0.0.1",
        port: 5000,
        name: hostname
      },
      hasFile(LOCAL_CONFIG) ? require(LOCAL_CONFIG) : {}
    );

    if (options.host) {
      config.host = options.host;
    }

    if (options.port) {
      config.port = options.port;
    }

    if (options.name !== HOSTNAME) {
      config.name = options.name;
    }

    switch (command) {
      case "start":
        const sentinel = fork(SENTINEL, ["--config", JSON.stringify(config)], {
          stdio: "inherit"
        });
        break;

      default:
        console.error(chalk.red("Error:"), `Unknown command '${command}'`);
        break;
    }
  });

program.parse(process.argv);
