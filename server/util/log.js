/* eslint-disable no-console */
const chalk = require("chalk");

function log(name, ...rest) {
  console.log(chalk.gray(new Date().toISOString()), chalk.yellow(`[${name}]`), ...rest);
}

function info(name, ...rest) {
  console.info(chalk.gray(new Date().toISOString()), chalk.magenta(`[${name}]`), ...rest);
}

function warn(name, ...rest) {
  console.warn(chalk.gray(new Date().toISOString()), chalk.orange(`[${name}]`), ...rest);
}

function error(name, ...rest) {
  console.error(chalk.gray(new Date().toISOString()), chalk.red(`[${name}]`), ...rest);
}

function fatal(name, ...rest) {
  console.error(
    chalk.gray(new Date().toISOString()),
    chalk.bgRed.whiteBright(`[${name}]`),
    ...rest
  );
}

module.exports = function createLogger(name) {
  return {
    log: (...rest) => log(name, ...rest),
    info: (...rest) => info(name, ...rest),
    warn: (...rest) => warn(name, ...rest),
    error: (...rest) => error(name, ...rest),
    fatal: (...rest) => fatal(name, ...rest),
  };
};
