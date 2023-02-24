import { createServer as createBackendServer } from "@triplex/server";
import { createServer as createFrontendServer } from "@triplex/client";

export async function editor({
  open,
  files,
  publicDir,
  exportName,
}: {
  open?: boolean | string;
  publicDir?: string;
  files: string[];
  exportName?: string;
}) {
  const { default: ora } = await import("ora");
  const spinner = ora("Starting...\n").start();
  const frontendServer = await createFrontendServer({
    open,
    publicDir,
    exportName,
  });
  const backendServer = await createBackendServer({ files });

  await frontendServer.listen(3333);

  spinner.succeed(
    open
      ? "Now open at http://localhost:3333"
      : "Now available at http://localhost:3333"
  );

  await backendServer.listen(8000);
}