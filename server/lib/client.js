const { EventEmitter } = require("events");

const { log } = require("../util/log")("client");

module.exports = class Client extends EventEmitter {
  constructor(config, socket, deviceStore) {
    super();
    this.config = config;
    this.socket = socket;
    this.deviceStore = deviceStore;

    this.socket.on("close", () => {
      this.emit("close");
    });

    log(deviceStore.devices);
    this.socket.send(JSON.stringify(["devices.update", deviceStore.devices]));

    this.deviceStore
      .on("update", (device) => {
        // this.socket.send({
        //   type: "device.update",
        //   device,
        // });
      })
      .on("devices", (devices) => {
        // this.socket.send({
        //   type: "devices.update",
        //   devices,
        // });
      });
  }

  onMessage(message) {}
};
