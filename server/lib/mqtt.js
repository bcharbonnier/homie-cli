const { EventEmitter } = require("events");

const chalk = require("chalk");
const mqtt = require("mqtt");

const { log } = require("../util/log")("mqtt");
const { TOPIC_TYPES } = require("./parser");

class MqttClient extends EventEmitter {
  constructor(config, parser) {
    super();
    this.parser = parser;

    this.onConnect = this.onConnect.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);

    this.config = config;
    this.clientId = "homie-server";

    const { host, port } = this.config.mqtt;
    const uri = `mqtt://${host}:${port}`;
    log(`Connecting to broker on ${uri}`);

    this.mqtt = mqtt.connect(uri, {
      clientId: this.clientId,
    });

    this.mqtt.on("connect", this.onConnect);
    this.mqtt.on("disconnect", this.onDisconnect);
    this.mqtt.on("message", (topic, payload) => this.onMessage(topic, payload.toString()));
  }

  onConnect() {
    log(`Connection established as client: ${this.clientId}`);
    this.emit("connected");

    let { base_topic: baseTopic } = this.config.homie;
    if (baseTopic.endsWith("/")) {
      baseTopic = baseTopic.replace(/\/$/, "");
    }

    this.mqtt.subscribe(`${baseTopic}/#`);
  }

  onDisconnect() {
    log("Disconnected from broker");
    this.emit("Disconnected");
  }

  onMessage(topic, payload) {
    log("message:", topic, payload);
    this.emit("message", topic, payload);

    const message = this.parser.parse(topic, payload);

    switch (message.type) {
      case TOPIC_TYPES.DEVICE_ATTRIBUTE:
        this.emit("device", message);
        break;

      case TOPIC_TYPES.DEVICE_NODE_ATTRIBUTE:
        this.emit("node", message);
        break;

      case TOPIC_TYPES.DEVICE_NODE_PROPERTY:
      case TOPIC_TYPES.DEVICE_NODE_PROPERTY_ATTRIBUTE:
        this.emit("property", message);
        break;

      default:
        break;
    }
  }
}

exports.createMqttClient = function createMqttClient(config, topicParser) {
  return new MqttClient(config, topicParser);
};
