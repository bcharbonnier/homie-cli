const { EventEmitter } = require("events");

module.exports = class Client extends EventEmitter {
  constructor(config, socket, deviceStore) {
    super();
    this.config = config;
    this.socket = socket;
    this.deviceStore = deviceStore;

    this.socket.on("close", () => {
      this.emit("close");
    });

    this.deviceStore.on("update", device => {
      this.socket.send({
        type: "device.update",
        device
      });
    });
  }

  onMessage(message) {}
};
