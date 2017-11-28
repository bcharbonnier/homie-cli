const path = require("path");
const fs = require("fs");

const chalk = require("chalk");

const USER_HOME = process.env.HOME;
const HOMIE_HOME = path.join(USER_HOME, ".homie");
const FIRMWARES_DB = path.join(HOMIE_HOME, "firmwares.json");
const FIRMWARES_FOLDER = path.join(HOMIE_HOME, "firmwares");

function log(...parts) {
  console.log(chalk.cyan("[firmwares]"), ...parts);
}

let firmwares;

exports.setup = function setup(app) {
  log(`Loading firmwares database from`, chalk.dim(FIRMWARES_DB));
  firmwares = require(FIRMWARES_DB);
  app.get("/api/firmwares", (req, res) => {
    res.json(firmwares);
  });

  app.post("/api/firmwares", (req, res) => {});

  app.delete("/api/firmwares/:firmware_name", (req, res) => {});
};
