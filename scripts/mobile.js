const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const androidRoot = path.join(projectRoot, "android");
const javaMajorPreference = [21, 17];
const supportedJavaMajors = new Set(javaMajorPreference);
const command = process.argv[2] || "preflight";

function parseJavaMajorFromText(value) {
  if (!value) {
    return null;
  }

  const match = value.match(/(?:jdk|jre)[-._]?(\d+)|^(\d+)(?:[._-]|$)/i);
  const rawMajor = match ? Number(match[1] || match[2]) : null;
  return Number.isFinite(rawMajor) ? rawMajor : null;
}

function commandName(name) {
  return process.platform === "win32" ? `${name}.cmd` : name;
}

function getJavaVersion(javaExecutable) {
  const result = spawnSync(javaExecutable, ["-version"], {
    encoding: "utf8"
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();

  if (result.error || result.status !== 0 || !output) {
    return null;
  }

  const versionMatch = output.match(/version\s+"([^"]+)"/i);
  const rawVersion = versionMatch ? versionMatch[1] : "";
  const parts = rawVersion.split(".");
  const major = parts[0] === "1" ? Number(parts[1]) : Number(parts[0]);

  return Number.isFinite(major) ? major : null;
}

function getCandidateRoots() {
  const roots = [
    process.env.JAVA_HOME,
    "C:\\Program Files\\Eclipse Adoptium",
    "C:\\Program Files\\Java",
    "C:\\Program Files\\Microsoft",
    "C:\\Program Files\\Zulu"
  ].filter(Boolean);

  return roots.flatMap((root) => {
    if (!fs.existsSync(root)) {
      return [];
    }

    const javaPath = path.join(root, "bin", process.platform === "win32" ? "java.exe" : "java");
    if (fs.existsSync(javaPath)) {
      return [root];
    }

    return fs.readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(root, entry.name));
  });
}

function findAndroidJdk() {
  const candidates = getCandidateRoots()
    .map((root) => {
      const javaPath = path.join(root, "bin", process.platform === "win32" ? "java.exe" : "java");
      if (!fs.existsSync(javaPath)) {
        return null;
      }

      const inferredMajor = parseJavaMajorFromText(path.basename(root));
      const detectedMajor = getJavaVersion(javaPath);
      const major = detectedMajor || inferredMajor;
      return major ? { root, javaPath, major } : null;
    })
    .filter((candidate) => candidate && supportedJavaMajors.has(candidate.major))
    .sort((left, right) => javaMajorPreference.indexOf(left.major) - javaMajorPreference.indexOf(right.major));

  return candidates[0] || null;
}

function createMobileEnv(jdk) {
  const env = { ...process.env, JAVA_HOME: jdk.root };
  const pathKey = Object.keys(env).find((key) => key.toLowerCase() === "path") || "Path";
  const currentPath = env[pathKey] || "";

  Object.keys(env)
    .filter((key) => key.toLowerCase() === "path" && key !== pathKey)
    .forEach((key) => delete env[key]);

  env[pathKey] = `${path.join(jdk.root, "bin")}${path.delimiter}${currentPath}`;
  return env;
}

function run(name, args, env) {
  const executable = process.platform === "win32" ? (process.env.ComSpec || "cmd.exe") : commandName(name);
  const commandArgs = process.platform === "win32"
    ? ["/d", "/s", "/c", [name, ...args].join(" ")]
    : args;
  const result = spawnSync(executable, commandArgs, {
    cwd: projectRoot,
    env,
    encoding: "utf8"
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function runIn(cwd, name, args, env) {
  const executable = process.platform === "win32" ? (process.env.ComSpec || "cmd.exe") : commandName(name);
  const commandArgs = process.platform === "win32"
    ? ["/d", "/s", "/c", [name, ...args].join(" ")]
    : args;
  const result = spawnSync(executable, commandArgs, {
    cwd,
    env,
    encoding: "utf8"
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function gradleCommand() {
  return process.platform === "win32" ? ".\\gradlew.bat" : "./gradlew";
}

function printApkLocation(variant) {
  const outputDir = path.join(androidRoot, "app", "build", "outputs", "apk", variant);
  const candidates = [
    path.join(outputDir, `app-${variant}.apk`),
    path.join(outputDir, `app-${variant}-unsigned.apk`)
  ];

  for (const apkPath of candidates) {
    if (fs.existsSync(apkPath)) {
      console.log(`APK ready: ${apkPath}`);
      return;
    }
  }

  console.log(`APK build finished, but the expected ${variant} APK was not found in: ${outputDir}`);
}

const jdk = findAndroidJdk();

if (!jdk) {
  console.error("Android builds need JDK 21 or JDK 17.");
  console.error("Install Temurin JDK 21, then rerun this command.");
  process.exit(1);
}

const mobileEnv = createMobileEnv(jdk);
console.log(`Using JDK ${jdk.major}: ${jdk.root}`);

if (command === "preflight") {
  process.exit(0);
}

if (command === "sync") {
  run("npm", ["run", "build"], mobileEnv);
  run("npx", ["cap", "sync", "android"], mobileEnv);
  process.exit(0);
}

if (command === "run") {
  run("npm", ["run", "build"], mobileEnv);
  run("npx", ["cap", "run", "android"], mobileEnv);
  process.exit(0);
}

if (command === "build") {
  run("npm", ["run", "build"], mobileEnv);
  run("npx", ["cap", "sync", "android"], mobileEnv);
  runIn(androidRoot, gradleCommand(), ["assembleRelease"], mobileEnv);
  printApkLocation("release");
  process.exit(0);
}

if (command === "apk" || command === "apk:debug") {
  run("npm", ["run", "build"], mobileEnv);
  run("npx", ["cap", "sync", "android"], mobileEnv);
  runIn(androidRoot, gradleCommand(), ["assembleDebug"], mobileEnv);
  printApkLocation("debug");
  process.exit(0);
}

if (command === "apk:release") {
  run("npm", ["run", "build"], mobileEnv);
  run("npx", ["cap", "sync", "android"], mobileEnv);
  runIn(androidRoot, gradleCommand(), ["assembleRelease"], mobileEnv);
  printApkLocation("release");
  process.exit(0);
}

if (command === "doctor") {
  run("npx", ["cap", "doctor", "android"], mobileEnv);
  process.exit(0);
}

console.error(`Unknown mobile command: ${command}`);
process.exit(1);
