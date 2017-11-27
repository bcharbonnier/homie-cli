const { spawn } = require("child_process");
const { createServer } = require("http");
const path = require("path");
const { EOL } = require("os");

const chalk = require("chalk");
const chokidar = require("chokidar");
const express = require("express");
const WebSocket = require("ws");
const program = require("commander");
const bonjour = require("bonjour")();

const CWD = process.cwd();
const DEVICES = path.join(CWD, "devices");
const DEVICES_WATCH = path.join(DEVICES, "*");

program
  .option("--config <c>", "Serialized configuration", JSON.parse)
  .parse(process.argv);

const { config } = program;
const http = createServer();
const app = express();
const watcher = chokidar.watch(DEVICES_WATCH, { depth: 1 });
const devices = new Set();
const devicesInstances = new Set();

http.on("request", app);

http.listen(config.port, config.host).on("listening", () => {
  console.log(
    chalk.bold.yellow(
      `Homie Sentinel ${chalk.inverse(config.name)} started with pid ${
        process.pid
      } on http://${config.host}:${config.port}`
    )
  );

  bonjour.publish({
    name: config.name,
    port: config.port,
    type: "homie-sentinel"
  });

  watcher.on("addDir", path => {
    if (!devices.has(path)) {
      const instance = spawn("npx", ["homie-device", "start"], {
        stdio: "inherit",
        cwd: path
      });
      devices.add(path);
      devicesInstances.add(instance);
    }
  });
});

if (process.platform === "win32") {
  var rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("SIGINT", function() {
    process.emit("SIGINT");
  });
}

process.on("SIGINT", function() {
  console.log(chalk.bold(`${EOL}Shutting down ${chalk.inverse(config.name)}`));
  watcher.close();
  for (const { pid } of devicesInstances) {
    process.kill(pid);
  }
  bonjour.destroy();
  http.close();
});
