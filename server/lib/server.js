const { createServer } = require("http");
const path = require("path");

const bodyParser = require("body-parser");
const express = require("express");
const socketIO = require("socket.io");

const CWD = process.cwd();
const CONSOLE_BUILD_FOLDER = path.join(CWD, "console", "build");

exports.createServer = function createHomieServer(config) {
  const { host, port } = config;
  return new Promise((resolve, reject) => {
    const app = express();
    const http = createServer(app);
    const io = socketIO(http);

    app.set("config", config);
    app.set("wss", io);
    // for parsing application/json
    app.use(bodyParser.json());
    // for parsing application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: true }));

    // CORS setup
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", req.headers.origin);
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    if (process.env.NODE_ENV === "production") {
      app.use(express.static(CONSOLE_BUILD_FOLDER));
      app.use((req, res) => {
        res.sendFile(path.join(CONSOLE_BUILD_FOLDER, "index.html"));
      });
    }

    http
      .listen(port, host)
      .on("listening", () => {
        resolve(app);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};
