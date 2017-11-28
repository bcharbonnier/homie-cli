const fs = require("fs");
const path = require("path");
const { EOL } = require("os");

const chalk = require("chalk");
const prompt = require("prompt");

const CWD = process.cwd();
const USER_HOME = process.env.HOME;
const HOMIE_HOME = path.join(USER_HOME, ".homie");
const CONFIG_FILE = path.join(HOMIE_HOME, "config.json");
const FIRMWARES = path.join(HOMIE_HOME, "firmwares");
const DEVICE_DB = path.join(HOMIE_HOME, "devices.json");
const FIRMWARE_DB = path.join(HOMIE_HOME, "firmwares.json");

function hasFile(name) {
  return fs.existsSync(name);
}
exports.hasFile = hasFile;

function checkConfigFile(name, command) {
  if (!hasFile(name)) {
    console.error(`
${chalk.red("Missing configuration file.")}
Please create a config.json in '${path.dirname(name)}'

Or simply run this command to create it
> ${chalk.cyan("homie config create")}
    `);
    process.exit(1);
  }
}

exports.checkConfigFile = checkConfigFile;

function checkHomeFolder() {
  if (!hasFile(HOMIE_HOME)) {
    fs.mkdirSync(HOMIE_HOME);
    fs.mkdirSync(FIRMWARES);
    fs.writeFileSync(DEVICE_DB, JSON.stringify({}, null, 2));
    fs.writeFileSync(FIRMWARE_DB, JSON.stringify({}, null, 2));
  }
}

exports.checkHomeFolder = checkHomeFolder;

function createConfig() {
  console.log(`${EOL}Let's configure your Homie server installation`);
  const SCHEMA = {
    properties: {
      host: {
        description: "IP address to bind the server to",
        type: "string",
        default: "127.0.0.1"
      },
      port: {
        description: "Port to listen to",
        type: "integer",
        default: 5000
      },
      mqtt: {
        properties: {
          host: {
            description: "IP or hostname of your MQTT broker",
            type: "string",
            default: "127.0.0.1"
          },
          port: {
            description: "Port of the MQTT broker",
            type: "integer",
            default: 1883
          },
          auth: {
            description: "Activate MQTT user authentication",
            pattern: /y[es]*|n[o]?/,
            message: "Must answer yes or no",
            type: "string",
            default: "no",
            before(value) {
              return value === "yes";
            }
          },
          username: {
            description: "MQTT username",
            type: "string",
            ask() {
              return prompt.history("mqtt:auth").value === true;
            }
          },
          password: {
            description: "MQTT password",
            hidden: true,
            type: "string",
            ask() {
              return prompt.history("mqtt:auth").value === true;
            }
          }
        }
      },
      homie: {
        properties: {
          base_topic: {
            description: "Base MQTT topic",
            type: "string",
            default: "homie/"
          }
        }
      }
    }
  };
  prompt.message = "";
  prompt.delimiter = ":";
  prompt.start({ noHandleSIGINT: true });
  prompt.get(SCHEMA, (error, config) => {
    if (error) {
      console.log(EOL);
      process.exit();
    }
    if (!config.mqtt.auth) {
      delete config.mqtt.username;
      delete config.mqtt.password;
    }
    console.log(`${EOL}Writing configuration file to disk`);
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + EOL);
    console.log(`${chalk.yellow(`'${CONFIG_FILE}'`)} successfully written`);
  });
}

exports.createConfig = createConfig;
