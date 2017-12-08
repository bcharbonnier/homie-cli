const { EventEmitter } = require("events");

module.exports = class Client extends EventEmitter {
  constructor(config, socket, mqttClient, deviceClient) {
    super();
    this.config = config;
    this.socket = socket;
    this.mqttClient = mqttClient;
    this.deviceClient = deviceClient;

    this.socket.on("disconnect", () => this.emit("disconnect"));

    this.sendDevices(this.deviceClient.devices);

    this.mqttClient
      .on("message", (topic, message) => {
        this.socket.emit("mqtt.message", topic, message);
      })
      .on("connected", () => {
        this.socket.emit("mqtt", { connected: true });
      })
      .on("disconnected", () => {
        this.socket.emit("mqtt", { connected: false });
      });

    this.deviceClient
      .on("update", (deviceId, device, attribute, value) =>
        this.sendDeviceUpdate(deviceId, attribute, value))
      .on("devices", devices => this.sendDevices(devices));
  }

  sendDeviceUpdate(deviceId, attribute, value) {
    this.socket.emit("device.update", deviceId, attribute, value);
  }

  sendDevices(devices) {
    this.socket.emit("devices.update", devices);
  }
};
