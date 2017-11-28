const path = require("path");
const chalk = require("chalk");

const USER_HOME = process.env.HOME;
const HOMIE_HOME = path.join(USER_HOME, ".homie");
const CONFIG_FILE = path.join(HOMIE_HOME, "config.json");

const { createServer, setupServer } = require("./server");

const config = require(CONFIG_FILE);

async function bootstrap() {
  try {
    const { wss: webSocketServer, app: appServer } = await createServer(config);
    console.log(
      chalk.bold.yellow(
        `Homie Server started with pid ${process.pid} listening on ${
          config.host
        }:${config.port}`
      ),
      "(hit CTRL-C to quit)"
    );

    setupServer(config, appServer, webSocketServer);
  } catch (error) {
    console.error(chalk.red("Cannot start Homie Sentinel Server"));
    console.error(error);
    process.exit(1);
  }
}

bootstrap();
