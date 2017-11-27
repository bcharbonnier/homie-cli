const { createServer } = require("http");

const express = require("express");
const { Server: WebSocketServer } = require("ws");

exports.createWebSocketServer = function createWebSocketServer(config) {
  const { host, port } = config;
  return new Promise((resolve, reject) => {
    const app = express();
    const http = createServer();

    app.use("/login", (req, res) => {});
    app.use("/logout", (req, res) => {});

    http.on("request", app);

    const wss = new WebSocketServer({
      server: http,
      verifyClient(info, cb) {
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
