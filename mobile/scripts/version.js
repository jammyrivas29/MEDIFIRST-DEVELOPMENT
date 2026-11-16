#!/usr/bin/env node
const child_process = require("child_process");
const path = __dirname + "/../node_modules/.bin/expo";
child_process.execFileSync(process.execPath, [path, "--version"], { stdio: "inherit" });