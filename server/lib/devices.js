const path = require("path");
const { EventEmitter } = require("events");

const chalk = require("chalk");

const { writeFile } = require("../util/fs");
const { log, error } = require("../util/log")("devices");

const USER_HOME = process.env.HOME;
const HOMIE_HOME = path.join(USER_HOME, ".homie");
const DEVICES_DB = path.join(HOMIE_HOME, "devices.json");

class DeviceStore extends EventEmitter {
  constructor(app, mqttClient) {
    super();
    log("Loading devices database from", chalk.dim(DEVICES_DB));
    this.devices = require(DEVICES_DB);

    app.get("/api/devices", (req, res) => {
      res.json({
        ok: true,
        devices: this.devices,
      });
    });

    app.get("/api/devices/:deviceName", (req, res) => {
      const { deviceName } = req.params;
      const device = this.devices[deviceName];
      if (device) {
        res.json({
          ok: true,
          device,
        });
      } else {
        const errorMessage = `device with <id:${deviceName}> does not exist`;
        error(errorMessage);
        res.status(404).json({
          ok: false,
          error: errorMessage,
        });
      }
    });

    app.delete("/api/devices/:deviceName", async (req, res) => {
      const { deviceName } = req.params;
      const device = this.devices[deviceName];
      if (!device) {
        const errorMessage = `device with <id:${deviceName}> does not exist`;
        error(errorMessage);
        res.status(404).json({
          ok: false,
          error: errorMessage,
        });
        return;
      }
      this.deleteDevice(device);
      await this.save();
      log(`device with <id:${deviceName}> has been deleted`);
      res.json({
        ok: true,
        devices: this.devices,
        device,
      });
      this.emit("device-deleted", device);
    });

    mqttClient.on("device", async (message) => {
      const { deviceId, attribute, value } = message;
      const device = this.getDevice(deviceId);
      switch (attribute) {
        case "stats/interval":
        case "stats/uptime":
        case "stats/memory":
          device[attribute] = +value;
          break;

        case "online":
          device[attribute] = value === "true";
          break;

        default:
          device[attribute] = value;
          break;
      }

      this.emit("update", deviceId, device, attribute, device[attribute]);
      await this.save(false);
    });

    mqttClient.on("node", async (message) => {
      const {
        deviceId, nodeId, attribute, value,
      } = message;
      const device = this.getDevice(deviceId);
      const node = this.getNode(device, nodeId);

      node[attribute] = value;

      this.emit("update", device);
      await this.save(false);
    });

    // mqttClient.on("property", async (message) => {
    //   const {
    //     deviceId, nodeId, propertyId, value,
    //   } = message;
    //   const device = this.getDevice(deviceId);
    //   const node = this.getNode(device, nodeId);
    //   node[propertyId] = value;
    //   await this.save();
    //   this.emit("update", device);
    // });
  }

  deleteDevice(deviceName) {
    // TODO remove all reference from mqtt
    delete this.devices[deviceName];
  }

  async save(notify = true) {
    await writeFile(DEVICES_DB, JSON.stringify(this.devices, null, 2));
    if (notify) {
      this.emit("devices", this.devices);
    }
  }

  getDevice(deviceId) {
    const device = this.devices[deviceId] || (this.devices[deviceId] = {});
    return device;
  }

  getNode(deviceId, nodeId) {
    const device = typeof deviceId === "string" ? this.getDevice(deviceId) : deviceId;
    if (!device.nodes) {
      device.nodes = {};
    }
    const node = device.nodes[nodeId] || (device.nodes[nodeId] = {});
    return node;
  }
}

exports.createDeviceClient = function (app, mqttClient) {
  return new DeviceStore(app, mqttClient);
};
