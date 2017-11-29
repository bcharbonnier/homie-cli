const path = require("path");
const fs = require("fs");

const chalk = require("chalk");
const filesize = require("filesize");
const multer = require("multer");
const unzip = require("unzip");

const {
  renameFile, writeFile, existFile, deleteFile,
} = require("../util/fs");
const { md5 } = require("../util/checksum");
const { log, error } = require("../util/log")("firmwares");
const { readAsString } = require("../util/stream");

const USER_HOME = process.env.HOME;
const HOMIE_HOME = path.join(USER_HOME, ".homie");
const FIRMWARES_DB = path.join(HOMIE_HOME, "firmwares.json");
const FIRMWARES_FOLDER = path.join(HOMIE_HOME, "firmwares");

const REGEX_PYTHON_VERSION = /^__version__ = ['"]([^'"]*)['"]/m;
const REGEX_PYTHON_DESC = /^['"]{3}([^(?:['"\]{3})]*)['"]{3}/m;
const REGEX_FILENAME_VERSION = /(.*)-(\d+\.\d+\.\d+)/;

const upload = multer();

let firmwares;

// Express middlewares
function checkFirmwareExist(req, res, next) {
  const { firmware } = req.params;
  if (!firmwares[firmware]) {
    res.status(404).json({
      ok: false,
      error: `firmware ${firmware} does not exist`,
    });
    return;
  }
  req.firmware = firmwares[firmware];
  next();
}

exports.setup = function setup(app) {
  log("Loading firmwares database from", chalk.gray(FIRMWARES_DB));
  firmwares = require(FIRMWARES_DB);

  app.get("/api/firmwares", (req, res) => {
    res.json(firmwares);
  });

  app.post("/api/firmwares", upload.single("firmware"), async (req, res) => {
    let results = { ok: true };
    let status = 201;
    const firmware = req.file;
    const extension = path.extname(firmware.originalname);
    const name = firmware.originalname.replace(extension, "");
    const size = firmware.size;
    const tempFilePath = path.join(FIRMWARES_FOLDER, [name, `-${Date.now()}`, extension].join(""));

    let entry;

    // Validating file extension
    if (![".zip", ".bin"].includes(extension)) {
      res.status(500).json({
        ok: false,
        error: `Upload error: file extension ${extension} not allowed`,
      });
    }

    // Extracting info from file & writing it to the proper location
    try {
      await writeFile(tempFilePath, firmware.buffer);
      if (extension === ".zip") {
        entry = await scanArchiveFirmware(firmware, name, extension, tempFilePath);
      } else if (extension === ".bin") {
        entry = await scanArduinoFirmware(firmware, name, extension, tempFilePath);
      }

      entry.uploaded_at = Date.now();
      entry.size = filesize(size);
      entry.filename = `${entry.name}-${entry.version}${extension}`;
      entry.checksum = md5(firmware.buffer);
      firmwares[entry.filename] = entry;
      results.firmwares = firmwares;

      // Checking firmware does not already exist
      const filePath = path.join(FIRMWARES_FOLDER, entry.filename);
      if (await existFile(filePath)) {
        error("uploaded firmware file", chalk.gray(filePath), "already exist");
        await deleteFile(tempFilePath);
        res.status(200).send({
          ok: false,
          error: `firmware ${name} already exists`,
        });
        return;
      }

      // Renaming firmware to proper final name
      await renameFile(tempFilePath, filePath);
      updateFirmwaresDB();
    } catch (exception) {
      error("firmware upload failed", exception);
      results = {
        ok: false,
        error: exception.message ? exception.message : exception,
      };
      status = 500;
    }

    res.status(status).json(results);
  });

  app.get("/api/firmwares/:firmware", checkFirmwareExist, (req, res) => {
    const { firmware } = req;
    const { filename } = firmware;
    log("download request for", chalk.gray(filename));
    res.sendFile(path.join(FIRMWARES_FOLDER, filename));
  });

  app.delete("/api/firmwares/:firmware", checkFirmwareExist, async (req, res) => {
    const { firmware } = req;
    const { filename } = firmware;
    log("deletion request for", chalk.gray(filename));
    await deleteFile(path.join(FIRMWARES_FOLDER, filename));
    delete firmwares[filename];
    updateFirmwaresDB();
    log("firmware", chalk.gray(filename), "successfully deleted");
    res.json({
      ok: true,
      firmwares,
    });
  });
};

async function updateFirmwaresDB() {
  log("Writing firmwares database to disk");
  await writeFile(FIRMWARES_DB, JSON.stringify(firmwares, null, 2));
}

function scanArduinoFirmware(file, name, extension) {
  return Promise.resolve({ type: "esp" });
}

function scanArchiveFirmware(uploadFile, name, extension, filePath) {
  return new Promise((resolve, reject) => {
    fs
      .createReadStream(filePath)
      .pipe(unzip.Parse())
      .on("entry", async (entry) => {
        const filename = entry.path;

        if (filename === "package.json") {
          try {
            const buffer = await readAsString(entry);
            const content = JSON.parse(buffer);

            if (!content.name && !content.version) {
              reject(new Error("invalid firmware archive, missing name or version information"));
              return;
            }

            resolve({
              version: content.version,
              name: content.name,
              description: content.description,
              type: "javascript",
            });
          } catch (exception) {
            reject(exception);
          }
        } else if (filename === "main.py") {
          try {
            const buffer = await readAsString(entry);

            const matchVersion = REGEX_PYTHON_VERSION.exec(buffer);
            const matchDescription = REGEX_PYTHON_DESC.exec(buffer);
            const matchName = REGEX_FILENAME_VERSION.exec(name);

            if (matchVersion == null) {
              throw new Error("invalid firmware archive, missing version information");
            }

            resolve({
              version: matchVersion[1],
              description: matchDescription ? matchDescription[1] : "",
              name: matchName ? matchName[1] : name,
              type: "python",
            });
          } catch (exception) {
            reject(exception);
          }
        } else {
          entry.autodrain();
        }
      });
  });
}
