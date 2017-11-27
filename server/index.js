const chalk = require("chalk");

const { createWebSocketServer, setup } = require("./server");
const { createWebSocketClient } = require("../sentinel");

async function bootstrap() {
  const config = require("../config.json");

  let wss;
  let wsc;
  try {
    wss = await createWebSocketServer(config);
    console.log(
      chalk.bold.yellow(`Homie Server started with pid ${process.pid}`),
      "(hit CTRL-C to quit)"
    );

    if (process.argv.includes("--with-sentinel")) {
      wsc = createWebSocketClient(config);
    }
  } catch (error) {
    console.error(chalk.red("Cannot start Homie Sentinel Server"));
    console.error(error);
    process.exit(1);
  }

  setup(config, wss);
}

bootstrap();
