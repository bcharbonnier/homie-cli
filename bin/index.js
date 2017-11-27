#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { fork } = require("child_process");

const chalk = require("chalk");
const program = require("commander");

const { checkConfigFile } = require("./util");

const pkg = require("../package.json");

const CWD = process.cwd();
const CONFIG_FILE = path.join(CWD, "config.json");
const SENTINEL_SERVER = path.join(CWD, "server", "index.js");
const SENTINEL = path.join(CWD, "sentinel", "index.js");

program.version(pkg.version).description(pkg.description);

program
  .command("start")
  .description("Start a Homie server")
  .option("--sentinel-only", "Only start a local sentinel", false)
  .action(env => {
    checkConfigFile(CONFIG_FILE);

    let server;
    let sentinel;
    if (env.sentinelOnly) {
      sentinel = fork(SENTINEL, process.argv, { stdio: "inherit" });
    } else {
      server = fork(SENTINEL_SERVER, { stdio: "inherit" });
    }
  });

program.parse(process.argv);
