const path = require("path");
const chalk = require("chalk");

const USER_HOME = process.env.HOME;
const HOMIE_HOME = path.join(USER_HOME, ".homie");
const CONFIG_FILE = path.join(HOMIE_HOME, "config.json");

const { createMqttClient } = require("./lib/mqtt");
const Client = require("./lib/client");
const auth = require("./lib/auth");
const { createDeviceClient } = require("./lib/devices");
const firmwares = require("./lib/firmwares");
const parser = require("./lib/parser");

const { createServer } = require("./lib/server");

const config = require(CONFIG_FILE);

async function bootstrap() {
  try {
    const server = await createServer(config);
    console.log(
      chalk.bold.yellow(`Homie Server started with pid ${process.pid} listening on ${config.host}:${config.port}`),
      "(hit CTRL-C to quit)",
      "\n"
    );

    const topicParser = parser.setup(config);
    const mqttClient = createMqttClient(config, topicParser);

    auth.setup(server);
    firmwares.setup(server);
    const deviceClient = createDeviceClient(server, mqttClient);

    const clients = new Set();
    server.get("wss").on("connection", (socket) => {
      const client = new Client(config, socket, mqttClient, deviceClient);
      client.on("disconnect", () => {
        clients.delete(client);
      });
      clients.add(client);
    });
  } catch (error) {
    console.error(chalk.red("Cannot start Homie Sentinel Server"), "\n", error);
    process.exit(1);
  }
}

bootstrap();
