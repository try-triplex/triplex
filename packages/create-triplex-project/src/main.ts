#!/usr/bin/env node
/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { prompt } from "enquirer";
import { exec as execCb } from "child_process";
import { promisify } from "util";
import { program } from "@commander-js/extra-typings";
import { version } from "../package.json";
import { init } from "./init";

/* eslint-disable no-irregular-whitespace */
console.log(`
 ▀█▀ █▀█ █ █▀█ █░░ █▀▀ ▀▄▀
 ░█░ █▀▄ █ █▀▀ █▄▄ ██▄ █░█
`);
/* eslint-enable no-irregular-whitespace */

const exec = promisify(execCb);

async function main() {
  program
    .description(
      "Initializes a Triplex project into a new or existing repository.\nPassing any args will run in non-interactive mode."
    )
    .option("--name <name>", "name of your project")
    .option(
      "--pkg-manager <name>",
      "package manager to use when installing dependencies"
    )
    .option("--cwd <cwd>", "target working directory")
    .action(async (args) => {
      let packageManager: string;
      let projectName: string;
      let mode: "non-interactive" | "interactive";
      let cwd = process.cwd();

      if (args.pkgManager || args.name || args.cwd) {
        // Non-interactive mode
        if (!args.pkgManager) {
          program.error(
            "Missing --pkg-manager arg. Valid values are: npm, pnpm, yarn."
          );
        }

        if (!args.name) {
          program.error("Missing --name arg.");
        }

        if (!["npm", "yarn", "pnpm"].includes(args.pkgManager)) {
          program.error(
            `The package manager ${args.pkgManager} is not supported.`
          );
        }

        mode = "non-interactive";
        packageManager = args.pkgManager;
        projectName = args.name;

        if (args.cwd) {
          cwd = args.cwd;
        }
      } else {
        const response = await prompt<{
          name: string;
          pkgManager: "npm" | "pnpm" | "yarn";
        }>([
          {
            name: "name",
            type: "text",
            required: true,
            initial: "my-triplex-project",
            message: "What should we call your project?",
          },
          {
            name: "pkgManager",
            type: "select",
            required: true,
            choices: ["npm", "pnpm", "yarn"],
            message: "What package manager do you use?",
          },
        ]);

        mode = "interactive";
        packageManager = response.pkgManager;
        projectName = response.name;
      }

      try {
        const { openPath, dir } = await init({
          version,
          pkgManager: packageManager,
          name: projectName,
          target: "node",
          mode,
          cwd,
        });

        if (mode === "non-interactive") {
          return;
        }

        const result = await prompt<{ start: boolean }>([
          {
            message: "Open an example scene in the editor?",
            type: "confirm",
            name: "start",
            initial: "Y",
          },
        ]);

        if (result.start) {
          const p = exec(`${packageManager} run editor --open ${openPath}`, {
            cwd: dir,
          });
          const { default: ora } = await import("ora");

          const spinner = ora("Opening example scene....\n").start();

          setTimeout(() => {
            spinner.succeed("Now open at http://localhost:5754");
          }, 2000);

          await p;
        }
      } catch (e) {
        console.log(e);
        process.exit(1);
      }
    });

  program.parse();
}

main();
