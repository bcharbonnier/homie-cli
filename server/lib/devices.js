const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { EventEmitter } = require("events");

const chalk = require("chalk");

const writeFile = promisify(fs.writeFile);

const USER_HOME = process.env.HOME;
const HOMIE_HOME = path.join(USER_HOME, ".homie");
const DEVICES_DB = path.join(HOMIE_HOME, "devices.json");

function log(...parts) {
  console.log(chalk.cyan("[devices]"), ...parts);
}

function error(...parts) {
  console.error(chalk.red("[devices]"), ...parts);
}

class DeviceStore extends EventEmitter {
  constructor(app, mqttClient) {
    super();
    log(`Loading devices database from`, chalk.dim(DEVICES_DB));
    this.devices = require(DEVICES_DB);

    app.get("/api/devices", (req, res) => {
      res.json({
        ok: true,
        devices: this.devices
      });
    });

    app.get("/api/devices/:deviceName", (req, res) => {
      const deviceName = req.params["deviceName"];
      const device = this.devices[deviceName];
      if (device) {
        res.json({
          ok: true,
          device
        });
      } else {
        const errorMessage = `device with <id:${deviceName}> does not exist`;
        error(errorMessage);
        res.status(404).json({
          ok: false,
          error: errorMessage
        });
      }
    });

    app.delete("/api/devices/:deviceName", async (req, res) => {
      const deviceName = req.params["deviceName"];
      const device = this.devices[deviceName];
      if (!device) {
        const errorMessage = `device with <id:${deviceName}> does not exist`;
        error(errorMessage);
        res.status(404).json({
          ok: false,
          error: errorMessage
        });
        return;
      }
      this.deleteDevice(device);
      await this.save();
      log(`device with <id:${deviceName}> has been deleted`);
      res.json({
        ok: true,
        devices: this.devices,
        device
      });
      this.emit("device-deleted", device);
    });

    mqttClient.on("device-attribute", async (deviceId, attribute, value) => {
      const device = this.getDevice(deviceId);
      device[attribute] = value;
      await this.save();
      this.emit("update", device);
    });

    mqttClient.on(
      "device-node-attribute",
      async (deviceId, nodeId, attribute, value) => {
        const device = this.getDevice(deviceId);
        const node = this.getNode(device, nodeId);
        node[attribute] = value;
        await this.save();
        this.emit("update", device);
      }
    );

    mqttClient.on(
      "device-node-property",
      async (deviceId, nodeId, propertyId, value) => {
        const device = this.getDevice(deviceId);
        const node = this.getNode(device, nodeId);
        node[propertyId] = value;
        await this.save();
        this.emit("update", device);
      }
    );
  }

  deleteDevice(deviceName) {
    // TODO remove all reference from mqtt
    delete this.devices[deviceName];
  }

  async save() {
    await writeFile(DEVICES_DB, JSON.stringify(this.devices, null, 2));
  }

  getDevice(deviceId) {
    return this.devices[deviceId] || (this.devices[deviceId] = {});
  }

  getNode(device, nodeId) {
    if (!device.nodes) {
      device.nodes = {};
    }
    return device.nodes[nodeId] || (device.nodes[nodeId] = {});
  }
}

exports.createDeviceStore = function(app, mqttClient) {
  return new DeviceStore(app, mqttClient);
};
