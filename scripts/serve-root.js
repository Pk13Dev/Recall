const childProcess = require("child_process");
const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

const rootDirectory = path.resolve(__dirname, "..");
const port = Number(process.env.PORT) || 4173;
const host = "127.0.0.1";
const shouldOpenBrowser = !process.argv.includes("--no-open") && process.env.CI !== "true";
const shouldUseHttps = process.argv.includes("--https") || process.env.HTTPS === "true";
const certPath = getArgumentValue("--cert") || process.env.HTTPS_CERT || path.join(rootDirectory, ".cert", "localhost-cert.pem");
const keyPath = getArgumentValue("--key") || process.env.HTTPS_KEY || path.join(rootDirectory, ".cert", "localhost-key.pem");
const pfxPath = getArgumentValue("--pfx") || process.env.HTTPS_PFX || path.join(rootDirectory, ".cert", "localhost.pfx");
const pfxPassphrasePath = getArgumentValue("--pfx-passphrase-file")
  || process.env.HTTPS_PFX_PASSPHRASE_FILE
  || path.join(rootDirectory, ".cert", "localhost-passphrase.txt");

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mp3", "audio/mpeg"],
  [".png", "image/png"],
  [".woff2", "font/woff2"],
  [".svg", "image/svg+xml; charset=utf-8"]
]);

const securityHeaders = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "font-src 'self' data:",
    "img-src 'self' data:",
    "media-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "form-action 'none'"
  ].join("; "),
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff"
};

function getArgumentValue(name) {
  const equalsPrefix = `${name}=`;
  const equalsMatch = process.argv.find((argument) => argument.startsWith(equalsPrefix));
  if (equalsMatch) {
    return equalsMatch.slice(equalsPrefix.length);
  }

  const argumentIndex = process.argv.indexOf(name);
  if (argumentIndex !== -1) {
    return process.argv[argumentIndex + 1];
  }

  return null;
}

function getContentType(filePath) {
  return mimeTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
}

function getSafeFilePath(requestPath) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(requestPath === "/" ? "/index.html" : requestPath);
  } catch (error) {
    return null;
  }

  const requestedFilePath = path.normalize(path.join(rootDirectory, decodedPath));
  const relativePath = path.relative(rootDirectory, requestedFilePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return requestedFilePath;
}

function openBrowser(url) {
  if (process.platform === "win32") {
    childProcess.spawn("cmd", ["/c", "start", "", url], {
      detached: true,
      stdio: "ignore",
      windowsHide: true
    }).unref();
    return;
  }

  if (process.platform === "darwin") {
    childProcess.spawn("open", [url], {
      detached: true,
      stdio: "ignore"
    }).unref();
    return;
  }

  childProcess.spawn("xdg-open", [url], {
    detached: true,
    stdio: "ignore"
  }).unref();
}

function writeResponse(response, statusCode, headers, content) {
  response.writeHead(statusCode, {
    ...securityHeaders,
    ...headers
  });
  response.end(content);
}

function getHttpsOptions() {
  if (!shouldUseHttps) {
    return null;
  }

  if (fs.existsSync(pfxPath) && fs.existsSync(pfxPassphrasePath)) {
    return {
      minVersion: "TLSv1.2",
      passphrase: fs.readFileSync(pfxPassphrasePath, "utf8").trim(),
      pfx: fs.readFileSync(pfxPath)
    };
  }

  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    throw new Error(
      `HTTPS needs a local certificate. Run "npm run cert", or pass --cert and --key paths. Missing: ${certPath} / ${keyPath}`
    );
  }

  return {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
    minVersion: "TLSv1.2"
  };
}

function handleRequest(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    writeResponse(response, 405, {
      "Allow": "GET, HEAD",
      "Content-Type": "text/plain; charset=utf-8"
    }, "Method not allowed");
    return;
  }

  const protocol = shouldUseHttps ? "https" : "http";
  const requestUrl = new URL(request.url, `${protocol}://${host}:${port}`);
  if (requestUrl.pathname === "/favicon.ico") {
    writeResponse(response, 204, {}, "");
    return;
  }

  const filePath = getSafeFilePath(requestUrl.pathname);

  if (!filePath) {
    writeResponse(response, 403, { "Content-Type": "text/plain; charset=utf-8" }, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      writeResponse(response, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not found");
      return;
    }

    writeResponse(response, 200, { "Content-Type": getContentType(filePath) }, request.method === "HEAD" ? "" : content);
  });
}

const httpsOptions = getHttpsOptions();
const server = httpsOptions ? https.createServer(httpsOptions, handleRequest) : http.createServer(handleRequest);

server.listen(port, host, () => {
  const protocol = httpsOptions ? "https" : "http";
  const url = `${protocol}://${host}:${port}/`;
  console.log(`RECALL root app is running at ${url}`);
  console.log(`Serving ${protocol.toUpperCase()} on loopback only (${host}).`);
  console.log("Press Ctrl+C to stop the server.");

  if (shouldOpenBrowser) {
    openBrowser(url);
  }
});
