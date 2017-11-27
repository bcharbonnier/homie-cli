const { EventEmitter } = require("events");

module.exports = class Client extends EventEmitter {
  constructor(config, socket, mqttClient) {
    super();
    this.config = config;
    this.socket = socket;
    this.mqttClient = mqttClient;

    this.socket.on("message", () => {
      this.onMessage(message);
    });

    this.socket.on("close", () => {
      this.emit("close");
    });
  }

  onMessage(message) {}
};
