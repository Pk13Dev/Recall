const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const targets = ["js", "scripts", "vite.config.js"];

function collectJavaScriptFiles(targetPath) {
  const absolutePath = path.resolve(projectRoot, targetPath);

  if (!fs.existsSync(absolutePath)) {
    return [];
  }

  const stat = fs.statSync(absolutePath);

  if (stat.isFile()) {
    return absolutePath.endsWith(".js") ? [absolutePath] : [];
  }

  if (!stat.isDirectory()) {
    return [];
  }

  return fs.readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    const childPath = path.join(absolutePath, entry.name);

    if (entry.isDirectory()) {
      return collectJavaScriptFiles(path.relative(projectRoot, childPath));
    }

    return entry.isFile() && entry.name.endsWith(".js") ? [childPath] : [];
  });
}

const files = targets.flatMap(collectJavaScriptFiles).sort();
const failures = [];

files.forEach((filePath) => {
  const result = spawnSync(process.execPath, ["--check", filePath], {
    cwd: projectRoot,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    failures.push({
      filePath,
      output: [
        result.error ? result.error.message : "",
        result.stdout || "",
        result.stderr || ""
      ].filter(Boolean).join("\n").trim()
    });
  }
});

if (failures.length > 0) {
  failures.forEach((failure) => {
    console.error(`Syntax check failed: ${path.relative(projectRoot, failure.filePath)}`);
    if (failure.output) {
      console.error(failure.output);
    }
  });
  process.exit(1);
}

console.log(`Checked ${files.length} JavaScript files.`);
