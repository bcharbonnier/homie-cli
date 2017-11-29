const { createServer } = require("http");
const path = require("path");

const bodyParser = require("body-parser");
const express = require("express");
const { Server: WebSocketServer } = require("ws");

const { createMqttClient } = require("./lib/mqtt");
const Client = require("./lib/client");
const { setup: authSetup } = require("./lib/auth");
const { createDeviceStore } = require("./lib/devices");
const { setup: firmwaresSetup } = require("./lib/firmwares");

const CWD = process.cwd();
const CONSOLE_BUILD_FOLDER = path.join(CWD, "console", "build");

exports.createServer = function createHomieServer(config) {
  const { host, port } = config;
  return new Promise((resolve, reject) => {
    const app = express();
    const http = createServer();

    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

    // CORS setup
    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", req.headers.origin);
      res.header("Access-Control-Allow-Credentials", "true");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });

    if (process.env.NODE_ENV === "production") {
      app.use(express.static(CONSOLE_BUILD_FOLDER));
    }

    app.get("/api", (req, res) => res.send("200 OK"));

    http.on("request", app);

    const wss = new WebSocketServer({
      server: http,
      verifyClient(info, cb) {
        console.log("verifying new client");
        const fail = () => cb(false, 401, "Unauthorized");
        const success = () => cb(true);
        success();
      }
    });

    http
      .listen(port, host)
      .on("listening", () => {
        resolve({ app, wss });
      })
      .on("error", () => {
        reject(error);
      });
  });
};

exports.setupServer = function setupServer(config, appServer, webSocketServer) {
  const mqttClient = createMqttClient(config);

  authSetup(appServer);
  firmwaresSetup(appServer);
  const deviceStore = createDeviceStore(appServer, mqttClient);

  const clients = new Set();
  webSocketServer.on("connection", socket => {
    const client = new Client(config, socket, deviceStore);
    client.on("close", () => {
      clients.delete(client);
    });
    clients.add(client);
  });
};
