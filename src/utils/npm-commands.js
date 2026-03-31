import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function installPackageViaExec(packageName) {
  try {
    const { stdout, stderr } = await execAsync(`npm install ${packageName}`);
    return { success: true, stdout, stderr };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function verifyPackageInstallation(packageName) {
  return new Promise((resolve) => {
    exec(`npm list ${packageName} --depth=0`, (error, stdout, stderr) => {
      resolve(!error && stdout.includes(packageName));
    });
  });
}

export function getInstalledPackages() {
  return new Promise((resolve) => {
    exec("npm list --depth=0 --json", (error, stdout) => {
      const packages = [];
      try {
        const data = JSON.parse(stdout);
        if (data.dependencies) {
          for (const [name, info] of Object.entries(data.dependencies)) {
            const version = info.version || "";
            packages.push({ name, version });
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
      resolve(packages);
    });
  });
}
