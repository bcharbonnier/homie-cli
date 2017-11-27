const chalk = require("chalk");
const WebSocket = require("ws");

const cfg = require("../config.json");

function createWebSocketClient(config) {
  const webSocketClient = new WebSocket(`ws://${config.host}:${config.port}`);
  webSocketClient.on("open", () => {
    console.log("connected over websocket");
  });

  webSocketClient.on("close", () => {});

  webSocketClient.on("error", error => {
    console.error(error);
  });

  webSocketClient.on("message", event => {
    console.log(`received socket event: ${event}`);
  });
}

exports.createWebSocketClient = createWebSocketClient;

if (process.argv.includes("--sentinel-only")) {
  createWebSocketClient(cfg);
  chalk.bold.yellow(
    `Homie Sentinel started in standalone mode with pid ${process.pid}`
  );
} else {
  chalk.bold.yellow(`Homie Sentinel started associated to an Homie Server`);
}
