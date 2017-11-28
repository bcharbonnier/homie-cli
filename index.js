const chalk = require("chalk");
const error = `
  ${chalk.bold("Homie CLI")}: please use as a globally installed package.

  This script can not be executed from node.
  Please use it from the \`homie\` command line.

  To install it (from github using npm)
  > ${chalk.cyan("npm i -g bcharbonnier/homie-cli")}

  To see the help
  > ${chalk.cyan("homie --help")}

  To start the Homie Server ${chalk.grey("(globally)")}
  > ${chalk.cyan("homie server start")}

  To start a local Homie Sentinel ${chalk.grey("(from a given folder)")}
  > ${chalk.cyan("homie sentinel start")}
`;
console.error(error);
process.exit(1);
