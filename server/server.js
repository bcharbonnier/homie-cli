const { createServer } = require("http");
const bodyParser = require("body-parser");
const express = require("express");
const { Server: WebSocketServer } = require("ws");

const { createMqttClient } = require("./lib/mqtt");
const Client = require("./lib/client");

exports.createWebSocketServer = function createWebSocketServer(config) {
  const { host, port } = config;
  return new Promise((resolve, reject) => {
    const app = express();
    const http = createServer();

    app.use(bodyParser.json());

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

    app.use("/login", (req, res) => {
      res.send("Should login");
    });
    app.use("/logout", (req, res) => {
      res.send("should logout");
    });

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
        resolve(wss);
      })
      .on("error", () => {
        reject(error);
      });
  });
};

exports.setup = function(config, webSocketServer) {
  const mqttClient = createMqttClient(config.mqtt);

  const clients = new Set();
  webSocketServer.on("connection", socket => {
    console.log("new websocket client");
    const client = new Client(config, socket, mqttClient);
    client.on("close", () => {
      console.log("deleting websocket client");
      clients.delete(client);
    });
    clients.add(client);
  });
};
