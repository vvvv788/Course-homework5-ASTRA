"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
for (const file of ["server/server.js", "api/index.js"]) {
  execFileSync(process.execPath, ["--check", path.join(root, file)], { stdio: "inherit" });
}
const output = path.join(root, "public");
fs.rmSync(output, { recursive: true, force: true });
fs.cpSync(path.join(root, "code"), output, { recursive: true });
console.log("ASTRA static frontend prepared; API and secrets are not copied to public/.");
