/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
const { spawn } = require("child_process");
const { readdirSync } = require("fs");
const { join } = require("path");

const examples = readdirSync(join(process.cwd(), "examples"));
const example = process.argv[2] || "geometry";

if (!examples.includes(example)) {
  console.error(
    `
"${example}" is not an available example of [${examples.join(", ")}]
`
  );
} else {
  spawn("npx", ["triplex", "editor"], {
    cwd: join(process.cwd(), "examples", example),
    stdio: "inherit",
  });
}
