const chalk = require("chalk");
const error = `Homie CLI: please use as a globally installed package.
This script can not be executed from node.

Please use it from the \`homie\` command line.

To install it (from github using npm)
> npm i -g bcharbonnier/homie-cli

To see the help
> homie --help

To start the Homie Server
> homie server start

To start a local Homie Sentinel
> homie sentinel start
`;
console.error(error);
process.exit(1);
