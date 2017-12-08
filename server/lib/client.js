const { EventEmitter } = require("events");

module.exports = class Client extends EventEmitter {
  constructor(config, socket, mqttClient, deviceClient) {
    super();
    this.config = config;
    this.socket = socket;
    this.mqttClient = mqttClient;
    this.deviceClient = deviceClient;

    this.onMqttConnected = this.onMqttConnected.bind(this);
    this.onMqttDisconnected = this.onMqttDisconnected.bind(this);
    this.onMqttMessage = this.onMqttMessage.bind(this);

    this.onDeviceUpdate = this.onDeviceUpdate.bind(this);
    this.onDevicesUpdate = this.onDevicesUpdate.bind(this);

    this.socket.on("disconnect", () => {
      this.emit("disconnect");
    });

    this.mqttClient
      .on("message", this.onMqttMessage)
      .on("connected", this.onMqttConnected)
      .on("disconnected", this.onMqttDisconnected);

    this.deviceClient.on("update", this.onDeviceUpdate).on("devices", this.onDevicesUpdate);

    this.onDevicesUpdate(this.deviceClient.devices);
  }

  onMqttMessage(topic, message) {
    this.socket.emit("mqtt.message", topic, message);
  }

  onMqttConnected() {
    this.socket.emit("mqtt", { connected: true });
  }

  onMqttDisconnected() {
    this.socket.emit("mqtt", { connected: false });
  }

  onDeviceUpdate(deviceId, attribute, value) {
    this.socket.emit("device.update", deviceId, attribute, value);
  }

  onDevicesUpdate(devices) {
    this.socket.emit("devices.update", devices);
  }

  destroy() {
    this.mqttClient.removeListener("message", this.onMqttMessage);
    this.mqttClient.removeListener("connected", this.onMqttConnected);
    this.mqttClient.removeListener("disconnected", this.onMqttDisconnected);

    this.deviceClient.removeListener("update", this.onDeviceUpdate);
    this.deviceClient.removeListener("devices", this.onDevicesUpdate);
  }
};
