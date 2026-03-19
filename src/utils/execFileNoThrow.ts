import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export interface ExecFileResult {
  stdout: string;
  stderr: string;
  status: "ok" | "error";
}

/**
 * Safely executes a file with arguments using execFile (not exec),
 * which prevents shell injection. Handles Windows compatibility.
 * Never throws -- returns structured output with status instead.
 */
export async function execFileNoThrow(
  file: string,
  args: string[],
  options?: { timeout?: number; cwd?: string }
): Promise<ExecFileResult> {
  try {
    const { stdout, stderr } = await execFileAsync(file, args, {
      timeout: options?.timeout ?? 30000,
      cwd: options?.cwd,
      // On Windows, shell: true is needed for .cmd/.bat wrappers (e.g., npm-installed CLIs)
      shell: process.platform === "win32",
    });
    return { stdout: stdout ?? "", stderr: stderr ?? "", status: "ok" };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; message?: string };
    return {
      stdout: e.stdout ?? "",
      stderr: e.stderr ?? e.message ?? String(err),
      status: "error",
    };
  }
}
