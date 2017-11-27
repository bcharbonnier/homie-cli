#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const path = require("path");
const { fork } = require("child_process");

const chalk = require("chalk");
const program = require("commander");

const { hasConfigFile, checkConfigFile } = require("./util");

const pkg = require("../package.json");

const CWD = process.cwd();
const CONFIG_FILE = path.join(CWD, "config.json");
const SENTINEL_SERVER = path.join(CWD, "server", "index.js");
const SENTINEL = path.join(CWD, "sentinel", "index.js");
const HOSTNAME = os.hostname();

program.version(pkg.version).description(pkg.description);

program
  .command("server <command>")
  .description("Start a Homie Server")
  .action(command => {
    checkConfigFile(CONFIG_FILE);

    switch (command) {
      case "start":
        const server = fork(SENTINEL_SERVER, { stdio: "inherit" });
        break;

      default:
        break;
    }
    // let server;
    // let sentinel;
    // if (env.sentinelOnly) {
    //   sentinel = fork(SENTINEL, process.argv, { stdio: "inherit" });
    // } else {
    //   server = fork(SENTINEL_SERVER, { stdio: "inherit" });
    // }
  });

program
  .command("sentinel <command>")
  .option("--host [s]", "Host address to bind to (default: 0.0.0.0)")
  .option("--port [n]", "Port to listen to (default: 5000)")
  .option("--name [name]", "Name of the sentinel", HOSTNAME)
  .description("Start a Homie Sentinel")
  .action((command, options) => {
    const hostname = os.hostname();
    const config = Object.assign(
      {
        host: "0.0.0.0",
        port: 5000,
        name: hostname
      },
      hasConfigFile(CONFIG_FILE) ? require(CONFIG_FILE) : {}
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
        break;
    }
  });

program.parse(process.argv);
