/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { describe, expect, it, vi } from "vitest";
import { readFile, readdir } from "node:fs/promises";
import { EOL } from "node:os";
import { join } from "node:path";
import { init } from "../init";

type FS = typeof import("fs/promises");
const templateDir = join(__dirname, "../../templates");

describe("init command", () => {
  describe("fresh init", () => {
    it("should return open path", async () => {
      const stubFs: FS = {
        readdir,
        readFile,
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        copyFile: vi.fn(),
        cp: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-new");

      const { openPath } = await init({
        cwd,
        name: "fresh-local",
        pkgManager: "npm",
        target: "node",
        version: "0.0.0-local",
        __fs: stubFs,
        __exec: stubExec,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
      });

      expect(openPath).toEqual(join(cwd, "fresh-local", "src/scene.tsx"));
    });

    it("should copy over static files from template dir", async () => {
      const stubFs: FS = {
        readdir,
        readFile,
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        copyFile: vi.fn(),
        cp: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-new");

      await init({
        cwd,
        name: "fresh-local",
        pkgManager: "npm",
        target: "node",
        version: "0.0.0-local",
        __fs: stubFs,
        __exec: stubExec,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
      });

      expect(stubFs.copyFile).toHaveBeenCalledWith(
        join(templateDir, "gitignore"),
        join(cwd, "fresh-local", ".gitignore")
      );
      expect(stubFs.copyFile).toHaveBeenCalledWith(
        join(templateDir, "tsconfig.json"),
        join(cwd, "fresh-local", "tsconfig.json")
      );
      expect(stubFs.cp).toHaveBeenCalledWith(
        join(templateDir, "src"),
        join(cwd, "fresh-local", "src"),
        { recursive: true }
      );
      expect(stubFs.cp).toHaveBeenCalledWith(
        join(templateDir, ".triplex"),
        join(cwd, "fresh-local", ".triplex"),
        { recursive: true }
      );
    });

    it("should create new package.json", async () => {
      const stubFs: FS = {
        readdir,
        readFile,
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        copyFile: vi.fn(),
        cp: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-new");

      await init({
        cwd,
        name: "fresh-local",
        pkgManager: "npm",
        target: "node",
        version: "0.0.0-local",
        __fs: stubFs,
        __exec: stubExec,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
      });

      expect(stubFs.writeFile).toHaveBeenCalledWith(
        join(cwd, "fresh-local", "package.json"),
        `{
  "name": "fresh-local",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "editor": "triplex editor"
  },
  "dependencies": {
    "@react-three/drei": "^9.74.6",
    "@react-three/fiber": "^8.13.0",
    "@triplex/run": "^0.0.0-local",
    "@types/react": "^18.2.8",
    "@types/three": "^0.152.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "three": "^0.153.0"
  }
}
`.replaceAll("\n", EOL)
      );
    });
  });

  describe("existing init", () => {
    it("should copy example files over", async () => {
      const stubFs: FS = {
        readdir,
        readFile,
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        copyFile: vi.fn(),
        cp: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-existing");

      await init({
        cwd,
        name: "",
        pkgManager: "npm",
        target: "node",
        version: "0.0.0-local",
        __fs: stubFs,
        __exec: stubExec,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
      });

      expect(stubFs.cp).toHaveBeenCalledWith(
        join(templateDir, "src"),
        join(cwd, "src/triplex-examples"),
        { recursive: true }
      );
    });

    it("should update tsconfig once", async () => {
      const stubFs: FS = {
        readdir,
        readFile,
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        copyFile: vi.fn(),
        cp: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-existing");

      await init({
        cwd,
        name: "",
        pkgManager: "npm",
        target: "node",
        version: "0.0.0-local",
        __fs: stubFs,
        __exec: stubExec,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
      });

      expect(stubFs.writeFile).toHaveBeenCalledWith(
        join(cwd, "tsconfig.json"),
        `{
  "compilerOptions": {
    "jsx": "preserve",
    "types": [
      "@react-three/fiber"
    ]
  },
  "include": [
    "."
  ],
  "exclude": [
    "node_modules"
  ]
}
`
      );
    });

    it("should skip git ignore", async () => {
      const stubFs: FS = {
        readdir,
        readFile,
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        copyFile: vi.fn(),
        cp: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-existing");

      await init({
        cwd,
        name: "",
        pkgManager: "npm",
        target: "node",
        version: "0.0.0-local",
        __fs: stubFs,
        __exec: stubExec,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
      });

      expect(stubFs.writeFile).not.toHaveBeenCalledWith(
        join(cwd, ".gitignore")
      );
    });

    it("should update pkg json", async () => {
      const stubFs: FS = {
        readdir,
        readFile,
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        copyFile: vi.fn(),
        cp: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-existing");

      await init({
        cwd,
        name: "",
        pkgManager: "npm",
        target: "node",
        version: "0.0.0-local",
        __fs: stubFs,
        __exec: stubExec,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
      });

      expect(stubFs.writeFile).toHaveBeenCalledWith(
        join(cwd, "package.json"),
        `{
  "name": "app",
  "dependencies": {
    "already-exists": "^1.1.1",
    "@react-three/drei": "^9.74.6",
    "@react-three/fiber": "^8.13.0",
    "@triplex/run": "^0.0.0-local",
    "@types/react": "^18.2.8",
    "@types/three": "^0.152.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "three": "^0.153.0"
  },
  "scripts": {
    "editor": "triplex editor"
  }
}
`
      );
    });

    it("should return open path", async () => {
      const stubFs: FS = {
        readdir,
        readFile,
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        copyFile: vi.fn(),
        cp: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-existing");

      const { openPath } = await init({
        cwd,
        name: "fresh-local",
        pkgManager: "npm",
        target: "node",
        version: "0.0.0-local",
        __fs: stubFs,
        __exec: stubExec,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
      });

      expect(openPath).toEqual(join(cwd, "src/triplex-examples/scene.tsx"));
    });
  });

  describe("existing init workspace", () => {
    it("should return open path", async () => {
      const stubFs: FS = {
        readdir,
        readFile,
        writeFile: vi.fn(),
        mkdir: vi.fn(),
        copyFile: vi.fn(),
        cp: vi.fn(),
      } as unknown as FS;
      const stubExec = vi.fn();
      const cwd = join(__dirname, "__mocks__", "init-existing-workspace");

      const { openPath } = await init({
        cwd,
        name: "fresh-local",
        pkgManager: "npm",
        target: "node",
        version: "0.0.0-local",
        __fs: stubFs,
        __exec: stubExec,
        __prompt: vi.fn().mockResolvedValue({ continue: true }),
      });

      expect(openPath).toEqual(
        join(cwd, "packages/triplex-examples/scene.tsx")
      );
    });
  });
});
