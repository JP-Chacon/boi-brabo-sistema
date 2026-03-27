const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const sqlite3Root = path.join(projectRoot, "node_modules", "sqlite3");

function removeIfExists(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  fs.rmSync(targetPath, { recursive: true, force: true });
}

function run() {
  if (!fs.existsSync(sqlite3Root)) {
    console.log("[postinstall] sqlite3 nao encontrado, pulando rebuild.");
    return;
  }

  if (process.platform !== "linux") {
    console.log("[postinstall] Rebuild forcado do sqlite3 habilitado apenas no Linux.");
    return;
  }

  removeIfExists(path.join(sqlite3Root, "build"));
  removeIfExists(path.join(sqlite3Root, "compiled"));
  removeIfExists(path.join(sqlite3Root, "addon-build"));
  removeIfExists(path.join(sqlite3Root, "lib", "binding"));

  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCommand, ["rebuild", "sqlite3", "--build-from-source"], {
    cwd: projectRoot,
    stdio: "inherit",
    shell: false,
    env: {
      ...process.env,
      npm_config_build_from_source: "true",
    },
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

run();
