const { EventEmitter } = require("events");

const chalk = require("chalk");
const mqtt = require("mqtt");

function log(...parts) {
  console.log(chalk.dim("[mqtt]"), ...parts);
}

let client;
class MqttClient extends EventEmitter {
  constructor(config) {
    super();

    this.onMessage = this.onMessage.bind(this);
    this.onConnect = this.onConnect.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);

    this.config = config;
    this.clientId = "homie-server";

    const { host, port } = this.config.mqtt;
    const uri = `mqtt://${host}:${port}`;
    log(`Connecting to broker on ${uri}`);

    this.mqtt = mqtt.connect(uri, {
      clientId: this.clientId
    });

    this.mqtt.on("connect", this.onConnect);
    this.mqtt.on("disconnect", this.onDisconnect);
    this.mqtt.on("message", this.onMessage);
  }

  onConnect() {
    log(`Connection established as client: ${this.clientId}`);
    this.emit("connected");

    let { base_topic } = this.config.homie;
    if (base_topic.endsWith("/")) {
      base_topic = base_topic.replace(/\/$/, "");
    }

    const deviceTopic = `${base_topic}/+/+`;
    this.mqtt.subscribe(deviceTopic, error => {
      if (error) {
        log(chalk.red("Error:"), error);
        return;
      }
      log(`Subscribed to topic: ${deviceTopic}`);
    });

    const devicePropertyTopic = `${base_topic}/+/+/+`;
    this.mqtt.subscribe(devicePropertyTopic, error => {
      if (error) {
        log(chalk.red("Error:"), error);
        return;
      }
      log(`Subscribed to topic: ${devicePropertyTopic}`);
    });
  }

  onDisconnect() {
    log("Disconnected from broker");
    this.emit("Disconnected");
  }

  onMessage(topic, message) {
    message = message.toString();
    log("message:", topic, message);
    this.emit("message", topic, message);

    const [prefix, deviceId, ...rest] = topic.split("/");

    this.emit("device", deviceId, rest.join("/"), message);
    if (rest[0].startsWith("$")) {
      this.emit("device-attribute", deviceId, rest.join("/"), message);
    } else {
      if (rest.length == 2 && rest[1].startsWith("$")) {
        const [nodeId, attribute] = rest;
        this.emit(
          "device-node-attribute",
          deviceId,
          nodeId,
          attribute,
          message
        );
      } else {
        const [nodeId, propertyId] = rest;
        this.emit(
          "device-node-property",
          deviceId,
          nodeId,
          propertyId,
          message
        );
      }

      if (rest.length === 3 && rest[rest.length - 1] === "set") {
        // Node property setter here. Nothing to be handled
      }
    }
  }
}

exports.createMqttClient = function createMqttClient(config) {
  return (client = new MqttClient(config));
};
