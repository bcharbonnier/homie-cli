const { createServer } = require("http");

const chalk = require("chalk");
const { Server: WebSocketServer } = require("ws");

const { createWebSocketServer } = require("./server");

const config = require("./config.json");

createWebSocketServer(config)
  .then(wss => {
    console.log(
      chalk.bold.yellow(
        `Homie Sentinel Server started with pid ${process.pid}`
      ),
      "(hit CTRL-C to quit)"
    );
  })
  .catch(error => {
    console.error(chalk.red("Cannot start Homie Sentinel Server"));
    console.error(error);
    process.exit(1);
  });
