const { EventEmitter } = require("events");

module.exports = class Client extends EventEmitter {
  constructor(config, socket, mqttClient, deviceClient) {
    super();
    this.config = config;
    this.socket = socket;
    this.mqttClient = mqttClient;
    this.deviceClient = deviceClient;

    this.socket.on("close", () => this.emit("close"));

    this.sendDevices(this.deviceClient.devices);

    this.mqttClient.on("message", (topic, message) => {
      this.socket.send(JSON.stringify(["mqtt.message", topic, message]));
    });

    this.deviceClient
      .on("update", (deviceId, device, attribute, value) =>
        this.sendDeviceUpdate(deviceId, attribute, value))
      .on("devices", devices => this.sendDevices(devices));
  }

  sendDeviceUpdate(deviceId, attribute, value) {
    this.socket.send(JSON.stringify(["device.update", deviceId, attribute, value]));
  }

  sendDevices(devices) {
    this.socket.send(JSON.stringify(["devices.update", devices]));
  }
};
